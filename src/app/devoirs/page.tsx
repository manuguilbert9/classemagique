
'use client';

import { useState, useEffect, useContext, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Home, ArrowRight, BookMarked, BrainCircuit, CheckCircle, Info, PartyPopper, Sparkles } from 'lucide-react';
import { FullscreenToggle } from '@/components/fullscreen-toggle';
import { PageBanner, PillLink, PillSlot } from '@/components/layout/page-banner';
import { EmptyState, PageShell, SectionLabel } from '@/components/layout/section';
import { NotConnected, PageLoading } from '@/components/layout/states';
import { cn } from '@/lib/utils';
import { getSkillBySlug } from '@/lib/skills';
import { UserContext } from '@/context/user-context';
import { getHomeworkForStudent, getHomeworkResultsForUser, type Assignment, type HomeworkResult } from '@/services/homework';
import { getSemaine, libelleSession, parseSessionId } from '@/services/dictees';
import { format, isBefore, startOfToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface DatedAssignment {
  date: string;
  assignment: Assignment;
}

/**
 * Une tâche du devoir : la matière, l'exercice, et l'état « fait ou pas ».
 * Les trois blocs (dictée, français, maths) étaient recopiés à l'identique ;
 * ils partagent maintenant la même tuile, et le même repère visuel qu'en classe.
 */
function HomeworkTask({
  href,
  icon,
  title,
  subject,
  accent,
  done,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subject: string;
  accent: { bg: string; text: string };
  done: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-4 rounded-[20px] border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-lg',
        done && 'border-emerald-300 bg-emerald-50/60'
      )}
    >
      <span
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110 [&>svg]:h-6 [&>svg]:w-6',
          done ? 'bg-emerald-500 text-white' : cn(accent.bg, accent.text)
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-extrabold uppercase tracking-wide text-muted-foreground">{subject}</span>
        <span className="block font-exercise text-lg leading-tight">{title}</span>
      </span>
      {done ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
          <CheckCircle className="h-3.5 w-3.5" /> Fait
        </span>
      ) : (
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      )}
    </Link>
  );
}

