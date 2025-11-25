'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Trophy, Play, RotateCcw, Heart } from 'lucide-react';

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
    const [lives, setLives] = useState(3);

    // Game constants
    const GRAVITY = 0.18;
    const HEAVY_GRAVITY = 0.7;
    const FRICTION = 0.99;
    const AIR_RESISTANCE = 0.998;
    const BOOST = 1.05;

    // Game state refs
    const gameState = useRef({
        player: {
            x: 0,
            y: 0,
            vx: 10,
            vy: 0,
            angle: 0,
            onGround: false,
            invincible: 0,
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
            baseHeight: 300,
        },
        particles: [] as Particle[],
        input: {
            pressing: false,
        },
        score: 0,
        lives: 3,
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
                invincible: 0,
            },
            camera: { x: 0, y: 0, zoom: 1, targetZoom: 1 },
            terrain: { points: [], chunkSize: 100, lastX: 0, baseHeight: 300 },
            particles: [],
            input: { pressing: false },
            score: 0,
            lives: 3,
            running: true,
            frameCount: 0,
            combo: 0,
        };
        generateTerrain(0, 3000);
        // Place player on terrain
        const startY = getTerrainHeight(0);
        gameState.current.player.y = startY - 20;
        setScore(0);
        setLives(3);
        setGameOver(false);
    };

    const generateTerrain = (startX: number, width: number) => {
        const { terrain } = gameState.current;
        let x = startX;

        // If it's the first chunk, initialize
        if (terrain.points.length === 0) {
            terrain.points.push({ x: 0, y: terrain.baseHeight });
            terrain.lastX = 0;
        }

        // We want to keep the terrain somewhat centered vertically
        // So we'll use a base height that doesn't drift too much
        for (let i = 0; i < width; i += 20) {
            x = terrain.lastX + 20;

            // Progressive difficulty
            const difficulty = Math.min(x / 20000, 1);

            // Main hills - reduce amplitude slightly to keep in frame better
            const amp1 = 120 + difficulty * 80;
            const freq1 = 0.003;

            // Detail
            const amp2 = 40;
            const freq2 = 0.01;

            // Gentle downward trend but reset occasionally or keep oscillating around base
            // Instead of linear slope, let's use a very slow sine wave for the "global" slope
            const globalY = terrain.baseHeight + Math.sin(x * 0.0005) * 200;

            const y = globalY + Math.sin(x * freq1) * amp1 + Math.sin(x * freq2) * amp2;

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

    const createParticles = (x: number, y: number, count: number, color: string, speed: number, type: 'spark' | 'explosion' = 'spark') => {
        for (let i = 0; i < count; i++) {
            gameState.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                life: 1.0,
                color,
                size: type === 'explosion' ? Math.random() * 5 + 2 : Math.random() * 3 + 1
            });
        }
    };

    const handleCrash = () => {
        const state = gameState.current;
        if (state.player.invincible > 0) return;

        state.lives--;
        setLives(state.lives);

        // Explosion effect
        createParticles(state.player.x, state.player.y, 30, '#ff0000', 10, 'explosion');

        if (state.lives <= 0) {
            state.running = false;
            setGameOver(true);
            if (onGameEnd) onGameEnd(state.score);
        } else {
            // Reset player slightly back and up
            state.player.y -= 100;
            state.player.vx = 5; // Reset speed
            state.player.vy = 0;
            state.player.angle = 0;
            state.player.invincible = 120; // 2 seconds invincibility (at 60fps)
        }
    };

    const update = () => {
        const state = gameState.current;
        if (!state.running) return;

        const { player, input, particles } = state;

        if (player.invincible > 0) player.invincible--;

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
            const slopeAngle = getTerrainNormal(player.x);

            // Angle difference logic
            let angleDiff = player.angle - slopeAngle;
            // Normalize angle diff to -PI to PI
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            // Crash Logic: If landing on head/back (diff > ~90 degrees or 1.5 rad)
            if (Math.abs(angleDiff) > 1.5 && !player.onGround && player.invincible === 0) {
                handleCrash();
                // Bounce up a bit if not game over
                if (state.running) {
                    player.vy = -5;
                    player.y = terrainH - 15;
                }
                return;
            }

            player.onGround = true;
            player.y = terrainH - 10;

            // Speed Penalty for bad angles
            // If diff is significant (> 0.5 rad), lose speed
            if (Math.abs(angleDiff) > 0.5) {
                player.vx *= 0.90; // Hard braking
                createParticles(player.x, player.y + 10, 1, '#ffaa00', 3); // Friction sparks
            }

            // Slope physics
            if (input.pressing) {
                // Diving: Add force along the slope (downhill)
                // Only if slope is downwards
                player.vx += Math.sin(slopeAngle) * 0.9;

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

            // Redirect velocity
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
                // Align to velocity slowly
                const vAngle = Math.atan2(player.vy, player.vx);
                player.angle = player.angle * 0.95 + vAngle * 0.05;
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
        // Tighter zoom: 0.8 to 1.2 instead of 0.6 to 1.5
        const targetZoom = Math.max(0.8, 1.2 - (player.vx / 80));
        state.camera.targetZoom = targetZoom;
        state.camera.zoom = state.camera.zoom * 0.95 + state.camera.targetZoom * 0.05;

        // Center player more
        state.camera.x = player.x - (window.innerWidth / 3) / state.camera.zoom;
        // Smooth Y follow
        const targetY = player.y - (window.innerHeight / 2) / state.camera.zoom;
        state.camera.y = state.camera.y * 0.9 + targetY * 0.1;

        // Score
        state.score = Math.floor(player.x / 10);
        setScore(state.score);

        state.frameCount++;
    };

    const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const state = gameState.current;
        const { player, camera, terrain, particles } = state;

        // Clear
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
        ctx.translate(-camera.x, -camera.y);

        // Draw Terrain
        ctx.beginPath();
        let started = false;
        // Optimization: only draw visible points
        const visibleMargin = 500;
        const leftBound = camera.x - visibleMargin;
        const rightBound = camera.x + (width / camera.zoom) + visibleMargin;

        for (const p of terrain.points) {
            if (p.x < leftBound) continue;
            if (p.x > rightBound) break;

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
            // Close shape way down
            ctx.lineTo(last.x, last.y + 3000);
            ctx.lineTo(camera.x - 1000, last.y + 3000);
        }

        // Neon Glow Style
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f3ff';
        ctx.stroke();

        const gradient = ctx.createLinearGradient(0, camera.y, 0, camera.y + height / camera.zoom);
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
        if (player.invincible % 10 < 5) { // Flicker if invincible
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
        }

        ctx.restore();

        // HUD
        ctx.font = 'bold 40px "Courier New", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.fillText(`${state.score} m`, 30, 60);

        // Lives
        for (let i = 0; i < 3; i++) {
            // Draw hearts
            const x = width - 50 - (i * 40);
            // We can't draw lucide icons on canvas easily, so draw simple heart shape or use text
            ctx.fillStyle = i < state.lives ? '#ff0055' : '#333333';
            ctx.font = '30px Arial';
            ctx.fillText('❤', x, 60);
        }

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
                            <p>⚠️ <span className="font-bold text-red-400">ATTENTION</span> atterris bien parallèle à la pente !</p>
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
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Container to constrain aspect ratio if needed, or just full screen but with tighter camera logic */}
            <div className="relative w-full h-full max-w-5xl max-h-[800px] overflow-hidden border-y-4 border-slate-800 bg-black shadow-2xl">
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
                            <div className="space-y-2">
                                <div className="text-6xl font-mono text-cyan-400 text-shadow-neon">{Math.floor(score)} m</div>
                                <div className="text-xl text-yellow-400 font-bold">
                                    +{Math.floor(score / 50)} pépites
                                </div>
                            </div>

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
        </div>
    );
}
