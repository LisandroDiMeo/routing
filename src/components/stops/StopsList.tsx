import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStopsStore } from "@/stores/stopsStore";
import * as Haptics from "expo-haptics";

export function StopsList() {
  const stops = useStopsStore((s) => s.stops);
  const removeStop = useStopsStore((s) => s.removeStop);

  const handleRemove = (id: string) => {
    removeStop(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (stops.length === 0) return null;

  return (
    <View className="absolute bottom-24 left-4 right-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {stops.map((stop) => (
          <View
            key={stop.id}
            className="flex-row items-center bg-white rounded-full px-3 py-2 shadow-sm"
          >
            <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center mr-2">
              <Text className="text-white text-xs font-bold">
                {stop.order}
              </Text>
            </View>
            <Text className="text-gray-800 text-sm mr-2" numberOfLines={1} style={{ maxWidth: 120 }}>
              {stop.label}
            </Text>
            <Pressable onPress={() => handleRemove(stop.id)}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
