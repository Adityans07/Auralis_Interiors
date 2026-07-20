/**
 * Free-generation tracking — DEMO UX ONLY.
 *
 * The business rule "first AI design generation is free, subsequent ones are
 * paid" will be enforced by the backend via
 *   GET /api/user/free-generation-status
 * once auth exists. For the frontend demo we approximate it with localStorage.
 *
 * Do NOT rely on this for anything security-sensitive — it is trivially bypassed
 * and exists purely to demonstrate the paywall UX.
 */

import { FREE_GEN_STORAGE_KEY } from "../constants";
import type { FreeGenerationStatus } from "../types";

interface StoredState {
  generationsUsed: number;
}

function read(): StoredState {
  if (typeof window === "undefined") return { generationsUsed: 0 };
  try {
    const raw = window.localStorage.getItem(FREE_GEN_STORAGE_KEY);
    if (!raw) return { generationsUsed: 0 };
    const parsed = JSON.parse(raw) as StoredState;
    return { generationsUsed: parsed.generationsUsed ?? 0 };
  } catch {
    return { generationsUsed: 0 };
  }
}

function write(state: StoredState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FREE_GEN_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/** Mirrors GET /api/user/free-generation-status. */
export function getFreeGenerationStatus(): FreeGenerationStatus {
  const { generationsUsed } = read();
  return {
    hasUsedFreeGeneration: generationsUsed > 0,
    generationsUsed,
  };
}

/** Record that a generation happened (called after a successful mock generate). */
export function recordGeneration(): FreeGenerationStatus {
  const state = read();
  const next = { generationsUsed: state.generationsUsed + 1 };
  write(next);
  return {
    hasUsedFreeGeneration: next.generationsUsed > 0,
    generationsUsed: next.generationsUsed,
  };
}

/** Reset — handy for demos/testing. */
export function resetFreeGeneration() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(FREE_GEN_STORAGE_KEY);
}
