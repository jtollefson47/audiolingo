import type { ScoringInput, ScoringResult } from "@/types/game";
import { DIFFICULTY_CONFIGS, type CompressorControl } from "./config";

/**
 * Compute the normalized deviation (0-1) of a player value from the target.
 * 0 = exact match, 1 = max possible deviation within the control range.
 */
export function normalizeDeviation(playerValue: number, targetValue: number, control: CompressorControl): number {
  const range = control.max - control.min;
  if (range <= 0) return 0;
  return Math.min(1, Math.abs(playerValue - targetValue) / range);
}

/**
 * Compute per-control normalized deviations for a whole round.
 * Returns one deviation per control, 0 = perfect, 1 = furthest.
 */
export function computeParamDeviations(
  player: Record<string, number>,
  target: Record<string, number>,
  controls: CompressorControl[],
): number[] {
  return controls.map((control) =>
    normalizeDeviation(player[control.key] ?? 0, target[control.key] ?? 0, control),
  );
}

/** True when a round's deviations are all within the difficulty's match threshold. */
export function isRoundMatched(
  deviations: number[],
  difficulty: ScoringInput["difficulty"],
): boolean {
  const threshold = DIFFICULTY_CONFIGS[difficulty].matchThreshold;
  return deviations.length > 0 && deviations.every((d) => d <= threshold);
}

/** Average of a set of normalized deviations (0-1). */
export function averageDeviation(deviations: number[]): number {
  if (deviations.length === 0) return 1;
  return deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
}

/**
 * Compression Match scoring.
 *
 * If `paramDeviations` is provided, scores based on how close the player's
 * settings are to the target (0 deviation = 100). Otherwise falls back to a
 * correct/total percentage for games that track rounds as binary pass/fail.
 */
export function scoreCompressionMatch(input: ScoringInput): ScoringResult {
  const { correct, total, difficulty, paramDeviations } = input;

  // Parametric scoring: use slider closeness when available.
  if (paramDeviations !== undefined && paramDeviations.length > 0) {
    const avgDev = averageDeviation(paramDeviations);
    const score = Math.max(0, Math.round((1 - avgDev) * 100));
    return {
      score,
      stars: starsForScore(score, difficulty),
      feedback: feedbackForScore(score),
    };
  }

  // Fallback: percentage of matched rounds.
  if (total <= 0) {
    return { score: 0, stars: 0, feedback: "No rounds completed yet." };
  }
  const percentage = Math.round((correct / total) * 100);
  return {
    score: percentage,
    stars: starsForScore(percentage, difficulty),
    feedback: feedbackForScore(percentage),
  };
}

/** Star rating (1-3) from a 0-100 score, adjusted slightly per difficulty. */
export function starsForScore(score: number, difficulty: ScoringInput["difficulty"]): number {
  let stars = 1;
  if (score >= 90) stars = 3;
  else if (score >= 70) stars = 2;

  // Tighter match thresholds on higher difficulties require a higher bar.
  if (difficulty === "advanced" && score < 95) stars = Math.min(stars, 2);
  else if (difficulty === "intermediate" && score < 85) stars = Math.min(stars, 2);

  return stars;
}

/** Feedback message from a 0-100 score. */
export function feedbackForScore(score: number): string {
  if (score >= 90) return "Excellent match!" ;
  if (score >= 70) return "Close — fine-tune your settings.";
  return "Keep listening and adjusting.";
}