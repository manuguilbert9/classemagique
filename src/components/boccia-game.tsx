
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- CONSTANTES DU JEU ---
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const BALL_RADIUS = 15;
const FRICTION = 0.98; // Ralentissement progressif des boules

// --- TYPES ---
type Vector = { x: number; y: number };
type Ball = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: 'red' | 'blue' | 'white';
};

export function BocciaGame({ onExit }: { onExit: () => void; }) {
  const [balls, setBalls] = React.useState<Ball[]>([]);
  const gameLoopRef = React.useRef<number>();

  const resetGame = React.useCallback(() => {
    // Initialisation du jeu (à développer)
    setBalls([
        // Boule Jack
        { id: 0, x: GAME_WIDTH / 2, y: 100, vx: 0, vy: 0, color: 'white' },
        // Boules Rouges
        { id: 1, x: 100, y: 450, vx: 0, vy: 0, color: 'red' },
        // Boules Bleues
        { id: 7, x: 700, y: 450, vx: 0, vy: 0, color: 'blue' },
    ]);
  }, []);

  React.useEffect(() => {
    resetGame();
  }, [resetGame]);

  // --- BOUCLE DE JEU PRINCIPALE ---
  React.useEffect(() => {
    const gameLoop = () => {
      // Logique de physique et de collision à implémenter ici
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [balls]);


  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <Card className="w-auto shadow-2xl bg-zinc-800 text-white border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="font-headline text-3xl">Boccia</CardTitle>
           {/* Affichage du score et du joueur actuel à ajouter ici */}
        </CardHeader>
        <CardContent>
          <div
            className="relative bg-green-800 border-4 border-yellow-700 rounded-md"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {/* Rendu des boules */}
            {balls.map(ball => (
              <div
                key={ball.id}
                className={cn("absolute rounded-full border-2", {
                  'bg-white border-black': ball.color === 'white',
                  'bg-red-600 border-red-800': ball.color === 'red',
                  'bg-blue-600 border-blue-800': ball.color === 'blue',
                })}
                style={{
                  width: BALL_RADIUS * 2,
                  height: BALL_RADIUS * 2,
                  transform: `translate(${ball.x - BALL_RADIUS}px, ${ball.y - BALL_RADIUS}px)`,
                }}
              />
            ))}
             <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-bold bg-black/50 p-4 rounded-lg">Jeu en construction...</p>
            </div>
          </div>
        </CardContent>
        <CardContent className="flex justify-between">
             <Button onClick={onExit}>
                <ArrowLeft className="mr-2" /> Quitter
            </Button>
            <Button onClick={resetGame} variant="secondary">
                <RefreshCw className="mr-2" /> Recommencer
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
