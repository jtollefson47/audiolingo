"use client";

import { useState } from "react";
import { getGame } from "@/lib/gameRegistry";
import { GameShell } from "@/components/GameShell/GameShell";
import type { DifficultyLevel } from "@/types/game";

/**
 * Standalone game page wrapper. Looks up the game plugin by slug and
 * renders it inside a GameShell with a difficulty selector.
 */
export default function GamePage({ slug }: { slug: string }) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("beginner");
  const game = getGame(slug);

  if (!game) {
    return <p className="text-muted-foreground">Game &quot;{slug}&quot; not found.</p>;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <GameShell game={game} difficulty={difficulty} />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Difficulty:</span>
        {(["beginner", "intermediate", "advanced"] as const).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            aria-pressed={difficulty === level}
            className={`rounded px-4 py-2 text-sm font-medium capitalize transition-colors ${
              difficulty === level
                ? "bg-green-600 text-white"
                : "bg-muted text-foreground hover:bg-border"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </main>
  );
}