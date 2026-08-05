import { describe, expect, it } from "vitest";
import { EQ_BANDS } from "../config";
import {
  averageDeviation,
  computeParamDeviations,
  isRoundMatched,
  normalizeDeviation,
  scoreEqMatch,
} from "../scoring";

const low = EQ_BANDS.low;

describe("normalizeDeviation", () => {
  it("returns 0 for an exact match", () => {
    expect(normalizeDeviation(3, 3, low)).toBe(0);
  });

  it("returns 1 for a max-range deviation", () => {
    // -12..12 range; deviation of 24 → 1
    expect(normalizeDeviation(-12, 12, low)).toBe(1);
  });

  it("returns a proportional value for a partial deviation", () => {
    // range 24; deviation 6 → 0.25
    expect(normalizeDeviation(-6, 0, low)).toBeCloseTo(0.25);
  });

  it("clamps to 1 for out-of-range deviations", () => {
    expect(normalizeDeviation(20, -20, low)).toBe(1);
  });
});

describe("computeParamDeviations", () => {
  it("computes one deviation per band", () => {
    const bands = [EQ_BANDS.low, EQ_BANDS.high];
    const player = { low: 0, high: 3 };
    const target = { low: 0, high: 3 };
    expect(computeParamDeviations(player, target, bands)).toEqual([0, 0]);
  });

  it("computes mixed deviations", () => {
    const bands = [EQ_BANDS.low];
    const player = { low: 6 };
    const target = { low: 0 };
    // range 24, deviation 6 → 0.25
    expect(computeParamDeviations(player, target, bands)[0]).toBeCloseTo(0.25);
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

describe("scoreEqMatch", () => {
  it("scores 100 for a perfect parametric match", () => {
    const result = scoreEqMatch({
      correct: 1,
      total: 1,
      difficulty: "beginner",
      paramDeviations: [0, 0],
    });
    expect(result.score).toBe(100);
    expect(result.stars).toBe(3);
  });

  it("scores 50 for an average deviation of 0.5", () => {
    const result = scoreEqMatch({
      correct: 0,
      total: 1,
      difficulty: "beginner",
      paramDeviations: [0.5],
    });
    expect(result.score).toBe(50);
  });

  it("falls back to correct/total percentage without paramDeviations", () => {
    const result = scoreEqMatch({
      correct: 3,
      total: 4,
      difficulty: "beginner",
    });
    expect(result.score).toBe(75);
    // 75% is above the 70% threshold for 2 stars, but below 90 for 3.
    expect(result.stars).toBe(2);
  });

  it("returns 0 when a fallback game has no attempts", () => {
    const result = scoreEqMatch({
      correct: 0,
      total: 0,
      difficulty: "beginner",
    });
    expect(result.score).toBe(0);
    expect(result.feedback).toBe("No rounds completed yet.");
  });

  it("applies a harder star bar on advanced difficulty", () => {
    const result = scoreEqMatch({
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