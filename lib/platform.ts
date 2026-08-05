/**
 * Platform abstraction layer.
 *
 * Audiolingo targets web-first with clean extraction to React Native / Expo.
 * All platform-specific code (storage, user identity, audio context) goes
 * through this module so the web and native builds only swap this one file.
 *
 * Web implementation uses localStorage + web APIs.
 * Future native implementation will use AsyncStorage + native APIs.
 */

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const webStorage: StorageAdapter = {
  getItem: (key) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

/** The active storage adapter (swapped for native builds). */
export const storage: StorageAdapter = webStorage;

/** Get the current user identity. Returns null when anonymous. */
export function getUserId(): string | null {
  return storage.getItem("audiolingo:userId");
}

/** Set the current user identity. */
export function setUserId(id: string): void {
  storage.setItem("audiolingo:userId", id);
}

/** Generate a persistent anonymous device id. */
export function getOrCreateDeviceId(): string {
  const KEY = "audiolingo:deviceId";
  const existing = storage.getItem(KEY);
  if (existing) return existing;
  const id = `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  storage.setItem(KEY, id);
  return id;
}

/** True when running in a native environment (React Native/Expo). */
export function isNative(): boolean {
  return typeof window === "undefined" && typeof globalThis !== "undefined";
}