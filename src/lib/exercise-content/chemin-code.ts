/**
 * Génération des labyrinthes du « Chemin codé ».
 *
 * Remontée du composant client vers le serveur pour que les labyrinthes soient
 * mémorisés et partagés : toute la classe code le même parcours.
 */

import type { SkillLevel } from '../skills';

export type Move = 'up' | 'down' | 'left' | 'right';
export type Tile = 'empty' | 'wall' | 'player' | 'key' | 'trap';
export type Position = { x: number, y: number };
export type LevelData = {
    grid: Tile[][];
    playerStart: Position;
    keyPos: Position;
};


// --- Grid Generation ---

// Helper to shuffle an array
const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Breadth-first search to find the SHORTEST solution path.
export const findShortestPath = (grid: Tile[][], start: Position, end: Position): Position[] | null => {
    const queue: { pos: Position, path: Position[] }[] = [{ pos: start, path: [start] }];
    const visited = new Set([`${start.y},${start.x}`]);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // S, N, E, W
    const width = grid[0].length;
    const height = grid.length;

    while (queue.length > 0) {
        const { pos, path } = queue.shift()!;
        if (pos.x === end.x && pos.y === end.y) {
            return path; // Solution found
        }
        
        for (const [dx, dy] of dirs) {
            const nextX = pos.x + dx;
            const nextY = pos.y + dy;

            if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height && grid[nextY][nextX] !== 'wall' && !visited.has(`${nextY},${nextX}`)) {
                visited.add(`${nextY},${nextX}`);
                const newPath = [...path, { x: nextX, y: nextY }];
                queue.push({ pos: { x: nextX, y: nextY }, path: newPath });
            }
        }
    }
    return null; // No path found
};

// Generates a maze-like structure for Level C
const generateMaze = (width: number, height: number): { grid: Tile[][], playerStart: Position, keyPos: Position } => {
    // Ensure width and height are odd for the maze algorithm
    const w = width % 2 === 0 ? width + 1 : width;
    const h = height % 2 === 0 ? height + 1 : height;
    
    let grid: Tile[][] = Array.from({ length: h }, () => Array(w).fill('wall'));
    let emptyCells: Position[] = [];

    function carvePassages(cx: number, cy: number) {
        grid[cy][cx] = 'empty';
        emptyCells.push({x: cx, y: cy});

        const directions = shuffle([
            { x: 0, y: -2, wallY: -1 }, // North
            { x: 2, y: 0, wallX: 1 },  // East
            { x: 0, y: 2, wallY: 1 },  // South
            { x: -2, y: 0, wallX: -1 }  // West
        ]);

        for (const dir of directions) {
            const nx = cx + dir.x;
            const ny = cy + dir.y;

            if (ny >= 0 && ny < h && nx >= 0 && nx < w && grid[ny][nx] === 'wall') {
                grid[cy + (dir.wallY || 0)][cx + (dir.wallX || 0)] = 'empty';
                emptyCells.push({x: cx + (dir.wallX || 0), y: cy + (dir.wallY || 0) });
                carvePassages(nx, ny);
            }
        }
    }

    const startX = Math.floor(Math.random() * (w / 2)) * 2;
    const startY = Math.floor(Math.random() * (h / 2)) * 2;
    carvePassages(startX, startY);
    
    let playerStart = emptyCells[0];
    let keyPos = emptyCells[emptyCells.length-1];

    const solutionPath = findShortestPath(grid, playerStart, keyPos);
    if (!solutionPath) {
        // Fallback or retry logic if somehow no path is found
        return generateMaze(width, height); 
    }
    
    const solutionPathSet = new Set(solutionPath.map(p => `${p.y},${p.x}`));

    // Add traps to cells that are NOT part of the solution path
    const potentialTrapCells = emptyCells.filter(cell => !solutionPathSet.has(`${cell.y},${cell.x}`) && (cell.x !== playerStart.x || cell.y !== playerStart.y) && (cell.x !== keyPos.x || cell.y !== keyPos.y));
    const trapCount = Math.floor(potentialTrapCells.length * 0.15); // ~15% of non-solution path are traps
    
    const shuffledPotentialTraps = shuffle(potentialTrapCells);
    for (let i = 0; i < Math.min(trapCount, shuffledPotentialTraps.length); i++) {
        const {x, y} = shuffledPotentialTraps[i];
        grid[y][x] = 'trap';
    }

    return { grid, playerStart, keyPos };
};

