import { useCallback } from "react";
import { Alert } from "react-native";
import { useStopsStore } from "@/stores/stopsStore";
import { useRouteStore } from "@/stores/routeStore";
import { getDistanceMatrix, getRouteGeometry } from "@/services/osrm";
import { generateRoutes } from "@/algorithms/tsp";
import type { RouteAlternative } from "@/types";

export function useRouteCalculation() {
  const stops = useStopsStore((s) => s.stops);
  const transportMode = useRouteStore((s) => s.transportMode);
  const setRoutes = useRouteStore((s) => s.setRoutes);
  const addRoutes = useRouteStore((s) => s.addRoutes);
  const setIsCalculating = useRouteStore((s) => s.setIsCalculating);

  const buildAlternatives = useCallback(
    async (count: number): Promise<RouteAlternative[]> => {
      const matrix = await getDistanceMatrix(stops, transportMode);
      const generated = generateRoutes(matrix.distances, count);

      const alternatives: RouteAlternative[] = [];

      for (const route of generated) {
        const orderedStops = route.tour.map((i) => stops[i]);
        const geometry = await getRouteGeometry(orderedStops, transportMode);

        alternatives.push({
          tourOrder: route.tour,
          orderedStops,
          distance: geometry.distance,
          duration: geometry.duration,
          geometry: geometry.coordinates,
        });
      }

      return alternatives;
    },
    [stops, transportMode]
  );

  const calculate = useCallback(async () => {
    if (stops.length < 2) return;

    setIsCalculating(true);
    try {
      const alternatives = await buildAlternatives(3);
      setRoutes(alternatives);
    } catch (error) {
      Alert.alert(
        "Calculation Error",
        "Could not calculate routes. Check your internet connection and try again."
      );
    } finally {
      setIsCalculating(false);
    }
  }, [stops, buildAlternatives, setRoutes, setIsCalculating]);

  const calculateMore = useCallback(async () => {
    if (stops.length < 2) return;

    setIsCalculating(true);
    try {
      const alternatives = await buildAlternatives(3);
      addRoutes(alternatives);
    } catch (error) {
      Alert.alert("Error", "Could not calculate more routes.");
    } finally {
      setIsCalculating(false);
    }
  }, [stops, buildAlternatives, addRoutes, setIsCalculating]);

  return { calculate, calculateMore };
}
