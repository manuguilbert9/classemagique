export const neighbors = [14, 8, 19, 1];
export const operations = [
  { start: 4, change: 3, sign: '+', result: 7, story: 'Il y a 4 fleurs dans le vase. Lina apporte 3 fleurs de plus.' },
  { start: 8, change: 2, sign: '−', result: 6, story: 'Il y a 8 fleurs dans le vase. Lina emporte 2 fleurs.' },
  { start: 5, change: 4, sign: '+', result: 9, story: 'Il y a 5 fleurs dans le vase. Tom apporte 4 fleurs de plus.' },
  { start: 10, change: 3, sign: '−', result: 7, story: 'Il y a 10 fleurs dans le vase. Tom emporte 3 fleurs.' },
];
export const estimates = [
  { a: 398, b: 205, result: 603, estimate: 600, choices: [400, 600, 900] },
  { a: 287, b: 112, result: 399, estimate: 400, choices: [300, 700, 400] },
  { a: 503, b: 298, result: 801, estimate: 800, choices: [800, 500, 1000] },
  { a: 196, b: 307, result: 503, estimate: 500, choices: [200, 500, 800] },
];
export const measures = [
  { start: 0, end: 7, claim: 7 }, { start: 2, end: 7, claim: 7 },
  { start: 3, end: 9, claim: 6 }, { start: 1, end: 9, claim: 9 },
];
export const subtractions = [
  { a: 52, b: 27, error: 1, wrong: 7 }, { a: 73, b: 48, error: 0, wrong: 7 },
  { a: 64, b: 38, error: 2, wrong: 3 }, { a: 81, b: 56, error: 3, wrong: 4 },
];
export function borrowingCells(q: typeof subtractions[number]) {
  const tens = Math.floor(q.a / 10) - 1;
  const units = q.a % 10 + 10;
  return [
    { id: 'borrow-tens', label: 'Dizaines après échange', correct: tens },
    { id: 'result-units', label: 'Unités du résultat', correct: units - q.b % 10 },
    { id: 'result-tens', label: 'Dizaines du résultat', correct: tens - Math.floor(q.b / 10) },
    { id: 'borrow-units', label: 'Unités après échange', correct: units },
  ].map((cell, index) => ({ ...cell, shown: index === q.error ? q.wrong : cell.correct }));
}
export function subtractionSteps(x: typeof subtractions[number]) {
  const tens = Math.floor(x.a / 10) - 1;
  const units = 10 + x.a % 10 - x.b % 10;
  return [
    { label: 'J’échange une dizaine contre 10 unités. Dizaines restantes', correct: tens },
    { label: `Unités : ${10 + x.a % 10} − ${x.b % 10}`, correct: units },
    { label: `Dizaines : ${tens} − ${Math.floor(x.b / 10)}`, correct: tens - Math.floor(x.b / 10) },
    { label: 'Résultat final', correct: x.a - x.b },
  ].map((step, i) => ({ ...step, shown: i === x.error ? x.wrong : step.correct }));
}
export const midpoints = [
  { length: 8, unit: 'cm', points: [{ name: 'P', position: 2 }, { name: 'M', position: 4 }, { name: 'R', position: 6 }] },
  { length: 12, unit: 'cm', points: [{ name: 'S', position: 3 }, { name: 'T', position: 8 }, { name: 'N', position: 6 }] },
  { length: 30, unit: 'mm', points: [{ name: 'J', position: 15 }, { name: 'K', position: 10 }, { name: 'L', position: 20 }] },
  { length: 50, unit: 'mm', points: [{ name: 'D', position: 20 }, { name: 'E', position: 25 }, { name: 'F', position: 35 }] },
];
