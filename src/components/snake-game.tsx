
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRID_SIZE = 20;
const TILE_SIZE = 20; // in pixels

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const getRandomPosition = (): Position => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

export function SnakeGame({ onGameOver }: { onGameOver: () => void }) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>(getRandomPosition());
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPaused, setIsPaused] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [score, setScore] = useState(0);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(getRandomPosition());
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
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

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

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsLost(true);
          return prevSnake;
        }

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
          let newFoodPosition;
          // Ensure new food is not on the snake
          do {
            newFoodPosition = getRandomPosition();
          } while (newSnake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
          setFood(newFoodPosition);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 100); // Game speed

    return () => clearInterval(gameInterval);
  }, [snake, direction, food, isPaused, isLost]);

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-background">
      <Card className="w-auto shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="font-headline text-3xl">Snake</CardTitle>
           <div className="font-bold text-2xl">Score: {score}</div>
        </CardHeader>
        <CardContent>
          <div
            className="relative bg-muted border-4 border-primary rounded-md"
            style={{ width: GRID_SIZE * TILE_SIZE, height: GRID_SIZE * TILE_SIZE }}
          >
            {snake.map((segment, index) => (
              <div
                key={index}
                className={cn(
                  "absolute rounded-sm",
                  index === 0 ? 'bg-green-600 z-10' : 'bg-green-400'
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
              className="absolute bg-red-500 rounded-full"
              style={{
                left: food.x * TILE_SIZE,
                top: food.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            />
            {isLost && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 rounded-sm">
                    <h2 className="text-4xl font-bold">Game Over</h2>
                    <p className="text-xl mt-2">Score final : {score}</p>
                    <div className="flex gap-4 mt-6">
                        <Button onClick={resetGame} variant="secondary">
                            <RefreshCw className="mr-2" /> Rejouer
                        </Button>
                        <Button onClick={onGameOver}>
                            <ArrowLeft className="mr-2" /> Quitter
                        </Button>
                    </div>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
