import type { PersistedStorageStatus } from '../types/domain';

const HIGH_SCORE_KEY = 'orbit-blocks.high-score';

export type StorageResult = {
  status: PersistedStorageStatus;
  lastError: string | null;
};

export type HighScoreReadResult = StorageResult & {
  highScore: number;
};

function storageError(message: string, error: unknown): string {
  return error instanceof Error ? `${message}: ${error.message}` : message;
}

export function readHighScore(): HighScoreReadResult {
  if (typeof window === 'undefined') {
    return { highScore: 0, status: 'unavailable', lastError: 'localStorage is unavailable outside the browser' };
  }

  try {
    const stored = window.localStorage.getItem(HIGH_SCORE_KEY);
    if (!stored) {
      return { highScore: 0, status: 'available', lastError: null };
    }

    const value = Number.parseInt(stored, 10);
    if (/^\d+$/.test(stored) && Number.isFinite(value)) {
      return { highScore: Math.max(0, value), status: 'available', lastError: null };
    }

    window.localStorage.removeItem(HIGH_SCORE_KEY);
    return {
      highScore: 0,
      status: 'recovered',
      lastError: `Invalid persisted high score "${stored}" was reset`,
    };
  } catch (error) {
    return { highScore: 0, status: 'error', lastError: storageError('Unable to read persisted high score', error) };
  }
}

export function writeHighScore(score: number): StorageResult {
  if (typeof window === 'undefined') {
    return { status: 'unavailable', lastError: 'localStorage is unavailable outside the browser' };
  }

  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(Math.max(0, score)));
    return { status: 'available', lastError: null };
  } catch (error) {
    return { status: 'error', lastError: storageError('Unable to write persisted high score', error) };
  }
}
