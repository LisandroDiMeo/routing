import { useState, useCallback, useRef } from "react";
import { searchPlaces } from "@/services/geocoding";
import type { GeocodingResult } from "@/types";

export function useGeocoding() {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchPlaces(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, isSearching, search, clearResults };
}
