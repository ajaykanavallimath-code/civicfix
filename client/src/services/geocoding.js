/**
 * OpenStreetMap Nominatim Geocoding & Reverse Geocoding Service
 * Free & Keyless, restricted to India (countrycodes=in), with User-Agent & timeout
 */

const NOMINATIM_HEADERS = {
  'Accept-Language': 'en,kn,hi',
  'User-Agent': 'CivicFix-Karnataka-CivicPulse/1.0 (civicfix-triage@example.com)'
};

/**
 * Reverse geocode lat, lng to a human-readable address
 */
export async function reverseGeocodeCoords(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: NOMINATIM_HEADERS,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.display_name) {
        return {
          address: data.display_name,
          details: data.address || {},
          success: true
        };
      }
    }
  } catch (err) {
    console.warn('[Geocoding] Reverse geocoding network/timeout fallback:', err.message);
  }

  return {
    address: `Lat: ${Number(lat).toFixed(5)}, Lng: ${Number(lng).toFixed(5)}, Haveri District, Karnataka`,
    details: {},
    success: false
  };
}

/**
 * Search places restricted to India (countrycodes=in)
 */
export async function searchPlacesIndia(query) {
  if (!query || !query.trim()) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const encoded = encodeURIComponent(query.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=in&limit=5&addressdetails=1`;

    const res = await fetch(url, {
      headers: NOMINATIM_HEADERS,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return (data || []).map((item) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        name: item.name || item.display_name.split(',')[0],
        type: item.type
      }));
    }
  } catch (err) {
    console.warn('[Geocoding] Place search notice:', err.message);
  }

  return [];
}
