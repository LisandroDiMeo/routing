import type { Stop, TransportMode } from "@/types";

const MAX_WAYPOINTS_MOBILE = 9;

function modeToGoogleMode(mode: TransportMode): string {
  return mode === "driving" ? "driving" : "walking";
}

export function buildRouteUrl(
  orderedStops: Stop[],
  mode: TransportMode
): { url: string; warning: string | null } {
  if (orderedStops.length < 2) {
    return { url: "", warning: "Need at least 2 stops" };
  }

  const origin = orderedStops[0];
  const destination = orderedStops[orderedStops.length - 1];
  const waypoints = orderedStops.slice(1, -1);

  let warning: string | null = null;
  let usedWaypoints = waypoints;

  if (waypoints.length > MAX_WAYPOINTS_MOBILE) {
    warning = `Google Maps on mobile supports up to ${MAX_WAYPOINTS_MOBILE} waypoints. Your route has ${waypoints.length}. Only the first ${MAX_WAYPOINTS_MOBILE} intermediate stops will be included.`;
    usedWaypoints = waypoints.slice(0, MAX_WAYPOINTS_MOBILE);
  }

  const parts = [
    `https://www.google.com/maps/dir/?api=1`,
    `&origin=${origin.latitude},${origin.longitude}`,
    `&destination=${destination.latitude},${destination.longitude}`,
    `&travelmode=${modeToGoogleMode(mode)}`,
  ];

  if (usedWaypoints.length > 0) {
    const waypointStr = usedWaypoints
      .map((s) => `${s.latitude},${s.longitude}`)
      .join("|");
    parts.push(`&waypoints=${waypointStr}`);
  }

  return { url: parts.join(""), warning };
}
