import * as Tone from "tone";

/**
 * EQ wrapper — for the EQ Match game.
 * Creates a band EQ chain (low shelf, peaking mid, high shelf) using BiquadFilters.
 */

export interface EqBand {
  key: string;
  frequency: number; // Hz
  gain: number; // dB
  type: BiquadFilterType;
}

export const DEFAULT_EQ_BANDS: EqBand[] = [
  { key: "low", frequency: 200, gain: 0, type: "lowshelf" },
  { key: "mid", frequency: 1000, gain: 0, type: "peaking" },
  { key: "high", frequency: 5000, gain: 0, type: "highshelf" },
];

export class Equalizer {
  private filters: Map<string, Tone.Filter> = new Map();
  private input: Tone.Gain;
  private output: Tone.Filter | Tone.Gain;

  constructor(bands: EqBand[] = DEFAULT_EQ_BANDS) {
    this.input = new Tone.Gain(1);
    let prev: Tone.ToneAudioNode = this.input;

    for (const band of bands) {
      const filter = new Tone.Filter({
        frequency: band.frequency,
        gain: band.gain,
        type: band.type,
      });
      this.filters.set(band.key, filter);
      prev.connect(filter);
      prev = filter;
    }

    // `prev` is always a Tone.Filter at this point (bands is never empty).
    this.output = prev as Tone.Filter;
  }

  /** Connect an input node into the EQ chain. */
  connect(input: Tone.ToneAudioNode): void {
    input.connect(this.input);
  }

  /** Get the output node for chaining into the destination. */
  getOutput(): Tone.Filter | Tone.Gain {
    return this.output;
  }

  /** Route the EQ output to the destination. */
  toDestination(): void {
    this.output.toDestination();
  }

  /** Set the gain of a band by its key. */
  setBandGain(key: string, gainDb: number): void {
    const filter = this.filters.get(key);
    if (filter) {
      filter.gain.value = gainDb;
    }
  }

  /** Set all band gains at once from a key → dB map. */
  setBands(gains: Record<string, number>): void {
    for (const [key, gain] of Object.entries(gains)) {
      this.setBandGain(key, gain);
    }
  }

  /** Set gains from an ordered array, matched by position to the constructor bands. */
  setBandGainsArray(gains: number[]): void {
    const bands = Array.from(this.filters.keys());
    gains.forEach((g, i) => {
      if (i < bands.length) this.setBandGain(bands[i], g);
    });
  }

  /** Get the current band gains as a key → dB map. */
  getBandGains(): Record<string, number> {
    const result: Record<string, number> = {};
    this.filters.forEach((f, key) => {
      result[key] = f.gain.value as number;
    });
    return result;
  }

  /** Dispose the EQ chain. Call on unmount to prevent leaks. */
  dispose(): void {
    this.input.dispose();
    this.filters.forEach((f) => f.dispose());
    this.filters.clear();
  }
}