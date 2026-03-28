import { NOMINATIM_BASE, NOMINATIM_USER_AGENT, NOMINATIM_MIN_INTERVAL_MS } from "@/constants/api";
import type { GeocodingResult } from "@/types";

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, NOMINATIM_MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: { "User-Agent": NOMINATIM_USER_AGENT },
  });
}

export async function searchPlaces(query: string): Promise<GeocodingResult[]> {
  if (query.trim().length < 2) return [];

  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  return data.map((item: any) => ({
    placeId: String(item.place_id),
    label: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
  }));
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18`;
  try {
    const res = await rateLimitedFetch(url);
    if (!res.ok) return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    const data = await res.json();
    return (
      data.address?.road ??
      data.display_name?.split(",").slice(0, 2).join(",") ??
      `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    );
  } catch {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}
