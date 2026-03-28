import { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGeocoding } from "@/hooks/useGeocoding";
import type { Coordinate } from "@/types";

interface SearchBarProps {
  onSelect: (coordinate: Coordinate, label: string) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const { results, isSearching, search, clearResults } = useGeocoding();

  const handleChangeText = (text: string) => {
    setQuery(text);
    search(text);
  };

  const handleSelect = (item: { latitude: number; longitude: number; label: string }) => {
    onSelect({ latitude: item.latitude, longitude: item.longitude }, item.label);
    setQuery("");
    clearResults();
  };

  const handleClear = () => {
    setQuery("");
    clearResults();
  };

  return (
    <View>
      <View className="flex-row items-center bg-white rounded-xl px-3 py-2 shadow-md">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 ml-2 text-base text-gray-900"
          placeholder="Search address..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={handleChangeText}
          returnKeyType="search"
        />
        {isSearching && <ActivityIndicator size="small" color="#3B82F6" />}
        {query.length > 0 && !isSearching && (
          <Pressable onPress={handleClear}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      {results.length > 0 && (
        <View className="bg-white rounded-xl mt-1 shadow-md overflow-hidden">
          <FlatList
            data={results}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                className="px-3 py-3 border-b border-gray-100 active:bg-gray-50"
                onPress={() => handleSelect(item)}
              >
                <Text className="text-gray-800 text-sm" numberOfLines={2}>
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}
