import type { GameEvent, GameEventType } from "@/types/game";

type Listener = (event: GameEvent) => void;

/**
 * A lightweight typed event bus for game events.
 * Games emit events through the GameShell; the host page can subscribe.
 * This keeps games decoupled from the host — they never know who is listening.
 */
class GameEventBus {
  private listeners = new Map<GameEventType, Set<Listener>>();

  /** Subscribe to a specific event type. Returns an unsubscribe function. */
  on(type: GameEventType, listener: Listener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    return () => this.off(type, listener);
  }

  /** Subscribe to all game events. Returns an unsubscribe function. */
  onAny(listener: Listener): () => void {
    const types: GameEventType[] = ["score", "complete", "progress", "start", "pause", "resume"];
    const unsubs = types.map((t) => this.on(t, listener));
    return () => unsubs.forEach((unsub) => unsub());
  }

  /** Remove a specific listener for an event type. */
  off(type: GameEventType, listener: Listener): void {
    this.listeners.get(type)?.delete(listener);
  }

  /** Emit an event to all subscribers of that type. */
  emit(event: GameEvent): void {
    this.listeners.get(event.type)?.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        // A failing listener must not break other listeners or the game.
        console.error(`[GameEventBus] listener error for "${event.type}":`, err);
      }
    });
  }

  /** Remove all listeners (useful for tests and teardown). */
  clear(): void {
    this.listeners.clear();
  }
}

/** Singleton event bus shared across the app. */
export const gameEventBus = new GameEventBus();