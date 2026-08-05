import * as Tone from "tone";

/**
 * Shared AudioContext lifecycle manager.
 *
 * All audio in Audiolingo flows through this singleton so we can:
 * - Lazily create the context on first user gesture (autoplay policy)
 * - Suspend/resume to save battery on mobile
 * - Cleanly dispose on teardown
 */

let started = false;

/** Ensure the Tone.js context is started. Must be called from a user gesture. */
export async function ensureAudioStarted(): Promise<void> {
  if (started) return;
  await Tone.start();
  started = true;
}

/** True once the audio context has been started by a user gesture. */
export function isAudioStarted(): boolean {
  return started;
}

/** Suspend the audio context to save battery (e.g., on app background). */
export function suspendAudio(): void {
  const ctx = Tone.getContext().rawContext as AudioContext;
  if (ctx.state === "running") {
    void ctx.suspend();
  }
}

/** Resume the audio context (e.g., on app foreground). */
export async function resumeAudio(): Promise<void> {
  const ctx = Tone.getContext().rawContext as AudioContext;
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

/** Dispose the audio context and reset the started flag. */
export function disposeAudio(): void {
  void Tone.getContext().dispose();
  started = false;
}

/** Get the current audio context state. */
export function getAudioState(): AudioContextState {
  return (Tone.getContext().rawContext as AudioContext).state;
}
