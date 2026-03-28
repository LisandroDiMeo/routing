import { create } from "zustand";
import type { Stop } from "@/types";

interface StopsState {
  stops: Stop[];
  addStop: (stop: Omit<Stop, "id" | "order">) => void;
  removeStop: (id: string) => void;
  updateStopLabel: (id: string, label: string) => void;
  clearStops: () => void;
}

let nextId = 0;

export const useStopsStore = create<StopsState>((set) => ({
  stops: [],

  addStop: (stop) =>
    set((state) => ({
      stops: [
        ...state.stops,
        {
          ...stop,
          id: String(++nextId),
          order: state.stops.length + 1,
        },
      ],
    })),

  removeStop: (id) =>
    set((state) => ({
      stops: state.stops
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i + 1 })),
    })),

  updateStopLabel: (id, label) =>
    set((state) => ({
      stops: state.stops.map((s) => (s.id === id ? { ...s, label } : s)),
    })),

  clearStops: () => set({ stops: [] }),
}));
