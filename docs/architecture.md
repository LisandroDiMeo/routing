# Architecture

## Overview

The app follows a layered architecture with clear separation of concerns:

```
Screens (app/)
    |
Components (src/components/)
    |
Hooks (src/hooks/) + Stores (src/stores/)
    |
Services (src/services/) + Algorithms (src/algorithms/)
    |
External APIs (OSRM, Nominatim, Google Maps)
```

## Layers

### Screens (`app/`)

Expo Router file-based routing. Each file in `app/` maps to a screen:

- **`_layout.tsx`** -- Root stack navigator wrapping all screens.
- **`index.tsx`** -- The main map screen. Orchestrates all components, handles map taps (adding stops with reverse geocoding), search-based stop addition, route calculation triggers, and contextual UI based on app state.
- **`settings.tsx`** -- Allows the user to set default map center coordinates or use the device's current GPS location.

### Components (`src/components/`)

Presentational and lightly stateful UI components, organized by domain:

| Directory | Components | Purpose |
|-----------|-----------|---------|
| `map/` | `StopMarker`, `RoutePolyline` | Map overlay elements |
| `stops/` | `SearchBar`, `StopsList` | Stop input and display |
| `routes/` | `RouteCard`, `RouteResults`, `TransportToggle` | Route output and mode selection |

### Hooks (`src/hooks/`)

Encapsulate business logic, keeping components thin:

- **`useRouteCalculation`** -- Orchestrates the full pipeline: fetch distance matrix, run TSP algorithms, fetch geometry for each route.
- **`useMapRegion`** -- Manages map center with AsyncStorage persistence. Defaults to Buenos Aires.
- **`useGeocoding`** -- Debounced (500ms) location search via Nominatim.

### Stores (`src/stores/`)

Zustand stores with minimal API surface:

- **`stopsStore`** -- Manages the array of stops with auto-incrementing IDs and sequential ordering.
- **`routeStore`** -- Holds calculated routes, selected route index, transport mode, and loading state.

### Services (`src/services/`)

HTTP clients for external APIs:

- **`osrm.ts`** -- Distance matrix (Table API) and route geometry (Route API) via OSRM.
- **`geocoding.ts`** -- Forward search and reverse geocoding via Nominatim, with rate limiting (1.1s minimum interval).
- **`googleMaps.ts`** -- Builds Google Maps direction URLs, handling the 9-waypoint mobile limit.

### Algorithms (`src/algorithms/`)

Pure functions implementing TSP solvers. No side effects, no API calls. See [algorithms.md](./algorithms.md) for details.

## Data Flow

### Adding a Stop

```
User taps map / selects search result
  -> stopsStore.addStop({ latitude, longitude, label })
  -> StopMarker rendered on map
  -> (If from map tap) reverseGeocode() updates label asynchronously
  -> Camera animates to new stop location
  -> Haptic feedback (light impact)
```

### Calculating Routes

```
User presses "Calculate Routes"
  -> useRouteCalculation.calculate()
  -> OSRM Table API -> n*n distance/duration matrix
  -> generateRoutes(matrix, count=3)
       -> Nearest Neighbor from each start + 2-Opt
       -> Simulated Annealing (3 configs) + 2-Opt
       -> Sort by distance, deduplicate
  -> For each top tour:
       -> Reorder stops per tour sequence
       -> OSRM Route API -> polyline geometry
  -> routeStore.setRoutes(alternatives)
  -> Map renders color-coded polylines
  -> Bottom panel shows route cards
```

### Opening in Google Maps

```
User presses "Open in Maps"
  -> buildRouteUrl(selectedRoute.stops)
  -> If >9 intermediate stops: attach warning
  -> Linking.openURL(googleMapsUrl)
```

## State Management

The app uses two independent Zustand stores rather than a single global store. This keeps each store focused and avoids unnecessary re-renders:

- Components that only care about stops subscribe to `stopsStore`
- Components that only care about routes subscribe to `routeStore`
- The main screen (`index.tsx`) bridges both stores via hooks
