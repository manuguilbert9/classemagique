
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';

// --- CONSTANTES DU JEU ---
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 650;
const THROWING_AREA_RATIO = 0.25;
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
const THROW_Y_RATIO: Record<'white' | Player, number> = {
  white: 0.5,
  red: 0.35,
  blue: 0.65
};

export function BocciaGame({ onExit }: { onExit: () => void; }) {
  const [balls, setBalls] = React.useState<Ball[]>([]);
  const [phase, setPhase] = React.useState<GamePhase>('newRound');
  const [currentPlayer, setCurrentPlayer] = React.useState<Player>('red');
  const [nextStartingPlayer, setNextStartingPlayer] = React.useState<Player>('red');
  const [ballsLeft, setBallsLeft] = React.useState<Record<Player, number>>({ red: INITIAL_BALLS_PER_PLAYER, blue: INITIAL_BALLS_PER_PLAYER });
  const [roundScore, setRoundScore] = React.useState<Record<Player, number>>({ red: 0, blue: 0 });
  const [totalScore, setTotalScore] = React.useState<Record<Player, number>>({ red: 0, blue: 0 });
  const [roundWinner, setRoundWinner] = React.useState<Player | null>(null);
  const [jackNeedsPlacement, setJackNeedsPlacement] = React.useState(true);
  const [roundNumber, setRoundNumber] = React.useState(1);
  const [areaSize, setAreaSize] = React.useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });

  const [aimingPhase, setAimingPhase] = React.useState<AimingPhase>('idle');
  const [ballToPlay, setBallToPlay] = React.useState<Ball | null>(null);
  const [aimingLine, setAimingLine] = React.useState<{ start: Vector; end: Vector } | null>(null);
  const [power, setPower] = React.useState(0);
  const activePointerId = React.useRef<number | null>(null);
  const lastThrowerRef = React.useRef<Player>('red');
  const roundStarterRef = React.useRef<Player>('red');

  const gameAreaRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const throwAreaWidth = React.useMemo(() => {
    const availableWidth = areaSize.width;
    if (availableWidth <= 400) {
      return availableWidth * 0.4;
    }
    const minWidth = 200;
    const maxWidth = Math.max(minWidth, availableWidth - 400);
    const target = availableWidth * THROWING_AREA_RATIO;
    return Math.min(Math.max(minWidth, target), maxWidth);
  }, [areaSize.width]);

  const fieldStartX = throwAreaWidth;
  const totalWidth = areaSize.width;
  const totalHeight = areaSize.height;

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
        if (!jack || jack.x <= fieldStartX || jack.x >= totalWidth) {
          toast({
            title: "Lancer du Jack raté !",
            description: "Le Jack doit s'arrêter sur le terrain."
          });
        } else {
          toast({
            title: "Fin de la manche !",
            description: "Égalité, aucun point marqué."
          });
        }
      }
    }
  }, [phase, roundWinner, roundScore, toast, balls, fieldStartX, totalWidth]);


  const startNewRound = React.useCallback((forcedStarter?: Player, resetRound?: boolean) => {
    setBalls([]);
    setJackNeedsPlacement(true);
    const starter = forcedStarter ?? nextStartingPlayer;
    setCurrentPlayer(starter);
    roundStarterRef.current = starter;
    setBallsLeft({ red: INITIAL_BALLS_PER_PLAYER, blue: INITIAL_BALLS_PER_PLAYER });
    setRoundScore({ red: 0, blue: 0 });
    setBallToPlay(null);
    setAimingLine(null);
    setAimingPhase('idle');
    setPower(0);
    setPhase('newRound');
    setRoundNumber(prev => (resetRound ? 1 : prev + 1));
  }, [nextStartingPlayer]);

  const resetGame = React.useCallback(() => {
    setTotalScore({ red: 0, blue: 0 });
    setRoundWinner(null);
    setNextStartingPlayer('red');
    startNewRound('red', true);
  }, [startNewRound]);

  React.useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  const determineNextPlayer = React.useCallback((stateBalls: Ball[], stateBallsLeft: Record<Player, number>, activePlayer: Player): Player => {
    const jack = stateBalls.find(b => b.color === 'white');

    if (!jack || jack.x <= fieldStartX || jack.x >= totalWidth) return activePlayer;

    const inPlayBalls = stateBalls.filter(b => b.x >= fieldStartX && b.x <= totalWidth && b.color !== 'white');

    if (inPlayBalls.length === 0) {
      return activePlayer;
    }

    const redBallsInPlay = inPlayBalls.filter(b => b.color === 'red');
    const blueBallsInPlay = inPlayBalls.filter(b => b.color === 'blue');

    if (redBallsInPlay.length === 0 && stateBallsLeft.red > 0) return 'red';
    if (blueBallsInPlay.length === 0 && stateBallsLeft.blue > 0) return 'blue';

    const redDistances = redBallsInPlay.map(b => Math.hypot(b.x - jack.x, b.y - jack.y));
    const blueDistances = blueBallsInPlay.map(b => Math.hypot(b.x - jack.x, b.y - jack.y));

    const closestRed = redDistances.length ? Math.min(...redDistances) : Infinity;
    const closestBlue = blueDistances.length ? Math.min(...blueDistances) : Infinity;

    const nextPlayer = closestRed <= closestBlue ? 'blue' : 'red';

    if (stateBallsLeft[nextPlayer] > 0) {
      return nextPlayer;
    }
    return nextPlayer === 'red' ? 'blue' : 'red';
  }, [fieldStartX, totalWidth]);

  const calculateRoundScore = React.useCallback(() => {
    const jack = balls.find(b => b.color === 'white');
    if (!jack || jack.x <= fieldStartX || jack.x >= totalWidth) {
        setRoundWinner(null);
        setPhase('roundEnd');
        return;
    }

    const redBallsInPlay = balls.filter(b => b.color === 'red' && b.x >= fieldStartX && b.x <= totalWidth);
    const blueBallsInPlay = balls.filter(b => b.color === 'blue' && b.x >= fieldStartX && b.x <= totalWidth);

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
      setNextStartingPlayer(winner);
    } else {
      setRoundWinner(null);
      setNextStartingPlayer(roundStarterRef.current);
    }
    setPhase('roundEnd');
  }, [balls, fieldStartX, totalWidth]);

  const getThrowOrigin = React.useCallback((color: 'white' | Player): Vector => {
    return {
      x: throwAreaWidth * 0.5,
      y: totalHeight * THROW_Y_RATIO[color]
    };
  }, [throwAreaWidth, totalHeight]);

  const getBallToPlay = React.useCallback(() => {
     if (jackNeedsPlacement) {
        const origin = getThrowOrigin('white');
        return { id: 0, x: origin.x, y: origin.y, vx: 0, vy: 0, color: 'white' as const };
     }

     if (ballsLeft[currentPlayer] <= 0) return null;

     const newId = (currentPlayer === 'red' ? 100 : 200) + (INITIAL_BALLS_PER_PLAYER - ballsLeft[currentPlayer]);
     const origin = getThrowOrigin(currentPlayer);

     return { id: newId, x: origin.x, y: origin.y, vx: 0, vy: 0, color: currentPlayer };
  }, [jackNeedsPlacement, ballsLeft, currentPlayer, getThrowOrigin]);
  
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
              calculateRoundScore();
          }
      }
    }
  }, [phase, aimingPhase, getBallToPlay, ballsLeft, calculateRoundScore]);


  const getPointerPosition = React.useCallback((clientX: number, clientY: number): Vector | null => {
    if (!gameAreaRef.current) return null;
    const rect = gameAreaRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const updateAimingLine = React.useCallback((target: Vector) => {
    if (!ballToPlay) return;
    setAimingLine({ start: { x: ballToPlay.x, y: ballToPlay.y }, end: target });
    const dragVector = { x: ballToPlay.x - target.x, y: ballToPlay.y - target.y };
    const dist = Math.hypot(dragVector.x, dragVector.y);
    setPower(Math.min(dist / 12, MAX_POWER));
  }, [ballToPlay]);

  const releaseCurrentShot = React.useCallback((target: Vector) => {
    if (!ballToPlay) return;

    const dragVector = { x: ballToPlay.x - target.x, y: ballToPlay.y - target.y };
    const dist = Math.hypot(dragVector.x, dragVector.y);

    const shotPower = Math.min(dist / 12, MAX_POWER);
    if (shotPower < 0.2) {
      setAimingPhase('idle');
      setAimingLine(null);
      setPower(0);
      return;
    }

    const normalized = dist === 0 ? { x: 0, y: 0 } : { x: dragVector.x / dist, y: dragVector.y / dist };
    const velocity = { vx: normalized.x * shotPower, vy: normalized.y * shotPower };

    const wasJackTurn = ballToPlay.color === 'white';
    lastThrowerRef.current = wasJackTurn ? currentPlayer : ballToPlay.color as Player;

    setBalls(prev => [...prev, { ...ballToPlay, ...velocity }]);

    if (!wasJackTurn) {
      setBallsLeft(prev => ({ ...prev, [ballToPlay.color as Player]: prev[ballToPlay.color as Player] - 1 }));
    }

    setPhase('simulating');
    setAimingPhase('idle');
    setBallToPlay(null);
    setAimingLine(null);
    setPower(0);
  }, [ballToPlay, currentPlayer]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== 'aiming' || aimingPhase !== 'idle' || !ballToPlay) return;

    const pos = getPointerPosition(e.clientX, e.clientY);
    if (!pos) return;

    const dist = Math.hypot(pos.x - ballToPlay.x, pos.y - ballToPlay.y);
    if (dist > BALL_RADIUS * 1.6) return;

    e.preventDefault();
    activePointerId.current = e.pointerId;
    gameAreaRef.current?.setPointerCapture(e.pointerId);
    setAimingPhase('arming');
    updateAimingLine(pos);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (phase !== 'aiming' || aimingPhase !== 'arming' || activePointerId.current !== e.pointerId) return;
    const pos = getPointerPosition(e.clientX, e.clientY);
    if (!pos) return;
    updateAimingLine(pos);
  };

  const finishAiming = (pointerId: number | null) => {
    if (pointerId !== null) {
      try {
        gameAreaRef.current?.releasePointerCapture(pointerId);
      } catch {
        // Ignore release errors (pointer already released)
      }
    }
    activePointerId.current = null;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (phase !== 'aiming' || aimingPhase !== 'arming' || activePointerId.current !== e.pointerId) {
      finishAiming(null);
      return;
    }

    const pos = getPointerPosition(e.clientX, e.clientY);
    if (pos) {
      releaseCurrentShot(pos);
    }
    finishAiming(e.pointerId);
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (activePointerId.current !== e.pointerId) return;
    finishAiming(e.pointerId);
    setAimingPhase('idle');
    setAimingLine(null);
    setPower(0);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (aimingPhase === 'arming' && activePointerId.current === e.pointerId) {
      handlePointerCancel(e);
    }
  };

  React.useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      if (phase === 'simulating') {
        let isMoving = false;
        setBalls(currentBalls => {
          const hadJack = currentBalls.some(b => b.color === 'white');
          const nextBalls = currentBalls.map(ball => {
            let newVx = ball.vx * FRICTION;
            let newVy = ball.vy * FRICTION;

            if (Math.abs(newVx) < MIN_VELOCITY) newVx = 0;
            if (Math.abs(newVy) < MIN_VELOCITY) newVy = 0;

            if (newVx !== 0 || newVy !== 0) isMoving = true;

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
            if (nextBalls[i].x > totalWidth - BALL_RADIUS) { nextBalls[i].x = totalWidth - BALL_RADIUS; nextBalls[i].vx *= -0.8; }
            if (nextBalls[i].y < BALL_RADIUS) { nextBalls[i].y = BALL_RADIUS; nextBalls[i].vy *= -0.8; }
            if (nextBalls[i].y > totalHeight - BALL_RADIUS) {
              nextBalls[i].y = totalHeight - BALL_RADIUS;
              nextBalls[i].vy *= -0.8;
            }
          }

          if (!isMoving) {
            const jackBall = nextBalls.find(b => b.color === 'white');

            if (!jackBall || jackBall.x <= fieldStartX || jackBall.x >= totalWidth) {
              if (jackNeedsPlacement) {
                if (hadJack) {
                  toast({
                    title: 'Jack hors zone',
                    description: 'Le Jack doit rester sur le terrain. C\'est à l\'autre joueur de le relancer.'
                  });
                  setCurrentPlayer(lastThrowerRef.current === 'red' ? 'blue' : 'red');
                }
                setJackNeedsPlacement(true);
                setPhase('newRound');
                return nextBalls.filter(b => b.color !== 'white');
              }

              setRoundWinner(null);
              setRoundScore({ red: 0, blue: 0 });
              setNextStartingPlayer(roundStarterRef.current);
              setPhase('roundEnd');
              return nextBalls;
            }

            if (jackNeedsPlacement) {
              setJackNeedsPlacement(false);
              roundStarterRef.current = lastThrowerRef.current;
              setCurrentPlayer(lastThrowerRef.current);
              setPhase('turnEnd');
              return nextBalls;
            }

            if (ballsLeft.red === 0 && ballsLeft.blue === 0) {
              calculateRoundScore();
            } else {
              const nextPlayer = determineNextPlayer(nextBalls, ballsLeft, currentPlayer);
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
  }, [phase, determineNextPlayer, ballsLeft, jackNeedsPlacement, currentPlayer, calculateRoundScore, toast, fieldStartX, totalHeight, totalWidth]);
  
  const statusMessage = React.useMemo(() => {
    const playerLabel = currentPlayer === 'red' ? 'Rouge' : 'Bleu';

    if (phase === 'roundEnd') {
      return 'La manche est terminée.';
    }

    if (jackNeedsPlacement) {
      return `Placer le Jack : au joueur ${playerLabel} de jouer.`;
    }

    if (phase === 'simulating') {
      return 'Les boules sont encore en mouvement...';
    }

    if (phase === 'aiming' && aimingPhase === 'arming') {
      return 'Relâchez pour tirer !';
    }

    return `Au tour du joueur ${playerLabel}.`;
  }, [phase, jackNeedsPlacement, currentPlayer, aimingPhase]);

  const pointerColor: Player | null = React.useMemo(() => {
    if (phase !== 'aiming' || !ballToPlay) return null;
    if (jackNeedsPlacement || ballToPlay.color === 'white') {
      return currentPlayer;
    }
    return ballToPlay.color as Player;
  }, [phase, ballToPlay, jackNeedsPlacement, currentPlayer]);

  const cursorClass = React.useMemo(() => {
    if (phase !== 'aiming' || !ballToPlay) return 'cursor-default';
    if (aimingPhase === 'arming') return 'cursor-grabbing';
    if (!pointerColor) return 'cursor-default';
    return pointerColor === 'red'
      ? 'cursor-[url(/cursors/red.svg),_pointer]'
      : 'cursor-[url(/cursors/blue.svg),_pointer]';
  }, [phase, ballToPlay, aimingPhase, pointerColor]);

    
  const RemainingBalls = ({ player, count }: { player: Player; count: number }) => (
    <div className="flex gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('h-5 w-5 rounded-full border-2', {
            'bg-red-600 border-red-800': player === 'red',
            'bg-blue-600 border-blue-800': player === 'blue',
          })}
        />
      ))}
    </div>
  );

  React.useLayoutEffect(() => {
    if (!gameAreaRef.current || typeof ResizeObserver === 'undefined') return;
    const element = gameAreaRef.current;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setAreaSize({ width, height });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="flex h-screen w-screen flex-col bg-gray-900 text-white">
      <header className="flex flex-col gap-2 border-b border-zinc-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-4xl">Boccia</h1>
            <p className="text-sm text-zinc-300">Manche {roundNumber}</p>
          </div>
          <div className="flex items-start gap-8">
            <div className="text-right">
              <p
                className={cn(
                  'text-lg font-bold text-red-400',
                  phase !== 'roundEnd' && currentPlayer === 'red' ? 'animate-pulse' : ''
                )}
              >
                Joueur Rouge
              </p>
              <div className="mt-1 flex items-center justify-end gap-4 text-sm">
                <span>Score : {totalScore.red}</span>
                <RemainingBalls player="red" count={ballsLeft.red} />
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'text-lg font-bold text-blue-400',
                  phase !== 'roundEnd' && currentPlayer === 'blue' ? 'animate-pulse' : ''
                )}
              >
                Joueur Bleu
              </p>
              <div className="mt-1 flex items-center justify-end gap-4 text-sm">
                <span>Score : {totalScore.blue}</span>
                <RemainingBalls player="blue" count={ballsLeft.blue} />
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-zinc-400">{statusMessage}</p>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-8 pb-8">
        <div
          ref={gameAreaRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerLeave}
          className={cn(
            'relative flex-1 overflow-hidden rounded-xl border-4 border-yellow-700 bg-zinc-800 shadow-2xl touch-none',
            cursorClass
          )}
        >
          <div className="absolute inset-y-0 left-0" style={{ width: throwAreaWidth }}>
            <div className="h-full w-full bg-emerald-900/70" />
          </div>
          <div className="absolute inset-y-0" style={{ left: throwAreaWidth, right: 0 }}>
            <div className="h-full w-full bg-emerald-800" />
          </div>

          {balls.map(ball => (
            <div
              key={ball.id}
              className={cn('absolute rounded-full border-2 shadow-lg', {
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
              className={cn('absolute rounded-full border-2 shadow-lg', {
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
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              <line
                x1={aimingLine.start.x}
                y1={aimingLine.start.y}
                x2={aimingLine.end.x}
                y2={aimingLine.end.y}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          )}

          {aimingPhase === 'arming' && (
            <div className="absolute bottom-6 left-1/2 w-1/2 -translate-x-1/2">
              <p className="mb-1 text-center text-sm">Puissance</p>
              <Progress value={(power / MAX_POWER) * 100} className="h-4 w-full" />
            </div>
          )}

          {phase === 'roundEnd' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70">
              <h3 className="text-3xl font-bold">Fin de la manche</h3>
              {roundWinner && (
                <p className="mt-2 text-xl">{`Le joueur ${roundWinner === 'red' ? 'Rouge' : 'Bleu'} marque ${roundScore[roundWinner]} point(s).`}</p>
              )}
              {!roundWinner && <p className="mt-2 text-xl">Aucun point marqué.</p>}
              <Button onClick={() => startNewRound()} className="mt-6">Manche suivante</Button>
            </div>
          )}
        </div>
        <div className="flex justify-between gap-4">
          <Button onClick={onExit}>
            <ArrowLeft className="mr-2" /> Quitter
          </Button>
          <Button onClick={resetGame} variant="secondary">
            <RefreshCw className="mr-2" /> Recommencer la partie
          </Button>
        </div>
      </div>
    </main>
  );
}
