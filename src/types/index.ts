export type TransportMode = "driving" | "walking";

export interface Stop {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  order: number;
}

export interface RouteAlternative {
  /** Ordered indices into the original stops array */
  tourOrder: number[];
  /** Ordered stops with geometry-ready coordinates */
  orderedStops: Stop[];
  /** Total distance in meters */
  distance: number;
  /** Total duration in seconds */
  duration: number;
  /** Decoded polyline coordinates for map display */
  geometry: { latitude: number; longitude: number }[];
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  placeId: string;
  label: string;
  latitude: number;
  longitude: number;
}
