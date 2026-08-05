import type { GameConfig } from "@/types/game";
import type { DifficultyLevel } from "@/types/game";

/** An EQ band the player can control. */
export interface EqBandControl {
  key: string;
  label: string;
  frequency: number; // Hz
  min: number; // dB
  max: number; // dB
  step: number;
}

/** Difficulty-specific configuration for the game. */
export interface EqMatchDifficultyConfig {
  /** Which bands are editable at this difficulty. */
  bands: EqBandControl[];
  /** How close (normalized 0-1) a band must be to count as "matched". */
  matchThreshold: number;
  /** Number of rounds in a game. */
  rounds: number;
}

export const EQ_BANDS: Record<string, EqBandControl> = {
  low: { key: "low", label: "Low", frequency: 200, min: -12, max: 12, step: 1 },
  mid: { key: "mid", label: "Mid", frequency: 1000, min: -12, max: 12, step: 1 },
  high: { key: "high", label: "High", frequency: 5000, min: -12, max: 12, step: 1 },
};

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, EqMatchDifficultyConfig> = {
  beginner: {
    bands: [EQ_BANDS.low],
    matchThreshold: 0.3,
    rounds: 3,
  },
  intermediate: {
    bands: [EQ_BANDS.low, EQ_BANDS.high],
    matchThreshold: 0.25,
    rounds: 5,
  },
  advanced: {
    bands: [EQ_BANDS.low, EQ_BANDS.mid, EQ_BANDS.high],
    matchThreshold: 0.18,
    rounds: 7,
  },
};

export const eqMatchConfig: GameConfig = {
  slug: "eq-match",
  name: "EQ Match",
  description:
    "Listen to a filtered signal and dial in the low, mid, and high EQ band gains to match the target curve.",
  difficulties: ["beginner", "intermediate", "advanced"],
  category: "equipment",
  icon: "🎛️",
};