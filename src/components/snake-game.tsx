
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRID_SIZE = 20;
const TILE_SIZE = 24; // in pixels

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const fruitEmojis = ['🍎', '🍌', '🍇', '🍓', '🍊', '🥝', '🍍', '🍒'];
const choice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomPosition = (snakeBody: Position[] = []): Position => {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snakeBody.some(segment => segment.x === position.x && segment.y === position.y));
  return position;
};

export function SnakeGame({ 
    onGameOver, 
    onReplay,
    canReplay,
    gameCost
}: { 
    onGameOver: () => void;
    onReplay: () => void;
    canReplay: boolean;
    gameCost: number;
}) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>(() => getRandomPosition(snake));
  const [foodEmoji, setFoodEmoji] = useState(() => choice(fruitEmojis));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPaused, setIsPaused] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [score, setScore] = useState(0);

  const handleReplayGame = () => {
    onReplay();
    resetGame();
  }

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(getRandomPosition(initialSnake));
    setFoodEmoji(choice(fruitEmojis));
    setDirection('RIGHT');
    setIsPaused(false);
    setIsLost(false);
    setScore(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ': // Space bar to pause/unpause
          if (!isLost) setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isLost]);

  useEffect(() => {
    if (isPaused || isLost) return;

    const gameInterval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Wall wrapping logic
        if (head.x < 0) head.x = GRID_SIZE - 1;
        if (head.x >= GRID_SIZE) head.x = 0;
        if (head.y < 0) head.y = GRID_SIZE - 1;
        if (head.y >= GRID_SIZE) head.y = 0;

        // Self collision
        for (let i = 1; i < newSnake.length; i++) {
          if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
            setIsLost(true);
            return prevSnake;
          }
        }
        
        newSnake.unshift(head);

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood(getRandomPosition(newSnake));
          setFoodEmoji(choice(fruitEmojis));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 120); // Game speed adjusted slightly

    return () => clearInterval(gameInterval);
  }, [snake, direction, food, isPaused, isLost]);

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-background">
      <Card className="w-auto shadow-2xl bg-zinc-800 text-white border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="font-headline text-3xl">Snake</CardTitle>
           <div className="font-bold text-2xl">Score: {score}</div>
        </CardHeader>
        <CardContent>
          <div
            className="relative bg-zinc-900 border-4 border-zinc-700 rounded-md bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:24px_24px]"
            style={{ width: GRID_SIZE * TILE_SIZE, height: GRID_SIZE * TILE_SIZE }}
          >
            {snake.map((segment, index) => (
              <div
                key={index}
                className={cn(
                  "absolute rounded-md shadow-md shadow-black/30",
                  index === 0 ? 'bg-gradient-to-br from-green-400 to-green-600 z-10' : 'bg-gradient-to-br from-green-300 to-green-500'
                )}
                style={{
                  left: segment.x * TILE_SIZE,
                  top: segment.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
              />
            ))}
            <div
              className="absolute text-xl flex items-center justify-center"
              style={{
                left: food.x * TILE_SIZE,
                top: food.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            >
              {foodEmoji}
            </div>
            {isLost && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-20 rounded-sm">
                    <h2 className="text-4xl font-bold">Game Over</h2>
                    <p className="text-xl mt-2">Score final : {score}</p>
                    <div className="flex gap-4 mt-6">
                        <Button onClick={handleReplayGame} disabled={!canReplay} variant="secondary">
                            <RefreshCw className="mr-2" /> Rejouer ({gameCost} pépites)
                        </Button>
                        <Button onClick={onGameOver}>
                            <ArrowLeft className="mr-2" /> Quitter
                        </Button>
                    </div>
                     {!canReplay && <p className="text-xs text-amber-300 mt-2">Tu n'as plus assez de pépites pour rejouer.</p>}
                </div>
            )}
             {isPaused && !isLost && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 rounded-sm">
                    <h2 className="text-4xl font-bold">Pause</h2>
                    <p className="text-lg mt-2">Appuyez sur Espace pour reprendre</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
