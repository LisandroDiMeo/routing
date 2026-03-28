# External Services

The app relies on three external services, all accessed via HTTP. No API keys are required for OSRM and Nominatim.

## OSRM (Open Source Routing Machine)

**Base URL:** `https://router.project-osrm.org`

OSRM provides real road-network routing. The app uses two endpoints:

### Table API -- Distance Matrix

```
GET /table/v1/{profile}/{coordinates}?annotations=distance,duration
```

- **Profile:** `car` (driving) or `foot` (walking)
- **Coordinates:** Semicolon-separated `longitude,latitude` pairs
- **Response:** An n-by-n matrix of distances (meters) and durations (seconds) between all input points

Used before running TSP algorithms to get real road distances between all stops.

### Route API -- Geometry

```
GET /route/v1/{profile}/{coordinates}?overview=full&geometries=geojson
```

- **Response:** A GeoJSON LineString with the full route geometry, plus total distance and duration

Used after the TSP solver picks a tour order, to get the detailed polyline for map rendering.

### Rate Limits

The public OSRM demo server has no documented rate limits but is a shared resource. The app makes minimal requests (one table call + one route call per alternative).

## Nominatim (OpenStreetMap Geocoding)

**Base URL:** `https://nominatim.openstreetmap.org`

### Forward Geocoding (Search)

```
GET /search?q={query}&format=json&limit=5
```

Returns up to 5 matching places for a text query.

### Reverse Geocoding

```
GET /reverse?lat={lat}&lon={lon}&format=json
```

Converts coordinates to a human-readable address. Used when the user taps the map to add a stop.

### Rate Limiting

Per Nominatim's usage policy, the app enforces a minimum interval of **1.1 seconds** between requests. A `User-Agent` header (`RoutingApp/1.0`) is sent with every request as required by the policy.

The search bar also applies a **500ms debounce** to avoid firing requests on every keystroke.

## Google Maps (Navigation Handoff)

The app does not call the Google Maps API. Instead, it builds a `google.com/maps/dir/...` URL and opens it via deep linking, handing off turn-by-turn navigation to the Google Maps app.

### URL Format

```
https://www.google.com/maps/dir/{stop1_lat},{stop1_lon}/{stop2_lat},{stop2_lon}/...
```

### Waypoint Limit

Google Maps on mobile supports a maximum of **9 intermediate waypoints** (11 total points including origin and destination). If the route exceeds this limit, the app attaches a warning to the generated URL result. The URL is still generated with all stops, but Google Maps may ignore waypoints beyond the limit.