/** Une journée de devoirs : sa date, ses consignes libres, ses tâches. */
function HomeworkCard({ date, assignment, completedHomework }: { date: string, assignment: Assignment, completedHomework: HomeworkResult[] }) {
  const frenchSkill = assignment.francais ? getSkillBySlug(assignment.francais) : null;
  const mathSkill = assignment.maths ? getSkillBySlug(assignment.maths) : null;
  // Le champ « orthographe » porte l'identifiant d'une séance de dictée, ex. « S12-J4 ».
  const dicteeId = assignment.orthographe || null;
  const dicteeSeance = dicteeId ? parseSessionId(dicteeId) : null;
  const dicteeSemaine = dicteeSeance ? getSemaine(dicteeSeance.semaine) : undefined;
  const dicteeLabel =
    dicteeSemaine && dicteeSeance ? libelleSession(dicteeSemaine, dicteeSeance.jour) : 'Dictée';

  const isCompleted = (skillSlug: string | null) => {
    if (!skillSlug) return false;
    return completedHomework.some(result => result.date === date && (result.skillSlug === skillSlug || result.skillSlug.startsWith(skillSlug)));
  }

  const taches = [
    dicteeId && {
      href: `/dictee/${dicteeId}?from=devoirs&date=${date}`,
      icon: <BrainCircuit />,
      title: dicteeLabel,
      subject: dicteeSemaine ? dicteeSemaine.notion.titre : 'Orthographe',
      accent: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
      done: isCompleted(`orthographe-${dicteeId}`),
    },
    frenchSkill && {
      href: `/exercise/${frenchSkill.slug}?from=devoirs&date=${date}`,
      icon: frenchSkill.icon,
      title: frenchSkill.name,
      subject: 'Français',
      accent: { bg: 'bg-sky-100', text: 'text-sky-600' },
      done: isCompleted(frenchSkill.slug),
    },
    mathSkill && {
      href: `/exercise/${mathSkill.slug}?from=devoirs&date=${date}`,
      icon: mathSkill.icon,
      title: mathSkill.name,
      subject: 'Mathématiques',
      accent: { bg: 'bg-amber-100', text: 'text-amber-600' },
      done: isCompleted(mathSkill.slug),
    },
  ].filter(Boolean) as Array<Parameters<typeof HomeworkTask>[0]>;

  const faits = taches.filter((t) => t.done).length;
  const tout = taches.length > 0 && faits === taches.length;

  return (
    <Card className="overflow-hidden rounded-[22px]">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b bg-muted/40">
        <CardTitle className="font-headline text-2xl">
          Pour le {format(new Date(date.replace(/-/g, '/')), 'EEEE d MMMM', { locale: fr })}
        </CardTitle>
        {/* L'avancement de la journée, d'un coup d'oeil. */}
        {taches.length > 0 && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold',
              tout ? 'bg-emerald-500 text-white' : 'bg-background text-muted-foreground'
            )}
          >
            {tout ? <PartyPopper className="h-4 w-4" /> : null}
            {faits} / {taches.length} fait{faits > 1 ? 's' : ''}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {assignment.notes && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertTitle>Le mot du maître</AlertTitle>
            <AlertDescription>{assignment.notes}</AlertDescription>
          </Alert>
        )}
        {taches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {taches.map((tache) => (
              <HomeworkTask key={tache.href} {...tache} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-muted-foreground">Rien à faire ce jour-là.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DevoirsPage() {
  const { student, isLoading: isUserLoading } = useContext(UserContext);
  const [futureHomework, setFutureHomework] = useState<DatedAssignment[]>([]);
  const [pastHomework, setPastHomework] = useState<DatedAssignment[]>([]);
  const [completedHomework, setCompletedHomework] = useState<HomeworkResult[]>([]);
  const [isLoadingHomework, setIsLoadingHomework] = useState(true);

  useEffect(() => {
    async function fetchHomework() {
      if (student?.groupId) {
        setIsLoadingHomework(true);
        const [allAssignments, completedResults] = await Promise.all([
            getHomeworkForStudent(student.id, student.groupId),
            getHomeworkResultsForUser(student.id),
        ]);
        
        setCompletedHomework(completedResults);

        const today = startOfToday();
        const future: DatedAssignment[] = [];
        const past: DatedAssignment[] = [];

        allAssignments.forEach(item => {
            try {
                const itemDate = parseISO(item.date);
                if (isBefore(itemDate, today)) {
                    past.push(item);
                } else {
                    future.push(item);
                }
            } catch (e) {
                console.error("Invalid date format for homework item:", item.date, e);
            }
        });
        
        future.sort((a,b) => a.date.localeCompare(b.date));
        past.sort((a,b) => b.date.localeCompare(a.date));

        setFutureHomework(future);
        setPastHomework(past);
        setIsLoadingHomework(false);
      } else if (!isUserLoading) {
        setIsLoadingHomework(false);
      }
    }
    fetchHomework();
  }, [student, isUserLoading]);

  if (isUserLoading || isLoadingHomework) {
    return <PageLoading>Je cherche tes devoirs…</PageLoading>;
  }

  if (!student) {
    return <NotConnected>Connecte-toi pour voir tes devoirs.</NotConnected>;
  }

  return (
    <PageShell>
      <PageBanner
        icon={<BookMarked />}
        title="Mes devoirs"
        subtitle={
          futureHomework.length > 0
            ? "Voici ce qu'il y a à faire pour la prochaine fois."
            : "Rien à faire pour l'instant — profites-en !"
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

      <section>
        <SectionLabel icon={<BookMarked />}>À faire</SectionLabel>
        {futureHomework.length > 0 ? (
          futureHomework.slice(0, 1).map(item => <HomeworkCard key={item.date} date={item.date} assignment={item.assignment} completedHomework={completedHomework} />)
        ) : (
          <EmptyState icon={<PartyPopper />} title="Aucun devoir à venir">
            Rien n&apos;est prévu pour les prochains jours. Tu peux aller t&apos;entraîner en classe si tu en as envie.
          </EmptyState>
        )}
      </section>

      {pastHomework.length > 0 && (
        <section>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="past-homework" className="border-none">
              <AccordionTrigger className="rounded-[20px] border-2 border-dashed bg-card px-5 py-4 font-headline text-xl hover:bg-muted hover:no-underline">
                Mes devoirs passés
                <span className="ml-auto mr-3 rounded-full border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {pastHomework.length}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                {pastHomework.map(item => <HomeworkCard key={item.date} date={item.date} assignment={item.assignment} completedHomework={completedHomework}/>)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      )}
    </PageShell>
  );
}
