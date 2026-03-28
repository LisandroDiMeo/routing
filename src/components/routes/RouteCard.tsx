import { View, Text, Pressable } from "react-native";
import type { RouteAlternative } from "@/types";

const ROUTE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

interface RouteCardProps {
  route: RouteAlternative;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

export function RouteCard({ route, index, isSelected, onPress }: RouteCardProps) {
  const color = ROUTE_COLORS[index % ROUTE_COLORS.length];

  return (
    <Pressable
      className={`rounded-xl p-4 mb-2 ${isSelected ? "bg-gray-100" : "bg-white"}`}
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-900 font-semibold text-base">
          Route {index + 1}
        </Text>
        <View className="flex-row items-center gap-3">
          <Text className="text-gray-600 text-sm">
            {formatDistance(route.distance)}
          </Text>
          <Text className="text-gray-600 text-sm">
            {formatDuration(route.duration)}
          </Text>
        </View>
      </View>
      <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
        {route.orderedStops.map((s) => s.label).join(" → ")}
      </Text>
    </Pressable>
  );
}
