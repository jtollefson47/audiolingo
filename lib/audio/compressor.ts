import * as Tone from "tone";

/**
 * Compressor wrapper — for the Compression Match game.
 * Wraps Tone.Compressor with a clean lifecycle and parameter control.
 */

export interface CompressorParams {
  threshold?: number; // dB, default -24
  ratio?: number; // default 12
  attack?: number; // seconds, default 0.003
  release?: number; // seconds, default 0.25
  knee?: number; // dB, default 30
}

export class Compressor {
  private comp: Tone.Compressor;

  constructor(params: CompressorParams = {}) {
    const { threshold = -24, ratio = 12, attack = 0.003, release = 0.25, knee = 30 } = params;
    this.comp = new Tone.Compressor({
      threshold,
      ratio,
      attack,
      release,
      knee,
    });
  }

  /** Connect an input node into the compressor. */
  connect(input: Tone.ToneAudioNode): void {
    input.connect(this.comp);
  }

  /** Route the compressor output to the destination. */
  toDestination(): void {
    this.comp.toDestination();
  }

  /** Set the threshold in dB. */
  setThreshold(db: number): void {
    this.comp.threshold.value = db;
  }

  /** Set the compression ratio. */
  setRatio(ratio: number): void {
    this.comp.ratio.value = ratio;
  }

  /** Set the attack time in seconds. */
  setAttack(seconds: number): void {
    this.comp.attack.value = seconds;
  }

  /** Set the release time in seconds. */
  setRelease(seconds: number): void {
    this.comp.release.value = seconds;
  }

  /** Set the knee width in dB. */
  setKnee(db: number): void {
    this.comp.knee.value = db;
  }

  /** Get the current parameter values. */
  getParams(): Required<CompressorParams> {
    return {
      threshold: this.comp.threshold.value,
      ratio: this.comp.ratio.value,
      attack: this.comp.attack.get() as unknown as number,
      release: this.comp.release.get() as unknown as number,
      knee: this.comp.knee.value,
    };
  }

  /** Dispose the compressor. Call on unmount to prevent leaks. */
  dispose(): void {
    this.comp.dispose();
  }
}