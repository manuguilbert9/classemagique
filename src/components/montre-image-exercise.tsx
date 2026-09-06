'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, RefreshCw, Volume2 } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/user-context';
import { addScore, type ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from '@/components/score-tube';
import { THEMES_ILLUSTRES, urlPictogramme } from '@/data/copie/liste-imagee';
import { progressionDesChoix, tirerSerie, type MancheDesignation } from '@/lib/mots-images';

/** Séance courte : l'élève se fatigue vite, mieux vaut terminer sur une réussite. */
const NOMBRE_DE_MANCHES = 8;

export function MontreImageExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [theme, setTheme] = useState<string>(THEMES_ILLUSTRES[0].cle);
  const [manches, setManches] = useState<MancheDesignation[] | null>(null);
  const [titre, setTitre] = useState('');

  const [index, setIndex] = useState(0);
  const [trouve, setTrouve] = useState(false);
  const [essais, setEssais] = useState(0);
  const [reussitesDirectes, setReussitesDirectes] = useState(0);
  const [aTatonne, setATatonne] = useState(false);
  const [erreurCourante, setErreurCourante] = useState<string | null>(null);
  const [details, setDetails] = useState<ScoreDetail[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);

  const manche = manches?.[index];

  const dire = useCallback((texte: string) => {
    if (!texte || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Le mot est dit à chaque nouvelle manche : c'est la seule consigne.
  useEffect(() => {
    if (manche) {
      const timer = setTimeout(() => dire(manche.cible.mot), 400);
      return () => clearTimeout(timer);
    }
  }, [manche, dire]);

  const demarrer = () => {
    const intitule =
      theme === 'tous'
        ? 'Tous les thèmes'
        : THEMES_ILLUSTRES.find((t) => t.cle === theme)?.intitule ?? '';
    setManches(tirerSerie(theme, NOMBRE_DE_MANCHES, progressionDesChoix));
    setTitre(intitule);
    setIndex(0);
    setTrouve(false);
    setEssais(0);
    setReussitesDirectes(0);
    setATatonne(false);
    setErreurCourante(null);
    setDetails([]);
    setIsFinished(false);
    setHasBeenSaved(false);
  };

  const choisir = (mot: string) => {
    if (!manche || trouve) return;

    if (mot !== manche.cible.mot) {
      // Pas de sanction : l'image proposée s'estompe et l'élève réessaie.
      setErreurCourante(mot);
      setATatonne(true);
      setEssais((n) => n + 1);
      setTimeout(() => setErreurCourante(null), 900);
      return;
    }

    setTrouve(true);
    if (!aTatonne) setReussitesDirectes((n) => n + 1);
    setDetails((prev) => [
      ...prev,
      {
        question: `Montrer l'image : ${manche.cible.mot}`,
        userAnswer: mot,
        correctAnswer: manche.cible.mot,
        status: aTatonne ? 'incorrect' : 'correct',
      },
    ]);

    setTimeout(() => {
      setTrouve(false);
      setATatonne(false);
      setEssais(0);
      if (manches && index < manches.length - 1) {
        setIndex((i) => i + 1);
      } else {
        setIsFinished(true);
      }
    }, 1400);
  };

  const score = Math.round((reussitesDirectes / NOMBRE_DE_MANCHES) * 100);

  useEffect(() => {
    async function enregistrer() {
      if (!isFinished || !student || hasBeenSaved) return;
      setHasBeenSaved(true);
      try {
        if (isHomework && homeworkDate) {
          await saveHomeworkResult({
            userId: student.id,
            date: homeworkDate,
            skillSlug: 'montre-image',
            score,
          });
        } else {
          await addScore({ userId: student.id, skill: 'montre-image', score, details });
        }
      } catch (error) {
        console.error("Enregistrement de l'exercice impossible :", error);
      }
    }
    enregistrer();
  }, [isFinished, student, hasBeenSaved, score, details, isHomework, homeworkDate]);

  /* ------------------------------- Rendus -------------------------------- */

  if (!manches) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-center">Écoute et montre</CardTitle>
            <CardDescription className="text-center">
              Un mot est dit à voix haute, il ne reste qu&apos;à montrer la bonne image.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES_ILLUSTRES.map((t) => (
                  <SelectItem key={t.cle} value={t.cle}>
                    {t.intitule}
                  </SelectItem>
                ))}
                <SelectItem value="tous">Tous les thèmes mélangés</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={demarrer} size="lg" className="w-full text-lg">
              Commencer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
        <CardHeader>
          <CardTitle className="text-4xl font-headline mb-4">Bravo !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-2xl">
            Tu as trouvé <span className="font-bold text-primary">{reussitesDirectes}</span> images
            du premier coup sur <span className="font-bold">{NOMBRE_DE_MANCHES}</span>.
          </p>
          <ScoreTube score={score} />
          {isHomework ? (
            <p className="text-muted-foreground">Tes devoirs sont terminés !</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={demarrer} variant="outline" size="lg" className="flex-1">
                <RefreshCw className="mr-2" />
                Recommencer
              </Button>
              <Button onClick={() => setManches(null)} size="lg" className="flex-1">
                Changer de thème
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!manche) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary">{titre}</Badge>
        <Badge>
          Image {index + 1} / {manches.length}
        </Badge>
      </div>
      <Progress value={(index / manches.length) * 100} className="w-full h-3" />

      <Card className="shadow-2xl relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <Confetti
            active={trouve}
            config={{
              angle: 90,
              spread: 360,
              startVelocity: 40,
              elementCount: 90,
              dragFriction: 0.12,
              duration: 2000,
              stagger: 3,
              width: '10px',
              height: '10px',
            }}
          />
        </div>

        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Montre l&apos;image</CardTitle>
          <div className="flex justify-center pt-2">
            <Button size="lg" onClick={() => dire(manche.cible.mot)} className="text-lg h-16 px-8">
              <Volume2 className="mr-3 h-7 w-7" />
              Réécouter
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Classes écrites en toutes lettres : Tailwind ne compile pas les noms construits. */}
          <div
            className={cn(
              'grid gap-4 justify-items-center',
              manche.choix.length === 2 && 'grid-cols-2',
              manche.choix.length === 3 && 'grid-cols-3',
              manche.choix.length >= 4 && 'grid-cols-2 sm:grid-cols-4'
            )}
          >
            {manche.choix.map((choix) => {
              const estLaCible = choix.mot === manche.cible.mot;
              return (
                <button
                  key={choix.mot}
                  onClick={() => choisir(choix.mot)}
                  disabled={trouve}
                  className={cn(
                    'relative rounded-2xl border-4 p-3 transition-all duration-200 bg-background',
                    'hover:scale-105 active:scale-95',
                    trouve && estLaCible && 'border-green-500 bg-green-50 scale-105',
                    trouve && !estLaCible && 'opacity-30',
                    erreurCourante === choix.mot && 'opacity-30 scale-95',
                    !trouve && erreurCourante !== choix.mot && 'border-muted'
                  )}
                  aria-label={choix.mot}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urlPictogramme(choix.picto)}
                    alt={choix.mot}
                    className="h-32 w-32 sm:h-40 sm:w-40 object-contain"
                  />
                  {trouve && estLaCible && (
                    <span className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check className="h-6 w-6" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {trouve && (
            <p className="mt-6 text-center text-3xl font-bold font-mono tracking-widest text-primary">
              {manche.cible.mot.toUpperCase()}
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Pictogrammes : ARASAAC (arasaac.org), auteur Sergio Palao, propriété du Gouvernement
        d&apos;Aragon, sous licence CC BY-NC-SA.
      </p>
    </div>
  );
}
