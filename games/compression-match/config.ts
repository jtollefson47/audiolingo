import type { GameConfig } from "@/types/game";
import type { DifficultyLevel } from "@/types/game";

/** Compressor parameters that can be controlled by the player. */
export interface CompressorControl {
  key: "threshold" | "ratio" | "attack" | "release";
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

/** Difficulty-specific configuration for the game. */
export interface CompressionMatchDifficultyConfig {
  /** Which controls are editable at this difficulty. */
  controls: CompressorControl[];
  /** How close (normalized 0-1) a param must be to count as "matched". */
  matchThreshold: number;
  /** Number of rounds in a game. */
  rounds: number;
}

export const COMPRESSION_CONTROLS: Record<CompressorControl["key"], CompressorControl> = {
  threshold: { key: "threshold", label: "Threshold", min: -60, max: 0, step: 1, unit: "dB" },
  ratio: { key: "ratio", label: "Ratio", min: 1, max: 20, step: 0.5, unit: ":1" },
  attack: { key: "attack", label: "Attack", min: 0.001, max: 0.1, step: 0.001, unit: "s" },
  release: { key: "release", label: "Release", min: 0.01, max: 1, step: 0.01, unit: "s" },
};

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, CompressionMatchDifficultyConfig> = {
  beginner: {
    controls: [COMPRESSION_CONTROLS.threshold],
    matchThreshold: 0.3,
    rounds: 3,
  },
  intermediate: {
    controls: [COMPRESSION_CONTROLS.threshold, COMPRESSION_CONTROLS.ratio],
    matchThreshold: 0.25,
    rounds: 5,
  },
  advanced: {
    controls: [
      COMPRESSION_CONTROLS.threshold,
      COMPRESSION_CONTROLS.ratio,
      COMPRESSION_CONTROLS.attack,
      COMPRESSION_CONTROLS.release,
    ],
    matchThreshold: 0.18,
    rounds: 7,
  },
};

export const compressionMatchConfig: GameConfig = {
  slug: "compression-match",
  name: "Compression Match",
  description:
    "Listen to a compressed signal and dial in the threshold, ratio, attack, and release to match the target compression.",
  difficulties: ["beginner", "intermediate", "advanced"],
  category: "equipment",
  icon: "🎚️",
};