import type { ComponentType } from "react";

/** Difficulty levels supported by every game. */
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

/** Standard events a game can emit to the host page via the GameShell. */
export type GameEventType = "score" | "complete" | "progress" | "start" | "pause" | "resume";

/** Payload for a game event. */
export interface GameEvent {
  type: GameEventType;
  gameSlug: string;
  /** Optional payload, e.g. { score: 100 } or { progress: 0.5 }. */
  payload?: Record<string, unknown>;
  timestamp: number;
}

/** Metadata describing a game plugin. */
export interface GameConfig {
  slug: string;
  name: string;
  description: string;
  /** Supported difficulty levels. Must include all three. */
  difficulties: DifficultyLevel[];
  /** Category for grouping in the lobby (e.g. "ear-training", "equipment"). */
  category: string;
  /** Optional icon/emoji for the lobby. */
  icon?: string;
}

/**
 * The contract every game plugin must implement.
 * A game is a self-contained unit rendered inside a GameShell.
 */
export interface GamePlugin {
  config: GameConfig;
  /** The React component that renders the game UI. */
  Component: ComponentType<GameProps>;
  /** Pure scoring function, unit-testable in isolation. */
  scoring: (input: ScoringInput) => ScoringResult;
  /** Factory that creates a Zustand store scoped to a game instance. */
  createStore: () => unknown;
}

/** Props passed to every game component by the GameShell. */
export interface GameProps {
  difficulty: DifficultyLevel;
  /** Emit an event to the host page. */
  emit: (type: GameEventType, payload?: Record<string, unknown>) => void;
  /** Reset the game to its initial state. */
  onReset: () => void;
}

/** Input to a game's scoring function. */
export interface ScoringInput {
  /** Number of correct answers. */
  correct: number;
  /** Total number of attempts. */
  total: number;
  /** Time taken in seconds, if applicable. */
  timeSeconds?: number;
  /** Difficulty the game was played at. */
  difficulty: DifficultyLevel;
}

/** Result of a game's scoring function. */
export interface ScoringResult {
  /** Score as a percentage (0-100). */
  score: number;
  /** Optional star rating (1-3). */
  stars?: number;
  /** Optional feedback message. */
  feedback?: string;
}