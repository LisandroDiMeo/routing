import { View, Text } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import type { Stop } from "@/types";

interface StopMarkerProps {
  stop: Stop;
}

export function StopMarker({ stop }: StopMarkerProps) {
  return (
    <MapLibreGL.MarkerView
      coordinate={[stop.longitude, stop.latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View className="items-center">
        <View className="w-8 h-8 rounded-full bg-primary-600 items-center justify-center border-2 border-white shadow-md">
          <Text className="text-white text-sm font-bold">{stop.order}</Text>
        </View>
        <View className="w-2 h-2 bg-primary-600 rotate-45 -mt-1" />
      </View>
    </MapLibreGL.MarkerView>
  );
}
