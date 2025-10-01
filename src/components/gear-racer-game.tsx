'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const GAME_DURATION = 60; // seconds
const MAX_SPEED = 9;
const ACCELERATION = 0.6;
const DRAG = 0.95;
const LATERAL_DRAG = 0.78;
const TURN_RESPONSIVENESS = 0.12;
const HEADING_ALIGNMENT_STRENGTH = 0.28;
const MIN_ALIGNMENT_SPEED = 0.35;
const FRONT_WHEEL_TURN_RATE = 0.22;
const FRONT_WHEEL_MAX_ANGLE = Math.PI / 3;
const CAR_LENGTH = 56;
const CAR_BODY_WIDTH = 36;
const CAR_BODY_LENGTH = 64;
const WHEEL_WIDTH = 12;
const WHEEL_HEIGHT = 22;
const WHEEL_OFFSET_X = CAR_BODY_WIDTH / 2 - 1;
const FRONT_WHEEL_Y = -CAR_BODY_LENGTH / 2 + 10;
const REAR_WHEEL_Y = CAR_BODY_LENGTH / 2 - 10;
const TOW_HOOK_OFFSET_Y = -CAR_BODY_LENGTH / 2 + 6;
const EDGE_PADDING = 48;
const GEAR_RADIUS = 26;

