# Routing

A mobile route optimization app built with React Native and Expo. Add delivery stops on a map, and the app calculates the best route using multiple Traveling Salesman Problem (TSP) algorithms, presenting several optimized alternatives to choose from.

## Features

### Map-Based Stop Management
- Tap anywhere on the map to add a stop (with automatic reverse geocoding for address labels)
- Search for locations by name or address using the integrated search bar
- View all stops as numbered markers on the map
- Remove individual stops or clear all at once

### Multi-Algorithm Route Optimization
The app generates multiple route alternatives using a combination of algorithms:
- **Nearest Neighbor** heuristic from different starting points
- **2-Opt** local search to eliminate route crossings
- **Simulated Annealing** with varied temperature schedules to escape local optima
- Routes are deduplicated, sorted by distance, and the best alternatives are presented

### Route Visualization
- Color-coded polylines for each route alternative (5-color rotation)
- Selected route shown as a solid line; unselected routes as dashed
- Each route card displays total distance, estimated duration, and stop sequence

### Transportation Modes
- Toggle between **driving** and **walking** profiles
- Each mode uses a different OSRM routing profile (car/foot) affecting distance and duration calculations

### Google Maps Integration
- Open the selected route in Google Maps for turn-by-turn navigation
- Handles the 9-waypoint limit for Google Maps mobile with a warning

### Persistent Settings
- Configure a default map center (latitude/longitude)
- "Use Current Location" to set the map center from GPS
- Settings saved to device storage via AsyncStorage

## Tech Stack

- **Framework:** React Native 0.83 + Expo 55
- **Language:** TypeScript (strict mode)
- **Navigation:** Expo Router (file-based)
- **Maps:** MapLibre GL Native
- **State Management:** Zustand
- **Styling:** Tailwind CSS via NativeWind
- **Routing API:** OSRM (Open Source Routing Machine)
- **Geocoding API:** Nominatim (OpenStreetMap)

## Getting Started

### Prerequisites
- Node.js
- Expo CLI (`npx expo`)
- iOS Simulator, Android Emulator, or a physical device with Expo Go

### Installation

```bash
npm install
```

### Running

```bash
# Start Expo dev server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## Project Structure

```
app/                  # Expo Router screens
  _layout.tsx         # Root navigation stack
  index.tsx           # Main map screen
  settings.tsx        # Map center settings

src/
  algorithms/         # TSP solving algorithms
    tsp.ts            # Nearest Neighbor, 2-Opt, Simulated Annealing
    helpers.ts        # Tour distance and similarity helpers
  components/         # UI components
    map/              # StopMarker, RoutePolyline
    stops/            # SearchBar, StopsList
    routes/           # RouteCard, RouteResults, TransportToggle
  constants/          # API endpoints and rate limits
  hooks/              # useRouteCalculation, useMapRegion, useGeocoding
  services/           # OSRM, Nominatim, Google Maps integrations
  stores/             # Zustand stores (routeStore, stopsStore)
  types/              # Shared TypeScript type definitions
```

## License

Private project.
