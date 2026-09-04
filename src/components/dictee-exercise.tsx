'use client';

import { useState, useEffect, useMemo, useCallback, useContext, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowLeft, ArrowRight, BookOpen, Check, RefreshCw, Star, Volume2, X } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/user-context';
import { addScore, type ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from '@/components/score-tube';
import {
  DICTEES_CE2,
  comparer,
  getCorpusPourNiveau,
  getSession,
  libelleNiveau,
  libelleSession,
  niveauPourSkillLevel,
  type ComparaisonResultat,
  type DicteeJourTravaille,
  type DicteeSession,
} from '@/services/dictees';

interface DicteeExerciseProps {
  /** Identifiant de séance, ex. « S12-J4 ». Absent : l'élève choisit sa dictée. */
  sessionId?: string;
  onFinish?: () => void;
}

interface Reponse {
  attendu: string;
  saisi: string;
  resultat: ComparaisonResultat;
}

/** Les dictées de phrases et les bilans se saisissent dans une zone multiligne. */
function estUneSaisieLongue(session: DicteeSession): boolean {
  return session.type === 'phrases' || session.type === 'bilan';
}

export function DicteeExercise({ sessionId, onFinish }: DicteeExerciseProps) {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const niveau = useMemo(
    () => niveauPourSkillLevel(student?.levels?.['spelling']),
    [student]
  );
  /** Au niveau 1, accents, majuscules et ponctuation ne sont pas comptés. */
  const exigeant = niveau >= 2;

  const [choix, setChoix] = useState<string | null>(sessionId ?? null);
  const session = useMemo(() => (choix ? getSession(choix, niveau) : null), [choix, niveau]);

  const [etape, setEtape] = useState<'preparation' | 'dictee' | 'bilan'>('preparation');
  const [index, setIndex] = useState(0);
  const [saisie, setSaisie] = useState('');
  const [resultatCourant, setResultatCourant] = useState<ComparaisonResultat | null>(null);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [enregistre, setEnregistre] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const champRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const itemCourant = session?.items[index] ?? '';

  /* ----------------------------- Synthèse vocale ---------------------------- */

  const dire = useCallback((texte: string, vitesse = 1) => {
    if (!texte || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = 'fr-FR';
    utterance.rate = vitesse;
    window.speechSynthesis.speak(utterance);
  }, []);

  // On dicte automatiquement chaque nouvel item.
  useEffect(() => {
    if (etape !== 'dictee' || !itemCourant) return;
    const timer = setTimeout(() => dire(itemCourant), 400);
    return () => clearTimeout(timer);
  }, [etape, itemCourant, dire]);

  useEffect(() => {
    if (etape === 'dictee' && !resultatCourant) {
      setTimeout(() => champRef.current?.focus(), 150);
    }
  }, [etape, index, resultatCourant]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* ------------------------------ Déroulement ------------------------------- */

  const valider = () => {
    if (!session || resultatCourant) return;
    const resultat = comparer(itemCourant, saisie, exigeant);
    setResultatCourant(resultat);
    setReponses((prev) => [...prev, { attendu: itemCourant, saisi: saisie, resultat }]);
    if (resultat.correct) setConfetti(true);
  };

  const suivant = () => {
    setConfetti(false);
    setResultatCourant(null);
    setSaisie('');
    if (session && index < session.items.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setEtape('bilan');
    }
  };

  const recommencer = () => {
    setEtape('preparation');
    setIndex(0);
    setSaisie('');
    setResultatCourant(null);
    setReponses([]);
    setEnregistre(false);
    setConfetti(false);
  };

  /* -------------------------------- Résultat -------------------------------- */

  const totalMots = reponses.reduce((n, r) => n + r.resultat.totalMots, 0);
  const motsCorrects = reponses.reduce((n, r) => n + r.resultat.motsCorrects, 0);
  const score = totalMots > 0 ? Math.round((motsCorrects / totalMots) * 100) : 0;

  useEffect(() => {
    async function enregistrer() {
      if (etape !== 'bilan' || !student || enregistre || !session || reponses.length === 0) return;
      setEnregistre(true);

      const details: ScoreDetail[] = reponses.map((r) => ({
        question: `${session.typeLabel} — écrire : « ${r.attendu} »`,
        userAnswer: r.saisi,
        correctAnswer: r.attendu,
        status: r.resultat.correct ? 'correct' : 'incorrect',
        mistakes: r.resultat.mots.filter((m) => !m.correct).map((m) => m.attendu),
      }));

      try {
        if (isHomework && homeworkDate) {
          await saveHomeworkResult({
            userId: student.id,
            date: homeworkDate,
            skillSlug: `orthographe-${session.id}`,
            score,
          });
        } else {
          await addScore({ userId: student.id, skill: 'spelling', score, details });
        }
      } catch (error) {
        console.error('Enregistrement de la dictée impossible :', error);
      }
    }
    enregistrer();
  }, [etape, student, enregistre, session, reponses, score, isHomework, homeworkDate]);

  /* --------------------------------- Rendus --------------------------------- */

  // 1. Choix de la dictée (entraînement libre)
  if (!session) {
    if (choix) {
      return (
        <Card className="w-full max-w-lg mx-auto p-8 text-center">
          <CardTitle className="mb-2">Dictée introuvable</CardTitle>
          <CardDescription>La séance « {choix} » n&apos;existe pas.</CardDescription>
          <Button className="mt-6" variant="outline" onClick={() => setChoix(null)}>
            Choisir une autre dictée
          </Button>
        </Card>
      );
    }
    return <SelecteurDeDictee onSelect={(id) => setChoix(id)} />;
  }

  const semaine = session.semaine;

  // 2. Préparation : on présente la semaine avant de commencer.
  if (etape === 'preparation') {
    const corpus = getCorpusPourNiveau(semaine, session.niveau);
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {onFinish && (
          <Button variant="ghost" onClick={onFinish}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        )}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary">Semaine {semaine.semaine}</Badge>
              <Badge variant="secondary">Période {semaine.periode}</Badge>
              <Badge>{session.typeLabel}</Badge>
              <Badge variant="outline">{libelleNiveau(session.niveau)}</Badge>
            </div>
            <CardTitle className="font-headline text-3xl">{semaine.notion.titre}</CardTitle>
            <CardDescription className="text-base">
              Corpus lexical : {semaine.corpusTheme} · {session.items.length}{' '}
              {session.jour === 4 ? 'phrases à écrire' : 'éléments à écrire'}
              {session.nombreDeMots ? ` (${session.nombreDeMots} mots)` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{session.objectif}</p>

            <p className="text-sm rounded-md bg-muted/60 p-3">
              {exigeant
                ? 'À ton niveau, les accents, les majuscules et la ponctuation comptent dans la correction.'
                : "À ton niveau, les accents, les majuscules et la ponctuation ne sont pas comptés : concentre-toi sur les lettres des mots."}
            </p>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Les mots de la semaine
              </h3>
              <div className="flex flex-wrap gap-2">
                {corpus.map((mot) => (
                  <span key={mot} className="rounded-md bg-muted px-2 py-1 text-sm">
                    {mot}
                  </span>
                ))}
              </div>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="regles">
                <AccordionTrigger>Les règles à retenir</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {semaine.regularites.map((r) => (
                    <div key={r.titre}>
                      <p className="font-semibold">{r.titre}</p>
                      <p className="text-sm text-muted-foreground">{r.explication}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button size="lg" className="w-full" onClick={() => setEtape('dictee')}>
              Commencer la dictée
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Bilan de la séance
  if (etape === 'bilan') {
    const aRevoir = reponses.flatMap((r) => r.resultat.mots.filter((m) => !m.correct));
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <Card className="text-center p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Confetti
              active={score === 100}
              config={{
                angle: 90,
                spread: 360,
                startVelocity: 40,
                elementCount: 100,
                dragFriction: 0.12,
                duration: 3000,
                stagger: 3,
                width: '10px',
                height: '10px',
              }}
            />
          </div>
          <Star className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="font-headline text-4xl mb-2">Dictée terminée !</h1>
          <p className="text-lg text-muted-foreground mb-6">
            {motsCorrects} mots justes sur {totalMots}.
          </p>
          <ScoreTube score={score} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Ta correction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reponses.map((r, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground mb-1">Attendu</p>
                <p className="font-semibold mb-2">{r.attendu}</p>
                <p className="text-sm text-muted-foreground mb-1">Ta réponse</p>
                <p className="flex flex-wrap gap-x-2 gap-y-1">
                  {r.resultat.mots.map((m, j) => (
                    <span
                      key={j}
                      className={cn(
                        'font-body',
                        m.correct ? 'text-green-600' : 'text-destructive font-semibold underline'
                      )}
                    >
                      {m.saisi || '—'}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {aRevoir.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Les mots à revoir</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {aRevoir.map((m, i) => (
                <span key={i} className="rounded-md bg-destructive/10 px-2 py-1 font-semibold">
                  {m.attendu}
                </span>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Les règles de la semaine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {semaine.regularites.map((r) => (
              <div key={r.titre}>
                <p className="font-semibold">{r.titre}</p>
                <p className="text-sm text-muted-foreground">{r.explication}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" size="lg" className="flex-1" onClick={recommencer}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Recommencer
          </Button>
          {onFinish && (
            <Button size="lg" className="flex-1" onClick={onFinish}>
              Terminer
            </Button>
          )}
          {!onFinish && !sessionId && (
            <Button size="lg" className="flex-1" onClick={() => { setChoix(null); recommencer(); }}>
              Choisir une autre dictée
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 3. La dictée elle-même
  const saisieLongue = estUneSaisieLongue(session);
  const progression = ((index + (resultatCourant ? 1 : 0)) / session.items.length) * 100;
  /** Le corpus n'accompagne que le jour 1 : la dictée bilan se fait sans appui. */
  const afficherCorpus = session.jour === 1;

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={cn(afficherCorpus ? 'md:col-span-2' : 'md:col-span-3')}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">
            {session.typeLabel} · semaine {semaine.semaine}
          </p>
          <p className="text-sm text-muted-foreground">
            {index + 1} / {session.items.length}
          </p>
        </div>
        <Progress value={progression} className="w-full mb-4 h-3" />

        <Card className="shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <Confetti
              active={confetti}
              config={{
                angle: 90,
                spread: 360,
                startVelocity: 40,
                elementCount: 80,
                dragFriction: 0.12,
                duration: 2000,
                stagger: 3,
                width: '10px',
                height: '10px',
              }}
            />
          </div>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">
              {session.jour === 4 ? 'Écris la phrase dictée' : 'Écoute puis écris'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => dire(itemCourant)} size="lg">
                <Volume2 className="mr-2" />
                Réécouter
              </Button>
              <Button onClick={() => dire(itemCourant, 0.6)} size="lg" variant="outline">
                <Volume2 className="mr-2" />
                Plus lentement
              </Button>
            </div>

            {saisieLongue ? (
              <Textarea
                ref={champRef}
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder="Écris ici..."
                rows={3}
                disabled={!!resultatCourant}
                className="text-xl font-body"
              />
            ) : (
              <Input
                ref={champRef}
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && valider()}
                placeholder="Écris ici..."
                disabled={!!resultatCourant}
                className="h-16 text-2xl text-center font-body"
              />
            )}

            {!resultatCourant ? (
              <Button onClick={valider} size="lg" className="w-full text-lg" disabled={!saisie.trim()}>
                Valider
              </Button>
            ) : (
              <div className="space-y-4">
                <div
                  className={cn(
                    'rounded-lg p-4 text-center',
                    resultatCourant.correct ? 'bg-green-50 text-green-700' : 'bg-destructive/10'
                  )}
                >
                  {resultatCourant.correct ? (
                    <p className="flex items-center justify-center gap-2 text-xl font-semibold">
                      <Check /> Parfait !
                    </p>
                  ) : (
                    <>
                      <p className="flex items-center justify-center gap-2 font-semibold mb-3">
                        <X /> Regarde bien les mots soulignés.
                      </p>
                      <p className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-lg">
                        {resultatCourant.mots.map((m, j) => (
                          <span
                            key={j}
                            className={cn(
                              m.correct
                                ? 'text-green-700'
                                : 'text-destructive font-semibold underline decoration-wavy'
                            )}
                          >
                            {m.saisi || '—'}
                          </span>
                        ))}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">On écrit :</p>
                      <p className="text-lg font-semibold">{itemCourant}</p>
                    </>
                  )}
                </div>
                <Button onClick={suivant} size="lg" className="w-full text-lg">
                  {index < session.items.length - 1 ? 'Suivant' : 'Voir mon résultat'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {afficherCorpus && (
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Les mots de la semaine</CardTitle>
            <CardDescription>{semaine.corpusTheme}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 font-body">
              {getCorpusPourNiveau(semaine, session.niveau).map((mot) => (
                <li key={mot}>{mot}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Écran de choix des 34 semaines, pour l'entraînement libre depuis « En classe ». */
function SelecteurDeDictee({ onSelect }: { onSelect: (id: string) => void }) {
  const periodes = [1, 2, 3, 4, 5] as const;
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">Choisis ta dictée</CardTitle>
          <CardDescription className="text-center">
            Méthode Dyna-Mots CE2 — 34 semaines. Le jour 1 travaille les mots de la semaine, le
            jour 4 est la dictée bilan.
          </CardDescription>
        </CardHeader>
      </Card>
      <Accordion type="single" collapsible defaultValue="periode-1">
        {periodes.map((p) => (
          <AccordionItem key={p} value={`periode-${p}`}>
            <AccordionTrigger className="text-xl font-headline">Période {p}</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              {DICTEES_CE2.filter((s) => s.periode === p).map((s) => (
                <Card key={s.semaine} className="p-4">
                  <p className="font-semibold">
                    Semaine {s.semaine} — {s.notion.titre}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">{s.corpusTheme}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {([1, 4] as DicteeJourTravaille[]).map((jour) => (
                      <Button
                        key={jour}
                        variant={jour === 4 ? 'secondary' : 'default'}
                        className="flex-1"
                        onClick={() => onSelect(`S${s.semaine}-J${jour}`)}
                      >
                        {libelleSession(s, jour)}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
