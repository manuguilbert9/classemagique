'use client';

import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
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
import { tirerSerie, type MancheDesignation } from '@/lib/mots-images';

/** Séance courte, terminée avant la fatigue. */
const NOMBRE_DE_MANCHES = 8;
/** Trois propositions, comme dans la progression (« parmi 3 mots différents »). */
const NOMBRE_DE_CHOIX = 3;

/** Une manche montre soit l'image et fait choisir le mot, soit l'inverse. */
type Sens = 'image-vers-mot' | 'mot-vers-image';

export function MotImageExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [theme, setTheme] = useState<string>(THEMES_ILLUSTRES[0].cle);
  const [manches, setManches] = useState<MancheDesignation[] | null>(null);
  const [titre, setTitre] = useState('');

  const [index, setIndex] = useState(0);
  const [trouve, setTrouve] = useState(false);
  const [aTatonne, setATatonne] = useState(false);
  const [erreurCourante, setErreurCourante] = useState<string | null>(null);
  const [reussitesDirectes, setReussitesDirectes] = useState(0);
  const [details, setDetails] = useState<ScoreDetail[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);

  const manche = manches?.[index];
  // On alterne les deux sens : reconnaître le mot écrit, puis retrouver l'image.
  const sens: Sens = useMemo(() => (index % 2 === 0 ? 'mot-vers-image' : 'image-vers-mot'), [index]);

  const dire = useCallback((texte: string) => {
    if (!texte || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  const demarrer = () => {
    const intitule =
      theme === 'tous'
        ? 'Tous les thèmes'
        : THEMES_ILLUSTRES.find((t) => t.cle === theme)?.intitule ?? '';
    setManches(tirerSerie(theme, NOMBRE_DE_MANCHES, NOMBRE_DE_CHOIX));
    setTitre(intitule);
    setIndex(0);
    setTrouve(false);
    setATatonne(false);
    setErreurCourante(null);
    setReussitesDirectes(0);
    setDetails([]);
    setIsFinished(false);
    setHasBeenSaved(false);
  };

  const choisir = (mot: string) => {
    if (!manche || trouve) return;

    if (mot !== manche.cible.mot) {
      // L'erreur n'est pas sanctionnée : la proposition s'estompe, l'élève réessaie.
      setErreurCourante(mot);
      setATatonne(true);
      setTimeout(() => setErreurCourante(null), 900);
      return;
    }

    setTrouve(true);
    dire(manche.cible.mot);
    if (!aTatonne) setReussitesDirectes((n) => n + 1);
    setDetails((prev) => [
      ...prev,
      {
        question:
          sens === 'mot-vers-image'
            ? `Trouver l'image du mot : ${manche.cible.mot}`
            : `Trouver le mot de l'image : ${manche.cible.mot}`,
        userAnswer: mot,
        correctAnswer: manche.cible.mot,
        status: aTatonne ? 'incorrect' : 'correct',
      },
    ]);

    setTimeout(() => {
      setTrouve(false);
      setATatonne(false);
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
            skillSlug: 'mot-image',
            score,
          });
        } else {
          await addScore({ userId: student.id, skill: 'mot-image', score, details });
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
            <CardTitle className="font-headline text-3xl text-center">Le mot et son image</CardTitle>
            <CardDescription className="text-center">
              Une fois l&apos;image est donnée et il faut trouver le mot, une fois le mot est donné
              et il faut trouver l&apos;image.
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
            Tu as trouvé <span className="font-bold text-primary">{reussitesDirectes}</span> fois du
            premier coup sur <span className="font-bold">{NOMBRE_DE_MANCHES}</span>.
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
          {index + 1} / {manches.length}
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
          <CardTitle className="font-headline text-3xl">
            {sens === 'mot-vers-image' ? "Trouve l'image de ce mot" : 'Trouve le mot de cette image'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Ce qui est donné */}
          <div className="flex items-center justify-center gap-4">
            {sens === 'mot-vers-image' ? (
              <p className="font-mono text-4xl sm:text-6xl font-bold tracking-widest p-4 bg-muted rounded-lg">
                {manche.cible.mot.toUpperCase()}
              </p>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlPictogramme(manche.cible.picto, 500)}
                alt={manche.cible.mot}
                className="h-40 w-40 sm:h-48 sm:w-48 object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dire(manche.cible.mot)}
              className="h-16 w-16"
              aria-label="Écouter le mot"
            >
              <Volume2 className="h-10 w-10 text-muted-foreground" />
            </Button>
          </div>

          {/* Ce qu'il faut choisir */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {manche.choix.map((choix) => {
              const estLaCible = choix.mot === manche.cible.mot;
              return (
                <button
                  key={choix.mot}
                  onClick={() => choisir(choix.mot)}
                  disabled={trouve}
                  className={cn(
                    'relative w-full rounded-2xl border-4 p-3 transition-all duration-200 bg-background',
                    'hover:scale-105 active:scale-95 flex items-center justify-center min-h-[7rem]',
                    trouve && estLaCible && 'border-green-500 bg-green-50 scale-105',
                    trouve && !estLaCible && 'opacity-30',
                    erreurCourante === choix.mot && 'opacity-30 scale-95',
                    !trouve && erreurCourante !== choix.mot && 'border-muted'
                  )}
                  aria-label={choix.mot}
                >
                  {sens === 'mot-vers-image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urlPictogramme(choix.picto)}
                      alt={choix.mot}
                      className="h-24 w-24 sm:h-32 sm:w-32 object-contain"
                    />
                  ) : (
                    <span className="font-mono text-xl sm:text-3xl font-bold tracking-wider">
                      {choix.mot.toUpperCase()}
                    </span>
                  )}
                  {trouve && estLaCible && (
                    <span className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check className="h-6 w-6" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Pictogrammes : ARASAAC (arasaac.org), auteur Sergio Palao, propriété du Gouvernement
        d&apos;Aragon, sous licence CC BY-NC-SA.
      </p>
    </div>
  );
}
