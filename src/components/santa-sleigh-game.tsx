'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, RefreshCw, Trophy, Gift, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 120;
const PLAYER_HEIGHT = 80;
const GIFT_SIZE = 30;
const HOUSE_WIDTH = 150;
const HOUSE_HEIGHT = 150; // Approximate, depends on image aspect ratio
const CHIMNEY_WIDTH = 40;
const CHIMNEY_OFFSET_X = 55; // Approximate offset from house left to chimney center
const GAME_DURATION = 60; // seconds
const INITIAL_STOCK = 20;

type GameObject = {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'house' | 'gift' | 'snow';
    image?: string;
    vx?: number;
    vy?: number;
    scale?: number;
    opacity?: number;
};

let objectIdCounter = 0;
const getUniqueId = () => objectIdCounter++;

export function SantaSleighGame({ onExit, onReplay, canReplay, gameCost, onGameEnd }: {
    onExit: () => void;
    onReplay: () => void;
    canReplay: boolean;
    gameCost: number;
    onGameEnd: (score: number) => void;
}) {
    const [gameState, setGameState] = React.useState<'playing' | 'gameOver' | 'intro'>('intro');
    const [score, setScore] = React.useState(0);
    const [stock, setStock] = React.useState(INITIAL_STOCK);
    const [timeLeft, setTimeLeft] = React.useState(GAME_DURATION);
    const [santaPos, setSantaPos] = React.useState({ x: 100, y: 100 });
    const [gameObjects, setGameObjects] = React.useState<GameObject[]>([]);
    const [backgroundOffset, setBackgroundOffset] = React.useState(0);

    const gameLoopRef = React.useRef<number>();
    const lastTimeRef = React.useRef<number>(0);
    const keysPressed = React.useRef<Set<string>>(new Set());
    const lastDropTime = React.useRef<number>(0);
    const gameAreaRef = React.useRef<HTMLDivElement>(null);

    const { toast } = useToast();

    // Initialize Game
    const startGame = React.useCallback(() => {
        setGameState('playing');
        setScore(0);
        setStock(INITIAL_STOCK);
        setTimeLeft(GAME_DURATION);
        setSantaPos({ x: 100, y: 100 });
        setGameObjects([]);
        setBackgroundOffset(0);
        objectIdCounter = 0;
        lastTimeRef.current = performance.now();

        // Initial snow
        const initialSnow: GameObject[] = [];
        for (let i = 0; i < 50; i++) {
            initialSnow.push({
                id: getUniqueId(),
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                width: 5,
                height: 5,
                type: 'snow',
                vx: -1 - Math.random(),
                vy: 1 + Math.random(),
                scale: 0.5 + Math.random() * 0.5,
                opacity: 0.3 + Math.random() * 0.7
            });
        }
        setGameObjects(initialSnow);

    }, []);

    React.useEffect(() => {
        startGame();
    }, [startGame]);

    // Input Handling
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keysPressed.current.add(e.code);
            if (e.code === 'KeyC') {
                dropGift();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current.delete(e.code);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState, stock]); // Re-bind if stock changes? No, use ref or functional update if needed, but dropGift needs access to current stock state or ref.

    // We need a ref for stock to access it in the event handler without re-binding or stale closures if we defined dropGift outside
    const stockRef = React.useRef(stock);
    React.useEffect(() => { stockRef.current = stock; }, [stock]);

    const dropGift = () => {
        if (gameState !== 'playing') return;
        if (stockRef.current <= 0) {
            // Optional: Sound or visual feedback for empty stock
            return;
        }

        const now = performance.now();
        if (now - lastDropTime.current < 200) return; // Cooldown
        lastDropTime.current = now;

        setStock(s => s - 1);
        setGameObjects(prev => [...prev, {
            id: getUniqueId(),
            x: santaPos.x + PLAYER_WIDTH / 2,
            y: santaPos.y + PLAYER_HEIGHT,
            width: GIFT_SIZE,
            height: GIFT_SIZE,
            type: 'gift',
            vy: 5, // Falling speed
            vx: 2, // Initial forward momentum
        }]);
    };

    // Game Loop
    const update = React.useCallback((time: number) => {
        if (gameState !== 'playing') return;

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        // 1. Update Timer
        // We'll do this in a separate interval or just check delta accumulation, but simple interval is easier for UI

        // 2. Update Santa Position
        setSantaPos(prev => {
            let newX = prev.x;
            let newY = prev.y;
            const speed = 5;

            if (keysPressed.current.has('ArrowUp')) newY -= speed;
            if (keysPressed.current.has('ArrowDown')) newY += speed;
            if (keysPressed.current.has('ArrowLeft')) newX -= speed;
            if (keysPressed.current.has('ArrowRight')) newX += speed;

            // Clamp
            newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, newX));
            newY = Math.max(0, Math.min(GAME_HEIGHT - 200, newY)); // Don't go too low (houses)

            return { x: newX, y: newY };
        });

        // 3. Update Background & Spawning
        setBackgroundOffset(prev => (prev + 2) % GAME_WIDTH); // Scroll speed

        setGameObjects(prev => {
            const nextObjects: GameObject[] = [];
            let scoreIncrement = 0;
            let stockIncrement = 0;

            // Spawn Houses
            // Simple logic: maintain a certain density or spawn at intervals
            // Let's check the last house
            const lastHouse = prev.filter(o => o.type === 'house').sort((a, b) => b.x - a.x)[0];
            if (!lastHouse || lastHouse.x < GAME_WIDTH - 300) {
                if (Math.random() < 0.02) { // Random spawn chance
                    const houseType = Math.floor(Math.random() * 3) + 1;
                    nextObjects.push({
                        id: getUniqueId(),
                        x: GAME_WIDTH + 50,
                        y: GAME_HEIGHT - 180, // Ground level
                        width: HOUSE_WIDTH,
                        height: HOUSE_HEIGHT,
                        type: 'house',
                        image: `/images/santa-game/house${houseType}.png`,
                        vx: -3 // Scroll speed
                    });
                }
            }

            // Spawn Snow
            if (Math.random() < 0.2) {
                nextObjects.push({
                    id: getUniqueId(),
                    x: Math.random() * GAME_WIDTH + (Math.random() > 0.5 ? GAME_WIDTH : 0), // Spawn from top or right
                    y: -10,
                    width: 5,
                    height: 5,
                    type: 'snow',
                    vx: -1 - Math.random(),
                    vy: 1 + Math.random(),
                    scale: 0.5 + Math.random() * 0.5,
                    opacity: 0.3 + Math.random() * 0.7
                });
            }

            // Update Objects
            for (const obj of prev) {
                let newObj = { ...obj };
                let keep = true;

                if (obj.type === 'house') {
                    newObj.x += obj.vx!;
                    if (newObj.x < -200) keep = false;
                } else if (obj.type === 'gift') {
                    newObj.y += obj.vy!;
                    newObj.x += obj.vx!; // Momentum
                    newObj.vx! *= 0.98; // Air resistance on horizontal

                    // Collision with Chimney
                    // Chimney hit box is roughly top center of house
                    // Iterate houses to check collision
                    const houses = prev.filter(h => h.type === 'house');
                    for (const house of houses) {
                        // Define chimney hitbox relative to house
                        // Assuming chimney is roughly at x + 55, width 40, top of house
                        const chimneyX = house.x + CHIMNEY_OFFSET_X;
                        const chimneyY = house.y + 10; // Slightly below top
                        const chimneyW = CHIMNEY_WIDTH;
                        const chimneyH = 20;

                        if (
                            newObj.x < chimneyX + chimneyW &&
                            newObj.x + newObj.width > chimneyX &&
                            newObj.y < chimneyY + chimneyH &&
                            newObj.y + newObj.height > chimneyY
                        ) {
                            // Hit!
                            scoreIncrement += 1;
                            stockIncrement += 3;
                            keep = false;
                            // Visual effect?
                            break;
                        }
                    }

                    if (newObj.y > GAME_HEIGHT) keep = false;
                } else if (obj.type === 'snow') {
                    newObj.x += obj.vx!;
                    newObj.y += obj.vy!;
                    if (newObj.y > GAME_HEIGHT || newObj.x < -10) keep = false;
                }

                if (keep) nextObjects.push(newObj);
            }

            if (scoreIncrement > 0) setScore(s => s + scoreIncrement);
            if (stockIncrement > 0) setStock(s => s + stockIncrement);

            return nextObjects;
        });

        gameLoopRef.current = requestAnimationFrame(update);
    }, [gameState]);

    React.useEffect(() => {
        gameLoopRef.current = requestAnimationFrame(update);
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [update]);

    // Timer Effect
    React.useEffect(() => {
        if (gameState !== 'playing') return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('gameOver');
                    onGameEnd(score); // Pass current score (might be slightly off due to closure, but score state is updated)
                    // Actually, score inside this closure is stale. We should use a ref or call onGameEnd in a useEffect triggered by gameState change.
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState, onGameEnd, score]); // Adding score here might cause interval reset, but it's fine or we use ref.

    // Fix for score in onGameEnd:
    const scoreRef = React.useRef(score);
    React.useEffect(() => { scoreRef.current = score; }, [score]);

    React.useEffect(() => {
        if (gameState === 'gameOver') {
            onGameEnd(scoreRef.current);
        }
    }, [gameState, onGameEnd]);


    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <Card className="w-auto shadow-2xl bg-zinc-800 text-white border-zinc-700">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-headline text-3xl">Livraison de Cadeaux</CardTitle>
                    <div className="font-bold text-lg flex items-center gap-6">
                        <div className="flex flex-col items-end text-sm uppercase tracking-wide text-zinc-300">
                            <span>Temps</span>
                            <span className={cn("text-2xl", timeLeft < 10 ? "text-red-500 animate-pulse" : "text-white")}>{timeLeft}s</span>
                        </div>
                        <div className="font-bold text-2xl flex items-center gap-2">
                            <Trophy className="text-yellow-400" /> {score}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs uppercase tracking-wide text-blue-200/80">Cadeaux</span>
                            <div className="flex items-center gap-2">
                                <Gift className={cn("h-5 w-5", stock === 0 ? "text-red-500" : "text-blue-300")} />
                                <span className={cn("text-2xl font-headline", stock === 0 ? "text-red-500" : "text-blue-300")}>{stock}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div
                        ref={gameAreaRef}
                        className="relative overflow-hidden"
                        style={{
                            width: GAME_WIDTH,
                            height: GAME_HEIGHT,
                            backgroundImage: 'url(/images/santa-game/background.png)',
                            backgroundSize: 'cover', // Or contain, depending on image
                            backgroundPositionX: -backgroundOffset,
                            backgroundRepeat: 'repeat-x'
                        }}
                    >
                        {/* Santa */}
                        <div
                            className="absolute z-20"
                            style={{
                                left: santaPos.x,
                                top: santaPos.y,
                                width: PLAYER_WIDTH,
                                height: PLAYER_HEIGHT,
                                backgroundImage: 'url(/images/santa-game/sleigh.png)',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                transition: 'top 0.1s linear, left 0.1s linear' // Smooth out key movement slightly
                            }}
                        />

                        {/* Game Objects */}
                        {gameObjects.map(obj => {
                            if (obj.type === 'house') {
                                return (
                                    <div
                                        key={obj.id}
                                        className="absolute z-10"
                                        style={{
                                            left: obj.x,
                                            top: obj.y,
                                            width: obj.width,
                                            height: obj.height,
                                            backgroundImage: `url(${obj.image})`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    >
                                        {/* Debug Chimney Hitbox */}
                                        {/* <div className="absolute bg-red-500/30" style={{ left: CHIMNEY_OFFSET_X, top: 10, width: CHIMNEY_WIDTH, height: 20 }} /> */}
                                    </div>
                                );
                            }
                            if (obj.type === 'gift') {
                                return (
                                    <div
                                        key={obj.id}
                                        className="absolute z-10 flex items-center justify-center text-2xl"
                                        style={{
                                            left: obj.x,
                                            top: obj.y,
                                            width: obj.width,
                                            height: obj.height,
                                        }}
                                    >
                                        🎁
                                    </div>
                                );
                            }
                            if (obj.type === 'snow') {
                                return (
                                    <div
                                        key={obj.id}
                                        className="absolute z-30 rounded-full bg-white"
                                        style={{
                                            left: obj.x,
                                            top: obj.y,
                                            width: obj.width,
                                            height: obj.height,
                                            opacity: obj.opacity,
                                            transform: `scale(${obj.scale})`
                                        }}
                                    />
                                );
                            }
                            return null;
                        })}

                        {/* Controls Hint */}
                        <div className="absolute bottom-2 left-2 text-white/50 text-xs">
                            Flèches pour bouger • C pour lâcher un cadeau
                        </div>

                        {/* Game Over Overlay */}
                        {gameState === 'gameOver' && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50">
                                <h2 className="text-5xl font-bold text-yellow-400 mb-4">Partie Terminée !</h2>
                                <p className="text-3xl mb-8">Score final : {score}</p>
                                <p className="text-xl text-amber-300 mb-8">Tu as gagné {score} pépites !</p>
                                <div className="flex gap-4">
                                    <Button onClick={onReplay} disabled={!canReplay} variant="secondary" size="lg">
                                        <RefreshCw className="mr-2" /> Rejouer ({gameCost} pépites)
                                    </Button>
                                    <Button onClick={onExit} size="lg">
                                        <ArrowLeft className="mr-2" /> Quitter
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
