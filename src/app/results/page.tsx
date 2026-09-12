
'use client';

import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { UserContext } from '@/context/user-context';
import { Score, getScoresForUser } from '@/services/scores';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, CalendarDays, Calendar, CalendarRange, Home, LineChart, Sparkles } from 'lucide-react';
import { FullscreenToggle } from '@/components/fullscreen-toggle';
import { PageBanner, PillLink, PillSlot } from '@/components/layout/page-banner';
import { PageShell, SectionLabel } from '@/components/layout/section';
import { NotConnected, PageLoading } from '@/components/layout/states';
import { ResultsCarousel } from '@/components/results/results-carousel';
import { 
  isSameDay, 
  isSameWeek, 
  isSameMonth, 
  subDays, 
  addDays, 
  subWeeks, 
  addWeeks, 
  subMonths, 
  addMonths, 
  format,
  isToday,
  isYesterday,
  differenceInDays,
  startOfToday,
  startOfWeek,
  startOfMonth,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { OverallProgressChart } from '@/components/results/overall-progress-chart';
export default function ResultsPage() {
    const { student, isLoading: isUserLoading } = useContext(UserContext);
    const [allScores, setAllScores] = useState<Score[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentDay, setCurrentDay] = useState(new Date());
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        async function fetchScores() {
            if (!student) {
                if (!isUserLoading) setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const scores = await getScoresForUser(student.id);
            setAllScores(scores);
            setIsLoading(false);
        }

        if (!isUserLoading) {
            fetchScores();
        }
    }, [student, isUserLoading]);
    
    const scoresForDay = allScores.filter(score => isSameDay(new Date(score.createdAt), currentDay));
    const scoresForWeek = allScores.filter(score => isSameWeek(new Date(score.createdAt), currentWeek, { locale: fr }));
    const scoresForMonth = allScores.filter(score => isSameMonth(new Date(score.createdAt), currentMonth));
    
    // --- Dynamic Date Labels Logic ---
    const getDayLabel = (date: Date): string => {
        const today = startOfToday();
        const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (isToday(targetDay)) return "Aujourd'hui";
        if (isYesterday(targetDay)) return "Hier";
        const diff = differenceInDays(today, targetDay);
        if (diff > 0 && diff < 7) {
            return format(targetDay, "EEEE", { locale: fr });
        }
        return `Il y a ${diff} jours`;
    };

    const getWeekLabel = (date: Date): string => {
        const today = startOfWeek(new Date(), { locale: fr });
        const targetWeek = startOfWeek(date, { locale: fr });
        if (isSameWeek(today, targetWeek, { locale: fr })) return "Cette semaine";
        
        // Manual calculation to avoid type error
        const diff = Math.floor(differenceInDays(today, targetWeek) / 7);

        if (diff === 1) return "La semaine dernière";
        return `Il y a ${diff} semaines`;
    };

    const getMonthLabel = (date: Date): string => {
        const today = startOfMonth(new Date());
        const targetMonth = startOfMonth(date);
        if (isSameMonth(today, targetMonth)) return "Ce mois-ci";
        
        const diff = differenceInDays(today, targetMonth); // Use days to calculate month difference roughly
        const monthDiff = Math.round(diff / 30);

        if (monthDiff === 1) return "Le mois dernier";
        return `En ${format(targetMonth, "MMMM", { locale: fr })}`;
    };

    if (isLoading || isUserLoading) {
        return <PageLoading>Je rassemble tes résultats…</PageLoading>;
    }

    if (!student) {
        return <NotConnected>Connecte-toi pour voir tes progrès.</NotConnected>;
    }

    /** Le nombre d'exercices faits aujourd'hui : le premier chiffre que l'élève cherche. */
    const totalDuJour = scoresForDay.length;

    return (
        <PageShell>
            <PageBanner
                icon={<BarChart3 />}
                title="Mes progrès"
                subtitle={
                    totalDuJour > 0
                        ? `Déjà ${totalDuJour} exercice${totalDuJour > 1 ? 's' : ''} aujourd'hui, ${student.name} !`
                        : `Ton travail jour après jour, ${student.name}.`
                }
                actions={
                    <>
                        <PillLink href="/en-classe" icon={Sparkles}>En classe</PillLink>
                        <PillLink href="/" icon={Home}>Accueil</PillLink>
                        <PillSlot>
                            <FullscreenToggle />
                        </PillSlot>
                    </>
                }
            />

            <div className="flex flex-col gap-8">
                <section>
                    <SectionLabel icon={<CalendarDays />}>Au jour le jour</SectionLabel>
                    <ResultsCarousel
                        title={getDayLabel(currentDay)}
                        subtitle={format(currentDay, "EEEE d MMMM", { locale: fr })}
                        icon={<CalendarDays />}
                        scores={scoresForDay}
                        onPrevious={() => setCurrentDay(d => subDays(d, 1))}
                        onNext={() => setCurrentDay(d => addDays(d, 1))}
                        isNextDisabled={isSameDay(currentDay, new Date())}
                    />
                </section>
                
                <section>
                    <SectionLabel icon={<Calendar />}>Semaine par semaine</SectionLabel>
                     <ResultsCarousel
                        title={getWeekLabel(currentWeek)}
                        subtitle={`Semaine du ${format(startOfWeek(currentWeek, { locale: fr }), "d MMM", { locale: fr })}`}
                        icon={<Calendar />}
                        scores={scoresForWeek}
                        onPrevious={() => setCurrentWeek(w => subWeeks(w, 1))}
                        onNext={() => setCurrentWeek(w => addWeeks(w, 1))}
                        isNextDisabled={isSameWeek(currentWeek, new Date(), { locale: fr })}
                    />
                </section>

                <section>
                    <SectionLabel icon={<CalendarRange />}>Mois par mois</SectionLabel>
                     <ResultsCarousel
                        title={getMonthLabel(currentMonth)}
                        subtitle={format(currentMonth, "MMMM yyyy", { locale: fr })}
                        icon={<CalendarRange />}
                        scores={scoresForMonth}
                        onPrevious={() => setCurrentMonth(m => subMonths(m, 1))}
                        onNext={() => setCurrentMonth(m => addMonths(m, 1))}
                        isNextDisabled={isSameMonth(currentMonth, new Date())}
                    />
                </section>
                
                <section>
                    <SectionLabel icon={<LineChart />}>Ma courbe de progrès</SectionLabel>
                    <OverallProgressChart allScores={allScores} />
                </section>
            </div>
        </PageShell>
    );
}
