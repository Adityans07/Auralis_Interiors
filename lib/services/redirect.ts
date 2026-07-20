/**
 * Small helper to preserve an intended destination across the mock auth flow.
 * (Frontend-only; the real app will likely use a `callbackUrl` query param.)
 */
import { REDIRECT_STORAGE_KEY } from "../constants";

export function setRedirectIntent(path: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REDIRECT_STORAGE_KEY, path);
  } catch {
    /* ignore */
  }
}

export function consumeRedirectIntent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(REDIRECT_STORAGE_KEY);
    if (v) window.localStorage.removeItem(REDIRECT_STORAGE_KEY);
    return v;
  } catch {
    return null;
  }
}
