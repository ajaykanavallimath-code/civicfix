import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { 
  Flame, 
  ExternalLink, 
  Clock, 
  Building2, 
  Globe, 
  Layers, 
  MapPin, 
  Sparkles,
  AlertTriangle 
} from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import StatusBadge from '../common/StatusBadge';

const clampZoom = (z) => Math.min(18, Math.max(5, Math.round(Number(z) || 13)));

// Severity colors matching design system
const getSeverityColor = (score) => {
  if (score >= 8.5) return '#DC2626'; // Critical Red
  if (score >= 7.0) return '#EA580C'; // High Orange
  if (score >= 4.5) return '#F59E0B'; // Medium Amber
  return '#16A34A'; // Low Green
};

// Custom SVG Severity Pins
const createSeverityDivIcon = (complaint) => {
  const score = complaint.priorityScore || 5;
  const isNew = complaint.isNew || (Date.now() - new Date(complaint.createdAt).getTime() < 15 * 60 * 1000);
  const color = getSeverityColor(score);

  const pulseRing = (score >= 8.5 || isNew)
    ? `<span style="position: absolute; top: -6px; left: -6px; width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${color}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></span>`
    : '';

  return L.divIcon({
    className: 'leaflet-civic-pin-container',
    html: `
      <div style="position: relative; width: 32px; height: 40px; cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
        ${pulseRing}
        <svg viewBox="0 0 34 44" width="32" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17c0 11.8 15.2 25.5 15.86 26.1.63.57 1.65.57 2.28 0C18.8 42.5 34 28.8 34 17 34 7.61 26.39 0 17 0z" fill="${color}" stroke="#FFFFFF" stroke-width="2.5"/>
          <circle cx="17" cy="16" r="6.5" fill="#FFFFFF"/>
          <circle cx="17" cy="16" r="3.5" fill="${color}"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -38]
  });
};

// Map Lifecycle Controller: fits all complaints using fitBounds and invalidates size
function MapLifecycleController({ complaints = [], center, zoom }) {
  const map = useMap();
  const hasFitInitialBounds = useRef(false);

  // Invalidate map size after container mount and window resize
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const container = map.getContainer();
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(() => {
        try { map.invalidateSize(); } catch (e) {}
      });
      resizeObserver.observe(container);
    }

    const onResize = () => {
      try { map.invalidateSize(); } catch (e) {}
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (resizeObserver && container) resizeObserver.unobserve(container);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  // Fit bounds to display all complaints across Savanur, Haveri, and Hubballi
  useEffect(() => {
    if (!map) return;

    const validCoords = complaints
      .filter(c => c?.location && typeof c.location.lat === 'number' && typeof c.location.lng === 'number')
      .map(c => [c.location.lat, c.location.lng]);

    if (validCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(validCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 15,
            animate: hasFitInitialBounds.current
          });
          hasFitInitialBounds.current = true;
          return;
        }
      } catch (err) {
        console.warn('[MapLifecycleController] fitBounds error:', err);
      }
    }

    if (center?.lat && center?.lng && !hasFitInitialBounds.current) {
      map.setView([center.lat, center.lng], clampZoom(zoom || 13));
    }
  }, [complaints, center?.lat, center?.lng, zoom, map]);

  return null;
}

// OpenStreetMap & Free Satellite Tile Providers
const TILE_SOURCES = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19
  },
  carto: {
    name: 'CARTO Voyager (Fast Fallback)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  satellite: {
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  }
};

export default function LiveGoogleMap({
  complaints = [],
  isHeatmapActive = false,
  center = { lat: 14.9695, lng: 75.3410 },
  zoom = 13
}) {
  const navigate = useNavigate();
  const [layerMode, setLayerMode] = useState('street'); // 'street' | 'satellite'
  const [streetSourceKey, setStreetSourceKey] = useState('osm');
  const [tileErrorNotice, setTileErrorNotice] = useState(null);
  const errorCountRef = useRef(0);

  const activeTileSource = useMemo(() => {
    if (layerMode === 'satellite') return TILE_SOURCES.satellite;
    return TILE_SOURCES[streetSourceKey] || TILE_SOURCES.osm;
  }, [layerMode, streetSourceKey]);

  const handleTileError = useCallback((failingUrl) => {
    console.warn('[Leaflet:DashboardMap] Tile failed to load:', failingUrl);
    errorCountRef.current += 1;

    if (layerMode === 'street' && streetSourceKey === 'osm' && errorCountRef.current >= 2) {
      setStreetSourceKey('carto');
      setTileErrorNotice('Switched to CARTO Voyager tile fallback.');
    }
  }, [layerMode, streetSourceKey]);

  return (
    <div 
      className="relative w-full h-[460px] sm:h-[540px] md:h-[600px] min-h-[440px] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-soft bg-slate-100 dark:bg-slate-900 z-0"
      style={{ minHeight: '440px' }}
    >
      {/* Top Overlay: Counts & Live Ticker */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-md flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{complaints.length} Public Grievances</span>
        </div>

        {isHeatmapActive && (
          <div className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 text-xs font-black animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-current text-red-700" />
            <span>Density Heatmap Active</span>
          </div>
        )}
      </div>

      {/* Top Right: Free Satellite / Street Tile Toggle */}
      <div className="absolute top-3 right-3 z-[1000] pointer-events-auto">
        <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 shadow-md text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLayerMode('street');
              errorCountRef.current = 0;
            }}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              layerMode === 'street' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Street</span>
          </button>
          <button
            type="button"
            onClick={() => setLayerMode('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              layerMode === 'satellite' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Satellite</span>
          </button>
        </div>
      </div>

      {/* Bottom Left: Severity Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-md pointer-events-auto">
        <span className="text-slate-400 font-bold uppercase">Severity:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>Critical (8.5+)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>High (7.0+)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Medium (4.5+)</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>Low</span>
      </div>

      {/* Tile Error Notice */}
      {tileErrorNotice && (
        <div className="absolute top-14 left-3 right-3 z-[1000] p-2.5 rounded-xl bg-amber-500 text-slate-950 shadow-lg text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-900" />
            <span>{tileErrorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLayerMode('satellite');
              setTileErrorNotice(null);
            }}
            className="px-2.5 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold ml-2 shrink-0 shadow-xs cursor-pointer hover:bg-slate-100"
          >
            Try Satellite
          </button>
        </div>
      )}

      {/* Main Leaflet MapContainer */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={clampZoom(zoom || 13)}
        minZoom={5}
        maxZoom={19}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '440px' }}
      >
        <TileLayer
          key={`${layerMode}-${streetSourceKey}`}
          url={activeTileSource.url}
          attribution={activeTileSource.attribution}
          subdomains={activeTileSource.subdomains || 'abc'}
          maxZoom={19}
          crossOrigin={true}
          eventHandlers={{
            tileerror: (e) => {
              const failingUrl = e?.tile?.src || e?.target?._url || 'unknown URL';
              handleTileError(failingUrl);
            }
          }}
        />

        {/* Dynamic bounds and resize management */}
        <MapLifecycleController
          complaints={complaints}
          center={center}
          zoom={clampZoom(zoom || 13)}
        />

        {/* 1. Density Heatmap Overlay Circles (when isHeatmapActive is toggled) */}
        {isHeatmapActive && complaints.map((c) => {
          const lat = c.location?.lat;
          const lng = c.location?.lng;
          if (typeof lat !== 'number' || typeof lng !== 'number') return null;

          const score = c.priorityScore || 5;
          const color = getSeverityColor(score);
          const radiusMeters = Math.max(140, Math.round(score * 65));

          return (
            <Circle
              key={`density-${c._id || c.trackingId}`}
              center={[lat, lng]}
              radius={radiusMeters}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.35,
                weight: 1.5
              }}
            />
          );
        })}

        {/* 2. Interactive Clustered Markers */}
        <MarkerClusterGroup
          key={`cluster-${complaints.length}-${isHeatmapActive}`}
          chunkedLoading
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          maxClusterRadius={45}
        >
          {complaints.map((c) => {
            const lat = c.location?.lat;
            const lng = c.location?.lng;
            if (typeof lat !== 'number' || typeof lng !== 'number') return null;

            const daysOpen = Math.max(1, Math.round((Date.now() - new Date(c.createdAt).getTime()) / (24 * 3600 * 1000)));

            return (
              <Marker
                key={c.trackingId}
                position={[lat, lng]}
                icon={createSeverityDivIcon(c)}
              >
                <Popup className="leaflet-custom-popup" maxWidth={300}>
                  <div className="p-1 space-y-2 text-slate-800">
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={c.media?.[0]?.url || '/seed/pothole-1.svg'}
                        alt={c.summary}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/seed/pothole-1.svg'; }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-500">{c.trackingId}</span>
                      <StatusBadge status={c.status} size="xs" />
                    </div>

                    <p className="font-bold text-xs line-clamp-2 leading-snug">{c.summary}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{c.location?.address}</p>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <SeverityBadge score={c.priorityScore} size="xs" />
                      <span className="font-bold text-blue-700">{c.department?.code}</span>
                      <span className="text-slate-400 font-mono">({daysOpen}d open)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/complaint/${c.trackingId}`)}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Transparent Audit</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
