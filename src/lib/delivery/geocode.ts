// Shop location — resolved once via Nominatim for "Golabandha, Ganjam,
// Odisha" (the most specific part of the business address that geocodes
// reliably) and hardcoded here rather than re-geocoding the shop's own
// fixed location on every order.
export const SHOP_LAT = 19.2570798;
export const SHOP_LNG = 84.8712336;

export type GeocodeResult = { lat: number; lng: number };

// A same-named place can exist far away in another district/state (e.g.
// "Berhampur" has matches in Ganjam, Baleshwar, and West Bengal) — bias
// results toward a box roughly ±1° (~110km) around the shop so the local
// match wins. This is a *preference*, not a hard filter (Nominatim's
// `bounded=1` was tried and rejected — it dropped valid local matches
// entirely rather than just deprioritizing far ones; see geocodeAddress).
const SEARCH_RADIUS_DEG = 1;

async function geocodeQuery(query: string): Promise<GeocodeResult | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set(
      "viewbox",
      [
        SHOP_LNG - SEARCH_RADIUS_DEG,
        SHOP_LAT + SEARCH_RADIUS_DEG,
        SHOP_LNG + SEARCH_RADIUS_DEG,
        SHOP_LAT - SEARCH_RADIUS_DEG,
      ].join(",")
    );

    const res = await fetch(url.toString(), {
      headers: {
        // Required by Nominatim's usage policy — identifies the app/contact.
        "User-Agent": "CakeHouseWebsite/1.0 (contact: jagadishrock529@gmail.com)",
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;

    const lat = Number(data[0].lat);
    const lng = Number(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

// Free OpenStreetMap geocoder — no API key/billing, but lower accuracy and
// stricter rate limits than a paid provider. Never throws; callers should
// treat null as "couldn't resolve this address" and fall back gracefully
// rather than blocking checkout.
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const direct = await geocodeQuery(`${address}, Odisha, India`);
  if (direct) return direct;

  // Verbose Indian addresses often chain several locality names that don't
  // match Nominatim's indexed hierarchy as one combined string (e.g.
  // "Golabandha, Gopalpur, Berhampur, Odisha" matches nothing, even though
  // "Golabandha" and "Berhampur" each match fine alone) — retry with just
  // the last couple of segments, which usually resolves at the town level
  // even when the full street-level address doesn't.
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 2) {
    return geocodeQuery(`${parts.slice(-2).join(", ")}, Odisha, India`);
  }
  return null;
}

export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function distanceFromShopKm(lat: number, lng: number): number {
  return haversineDistanceKm(SHOP_LAT, SHOP_LNG, lat, lng);
}
