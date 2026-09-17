export function calculateMCLM(wordsRead: number, seconds: number, errors: number): number {
 if (!Number.isFinite(seconds) || seconds <= 0) return 0;
 return Math.round(Math.max(0, wordsRead - Math.max(0, errors)) * 60 / seconds);
}

export function readingSeconds(accumulatedMs: number, startedAt: number | null, now: number): number {
 return Math.floor((accumulatedMs + (startedAt === null ? 0 : Math.max(0, now - startedAt))) / 1000);
}
