

'use client';

import { useContext, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { skills as allSkills } from '@/lib/skills';
import { ChevronDown, Boxes, Wrench, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UserContext } from '@/context/user-context';
import { getScoresForUser } from '@/services/scores';
import { updateStudent } from '@/services/students';
import { dateDuJourLocal, estMiseEnAvantPerimee, exercicesAdaptesAuxNiveaux } from '@/lib/mise-en-avant';
import { isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChatManager } from '@/components/chat/chat-manager';
import { ChatContext } from '@/context/chat-context';
import { EnClassePageHeader } from '@/components/en-classe/page-header';
import { ExerciseCard, ToolTile } from '@/components/en-classe/exercise-card';
import { ExercisesExplorer } from '@/components/en-classe/exercises-explorer';
import { NotebookToolCard } from '@/components/en-classe/notebook-tool-card';

const toolSkills = allSkills.filter((skill) => skill.isTool);
const nonToolSkills = allSkills.filter((skill) => !skill.isTool);

export default function EnClassePage() {
  const { student, isLoading: isUserLoading } = useContext(UserContext);
  const [todaysSkills, setTodaysSkills] = useState<typeof allSkills | null>(null);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const [skillsCompletedToday, setSkillsCompletedToday] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { totalUnreadCount } = useContext(ChatContext);

  useEffect(() => {
      async function determineEnabledSkills() {
        if (!student) {
            if (!isUserLoading) {
                setTodaysSkills([]);
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(true);

        const scores = await getScoresForUser(student.id);
        const completedToday = new Set<string>();
        scores.forEach(score => {
            if (isToday(new Date(score.createdAt))) {
                completedToday.add(score.skill);
            }
        });
        setSkillsCompletedToday(completedToday);

        // Renouvellement automatique : si personne n'a touché la mise en avant
        // aujourd'hui et qu'il est 17h passées, on la remplace par les exercices
        // adaptés au niveau déclaré de l'élève, domaine par domaine.
        let misEnAvantActuel = student.misEnAvant;
        if (estMiseEnAvantPerimee(student.misEnAvantUpdatedAt)) {
            const slugsAdaptes = exercicesAdaptesAuxNiveaux(student.niveauxParDomaine);
            if (slugsAdaptes.length > 0) {
                misEnAvantActuel = slugsAdaptes;
                void updateStudent(student.id, {
                    misEnAvant: slugsAdaptes,
                    misEnAvantUpdatedAt: dateDuJourLocal(),
                    misEnAvantSource: 'auto',
                });
            }
        }

        // Les exercices mis en avant par l'enseignant. Tout le reste demeure
        // accessible dans le tiroir : plus rien n'est hors de portée de l'élève.
        // Les outils (ex: cahier d'écriture) ne passent jamais par cette sélection :
        // ils ont leur propre étagère, toujours visible.
        const misEnAvant = misEnAvantActuel
          ? nonToolSkills.filter(skill => misEnAvantActuel!.includes(skill.slug))
          : nonToolSkills.filter(skill => student.enabledSkills?.[skill.slug]);

        setTodaysSkills(misEnAvant);
        setIsLoading(false);
      }

      if (!isUserLoading) {
        determineEnabledSkills();
      }
  }, [student, isUserLoading]);

  if (isLoading || isUserLoading) {
    return (
        <main className="container mx-auto px-4 py-8">
            <Skeleton className="h-32 w-full rounded-[26px] mb-8" />
            <Skeleton className="h-24 w-full rounded-[22px] mb-8" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-[20px]" />
                ))}
            </div>
        </main>
    );
  }

  if (!student) {
       return (
        <main className="container mx-auto px-4 py-8">
            <header className="mb-12 text-center space-y-4">
                 <h2 className="font-headline text-4xl sm:text-5xl">Veuillez vous connecter</h2>
                 <Button asChild>
                    <Link href="/">Retour à l'accueil</Link>
                 </Button>
            </header>
        </main>
       )
  }

  return (
    <>
    <main className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-8">

        <EnClassePageHeader
          studentName={student.name}
          nuggets={student.nuggets || 0}
          hasCustomSchedule={student.hasCustomSchedule}
          totalUnreadCount={totalUnreadCount}
          onToggleChat={() => setIsChatOpen(prev => !prev)}
        />

        {/* Les outils : jamais notés, toujours accessibles, quoi que le professeur ait mis en avant. */}
        <section>
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-primary">
            <Wrench className="h-3.5 w-3.5" />
            Mes outils — toujours à portée de main
          </div>
          <div className="flex flex-wrap items-start gap-5">
            {toolSkills.map((skill) => (
              skill.slug === 'writing-notebook'
                ? <NotebookToolCard key={skill.slug} skill={skill} />
                : <ToolTile key={skill.slug} skill={skill} />
            ))}
          </div>
        </section>

        {/* Ce que l'enseignant met en avant aujourd'hui */}
        <section>
          <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold font-headline">Aujourd&apos;hui</h2>
            <span className="text-sm text-muted-foreground">Choisi pour toi par ton enseignant</span>
          </div>
          {todaysSkills && todaysSkills.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {todaysSkills.map((skill) => (
                <ExerciseCard
                  key={skill.slug}
                  skill={skill}
                  done={skillsCompletedToday.has(skill.slug)}
                  variant="hero"
                />
              ))}
            </div>
          ) : (
            <Card className="mx-auto max-w-2xl rounded-[20px] border-2 border-dashed p-8 text-center shadow-none">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="font-headline text-xl">Rien de particulier aujourd&apos;hui</h3>
              <p className="mt-1.5 text-muted-foreground">
                Ouvre &laquo;&nbsp;Tous les exercices&nbsp;&raquo; ci-dessous : tout t&apos;attend.
              </p>
            </Card>
          )}
        </section>

        {/* Le tiroir : tous les exercices, rangés par domaine, toujours accessibles */}
        <section>
          <button
            type="button"
            onClick={() => setTiroirOuvert((v) => !v)}
            aria-expanded={tiroirOuvert}
            className="flex w-full items-center justify-center gap-3 rounded-[20px] border-2 border-dashed bg-card py-4 font-headline text-xl transition-colors hover:bg-muted sm:text-2xl"
          >
            <Boxes className="h-6 w-6 text-primary" />
            Tous les exercices
            <span className="rounded-full border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {nonToolSkills.length} activités
            </span>
            <ChevronDown className={cn('h-5 w-5 transition-transform', tiroirOuvert && 'rotate-180')} />
          </button>
          {tiroirOuvert && (
            <div className="mt-4">
              <ExercisesExplorer skills={nonToolSkills} skillsCompletedToday={skillsCompletedToday} />
            </div>
          )}
        </section>

      </div>
    </main>
    {isChatOpen && student && <ChatManager student={student} onClose={() => setIsChatOpen(false)} />}
    </>
  );
}
