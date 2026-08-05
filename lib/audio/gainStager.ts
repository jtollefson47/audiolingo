import * as Tone from "tone";

/**
 * Gain stager — for the Gain Staging game.
 * Provides a gain chain with metering to teach proper gain staging.
 */

export interface GainStagerOptions {
  inputGain?: number; // dB, default 0
  outputGain?: number; // dB, default 0
}

export class GainStager {
  private input: Tone.Gain;
  private output: Tone.Gain;
  private meter: Tone.Meter;

  constructor(options: GainStagerOptions = {}) {
    const { inputGain = 0, outputGain = 0 } = options;
    this.input = new Tone.Gain(inputGain);
    this.output = new Tone.Gain(outputGain);
    this.meter = new Tone.Meter();

    this.input.connect(this.output);
    this.output.connect(this.meter);
    this.output.toDestination();
  }

  /** Connect an input node into the gain chain. */
  connect(input: Tone.ToneAudioNode): void {
    input.connect(this.input);
  }

  /** Set the input gain in dB. */
  setInputGain(db: number): void {
    this.input.gain.value = db;
  }

  /** Set the output gain in dB. */
  setOutputGain(db: number): void {
    this.output.gain.value = db;
  }

  /** Get the current input gain in dB. */
  getInputGain(): number {
    return this.input.gain.value as number;
  }

  /** Get the current output gain in dB. */
  getOutputGain(): number {
    return this.output.gain.value as number;
  }

  /** Get the current signal level in dB (from the meter). */
  getLevel(): number {
    return this.meter.getValue() as number;
  }

  /** Dispose the gain chain. Call on unmount to prevent leaks. */
  dispose(): void {
    this.input.dispose();
    this.output.dispose();
    this.meter.dispose();
  }
}