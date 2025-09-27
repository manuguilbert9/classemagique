
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';

// --- CONSTANTES DU JEU ---
const GAME_WIDTH = 800;
const THROWING_AREA_HEIGHT = 250;
const GAME_HEIGHT = 600;
const TOTAL_HEIGHT = GAME_HEIGHT + THROWING_AREA_HEIGHT;
const BALL_RADIUS = 15;
const FRICTION = 0.98;
const MIN_VELOCITY = 0.05;
const MAX_POWER = 15;

// --- TYPES ---
type Vector = { x: number; y: number };
type Player = 'red' | 'blue';
type GamePhase =
  | 'newRound'
  | 'aiming'
  | 'simulating'
  | 'turnEnd'
  | 'roundEnd'
  | 'gameOver';

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

  const [aimingPhase, setAimingPhase] = React.useState<AimingPhase>('idle');
  const [ballToPlay, setBallToPlay] = React.useState<Ball | null>(null);
  const [aimingLine, setAimingLine] = React.useState<{ start: Vector; end: Vector } | null>(null);
  const [power, setPower] = React.useState(0);

  const gameAreaRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (phase === 'roundEnd') {
      const winner = roundWinner;
      if (winner) {
        toast({
          title: "Fin de la manche !",
          description: `Le joueur ${winner === 'red' ? 'Rouge' : 'Bleu'} marque ${roundScore[winner]} point(s).`
        });
      } else {
        const jack = balls.find(b => b.color === 'white');
        if (!jack || jack.y >= GAME_HEIGHT) {
            toast({
              title: "Lancer du Jack raté !",
              description: "Le Jack doit s'arrêter dans la zone verte."
            });
        } else {
            toast({
              title: "Fin de la manche !",
              description: "Égalité, aucun point marqué."
            });
        }
      }
    }
  }, [phase, roundWinner, roundScore, toast, balls]);


  const startNewRound = React.useCallback(() => {
    // Le joueur qui commence est celui qui a gagné la manche précédente.
    // Si la manche était nulle (lancer de jack raté), c'est à l'autre joueur.
    const startingPlayer = roundWinner === null ? (currentPlayer === 'red' ? 'blue' : 'red') : roundWinner;
    
    setBalls([]);
    setCurrentPlayer(startingPlayer); 
    setBallsLeft({ red: INITIAL_BALLS_PER_PLAYER, blue: INITIAL_BALLS_PER_PLAYER });
    setRoundScore({ red: 0, blue: 0 });
    setPhase('newRound');
  }, [roundWinner, currentPlayer]);

  const resetGame = React.useCallback(() => {
    setTotalScore({ red: 0, blue: 0 });
    setRoundWinner('red'); // Red starts the very first round
    startNewRound();
  }, [startNewRound]);

  React.useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  const determineNextPlayer = React.useCallback((): Player => {
    const jack = balls.find(b => b.color === 'white');
    
    // Case 1: Jack has just been thrown. It's the other player's turn.
    if (balls.length === 1 && jack) {
        return currentPlayer === 'red' ? 'blue' : 'red';
    }

    if (!jack || jack.y >= GAME_HEIGHT) return currentPlayer;

    const redBallsInPlay = balls.filter(b => b.color === 'red' && b.y < GAME_HEIGHT);
    const blueBallsInPlay = balls.filter(b => b.color === 'blue' && b.y < GAME_HEIGHT);
    
    if (redBallsInPlay.length === 0 && ballsLeft.red > 0) return 'red';
    if (blueBallsInPlay.length === 0 && ballsLeft.blue > 0) return 'blue';
  
    const redDistances = redBallsInPlay.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
    const blueDistances = blueBallsInPlay.map(b => Math.hypot(b.x - jack.x, b.y - jack.y)).sort((a, b) => a - b);
  
    const closestRed = redDistances[0] ?? Infinity;
    const closestBlue = blueDistances[0] ?? Infinity;
  
    const nextPlayer = closestRed <= closestBlue ? 'blue' : 'red';
  
    if (ballsLeft[nextPlayer] > 0) {
      return nextPlayer;
    }
    return nextPlayer === 'red' ? 'blue' : 'red';
  }, [balls, ballsLeft, currentPlayer]);
  
  const calculateRoundScore = () => {
    const jack = balls.find(b => b.color === 'white');
    if (!jack || jack.y >= GAME_HEIGHT) {
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
     const isJackTurn = !balls.some(b => b.color === 'white');
     
     if (isJackTurn) {
        return { id: 0, x: GAME_WIDTH / 2, y: GAME_HEIGHT + THROWING_AREA_HEIGHT / 2, vx: 0, vy: 0, color: 'white' as const };
     } else {
         if (ballsLeft[currentPlayer] <= 0) return null;
         const newId = (currentPlayer === 'red' ? 100 : 200) + (INITIAL_BALLS_PER_PLAYER - ballsLeft[currentPlayer]);
         return { id: newId, x: GAME_WIDTH / 2, y: GAME_HEIGHT + THROWING_AREA_HEIGHT / 2, vx: 0, vy: 0, color: currentPlayer };
     }
  }, [balls, ballsLeft, currentPlayer]);
  
  React.useEffect(() => {
    if ((phase === 'newRound' || phase === 'turnEnd') && aimingPhase === 'idle') {
      const nextBall = getBallToPlay();
      setBallToPlay(nextBall);
      if(nextBall) {
          setPhase('aiming');
      } else {
          // No balls left to play for current player, but maybe for the other one?
          if(ballsLeft.red > 0 || ballsLeft.blue > 0) {
              // This can happen if a player has finished their balls
              setCurrentPlayer(p => p === 'red' ? 'blue' : 'red');
              setPhase('turnEnd');
          } else {
              // Both players have no balls left. End of round simulation.
              if (phase !== 'simulating' && phase !== 'roundEnd') {
                calculateRoundScore();
              }
          }
      }
    }
  }, [phase, aimingPhase, getBallToPlay, ballsLeft]);


  const handleClick = (e: React.MouseEvent) => {
    if (phase !== 'aiming' || !gameAreaRef.current) return;
  
    if (aimingPhase === 'idle' && ballToPlay) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const dist = Math.hypot(mousePos.x - ballToPlay.x, mousePos.y - ballToPlay.y);
      if (dist < BALL_RADIUS) {
        setAimingPhase('arming');
      }
    } else if (aimingPhase === 'arming' && ballToPlay) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      
      const directionVector = { x: mousePos.x - ballToPlay.x, y: mousePos.y - ballToPlay.y };
      const angle = Math.atan2(directionVector.y, directionVector.x);
      
      const velocity = { vx: Math.cos(angle) * power, vy: Math.sin(angle) * power };
  
      const wasJackTurn = ballToPlay.color === 'white';
  
      setBalls(prev => [...prev, { ...ballToPlay, ...velocity }]);
  
      if (!wasJackTurn) {
        setBallsLeft(prev => ({ ...prev, [ballToPlay.color as Player]: prev[ballToPlay.color as Player] - 1 }));
      }
  
      setPhase('simulating');
      setAimingPhase('idle');
      setBallToPlay(null);
      setAimingLine(null);
      setPower(0);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (phase === 'aiming' && aimingPhase === 'arming' && ballToPlay) {
        const rect = gameAreaRef.current!.getBoundingClientRect();
        const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        setAimingLine({start: ballToPlay, end: mousePos});
        const dist = Math.hypot(mousePos.x - ballToPlay.x, mousePos.y - ballToPlay.y);
        setPower(Math.min(dist / 10, MAX_POWER));
    }
  }

  React.useEffect(() => {
    let animationFrameId: number;
    
    const gameLoop = () => {
        if (phase === 'simulating') {
            let isMoving = false;
            setBalls(currentBalls => {
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
                    if (nextBalls[i].y > TOTAL_HEIGHT - BALL_RADIUS) { 
                        nextBalls[i].y = TOTAL_HEIGHT - BALL_RADIUS; 
                        nextBalls[i].vy *= -0.8; 
                    }
                }
                
                if (!isMoving) {
                    if (ballsLeft.red === 0 && ballsLeft.blue === 0) {
                        calculateRoundScore();
                    } else {
                        const nextPlayer = determineNextPlayer();
                        setCurrentPlayer(nextPlayer);
                        setPhase('turnEnd');
                    }
                }
                return nextBalls;
            });
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase, determineNextPlayer, ballsLeft]);
  
  const cursorClass = (phase === 'aiming' && aimingPhase === 'idle' && ballToPlay)
    ? (ballToPlay.color === 'white' ? 'cursor-[url(/cursors/white.svg),_pointer]' : (ballToPlay.color === 'red' ? 'cursor-[url(/cursors/red.svg),_pointer]' : 'cursor-[url(/cursors/blue.svg),_pointer]'))
    : (phase === 'aiming' && aimingPhase === 'arming' ? 'cursor-crosshair' : 'cursor-default');

    
  const RemainingBalls = ({ player, count }: {player: Player, count: number}) => (
    <div className="flex flex-col items-center">
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
                <p className={cn("text-lg font-bold text-red-500", (phase !== 'roundEnd' && currentPlayer === 'red') ? 'animate-pulse' : '')}>Joueur Rouge</p>
                <div className="flex items-center gap-4">
                  <span>Score: {totalScore.red}</span>
                  <RemainingBalls player="red" count={ballsLeft.red} />
                </div>
             </div>
              <div className="text-center">
                <p className={cn("text-lg font-bold text-blue-500", (phase !== 'roundEnd' && currentPlayer === 'blue') ? 'animate-pulse' : '')}>Joueur Bleu</p>
                <div className="flex items-center gap-4">
                  <span>Score: {totalScore.blue}</span>
                   <RemainingBalls player="blue" count={ballsLeft.blue} />
                </div>
             </div>
           </div>
        </CardHeader>
        <CardContent>
          <div
            ref={gameAreaRef}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            className={cn("relative border-4 border-yellow-700 rounded-md overflow-hidden", cursorClass)}
            style={{ width: GAME_WIDTH, height: TOTAL_HEIGHT }}
          >
            {/* Main Playing Area */}
            <div className="absolute top-0 left-0 bg-green-800" style={{width: GAME_WIDTH, height: GAME_HEIGHT }} />
            
            {/* Throwing Area */}
            <div className="absolute bottom-0 left-0 bg-green-900/50" style={{width: GAME_WIDTH, height: THROWING_AREA_HEIGHT }}/>

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
            
            {ballToPlay && (
                 <div
                    key={ballToPlay.id}
                    className={cn("absolute rounded-full border-2 shadow-lg", {
                    'bg-white border-black': ballToPlay.color === 'white',
                    'bg-red-600 border-red-800': ballToPlay.color === 'red',
                    'bg-blue-600 border-blue-800': ballToPlay.color === 'blue',
                    })}
                    style={{
                    width: BALL_RADIUS * 2,
                    height: BALL_RADIUS * 2,
                    transform: `translate(${ballToPlay.x - BALL_RADIUS}px, ${ballToPlay.y - BALL_RADIUS}px)`,
                    }}
                />
            )}
            
             {aimingPhase === 'arming' && aimingLine && (
                 <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <defs>
                        <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor: 'lightgreen', stopOpacity: 1}} />
                            <stop offset="50%" style={{stopColor: 'yellow', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: 'red', stopOpacity: 1}} />
                        </linearGradient>
                    </defs>
                    <line x1={aimingLine.start.x} y1={aimingLine.start.y} x2={aimingLine.end.x} y2={aimingLine.end.y} stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="5,5" />
                 </svg>
            )}

            {aimingPhase === 'arming' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2">
                    <p className="text-center text-sm mb-1">Puissance</p>
                    <Progress value={ (power / MAX_POWER) * 100 } className="w-full h-4" />
                </div>
            )}


            {phase === 'roundEnd' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                    <h3 className="text-3xl font-bold">Fin de la manche</h3>
                     {roundWinner && <p className="text-xl mt-2">{`Le joueur ${roundWinner === 'red' ? 'Rouge' : 'Bleu'} marque ${roundScore[roundWinner]} point(s).`}</p>}
                     {!roundWinner && <p className="text-xl mt-2">Aucun point marqué.</p>}
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
