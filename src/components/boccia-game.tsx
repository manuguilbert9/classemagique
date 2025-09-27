
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- CONSTANTES DU JEU ---
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const THROWING_AREA_HEIGHT = 200;
const TOTAL_HEIGHT = GAME_HEIGHT + THROWING_AREA_HEIGHT;
const BALL_RADIUS = 15;
const FRICTION = 0.98;
const MIN_VELOCITY = 0.05;
const MAX_POWER = 15;


// --- TYPES ---
type Vector = { x: number; y: number };
type Player = 'red' | 'blue';
type GamePhase = 
  | 'newRound'        // Just starting a new round, before Jack is thrown
  | 'aiming'          // A player is actively aiming a shot
  | 'simulating'      // Balls are moving
  | 'turnEnd'         // Waiting for a player to start aiming
  | 'roundEnd'        // Round is over, showing scores
  | 'gameOver';       // Game is over
  
type AimingPhase = 'idle' | 'arming';


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
  const [phase, setPhase] = React.useState<GamePhase>('newRound');
  const [currentPlayer, setCurrentPlayer] = React.useState<Player>('red');
  const [ballsLeft, setBallsLeft] = React.useState<Record<Player, number>>({ red: INITIAL_BALLS_PER_PLAYER, blue: INITIAL_BALLS_PER_PLAYER });
  const [roundScore, setRoundScore] = React.useState<Record<Player, number>>({ red: 0, blue: 0 });
  const [totalScore, setTotalScore] = React.useState<Record<Player, number>>({ red: 0, blue: 0 });
  const [roundWinner, setRoundWinner] = React.useState<Player | null>('red');

  // New aiming state
  const [aimingPhase, setAimingPhase] = React.useState<AimingPhase>('idle');
  const [aimStart, setAimStart] = React.useState<Vector | null>(null);
  const [currentMousePos, setCurrentMousePos] = React.useState<Vector | null>(null);

  const gameAreaRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (phase === 'roundEnd') {
      const winner = roundWinner; // Capture state for the effect
      if (winner) {
        toast({
          title: "Fin de la manche !",
          description: `Le joueur ${winner === 'red' ? 'Rouge' : 'Bleu'} marque ${roundScore[winner]} point(s).`
        });
      } else {
         if (totalScore.red > 0 || totalScore.blue > 0) {
            toast({
              title: "Fin de la manche !",
              description: "Égalité, aucun point marqué."
            });
         }
      }
    }
  }, [phase, roundWinner, roundScore, toast, totalScore]);


  const startNewRound = React.useCallback(() => {
    const startingPlayer = roundWinner === null ? (currentPlayer === 'red' ? 'blue' : 'red') : roundWinner;
    
    setBalls([]);
    setPhase('newRound'); 
    setCurrentPlayer(startingPlayer); 
    setBallsLeft({ red: INITIAL_BALLS_PER_PLAYER, blue: INITIAL_BALLS_PER_PLAYER });
    setRoundScore({ red: 0, blue: 0 });
  }, [roundWinner, currentPlayer]);

  const resetGame = React.useCallback(() => {
    setTotalScore({ red: 0, blue: 0 });
    setRoundWinner('red'); // Red starts the very first round
    startNewRound();
  }, [startNewRound]);

  React.useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  const determineNextPlayer = React.useCallback((): Player | null => {
    const jack = balls.find(b => b.color === 'white');
    if (!jack || jack.y >= GAME_HEIGHT) {
      return null;
    }

    const redBallsInPlay = balls.filter(b => b.color === 'red' && b.y < GAME_HEIGHT);
    const blueBallsInPlay = balls.filter(b => b.color === 'blue' && b.y < GAME_HEIGHT);
    
    if (redBallsInPlay.length === 0 && ballsLeft.red > 0) return 'red';
    if (blueBallsInPlay.length === 0 && ballsLeft.blue > 0) return 'blue';
    if (redBallsInPlay.length === 0) return ballsLeft.blue > 0 ? 'blue' : null;
    if (blueBallsInPlay.length === 0) return ballsLeft.red > 0 ? 'red' : null;

    const redDistances = redBallsInPlay.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
    const blueDistances = blueBallsInPlay.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
    
    const closestRed = redDistances[0] ?? Infinity;
    const closestBlue = blueDistances[0] ?? Infinity;
    
    const nextPlayer = closestRed <= closestBlue ? 'blue' : 'red';
    
    if (ballsLeft[nextPlayer] > 0) {
      return nextPlayer;
    } 
    const otherPlayer = nextPlayer === 'red' ? 'blue' : 'red';
    if (ballsLeft[otherPlayer] > 0) {
      return otherPlayer;
    }
    
    return null;
  }, [balls, ballsLeft]);
  
  const calculateRoundScore = () => {
    const jack = balls.find(b => b.color === 'white');
    if (!jack || jack.y >= GAME_HEIGHT) { // Jack is out of bounds
        setRoundWinner(null);
        setPhase('roundEnd');
        return;
    }

    const redBallsInPlay = balls.filter(b => b.color === 'red' && b.y < GAME_HEIGHT);
    const blueBallsInPlay = balls.filter(b => b.color === 'blue' && b.y < GAME_HEIGHT);

    if(redBallsInPlay.length === 0 && blueBallsInPlay.length === 0) {
        setRoundWinner(null);
        setPhase('roundEnd');
        return;
    }

    const redDistances = redBallsInPlay.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
    const blueDistances = blueBallsInPlay.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
    
    let score = 0;
    let winner: Player | null = null;
    
    const closestRed = redDistances[0] ?? Infinity;
    const closestBlue = blueDistances[0] ?? Infinity;
    
    if (closestRed < closestBlue) {
      winner = 'red';
      for (const dist of redDistances) {
        if (dist < closestBlue) score++;
        else break;
      }
    } else if (closestBlue < closestRed) {
      winner = 'blue';
      for (const dist of blueDistances) {
        if (dist < closestRed) score++;
        else break;
      }
    }

    if (winner) {
      setRoundScore({ red: winner === 'red' ? score : 0, blue: winner === 'blue' ? score : 0 });
      setTotalScore(prev => ({...prev, [winner!]: prev[winner!] + score}));
      setRoundWinner(winner);
    } else {
      setRoundWinner(null);
    }
    setPhase('roundEnd');
  }

  const getBallToPlay = React.useCallback(() => {
    if (phase !== 'newRound' && phase !== 'turnEnd') return null;

    const isJackTurn = !balls.some(b => b.color === 'white' && b.y < GAME_HEIGHT);
    
    if (isJackTurn) {
        const existingJack = balls.find(b => b.id === 0);
        if (existingJack && existingJack.y < TOTAL_HEIGHT) return existingJack;
        const newJack = { id: 0, x: GAME_WIDTH / 2, y: TOTAL_HEIGHT - 50, vx: 0, vy: 0, color: 'white' as const };
        if(!existingJack) {
             setBalls(prev => [...prev, newJack]);
        }
        return newJack;
    }

    if (ballsLeft[currentPlayer] > 0) {
        const newId = (currentPlayer === 'red' ? 100 : 200) + (INITIAL_BALLS_PER_PLAYER - ballsLeft[currentPlayer]);
        const existingBall = balls.find(b => b.id === newId);
        if (existingBall) return existingBall;

        const newBall = { id: newId, x: GAME_WIDTH / 2, y: TOTAL_HEIGHT - 50, vx: 0, vy: 0, color: currentPlayer };
        setBalls(prev => [...prev, newBall]);
        return newBall;
    }
    
    return null;
  }, [balls, currentPlayer, ballsLeft, phase]);


  const handleMouseDown = (e: React.MouseEvent) => {
    const ballToPlay = getBallToPlay();
    if (!ballToPlay || phase === 'simulating' || phase === 'roundEnd') return;

    const rect = gameAreaRef.current!.getBoundingClientRect();
    const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const dist = Math.hypot(mousePos.x - ballToPlay.x, mousePos.y - ballToPlay.y);
    if (dist < BALL_RADIUS) {
      setAimingPhase('arming');
      setAimStart({ x: ballToPlay.x, y: ballToPlay.y });
      setCurrentMousePos({ x: ballToPlay.x, y: ballToPlay.y });
      setPhase('aiming');
    }
  };


  const handleMouseUp = (e: React.MouseEvent) => {
    const ballToPlay = getBallToPlay();
    if (!ballToPlay || phase !== 'aiming' || aimingPhase !== 'arming' || !aimStart || !currentMousePos) return;

    const pullVector = { x: currentMousePos.x - aimStart.x, y: currentMousePos.y - aimStart.y };
    const dist = Math.hypot(pullVector.x, pullVector.y);
    
    if (dist > 5) { // Minimum pull distance to shoot
        const power = (Math.min(dist, THROWING_AREA_HEIGHT * 0.8) / (THROWING_AREA_HEIGHT * 0.8)) * MAX_POWER;
        const angle = Math.atan2(-pullVector.y, -pullVector.x); // Shoot in the opposite direction of the pull
        const velocity = { vx: Math.cos(angle) * power, vy: Math.sin(angle) * power };
        
        const wasJackTurn = ballToPlay.color === 'white';

        setBalls(currentBalls => currentBalls.map(b => b.id === ballToPlay.id ? { ...b, ...velocity } : b));
        
        if (!wasJackTurn) {
            setBallsLeft(prev => ({ ...prev, [ballToPlay.color as Player]: prev[ballToPlay.color as Player] - 1 }));
        }

        setPhase('simulating');
    } else {
        // If not pulled far enough, cancel the shot
        setPhase(phase => phase === 'newRound' ? 'newRound' : 'turnEnd');
    }

    setAimingPhase('idle');
    setAimStart(null);
    setCurrentMousePos(null);
  };


  const handleMouseMove = (e: React.MouseEvent) => {
    if (phase !== 'aiming' || aimingPhase !== 'arming' || !aimStart) return;
    const rect = gameAreaRef.current!.getBoundingClientRect();
    const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    const pullVector = { x: mousePos.x - aimStart.x, y: mousePos.y - aimStart.y };
    const pullDist = Math.hypot(pullVector.x, pullVector.y);
    const maxPull = THROWING_AREA_HEIGHT * 0.8;
    
    if (pullDist > maxPull) {
      const angle = Math.atan2(pullVector.y, pullVector.x);
      setCurrentMousePos({
        x: aimStart.x + Math.cos(angle) * maxPull,
        y: aimStart.y + Math.sin(angle) * maxPull,
      });
    } else {
      setCurrentMousePos(mousePos);
    }
  };

  React.useEffect(() => {
    let animationFrameId: number;
    let lastJackThrownPlayer: Player | null = null;

    const gameLoop = () => {
        setBalls(currentBalls => {
            if (phase !== 'simulating') return currentBalls;
            
            const wasJackTurn = !currentBalls.some(b => b.color === 'white' && b.y < GAME_HEIGHT);
            if (wasJackTurn) {
                lastJackThrownPlayer = currentPlayer;
            }

            let isMoving = false;
            const nextBalls = currentBalls.map(ball => {
                let newVx = ball.vx * FRICTION;
                let newVy = ball.vy * FRICTION;

                if (Math.abs(newVx) < MIN_VELOCITY) newVx = 0;
                if (Math.abs(newVy) < MIN_VELOCITY) newVy = 0;

                if(newVx !== 0 || newVy !== 0) isMoving = true;

                return { ...ball, vx: newVx, vy: newVy, x: ball.x + newVx, y: ball.y + newVy };
            });

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
                if (nextBalls[i].x < BALL_RADIUS) { nextBalls[i].x = BALL_RADIUS; nextBalls[i].vx *= -0.8; }
                if (nextBalls[i].x > GAME_WIDTH - BALL_RADIUS) { nextBalls[i].x = GAME_WIDTH - BALL_RADIUS; nextBalls[i].vx *= -0.8; }
                if (nextBalls[i].y < BALL_RADIUS) { nextBalls[i].y = BALL_RADIUS; nextBalls[i].vy *= -0.8; }
                if (nextBalls[i].y > GAME_HEIGHT - BALL_RADIUS && nextBalls[i].y < TOTAL_HEIGHT) { 
                    nextBalls[i].y = GAME_HEIGHT - BALL_RADIUS; 
                    nextBalls[i].vy *= -0.8; 
                }
            }

            if (!isMoving) {
                // If the jack was just thrown, it's the other player's turn
                if(lastJackThrownPlayer) {
                    setCurrentPlayer(p => p === 'red' ? 'blue' : 'red');
                    setPhase('turnEnd');
                    lastJackThrownPlayer = null; // Reset for next throw
                } else {
                    const nextPlayer = determineNextPlayer();
                    if(nextPlayer) {
                        setCurrentPlayer(nextPlayer);
                        setPhase('turnEnd');
                    } else {
                         calculateRoundScore();
                    }
                }
            }
            return nextBalls;
        });
        animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase, determineNextPlayer, currentPlayer]);
  
  getBallToPlay();
  const isJackTurn = !balls.some(b => b.color === 'white');

  const cursorClass = (phase === 'newRound' || phase === 'turnEnd') && aimingPhase === 'idle'
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

  let aimVector = { x: 0, y: 0 };
  let powerPercent = 0;
  if (phase === 'aiming' && aimStart && currentMousePos) {
      aimVector = { x: currentMousePos.x - aimStart.x, y: currentMousePos.y - aimStart.y };
      powerPercent = Math.hypot(aimVector.x, aimVector.y) / (THROWING_AREA_HEIGHT * 0.8) * 100;
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <Card className="w-auto shadow-2xl bg-zinc-800 text-white border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="font-headline text-3xl">Boccia</CardTitle>
           <div className="flex gap-8 items-center">
             <div className="text-center">
                <p className={cn("text-lg font-bold text-red-500", currentPlayer === 'red' && phase !== 'roundEnd' && 'animate-pulse')}>Joueur Rouge</p>
                <p>Score: {totalScore.red}</p>
             </div>
              <div className="text-center">
                <p className={cn("text-lg font-bold text-blue-500", currentPlayer === 'blue' && phase !== 'roundEnd' && 'animate-pulse')}>Joueur Bleu</p>
                <p>Score: {totalScore.blue}</p>
             </div>
           </div>
        </CardHeader>
        <CardContent>
          <div
            ref={gameAreaRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={aimingPhase === 'arming' ? handleMouseUp : undefined} // Shoot if mouse leaves area
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
            {phase === 'aiming' && aimStart && currentMousePos && (
                <svg className="absolute inset-0 pointer-events-none w-full h-full">
                    <defs>
                        <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: 'lightgreen'}} />
                            <stop offset="50%" style={{stopColor: 'yellow'}} />
                            <stop offset="100%" style={{stopColor: 'red'}} />
                        </linearGradient>
                    </defs>
                    {/* Aiming line */}
                    <line
                        x1={aimStart.x}
                        y1={aimStart.y}
                        x2={aimStart.x - aimVector.x}
                        y2={aimStart.y - aimVector.y}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                     {/* Power bar */}
                    <rect x={aimStart.x - 5} y={aimStart.y + 20} width="10" height="50" fill="rgba(0,0,0,0.5)" rx="2"/>
                    <rect x={aimStart.x - 5} y={aimStart.y + 20 + (50 * (1-powerPercent/100))} width="10" height={50 * (powerPercent/100)} fill="url(#powerGradient)" rx="2"/>
                </svg>
            )}
            {phase === 'roundEnd' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                    <h3 className="text-3xl font-bold">Fin de la manche</h3>
                     {roundWinner && <p className="text-xl mt-2">{`Le joueur ${roundWinner === 'red' ? 'Rouge' : 'Bleu'} marque ${roundScore[roundWinner]} points.`}</p>}
                     {!roundWinner && (totalScore.red > 0 || totalScore.blue > 0) && <p className="text-xl mt-2">Égalité !</p>}
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

    