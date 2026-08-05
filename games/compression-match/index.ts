import type { GamePlugin } from "@/types/game";
import { compressionMatchConfig } from "./config";
import { CompressionMatchGame } from "./CompressionMatchGame";
import { scoreCompressionMatch } from "./scoring";
import { createCompressionMatchStore } from "./useCompressionMatchStore";

/**
 * Compression Match plugin. Exports a GamePlugin object conforming to
 * the contract in types/game.ts. Registered in lib/gameRegistry.ts.
 */
export const compressionMatchGame: GamePlugin = {
  config: compressionMatchConfig,
  Component: CompressionMatchGame,
  scoring: scoreCompressionMatch,
  createStore: createCompressionMatchStore,
};