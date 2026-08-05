"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "@/types/game";
import { ensureAudioStarted } from "@/lib/audio/audioContext";
import { Equalizer } from "@/lib/audio/equalizer";
import { NoiseGenerator } from "@/lib/audio/noiseGenerator";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DIFFICULTY_CONFIGS, EQ_BANDS } from "./config";
import {
  averageDeviation,
  computeParamDeviations,
  scoreEqMatch,
} from "./scoring";
import { createEqMatchStore } from "./useEqMatchStore";

/**
 * EQ Match game.
 *
 * The player hears a reference signal shaped by an EQ with secret band gains.
 * They dial in low/mid/high band gains on their own EQ, then compare.
 * Scoring is based on band gain closeness.
 *
 * Audio lifecycle: a fresh NoiseGenerator + Equalizer chain is created per
 * play and disposed on stop/unmount — no node leaks.
 */
export function EqMatchGame({ difficulty, emit }: GameProps) {
  // Per-instance Zustand store (created once per mounted game instance).
  const [useGameStore] = useState(() => createEqMatchStore());

  const roundIndex = useGameStore((s) => s.roundIndex);
  const currentTarget = useGameStore((s) => s.currentTarget);
  const playerValues = useGameStore((s) => s.playerValues);
  const roundDeviations = useGameStore((s) => s.roundDeviations);
  const activeBands = useGameStore((s) => s.activeBands);
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
  const eqRef = useRef<Equalizer | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  // Initialize the game when the difficulty changes.
  useEffect(() => {
    initGame(config.bands, config.rounds);
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
    eqRef.current?.dispose();
    noiseRef.current = null;
    eqRef.current = null;
    setIsPlaying(false);
  };

  /** Build a fresh noise → EQ chain and play it. */
  const playChain = async (gains: Record<string, number>) => {
    await ensureAudioStarted();
    stopPlayback();
    const noise = new NoiseGenerator({ type: "pink", volume: -12 });
    // Build the EQ with the active difficulty bands.
    const eqBands = activeBands.map((band) => ({
      key: band.key,
      frequency: band.frequency,
      gain: gains[band.key] ?? 0,
      type: (band.key === "low"
        ? "lowshelf"
        : band.key === "high"
          ? "highshelf"
          : "peaking") as BiquadFilterType,
    }));
    const eq = new Equalizer(eqBands);
    eq.connect(noise.getOutput());
    eq.toDestination();
    noiseRef.current = noise;
    eqRef.current = eq;
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
    const deviations = computeParamDeviations(playerValues, currentTarget, activeBands);
    const avg = averageDeviation(deviations);
    const matched = avg <= config.matchThreshold;

    submitRound(avg);

    const result = scoreEqMatch({
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

  const finalResult = scoreEqMatch({
    correct: roundDeviations.filter((d) => d <= config.matchThreshold).length,
    total: roundDeviations.length,
    difficulty,
    paramDeviations: roundDeviations,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">EQ Match</h2>
        <span className="text-sm text-muted-foreground">
          Round {Math.min(roundIndex + 1, Math.max(1, totalRounds))} / {Math.max(1, totalRounds)}
        </span>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {isGameOver
          ? `Final score: ${finalResult.score}% — ${finalResult.feedback}`
          : "Listen to the reference, dial in your EQ bands, then compare."}
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
          {activeBands.map((band) => (
            <div key={band.key} className="flex flex-col gap-1">
              <label
                htmlFor={`eq-${band.key}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">
                  {band.label} ({EQ_BANDS[band.key]?.frequency ?? band.frequency} Hz)
                </span>
                <span className="text-muted-foreground">
                  {playerValues[band.key] ?? 0} dB
                </span>
              </label>
              <Slider
                id={`eq-${band.key}`}
                min={band.min}
                max={band.max}
                step={band.step}
                value={[playerValues[band.key] ?? 0]}
                onValueChange={(values) => {
                  const next = Array.isArray(values) ? values[0] : values;
                  setValue(band.key, next);
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