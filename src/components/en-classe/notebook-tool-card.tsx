'use client';

import Link from 'next/link';
import type { Skill } from '@/lib/skills';

interface NotebookToolCardProps {
    skill: Skill;
}

/**
 * Le cahier d'écriture représenté comme un vrai cahier d'écolier (grands carreaux,
 * couverture rouge, coins coupés, piqûre visible sur la tranche) : les élèves qui
 * écrivent sur papier retrouvent ici le même repère visuel que leur cahier 17x22.
 */
export function NotebookToolCard({ skill }: NotebookToolCardProps) {
    return (
        <Link href={`/exercise/${skill.slug}`} aria-label={`Ouvrir l'outil ${skill.name}`} className="group flex flex-col items-center gap-2">
            <div
                className="relative w-[168px] transition-transform duration-200 drop-shadow-md group-hover:-translate-y-1 group-hover:drop-shadow-xl"
                style={{ aspectRatio: '17 / 22' }}
            >
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)' }}
                >
                    {/* Couverture rouge */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-red-500 to-red-700" />
                    {/* Reflet brillant, façon couverture plastifiée */}
                    <div
                        className="absolute inset-0"
                        style={{ background: 'radial-gradient(130% 90% at 22% 8%, rgba(255,255,255,.35), transparent 55%)' }}
                    />
                    {/* Quadrillage "grands carreaux" */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(to bottom, transparent 0 7px, rgba(0,0,0,.4) 7px 8px), repeating-linear-gradient(to right, transparent 0 15px, rgba(0,0,0,.3) 15px 16px)',
                        }}
                    />
                    {/* Marge de gauche */}
                    <div className="absolute inset-y-0 left-[13%] w-px bg-black/30" />
                    {/* Piqûres, sur la tranche */}
                    <span className="absolute left-0 top-[15%] h-2 w-2 rounded-r-[2px] bg-neutral-800/50" />
                    <span className="absolute left-0 top-[48%] h-2 w-2 rounded-r-[2px] bg-neutral-800/50" />
                    <span className="absolute left-0 top-[81%] h-2 w-2 rounded-r-[2px] bg-neutral-800/50" />
                    {/* Étiquette "outil libre" */}
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-red-600 shadow-sm">
                        Outil libre
                    </span>
                    {/* Icône embossée */}
                    <div className="absolute inset-0 flex items-center justify-center pb-8 text-white/85 [&>svg]:h-16 [&>svg]:w-16 [&>svg]:drop-shadow-md">
                        {skill.icon}
                    </div>
                    {/* Étiquette du titre, façon étiquette de cahier */}
                    <div className="absolute inset-x-2.5 bottom-2.5 rounded-md bg-white/95 px-2 py-1.5 text-center shadow-sm">
                        <p className="font-exercise text-[15px] font-bold leading-tight text-red-700">{skill.name}</p>
                    </div>
                </div>
            </div>
            <p className="max-w-[168px] text-center text-xs leading-snug text-muted-foreground">{skill.description}</p>
        </Link>
    );
}
