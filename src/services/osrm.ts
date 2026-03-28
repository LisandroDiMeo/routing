import { OSRM_BASE } from "@/constants/api";
import type { Stop, TransportMode, Coordinate } from "@/types";

function getProfile(mode: TransportMode): string {
  return mode === "driving" ? "car" : "foot";
}

function coordsString(stops: Pick<Stop, "latitude" | "longitude">[]): string {
  // OSRM uses longitude,latitude order
  return stops.map((s) => `${s.longitude},${s.latitude}`).join(";");
}

export interface DistanceMatrix {
  distances: number[][];
  durations: number[][];
}

export async function getDistanceMatrix(
  stops: Stop[],
  mode: TransportMode
): Promise<DistanceMatrix> {
  const profile = getProfile(mode);
  const coords = coordsString(stops);
  const url = `${OSRM_BASE}/table/v1/${profile}/${coords}?annotations=distance,duration`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM table request failed: ${res.status}`);

  const data = await res.json();
  if (data.code !== "Ok") throw new Error(`OSRM error: ${data.code}`);

  return {
    distances: data.distances,
    durations: data.durations,
  };
}

export async function getRouteGeometry(
  orderedStops: Pick<Stop, "latitude" | "longitude">[],
  mode: TransportMode
): Promise<{ coordinates: Coordinate[]; distance: number; duration: number }> {
  const profile = getProfile(mode);
  const coords = coordsString(orderedStops);
  const url = `${OSRM_BASE}/route/v1/${profile}/${coords}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM route request failed: ${res.status}`);

  const data = await res.json();
  if (data.code !== "Ok") throw new Error(`OSRM error: ${data.code}`);

  const route = data.routes[0];
  const coordinates: Coordinate[] = route.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lng,
    })
  );

  return {
    coordinates,
    distance: route.distance,
    duration: route.duration,
  };
}
