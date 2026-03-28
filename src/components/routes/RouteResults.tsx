import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

import { RouteCard } from "./RouteCard";
import { useRouteStore } from "@/stores/routeStore";
import { buildRouteUrl } from "@/services/googleMaps";

interface RouteResultsProps {
  onRequestMore: () => void;
}

export function RouteResults({ onRequestMore }: RouteResultsProps) {
  const insets = useSafeAreaInsets();
  const routes = useRouteStore((s) => s.routes);
  const selectedRouteIndex = useRouteStore((s) => s.selectedRouteIndex);
  const selectRoute = useRouteStore((s) => s.selectRoute);
  const transportMode = useRouteStore((s) => s.transportMode);
  const clearRoutes = useRouteStore((s) => s.clearRoutes);
  const isCalculating = useRouteStore((s) => s.isCalculating);

  const handleShare = () => {
    const selected = routes[selectedRouteIndex];
    if (!selected) return;

    const { url, warning } = buildRouteUrl(selected.orderedStops, transportMode);

    if (warning) {
      Alert.alert("Note", warning, [
        { text: "Cancel", style: "cancel" },
        { text: "Open Anyway", onPress: () => Linking.openURL(url) },
      ]);
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg"
      style={{ paddingBottom: insets.bottom + 8, maxHeight: "45%" }}
    >
      <View className="items-center pt-2 pb-1">
        <View className="w-10 h-1 bg-gray-300 rounded-full" />
      </View>

      <View className="flex-row items-center justify-between px-4 pb-2">
        <Text className="text-gray-900 font-semibold text-lg">
          {routes.length} route{routes.length !== 1 ? "s" : ""} found
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            className="bg-primary-600 rounded-full px-4 py-2"
            onPress={handleShare}
          >
            <Text className="text-white text-sm font-medium">
              Open in Maps
            </Text>
          </Pressable>
          <Pressable
            className="bg-gray-200 rounded-full p-2"
            onPress={clearRoutes}
          >
            <Ionicons name="close" size={18} color="#374151" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {routes.map((route, i) => (
          <RouteCard
            key={i}
            route={route}
            index={i}
            isSelected={i === selectedRouteIndex}
            onPress={() => selectRoute(i)}
          />
        ))}

        <Pressable
          className="items-center py-3 mb-2"
          onPress={onRequestMore}
          disabled={isCalculating}
        >
          <Text className="text-primary-600 font-medium">
            {isCalculating ? "Calculating..." : "Find more routes"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
