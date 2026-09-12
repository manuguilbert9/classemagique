'use client';

import { Home, BarChart3, ListChecks, Gem, MessageSquare, Sparkles, BookMarked } from 'lucide-react';
import { FullscreenToggle } from '@/components/fullscreen-toggle';
import { PageBanner, PillIcon, PillLink, PillSlot } from '@/components/layout/page-banner';

interface PageHeaderProps {
    studentName: string;
    nuggets: number;
    hasCustomSchedule?: boolean;
    totalUnreadCount: number;
    onToggleChat: () => void;
}

/** L'en-tête de la page « En classe » : le bandeau commun, garni pour l'élève. */
export function EnClassePageHeader({ studentName, nuggets, hasCustomSchedule, totalUnreadCount, onToggleChat }: PageHeaderProps) {
    return (
        <PageBanner
            icon={<Sparkles />}
            title={`Bonjour, ${studentName} !`}
            subtitle="Prêt(e) à relever un défi aujourd'hui ?"
            actions={
                <>
                    <PillLink href="/" icon={Home}>Accueil</PillLink>
                    <PillLink href="/devoirs" icon={BookMarked}>Mes devoirs</PillLink>
                    <PillLink href="/results" icon={BarChart3}>Mes progrès</PillLink>
                    {hasCustomSchedule && <PillLink href="/planning" icon={ListChecks}>Mon planning</PillLink>}
                    <PillLink href="/rewards" icon={Gem} className="border-amber-200/40 bg-amber-400/25">
                        {nuggets}
                    </PillLink>
                    <PillIcon
                        icon={MessageSquare}
                        onClick={onToggleChat}
                        ariaLabel="Ouvrir la messagerie"
                        badge={totalUnreadCount}
                    />
                    <PillSlot>
                        <FullscreenToggle />
                    </PillSlot>
                </>
            }
        />
    );
}
