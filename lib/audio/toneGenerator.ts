import * as Tone from "tone";

/**
 * Tone generator — oscillators for ear training and note games.
 * Wraps Tone.Oscillator with a clean lifecycle and frequency control.
 */

export type Waveform = "sine" | "square" | "sawtooth" | "triangle";

export interface ToneGeneratorOptions {
  frequency?: number;
  waveform?: Waveform;
  volume?: number; // dB
}

export class ToneGenerator {
  private osc: Tone.Oscillator;
  private gain: Tone.Gain;
  private started = false;

  constructor(options: ToneGeneratorOptions = {}) {
    const { frequency = 440, waveform = "sine", volume = -12 } = options;
    this.osc = new Tone.Oscillator(frequency, waveform);
    this.gain = new Tone.Gain(volume);
    this.osc.connect(this.gain);
    this.gain.toDestination();
  }

  /** Start the oscillator. Must be preceded by a user gesture. */
  start(): void {
    if (this.started) return;
    this.osc.start();
    this.started = true;
  }

  /** Stop the oscillator. */
  stop(): void {
    if (!this.started) return;
    this.osc.stop();
    this.started = false;
  }

  /** Set the frequency in Hz. */
  setFrequency(freq: number): void {
    this.osc.frequency.value = freq;
  }

  /** Set the waveform. */
  setWaveform(waveform: Waveform): void {
    this.osc.type = waveform;
  }

  /** Set the output volume in dB. */
  setVolume(db: number): void {
    this.gain.gain.value = db;
  }

  /** Play a single note with a short envelope, then stop. */
  playNote(freq: number, duration = 0.5): void {
    this.setFrequency(freq);
    this.start();
    window.setTimeout(() => this.stop(), duration * 1000);
  }

  /** Dispose all nodes. Call on unmount to prevent leaks. */
  dispose(): void {
    this.stop();
    this.osc.dispose();
    this.gain.dispose();
  }
}