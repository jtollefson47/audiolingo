import type { ScoringInput, ScoringResult } from "@/types/game";

/**
 * Example scoring: percentage of correct answers, with a star rating.
 * Pure function — unit-testable in isolation.
 */
export function scoreExampleGame(input: ScoringInput): ScoringResult {
  const { correct, total, difficulty } = input;

  if (total <= 0) {
    return { score: 0, stars: 0, feedback: "No attempts yet." };
  }

  const percentage = Math.round((correct / total) * 100);

  // Star rating based on percentage, adjusted slightly by difficulty.
  let stars = 1;
  if (percentage >= 80) stars = 3;
  else if (percentage >= 50) stars = 2;

  // Advanced difficulty requires a higher bar for 3 stars.
  if (difficulty === "advanced" && percentage < 90) {
    stars = Math.min(stars, 2);
  }

  const feedback =
    stars === 3 ? "Excellent!" : stars === 2 ? "Good job, keep practicing." : "Keep trying!";

  return { score: percentage, stars, feedback };
}