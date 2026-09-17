/** Restricted arithmetic: no eval, identifiers, calls, or executable input. */
export function parseSchoolCalculation(source: string): { value: number; numbers: number[]; operators: string[] } | null {
  const expression = source.replace(/\s/g, '').replace(/,/g, '.').replace(/−/g, '-');
  const parts = expression.split('=');
  if (parts.length > 2) return null;
  const tokens = parts[0].match(/[+-]?\d+(?:\.\d+)?/g);
  if (!tokens || tokens.join('') !== parts[0]) return null;
  const numbers = tokens.map(Number);
  if (numbers.some(n => !Number.isFinite(n))) return null;
  const value = numbers.reduce((sum, n) => sum + n, 0);
  if (parts.length === 2 && (!/^[+-]?\d+(?:\.\d+)?$/.test(parts[1]) || Math.abs(Number(parts[1]) - value) > 1e-8)) return null;
  return { value, numbers, operators: tokens.slice(1).map(t => t[0]) };
}

export function validSchoolCalculation(source: string, expected: number, data?: number[], operation?: string): boolean {
  const parsed = parseSchoolCalculation(source);
  if (!parsed || parsed.numbers.length < 2 || Math.abs(parsed.value - expected) > 1e-8) return false;
  if (data?.length) {
    const supplied = parsed.numbers.map(Math.abs).sort((a,b) => a-b);
    const required = data.map(Math.abs).sort((a,b) => a-b);
    if (supplied.length !== required.length || supplied.some((n,i) => Math.abs(n-required[i]) > 1e-8)) return false;
  }
  return !operation || operation !== 'subtraction' || parsed.operators.includes('-') || parsed.numbers[0] < 0;
}

export function normalizeMarketPrice(price: number, level: string): number {
  const finite = Number.isFinite(price) ? price : 1;
  return level === 'D' ? Math.max(0.01, Math.min(99.99, Math.round(finite * 100) / 100))
    : Math.max(1, Math.min(level === 'B' ? 19 : 99, Math.round(finite)));
}

export function sameSchoolAnswer(input: string, expected: string): boolean {
  const clean = (s: string) => s.trim().toLowerCase().replace(',', '.');
  const a = clean(input), b = clean(expected);
  const numeric = /^[+-]?\d+(?:\.\d+)?$/;
  return numeric.test(a) && numeric.test(b) ? Math.abs(Number(a) - Number(b)) < 1e-8 : a === b;
}

type Performance = Record<string, { attempts: ('success' | 'failure')[] }>;
export function mergeMathPerformance(history: Performance, session: Performance): Performance {
  const merged: Performance = {};
  for (const id of new Set([...Object.keys(history), ...Object.keys(session)])) {
    merged[id] = { attempts: [...(history[id]?.attempts || []), ...(session[id]?.attempts || [])] };
  }
  return merged;
}
