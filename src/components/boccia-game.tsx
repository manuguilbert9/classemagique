
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- CONSTANTES DU JEU ---
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const THROWING_AREA_HEIGHT = 100;
const TOTAL_HEIGHT = GAME_HEIGHT + THROWING_AREA_HEIGHT;
const BALL_RADIUS = 15;
const FRICTION = 0.98;
const MIN_VELOCITY = 0.05;
const MAX_POWER = 15;
const MAX_AIM_DISTANCE = 150;

// --- TYPES ---
type Vector = { x: number; y: number };
type Player = 'red' | 'blue';
type GamePhase = 'aiming' | 'simulating' | 'turnEnd' | 'roundEnd' | 'gameOver';

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
  const [phase, setPhase] = React.useState<GamePhase>('roundEnd');
  const [currentPlayer, setCurrentPlayer] = React.useState<Player>('red');
  const [ballsLeft, setBallsLeft] = React.useState<Record<Player, number>>({ red: INITIAL_BALLS_PER_PLAYER, blue: INITIAL_BALLS_PER_PLAYER });
  const [roundScore, setRoundScore] = React.useState<Record<Player, number>>({ red: 0, blue: 0 });
  const [totalScore, setTotalScore] = React.useState<Record<Player, number>>({ red: 0, blue: 0 });
  const [roundWinner, setRoundWinner] = React.useState<Player | null>('red'); // Red starts first game

  // Aiming state (billiards style)
  const [isAiming, setIsAiming] = React.useState(false);
  const [aimStart, setAimStart] = React.useState<Vector | null>(null);
  const [aimVector, setAimVector] = React.useState<Vector>({ x: 0, y: 0 });
  
  const gameLoopRef = React.useRef<number>();
  const gameAreaRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const startNewRound = React.useCallback(() => {
    const startingPlayer = roundWinner || 'red';
    
    setBalls([]);
    setPhase('turnEnd');
    setCurrentPlayer(startingPlayer); 
    setBallsLeft({ red: INITIAL_BALLS_PER_PLAYER, blue: INITIAL_BALLS_PER_PLAYER });
    setRoundScore({ red: 0, blue: 0 });
    toast({ title: "Nouvelle Manche !", description: `Le joueur ${startingPlayer === 'blue' ? 'Bleu' : 'Rouge'} commence par lancer le Jack.` });
  }, [toast, roundWinner]);

  const resetGame = React.useCallback(() => {
    setTotalScore({ red: 0, blue: 0 });
    setRoundWinner('red'); 
    startNewRound();
  }, [startNewRound]);

  React.useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  const determineNextPlayer = React.useCallback((): Player | null => {
    const jack = balls.find(b => b.color === 'white');
    if (!jack || jack.y >= GAME_HEIGHT) return currentPlayer;

    const redBalls = balls.filter(b => b.color === 'red');
    const blueBalls = balls.filter(b => b.color === 'blue');
    
    // Case where only the jack has been thrown
    if (redBalls.length === 0 && blueBalls.length === 0) {
        return currentPlayer === 'red' ? 'blue' : 'red';
    }

    if (redBalls.length === 0 && ballsLeft.red > 0) return 'red';
    if (blueBalls.length === 0 && ballsLeft.blue > 0) return 'blue';
    if (redBalls.length === 0 || blueBalls.length === 0) return null;

    const redDistances = redBalls.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
    const blueDistances = blueBalls.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
    
    const nextPlayer = redDistances[0] <= blueDistances[0] ? 'blue' : 'red';
    
    if (ballsLeft[nextPlayer] > 0) {
      return nextPlayer;
    } 
    const otherPlayer = nextPlayer === 'red' ? 'blue' : 'red';
    if (ballsLeft[otherPlayer] > 0) {
      return otherPlayer;
    }
    
    return null;
  }, [balls, ballsLeft, currentPlayer]);
  
  const calculateRoundScore = () => {
    const jack = balls.find(b => b.color === 'white');
    if (!jack) return;

    const redBalls = balls.filter(b => b.color === 'red');
    const blueBalls = balls.filter(b => b.color === 'blue');

    if(redBalls.length === 0 && blueBalls.length === 0) {
        setRoundWinner(null);
        toast({ title: "Fin de la manche !", description: "Égalité, aucun point marqué."});
        setPhase('roundEnd');
        return;
    }

    const redDistances = redBalls.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
    const blueDistances = blueBalls.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
    
    let score = 0;
    let winner: Player | null = null;
    
    if (redDistances.length === 0 && blueDistances.length > 0) {
        winner = 'blue';
        score = blueBalls.length;
    } else if (blueDistances.length === 0 && redBalls.length > 0) {
        winner = 'red';
        score = redBalls.length;
    } else if (redDistances[0] < blueDistances[0]) {
      winner = 'red';
      for (const dist of redDistances) {
        if (dist < blueDistances[0]) score++;
        else break;
      }
    } else if (blueDistances[0] < redDistances[0]) {
      winner = 'blue';
      for (const dist of blueDistances) {
        if (dist < redDistances[0]) score++;
        else break;
      }
    }

    if (winner) {
      setRoundScore({ red: winner === 'red' ? score : 0, blue: winner === 'blue' ? score : 0 });
      setTotalScore(prev => ({...prev, [winner!]: prev[winner!] + score}));
      setRoundWinner(winner);
      toast({ title: "Fin de la manche !", description: `Le joueur ${winner === 'red' ? 'Rouge' : 'Bleu'} marque ${score} point(s).`});
    } else {
      setRoundWinner(null);
      toast({ title: "Fin de la manche !", description: "Égalité, aucun point marqué."});
    }
    setPhase('roundEnd');
  }

  const getBallToPlay = React.useCallback(() => {
    const isJackTurn = !balls.some(b => b.color === 'white');
    const colorToPlay = isJackTurn ? 'white' : currentPlayer;
    const existingBall = balls.find(b => b.color === colorToPlay && b.y >= GAME_HEIGHT);
    
    if (existingBall) return existingBall;
    if (phase !== 'turnEnd') return null;

    if (isJackTurn) {
        const newJack = { id: 0, x: GAME_WIDTH / 2, y: GAME_HEIGHT + THROWING_AREA_HEIGHT / 2, vx: 0, vy: 0, color: 'white' as const };
        setBalls(prev => [...prev, newJack]);
        return newJack;
    }

    if (ballsLeft[currentPlayer] > 0) {
        const newId = Date.now();
        const newBall = { id: newId, x: GAME_WIDTH / 2, y: GAME_HEIGHT + THROWING_AREA_HEIGHT / 2, vx: 0, vy: 0, color: currentPlayer };
        setBalls(prev => [...prev, newBall]);
        return newBall;
    }
    
    return null;
  }, [balls, currentPlayer, ballsLeft, phase]);


  const handleMouseDown = (e: React.MouseEvent) => {
    if (phase !== 'turnEnd') return;
    const ballToPlay = getBallToPlay();
    if (!ballToPlay) return;

    const rect = gameAreaRef.current!.getBoundingClientRect();
    const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const dist = Math.hypot(mousePos.x - ballToPlay.x, mousePos.y - ballToPlay.y);
    if(dist < BALL_RADIUS) {
        setIsAiming(true);
        setAimStart({ x: mousePos.x, y: mousePos.y });
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
    const ballToPlay = getBallToPlay();
    if (!ballToPlay) return;
    
    const dist = Math.hypot(aimVector.x, aimVector.y);
    const power = (Math.min(dist, MAX_AIM_DISTANCE) / MAX_AIM_DISTANCE) * MAX_POWER;
    const angle = Math.atan2(-aimVector.y, -aimVector.x);
    const velocity = {
        vx: Math.cos(angle) * power,
        vy: Math.sin(angle) * power
    };

    setBalls(currentBalls => currentBalls.map(b => b.id === ballToPlay.id ? {...b, ...velocity } : b));
    if (ballToPlay.color !== 'white') {
        setBallsLeft(prev => ({ ...prev, [ballToPlay.color as Player]: prev[ballToPlay.color as Player] - 1}));
    }
    setPhase('simulating');
    setAimVector({x:0, y:0});
    setAimStart(null);
  };

  // Main Game Loop using useRef and requestAnimationFrame
  React.useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
        setBalls(currentBalls => {
            if (phase !== 'simulating') return currentBalls;

            let isMoving = false;
            // Update positions and apply friction
            const nextBalls = currentBalls.map(ball => {
                let newVx = ball.vx * FRICTION;
                let newVy = ball.vy * FRICTION;

                if (Math.abs(newVx) < MIN_VELOCITY) newVx = 0;
                if (Math.abs(newVy) < MIN_VELOCITY) newVy = 0;

                if(newVx !== 0 || newVy !== 0) isMoving = true;

                return { ...ball, vx: newVx, vy: newVy, x: ball.x + newVx, y: ball.y + newVy };
            });

            // Handle collisions
            for (let i = 0; i < nextBalls.length; i++) {
                for (let j = i + 1; j < nextBalls.length; j++) {
                    const b1 = nextBalls[i];
                    const b2 = nextBalls[j];
                    const dx = b2.x - b1.x;
                    const dy = b2.y - b1.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < BALL_RADIUS * 2) {
                        const angle = Math.atan2(dy, dx);
                        const sin = Math.sin(angle);
                        const cos = Math.cos(angle);
                        
                        const vx1 = b1.vx * cos + b1.vy * sin;
                        const vy1 = b1.vy * cos - b1.vx * sin;
                        const vx2 = b2.vx * cos + b2.vy * sin;
                        const vy2 = b2.vy * cos - b2.vx * sin;

                        const vx1Final = vx2;
                        const vx2Final = vx1;

                        b1.vx = vx1Final * cos - vy1 * sin;
                        b1.vy = vy1 * cos + vx1Final * sin;
                        b2.vx = vx2Final * cos - vy2 * sin;
                        b2.vy = vy2 * cos + vx2Final * sin;
                        
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
                if (nextBalls[i].y > GAME_HEIGHT - BALL_RADIUS && nextBalls[i].y < TOTAL_HEIGHT) { 
                    nextBalls[i].y = GAME_HEIGHT - BALL_RADIUS; 
                    nextBalls[i].vy *= -0.8; 
                }
            }

            // Check if simulation should end
            if (!isMoving) {
                const isJackThrown = nextBalls.some(b => b.color === 'white');
                const hasBallsToPlay = Object.values(ballsLeft).some(v => v > 0) || !isJackThrown;

                if (!hasBallsToPlay && isJackThrown) {
                     calculateRoundScore();
                } else {
                    setPhase('turnEnd');
                    const nextPlayer = determineNextPlayer();
                    if(nextPlayer) setCurrentPlayer(nextPlayer);
                }
            }
            return nextBalls;
        });
        animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, ballsLeft, determineNextPlayer]);
  
  const ballToPlay = getBallToPlay();
  const cursorClass = phase === 'turnEnd' 
    ? (currentPlayer === 'red' ? 'cursor-[url(/cursors/red.svg),_pointer]' : 'cursor-[url(/cursors/blue.svg),_pointer]')
    : 'cursor-default';
    
  const RemainingBalls = ({ player, count }: {player: Player, count: number}) => (
    <div className="flex flex-col items-center">
        <p className={cn("text-lg font-bold", player === 'red' ? 'text-red-500' : 'text-blue-500')}>
          {player === 'red' ? 'Joueur Rouge' : 'Joueur Bleu'}
        </p>
        <div className="flex gap-2 mt-2">
            {Array.from({ length: count }).map((_, i) => (
                 <div
                    key={i}
                    className={cn("w-6 h-6 rounded-full border-2", {
                      'bg-red-600 border-red-800': player === 'red',
                      'bg-blue-600 border-blue-800': player === 'blue',
                    })}
                  />
            ))}
        </div>
    </div>
  );

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <Card className="w-auto shadow-2xl bg-zinc-800 text-white border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="font-headline text-3xl">Boccia</CardTitle>
           <div className="flex gap-8 items-center">
             <div className="text-center">
                <p className={cn("text-lg font-bold text-red-500", currentPlayer === 'red' && phase === 'turnEnd' && 'animate-pulse')}>Joueur Rouge</p>
                <p>Score: {totalScore.red}</p>
             </div>
              <div className="text-center">
                <p className={cn("text-lg font-bold text-blue-500", currentPlayer === 'blue' && phase === 'turnEnd' && 'animate-pulse')}>Joueur Bleu</p>
                <p>Score: {totalScore.blue}</p>
             </div>
           </div>
        </CardHeader>
        <CardContent>
          <div
            ref={gameAreaRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={cn("relative border-4 border-yellow-700 rounded-md overflow-hidden", cursorClass)}
            style={{ width: GAME_WIDTH, height: TOTAL_HEIGHT }}
          >
            {/* Main Playing Area */}
            <div className="absolute top-0 left-0 bg-green-800" style={{width: GAME_WIDTH, height: GAME_HEIGHT }} />
            
            {/* Throwing Area */}
            <div className="absolute bottom-0 left-0 bg-green-900/50 flex justify-between items-center px-8" style={{width: GAME_WIDTH, height: THROWING_AREA_HEIGHT }}>
                <RemainingBalls player="red" count={ballsLeft.red} />
                <RemainingBalls player="blue" count={ballsLeft.blue} />
            </div>

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
            {isAiming && ballToPlay && (
                <svg className="absolute inset-0 pointer-events-none w-full h-full">
                    <line
                        x1={ballToPlay.x}
                        y1={ballToPlay.y}
                        x2={ballToPlay.x - aimVector.x}
                        y2={ballToPlay.y - aimVector.y}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                </svg>
            )}
            {phase === 'roundEnd' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                    <h3 className="text-3xl font-bold">Fin de la manche</h3>
                     <p className="text-xl mt-2">{roundWinner ? `Le joueur ${roundWinner === 'red' ? 'Rouge' : 'Bleu'} marque ${roundScore[roundWinner]} points.` : "Égalité !"}</p>
                    <Button onClick={startNewRound} className="mt-6">Manche Suivante</Button>
                </div>
            )}
          </div>
        </CardContent>
        <CardContent className="flex justify-between">
             <Button onClick={onExit}>
                <ArrowLeft className="mr-2" /> Quitter
            </Button>
            <Button onClick={resetGame} variant="secondary">
                <RefreshCw className="mr-2" /> Recommencer la partie
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}

    