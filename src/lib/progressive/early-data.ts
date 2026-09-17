export type IllustratedObject = { word: string; icon: string };
const cup = { word: 'tasse', icon: '☕' };
const pencil = { word: 'crayon', icon: '✏️' };
const shoe = { word: 'chaussure', icon: '👟' };
const spoon = { word: 'cuillère', icon: '🥄' };
const plate = { word: 'assiette', icon: '🍽️' };
const toothbrush = { word: 'brosse à dents', icon: '🪥' };
const comb = { word: 'peigne', icon: '🪮' };
export function usefulObject(round: number) {
  const items = [
    { prompt: "J’ai soif. Quel objet me permet de boire ?", expected: cup.word, choices: [cup, shoe], explanation: 'La tasse contient la boisson. Je la porte à ma bouche pour boire.' },
    { prompt: 'Je veux tracer un trait. Quel objet me permet de dessiner ?', expected: pencil.word, choices: [spoon, pencil], explanation: 'La pointe du crayon laisse une trace sur la feuille.' },
    { prompt: 'Je veux manger ma soupe. Quel objet me permet de la prendre ?', expected: spoon.word, choices: [plate, shoe, spoon], explanation: 'La cuillère permet de prendre un peu de soupe et de la porter à ma bouche.' },
    { prompt: 'Je veux nettoyer mes dents. Quel objet dois-je prendre ?', expected: toothbrush.word, choices: [comb, toothbrush, pencil], explanation: 'Je frotte mes dents avec la brosse à dents pour les nettoyer.' },
  ];
  return items[round % items.length];
}
// The historical bank has no magic theme. These six local pictograms are the
// agreed provisional set; the exact pictures from the classroom were not supplied.
export const MAGIC_OBJECTS: IllustratedObject[] = [
  { word: 'lapin', icon: '🐇' }, { word: 'chapeau', icon: '🎩' },
  { word: 'baguette', icon: '🪄' }, { word: 'étoile', icon: '⭐' },
  { word: 'fleur', icon: '🌷' }, { word: 'carte', icon: '🃏' },
];
export function actionPair(round: number): [string, string] {
  const pairs: [string, string][] = [['lapin', 'chapeau'], ['étoile', 'baguette'], ['fleur', 'carte'], ['chapeau', 'lapin']];
  return pairs[round % pairs.length];
}
export const pairingCount = (round: number) => [2, 3, 4, 4][round % 4];
export type Pair = { flower: number; rabbit: number };
export function addPair(pairs: Pair[], flower: number, rabbit: number, count: number): Pair[] {
  if (!Number.isInteger(flower) || !Number.isInteger(rabbit) || flower < 0 || flower > count || rabbit < 0 || rabbit >= count || pairs.some(p => p.flower === flower || p.rabbit === rabbit)) return pairs;
  return [...pairs, { flower, rabbit }];
}
export function compareCollections(round: number) {
  const [left, right] = [[2, 3], [4, 2], [3, 3], [1, 4]][round % 4];
  return { left, right, expected: left === right ? 'autant' : left > right ? 'gauche' : 'droite' };
}
export function wordChoice(round: number) {
  const items = [
    { icon: '🐇', label: 'lapin', expected: 'LAPIN', choices: ['LAPIN', 'LAPNI', 'LIPAN'] },
    { icon: '🎩', label: 'chapeau', expected: 'CHAPEAU', choices: ['CHAEPAU', 'CHAPEAU', 'CHAPEA'] },
    { icon: '🌷', label: 'fleur', expected: 'FLEUR', choices: ['FLUER', 'FLEU', 'FLEUR'] },
    { icon: '🃏', label: 'carte', expected: 'CARTE', choices: ['CARTE', 'CRATE', 'CATRE'] },
  ];
  return items[round % items.length];
}
export type SceneAction = 'eat' | 'sleep' | 'jump' | 'read';
export function sceneChoice(round: number): { action: SceneAction; expected: string; choices: string[]; description: string } {
  return [
    { action: 'eat' as const, expected: 'LE LAPIN MANGE.', choices: ['LE LAPIN DORT.', 'LE LAPIN MANGE.'], description: 'Un lapin croque une carotte.' },
    { action: 'sleep' as const, expected: 'LE LAPIN DORT.', choices: ['LE LAPIN DORT.', 'LE LAPIN SAUTE.'], description: 'Un lapin est couché dans un lit, les yeux fermés.' },
    { action: 'jump' as const, expected: 'LE LAPIN SAUTE.', choices: ['LE LAPIN MANGE.', 'LE LAPIN SAUTE.'], description: 'Un lapin saute au-dessus du sol.' },
    { action: 'read' as const, expected: 'LE LAPIN LIT.', choices: ['LE LAPIN LIT.', 'LE LAPIN DORT.'], description: 'Un lapin regarde les pages de son livre ouvert.' },
  ][round % 4];
}
export function flowerOrder(round: number) {
  const [target, present] = [[6, 4], [5, 4], [8, 5], [10, 8]][round % 4];
  return { target, present, expected: target - present, choices: [1, 2, 3] };
}
export function trainSequence(round: number) {
  const values = [[1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [4, 5, 6, 7, 8], [10, 9, 8, 7, 6]][round % 4];
  const gap = round % 2 === 0 ? 2 : 3;
  const expected = values[gap];
  const choices = round % 2 === 0 ? [expected + 1, expected, expected - 1] : [expected - 1, expected + 1, expected];
  return { values, gap, choices };
}
