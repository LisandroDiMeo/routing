import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const STORAGE_KEY = "default_location";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        const { latitude: lat, longitude: lng } = JSON.parse(val);
        setLatitude(String(lat));
        setLongitude(String(lng));
      }
    });
  }, []);

  const handleSave = async () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert("Invalid", "Enter valid latitude and longitude values.");
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ latitude: lat, longitude: lng }));
    router.back();
  };

  const handleUseCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required.");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setLatitude(String(location.coords.latitude));
    setLongitude(String(location.coords.longitude));
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Settings",
          headerBackTitle: "Map",
        }}
      />

      <View className="p-4 gap-4">
        <Text className="text-gray-900 text-lg font-semibold">
          Default Map Center
        </Text>

        <View className="gap-2">
          <Text className="text-gray-600 text-sm">Latitude</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
            placeholder="-34.6037"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="gap-2">
          <Text className="text-gray-600 text-sm">Longitude</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
            placeholder="-58.3816"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Pressable
          className="bg-gray-100 rounded-xl py-3 items-center"
          onPress={handleUseCurrentLocation}
        >
          <Text className="text-primary-600 font-medium">
            Use Current Location
          </Text>
        </Pressable>

        <Pressable
          className="bg-primary-600 rounded-xl py-4 items-center mt-4"
          onPress={handleSave}
        >
          <Text className="text-white text-lg font-semibold">Save</Text>
        </Pressable>
      </View>
    </View>
  );
}
