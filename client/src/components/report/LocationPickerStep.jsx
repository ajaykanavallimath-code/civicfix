import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Search, 
  Crosshair, 
  AlertCircle, 
  Layers, 
  Globe, 
  Sparkles,
  Check,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { searchPlacesIndia, reverseGeocodeCoords } from '../../services/geocoding';

// Clamp zoom helper: clamp between 5 and 18, default 15
export const clampZoom = (z) => Math.min(18, Math.max(5, Math.round(Number(z) || 15)));

// Custom SVG Draggable Pin for Leaflet
const createLeafletPinIcon = () => {
  return L.divIcon({
    className: 'leaflet-custom-marker',
    html: `
      <div style="cursor: grab; filter: drop-shadow(0 4px 6px rgba(11,31,58,0.4));">
        <svg viewBox="0 0 34 44" width="34" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17c0 11.8 15.2 25.5 15.86 26.1.63.57 1.65.57 2.28 0C18.8 42.5 34 28.8 34 17 34 7.61 26.39 0 17 0z" fill="#0B1F3A" stroke="#FFFFFF" stroke-width="2.5"/>
          <circle cx="17" cy="16" r="6.5" fill="#F5B301"/>
          <circle cx="17" cy="16" r="2.5" fill="#0B1F3A"/>
        </svg>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 44]
  });
};

// Map Lifecycle Controller: invalidates size and pans view
function MapLifecycleController({ center, zoom = 15 }) {
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
    if (center?.lat && center?.lng) {
      const targetZoom = clampZoom(zoom || 15);
      map.setView([center.lat, center.lng], targetZoom, { animate: true });
    }
  }, [center?.lat, center?.lng, zoom, map]);

  return null;
}

// Map Click Handler to drop / move pin
function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      if (e?.latlng) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// OpenStreetMap & Keyless Tile Providers
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

export default function LocationPickerStep({
  coords,
  onLocationChange,
  onDetectLocation,
  loading,
  geoError
}) {
  const { t } = useTranslation();

  // Search input state
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Layer toggle: 'street' | 'satellite'
  const [layerMode, setLayerMode] = useState('street');
  const [streetSourceKey, setStreetSourceKey] = useState('osm');
  const [tileErrorNotice, setTileErrorNotice] = useState(null);
  const errorCountRef = useRef(0);
  const containerRef = useRef(null);

  const pinIcon = useMemo(() => createLeafletPinIcon(), []);

  const activeTileSource = useMemo(() => {
    if (layerMode === 'satellite') return TILE_SOURCES.satellite;
    return TILE_SOURCES[streetSourceKey] || TILE_SOURCES.osm;
  }, [layerMode, streetSourceKey]);

  // Handle tile load errors and seamlessly fall back to CARTO
  const handleTileError = useCallback((failingUrl) => {
    console.warn('[Leaflet:TileError] Failing tile:', failingUrl);
    errorCountRef.current += 1;
    if (layerMode === 'street' && streetSourceKey === 'osm' && errorCountRef.current >= 2) {
      console.warn('[Leaflet] Switching to CARTO Voyager fallback');
      setStreetSourceKey('carto');
      setTileErrorNotice('Switched to CARTO tile fallback.');
    }
  }, [layerMode, streetSourceKey]);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search with India restriction (countrycodes=in)
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setIsOpen(false);
      return;
    }

    setSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await searchPlacesIndia(trimmed);
        setSearchResults(results);
        setIsOpen(results.length > 0);
        if (results.length === 0) {
          setSearchError('No matching places found in India. Try another street, ward, or city.');
        }
      } catch (err) {
        console.warn('Search error:', err);
        setSearchError('Search service temporarily busy. You can click anywhere on the map to set a pin.');
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSelectResult = (result) => {
    onLocationChange(result.lat, result.lng, result.displayName);
    setSearchResults([]);
    setSearchInput(result.name || result.displayName.split(',')[0]);
    setIsOpen(false);
    setSearchError(null);
  };

  // Quick preset spots in Savanur, Haveri and nearby locations
  const presets = [
    { name: 'Savanur Govt School', lat: 14.9702, lng: 75.3418, address: 'Court Road, Ward 4, Savanur' },
    { name: 'Savanur CHC Hospital', lat: 14.9688, lng: 75.3435, address: 'Near Hospital Road, Savanur' },
    { name: 'Savanur KSRTC Bus Stand', lat: 14.9695, lng: 75.3389, address: 'Station Road, Savanur' },
    { name: 'Haveri District Hospital', lat: 14.7932, lng: 75.4011, address: 'PB Road, Haveri' }
  ];

  return (
    <div className="space-y-4">
      
      {/* Search Input & "Use My Current Location" GPS Button */}
      <div className="flex flex-col sm:flex-row gap-2" ref={containerRef}>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setIsOpen(true); }}
            placeholder="Search landmark, street, or ward in India (OpenStreetMap)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-civic-navy bg-white shadow-xs"
          />
          {searching ? (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-civic-navy animate-spin" />
            </div>
          ) : searchInput ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchResults([]);
                setIsOpen(false);
                setSearchError(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}

          {/* Autocomplete Results Dropdown */}
          {isOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-elevated z-50 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
              <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Locations (India)
              </div>
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer text-slate-700"
                >
                  <MapPin className="w-4 h-4 text-civic-gold shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.displayName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live GPS Re-Detect Button: "Use My Current Location" */}
        <button
          type="button"
          onClick={onDetectLocation}
          className="civic-tap-target px-4 py-2.5 rounded-xl bg-civic-navy hover:bg-civic-navy-light active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
          title="Detect GPS coordinates using device location"
        >
          <Crosshair className={`w-4 h-4 text-civic-gold ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Locating...' : 'Use My Current Location'}</span>
        </button>
      </div>

      {searchError && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Geolocation Status / Error / Accuracy Strip */}
      <div className="flex flex-col gap-2 text-xs">
        {coords.accuracy ? (
          coords.isApproximate || coords.accuracy > 5000 ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-semibold shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Approximate location on desktop (±{coords.accuracy} m) — drag pin or click map to adjust</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>Live GPS Active: Accurate to ±{coords.accuracy} m</span>
            </div>
          )
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Pin coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
          </div>
        )}

        {geoError && (
          <div className="text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-300 flex items-start gap-2.5 font-medium leading-relaxed shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-950">Location Notice</p>
              <p className="text-xs text-amber-800 mt-0.5">{geoError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Presets Strip & Map/Satellite Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Quick Spots:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onLocationChange(p.lat, p.lng, p.address)}
              className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
            >
              📍 {p.name}
            </button>
          ))}
        </div>

        {/* Free Map / Satellite Toggle */}
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLayerMode('street');
              errorCountRef.current = 0;
            }}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              layerMode === 'street' ? 'bg-white text-civic-navy shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Street</span>
          </button>
          <button
            type="button"
            onClick={() => setLayerMode('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              layerMode === 'satellite' ? 'bg-white text-civic-navy shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3 text-emerald-600" />
            <span>Satellite</span>
          </button>
        </div>
      </div>

      {/* Responsive OpenStreetMap Leaflet Container */}
      <div className="relative w-full h-[360px] md:h-[420px] min-h-[360px] rounded-2xl overflow-hidden border border-slate-300 shadow-soft bg-slate-100 z-0">
        
        {tileErrorNotice && (
          <div className="absolute top-12 left-3 right-3 z-[1000] p-2.5 rounded-xl bg-amber-500 text-white shadow-lg text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
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

        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={clampZoom(coords.zoom || 15)}
          minZoom={5}
          maxZoom={19}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', minHeight: '360px' }}
        >
          {/* Tile Layer with OpenStreetMap & Fallback */}
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

          {/* Map Pan & Size Controller */}
          <MapLifecycleController
            center={coords}
            zoom={coords.zoom || 15}
          />

          {/* Map Click Handler to Drop/Move Pin */}
          <MapClickHandler onLocationChange={onLocationChange} />

          {/* Draggable Marker */}
          <Marker
            position={[coords.lat, coords.lng]}
            icon={pinIcon}
            draggable={true}
            eventHandlers={{
              dragend(e) {
                const marker = e.target;
                if (marker) {
                  const position = marker.getLatLng();
                  console.log('[Leaflet] Marker dragged to:', position.lat, position.lng);
                  onLocationChange(position.lat, position.lng);
                }
              }
            }}
          />
        </MapContainer>

        {/* Helpful Tip Overlay */}
        <div className="absolute top-2.5 left-2.5 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-xs pointer-events-none flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Click map or drag pin to adjust location</span>
        </div>
      </div>

      {/* Confirmed Address Box with Live Drag Instruction */}
      <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 flex items-start gap-2.5">
        <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('report.address_detected')}</p>
            <span className="text-[10px] text-slate-400 font-medium">Pin updates address automatically</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug mt-0.5">
            {coords.address || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`}
          </p>
        </div>
      </div>

    </div>
  );
}
