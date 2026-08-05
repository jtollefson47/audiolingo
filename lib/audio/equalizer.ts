import * as Tone from "tone";

/**
 * EQ wrapper — for the EQ Match game.
 * Creates a 3-band EQ chain (low shelf, peaking mid, high shelf) using BiquadFilters.
 */

export interface EqBand {
  frequency: number; // Hz
  gain: number; // dB
  type: BiquadFilterType;
}

export const DEFAULT_EQ_BANDS: EqBand[] = [
  { frequency: 200, gain: 0, type: "lowshelf" },
  { frequency: 1000, gain: 0, type: "peaking" },
  { frequency: 5000, gain: 0, type: "highshelf" },
];

export class Equalizer {
  private filters: Tone.Filter[] = [];
  private input: Tone.Gain;

  constructor(bands: EqBand[] = DEFAULT_EQ_BANDS) {
    this.input = new Tone.Gain(1);
    let prev: Tone.ToneAudioNode = this.input;

    for (const band of bands) {
      const filter = new Tone.Filter({
        frequency: band.frequency,
        gain: band.gain,
        type: band.type,
      });
      this.filters.push(filter);
      prev.connect(filter);
      prev = filter;
    }

    prev.toDestination();
  }

  /** Connect an input node into the EQ chain. */
  connect(input: Tone.ToneAudioNode): void {
    input.connect(this.input);
  }

  /** Set the gain of a band by its frequency. */
  setBandGain(bandIndex: number, gainDb: number): void {
    const filter = this.filters[bandIndex];
    if (filter) {
      filter.gain.value = gainDb;
    }
  }

  /** Set all band gains at once. */
  setBands(gains: number[]): void {
    gains.forEach((g, i) => this.setBandGain(i, g));
  }

  /** Get the current band gains. */
  getBandGains(): number[] {
    return this.filters.map((f) => f.gain.value as number);
  }

  /** Dispose the EQ chain. Call on unmount to prevent leaks. */
  dispose(): void {
    this.input.dispose();
    this.filters.forEach((f) => f.dispose());
    this.filters = [];
  }
}