interface RacerState {
  car: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    heading: number;
    frontWheelAngle: number;
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
      frontWheelAngle: 0,
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

const angleDifference = (a: number, b: number) => {
  return ((a - b + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
};

const createAsphaltPattern = () => {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 140;
  patternCanvas.height = 140;
  const pctx = patternCanvas.getContext('2d');
  if (!pctx) return null;

  pctx.fillStyle = '#2b2f37';
  pctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

  for (let i = 0; i < 160; i++) {
    const size = Math.random() * 3 + 1;
    pctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.08)';
    pctx.fillRect(Math.random() * patternCanvas.width, Math.random() * patternCanvas.height, size, size);
  }

  for (let i = 0; i < 40; i++) {
    const radius = Math.random() * 1.6 + 0.6;
    pctx.beginPath();
    pctx.fillStyle = 'rgba(107,114,128,0.18)';
    pctx.arc(Math.random() * patternCanvas.width, Math.random() * patternCanvas.height, radius, 0, Math.PI * 2);
    pctx.fill();
  }

  return patternCanvas;
};

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
  const asphaltPatternRef = useRef<CanvasPattern | null>(null);
  const asphaltCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

    if (!asphaltCanvasRef.current) {
      asphaltCanvasRef.current = createAsphaltPattern();
    }
    if (asphaltCanvasRef.current && !asphaltPatternRef.current) {
      asphaltPatternRef.current = ctx.createPattern(asphaltCanvasRef.current, 'repeat');
    }

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

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const trackPadding = 36;
      const trackX = trackPadding;
      const trackY = trackPadding;
      const trackWidth = width - trackPadding * 2;
      const trackHeight = height - trackPadding * 2;
      const trackRadius = 44;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(trackX, trackY, trackWidth, trackHeight, trackRadius);
      if (asphaltPatternRef.current) {
        ctx.fillStyle = asphaltPatternRef.current;
      } else {
        ctx.fillStyle = '#374151';
      }
      ctx.fill();

      ctx.globalAlpha = 0.22;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(trackX, trackY, trackWidth, trackHeight);
      ctx.globalAlpha = 1;

      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(trackX, trackY, trackWidth, trackHeight, trackRadius);
      ctx.lineWidth = 26;
      ctx.strokeStyle = '#f8fafc';
      ctx.stroke();
      ctx.setLineDash([34, 24]);
      ctx.strokeStyle = '#ef4444';
      ctx.stroke();
      ctx.restore();

      if (!isGameOverRef.current) {
        const car = state.car;
        const target = state.target;

        const toTargetX = target.x - car.x;
        const toTargetY = target.y - car.y;
        const distance = Math.hypot(toTargetX, toTargetY);
        const desiredDirection = Math.atan2(toTargetY, toTargetX);
        const headingDiff = angleDifference(desiredDirection, car.heading);
        const targetFrontWheelAngle = clamp(headingDiff, -FRONT_WHEEL_MAX_ANGLE, FRONT_WHEEL_MAX_ANGLE);

        car.frontWheelAngle += (targetFrontWheelAngle - car.frontWheelAngle) * FRONT_WHEEL_TURN_RATE * delta;
        car.frontWheelAngle = clamp(car.frontWheelAngle, -FRONT_WHEEL_MAX_ANGLE, FRONT_WHEEL_MAX_ANGLE);

        const accelMagnitude = ACCELERATION * clamp(distance / 120, 0, 1.8);
        car.vx += Math.cos(car.heading) * accelMagnitude * delta;
        car.vy += Math.sin(car.heading) * accelMagnitude * delta;

        const forwardX = Math.cos(car.heading);
        const forwardY = Math.sin(car.heading);
        const rightX = -forwardY;
        const rightY = forwardX;

        let forwardSpeed = car.vx * forwardX + car.vy * forwardY;
        let lateralSpeed = car.vx * rightX + car.vy * rightY;

        forwardSpeed *= DRAG;
        lateralSpeed *= LATERAL_DRAG;

        let combinedSpeed = Math.hypot(forwardSpeed, lateralSpeed);
        if (combinedSpeed > MAX_SPEED) {
          const scale = MAX_SPEED / combinedSpeed;
          forwardSpeed *= scale;
          lateralSpeed *= scale;
          combinedSpeed = MAX_SPEED;
        }

        car.vx = forwardSpeed * forwardX + lateralSpeed * rightX;
        car.vy = forwardSpeed * forwardY + lateralSpeed * rightY;

        const headingChange = (forwardSpeed / CAR_LENGTH) * Math.tan(car.frontWheelAngle);
        car.heading += headingChange * delta;

        const slipHeading = Math.atan2(car.vy, car.vx);
        if (Number.isFinite(slipHeading) && combinedSpeed > MIN_ALIGNMENT_SPEED) {
          const alignmentStrength =
            HEADING_ALIGNMENT_STRENGTH * clamp(combinedSpeed / MAX_SPEED, 0.2, 1);
          car.heading += angleDifference(slipHeading, car.heading) * alignmentStrength * delta;
        }

        car.heading = ((car.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

        car.x += car.vx * delta;
        car.y += car.vy * delta;

        if (combinedSpeed < 0.05) {
          car.frontWheelAngle *= 0.85;
        }

        if (car.x < EDGE_PADDING) {
          car.x = EDGE_PADDING;
          car.vx *= -0.4;
          car.frontWheelAngle *= 0.6;
        }
        if (car.x > width - EDGE_PADDING) {
          car.x = width - EDGE_PADDING;
          car.vx *= -0.4;
          car.frontWheelAngle *= 0.6;
        }
        if (car.y < EDGE_PADDING) {
          car.y = EDGE_PADDING;
          car.vy *= -0.4;
          car.frontWheelAngle *= 0.6;
        }
        if (car.y > height - EDGE_PADDING) {
          car.y = height - EDGE_PADDING;
          car.vy *= -0.4;
          car.frontWheelAngle *= 0.6;
        }

        const gear = state.gear;
        const gearDistance = Math.hypot(car.x - gear.x, car.y - gear.y);
        if (gearDistance < GEAR_RADIUS + 26) {
          setScore(prev => prev + 1);
          spawnNewGear();
        }

        const sinHeading = Math.sin(car.heading);
        const cosHeading = Math.cos(car.heading);
        const towPointX = car.x - TOW_HOOK_OFFSET_Y * sinHeading;
        const towPointY = car.y + TOW_HOOK_OFFSET_Y * cosHeading;

        ctx.save();
        ctx.globalAlpha = 0.32;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 10]);
        ctx.beginPath();
        ctx.moveTo(towPointX, towPointY);
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
      const driftOffset = clamp(angleDifference(driftAngle, car.heading), -Math.PI / 4, Math.PI / 4);

      const halfBodyWidth = CAR_BODY_WIDTH / 2;
      const halfBodyLength = CAR_BODY_LENGTH / 2;

      ctx.save();
      ctx.rotate(driftOffset * 0.5);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 10, halfBodyWidth + 6, halfBodyLength - 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const drawWheel = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-WHEEL_WIDTH / 2, -WHEEL_HEIGHT / 2, WHEEL_WIDTH, WHEEL_HEIGHT, 3);
        ctx.fill();
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.roundRect(-WHEEL_WIDTH / 2 + 1.5, -WHEEL_HEIGHT / 2 + 3, WHEEL_WIDTH - 3, WHEEL_HEIGHT - 6, 2);
        ctx.fill();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-1.5, -WHEEL_HEIGHT / 2 + 3, 3, WHEEL_HEIGHT - 6);
        ctx.globalAlpha = 1;
        ctx.restore();
      };

      drawWheel(-WHEEL_OFFSET_X, FRONT_WHEEL_Y, car.frontWheelAngle);
      drawWheel(WHEEL_OFFSET_X, FRONT_WHEEL_Y, car.frontWheelAngle);
      drawWheel(-WHEEL_OFFSET_X, REAR_WHEEL_Y, 0);
      drawWheel(WHEEL_OFFSET_X, REAR_WHEEL_Y, 0);

      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.roundRect(-halfBodyWidth, -halfBodyLength, CAR_BODY_WIDTH, CAR_BODY_LENGTH, 12);
      ctx.fill();

      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect(-halfBodyWidth + 4, -halfBodyLength + 8, CAR_BODY_WIDTH - 8, CAR_BODY_LENGTH - 16, 10);
      ctx.fill();

      ctx.fillStyle = '#93c5fd';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.roundRect(-halfBodyWidth + 6, -halfBodyLength + 6, CAR_BODY_WIDTH - 12, CAR_BODY_LENGTH * 0.45, 10);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.roundRect(-halfBodyWidth + 5, -6, CAR_BODY_WIDTH - 10, 12, 6);
      ctx.fill();

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(-6, -halfBodyLength + 10, 12, CAR_BODY_LENGTH - 20, 6);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-halfBodyWidth + 6, -halfBodyLength + 2, CAR_BODY_WIDTH - 12, 8, 4);
      ctx.fill();

      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.ellipse(-halfBodyWidth + 7, -halfBodyLength + 8, 3, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(halfBodyWidth - 7, -halfBodyLength + 8, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(-halfBodyWidth + 7, -halfBodyLength + 8, 6, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(halfBodyWidth - 7, -halfBodyLength + 8, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.roundRect(-halfBodyWidth + 6, halfBodyLength - 12, CAR_BODY_WIDTH - 12, 6, 3);
      ctx.fill();

      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.roundRect(-halfBodyWidth + 10, -halfBodyLength + 18, CAR_BODY_WIDTH - 20, 10, 4);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-halfBodyWidth + 8, halfBodyLength - 22, CAR_BODY_WIDTH - 16, 6, 3);
      ctx.fill();

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
