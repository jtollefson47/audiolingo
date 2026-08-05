import { create } from "zustand";

interface ExampleState {
  correct: number;
  total: number;
  incrementCorrect: () => void;
  incrementTotal: () => void;
  reset: () => void;
}

/**
 * Example game store. Each game instance gets its own store via the
 * createStore factory in the plugin. State is scoped per instance.
 */
export const createExampleStore = () =>
  create<ExampleState>((set) => ({
    correct: 0,
    total: 0,
    incrementCorrect: () => set((s) => ({ correct: s.correct + 1 })),
    incrementTotal: () => set((s) => ({ total: s.total + 1 })),
    reset: () => set({ correct: 0, total: 0 }),
  }));