import type { GamePlugin } from "@/types/game";
import { exampleGame } from "@/games/example";
import { compressionMatchGame } from "@/games/compression-match";

/**
 * The plugin registry. Maps a game slug to its GamePlugin.
 * To add a new game: create /games/<name>/, then register it here.
 */
const registry = new Map<string, GamePlugin>();

/** Register a game plugin. Throws on duplicate slug. */
export function registerGame(plugin: GamePlugin): void {
  if (registry.has(plugin.config.slug)) {
    throw new Error(`Game with slug "${plugin.config.slug}" is already registered.`);
  }
  registry.set(plugin.config.slug, plugin);
}

/** Get a game plugin by slug, or undefined if not found. */
export function getGame(slug: string): GamePlugin | undefined {
  return registry.get(slug);
}

/** Get all registered games, sorted by name. */
export function getAllGames(): GamePlugin[] {
  return Array.from(registry.values()).sort((a, b) => a.config.name.localeCompare(b.config.name));
}

// Register all built-in games here.
registerGame(exampleGame);
registerGame(compressionMatchGame);
