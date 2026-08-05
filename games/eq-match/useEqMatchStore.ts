import { create } from "zustand";
import type { EqBandControl } from "./config";

interface EqMatchState {
  /** Current round number (0-based). */
  roundIndex: number;
  /** The target band gains for the current round. */
  currentTarget: Record<string, number>;
  /** The player's current slider values. */
  playerValues: Record<string, number>;
  /** Per-round results: normalized deviation average (0-1). */
  roundDeviations: number[];
  /** Total rounds configured for the difficulty. */
  totalRounds: number;
  /** Bands active at this difficulty. */
  activeBands: EqBandControl[];
  /** Initialize a game instance. */
  initGame: (bands: EqBandControl[], rounds: number) => void;
  /** Generate a new random target round. */
  nextRound: () => void;
  /** Update a player slider value. */
  setValue: (key: string, value: number) => void;
  /** Record the round result (0-1 deviation) and advance. */
  submitRound: (deviation: number) => void;
  /** Reset the entire game. */
  reset: () => void;
}

/** Random value within a band's range. */
function randomValue(band: EqBandControl): number {
  const steps = Math.round((band.max - band.min) / band.step);
  const stepIndex = Math.floor(Math.random() * (steps + 1));
  const raw = band.min + stepIndex * band.step;
  return Math.round(raw * 1000) / 1000;
}

/** Generate a random target from a set of bands. */
function generateTarget(bands: EqBandControl[]): Record<string, number> {
  const target: Record<string, number> = {};
  for (const band of bands) {
    target[band.key] = randomValue(band);
  }
  return target;
}

/**
 * Factory that creates a Zustand store scoped to a game instance.
 * Per-plugin contract: createStore() in the plugin index.
 */
export const createEqMatchStore = () =>
  create<EqMatchState>((set, get) => ({
    roundIndex: 0,
    currentTarget: {},
    playerValues: {},
    roundDeviations: [],
    totalRounds: 0,
    activeBands: [],

    initGame: (bands, rounds) => {
      const target = generateTarget(bands);
      const defaults: Record<string, number> = {};
      for (const band of bands) {
        defaults[band.key] = 0;
      }
      set({
        roundIndex: 0,
        activeBands: bands,
        totalRounds: rounds,
        currentTarget: target,
        playerValues: defaults,
        roundDeviations: [],
      });
    },

    nextRound: () => {
      const { activeBands, roundIndex, totalRounds } = get();
      if (roundIndex + 1 >= totalRounds) return;
      const target = generateTarget(activeBands);
      const defaults: Record<string, number> = {};
      for (const band of activeBands) {
        defaults[band.key] = 0;
      }
      set({
        roundIndex: roundIndex + 1,
        currentTarget: target,
        playerValues: defaults,
      });
    },

    setValue: (key, value) =>
      set((s) => ({
        playerValues: { ...s.playerValues, [key]: value },
      })),

    submitRound: (deviation) => {
      const { roundDeviations, roundIndex, totalRounds } = get();
      const next = [...roundDeviations, deviation];
      if (roundIndex + 1 >= totalRounds) {
        set({ roundDeviations: next });
      } else {
        get().nextRound();
        set({ roundDeviations: next });
      }
    },

    reset: () => {
      const { activeBands } = get();
      const target = generateTarget(activeBands);
      const defaults: Record<string, number> = {};
      for (const band of activeBands) {
        defaults[band.key] = 0;
      }
      set({
        roundIndex: 0,
        currentTarget: target,
        playerValues: defaults,
        roundDeviations: [],
      });
    },
  }));