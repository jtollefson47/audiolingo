import type { GamePlugin } from "@/types/game";
import { eqMatchConfig } from "./config";
import { EqMatchGame } from "./EqMatchGame";
import { scoreEqMatch } from "./scoring";
import { createEqMatchStore } from "./useEqMatchStore";

/**
 * EQ Match plugin. Exports a GamePlugin object conforming to
 * the contract in types/game.ts. Registered in lib/gameRegistry.ts.
 */
export const eqMatchGame: GamePlugin = {
  config: eqMatchConfig,
  Component: EqMatchGame,
  scoring: scoreEqMatch,
  createStore: createEqMatchStore,
};