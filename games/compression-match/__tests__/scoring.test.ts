import { describe, expect, it } from "vitest";
import { COMPRESSION_CONTROLS } from "../config";
import {
  averageDeviation,
  computeParamDeviations,
  isRoundMatched,
  normalizeDeviation,
  scoreCompressionMatch,
} from "../scoring";

const threshold = COMPRESSION_CONTROLS.threshold;

describe("normalizeDeviation", () => {
  it("returns 0 for an exact match", () => {
    expect(normalizeDeviation(-30, -30, threshold)).toBe(0);
  });

  it("returns 1 for a max-range deviation", () => {
    expect(normalizeDeviation(0, -60, threshold)).toBe(1);
  });

  it("returns a proportional value for a partial deviation", () => {
    // -60..0 range; -45 is 1/4 of the range from -60
    expect(normalizeDeviation(-45, -60, threshold)).toBeCloseTo(0.25);
  });

  it("clamps to 1 for out-of-range deviations", () => {
    expect(normalizeDeviation(20, -60, threshold)).toBe(1);
  });
});

describe("computeParamDeviations", () => {
  it("computes one deviation per control", () => {
    const controls = [COMPRESSION_CONTROLS.threshold, COMPRESSION_CONTROLS.ratio];
    const player = { threshold: -30, ratio: 4 };
    const target = { threshold: -30, ratio: 4 };
    expect(computeParamDeviations(player, target, controls)).toEqual([0, 0]);
  });

  it("computes mixed deviations", () => {
    const controls = [COMPRESSION_CONTROLS.threshold];
    const player = { threshold: -45 };
    const target = { threshold: -30 };
    // range 0..-60, deviation 15 → 0.25
    expect(computeParamDeviations(player, target, controls)[0]).toBeCloseTo(0.25);
  });
});

describe("isRoundMatched", () => {
  it("returns true when all deviations are within threshold", () => {
    expect(isRoundMatched([0.1, 0.2], "beginner")).toBe(true);
  });

  it("returns false when any deviation exceeds threshold", () => {
    expect(isRoundMatched([0.1, 0.5], "beginner")).toBe(false);
  });

  it("returns false for an empty array", () => {
    expect(isRoundMatched([], "beginner")).toBe(false);
  });
});

describe("averageDeviation", () => {
  it("averages a set of deviations", () => {
    expect(averageDeviation([0.1, 0.3])).toBeCloseTo(0.2);
  });

  it("returns 1 for no deviations (worst possible)", () => {
    expect(averageDeviation([])).toBe(1);
  });
});

describe("scoreCompressionMatch", () => {
  it("scores 100 for a perfect parametric match", () => {
    const result = scoreCompressionMatch({
      correct: 1,
      total: 1,
      difficulty: "beginner",
      paramDeviations: [0, 0],
    });
    expect(result.score).toBe(100);
    expect(result.stars).toBe(3);
  });

  it("scores 50 for an average deviation of 0.5", () => {
    const result = scoreCompressionMatch({
      correct: 0,
      total: 1,
      difficulty: "beginner",
      paramDeviations: [0.5],
    });
    expect(result.score).toBe(50);
  });

  it("falls back to correct/total percentage without paramDeviations", () => {
    const result = scoreCompressionMatch({
      correct: 2,
      total: 4,
      difficulty: "beginner",
    });
    expect(result.score).toBe(50);
    // 50% is below the 70% threshold for 2 stars — star bar is stricter than the example game.
    expect(result.stars).toBe(1);
  });

  it("returns 0 when a fallback game has no attempts", () => {
    const result = scoreCompressionMatch({
      correct: 0,
      total: 0,
      difficulty: "beginner",
    });
    expect(result.score).toBe(0);
    expect(result.feedback).toBe("No rounds completed yet.");
  });

  it("applies a harder star bar on advanced difficulty", () => {
    const result = scoreCompressionMatch({
      correct: 0,
      total: 1,
      difficulty: "advanced",
      paramDeviations: [0.12],
    });
    // 88 score but advanced requires 95 for 3 stars
    expect(result.score).toBe(88);
    expect(result.stars).toBe(2);
  });
});