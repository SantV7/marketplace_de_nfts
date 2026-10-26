import { useSyncExternalStore } from 'react';

const query = window.matchMedia('(max-width: 767px)');
const subscribe = (listener: () => void) => {
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};
export const useMobile = () => useSyncExternalStore(subscribe, () => query.matches, () => false);
