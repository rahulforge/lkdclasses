export const CACHE_TTL_MS = 5 * 60 * 1000;

const isBrowser = typeof window !== "undefined";

type CacheRecord<T> = {
  ts: number;
  data: T;
};

export function getCached<T>(key: string, ttlMs = CACHE_TTL_MS): T | null {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheRecord<T>;
    if (Date.now() - parsed.ts > ttlMs) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  if (!isBrowser) return;
  const value: CacheRecord<T> = { ts: Date.now(), data };
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function clearCached(key: string): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(key);
}
