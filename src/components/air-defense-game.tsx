
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw, Trophy, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const TURRET_Y = GAME_HEIGHT - 30;
const MAX_LANDED = 5;
const WAVE_DURATION = 60000; // 60 seconds in ms
const BOSS_MAX_HEALTH = 15;
const PLAYER_MAX_LIVES = 3;


let objectIdCounter = 0;
const getUniqueId = () => objectIdCounter++;

type GameObject = {
  id: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  type: 'projectile' | 'saucer' | 'alien' | 'debris' | 'bomb';
  angle?: number;
  health?: number;
};

export function AirDefenseGame({ onExit, onReplay, canReplay, gameCost }: {
    onExit: () => void;
    onReplay: () => void;
    canReplay: boolean;
    gameCost: number;
}) {
  const [gameState, setGameState] = React.useState<'playing' | 'gameOver' | 'waveTransition' | 'bossFight'>('waveTransition');
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

  // Boss state
  const [bossHealth, setBossHealth] = React.useState(BOSS_MAX_HEALTH);
  const [playerLives, setPlayerLives] = React.useState(PLAYER_MAX_LIVES);
  const [nextBombTime, setNextBombTime] = React.useState(0);


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

    if (currentWave === 5) {
        // Transition to boss fight
        setTimeout(() => {
            setGameObjects([]);
            setGameState('bossFight');
            setNextBombTime(Date.now() + 3000);
        }, 2000);
        return;
    }
    
    // Show "Wave X" banner for 2 seconds, then start the wave
    setTimeout(() => {
        const numToSpawn = getParachutistsForWave(currentWave);
        setParachutistsToSpawn(numToSpawn);
        const parachuteInterval = WAVE_DURATION / numToSpawn;
        setNextParachuteTime(Date.now() + parachuteInterval);
        
        const heliSpawnRate = 6000 / (1 + currentWave * 0.1);
        setNextHeliTime(Date.now() + heliSpawnRate);

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
    setPlayerLives(PLAYER_MAX_LIVES);
    setBossHealth(BOSS_MAX_HEALTH);
    setNextBombTime(0);

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
    if ((gameState !== 'playing' && gameState !== 'bossFight') || !gameAreaRef.current) return;
    
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
    if (gameState !== 'playing' && gameState !== 'bossFight') {
      if (gameLoopIntervalRef.current) clearInterval(gameLoopIntervalRef.current);
      return;
    }

    gameLoopIntervalRef.current = setInterval(() => {
      const now = Date.now();
      
      let currentSaucers: GameObject[] = [];
      let currentAliens: GameObject[] = [];

      // Spawning logic (only in 'playing' state)
      if (gameState === 'playing') {
          // Spawn Saucers (helicopters)
          if (now > nextHeliTime) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            setGameObjects(prev => [...prev, {
              id: getUniqueId(),
              x: direction > 0 ? -50 : GAME_WIDTH + 50,
              y: 50 + Math.random() * 50,
              vx: direction * (1.0 + wave * 0.1),
              vy: 0,
              type: 'saucer',
              health: 3,
            }]);
             const heliSpawnRate = 6000 / (1 + wave * 0.1);
            setNextHeliTime(now + heliSpawnRate);
          }
          
          // Spawn Aliens (parachutists)
          if (parachutistsToSpawn > 0 && now > nextParachuteTime) {
            currentSaucers = gameObjects.filter(obj => obj.type === 'saucer' && obj.x > 0 && obj.x < GAME_WIDTH);
            if (currentSaucers.length > 0) {
                const randomHeli = currentSaucers[Math.floor(Math.random() * currentSaucers.length)];
                setGameObjects(prev => [...prev, {
                    id: getUniqueId(),
                    x: randomHeli.x,
                    y: randomHeli.y + 20,
                    vy: 0.4 + wave * 0.05,
                    type: 'alien'
                }]);
                setParachutistsToSpawn(p => p - 1);
                const numToSpawn = getParachutistsForWave(wave);
                const parachuteInterval = WAVE_DURATION / numToSpawn;
                setNextParachuteTime(now + parachuteInterval);
            }
          }
      }

      // Boss logic
      if (gameState === 'bossFight') {
          const boss = gameObjects.find(o => o.type === 'saucer');
          if (!boss) {
              // Create the boss
              setGameObjects(prev => [...prev, {
                  id: getUniqueId(),
                  x: GAME_WIDTH / 2,
                  y: 100,
                  vx: 3 + wave * 0.2, // Faster speed
                  vy: 0,
                  type: 'saucer',
                  health: BOSS_MAX_HEALTH
              }]);
          } else {
              // Boss attack logic
              if (now > nextBombTime) {
                  const angleToPlayer = Math.atan2(TURRET_Y - boss.y, (GAME_WIDTH / 2) - boss.x);
                  setGameObjects(prev => [...prev, {
                      id: getUniqueId(),
                      x: boss.x,
                      y: boss.y,
                      type: 'bomb',
                      angle: angleToPlayer
                  }]);
                  setNextBombTime(now + 2000 / (1 + (BOSS_MAX_HEALTH - bossHealth) * 0.1)); // Bombs get faster as boss health drops
              }
          }
      }

      setGameObjects(prevObjects => {
        let newLandedCount = landedCount;
        let hitsToProcess: { projectileId: number, target: GameObject }[] = [];
        const nextFrameObjects: GameObject[] = [];
        let playerLostLife = false;

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
                if (target.type === 'saucer' || target.type === 'alien' || target.type === 'bomb') {
                    const dx = newObj.x - target.x;
                    const dy = newObj.y - target.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const hitRadius = target.type === 'saucer' && gameState === 'bossFight' ? 50 : 20;

                    if (distance < hitRadius) {
                        hitsToProcess.push({ projectileId: obj.id, target });
                        break; 
                    }
                }
              }
              break;
            case 'saucer':
              if (gameState === 'bossFight') {
                  newObj.x += newObj.vx!;
                  if (newObj.x > GAME_WIDTH - 50 || newObj.x < 50) {
                      newObj.vx = -newObj.vx!;
                  }
              } else {
                 newObj.x += obj.vx!;
              }
              break;
            case 'alien':
              newObj.y += obj.vy!;
              break;
            case 'debris':
              newObj.y += 4;
              break;
            case 'bomb':
              newObj.x += Math.cos(obj.angle!) * 5;
              newObj.y += Math.sin(obj.angle!) * 5;
              if (newObj.y > TURRET_Y - 10 && Math.abs(newObj.x - GAME_WIDTH / 2) < 20) {
                  playerLostLife = true;
                  keepObject = false; // Bomb is destroyed on impact
              }
              break;
          }
          
          if (newObj.y > GAME_HEIGHT || newObj.x < -100 || newObj.x > GAME_WIDTH + 100) {
              if(newObj.type === 'alien' && newObj.y > TURRET_Y) {
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

            if (target.type === 'saucer') {
                const existingTarget = nextFrameObjects.find(o => o.id === target.id);
                if(existingTarget) {
                    existingTarget.health = (existingTarget.health || 1) - 1;
                    if (existingTarget.health <= 0) {
                        destroyedTargetIds.add(target.id);
                        if(gameState === 'bossFight') {
                             setScore(s => s + 500); // Big bonus for boss
                             setGameState('gameOver'); // You win!
                        } else {
                            setScore(s => s + 25);
                        }
                        // Create debris
                        for (let i = 0; i < 3; i++) {
                            nextFrameObjects.push({ id: getUniqueId(), x: target.x, y: target.y, type: 'debris' });
                        }
                    } else {
                        // Boss was hit but not destroyed
                        if (gameState === 'bossFight') {
                             setScore(s => s + 10);
                             setBossHealth(h => h - 1);
                        }
                    }
                }
            } else if (target.type === 'alien') {
                destroyedTargetIds.add(target.id);
                setScore(s => s + 10);
            } else if (target.type === 'bomb') {
                destroyedTargetIds.add(target.id);
                setScore(s => s + 5); // Score for shooting a bomb
            }
        });

        // --- FILTER FINAL OBJECTS FOR NEXT FRAME ---
        const finalObjects = nextFrameObjects.filter(obj => {
            return !hitProjectileIds.has(obj.id) && !destroyedTargetIds.has(obj.id);
        });

        if (newLandedCount !== landedCount) setLandedCount(newLandedCount);
        if (playerLostLife) setPlayerLives(p => Math.max(0, p - 1));
        
        return finalObjects;
      });
    }, 50); // Game loop runs every 50ms (20 FPS)

    return () => clearInterval(gameLoopIntervalRef.current);
  }, [gameState, wave, landedCount, nextHeliTime, parachutistsToSpawn, nextParachuteTime, bossHealth, nextBombTime]);

  // Game Over Check
  React.useEffect(() => {
    if (landedCount >= MAX_LANDED || playerLives <= 0) {
      setGameState('gameOver');
      if (waveTimeoutRef.current) clearTimeout(waveTimeoutRef.current);
       if (playerLives <= 0) {
          toast({ variant: 'destructive', title: "Oh non !", description: "Votre canon a été détruit." });
       } else {
          toast({ variant: 'destructive', title: "Oh non !", description: `Vous avez laissé ${MAX_LANDED} extraterrestres atterrir.` });
       }
    }
  }, [landedCount, playerLives, toast]);
  
  const handleTestBoss = () => {
    setWave(4);
    setScore(4 * 10); // Give some score to simulate playing
  };

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
              if (obj.type === 'saucer') {
                  const isBoss = gameState === 'bossFight';
                  return <div key={obj.id} style={{ ...style, fontSize: isBoss ? '80px' : '30px' }}>🛸</div>;
              }
              if (obj.type === 'alien') return <div key={obj.id} style={{ ...style, fontSize: '24px' }}>👾</div>;
              if (obj.type === 'debris') return <div key={obj.id} style={{...style, fontSize: '10px'}}>💥</div>
              if (obj.type === 'bomb') return <div key={obj.id} style={{...style, fontSize: '20px'}}>💣</div>
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
                    <h2 className="text-6xl font-bold animate-pulse">
                        {wave === 5 ? "BOSS" : `Vague ${wave}`}
                    </h2>
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
             {/* UI Elements */}
             <div className="absolute bottom-2 right-4 text-lg font-bold">
                Atterrissages : {landedCount} / {MAX_LANDED}
             </div>
             <div className="absolute bottom-2 left-4 text-lg font-bold flex items-center gap-2">
                Vies : 
                {Array.from({ length: playerLives }).map((_, i) => <Heart key={i} className="h-6 w-6 text-red-500 fill-red-500" />)}
                {Array.from({ length: PLAYER_MAX_LIVES - playerLives }).map((_, i) => <Heart key={i} className="h-6 w-6 text-gray-500" />)}
             </div>
             {/* Boss Health Bar */}
             {gameState === 'bossFight' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1/2">
                    <Progress value={(bossHealth / BOSS_MAX_HEALTH) * 100} className="h-4 bg-red-800 border border-red-400 [&>div]:bg-red-500" />
                </div>
             )}
              {/* Dev button */}
             {process.env.NODE_ENV === 'development' && (
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={handleTestBoss}>Test Boss</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

