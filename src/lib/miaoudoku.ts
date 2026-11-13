export type Difficulty = 'easy' | 'normal' | 'hard';
export type CellValue = 'empty' | 'mark' | 'cat';
export type Rule = 'row' | 'column' | 'region' | 'touching';

export interface MiaoudokuLevel {
  id: string;
  difficulty: Difficulty;
  size: number;
  regions: number[];
  /** Cell indices, one per row. Original puzzles, verified by the catalogue tests. */
  solution: number[];
}

export interface BoardState {
  board: CellValue[];
  history: CellValue[][];
}

export const RULE_MESSAGES: Record<Rule, string> = {
  row: 'Deux chats sont sur la même ligne.',
  column: 'Deux chats sont dans la même colonne.',
  region: 'Deux chats sont dans la même zone colorée.',
  touching: 'Deux chats se touchent en diagonale.',
};

export function createBoard(level: MiaoudokuLevel): CellValue[] {
  return Array<CellValue>(level.size * level.size).fill('empty');
}

export function cycleCell(value: CellValue): CellValue {
  return value === 'empty' ? 'mark' : value === 'mark' ? 'cat' : 'empty';
}

/** Every shipped puzzle has one solution, so even an isolated mistake is detectable. */
export function getMistakes(level: MiaoudokuLevel, board: CellValue[]): { index: number; value: 'mark' | 'cat' }[] {
  return board.flatMap((value, index) => {
    const expectsCat = level.solution.includes(index);
    return (value === 'mark' && expectsCat) || (value === 'cat' && !expectsCat)
      ? [{ index, value }]
      : [];
  });
}

export function getConflicts(level: MiaoudokuLevel, board: CellValue[]) {
  const cats = board.flatMap((value, index) => value === 'cat' ? [index] : []);
  const conflicts: { rule: Rule; cells: [number, number] }[] = [];
  for (let a = 0; a < cats.length; a++) {
    for (let b = a + 1; b < cats.length; b++) {
      const first = cats[a], second = cats[b];
      const rowDistance = Math.abs(Math.floor(first / level.size) - Math.floor(second / level.size));
      const columnDistance = Math.abs(first % level.size - second % level.size);
      const cells: [number, number] = [first, second];
      if (rowDistance === 0) conflicts.push({ rule: 'row', cells });
      if (columnDistance === 0) conflicts.push({ rule: 'column', cells });
      if (level.regions[first] === level.regions[second]) conflicts.push({ rule: 'region', cells });
      if (rowDistance === 1 && columnDistance === 1) conflicts.push({ rule: 'touching', cells });
    }
  }
  return conflicts;
}

export function isSolved(level: MiaoudokuLevel, board: CellValue[]): boolean {
  return board.length === level.size * level.size &&
    board.filter(value => value === 'cat').length === level.size &&
    getConflicts(level, board).length === 0;
}

export function applyMove(state: BoardState, index: number, value: CellValue): BoardState {
  if (!Number.isInteger(index) || index < 0 || index >= state.board.length || state.board[index] === value) return state;
  const board = [...state.board];
  board[index] = value;
  return { board, history: [...state.history, state.board] };
}

export function undoMove(state: BoardState): BoardState {
  if (state.history.length === 0) return state;
  return { board: state.history[state.history.length - 1], history: state.history.slice(0, -1) };
}

/** An incorrect hypothesis is removed first, so a hint never introduces a conflict. */
export function getHint(level: MiaoudokuLevel, board: CellValue[]): {
  index: number; value: CellValue; message: string;
} | null {
  const wrongCat = board.findIndex((value, index) => value === 'cat' && !level.solution.includes(index));
  if (wrongCat >= 0) {
    return {
      index: wrongCat, value: 'empty',
      message: `Le chat en ligne ${Math.floor(wrongCat / level.size) + 1}, colonne ${wrongCat % level.size + 1} a été retiré : cette position empêche de terminer la grille.`,
    };
  }
  const index = level.solution.find(cell => board[cell] !== 'cat');
  if (index === undefined) return null;
  return {
    index, value: 'cat',
    message: `Un chat a été placé en ligne ${Math.floor(index / level.size) + 1}, colonne ${index % level.size + 1}. Observe sa ligne, sa colonne et sa zone pour continuer.`,
  };
}
