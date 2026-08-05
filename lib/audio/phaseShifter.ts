import * as Tone from "tone";

/**
 * Phase shifter — for the Phase Align game.
 * Uses an AllPassFilter to introduce phase shift on a signal.
 */

export interface PhaseShifterOptions {
  phaseDegrees?: number; // 0-360
  frequency?: number; // Hz, base frequency of the allpass
}

export class PhaseShifter {
  private allpass: Tone.Filter;
  private input: Tone.Gain;

  constructor(options: PhaseShifterOptions = {}) {
    const { phaseDegrees = 0, frequency = 1000 } = options;
    this.input = new Tone.Gain(1);
    this.allpass = new Tone.Filter({
      frequency,
      type: "allpass",
    });
    this.input.connect(this.allpass);
    this.allpass.toDestination();
    this.setPhase(phaseDegrees);
  }

  /** Connect an input node into the phase shifter. */
  connect(input: Tone.ToneAudioNode): void {
    input.connect(this.input);
  }

  /** Set the phase shift in degrees (0-360). */
  setPhase(degrees: number): void {
    // Approximate phase shift via allpass frequency. Higher frequency = more phase shift.
    const clamped = Math.max(0, Math.min(360, degrees));
    const freq = 100 + (clamped / 360) * 4000;
    this.allpass.frequency.value = freq;
  }

  /** Get the current phase shift in degrees. */
  getPhase(): number {
    const freq = this.allpass.frequency.value as number;
    return Math.round(((freq - 100) / 4000) * 360);
  }

  /** Dispose the phase shifter. Call on unmount to prevent leaks. */
  dispose(): void {
    this.input.dispose();
    this.allpass.dispose();
  }
}