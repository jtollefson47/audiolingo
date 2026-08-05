import { describe, expect, it } from "vitest";
import type { ScoringInput } from "@/types/game";
import { scoreExampleGame } from "../scoring";

describe("scoreExampleGame", () => {
  it("returns 0 score with no attempts", () => {
    const result = scoreExampleGame({ correct: 0, total: 0, difficulty: "beginner" });
    expect(result.score).toBe(0);
    expect(result.stars).toBe(0);
  });

  it("returns 100% when all answers are correct", () => {
    const input: ScoringInput = { correct: 5, total: 5, difficulty: "beginner" };
    const result = scoreExampleGame(input);
    expect(result.score).toBe(100);
    expect(result.stars).toBe(3);
    expect(result.feedback).toBe("Excellent!");
  });

  it("awards 3 stars at 80% on beginner difficulty", () => {
    const result = scoreExampleGame({ correct: 4, total: 5, difficulty: "beginner" });
    expect(result.score).toBe(80);
    expect(result.stars).toBe(3);
  });

  it("caps stars at 2 below 90% on advanced difficulty", () => {
    const result = scoreExampleGame({ correct: 4, total: 5, difficulty: "advanced" });
    expect(result.score).toBe(80);
    expect(result.stars).toBe(2);
  });

  it("awards 1 star below 50%", () => {
    const result = scoreExampleGame({ correct: 2, total: 5, difficulty: "intermediate" });
    expect(result.score).toBe(40);
    expect(result.stars).toBe(1);
    expect(result.feedback).toBe("Keep trying!");
  });
});