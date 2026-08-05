"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "@/types/game";
import { ensureAudioStarted } from "@/lib/audio/audioContext";
import { Compressor, type CompressorParams } from "@/lib/audio/compressor";
import { NoiseGenerator } from "@/lib/audio/noiseGenerator";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DIFFICULTY_CONFIGS } from "./config";
import {
  averageDeviation,
  computeParamDeviations,
  scoreCompressionMatch,
} from "./scoring";
import { createCompressionMatchStore } from "./useCompressionMatchStore";

/**
 * Compression Match game.
 *
 * The player hears a reference signal processed by a compressor with secret
 * settings. They dial in threshold/ratio/attack/release on their own
 * compressor, then compare. Scoring is based on parameter closeness.
 *
 * Audio lifecycle: a fresh NoiseGenerator + Compressor chain is created per
 * play and disposed on stop/unmount — no node leaks.
 */
export function CompressionMatchGame({ difficulty, emit }: GameProps) {
  // Per-instance Zustand store (created once per mounted game instance).
  const [useGameStore] = useState(() => createCompressionMatchStore());

  const roundIndex = useGameStore((s) => s.roundIndex);
  const currentTarget = useGameStore((s) => s.currentTarget);
  const playerValues = useGameStore((s) => s.playerValues);
  const roundDeviations = useGameStore((s) => s.roundDeviations);
  const activeControls = useGameStore((s) => s.activeControls);
  const totalRounds = useGameStore((s) => s.totalRounds);
  const initGame = useGameStore((s) => s.initGame);
  const setValue = useGameStore((s) => s.setValue);
  const submitRound = useGameStore((s) => s.submitRound);
  const resetGame = useGameStore((s) => s.reset);

  const config = DIFFICULTY_CONFIGS[difficulty];

  const [isPlaying, setIsPlaying] = useState(false);
  const [playingTarget, setPlayingTarget] = useState(false);
  const [feedback, setFeedback] = useState("");

  const noiseRef = useRef<NoiseGenerator | null>(null);
  const compRef = useRef<Compressor | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  // Initialize the game when the difficulty changes.
  useEffect(() => {
    initGame(config.controls, config.rounds);
    return () => {
      stopPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  /** Dispose the active playback chain. Safe to call anytime. */
  const stopPlayback = () => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    noiseRef.current?.dispose();
    compRef.current?.dispose();
    noiseRef.current = null;
    compRef.current = null;
    setIsPlaying(false);
  };

  /** Build a fresh noise → compressor chain and play it. */
  const playChain = async (params: CompressorParams) => {
    await ensureAudioStarted();
    stopPlayback();
    const noise = new NoiseGenerator({ type: "white", volume: -12 });
    const comp = new Compressor(params);
    comp.connect(noise.getOutput());
    comp.toDestination();
    noiseRef.current = noise;
    compRef.current = comp;
    noise.start();
    setIsPlaying(true);
    stopTimerRef.current = window.setTimeout(stopPlayback, 2500);
  };

  const playReference = () => {
    setPlayingTarget(true);
    void playChain(currentTarget);
  };

  const playPlayer = () => {
    setPlayingTarget(false);
    void playChain(playerValues);
  };

  const handleSubmit = () => {
    const deviations = computeParamDeviations(playerValues, currentTarget, activeControls);
    const avg = averageDeviation(deviations);
    const matched = avg <= config.matchThreshold;

    submitRound(avg);

    const result = scoreCompressionMatch({
      correct: matched ? 1 : 0,
      total: 1,
      difficulty,
      paramDeviations: deviations,
    });
    setFeedback(result.feedback ?? "");
    emit("score", { score: result.score, stars: result.stars });
    emit("progress", { progress: (roundDeviations.length + 1) / totalRounds });
    if (roundIndex + 1 >= totalRounds) {
      emit("complete", { score: result.score, stars: result.stars });
    }
  };

  const handleReset = () => {
    stopPlayback();
    resetGame();
    setFeedback("");
    emit("start", {});
  };

  const isGameOver = totalRounds > 0 && roundDeviations.length >= totalRounds;

  const finalResult = scoreCompressionMatch({
    correct: roundDeviations.filter((d) => d <= config.matchThreshold).length,
    total: roundDeviations.length,
    difficulty,
    paramDeviations: roundDeviations,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Compression Match</h2>
        <span className="text-sm text-muted-foreground">
          Round {Math.min(roundIndex + 1, Math.max(1, totalRounds))} / {Math.max(1, totalRounds)}
        </span>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {isGameOver
          ? `Final score: ${finalResult.score}% — ${finalResult.feedback}`
          : "Listen to the reference, dial in your settings, then compare."}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button onClick={playReference} disabled={isPlaying && playingTarget}>
          {isPlaying && playingTarget ? "Playing reference…" : "Play reference"}
        </Button>
        <Button onClick={playPlayer} variant="secondary" disabled={isPlaying && !playingTarget}>
          {isPlaying && !playingTarget ? "Playing yours…" : "Play your settings"}
        </Button>
        <Button onClick={stopPlayback} variant="ghost" disabled={!isPlaying}>
          Stop
        </Button>
      </div>

      {!isGameOver && (
        <div className="flex flex-col gap-4">
          {activeControls.map((control) => (
            <div key={control.key} className="flex flex-col gap-1">
              <label
                htmlFor={`comp-${control.key}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{control.label}</span>
                <span className="text-muted-foreground">
                  {playerValues[control.key] ?? control.min} {control.unit}
                </span>
              </label>
              <Slider
                id={`comp-${control.key}`}
                min={control.min}
                max={control.max}
                step={control.step}
                value={[playerValues[control.key] ?? control.min]}
                onValueChange={(values) => {
                  const next = Array.isArray(values) ? values[0] : values;
                  setValue(control.key, next);
                }}
              />
            </div>
          ))}

          <Button onClick={handleSubmit}>Submit round</Button>
        </div>
      )}

      {feedback && !isGameOver && (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {feedback}
        </p>
      )}

      {isGameOver && (
        <div className="flex flex-col gap-2">
          <p role="status" aria-live="polite" className="text-sm font-medium">
            {finalResult.feedback}
          </p>
          <Button onClick={handleReset}>Play again</Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Round deviations:{" "}
        {roundDeviations.length > 0
          ? roundDeviations.map((d) => `${Math.round(d * 100)}%`).join(", ")
          : "—"}
      </div>
    </div>
  );
}