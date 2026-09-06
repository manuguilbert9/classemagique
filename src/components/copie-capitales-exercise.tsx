'use client';

import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Images, Keyboard, ListChecks, Loader2, PenLine, RefreshCw, Volume2 } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/user-context';
import { addScore, type ScoreDetail } from '@/services/scores';
import { getHomeworkForGroup, saveHomeworkResult } from '@/services/homework';
import { updateStudent } from '@/services/students';
import { ScoreTube } from '@/components/score-tube';
import { VirtualKeyboard } from '@/components/virtual-keyboard';
import {
  MOTS_ILLUSTRES,
  THEMES_ILLUSTRES,
  motsDuTheme,
  urlPictogramme,
} from '@/data/copie/liste-imagee';
import {
  DICTEES_CE2,
  getMotsACopier,
  getSemaine,
  semaineCouranteDepuisDevoirs,
} from '@/services/dictees';

/** Nombre de mots tirés par séance dans les listes longues. */
const MOTS_PAR_SEANCE = 10;

/** Un mot à recopier, éventuellement illustré par un pictogramme ARASAAC. */
interface MotACopier {
  mot: string;
  picto?: number;
}

/** Une lettre au sens de l'exercice : ce que l'élève doit effectivement frapper. */
const estUneLettre = (caractere: string) => /\p{L}/u.test(caractere);

/** Compare deux lettres sans tenir compte des accents : E vaut É, C vaut Ç. */
const memeLettre = (a: string, b: string) =>
  a.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase() ===
  b.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

/**
 * Avance jusqu'à la prochaine lettre à saisir : les espaces, apostrophes et
 * traits d'union sont placés automatiquement, l'élève n'a que des lettres à taper.
 */
const prochaineLettre = (mot: string, depuis: number) => {
  let position = depuis;
  while (position < mot.length && !estUneLettre(mot[position])) position++;
  return position;
};

/** Recule sur la lettre précédente, en repassant par-dessus la ponctuation. */
const lettrePrecedente = (mot: string, depuis: number) => {
  let position = depuis - 1;
  while (position > 0 && !estUneLettre(mot[position])) position--;
  return Math.max(0, position);
};

const melanger = <T,>(liste: T[]): T[] => {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
};

/**
 * Cherche le pictogramme ARASAAC correspondant à un mot saisi par l'enseignant.
 * Renvoie undefined si le portail ne connaît pas le mot : la copie reste possible,
 * simplement sans image.
 */
async function chercherPictogramme(mot: string): Promise<number | undefined> {
  try {
    const reponse = await fetch(
      `https://api.arasaac.org/v1/pictograms/fr/search/${encodeURIComponent(mot)}`
    );
    if (!reponse.ok) return undefined;
    const resultats = await reponse.json();
    if (!Array.isArray(resultats) || resultats.length === 0) return undefined;
    const convenable = resultats.find((p: { sex?: boolean; violence?: boolean }) => !p.sex && !p.violence);
    return convenable?._id;
  } catch {
    return undefined;
  }
}

