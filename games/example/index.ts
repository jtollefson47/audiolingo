import type { GamePlugin } from "@/types/game";
import { exampleConfig } from "./config";
import { ExampleGame } from "./ExampleGame";
import { scoreExampleGame } from "./scoring";
import { createExampleStore } from "./useExampleStore";

/**
 * The example game plugin. Exports a GamePlugin object conforming to
 * the contract in types/game.ts. Register this in lib/gameRegistry.ts.
 */
export const exampleGame: GamePlugin = {
  config: exampleConfig,
  Component: ExampleGame,
  scoring: scoreExampleGame,
  createStore: createExampleStore,
};