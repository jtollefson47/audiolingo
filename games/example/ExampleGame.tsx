"use client";

import { useState } from "react";
import type { GameProps } from "@/types/game";
import { scoreExampleGame } from "./scoring";

/**
 * A minimal example game demonstrating the plugin contract.
 * Rendered inside a GameShell, receives difficulty + emit via props.
 */
export function ExampleGame({ difficulty, emit }: GameProps) {
  // For a demo, we use local component state. Real games use the
  // plugin's Zustand store via useExampleStore.
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const answer = (isCorrect: boolean) => {
    const nextTotal = total + 1;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setTotal(nextTotal);
    setCorrect(nextCorrect);

    // Emit score + progress events to the host page.
    const result = scoreExampleGame({ correct: nextCorrect, total: nextTotal, difficulty });
    emit("score", { score: result.score, stars: result.stars });
    emit("progress", { progress: nextTotal / 10 });
  };

  const reset = () => {
    setCorrect(0);
    setTotal(0);
    emit("start", {});
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold">Example Game</h2>
      <p className="text-sm text-muted-foreground">
        Difficulty: {difficulty} — Score: {total > 0 ? Math.round((correct / total) * 100) : "—"}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => answer(true)}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Correct
        </button>
        <button
          onClick={() => answer(false)}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Wrong
        </button>
        <button
          onClick={reset}
          className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
      <p className="text-sm">
        {total > 0
          ? `${correct}/${total} correct (${Math.round((correct / total) * 100)}%)`
          : "Answer to start playing."}
      </p>
    </div>
  );
}