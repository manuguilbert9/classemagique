// Offline, deterministic generation. Run: node scripts/generate-miaoudoku-levels.mjs
// Only unique puzzles are shipped: no solver or generation work on the student's device.
import { writeFileSync } from 'node:fs';

let seed = 20261113;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const pick = list => list[Math.floor(random() * list.length)];

function placements(size) {
  const result = [];
  function visit(columns) {
    if (columns.length === size) {
      result.push(columns.map((column, row) => row * size + column));
      return;
    }
    for (let column = 0; column < size; column++) {
      if (!columns.includes(column) && (!columns.length || Math.abs(columns.at(-1) - column) > 1)) visit([...columns, column]);
    }
  }
  visit([]);
  return result;
}

function grow(size, solution) {
  const regions = Array(size * size).fill(-1);
  solution.forEach((cell, region) => regions[cell] = region);
  while (regions.includes(-1)) {
    const frontier = [];
    for (let cell = 0; cell < regions.length; cell++) {
      if (regions[cell] === -1) continue;
      const row = Math.floor(cell / size), column = cell % size;
      for (const [r, c] of [[row-1,column],[row+1,column],[row,column-1],[row,column+1]]) {
        if (r >= 0 && r < size && c >= 0 && c < size && regions[r * size + c] === -1) frontier.push([r * size + c, regions[cell]]);
      }
    }
    const [cell, region] = pick(frontier);
    regions[cell] = region;
  }
  return regions;
}

function solvesWithSingles(size, regions) {
  const cats = [];
  while (cats.length < size) {
    const candidates = regions.flatMap((_, cell) => {
      const row = Math.floor(cell / size), column = cell % size;
      return cats.some(cat => Math.floor(cat / size) === row || cat % size === column || regions[cat] === regions[cell] ||
        (Math.abs(Math.floor(cat / size) - row) === 1 && Math.abs(cat % size - column) === 1)) ? [] : [cell];
    });
    let found;
    for (let n = 0; n < size && found === undefined; n++) {
      for (const group of [candidates.filter(c => Math.floor(c / size) === n), candidates.filter(c => c % size === n), candidates.filter(c => regions[c] === n)]) {
        if (group.length === 1) { found = group[0]; break; }
      }
    }
    if (found === undefined) return false;
    cats.push(found);
  }
  return true;
}

const levels = [];
for (const [difficulty, size] of [['easy', 5], ['normal', 6], ['hard', 8]]) {
  const options = placements(size);
  let accepted = 0;
  for (let attempt = 0; accepted < 8 && attempt < 200000; attempt++) {
    const solution = pick(options);
    const regions = grow(size, solution);
    // No one-cell regions in harder modes; beginners get useful starting clues.
    if (difficulty !== 'easy' && Array.from({ length: size }, (_, r) => regions.filter(x => x === r).length).some(count => count < 2)) continue;
    let matches = 0;
    for (const candidate of options) {
      if (new Set(candidate.map(c => regions[c])).size === size && ++matches > 1) break;
    }
    if (matches !== 1 || (difficulty === 'easy' && !solvesWithSingles(size, regions))) continue;
    if (levels.some(level => level.size === size && level.regions.join() === regions.join())) continue;
    accepted++;
    levels.push({ id: `${difficulty}-${accepted}`, difficulty, size, regions, solution });
  }
  if (accepted !== 8) throw new Error(`Could not generate enough ${difficulty} puzzles`);
}
const entries = levels.map(level => `  {\n    id: '${level.id}', difficulty: '${level.difficulty}', size: ${level.size},\n    regions: [\n${Array.from({length: level.size}, (_, row) => `      ${level.regions.slice(row * level.size, (row + 1) * level.size).join(', ')},`).join('\n')}\n    ],\n    solution: [${level.solution.join(', ')}],\n  },`).join('\n');
writeFileSync(new URL('../src/lib/miaoudoku-levels.ts', import.meta.url), `// Original puzzles generated with scripts/generate-miaoudoku-levels.mjs.\nimport type { MiaoudokuLevel } from './miaoudoku';\n\nexport const MIAOUDOKU_LEVELS: MiaoudokuLevel[] = [\n${entries}\n];\n`);
console.log(`Generated ${levels.length} unique puzzles.`);
