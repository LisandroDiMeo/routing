import { create } from "zustand";
import type { RouteAlternative, TransportMode } from "@/types";

interface RouteState {
  routes: RouteAlternative[];
  selectedRouteIndex: number;
  transportMode: TransportMode;
  isCalculating: boolean;
  setRoutes: (routes: RouteAlternative[]) => void;
  addRoutes: (routes: RouteAlternative[]) => void;
  selectRoute: (index: number) => void;
  setTransportMode: (mode: TransportMode) => void;
  setIsCalculating: (value: boolean) => void;
  clearRoutes: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  routes: [],
  selectedRouteIndex: 0,
  transportMode: "driving",
  isCalculating: false,

  setRoutes: (routes) => set({ routes, selectedRouteIndex: 0 }),
  addRoutes: (routes) =>
    set((state) => ({ routes: [...state.routes, ...routes] })),
  selectRoute: (index) => set({ selectedRouteIndex: index }),
  setTransportMode: (mode) => set({ transportMode: mode }),
  setIsCalculating: (value) => set({ isCalculating: value }),
  clearRoutes: () => set({ routes: [], selectedRouteIndex: 0 }),
}));
