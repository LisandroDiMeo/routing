import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouteStore } from "@/stores/routeStore";
import type { TransportMode } from "@/types";

const MODES: { mode: TransportMode; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: "driving", icon: "car" },
  { mode: "walking", icon: "walk" },
];

export function TransportToggle() {
  const transportMode = useRouteStore((s) => s.transportMode);
  const setTransportMode = useRouteStore((s) => s.setTransportMode);

  return (
    <View className="bg-white rounded-full shadow-md overflow-hidden">
      {MODES.map(({ mode, icon }) => {
        const isActive = transportMode === mode;
        return (
          <Pressable
            key={mode}
            className={`p-3 ${isActive ? "bg-primary-600" : "bg-white"}`}
            onPress={() => setTransportMode(mode)}
          >
            <Ionicons
              name={icon}
              size={20}
              color={isActive ? "#FFFFFF" : "#6B7280"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
