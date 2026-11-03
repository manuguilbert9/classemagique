
'use client';

import { useState, useEffect, useContext } from 'react';
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HomeworkPlanCard } from '@/components/homework-plan-card';
import { getHomeworkFeedback } from '@/services/homework-feedback';
import type { HomeworkFeedback } from '@/lib/homework-plan';
import { parisDate, planIsAvailable, homeworkViewer } from '@/lib/homework-period';
import { getStudents, type Student } from '@/services/students';

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
function HomeworkCard({ date, assignment, completedHomework, readOnly=false }: { date: string, assignment: Assignment, completedHomework: HomeworkResult[], readOnly?:boolean }) {
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
              readOnly ? <div key={tache.href} className="rounded-xl border p-4"><p className="text-sm text-muted-foreground">{tache.subject}</p><p className="font-exercise text-lg">{tache.title}</p><p className="mt-2 text-sm">{tache.done?'Réalisé par l’élève':'Pas de réalisation enregistrée'} · ancien exercice, consultation de l’affectation</p></div> : <HomeworkTask key={tache.href} {...tache} />
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
  const [allHomework, setAllHomework] = useState<DatedAssignment[]>([]);
  const [currentTime,setCurrentTime]=useState(()=>new Date());
  const [completedHomework, setCompletedHomework] = useState<HomeworkResult[]>([]);
  const [isLoadingHomework, setIsLoadingHomework] = useState(true);
  const [feedback, setFeedback] = useState<HomeworkFeedback[]>([]);
  const [feedbackError, setFeedbackError] = useState(false);
  const [previewStudentId,setPreviewStudentId]=useState('');
  const [previewDate,setPreviewDate]=useState('');
  const [pupils,setPupils]=useState<Student[]>([]);
  const [pupilsError,setPupilsError]=useState(false);
  const viewer=student?homeworkViewer(student,previewStudentId):{canPreview:false,studentId:'',readOnly:false};
  const viewedStudent=viewer.readOnly?pupils.find(p=>p.id===viewer.studentId):student;
  const today=parisDate(currentTime);
  const availableHomework=allHomework.filter(item=>viewer.readOnly||!item.assignment.plan||planIsAvailable(item.assignment.plan,currentTime));
  const futureHomework=availableHomework.filter(item=>item.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
  const pastHomework=availableHomework.filter(item=>item.date<today).sort((a,b)=>b.date.localeCompare(a.date));

  // Réévaluer à chaque minute sans relire Firestore : une page ouverte à 14 h 59
  // affiche le nouveau devoir dès 15 h. Reprendre aussi l'heure au retour sur l'onglet.
  useEffect(()=>{
    const timer=window.setTimeout(()=>setCurrentTime(new Date()),60000-Date.now()%60000);
    return()=>window.clearTimeout(timer);
  },[currentTime]);
  useEffect(()=>{
    const refreshTime=()=>setCurrentTime(new Date());
    window.addEventListener('focus',refreshTime);
    return()=>window.removeEventListener('focus',refreshTime);
  },[]);

  useEffect(()=>{
    if(!viewer.canPreview)return;
    let cancelled=false;
    getStudents().then(values=>{if(!cancelled){setPupils(values.filter(p=>p.groupId&&!homeworkViewer(p).canPreview).sort((a,b)=>a.name.localeCompare(b.name,'fr')));setPupilsError(false);}}).catch(()=>{if(!cancelled)setPupilsError(true);});
    return()=>{cancelled=true;};
  },[viewer.canPreview]);

  useEffect(() => {
    let cancelled=false;
    async function fetchHomework() {
      if (viewedStudent?.id) {
        setIsLoadingHomework(true);
        const [allAssignments, completedResults] = await Promise.all([
            getHomeworkForStudent(viewedStudent.id, viewedStudent.groupId),
            getHomeworkResultsForUser(viewedStudent.id),
        ]);
        if(cancelled)return;
        setCompletedHomework(completedResults);
        try { const values=await getHomeworkFeedback(viewedStudent.id); if(cancelled)return;setFeedback(values); setFeedbackError(false); }
        catch { if(cancelled)return;setFeedback([]);setFeedbackError(true); }

        setAllHomework(allAssignments);
        setIsLoadingHomework(false);
      } else if (!isUserLoading) {
        setIsLoadingHomework(false);
      }
    }
    fetchHomework();
    return()=>{cancelled=true;};
  }, [viewedStudent?.id,viewedStudent?.groupId,viewer.readOnly,isUserLoading]);

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

      {viewer.canPreview&&<section className="space-y-3 rounded-xl border-2 border-sky-300 bg-sky-50 p-4 text-slate-900"><label className="block font-semibold">Voir comme un élève<select className="mt-2 block h-12 w-full rounded-lg border bg-white px-3 font-normal" value={previewStudentId} onChange={e=>{setPreviewStudentId(e.target.value);setPreviewDate('');}}><option value="">Mes devoirs — M. Manu</option>{pupils.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{pupilsError&&<p role="alert">La liste des élèves n’a pas pu être chargée. Recharge la page pour réessayer.</p>}{viewer.readOnly&&<><p><strong>Mode consultation : {viewedStudent?.name}.</strong> Tu restes connecté en tant que M. Manu. Les essais, l’écoute et les vérifications ne modifient ni ses devoirs réalisés, ni ses résultats.</p>{futureHomework.length>1&&<label className="block">Date à consulter<select className="mt-1 block h-11 w-full rounded-lg border bg-white px-3" value={previewDate||futureHomework[0].date} onChange={e=>setPreviewDate(e.target.value)}>{futureHomework.map(item=><option key={item.date} value={item.date}>{item.date.split('-').reverse().join('/')}{item.assignment.plan?` · S${item.assignment.plan.week}`:''}</option>)}</select></label>}</>}</section>}

      <section>
        <SectionLabel icon={<BookMarked />}>{viewer.readOnly?'Devoirs à consulter':'À faire'}</SectionLabel>
        {feedbackError && <p role="alert" className="mb-3 text-sm text-amber-800">Les retours enregistrés ne sont pas disponibles pour le moment. Tu peux quand même ouvrir tes devoirs.</p>}
        {futureHomework.length > 0 ? (
          (viewer.readOnly&&previewDate?futureHomework.filter(item=>item.date===previewDate):futureHomework.slice(0, 1)).map(item => item.assignment.plan ? <HomeworkPlanCard key={`${viewer.studentId}/${item.date}`} date={item.date} plan={item.assignment.plan} studentId={viewer.studentId} readOnly={viewer.readOnly} feedback={feedback} onFeedback={value=>setFeedback(previous=>[...previous.filter(f=>!(f.date===value.date&&f.subject===value.subject&&f.userId===value.userId)),value])}/> : <HomeworkCard key={item.date} date={item.date} assignment={item.assignment} completedHomework={completedHomework} readOnly={viewer.readOnly} />)
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
                {pastHomework.map(item => item.assignment.plan ? <HomeworkPlanCard key={`${viewer.studentId}/${item.date}`} date={item.date} plan={item.assignment.plan} studentId={viewer.studentId} readOnly={viewer.readOnly} feedback={feedback} onFeedback={value=>setFeedback(previous=>[...previous.filter(f=>!(f.date===value.date&&f.subject===value.subject&&f.userId===value.userId)),value])}/> : <HomeworkCard key={item.date} date={item.date} assignment={item.assignment} completedHomework={completedHomework} readOnly={viewer.readOnly}/>)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      )}
    </PageShell>
  );
}
