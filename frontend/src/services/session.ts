import { useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('kurio:session-changed', listener);
  window.addEventListener('kurio:session-expired', listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener('kurio:session-changed', listener);
    window.removeEventListener('kurio:session-expired', listener);
    window.removeEventListener('storage', listener);
  };
};

export const useSessionToken = () => useSyncExternalStore(subscribe, () => localStorage.getItem('kurio_token'), () => null);

export const sessionStorageKey = (name: string) => `${name}:${localStorage.getItem('kurio_token') ?? 'guest'}`;

export function readStored<T>(key: string): T | undefined {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') as T | undefined; } catch { localStorage.removeItem(key); return undefined; }
}
