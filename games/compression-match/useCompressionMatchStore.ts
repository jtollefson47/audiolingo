import { create } from "zustand";
import type { CompressorControl } from "./config";

/** A single round: the target settings the player must dial in. */
export interface CompressionRound {
  id: number;
  target: Record<string, number>;
}

interface CompressionMatchState {
  /** Current round number (0-based). */
  roundIndex: number;
  /** The target settings for the current round. */
  currentTarget: Record<string, number>;
  /** The player's current slider values. */
  playerValues: Record<string, number>;
  /** Per-round results: normalized deviation average (0-1). */
  roundDeviations: number[];
  /** Total rounds configured for the difficulty. */
  totalRounds: number;
  /** Controls active at this difficulty. */
  activeControls: CompressorControl[];
  /** Initialize a game instance. */
  initGame: (controls: CompressorControl[], rounds: number) => void;
  /** Generate a new random target round. */
  nextRound: () => void;
  /** Update a player slider value. */
  setValue: (key: string, value: number) => void;
  /** Record the round result (0-1 deviation) and advance. */
  submitRound: (deviation: number) => void;
  /** Reset the entire game. */
  reset: () => void;
}

/** Random value within a control's range. */
function randomValue(control: CompressorControl): number {
  const steps = Math.round((control.max - control.min) / control.step);
  const stepIndex = Math.floor(Math.random() * (steps + 1));
  const raw = control.min + stepIndex * control.step;
  return Math.round(raw * 1000) / 1000;
}

/** Generate a random target from a set of controls. */
function generateTarget(controls: CompressorControl[]): Record<string, number> {
  const target: Record<string, number> = {};
  for (const control of controls) {
    target[control.key] = randomValue(control);
  }
  return target;
}

/**
 * Factory that creates a Zustand store scoped to a game instance.
 * Per-plugin contract: createStore() in the plugin index.
 */
export const createCompressionMatchStore = () =>
  create<CompressionMatchState>((set, get) => ({
    roundIndex: 0,
    currentTarget: {},
    playerValues: {},
    roundDeviations: [],
    totalRounds: 0,
    activeControls: [],

    initGame: (controls, rounds) => {
      const target = generateTarget(controls);
      const defaults: Record<string, number> = {};
      for (const control of controls) {
        defaults[control.key] = control.min;
      }
      set({
        roundIndex: 0,
        activeControls: controls,
        totalRounds: rounds,
        currentTarget: target,
        playerValues: defaults,
        roundDeviations: [],
      });
    },

    nextRound: () => {
      const { activeControls, roundIndex, totalRounds } = get();
      if (roundIndex + 1 >= totalRounds) return;
      const target = generateTarget(activeControls);
      const defaults: Record<string, number> = {};
      for (const control of activeControls) {
        defaults[control.key] = control.min;
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
      const { activeControls } = get();
      const target = generateTarget(activeControls);
      const defaults: Record<string, number> = {};
      for (const control of activeControls) {
        defaults[control.key] = control.min;
      }
      set({
        roundIndex: 0,
        currentTarget: target,
        playerValues: defaults,
        roundDeviations: [],
      });
    },
  }));