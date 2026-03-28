import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "default_location";

const DEFAULT_CENTER: [number, number] = [-58.3816, -34.6037]; // [lng, lat]
const DEFAULT_ZOOM = 12;

export function useMapRegion() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom] = useState(DEFAULT_ZOOM);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        const { latitude, longitude } = JSON.parse(val);
        setCenter([longitude, latitude]);
      }
      setIsLoaded(true);
    });
  }, []);

  return { center, zoom, isLoaded };
}
