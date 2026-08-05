import * as Tone from "tone";

/**
 * Rhythm clock — for the Rhythm Match game.
 * Uses Tone.Transport for sample-accurate scheduling (not setInterval).
 */

export interface RhythmClockOptions {
  bpm?: number; // default 120
}

export class RhythmClock {
  private transport = Tone.getTransport();
  private bpm: number;

  constructor(options: RhythmClockOptions = {}) {
    const { bpm = 120 } = options;
    this.bpm = bpm;
    this.transport.bpm.value = bpm;
  }

  /** Start the transport. Must be preceded by a user gesture. */
  start(): void {
    this.transport.start();
  }

  /** Stop the transport. */
  stop(): void {
    this.transport.stop();
  }

  /** Pause the transport (keeps position). */
  pause(): void {
    this.transport.pause();
  }

  /** Reset the transport to the start. */
  reset(): void {
    this.transport.stop();
    this.transport.position = 0;
  }

  /** Set the tempo in BPM. */
  setBpm(bpm: number): void {
    this.bpm = bpm;
    this.transport.bpm.value = bpm;
  }

  /** Get the current BPM. */
  getBpm(): number {
    return this.bpm;
  }

  /** Schedule a callback on a repeating subdivision (e.g., "8n" = eighth notes). */
  scheduleRepeat(callback: (time: number) => void, interval: string): void {
    this.transport.scheduleRepeat(callback, interval);
  }

  /** Schedule a one-off callback at a time (e.g., "0:2:0"). */
  scheduleOnce(callback: (time: number) => void, time: string): void {
    this.transport.scheduleOnce(callback, time);
  }

  /** Clear all scheduled events. */
  clear(): void {
    this.transport.clear(0);
  }

  /** Dispose the transport. Call on unmount to prevent leaks. */
  dispose(): void {
    this.clear();
    this.stop();
  }
}