export function CopieCapitalesExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [mots, setMots] = useState<MotACopier[] | null>(null);
  const [titreListe, setTitreListe] = useState('');

  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [frappesJustes, setFrappesJustes] = useState(0);
  const [frappesTotales, setFrappesTotales] = useState(0);
  const [details, setDetails] = useState<ScoreDetail[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [clavierVisible, setClavierVisible] = useState(false);

  const motCourant = mots?.[index]?.mot ?? '';
  const pictoCourant = mots?.[index]?.picto;

  useEffect(() => {
    if (motCourant) setPosition(prochaineLettre(motCourant, 0));
  }, [motCourant]);

  const dire = useCallback((texte: string) => {
    if (!texte || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texte.toLowerCase());
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (motCourant) dire(motCourant);
  }, [motCourant, dire]);

  /* ------------------------------ Saisie ------------------------------- */

  const motTermine = useCallback(() => {
    setConfetti(true);
    setDetails((prev) => [
      ...prev,
      {
        question: `Recopier : ${motCourant}`,
        userAnswer: motCourant,
        correctAnswer: motCourant,
        status: 'correct',
      },
    ]);
    setTimeout(() => {
      setConfetti(false);
      if (mots && index < mots.length - 1) {
        setIndex((i) => i + 1);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  }, [index, mots, motCourant]);

  const frapper = useCallback(
    (touche: string) => {
      if (!motCourant || isFinished || position >= motCourant.length) return;

      setFrappesTotales((n) => n + 1);
      if (!memeLettre(touche, motCourant[position])) return;

      setFrappesJustes((n) => n + 1);
      const suivante = prochaineLettre(motCourant, position + 1);
      setPosition(suivante);
      if (suivante >= motCourant.length) motTermine();
    },
    [motCourant, position, isFinished, motTermine]
  );

  const effacer = useCallback(() => {
    if (position > 0) setPosition(lettrePrecedente(motCourant, position));
  }, [motCourant, position]);

  useEffect(() => {
    if (!mots) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        effacer();
      } else if (e.key.length === 1 && estUneLettre(e.key)) {
        frapper(e.key);
      }
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [frapper, effacer, mots]);

  /* ----------------------------- Résultat ------------------------------ */

  const score = frappesTotales > 0 ? Math.round((frappesJustes / frappesTotales) * 100) : 100;

  useEffect(() => {
    async function enregistrer() {
      if (!isFinished || !student || hasBeenSaved || !mots || mots.length === 0) return;
      setHasBeenSaved(true);
      try {
        if (isHomework && homeworkDate) {
          await saveHomeworkResult({
            userId: student.id,
            date: homeworkDate,
            skillSlug: 'copie-capitales',
            score,
          });
        } else {
          await addScore({ userId: student.id, skill: 'copie-capitales', score, details });
        }
      } catch (error) {
        console.error('Enregistrement de la copie impossible :', error);
      }
    }
    enregistrer();
  }, [isFinished, student, hasBeenSaved, mots, score, details, isHomework, homeworkDate]);

  const demarrer = (motsChoisis: MotACopier[], titre: string) => {
    setMots(motsChoisis);
    setTitreListe(titre);
    setIndex(0);
    setPosition(0);
    setFrappesJustes(0);
    setFrappesTotales(0);
    setDetails([]);
    setIsFinished(false);
    setHasBeenSaved(false);
    setConfetti(false);
  };

  const changerDeListe = () => {
    setMots(null);
    setIsFinished(false);
  };

  /* ------------------------------ Rendus ------------------------------- */

  if (!mots) {
    return <ChoixDeLaListe onStart={demarrer} />;
  }

  if (isFinished) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
        <CardHeader>
          <CardTitle className="text-4xl font-headline mb-4">Bravo !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-2xl">
            Tu as recopié <span className="font-bold text-primary">{mots.length}</span> mots.
          </p>
          <ScoreTube score={score} />
          {isHomework ? (
            <p className="text-muted-foreground">Tes devoirs sont terminés !</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => demarrer(mots, titreListe)}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <RefreshCw className="mr-2" />
                Recommencer
              </Button>
              <Button onClick={changerDeListe} size="lg" className="flex-1">
                Changer de liste
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary">{titreListe}</Badge>
        <Badge>
          Mot {index + 1} / {mots.length}
        </Badge>
      </div>
      <Progress value={(index / mots.length) * 100} className="w-full h-3" />

      <Card className="shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <Confetti
            active={confetti}
            config={{
              angle: 90,
              spread: 360,
              startVelocity: 40,
              elementCount: 100,
              dragFriction: 0.12,
              duration: 2000,
              stagger: 3,
              width: '10px',
              height: '10px',
            }}
          />
        </div>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Recopie le mot</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[280px] flex flex-col items-center justify-center gap-8 p-6">
          {/* Le modèle à recopier, illustré lorsque le mot a un pictogramme */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {pictoCourant && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlPictogramme(pictoCourant)}
                alt={motCourant.toLowerCase()}
                className="h-28 w-28 sm:h-36 sm:w-36 object-contain"
              />
            )}
            <div className="font-mono text-5xl sm:text-7xl font-bold tracking-widest p-4 bg-muted rounded-lg">
              {motCourant}
            </div>
            <Button variant="ghost" size="icon" onClick={() => dire(motCourant)} className="h-16 w-16">
              <Volume2 className="h-10 w-10 text-muted-foreground" />
            </Button>
          </div>

          {/* La copie en cours : les lettres déjà placées, puis la lettre attendue */}
          <div className="font-mono text-4xl sm:text-6xl font-bold tracking-wider">
            {motCourant.split('').map((lettre, i) => (
              <span
                key={i}
                className={cn(
                  'inline-block mx-1 transition-all duration-200',
                  i < position && 'text-primary',
                  i === position && 'text-foreground scale-125 border-b-4 border-primary',
                  i > position && 'text-muted-foreground/30'
                )}
              >
                {lettre === ' ' ? ' ' : lettre}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setClavierVisible((v) => !v)}>
              <Keyboard className="mr-2" />
              {clavierVisible ? 'Cacher' : 'Afficher'} le clavier
            </Button>
            <Button variant="ghost" onClick={changerDeListe}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Changer de liste
            </Button>
          </div>
        </CardFooter>
      </Card>

      {clavierVisible && (
        <VirtualKeyboard onKeyPress={(touche) => (touche === '⌫' ? effacer() : frapper(touche))} />
      )}

      {mots.some((m) => m.picto) && <MentionArasaac />}
    </div>
  );
}

/** Mention de licence exigée par le portail ARASAAC. */
function MentionArasaac() {
  return (
    <p className="text-center text-xs text-muted-foreground">
      Pictogrammes : ARASAAC (arasaac.org), auteur Sergio Palao, propriété du Gouvernement
      d&apos;Aragon, sous licence CC BY-NC-SA.
    </p>
  );
}

/** Écran de choix de la liste, affiché au lancement de l'exercice. */
function ChoixDeLaListe({
  onStart,
}: {
  onStart: (mots: MotACopier[], titre: string) => void;
}) {
  const { student } = useContext(UserContext);

  const [semaineChoisie, setSemaineChoisie] = useState<string>('suivie');
  const [semaineSuivie, setSemaineSuivie] = useState<number | null>(null);
  const [themeChoisi, setThemeChoisi] = useState<string>(THEMES_ILLUSTRES[0].cle);
  const [saisiePerso, setSaisiePerso] = useState('');
  const [chargementPerso, setChargementPerso] = useState(false);

  // La semaine suivie par la classe, d'après les dictées programmées au groupe.
  useEffect(() => {
    let annule = false;
    async function chercherLaSemaine() {
      if (!student?.groupId) return;
      try {
        const devoirs = await getHomeworkForGroup(student.groupId);
        if (!annule) setSemaineSuivie(semaineCouranteDepuisDevoirs(devoirs));
      } catch (error) {
        console.error('Impossible de lire les devoirs du groupe :', error);
      }
    }
    chercherLaSemaine();
    return () => {
      annule = true;
    };
  }, [student]);

  useEffect(() => {
    if (student?.motsCopiePersonnalises?.length) {
      setSaisiePerso(student.motsCopiePersonnalises.join('\n'));
    }
  }, [student]);

  const numeroSemaine = semaineChoisie === 'suivie' ? semaineSuivie ?? 1 : Number(semaineChoisie);
  const semaine = useMemo(() => getSemaine(numeroSemaine), [numeroSemaine]);

  const lancerDynaMots = () => {
    if (!semaine) return;
    const mots = getMotsACopier(semaine).map((m) => ({ mot: m.toUpperCase() }));
    onStart(mots, `Semaine ${semaine.semaine} — ${semaine.corpusTheme}`);
  };

  const lancerListeIllustree = () => {
    // Un thème compte exactement dix mots, déjà rangés du plus court au plus long ;
    // le mélange n'a de sens que pour la séance qui pioche dans tous les thèmes.
    const melange = themeChoisi === 'tous';
    const source = melange ? melanger(MOTS_ILLUSTRES).slice(0, MOTS_PAR_SEANCE) : motsDuTheme(themeChoisi);
    const titre = melange
      ? 'Mots mélangés'
      : THEMES_ILLUSTRES.find((t) => t.cle === themeChoisi)?.intitule ?? 'Mots illustrés';
    onStart(
      source.map((m) => ({ mot: m.mot.toUpperCase(), picto: m.picto })),
      titre
    );
  };

  const lancerListePerso = async () => {
    const saisis = saisiePerso
      .split(/[\n,;]+/)
      .map((m) => m.trim())
      .filter(Boolean)
      .slice(0, 20);
    if (saisis.length === 0) return;

    setChargementPerso(true);
    // La liste est mémorisée pour ne pas avoir à la retaper à chaque séance.
    if (student) {
      updateStudent(student.id, { motsCopiePersonnalises: saisis }).catch((error) =>
        console.error('Impossible de mémoriser la liste :', error)
      );
    }
    const avecPictos = await Promise.all(
      saisis.map(async (mot) => ({ mot: mot.toUpperCase(), picto: await chercherPictogramme(mot) }))
    );
    setChargementPerso(false);
    onStart(avecPictos, 'Ma liste');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">Choisis les mots à recopier</CardTitle>
        </CardHeader>
      </Card>

      {/* 1. Les mots de la semaine de la classe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Les mots de la semaine
          </CardTitle>
          <CardDescription>
            Le corpus lexical de la méthode Dyna-Mots, en capitales et sans image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={semaineChoisie} onValueChange={setSemaineChoisie}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="suivie">
                La semaine de la classe
                {semaineSuivie ? ` (semaine ${semaineSuivie})` : ''}
              </SelectItem>
              {DICTEES_CE2.map((s) => (
                <SelectItem key={s.semaine} value={String(s.semaine)}>
                  Semaine {s.semaine} — {s.corpusTheme}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {semaine && (
            <p className="text-sm text-muted-foreground">
              {getMotsACopier(semaine).length} mots : {getMotsACopier(semaine).slice(0, 4).join(', ')}...
            </p>
          )}
          <Button onClick={lancerDynaMots} className="w-full" size="lg" disabled={!semaine}>
            Commencer
          </Button>
        </CardContent>
      </Card>

      {/* 2. La liste imagée */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Images className="h-5 w-5 text-primary" />
            Les mots illustrés
          </CardTitle>
          <CardDescription>
            Vingt thèmes de dix mots, chacun avec son image. Dans un thème, les mots vont du plus
            court au plus long.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={themeChoisi} onValueChange={setThemeChoisi}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES_ILLUSTRES.map((theme) => (
                <SelectItem key={theme.cle} value={theme.cle}>
                  {theme.intitule}
                </SelectItem>
              ))}
              <SelectItem value="tous">Tous les thèmes mélangés</SelectItem>
            </SelectContent>
          </Select>
          {themeChoisi !== 'tous' && (
            <p className="text-sm text-muted-foreground">
              {motsDuTheme(themeChoisi).map((m) => m.mot).join(', ')}
            </p>
          )}
          <Button onClick={lancerListeIllustree} className="w-full" size="lg">
            Commencer
          </Button>
        </CardContent>
      </Card>

      {/* 3. La liste saisie par l'enseignant */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            Ma liste
          </CardTitle>
          <CardDescription>
            Un mot par ligne. Les images sont cherchées automatiquement sur ARASAAC ; un mot inconnu
            du portail est simplement affiché sans image. La liste est mémorisée pour la prochaine fois.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="liste-perso" className="sr-only">
            Mots à recopier
          </Label>
          <Textarea
            id="liste-perso"
            value={saisiePerso}
            onChange={(e) => setSaisiePerso(e.target.value)}
            placeholder={'maison\nvoiture\nballon'}
            rows={5}
          />
          <Button
            onClick={lancerListePerso}
            className="w-full"
            size="lg"
            disabled={chargementPerso || saisiePerso.trim().length === 0}
          >
            {chargementPerso ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Recherche des images...
              </>
            ) : (
              'Commencer'
            )}
          </Button>
        </CardContent>
      </Card>

      <MentionArasaac />
    </div>
  );
}
