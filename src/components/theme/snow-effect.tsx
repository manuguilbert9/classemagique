'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/context/theme-context';
import { usePathname } from 'next/navigation';

export function SnowEffect() {
    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const pathname = usePathname();

    useEffect(() => {
        if (theme !== 'christmas') return;
        if (pathname?.startsWith('/exercise/')) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const snowflakes: { x: number; y: number; radius: number; speed: number; wind: number; color: string; opacity: number; opacitySpeed: number }[] = [];
        const count = 150;
        const colors = ['#FFFFFF', '#FFD700', '#C0C0C0', '#F8B229']; // White, Gold, Silver, Warm Gold

        for (let i = 0; i < count; i++) {
            snowflakes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.5, // Smaller particles
                speed: Math.random() * 0.5 + 0.2, // Slower fall
                wind: Math.random() * 0.5 - 0.25,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random(),
                opacitySpeed: Math.random() * 0.02 + 0.005
            });
        }

        let animationFrameId: number;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            for (const flake of snowflakes) {
                ctx.beginPath();
                ctx.fillStyle = flake.color;
                ctx.globalAlpha = flake.opacity;
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                ctx.fill();

                // Twinkle effect
                flake.opacity += flake.opacitySpeed;
                if (flake.opacity > 1 || flake.opacity < 0.1) {
                    flake.opacitySpeed = -flake.opacitySpeed;
                }
            }
            ctx.globalAlpha = 1; // Reset alpha

            move();
            animationFrameId = requestAnimationFrame(draw);
        };

        const move = () => {
            for (const flake of snowflakes) {
                flake.y += flake.speed;
                flake.x += flake.wind;

                if (flake.y > height) {
                    flake.y = 0;
                    flake.x = Math.random() * width;
                }
                if (flake.x > width) {
                    flake.x = 0;
                } else if (flake.x < 0) {
                    flake.x = width;
                }
            }
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme, pathname]);

    if (theme !== 'christmas') return null;
    if (pathname?.startsWith('/exercise/')) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ pointerEvents: 'none' }}
        />
    );
}
