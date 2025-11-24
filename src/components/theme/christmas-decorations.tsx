'use client';

import { useTheme } from '@/context/theme-context';
import Image from 'next/image';

export function ChristmasDecorations() {
    const { theme } = useTheme();

    if (theme !== 'christmas') return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Top Left Corner */}
            <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 mix-blend-multiply">
                <Image
                    src="/images/theme/holly-corner.png"
                    alt="Decoration"
                    fill
                    className="object-contain opacity-90"
                />
            </div>

            {/* Top Right Corner - Flipped */}
            <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 transform scale-x-[-1] mix-blend-multiply">
                <Image
                    src="/images/theme/holly-corner.png"
                    alt="Decoration"
                    fill
                    className="object-contain opacity-90"
                />
            </div>

            {/* Top Center Garland */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-24 md:h-32 mix-blend-multiply">
                <Image
                    src="/images/theme/garland-top.png"
                    alt="Garland"
                    fill
                    className="object-contain object-top opacity-90"
                />
            </div>

            {/* Bottom Winter Scene */}
            <div className="absolute bottom-0 left-0 w-full h-32 md:h-48 opacity-60 mix-blend-multiply">
                <Image
                    src="/images/theme/winter-scene-bottom.png"
                    alt="Winter Scene"
                    fill
                    className="object-cover object-bottom"
                />
            </div>
        </div>
    );
}
