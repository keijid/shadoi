import type { PersistedState } from '../types';

const LS_KEY = 'shadoi.state.v1';

export function loadPersisted(): PersistedState {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function savePersisted(state: PersistedState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode, quota) — practice still works, just not saved */
  }
}

export function dayKey(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function dayGap(a: string, b: string): number {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export function shortLabel(d: Date): string {
  return d.getMonth() + 1 + '/' + d.getDate();
}
