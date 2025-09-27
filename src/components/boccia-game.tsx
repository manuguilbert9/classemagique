
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw, MousePointer, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- CONSTANTES DU JEU ---
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const BALL_RADIUS = 15;
const FRICTION = 0.985;
const MIN_VELOCITY = 0.05;
const MAX_POWER = 15;

// --- TYPES ---
type Vector = { x: number; y: number };
type Player = 'red' | 'blue';
type GamePhase = 'aiming' | 'simulating' | 'turnEnd' | 'gameOver';

type Ball = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: Player | 'white';
};

const INITIAL_BALLS_PER_PLAYER = 6;

export function BocciaGame({ onExit }: { onExit: () => void; }) {
  const [balls, setBalls] = React.useState<Ball[]>([]);
  const [phase, setPhase] = React.useState<GamePhase>('turnEnd');
  const [currentPlayer, setCurrentPlayer] = React.useState<Player>('red');
  const [ballsLeft, setBallsLeft] = React.useState<Record<Player, number>>({ red: INITIAL_BALLS_PER_PLAYER, blue: INITIAL_BALLS_PER_PLAYER });
  const [score, setScore] = React.useState<Record<Player, number>>({ red: 0, blue: 0 });
  
  // Aiming state
  const [isAiming, setIsAiming] = React.useState(false);
  const [aimStart, setAimStart] = React.useState<Vector | null>(null);
  const [aimVector, setAimVector] = React.useState<Vector>({ x: 0, y: 0 });
  const [power, setPower] = React.useState(0);
  const powerIntervalRef = React.useRef<NodeJS.Timeout>();

  const gameLoopRef = React.useRef<number>();
  const gameAreaRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const resetGame = React.useCallback(() => {
    setBalls([
        { id: 0, x: GAME_WIDTH / 2, y: GAME_HEIGHT - 40, vx: 0, vy: 0, color: 'white' },
        ...Array.from({ length: INITIAL_BALLS_PER_PLAYER }, (_, i) => ({ id: i + 1, x: 50 + i * 40, y: GAME_HEIGHT - 40, vx: 0, vy: 0, color: 'red' as Player})),
        ...Array.from({ length: INITIAL_BALLS_PER_PLAYER }, (_, i) => ({ id: i + 7, x: GAME_WIDTH - 50 - i * 40, y: GAME_HEIGHT - 40, vx: 0, vy: 0, color: 'blue' as Player})),
    ]);
    setPhase('turnEnd');
    setCurrentPlayer('red');
    setBallsLeft({ red: INITIAL_BALLS_PER_PLAYER, blue: INITIAL_BALLS_PER_PLAYER });
    setScore({ red: 0, blue: 0 });
    toast({ title: "Nouvelle partie !", description: "Le joueur Rouge commence par lancer le Jack (la boule blanche)." });
  }, [toast]);

  React.useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  const getBallToPlay = (): Ball | undefined => {
    const thrownBalls = balls.filter(b => b.y < GAME_HEIGHT - 100 && b.color !== 'white');
    if (thrownBalls.length === 0) return balls.find(b => b.color === currentPlayer);

    const jack = balls.find(b => b.color === 'white');
    if (!jack) return undefined;

    const distances: { dist: number, color: Player }[] = thrownBalls.map(b => ({
      dist: Math.sqrt(Math.pow(b.x - jack.x, 2) + Math.pow(b.y - jack.y, 2)),
      color: b.color as Player
    }));
    
    const closest = distances.reduce((prev, curr) => prev.dist < curr.dist ? prev : curr);
    
    // The player who is NOT closest plays next
    const nextPlayer = closest.color === 'red' ? 'blue' : 'red';
    
    if (ballsLeft[nextPlayer] > 0) {
      setCurrentPlayer(nextPlayer);
      return balls.find(b => b.color === nextPlayer && b.y >= GAME_HEIGHT - 100);
    } 
    // If that player has no balls, the other one plays
    else if (ballsLeft[closest.color] > 0) {
      setCurrentPlayer(closest.color);
      return balls.find(b => b.color === closest.color && b.y >= GAME_HEIGHT - 100);
    }
    
    return undefined; // No balls left to play
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (phase !== 'turnEnd') return;
    
    const ballToPlay = balls.find(b => b.id === 0 && b.y > GAME_HEIGHT - 100) || getBallToPlay();
    if (!ballToPlay) return;

    const rect = gameAreaRef.current!.getBoundingClientRect();
    const clickPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    const dist = Math.sqrt(Math.pow(clickPos.x - ballToPlay.x, 2) + Math.pow(clickPos.y - ballToPlay.y, 2));

    if (dist < BALL_RADIUS) {
        setIsAiming(true);
        setAimStart({ x: ballToPlay.x, y: ballToPlay.y });
        powerIntervalRef.current = setInterval(() => {
            setPower(p => (p + 0.5) % (MAX_POWER + 0.5));
        }, 20);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isAiming || !aimStart) return;
    const rect = gameAreaRef.current!.getBoundingClientRect();
    const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const dx = mousePos.x - aimStart.x;
    const dy = mousePos.y - aimStart.y;
    setAimVector({ x: dx, y: dy });
  };
  
  const handleMouseUp = () => {
    if (!isAiming || !aimStart) return;

    setIsAiming(false);
    clearInterval(powerIntervalRef.current);
    
    const ballToPlay = balls.find(b => b.id === 0 && b.y > GAME_HEIGHT - 100) || getBallToPlay();
    if (!ballToPlay) return;

    const angle = Math.atan2(-aimVector.y, -aimVector.x);
    const velocity = {
        vx: Math.cos(angle) * power,
        vy: Math.sin(angle) * power
    };

    setBalls(currentBalls => currentBalls.map(b => b.id === ballToPlay.id ? {...b, ...velocity, y: b.y - 1} : b));
    setBallsLeft(prev => ballToPlay.color !== 'white' ? { ...prev, [ballToPlay.color as Player]: prev[ballToPlay.color as Player] - 1} : prev);
    setPhase('simulating');
    setPower(0);
  };

  // --- BOUCLE DE JEU PRINCIPALE ---
  React.useEffect(() => {
    const gameLoop = () => {
      if (phase !== 'simulating') {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      let isMoving = false;

      setBalls(currentBalls => {
        const nextBalls = currentBalls.map(ball => {
          // 1. Apply friction and update position
          let newVx = ball.vx * FRICTION;
          let newVy = ball.vy * FRICTION;
          
          if (Math.abs(newVx) < MIN_VELOCITY) newVx = 0;
          if (Math.abs(newVy) < MIN_VELOCITY) newVy = 0;
          
          if(newVx !== 0 || newVy !== 0) isMoving = true;

          return { ...ball, vx: newVx, vy: newVy, x: ball.x + newVx, y: ball.y + newVy };
        });

        // 2. Handle collisions
        for (let i = 0; i < nextBalls.length; i++) {
            for (let j = i + 1; j < nextBalls.length; j++) {
                const b1 = nextBalls[i];
                const b2 = nextBalls[j];
                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < BALL_RADIUS * 2) {
                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);
                    
                    // Rotate velocities
                    const vx1 = b1.vx * cos + b1.vy * sin;
                    const vy1 = b1.vy * cos - b1.vx * sin;
                    const vx2 = b2.vx * cos + b2.vy * sin;
                    const vy2 = b2.vy * cos - b2.vx * sin;

                    // Swap velocities along the collision axis
                    const vx1Final = vx2;
                    const vx2Final = vx1;

                    // Rotate back
                    b1.vx = vx1Final * cos - vy1 * sin;
                    b1.vy = vy1 * cos + vx1Final * sin;
                    b2.vx = vx2Final * cos - vy2 * sin;
                    b2.vy = vy2 * cos + vx2Final * sin;
                    
                    // Separate overlapping balls
                    const overlap = (BALL_RADIUS * 2 - distance) / 2;
                    b1.x -= overlap * cos;
                    b1.y -= overlap * sin;
                    b2.x += overlap * cos;
                    b2.y += overlap * sin;
                }
            }
            // Wall collisions
            if (nextBalls[i].x < BALL_RADIUS) { nextBalls[i].x = BALL_RADIUS; nextBalls[i].vx *= -0.8; }
            if (nextBalls[i].x > GAME_WIDTH - BALL_RADIUS) { nextBalls[i].x = GAME_WIDTH - BALL_RADIUS; nextBalls[i].vx *= -0.8; }
            if (nextBalls[i].y < BALL_RADIUS) { nextBalls[i].y = BALL_RADIUS; nextBalls[i].vy *= -0.8; }
            if (nextBalls[i].y > GAME_HEIGHT - BALL_RADIUS) { nextBalls[i].y = GAME_HEIGHT - BALL_RADIUS; nextBalls[i].vy *= -0.8; }
        }

        return nextBalls;
      });

      if (!isMoving) {
        setPhase('turnEnd');
        const hasBallsToPlay = Object.values(ballsLeft).some(v => v > 0);
        if(!hasBallsToPlay && balls.find(b => b.color === 'white' && b.y > GAME_HEIGHT - 100) === undefined) {
             toast({ title: "Fin de la manche !", description: "Calcul du score..."});
             // End of round logic to be added here
        }
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [phase, ballsLeft, toast]);


  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <Card className="w-auto shadow-2xl bg-zinc-800 text-white border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="font-headline text-3xl">Boccia</CardTitle>
           <div className="flex gap-8 items-center">
             <div className="text-center">
                <p className={cn("text-lg font-bold text-red-500", currentPlayer === 'red' && phase === 'turnEnd' && 'animate-pulse')}>Joueur Rouge</p>
                <p>Balles: {ballsLeft.red} | Score: {score.red}</p>
             </div>
              <div className="text-center">
                <p className={cn("text-lg font-bold text-blue-500", currentPlayer === 'blue' && phase === 'turnEnd' && 'animate-pulse')}>Joueur Bleu</p>
                <p>Balles: {ballsLeft.blue} | Score: {score.blue}</p>
             </div>
           </div>
        </CardHeader>
        <CardContent>
          <div
            ref={gameAreaRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Stop aiming if mouse leaves area
            className="relative bg-green-800 border-4 border-yellow-700 rounded-md cursor-crosshair overflow-hidden"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {/* Rendu des boules */}
            {balls.map(ball => (
              <div
                key={ball.id}
                className={cn("absolute rounded-full border-2 shadow-lg", {
                  'bg-white border-black': ball.color === 'white',
                  'bg-red-600 border-red-800': ball.color === 'red',
                  'bg-blue-600 border-blue-800': ball.color === 'blue',
                })}
                style={{
                  width: BALL_RADIUS * 2,
                  height: BALL_RADIUS * 2,
                  transform: `translate(${ball.x - BALL_RADIUS}px, ${ball.y - BALL_RADIUS}px)`,
                  transition: phase === 'simulating' ? 'transform 16ms linear' : 'none'
                }}
              />
            ))}
             {/* Ligne de visée */}
            {isAiming && aimStart && (
                <svg className="absolute inset-0 pointer-events-none">
                    <line
                        x1={aimStart.x}
                        y1={aimStart.y}
                        x2={aimStart.x - aimVector.x}
                        y2={aimStart.y - aimVector.y}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                </svg>
            )}
             {/* Jauge de puissance */}
            {isAiming && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-black/50 rounded-full border-2 border-white/50 flex items-center p-1">
                    <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" style={{width: `${(power/MAX_POWER) * 100}%`}}></div>
                </div>
            )}
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

