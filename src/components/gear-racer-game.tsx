'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const GAME_DURATION = 60; // seconds
const MAX_SPEED = 9;
const ACCELERATION = 0.6;
const DRAG = 0.94;
const TURN_RESPONSIVENESS = 0.12;
const EDGE_PADDING = 48;
const GEAR_RADIUS = 26;

interface RacerState {
  car: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    heading: number;
  };
  target: {
    x: number;
    y: number;
  };
  gear: {
    x: number;
    y: number;
  };
}

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const createInitialState = (width: number, height: number): RacerState => {
  const centerX = width / 2;
  const centerY = height / 2;
  return {
    car: {
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      heading: 0,
    },
    target: {
      x: centerX,
      y: centerY,
    },
    gear: {
      x: randomInRange(EDGE_PADDING, width - EDGE_PADDING),
      y: randomInRange(EDGE_PADDING, height - EDGE_PADDING),
    },
  };
};

const drawGear = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
  const teeth = 8;
  const outerRadius = radius;
  const innerRadius = radius * 0.65;
  const centerRadius = radius * 0.35;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Date.now() / 400);
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const nextAngle = ((i + 1) / teeth) * Math.PI * 2;

    ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    ctx.lineTo(Math.cos((angle + nextAngle) / 2) * innerRadius, Math.sin((angle + nextAngle) / 2) * innerRadius);
  }
  ctx.closePath();
  ctx.fillStyle = '#facc15';
  ctx.shadowColor = 'rgba(234, 179, 8, 0.45)';
  ctx.shadowBlur = 16;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(0, 0, centerRadius * 0.3, 0, 0, centerRadius);
  gradient.addColorStop(0, '#fef3c7');
  gradient.addColorStop(1, '#d97706');
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function GearRacerGame({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const stateRef = useRef<RacerState | null>(null);
  const isGameOverRef = useRef(false);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [dimensions, setDimensions] = useState(() => ({
    width: 960,
    height: 600,
  }));

  const resizeGame = useCallback(() => {
    if (typeof window === 'undefined') return;
    const width = clamp(window.innerWidth - 40, 640, 1100);
    const height = clamp(window.innerHeight - 160, 420, 720);
    setDimensions({ width, height });
  }, []);

  const resetGame = useCallback(() => {
    const { width, height } = dimensions;
    const initialState = createInitialState(width, height);
    stateRef.current = initialState;
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsGameOver(false);
    isGameOverRef.current = false;
  }, [dimensions]);

  useEffect(() => {
    resizeGame();
    window.addEventListener('resize', resizeGame);
    return () => window.removeEventListener('resize', resizeGame);
  }, [resizeGame]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          isGameOverRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  const spawnNewGear = useCallback(() => {
    const { width, height } = dimensions;
    const gear = {
      x: randomInRange(EDGE_PADDING, width - EDGE_PADDING),
      y: randomInRange(EDGE_PADDING, height - EDGE_PADDING),
    };
    if (stateRef.current) {
      stateRef.current.gear = gear;
    }
  }, [dimensions]);

  const handlePointerUpdate = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;
    const rect = canvas.getBoundingClientRect();
    state.target = {
      x: clamp(clientX - rect.left, EDGE_PADDING * 0.5, rect.width - EDGE_PADDING * 0.5),
      y: clamp(clientY - rect.top, EDGE_PADDING * 0.5, rect.height - EDGE_PADDING * 0.5),
    };
  }, []);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    handlePointerUpdate(event.clientX, event.clientY);
  }, [handlePointerUpdate]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.buttons === 0 && event.pointerType !== 'touch') return;
    handlePointerUpdate(event.clientX, event.clientY);
  }, [handlePointerUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (timestamp: number) => {
      const state = stateRef.current;
      if (!state) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const delta = Math.min((timestamp - lastTimestamp) / (1000 / 60), 3);
      lastTimestamp = timestamp;

      const { width, height } = dimensions;
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.roundRect(24, 24, width - 48, height - 48, 40);
      ctx.fill();
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      const gridSize = 80;
      for (let x = 40; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 32);
        ctx.lineTo(x, height - 32);
        ctx.stroke();
      }
      for (let y = 40; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(32, y);
        ctx.lineTo(width - 32, y);
        ctx.stroke();
      }

      if (!isGameOverRef.current) {
        const car = state.car;
        const target = state.target;

        const toTargetX = target.x - car.x;
        const toTargetY = target.y - car.y;
        const distance = Math.hypot(toTargetX, toTargetY);
        const desiredAngle = Math.atan2(toTargetY, toTargetX);

        const accelMagnitude = ACCELERATION * clamp(distance / 120, 0, 1.8);
        car.vx += Math.cos(desiredAngle) * accelMagnitude * delta;
        car.vy += Math.sin(desiredAngle) * accelMagnitude * delta;

        car.vx *= DRAG;
        car.vy *= DRAG;

        const speed = Math.hypot(car.vx, car.vy);
        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          car.vx *= scale;
          car.vy *= scale;
        }

        car.x += car.vx * delta;
        car.y += car.vy * delta;

        const velocityAngle = Math.atan2(car.vy, car.vx) || car.heading;
        const angleDiff = ((velocityAngle - car.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        car.heading += angleDiff * TURN_RESPONSIVENESS * delta;

        if (car.x < EDGE_PADDING) {
          car.x = EDGE_PADDING;
          car.vx *= -0.4;
        }
        if (car.x > width - EDGE_PADDING) {
          car.x = width - EDGE_PADDING;
          car.vx *= -0.4;
        }
        if (car.y < EDGE_PADDING) {
          car.y = EDGE_PADDING;
          car.vy *= -0.4;
        }
        if (car.y > height - EDGE_PADDING) {
          car.y = height - EDGE_PADDING;
          car.vy *= -0.4;
        }

        const gear = state.gear;
        const gearDistance = Math.hypot(car.x - gear.x, car.y - gear.y);
        if (gearDistance < GEAR_RADIUS + 26) {
          setScore(prev => prev + 1);
          spawnNewGear();
        }

        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 10]);
        ctx.beginPath();
        ctx.moveTo(car.x, car.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(target.x, target.y);
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 28 + Math.sin(timestamp / 200) * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const gear = state.gear;
      drawGear(ctx, gear.x, gear.y, GEAR_RADIUS);

      const car = state.car;
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.heading);

      const driftAngle = Math.atan2(car.vy, car.vx);
      const driftOffset = clamp(((driftAngle - car.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI, -Math.PI / 4, Math.PI / 4);

      ctx.save();
      ctx.rotate(driftOffset * 0.6);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.beginPath();
      ctx.ellipse(-10, 18, 6, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(10, 18, 6, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#1d4ed8';
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(16, 24);
      ctx.quadraticCurveTo(0, 32, -16, 24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(12, 16);
      ctx.quadraticCurveTo(0, 24, -12, 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.ellipse(-12, 12, 4, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(12, 12, 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, -10, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [dimensions, spawnNewGear]);

  const handleReplay = useCallback(() => {
    onReplay();
    resetGame();
  }, [onReplay, resetGame]);

  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  useEffect(() => {
    if (!isGameOver) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, [isGameOver]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white">
      <div className="relative w-full flex flex-col items-center gap-6">
        <div className="absolute top-4 left-4 z-20">
          <Button onClick={onExit} variant="secondary">
            <ArrowLeft className="mr-2" /> Quitter
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <Button onClick={handleReplay} disabled={!canReplay} variant="outline">
            <RefreshCw className="mr-2" /> Rejouer ({gameCost})
          </Button>
        </div>
        <div className="text-center space-y-2 mt-16">
          <h1 className="font-headline text-4xl">Rallye des Rouages</h1>
          <p className="text-slate-300">Fonce vers ton doigt ou ta souris pour attraper un maximum de rouages avant la fin du chrono !</p>
        </div>
        <div className="flex items-center gap-6 text-lg font-semibold bg-slate-800/60 px-6 py-3 rounded-full shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Temps</span>
            <span className="text-amber-300 text-2xl tracking-wide">{formattedTime}</span>
          </div>
          <div className="h-6 w-px bg-slate-600" />
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Rouages attrapés</span>
            <span className="text-emerald-300 text-2xl">{score}</span>
          </div>
        </div>
        <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="rounded-[32px] shadow-2xl border border-slate-700 bg-slate-900 touch-none"
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-2 rounded-full text-sm text-slate-200 tracking-wide backdrop-blur">
            Glisse ton doigt ou ta souris pour guider la voiture. Attrape les rouages dorés pour marquer des points.
          </div>

          {isGameOver && (
            <div className="absolute inset-0 rounded-[32px] bg-slate-950/80 backdrop-blur flex flex-col items-center justify-center gap-6 text-center px-8">
              <div>
                <h2 className="text-4xl font-headline">Temps écoulé !</h2>
                <p className="text-slate-300 mt-2">Tu as attrapé <span className="text-amber-300 font-semibold">{score}</span> rouage(s).</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button onClick={handleReplay} disabled={!canReplay} size="lg">
                  <RefreshCw className="mr-2" /> Rejouer ({gameCost} pépites)
                </Button>
                <Button onClick={onExit} variant="secondary" size="lg">
                  <ArrowLeft className="mr-2" /> Retour
                </Button>
              </div>
              {!canReplay && (
                <p className="text-xs text-amber-300 max-w-xs">Tu n'as plus assez de pépites pour rejouer. Retourne en classe pour en gagner davantage !</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
