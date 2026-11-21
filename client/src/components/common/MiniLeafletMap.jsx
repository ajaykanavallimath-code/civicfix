import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Globe, Layers, ExternalLink } from 'lucide-react';

const clampZoom = (z) => Math.min(18, Math.max(5, Math.round(Number(z) || 15)));

const createPinIcon = (score = 5) => {
  let color = '#F59E0B';
  if (score >= 8.5) color = '#EF4444';
  else if (score >= 7.0) color = '#F97316';
  else if (score < 4.5) color = '#10B981';

  return L.divIcon({
    className: 'mini-custom-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35));">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="${color}" fill-opacity="0.9" />
          <circle cx="12" cy="10" r="3" fill="#ffffff" />
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function MiniMapLifecycle({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => map.invalidateSize(), 200);

    const container = map.getContainer();
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(container);
    }

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      if (resizeObserver && container) resizeObserver.unobserve(container);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);

  useEffect(() => {
    if (center && center[0] && center[1]) {
      const targetZoom = clampZoom(zoom || 15);
      map.setView(center, targetZoom, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
}

const TILE_SOURCES = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19
  },
  carto: {
    name: 'CARTO Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  },
  satellite: {
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  }
};

export default function MiniLeafletMap({
  lat,
  lng,
  address,
  priorityScore = 5,
  height = '240px',
  zoom = 15
}) {
  const [layerMode, setLayerMode] = useState('street');
  const [streetSourceKey, setStreetSourceKey] = useState('osm');
  const errorCountRef = useRef(0);

  if (!lat || !lng) {
    return (
      <div 
        style={{ height }} 
        className="w-full rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500"
      >
        <MapPin className="w-4 h-4 mr-1 text-slate-400" />
        Coordinates not available
      </div>
    );
  }

  const position = [Number(lat), Number(lng)];

  const activeTileSource = useMemo(() => {
    if (layerMode === 'satellite') return TILE_SOURCES.satellite;
    return TILE_SOURCES[streetSourceKey] || TILE_SOURCES.osm;
  }, [layerMode, streetSourceKey]);

  const handleTileError = useCallback((failingUrl) => {
    errorCountRef.current += 1;
    if (layerMode === 'street' && streetSourceKey === 'osm' && errorCountRef.current >= 2) {
      setStreetSourceKey('carto');
    }
  }, [layerMode, streetSourceKey]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 z-0" style={{ height }}>
      {/* Map Layer Toggle */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => {
            setLayerMode('street');
            errorCountRef.current = 0;
          }}
          className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
            layerMode === 'street'
              ? 'bg-civic-navy text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Street
        </button>
        <button
          type="button"
          onClick={() => setLayerMode('satellite')}
          className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
            layerMode === 'satellite'
              ? 'bg-civic-navy text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* External Directions Link */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2.5 left-2.5 z-[1000] inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-md border border-slate-200 text-[10px] font-bold text-civic-navy hover:bg-slate-50 transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        <span>Directions</span>
      </a>

      <MapContainer
        center={position}
        zoom={clampZoom(zoom || 15)}
        minZoom={5}
        maxZoom={19}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%', minHeight: height }}
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

        <MiniMapLifecycle
          center={position}
          zoom={clampZoom(zoom || 15)}
        />

        <Marker position={position} icon={createPinIcon(priorityScore)}>
          {address && (
            <Popup>
              <div className="text-xs p-1 max-w-[200px]">
                <p className="font-bold text-slate-900 leading-snug">{address}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                </p>
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  );
}
