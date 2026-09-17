export interface SafeWordPair { original: string; familyMember: string }
export const FAMILY_FALLBACK: SafeWordPair[] = [
 { original: 'dent', familyMember: 'dentiste' }, { original: 'jardin', familyMember: 'jardinier' },
 { original: 'chant', familyMember: 'chanter' }, { original: 'fleur', familyMember: 'fleuriste' },
 { original: 'lait', familyMember: 'laitier' }, { original: 'terre', familyMember: 'terrain' },
 { original: 'long', familyMember: 'longueur' }, { original: 'montagne', familyMember: 'montagnard' },
];
export function sanitizeWordPairs(pairs: SafeWordPair[], words: string[]): SafeWordPair[] {
 const normalize = (word: string) => word.trim().toLocaleLowerCase('fr');
 const allowed = new Set(words.map(normalize)); const used = new Set<string>();
 return pairs.filter(pair => {
   if (typeof pair?.original !== 'string' || typeof pair?.familyMember !== 'string') return false;
   const a = normalize(pair.original), b = normalize(pair.familyMember);
   if (!a || !b || a === b || !allowed.has(a) || used.has(a) || used.has(b)) return false;
   used.add(a); used.add(b); return true;
 }).map(pair => ({ original: pair.original.trim(), familyMember: pair.familyMember.trim() }));
}
