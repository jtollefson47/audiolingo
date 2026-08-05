import { describe, expect, it } from "vitest";
import {
  midiToFreq,
  freqToMidi,
  midiToNoteName,
  noteNameToMidi,
  noteNameToFreq,
  midiToOctave,
  midiToPitchClass,
  midiRange,
} from "../musicTheory";

describe("musicTheory", () => {
  describe("midiToFreq", () => {
    it("converts A4 (MIDI 69) to 440 Hz", () => {
      expect(midiToFreq(69)).toBeCloseTo(440, 0);
    });

    it("converts middle C (MIDI 60) to ~261.63 Hz", () => {
      expect(midiToFreq(60)).toBeCloseTo(261.63, 1);
    });
  });

  describe("freqToMidi", () => {
    it("converts 440 Hz to MIDI 69", () => {
      expect(freqToMidi(440)).toBe(69);
    });

    it("converts 261.63 Hz to MIDI 60", () => {
      expect(freqToMidi(261.63)).toBe(60);
    });
  });

  describe("midiToNoteName", () => {
    it("converts MIDI 69 to A4", () => {
      expect(midiToNoteName(69)).toMatch(/A4/);
    });

    it("converts MIDI 60 to C4", () => {
      expect(midiToNoteName(60)).toMatch(/C4/);
    });
  });

  describe("noteNameToMidi", () => {
    it("converts A4 to MIDI 69", () => {
      expect(noteNameToMidi("A4")).toBe(69);
    });

    it("converts C4 to MIDI 60", () => {
      expect(noteNameToMidi("C4")).toBe(60);
    });
  });

  describe("noteNameToFreq", () => {
    it("converts A4 to ~440 Hz", () => {
      expect(noteNameToFreq("A4")).toBeCloseTo(440, 0);
    });

    it("converts C4 to ~261.63 Hz", () => {
      expect(noteNameToFreq("C4")).toBeCloseTo(261.63, 1);
    });
  });

  describe("midiToOctave", () => {
    it("returns 4 for MIDI 69 (A4)", () => {
      expect(midiToOctave(69)).toBe(4);
    });

    it("returns -1 for MIDI 0 (C-1)", () => {
      expect(midiToOctave(0)).toBe(-1);
    });
  });

  describe("midiToPitchClass", () => {
    it("returns 9 for A", () => {
      expect(midiToPitchClass(69)).toBe(9);
    });

    it("returns 0 for C", () => {
      expect(midiToPitchClass(60)).toBe(0);
    });
  });

  describe("midiRange", () => {
    it("generates a 13-note range from 60 to 72", () => {
      const range = midiRange(60, 72);
      expect(range).toHaveLength(13);
      expect(range[0]).toBe(60);
      expect(range[12]).toBe(72);
    });
  });
});