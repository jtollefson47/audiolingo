import { Note } from "@tonaljs/tonal";

/**
 * Music theory helpers — for the Keyboard Note Match game.
 * Wraps @tonaljs/tonal for note ↔ frequency ↔ MIDI conversions.
 */

/** Convert a MIDI note number to a frequency in Hz. */
export function midiToFreq(midi: number): number {
  return Note.freq(Note.fromMidi(midi)) ?? 440;
}

/** Convert a frequency in Hz to the nearest MIDI note number. */
export function freqToMidi(freq: number): number {
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

/** Convert a MIDI note number to a note name (e.g., "A4"). */
export function midiToNoteName(midi: number): string {
  return Note.fromMidi(midi);
}

/** Convert a note name (e.g., "A4") to a MIDI note number. */
export function noteNameToMidi(name: string): number {
  return Note.midi(name) ?? 69;
}

/** Convert a note name (e.g., "A4") to a frequency in Hz. */
export function noteNameToFreq(name: string): number {
  return Note.freq(name) ?? 440;
}

/** Get the octave of a MIDI note number. */
export function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/** Get the pitch class (0-11) of a MIDI note number. */
export function midiToPitchClass(midi: number): number {
  return midi % 12;
}

/** Generate a range of MIDI note numbers for a keyboard (e.g., 60-72). */
export function midiRange(start: number, end: number): number[] {
  const notes: number[] = [];
  for (let m = start; m <= end; m++) notes.push(m);
  return notes;
}