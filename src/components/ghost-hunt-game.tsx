
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw, Zap } from 'lucide-react';

const GAME_DURATION = 120; // 2 minutes in seconds
const GHOST_COUNT = 8;
const DECOY_COUNT = 12;

type Entity = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  isGhost: boolean;
};

const GHOST_EMOJIS = ['👻', '👻', '👻'];
const DECOY_EMOJIS = ['⚪', '⚫', '🔵', '🟡', '🟢', '🔴', '🟣', '🟠'];

const getRandomPosition = () => ({
  x: Math.random() * 80 + 10, // 10-90% to keep entities inside
  y: Math.random() * 80 + 10,
});

const getRandomVelocity = () => ({
  vx: (Math.random() - 0.5) * 0.4,
  vy: (Math.random() - 0.5) * 0.4,
});

export function GhostHuntGame({
  onExit,
  onReplay,
  canReplay,
  gameCost,
}: {
  onExit: () => void;
  onReplay: () => void;
  canReplay: boolean;
  gameCost: number;
}) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [mistakes, setMistakes] = useState(0);

  const initializeGame = useCallback(() => {
    const newEntities: Entity[] = [];
    let id = 0;

    // Create ghosts
    for (let i = 0; i < GHOST_COUNT; i++) {
      const pos = getRandomPosition();
      const vel = getRandomVelocity();
      newEntities.push({
        id: id++,
        ...pos,
        ...vel,
        emoji: GHOST_EMOJIS[Math.floor(Math.random() * GHOST_EMOJIS.length)],
        isGhost: true,
      });
    }

    // Create decoys
    for (let i = 0; i < DECOY_COUNT; i++) {
      const pos = getRandomPosition();
      const vel = getRandomVelocity();
      newEntities.push({
        id: id++,
        ...pos,
        ...vel,
        emoji: DECOY_EMOJIS[Math.floor(Math.random() * DECOY_EMOJIS.length)],
        isGhost: false,
      });
    }

    setEntities(newEntities);
    setScore(0);
    setMistakes(0);
    setTimeLeft(GAME_DURATION);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Update mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Handle entity click
  const handleEntityClick = (entity: Entity, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGameOver || isPaused) return;

    if (entity.isGhost) {
      // Correct click - caught a ghost
      setScore(prev => prev + 1);
      // Remove this ghost and spawn a new one
      setEntities(prev => {
        const filtered = prev.filter(e => e.id !== entity.id);
        const pos = getRandomPosition();
        const vel = getRandomVelocity();
        return [
          ...filtered,
          {
            id: Date.now() + Math.random(),
            ...pos,
            ...vel,
            emoji: GHOST_EMOJIS[Math.floor(Math.random() * GHOST_EMOJIS.length)],
            isGhost: true,
          },
        ];
      });
    } else {
      // Wrong click - clicked a decoy
      setMistakes(prev => prev + 1);
    }
  };

  // Move entities
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setEntities(prev =>
        prev.map(entity => {
          let { x, y, vx, vy } = entity;
          x += vx;
          y += vy;

          // Bounce off walls
          if (x <= 5 || x >= 95) vx = -vx;
          if (y <= 5 || y >= 95) vy = -vy;

          // Keep within bounds
          x = Math.max(5, Math.min(95, x));
          y = Math.max(5, Math.min(95, y));

          return { ...entity, x, y, vx, vy };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused]);

  // Timer countdown
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isGameOver) {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  const handleReplayGame = () => {
    onReplay();
    initializeGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onExit} variant="outline" className="bg-white/10 text-white hover:bg-white/20">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
          </Button>
          <div className="flex gap-4 text-white text-xl font-bold">
            <div className="bg-white/10 px-4 py-2 rounded-lg">⏱️ {formatTime(timeLeft)}</div>
            <div className="bg-green-600/80 px-4 py-2 rounded-lg">👻 {score}</div>
            <div className="bg-red-600/80 px-4 py-2 rounded-lg">❌ {mistakes}</div>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardHeader className="text-center bg-slate-900/50">
            <CardTitle className="font-headline text-4xl text-white flex items-center justify-center gap-2">
              <Zap className="h-8 w-8 text-yellow-400" />
              Chasse aux Fantômes
            </CardTitle>
            <p className="text-slate-300 mt-2">
              Attrape les fantômes 👻 avec ta lampe torche ! Évite les autres emojis !
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div
              ref={gameAreaRef}
              onMouseMove={handleMouseMove}
              className="relative w-full aspect-[4/3] bg-black overflow-hidden cursor-none"
              style={{
                background: 'radial-gradient(circle at center, #0a0a0a 0%, #000000 100%)',
              }}
            >
              {/* Flashlight effect - radial gradient following mouse */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%,
                    transparent 0%,
                    transparent 8%,
                    rgba(0,0,0,0.3) 12%,
                    rgba(0,0,0,0.7) 18%,
                    rgba(0,0,0,0.95) 25%,
                    rgba(0,0,0,0.99) 35%)`,
                }}
              />

              {/* Entities */}
              {entities.map(entity => {
                const dx = entity.x - mousePos.x;
                const dy = entity.y - mousePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const isVisible = distance < 15; // Only visible within flashlight radius

                return (
                  <div
                    key={entity.id}
                    onClick={(e) => handleEntityClick(entity, e)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-4xl cursor-pointer transition-opacity duration-200 select-none"
                    style={{
                      left: `${entity.x}%`,
                      top: `${entity.y}%`,
                      opacity: isVisible ? Math.max(0.3, 1 - distance / 15) : 0,
                      pointerEvents: isVisible ? 'auto' : 'none',
                    }}
                  >
                    {entity.emoji}
                  </div>
                );
              })}

              {/* Pause overlay */}
              {isPaused && !isGameOver && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                  <div className="text-white text-4xl font-bold">PAUSE</div>
                </div>
              )}

              {/* Game Over overlay */}
              {isGameOver && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
                  <div className="text-center text-white space-y-4">
                    <h2 className="text-5xl font-bold mb-4">Temps écoulé !</h2>
                    <p className="text-3xl">Fantômes attrapés : <span className="text-green-400 font-bold">{score}</span></p>
                    <p className="text-2xl">Erreurs : <span className="text-red-400 font-bold">{mistakes}</span></p>
                    <div className="flex gap-4 justify-center mt-8">
                      <Button onClick={onExit} variant="outline" size="lg">
                        <ArrowLeft className="mr-2" /> Retour
                      </Button>
                      {canReplay ? (
                        <Button onClick={handleReplayGame} size="lg" className="bg-primary">
                          <RefreshCw className="mr-2" /> Rejouer ({gameCost} pépites)
                        </Button>
                      ) : (
                        <Button disabled size="lg">
                          Pas assez de pépites
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom cursor - flashlight circle */}
              <div
                className="absolute w-8 h-8 border-4 border-yellow-400 rounded-full pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${mousePos.x}%`,
                  top: `${mousePos.y}%`,
                  boxShadow: '0 0 20px rgba(250, 204, 21, 0.8)',
                }}
              />
            </div>

            <div className="bg-slate-900/50 p-4 text-center text-slate-300">
              <p className="text-sm">
                💡 Déplace ta souris pour éclairer • Clique sur les fantômes 👻 • Espace pour pause
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
