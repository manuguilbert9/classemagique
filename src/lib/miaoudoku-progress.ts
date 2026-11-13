type ProgressStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** Separate keys make simultaneous wins in different tabs independent writes. */
export function readCompletedLevels(storage: Pick<ProgressStorage, 'getItem'>, prefix: string, levelIds: readonly string[]): string[] {
  try {
    return levelIds.filter(id => storage.getItem(`${prefix}:level:${id}`) === '1');
  } catch {
    return [];
  }
}

export function recordCompletedLevel(storage: Pick<ProgressStorage, 'setItem'>, prefix: string, levelId: string): boolean {
  try {
    storage.setItem(`${prefix}:level:${levelId}`, '1');
    return true;
  } catch {
    return false;
  }
}
