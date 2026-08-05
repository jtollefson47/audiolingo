import * as Tone from "tone";

/**
 * Noise generator — white/pink noise for compression and EQ games.
 * Wraps Tone.Noise with a clean lifecycle.
 */

export type NoiseType = "white" | "pink" | "brown";

export interface NoiseGeneratorOptions {
  type?: NoiseType;
  volume?: number; // dB
}

export class NoiseGenerator {
  private noise: Tone.Noise;
  private gain: Tone.Gain;
  private started = false;

  constructor(options: NoiseGeneratorOptions = {}) {
    const { type = "white", volume = -18 } = options;
    this.noise = new Tone.Noise(type);
    this.gain = new Tone.Gain(volume);
    this.noise.connect(this.gain);
  }

  /** Get the output node for chaining into effects (e.g., a Compressor). */
  getOutput(): Tone.Gain {
    return this.gain;
  }

  /** Start the noise source. Must be preceded by a user gesture. */
  start(): void {
    if (this.started) return;
    this.noise.start();
    this.started = true;
  }

  /** Stop the noise source. */
  stop(): void {
    if (!this.started) return;
    this.noise.stop();
    this.started = false;
  }

  /** Set the noise color. */
  setType(type: NoiseType): void {
    this.noise.type = type;
  }

  /** Set the output volume in dB. */
  setVolume(db: number): void {
    this.gain.gain.value = db;
  }

  /** Dispose all nodes. Call on unmount to prevent leaks. */
  dispose(): void {
    this.stop();
    this.noise.dispose();
    this.gain.dispose();
  }
}