const isPathStraight = (path: Position[]): boolean => {
    if (path.length < 2) return true;
    const allSameX = path.every(p => p.x === path[0].x);
    const allSameY = path.every(p => p.y === path[0].y);
    return allSameX || allSameY;
};


const generateLevel = (level: SkillLevel): LevelData => {
    if (level === 'C') {
        let maze;
        do {
            maze = generateMaze(15, 15);
        } while (!isPathPossible(maze.grid, maze.playerStart, maze.keyPos));
        return maze;
    }
    
    let attempts = 0;
    while(attempts < 50) {
        attempts++;
        const width = 7;
        const height = 7;
        const grid: Tile[][] = Array.from({ length: height }, () => Array(width).fill('empty'));

        const wallCount = Math.floor(Math.random() * 6) + 6; // 6 to 11 walls
            
        for (let i = 0; i < wallCount; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            if (grid[y][x] === 'empty') {
                grid[y][x] = 'wall';
            }
        }

        let playerStart: Position, keyPos: Position;

        const corners = [
            { x: 0, y: 0 }, { x: width - 1, y: 0 },
            { x: 0, y: height - 1 }, { x: width - 1, y: height - 1 }
        ];
        
        let startCornerIndex, endCornerIndex;
        
        let cornerAttempts = 0;
        do {
            startCornerIndex = Math.floor(Math.random() * corners.length);
            playerStart = corners[startCornerIndex];
            cornerAttempts++;
            if (cornerAttempts > 20) continue;
        } while (grid[playerStart.y][playerStart.x] !== 'empty');

        cornerAttempts = 0;
        do {
            endCornerIndex = Math.floor(Math.random() * corners.length);
            keyPos = corners[endCornerIndex];
            cornerAttempts++;
            if (cornerAttempts > 20) continue;
        } while (endCornerIndex === startCornerIndex || grid[keyPos.y][keyPos.x] !== 'empty');
        
        grid[playerStart.y][playerStart.x] = 'empty';
        grid[keyPos.y][keyPos.x] = 'empty';

        const shortestPath = findShortestPath(grid, playerStart, keyPos);

        if (shortestPath) {
             // For level B, ensure the path is not a straight line
            if (level === 'B' && isPathStraight(shortestPath)) {
                continue; // Regenerate if the path is straight
            }
            return { grid, playerStart, keyPos };
        }
    }
    
    // Fallback if we can't generate a valid level after many attempts
    console.warn("Failed to generate a valid level, returning a simple one.");
    const fallbackGrid: Tile[][] = Array.from({ length: 7 }, () => Array(7).fill('empty'));
    return { grid: fallbackGrid, playerStart: { x: 0, y: 0 }, keyPos: { x: 6, y: 6 } };
};


const isPathPossible = (grid: Tile[][], start: Position, end: Position): boolean => {
    const queue = [start];
    const visited = new Set([`${start.y},${start.x}`]);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const width = grid[0].length;
    const height = grid.length;

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (current.x === end.x && current.y === end.y) return true;

        for (const [dx, dy] of dirs) {
            const nextX = current.x + dx;
            const nextY = current.y + dy;
            if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height && grid[nextY][nextX] !== 'wall' && !visited.has(`${nextY},${nextX}`)) {
                visited.add(`${nextY},${nextX}`);
                queue.push({ x: nextX, y: nextY });
            }
        }
    }
    return false;
};

export function generateCheminsCodes(niveau: SkillLevel, count: number): LevelData[] {
  return Array.from({ length: count }, () => generateLevel(niveau));
}
