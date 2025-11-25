'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Trophy, Play, RotateCcw } from 'lucide-react';

interface NeonSkiGameProps {
    onExit: () => void;
    onReplay: () => void;
    canReplay: boolean;
    gameCost: number;
    onGameEnd?: (score: number) => void;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

export function NeonSkiGame({ onExit, onReplay, canReplay, gameCost, onGameEnd }: NeonSkiGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [highScore, setHighScore] = useState(0);

    // Game constants
    const GRAVITY = 0.15;
    const HEAVY_GRAVITY = 0.6;
    const FRICTION = 0.995;
    const AIR_RESISTANCE = 0.999;
    const BOOST = 1.05;

    // Game state refs
    const gameState = useRef({
        player: {
            x: 0,
            y: 0,
            vx: 8, // Initial speed
            vy: 0,
            angle: 0,
            onGround: false,
        },
        camera: {
            x: 0,
            y: 0,
            zoom: 1,
            targetZoom: 1,
        },
        terrain: {
            points: [] as { x: number; y: number }[],
            chunkSize: 100,
            lastX: 0,
        },
        particles: [] as Particle[],
        input: {
            pressing: false,
        },
        score: 0,
        running: false,
        frameCount: 0,
        combo: 0,
    });

    // Initialize game
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        // Generate initial terrain
        generateTerrain(0, 2000);
        resetGame();

        // Start loop
        let animationFrameId: number;
        const loop = () => {
            update();
            draw(ctx, canvas.width, canvas.height);
            animationFrameId = requestAnimationFrame(loop);
        };

        if (isPlaying) {
            gameState.current.running = true;
            loop();
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying]);

    const resetGame = () => {
        gameState.current = {
            player: {
                x: 0,
                y: 0,
                vx: 10,
                vy: 0,
                angle: 0,
                onGround: false,
            },
            camera: { x: 0, y: 0, zoom: 1, targetZoom: 1 },
            terrain: { points: [], chunkSize: 100, lastX: 0 },
            particles: [],
            input: { pressing: false },
            score: 0,
            running: true,
            frameCount: 0,
            combo: 0,
        };
        generateTerrain(0, 3000);
        // Place player on terrain
        const startY = getTerrainHeight(0);
        gameState.current.player.y = startY - 20;
        setScore(0);
        setGameOver(false);
    };

    const generateTerrain = (startX: number, width: number) => {
        const { terrain } = gameState.current;
        let x = startX;

        // If it's the first chunk, initialize
        if (terrain.points.length === 0) {
            terrain.points.push({ x: 0, y: 300 });
            terrain.lastX = 0;
        }

        // Use Perlin-like noise or combined sines for better slopes
        // We want long, smooth slopes for gaining speed
        for (let i = 0; i < width; i += 20) {
            x = terrain.lastX + 20;

            // Progressive difficulty/steepness could go here
            const difficulty = Math.min(x / 10000, 1);

            // Main hills
            const amp1 = 150 + difficulty * 100;
            const freq1 = 0.003;

            // Detail
            const amp2 = 50;
            const freq2 = 0.01;

            // Downward trend to help maintain speed initially
            const slope = x * 0.05;

            const y = 300 + Math.sin(x * freq1) * amp1 + Math.sin(x * freq2) * amp2 + slope;

            terrain.points.push({ x, y });
            terrain.lastX = x;
        }
    };

    const getTerrainHeight = (x: number) => {
        const { terrain } = gameState.current;
        // Optimization: Remove old points to keep array small
        if (terrain.points.length > 0 && x > terrain.points[100].x) {
            terrain.points.splice(0, 50);
        }

        // Linear interpolation
        // Find index roughly
        // Since points are spaced by 20, index is approx (x - startX) / 20
        // But since we splice, we need to search.
        // Let's just iterate for robustness for now, optimization later if needed.
        for (let i = 0; i < terrain.points.length - 1; i++) {
            const p1 = terrain.points[i];
            const p2 = terrain.points[i + 1];
            if (x >= p1.x && x <= p2.x) {
                const t = (x - p1.x) / (p2.x - p1.x);
                return p1.y + (p2.y - p1.y) * t;
            }
        }
        return terrain.points[terrain.points.length - 1]?.y || 1000;
    };

