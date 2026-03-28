import { useRef, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import MapLibreGL, { type CameraRef } from "@maplibre/maplibre-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { StopMarker } from "@/components/map/StopMarker";
import { RoutePolyline } from "@/components/map/RoutePolyline";
import { SearchBar } from "@/components/stops/SearchBar";
import { StopsList } from "@/components/stops/StopsList";
import { RouteResults } from "@/components/routes/RouteResults";
import { TransportToggle } from "@/components/routes/TransportToggle";
import { useStopsStore } from "@/stores/stopsStore";
import { useRouteStore } from "@/stores/routeStore";
import { useRouteCalculation } from "@/hooks/useRouteCalculation";
import { useMapRegion } from "@/hooks/useMapRegion";
import { reverseGeocode } from "@/services/geocoding";
import type { Coordinate } from "@/types";

const TILE_STYLE = "https://tiles.openfreemap.org/styles/bright";

MapLibreGL.setConnected(true);

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<CameraRef>(null);

  const { center, zoom, isLoaded } = useMapRegion();

  const stops = useStopsStore((s) => s.stops);
  const addStop = useStopsStore((s) => s.addStop);
  const updateStopLabel = useStopsStore((s) => s.updateStopLabel);
  const clearStops = useStopsStore((s) => s.clearStops);

  const routes = useRouteStore((s) => s.routes);
  const selectedRouteIndex = useRouteStore((s) => s.selectedRouteIndex);
  const isCalculating = useRouteStore((s) => s.isCalculating);
  const clearRoutes = useRouteStore((s) => s.clearRoutes);

  const { calculate, calculateMore } = useRouteCalculation();

  const handleMapPress = useCallback(
    async (feature: GeoJSON.Feature) => {
      if (feature.geometry.type !== "Point") return;
      const [longitude, latitude] = feature.geometry.coordinates;
      const tempLabel = `Stop ${stops.length + 1}`;
      addStop({ latitude, longitude, label: tempLabel });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Reverse geocode in background
      const label = await reverseGeocode(latitude, longitude);
      const currentStops = useStopsStore.getState().stops;
      const added = currentStops.find(
        (s) => s.latitude === latitude && s.longitude === longitude
      );
      if (added) {
        updateStopLabel(added.id, label);
      }
    },
    [addStop, updateStopLabel, stops.length]
  );

  const handleAddFromSearch = useCallback(
    (coordinate: Coordinate, label: string) => {
      addStop({ ...coordinate, label });
      cameraRef.current?.setCamera({
        centerCoordinate: [coordinate.longitude, coordinate.latitude],
        zoomLevel: 15,
        animationDuration: 500,
        animationMode: "easeTo",
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [addStop]
  );

  const handleClear = useCallback(() => {
    clearStops();
    clearRoutes();
  }, [clearStops, clearRoutes]);

  const hasStops = stops.length > 0;
  const canCalculate = stops.length >= 2;
  const hasRoutes = routes.length > 0;

  if (!isLoaded) return null;

  return (
    <View className="flex-1">
      <MapLibreGL.MapView
        style={{ flex: 1 }}
        mapStyle={TILE_STYLE}
        onPress={handleMapPress}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: center,
            zoomLevel: zoom,
          }}
        />
        <MapLibreGL.UserLocation visible animated />

        {stops.map((stop) => (
          <StopMarker key={stop.id} stop={stop} />
        ))}
        {hasRoutes &&
          routes.map((route, i) => (
            <RoutePolyline
              key={i}
              coordinates={route.geometry}
              index={i}
              isSelected={i === selectedRouteIndex}
            />
          ))}
      </MapLibreGL.MapView>

      {/* Search bar */}
      <View
        className="absolute left-4 right-14"
        style={{ top: insets.top + 8 }}
      >
        <SearchBar onSelect={handleAddFromSearch} />
      </View>

      {/* Settings button */}
      <Pressable
        className="absolute bg-white rounded-full p-2.5 shadow-md"
        style={{ top: insets.top + 10, right: 16 }}
        onPress={() => router.push("/settings")}
      >
        <Ionicons name="settings-outline" size={20} color="#374151" />
      </Pressable>

      {/* Transport mode toggle */}
      {hasStops && !hasRoutes && (
        <View
          className="absolute right-4"
          style={{ top: insets.top + 64 }}
        >
          <TransportToggle />
        </View>
      )}

      {/* Clear button */}
      {hasStops && (
        <Pressable
          className="absolute left-4 bg-white rounded-full p-3 shadow-md"
          style={{ top: insets.top + 64 }}
          onPress={handleClear}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </Pressable>
      )}

      {/* Empty state hint */}
      {!hasStops && !hasRoutes && (
        <View className="absolute bottom-12 left-4 right-4 items-center">
          <View className="bg-white/90 rounded-2xl px-6 py-4 shadow-sm">
            <Text className="text-gray-500 text-center text-base">
              Tap the map or search to add delivery stops
            </Text>
          </View>
        </View>
      )}

      {/* Calculate button */}
      {canCalculate && !hasRoutes && !isCalculating && (
        <View className="absolute bottom-8 left-4 right-4">
          <Pressable
            className="bg-primary-600 rounded-2xl py-4 items-center shadow-lg"
            onPress={calculate}
          >
            <Text className="text-white text-lg font-semibold">
              Calculate Routes
            </Text>
          </Pressable>
        </View>
      )}

      {/* Loading */}
      {isCalculating && (
        <View className="absolute bottom-8 left-4 right-4">
          <View className="bg-white rounded-2xl py-4 items-center shadow-lg flex-row justify-center gap-3">
            <ActivityIndicator color="#3B82F6" />
            <Text className="text-gray-700 text-lg">Calculating routes...</Text>
          </View>
        </View>
      )}

      {/* Stops list */}
      {hasStops && !hasRoutes && (
        <StopsList />
      )}

      {/* Route results */}
      {hasRoutes && (
        <RouteResults onRequestMore={calculateMore} />
      )}
    </View>
  );
}
