
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const TURRET_Y = GAME_HEIGHT - 30;
const MAX_LANDED = 5;
const WAVE_DURATION = 60000; // 60 seconds in ms

let objectIdCounter = 0;
const getUniqueId = () => objectIdCounter++;

type GameObject = {
  id: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  type: 'projectile' | 'helicopter' | 'parachutist' | 'debris';
  angle?: number;
  health?: number;
  isFallingFast?: boolean;
};

export function AirDefenseGame({ onExit, onReplay, canReplay, gameCost }: {
    onExit: () => void;
    onReplay: () => void;
    canReplay: boolean;
    gameCost: number;
}) {
  const [gameState, setGameState] = React.useState<'playing' | 'gameOver' | 'waveTransition'>('waveTransition');
  const [gameObjects, setGameObjects] = React.useState<GameObject[]>([]);
  const [turretAngle, setTurretAngle] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [wave, setWave] = React.useState(1);
  const [landedCount, setLandedCount] = React.useState(0);
  const [lastShotTime, setLastShotTime] = React.useState(0);
  
  // Wave-specific state
  const [parachutistsToSpawn, setParachutistsToSpawn] = React.useState(0);
  const [nextHeliTime, setNextHeliTime] = React.useState(0);
  const [nextParachuteTime, setNextParachuteTime] = React.useState(0);

  const gameAreaRef = React.useRef<HTMLDivElement>(null);
  const gameLoopIntervalRef = React.useRef<NodeJS.Timeout>();
  const waveTimeoutRef = React.useRef<NodeJS.Timeout>();
  
  const { toast } = useToast();
  
  const getParachutistsForWave = (currentWave: number) => {
    if (currentWave === 1) return 10;
    if (currentWave === 2) return 15;
    if (currentWave === 3) return 17;
    if (currentWave === 4) return 19;
    return 19 + (currentWave - 4) * 2;
  };
  
  const startWave = React.useCallback((currentWave: number) => {
    setGameState('waveTransition');
    
    // Show "Wave X" banner for 2 seconds, then start the wave
    setTimeout(() => {
        const numToSpawn = getParachutistsForWave(currentWave);
        setParachutistsToSpawn(numToSpawn);
        const parachuteInterval = WAVE_DURATION / numToSpawn;
        setNextParachuteTime(Date.now() + parachuteInterval);

        setGameState('playing');
        
        // End the wave after WAVE_DURATION
        if(waveTimeoutRef.current) clearTimeout(waveTimeoutRef.current);
        waveTimeoutRef.current = setTimeout(() => {
            setWave(w => w + 1);
        }, WAVE_DURATION);

    }, 2000);
  }, []);

  const resetGame = React.useCallback(() => {
    objectIdCounter = 0;
    setGameObjects([]);
    setScore(0);
    setLandedCount(0);
    setParachutistsToSpawn(0);
    setNextHeliTime(0);
    setNextParachuteTime(0);
    if(waveTimeoutRef.current) clearTimeout(waveTimeoutRef.current);
    if(gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
    setWave(1); 
  }, []);

  React.useEffect(() => {
    startWave(wave);
  }, [wave, startWave]);
  
  const handleReplayGame = () => {
    if (canReplay) {
      onReplay();
      resetGame();
    }
  };
  
  const handleShoot = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;
    
    const now = Date.now();
    if (now - lastShotTime < 200) return; // Fire rate limit

    const rect = gameAreaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const deltaX = clickX - GAME_WIDTH / 2;
    const deltaY = clickY - TURRET_Y;
    const angle = Math.atan2(deltaY, deltaX);

    setTurretAngle(angle);
    setLastShotTime(now);

    setGameObjects(prev => [...prev, {
      id: getUniqueId(),
      x: GAME_WIDTH / 2,
      y: TURRET_Y,
      type: 'projectile',
      angle: angle,
    }]);
  }, [gameState, lastShotTime]);

  // Main Game Loop
  React.useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
      return;
    }

    gameLoopIntervalRef.current = setInterval(() => {
      const now = Date.now();
      
      // Spawn Helicopters
      if (now > nextHeliTime) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        setGameObjects(prev => [...prev, {
          id: getUniqueId(),
          x: direction > 0 ? -50 : GAME_WIDTH + 50,
          y: 50 + Math.random() * 50,
          vx: direction * (1.0 + wave * 0.1),
          vy: 0,
          type: 'helicopter',
          health: 3,
        }]);
        setNextHeliTime(now + 6000 / (1 + wave * 0.1)); // Slower helicopter spawn rate
      }
      
      // Spawn Parachutists
      if (parachutistsToSpawn > 0 && now > nextParachuteTime) {
        const helicopters = gameObjects.filter(obj => obj.type === 'helicopter' && obj.x > 0 && obj.x < GAME_WIDTH);
        if (helicopters.length > 0) {
            const randomHeli = helicopters[Math.floor(Math.random() * helicopters.length)];
            setGameObjects(prev => [...prev, {
                id: getUniqueId(),
                x: randomHeli.x,
                y: randomHeli.y + 20,
                vy: 0.4 + wave * 0.05,
                type: 'parachutist'
            }]);
            setParachutistsToSpawn(p => p - 1);
            const numToSpawn = getParachutistsForWave(wave);
            const parachuteInterval = WAVE_DURATION / numToSpawn;
            setNextParachuteTime(now + parachuteInterval);
        }
      }

      setGameObjects(prevObjects => {
        let newLandedCount = landedCount;
        let hitsToProcess: { projectileId: number, target: GameObject }[] = [];
        const nextFrameObjects: GameObject[] = [];

        // --- UPDATE POSITIONS & DETECT HITS ---
        for (const obj of prevObjects) {
          let newObj = { ...obj };
          let keepObject = true;

          switch (obj.type) {
            case 'projectile':
              newObj.x += Math.cos(obj.angle!) * 15;
              newObj.y += Math.sin(obj.angle!) * 15;
              // Check for collisions
              for (const target of prevObjects) {
                if (target.type === 'helicopter' || target.type === 'parachutist') {
                    const dx = newObj.x - target.x;
                    const dy = newObj.y - target.y;
                    if (Math.sqrt(dx * dx + dy * dy) < 20) {
                        hitsToProcess.push({ projectileId: obj.id, target });
                        break; 
                    }
                }
              }
              break;
            case 'helicopter':
              newObj.x += obj.vx!;
              break;
            case 'parachutist':
              newObj.y += obj.isFallingFast ? obj.vy! * 3 : obj.vy!;
              // Check collision with debris
              for (const debris of prevObjects) {
                  if (debris.type === 'debris' && !newObj.isFallingFast) {
                       const dx = newObj.x - debris.x;
                       const dy = newObj.y - debris.y;
                       if (Math.sqrt(dx * dx + dy * dy) < 15) {
                           newObj.isFallingFast = true;
                           setScore(s => s + 5);
                       }
                  }
              }
              break;
            case 'debris':
              newObj.y += 4;
              break;
          }
          
          if (newObj.y > GAME_HEIGHT || newObj.x < -100 || newObj.x > GAME_WIDTH + 100) {
              if(newObj.type === 'parachutist' && newObj.y > TURRET_Y) {
                  newLandedCount++;
              }
              keepObject = false;
          }

          if (keepObject) {
              nextFrameObjects.push(newObj);
          }
        }
        
        // --- PROCESS HITS AND UPDATE OBJECTS ---
        const hitProjectileIds = new Set(hitsToProcess.map(h => h.projectileId));
        const destroyedTargetIds = new Set<number>();
        
        hitsToProcess.forEach(({ target }) => {
            if (destroyedTargetIds.has(target.id)) return;

            if (target.type === 'helicopter') {
                const existingTarget = nextFrameObjects.find(o => o.id === target.id);
                if(existingTarget) {
                    existingTarget.health = (existingTarget.health || 1) - 1;
                    if (existingTarget.health <= 0) {
                        destroyedTargetIds.add(target.id);
                        setScore(s => s + 25);
                        for (let i = 0; i < 3; i++) {
                            nextFrameObjects.push({ id: getUniqueId(), x: target.x, y: target.y, type: 'debris' });
                        }
                    }
                }
            } else if (target.type === 'parachutist') {
                destroyedTargetIds.add(target.id);
                setScore(s => s + 10);
            }
        });

        // --- FILTER FINAL OBJECTS FOR NEXT FRAME ---
        const finalObjects = nextFrameObjects.filter(obj => {
            return !hitProjectileIds.has(obj.id) && !destroyedTargetIds.has(obj.id);
        });

        if (newLandedCount !== landedCount) setLandedCount(newLandedCount);
        
        return finalObjects;
      });
    }, 50); // Game loop runs every 50ms (20 FPS)

    return () => clearInterval(gameLoopIntervalRef.current);
  }, [gameState, wave, landedCount, nextHeliTime, parachutistsToSpawn, nextParachuteTime]);

  // Game Over Check
  React.useEffect(() => {
    if (landedCount >= MAX_LANDED) {
      setGameState('gameOver');
      if (waveTimeoutRef.current) clearTimeout(waveTimeoutRef.current);
      toast({
        variant: 'destructive',
        title: "Oh non !",
        description: `Vous avez laissé ${MAX_LANDED} extraterrestres atterrir.`,
      });
    }
  }, [landedCount, toast]);

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <Card className="w-auto shadow-2xl bg-zinc-800 text-white border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle className="font-headline text-3xl">Défense Aérienne</CardTitle>
           <div className="font-bold text-lg flex items-center gap-4">
              <span>Vague : {wave}</span>
              <div className="font-bold text-2xl flex items-center gap-2">
                 <Trophy className="text-yellow-400" /> {score}
              </div>
           </div>
        </CardHeader>
        <CardContent>
          <div
            ref={gameAreaRef}
            onClick={handleShoot}
            className="relative overflow-hidden cursor-crosshair"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT, background: 'linear-gradient(to bottom, #0d1b2a, #415a77)' }}
          >
            {/* Render Game Objects */}
            {gameObjects.map(obj => {
              const style: React.CSSProperties = {
                position: 'absolute',
                left: obj.x,
                top: obj.y,
                transform: 'translate(-50%, -50%)',
              };
              if (obj.type === 'projectile') return <div key={obj.id} style={{ ...style, transform: `translate(-50%, -50%) rotate(${obj.angle! * 180 / Math.PI + 90}deg)`}} className="w-1 h-4 bg-yellow-300 rounded-full shadow-[0_0_8px_2px_#fde047]" />;
              if (obj.type === 'helicopter') return <div key={obj.id} style={{ ...style, fontSize: '30px' }}>🛸</div>;
              if (obj.type === 'parachutist') return <div key={obj.id} style={{ ...style, fontSize: '24px' }}>👽</div>;
              if (obj.type === 'debris') return <div key={obj.id} style={{...style, fontSize: '10px'}}>💥</div>
              return null;
            })}

            {/* Render Turret */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{ width: 40, height: 30 }}
            >
              <div className="w-full h-full bg-gray-600 rounded-t-md" />
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 h-10 w-2 bg-gray-500 origin-bottom"
                style={{ transform: `rotate(${turretAngle + Math.PI / 2}rad)` }}
              />
            </div>
            
             {/* Wave Transition Screen */}
             {gameState === 'waveTransition' && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-20">
                    <h2 className="text-6xl font-bold animate-pulse">Vague {wave}</h2>
                </div>
            )}


            {/* Game Over Screen */}
            {gameState === 'gameOver' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-20">
                    <h2 className="text-5xl font-bold">Game Over</h2>
                    <p className="text-2xl mt-4">Score final : {score}</p>
                    <div className="flex gap-4 mt-8">
                        <Button onClick={handleReplayGame} disabled={!canReplay} variant="secondary">
                            <RefreshCw className="mr-2" /> Rejouer ({gameCost} pépites)
                        </Button>
                        <Button onClick={onExit}>
                            <ArrowLeft className="mr-2" /> Quitter
                        </Button>
                    </div>
                    {!canReplay && <p className="text-sm text-amber-300 mt-3">Tu n'as plus assez de pépites pour rejouer.</p>}
                </div>
            )}
             {/* Landed Count UI */}
             <div className="absolute bottom-2 right-4 text-lg font-bold">
                Atterrissages : {landedCount} / {MAX_LANDED}
             </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

  