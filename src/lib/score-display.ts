import type { Score } from '../services/scores-server';
export function scoreUnit(score: Pick<Score, 'skill' | 'metadata'>): 'percent' | 'MCLM' | 'count' | 'completion' | 'unknown' {
 if (score.metadata?.unit) return score.metadata.unit;
 if (score.skill === 'decoding') return 'completion';
 if (score.skill === 'tables-multiplication') return 'unknown';
 if (['complement-dix','soustraction-mentale'].includes(score.skill)) return 'count';
 return ['fluence','reading-race'].includes(score.skill) ? 'MCLM' : 'percent';
}
export function formatScore(score: Pick<Score, 'skill' | 'metadata' | 'score'>): string {
 const unit = scoreUnit(score);
 if (unit === 'completion') return 'Atelier achevé';
 if (unit === 'unknown') return `${Math.round(score.score)} (unité non renseignée)`;
 return `${Math.round(score.score)}${unit === 'percent' ? '%' : unit === 'MCLM' ? ' MCLM' : ' réponses'}`;
}
