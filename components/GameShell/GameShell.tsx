"use client";

import { useEffect, useRef } from "react";
import type { DifficultyLevel, GameEventType, GamePlugin } from "@/types/game";
import { gameEventBus } from "@/lib/gameEventBus";

/**
 * GameShell — the reusable, plugin-agnostic container every game renders inside.
 *
 * Analogous to an embedded YouTube player wrapper: it provides consistent
 * chrome, sizing behavior, and an event bridge, while knowing nothing about
 * the game inside it.
 *
 * Layout: fully fluid — fills its parent's width and grows vertically with
 * content. Works identically on a phone screen and a desktop screen.
 */
export function GameShell({
  game,
  difficulty,
  className = "",
}: {
  game: GamePlugin;
  difficulty: DifficultyLevel;
  className?: string;
}) {
  const installRef = useRef(false);
  const storeRef = useRef<ReturnType<typeof game.createStore> | null>(null);

  // Install the game's store once per GameShell instance.
  if (!installRef.current) {
    storeRef.current = game.createStore();
    installRef.current = true;
  }

  // Create the emit bridge for this game instance.
  const emit = (type: GameEventType, payload?: Record<string, unknown>) => {
    gameEventBus.emit({
      type,
      gameSlug: game.config.slug,
      payload,
      timestamp: Date.now(),
    });
  };

  // Emit a start event on mount.
  useEffect(() => {
    emit("start");

    // Cleanup: remove any listeners tied to this shell and emit pause.
    // The store is intentionally garbage-collected with the component.
    return () => {
      emit("pause");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GameComponent = game.Component;

  const reset = () => {
    emit("start");
  };

  return (
    <section
      aria-label={`${game.config.name} game`}
      className={`w-full max-w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm ${className}`}
    >
      <div
        role="toolbar"
        aria-label="Game controls"
        className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-4 py-2 text-sm"
      >
        <span className="font-medium">
          {game.config.icon ? `${game.config.icon} ` : ""}
          {game.config.name}
        </span>
        <span className="text-muted-foreground capitalize">Difficulty: {difficulty}</span>
      </div>

      <div className="w-full p-4 sm:p-6">
        <GameComponent difficulty={difficulty} emit={emit} onReset={reset} />
      </div>
    </section>
  );
}