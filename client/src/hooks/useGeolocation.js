import { useState, useEffect, useCallback, useRef } from 'react';
import { reverseGeocodeCoords } from '../services/geocoding';

// Default center: Savanur Town, Haveri District, Karnataka
export const DEFAULT_COORDS = {
  lat: 14.9695,
  lng: 75.3410,
  address: 'Court Road, Ward 4, Savanur, Haveri District, Karnataka 581118',
  accuracy: null,
  zoom: 15,
  isApproximate: false
};

export function useGeolocation() {
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutIdRef = useRef(null);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const unsupportedMsg = 'Geolocation is not supported by your browser. Please search an address or drag the map pin manually.';
      console.warn('[useGeolocation] Not supported by browser');
      setError(unsupportedMsg);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    console.log('[useGeolocation] Requesting device position (enableHighAccuracy=true, timeout=10000, maximumAge=0)...');

    // 10-second failsafe timer to guarantee loading is never stuck
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(() => {
      setLoading((curr) => {
        if (curr) {
          const timeoutMsg = 'Location request timed out after 10 seconds (Error code 3). Defaulted to manual pin. Drag pin or search address below.';
          console.warn('[useGeolocation] Failsafe timeout reached');
          setError(timeoutMsg);
          return false;
        }
        return false;
      });
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);
        const isApproximate = accuracy > 5000;

        console.log('[useGeolocation] Position acquired successfully:', {
          latitude: lat,
          longitude: lng,
          accuracy: `±${accuracy}m`,
          isApproximate
        });

        let resolvedAddress = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}, Current Location`;
        try {
          const res = await reverseGeocodeCoords(lat, lng);
          if (res?.address) resolvedAddress = res.address;
        } catch (e) {
          console.warn('[useGeolocation] Reverse geocode fallback:', e.message);
        }

        setCoords({
          lat,
          lng,
          address: resolvedAddress,
          accuracy,
          zoom: 16,
          isApproximate
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        console.error(`[useGeolocation] Geolocation error (code ${err.code}):`, err.message);

        let userMsg = '';
        if (err.code === 1) {
          userMsg = 'Location permission denied (Error code 1). To fix: Click the padlock/tune icon in your browser URL bar, change Location to "Allow", and try again. You can also drag the pin manually.';
        } else if (err.code === 2) {
          userMsg = 'Position signal unavailable (Error code 2). On Windows, make sure "Location services" is enabled in Windows Settings > Privacy & security > Location. You can also drag the pin manually.';
        } else if (err.code === 3) {
          userMsg = 'Location detection timed out after 10 seconds (Error code 3). Please check your internet connection or drag the pin manually.';
        } else {
          userMsg = `Could not acquire location: ${err.message || 'Unknown error'}. Drag the pin manually.`;
        }

        setError(userMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Fresh GPS position, no stale cache
      }
    );
  }, []);

  const updateLocation = useCallback(async (lat, lng, customAddress = '') => {
    setLoading(true);
    let address = customAddress;
    if (!address) {
      try {
        const res = await reverseGeocodeCoords(lat, lng);
        address = res.address;
      } catch (err) {
        address = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
      }
    }
    setCoords((prev) => ({
      lat,
      lng,
      address,
      accuracy: prev.accuracy,
      zoom: 16,
      isApproximate: false
    }));
    setLoading(false);
  }, []);

  // Auto-detect location on initial hook mount
  useEffect(() => {
    detectLocation();
    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [detectLocation]);

  return {
    coords,
    loading,
    error,
    detectLocation,
    updateLocation
  };
}