    const getTerrainNormal = (x: number) => {
        // Calculate normal based on slope
        const h1 = getTerrainHeight(x - 5);
        const h2 = getTerrainHeight(x + 5);
        return Math.atan2(h2 - h1, 10);
    };

    const createParticles = (x: number, y: number, count: number, color: string, speed: number) => {
        for (let i = 0; i < count; i++) {
            gameState.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                life: 1.0,
                color,
                size: Math.random() * 3 + 1
            });
        }
    };

    const update = () => {
        const state = gameState.current;
        if (!state.running) return;

        const { player, input, particles } = state;

        // Physics
        const gravity = input.pressing ? HEAVY_GRAVITY : GRAVITY;
        player.vy += gravity;

        player.x += player.vx;
        player.y += player.vy;

        // Air resistance
        player.vx *= AIR_RESISTANCE;

        // Terrain collision
        const terrainH = getTerrainHeight(player.x);

        // Check if player is below terrain (or very close)
        if (player.y >= terrainH - 10) {
            player.onGround = true;
            player.y = terrainH - 10;

            const slopeAngle = getTerrainNormal(player.x);

            // Slope physics
            if (input.pressing) {
                // Diving: Add force along the slope (downhill)
                // Only if slope is downwards
                player.vx += Math.sin(slopeAngle) * 0.8;

                // Create spark particles
                if (state.frameCount % 5 === 0) {
                    createParticles(player.x, player.y + 10, 2, '#00f3ff', 5);
                }
            } else {
                // Gliding/Friction
                player.vx *= FRICTION;
            }

            // Translate velocity to slope direction to stick to ground
            const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);

            // Loss of speed on impact if angle is bad?
            // For now, just redirect velocity
            player.vx = Math.cos(slopeAngle) * speed;
            player.vy = Math.sin(slopeAngle) * speed;

            // Minimum speed
            if (player.vx < 5) player.vx = 5;

            player.angle = slopeAngle;

            // Combo reset if on ground too long?

        } else {
            player.onGround = false;
            // Air rotation
            if (input.pressing) {
                player.angle -= 0.15; // Backflip
                // Trail particles
                if (state.frameCount % 3 === 0) {
                    createParticles(player.x, player.y, 1, '#ff00ff', 2);
                }
            } else {
                // Align to velocity
                const vAngle = Math.atan2(player.vy, player.vx);
                // Smooth transition
                player.angle = player.angle * 0.9 + vAngle * 0.1;
            }
        }

        // Particles update
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }

        // Generate terrain
        if (player.x > state.terrain.lastX - 1500) {
            generateTerrain(state.terrain.lastX, 1000);
        }

        // Camera
        const targetZoom = Math.max(0.6, 1.5 - (player.vx / 50)); // Zoom out as we go faster
        state.camera.targetZoom = targetZoom;
        state.camera.zoom = state.camera.zoom * 0.95 + state.camera.targetZoom * 0.05;

        state.camera.x = player.x - 200 / state.camera.zoom;
        state.camera.y = player.y - 300 / state.camera.zoom;

        // Score
        state.score = Math.floor(player.x / 10);
        setScore(state.score);

        state.frameCount++;
    };

    const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const state = gameState.current;
        const { player, camera, terrain, particles } = state;

        // Clear with trail effect
        ctx.fillStyle = 'rgba(5, 5, 16, 0.3)'; // Partial clear for motion blur
        ctx.fillRect(0, 0, width, height);
        // Force full clear occasionally or just use background color?
        // Actually for neon style, full clear is better, we use particles for trails
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, width, height);

        // Stars / Parallax
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const starX = ((i * 137) + camera.x * 0.1) % width;
            const starY = ((i * 243) + camera.y * 0.1) % height;
            ctx.globalAlpha = Math.random() * 0.5 + 0.2;
            ctx.beginPath();
            ctx.arc(starX, starY, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.save();

        // Camera transform
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y + height / (2 * camera.zoom));

        // Draw Terrain
        ctx.beginPath();
        let started = false;
        for (const p of terrain.points) {
            if (p.x < camera.x - 100) continue;
            if (p.x > camera.x + (width / camera.zoom) + 100) break;

            if (!started) {
                ctx.moveTo(p.x, p.y);
                started = true;
            } else {
                ctx.lineTo(p.x, p.y);
            }
        }

        // Fill terrain
        if (terrain.points.length > 0) {
            const last = terrain.points[terrain.points.length - 1];
            const first = terrain.points[0]; // Should be first visible really
            // Just close it way down
            ctx.lineTo(last.x, last.y + 2000);
            ctx.lineTo(camera.x - 1000, last.y + 2000); // Hacky close
        }

        // Neon Glow Style
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f3ff';
        ctx.stroke();

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, camera.y, 0, camera.y + height);
        gradient.addColorStop(0, 'rgba(0, 243, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw Particles
        for (const p of particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Draw Player
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);

        // Player Glow
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 20;

        // Body
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -12, 8, 0, Math.PI * 2);
        ctx.fill();

        // Scarf/Trail
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-20 - (player.vx * 0.5), -10 - Math.sin(state.frameCount * 0.5) * 5);
        ctx.stroke();

        // Ski
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-15, 8);
        ctx.lineTo(15, 8);
        ctx.stroke();

        ctx.restore();
        ctx.restore();

        // HUD
        ctx.font = 'bold 40px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.fillText(`${state.score} m`, 30, 60);

        // Speed bar
        const speedPct = Math.min(player.vx / 50, 1);
        ctx.fillStyle = '#333';
        ctx.fillRect(30, 80, 200, 10);
        ctx.fillStyle = `hsl(${speedPct * 120}, 100%, 50%)`;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(30, 80, 200 * speedPct, 10);
    };

    const handleStart = () => {
        setIsPlaying(true);
        resetGame();
    };

    // Input handlers
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            gameState.current.input.pressing = true;
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            gameState.current.input.pressing = false;
        }
    };

    const handleTouchStart = () => {
        gameState.current.input.pressing = true;
    };

    const handleTouchEnd = () => {
        gameState.current.input.pressing = false;
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('mousedown', handleTouchStart);
        window.addEventListener('mouseup', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('mousedown', handleTouchStart);
            window.removeEventListener('mouseup', handleTouchEnd);
        };
    }, []);

    if (!isPlaying) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-center space-y-6">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 neon-text">
                        SKI ON NEON
                    </h2>

                    <div className="space-y-4 text-slate-300">
                        <p className="text-lg">Glisse sur les ondes néon !</p>
                        <div className="flex flex-col gap-2 text-sm bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <p>👆 <span className="font-bold text-cyan-400">APPUIE</span> pour plonger et accélérer dans les descentes.</p>
                            <p>👐 <span className="font-bold text-purple-400">RELÂCHE</span> pour planer dans les montées.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            size="lg"
                            className="w-full text-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.5)] border-none"
                            onClick={handleStart}
                        >
                            <Play className="mr-2 h-6 w-6" /> JOUER
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
                            onClick={onExit}
                        >
                            <X className="mr-2 h-4 w-4" /> Quitter
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <canvas
                ref={canvasRef}
                className="block w-full h-full touch-none"
            />

            {/* Overlay Controls for Mobile / Pause */}
            <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onExit}>
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center space-y-6 p-8 bg-slate-900/90 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                        <h2 className="text-4xl font-bold text-white">GAME OVER</h2>
                        <div className="text-6xl font-mono text-cyan-400 text-shadow-neon">{Math.floor(score)} m</div>

                        <div className="flex gap-4 justify-center pt-4">
                            <Button size="lg" onClick={resetGame} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                                <RotateCcw className="mr-2 h-5 w-5" /> Rejouer
                            </Button>
                            <Button variant="outline" size="lg" onClick={onExit} className="border-slate-500 text-slate-300 hover:bg-slate-800">
                                Quitter
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
