
'use client';

import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, ArrowLeft, Loader2, Volume2, ThumbsUp, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getSpellingLists, type SpellingList } from '@/services/spelling';
import { saveHomeworkResult } from '@/services/homework';
import { addScore, ScoreDetail } from '@/services/scores';
import { UserContext } from '@/context/user-context';
import { cn } from '@/lib/utils';
import Confetti from 'react-dom-confetti';
import { Slider } from './ui/slider';
import { Label } from './ui/label';

interface SpellingExerciseProps {
    exerciseId: string;
    onFinish: () => void;
}

export function SpellingExercise({ exerciseId, onFinish }: SpellingExerciseProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const { student } = useContext(UserContext);

  const [availableLists, setAvailableLists] = useState<SpellingList[]>([]);
  const [list, setList] = useState<SpellingList | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'idle' | 'showing'>('showing');
  const [isFinished, setIsFinished] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [wordDisplayTime, setWordDisplayTime] = useState(6000); // Default 6 seconds
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logDebug = useCallback((message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  useEffect(() => {
    async function loadLists() {
        logDebug("Chargement des listes de dictée...");
        setIsLoading(true);
        try {
            const lists = await getSpellingLists(logDebug);
            setAvailableLists(lists);
            logDebug(`${lists.length} listes trouvées.`);
        } catch (error) {
            if (error instanceof Error) {
                logDebug(`ERREUR lors du chargement des listes: ${error.message}`);
            } else {
                logDebug(`ERREUR inconnue lors du chargement des listes.`);
            }
        } finally {
            setIsLoading(false);
            logDebug("Fin du chargement des listes.");
        }
    }
    loadLists();
  }, [logDebug]);

  const startExercise = (listData: SpellingList, session: 'lundi' | 'jeudi' | 'all') => {
      logDebug(`Démarrage de l'exercice avec la liste ${listData.id}, session ${session}`);
      setList(listData);
      let sessionWords: string[] = [];

      if (session === 'all') {
          sessionWords = listData.words;
      } else {
          const half = Math.ceil(listData.words.length / 2);
          sessionWords = session === 'lundi' ? listData.words.slice(0, half) : listData.words.slice(half);
      }
      
      logDebug(`${sessionWords.length} mots à réciter pour cette session.`);
      setWords([...sessionWords].sort(() => Math.random() - 0.5));
      setCurrentWordIndex(0);
      setInputValue('');
      setFeedback('showing');
      setIsFinished(false);
      setErrors([]);
      setHasBeenSaved(false);
  };


  useEffect(() => {
    if (exerciseId && availableLists.length > 0) {
      logDebug(`ID d'exercice détecté: ${exerciseId}`);
      const listId = exerciseId.split('-')[0];
      const session = exerciseId.split('-')[1] as 'lundi' | 'jeudi';
      logDebug(`Recherche de la liste ID: ${listId}, session: ${session}`);
      const foundList = availableLists.find(l => l.id === listId);

      if (foundList && session) {
        logDebug(`Liste trouvée: "${foundList.title}". Démarrage...`);
        startExercise(foundList, session);
      } else {
        logDebug(`ERREUR: Impossible de trouver la liste correspondante à l'ID ${exerciseId}`);
        setIsLoading(false);
      }
    } else if (exerciseId) {
        logDebug(`ID d'exercice détecté (${exerciseId}), mais les listes ne sont pas encore chargées. En attente...`);
    } else {
        logDebug("Aucun ID d'exercice, passage en mode de sélection manuelle.");
        setIsLoading(false);
    }
  }, [exerciseId, availableLists, logDebug]);

  const showWord = useCallback(() => {
    logDebug(`Affichage du mot: ${words[currentWordIndex]}`);
    setFeedback('showing');
    setInputValue('');
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      logDebug("Fin de l'affichage, passage à la saisie.");
      setFeedback('idle');
      setTimeout(() => inputRef.current?.focus(), 100);
    }, wordDisplayTime);
  }, [wordDisplayTime, words, currentWordIndex, logDebug]);

  useEffect(() => {
    if (words.length > 0 && !isFinished && currentWordIndex < words.length) {
      logDebug(`Préparation de l'affichage pour l'index de mot: ${currentWordIndex}`);
      showWord();
    }
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    }
  }, [words, currentWordIndex, isFinished, showWord, logDebug]);

  const handleNextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      logDebug("Passage au mot suivant.");
      setCurrentWordIndex(prev => prev + 1);
    } else {
      logDebug("Fin de l'exercice.");
      setIsFinished(true);
    }
  }, [currentWordIndex, words.length, logDebug]);
  
  const handleSubmit = () => {
    if (feedback !== 'idle' || !words[currentWordIndex]) return;
    
    logDebug(`Validation de la réponse. Attendu: "${words[currentWordIndex]}", Saisi: "${inputValue}"`);
    const currentWord = words[currentWordIndex];
    if (inputValue.trim().toLowerCase() === currentWord.toLowerCase()) {
      logDebug("Réponse CORRECTE.");
      setFeedback('correct');
      setTimeout(handleNextWord, 1500);
    } else {
      logDebug("Réponse INCORRECTE.");
      setFeedback('incorrect');
      if (!errors.includes(currentWord)) {
          setErrors(prev => [...prev, currentWord]);
      }
    }
  };

  useEffect(() => {
    async function saveResult() {
      if (isFinished && student && !hasBeenSaved && words.length > 0) {
        logDebug("Sauvegarde du résultat...");
        setHasBeenSaved(true);
        const score = ((words.length - errors.length) / words.length) * 100;
        logDebug(`Score calculé: ${score.toFixed(2)}%`);
        
        const details: ScoreDetail[] = words.map(word => ({
            question: "Écrire le mot",
            userAnswer: errors.includes(word) ? "Incorrect" : word,
            correctAnswer: word,
            status: errors.includes(word) ? 'incorrect' : 'correct'
        }));
        
        const skillSlug = isHomework ? `orthographe-${exerciseId}` : 'spelling';

        try {
          if (isHomework && homeworkDate) {
            await saveHomeworkResult({
                userId: student.id,
                date: homeworkDate,
                skillSlug: skillSlug,
                score: score,
            });
          } else {
              await addScore({
                  userId: student.id,
                  skill: skillSlug,
                  score: score,
                  details: details
              });
          }
          logDebug("Résultat sauvegardé avec succès.");
        } catch (error) {
          if (error instanceof Error) {
             logDebug(`ERREUR de sauvegarde: ${error.message}`);
          }
        }
      }
    }
    saveResult();
  }, [isFinished, student, words, errors, exerciseId, hasBeenSaved, isHomework, homeworkDate, logDebug]);

  const handleTryAgain = () => {
    logDebug("Tentative de réessayer le mot.");
    showWord();
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window && words.length > 0) {
      const utterance = new SpeechSynthesisUtterance(words[currentWordIndex]);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const renderDebugArea = () => (
      <Card className="mt-4">
          <CardHeader>
              <CardTitle className="text-sm">Zone de Débogage</CardTitle>
          </CardHeader>
          <CardContent>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-md text-xs h-48 overflow-y-auto font-mono">
                  {debugLog.join('\n')}
              </pre>
          </CardContent>
      </Card>
  );
  
  if (isLoading && !list) {
    return <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-16 w-16 animate-spin" /></div>
        {renderDebugArea()}
    </div>;
  }
  
  // State: Selecting a list (if no exerciseId was provided)
  if (!list) {
     return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {availableLists.length === 0 && !isLoading ? (
                <Card><CardHeader><CardTitle className="text-center">Aucune liste de dictée trouvée</CardTitle></CardHeader></Card>
            ) : (
                availableLists.map(l => (
                    <Card key={l.id} className="p-4">
                        <CardHeader className="p-2">
                            <CardDescription className="font-bold text-lg">{l.id} - {l.title}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 flex gap-4">
                            <Button onClick={() => startExercise(l, 'lundi')} className="w-full">Session 1 (Lundi)</Button>
                            <Button onClick={() => startExercise(l, 'jeudi')} className="w-full">Session 2 (Jeudi)</Button>
                            <Button onClick={() => startExercise(l, 'all')} className="w-full" variant="secondary">Toute la liste</Button>
                        </CardContent>
                    </Card>
                ))
            )}
            {renderDebugArea()}
        </div>
     );
  }

  const currentWord = words[currentWordIndex];
  const progress = ((currentWordIndex + (feedback === 'correct' ? 1 : 0)) / words.length) * 100;

  if (isFinished) {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
             <Card className="w-full max-w-lg text-center p-6 sm:p-12 shadow-2xl relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Confetti active={true} config={{angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 3000, stagger: 3, width: "10px", height: "10px"}} />
                </div>
                <Star className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
                <h1 className="font-headline text-4xl mb-4">Bravo !</h1>
                <p className="text-lg text-muted-foreground mb-2">Tu as terminé la liste de devoirs.</p>
                 {errors.length > 0 ? (
                    <div className="mt-6 text-left">
                        <p className="font-semibold text-lg mb-2">Mots à revoir :</p>
                        <Card className="p-4 bg-muted/50">
                            <ul className="flex flex-wrap gap-x-4 gap-y-1">
                                {errors.map(error => <li key={error} className="font-semibold text-destructive">{error}</li>)}
                            </ul>
                        </Card>
                    </div>
                ) : (
                    <p className="mt-6 text-green-600 font-semibold text-lg flex items-center justify-center gap-2">
                        <ThumbsUp />
                        Aucune erreur, félicitations !
                    </p>
                )}

                 <Button onClick={onFinish || (() => router.push('/'))} size="lg" className="mt-8 w-full">
                    Retourner à la liste
                </Button>
            </Card>
            {renderDebugArea()}
        </main>
    )
  }

  return (
    <>
      <header className="relative flex items-center justify-center mb-4 w-full max-w-2xl">
         {onFinish && (
            <Button variant="ghost" className="absolute left-0" onClick={onFinish}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
            </Button>
          )}
        <h1 className="font-headline text-2xl sm:text-3xl text-center">{list.id} - {list.title}</h1>
      </header>

      <div className="w-full max-w-2xl">
        <Card className="p-4 mb-4">
            <CardHeader className="p-0 mb-2">
                <CardDescription>Temps d'affichage du mot</CardDescription>
            </CardHeader>
            <div className='flex items-center gap-4'>
                <Slider 
                    min={2} 
                    max={10} 
                    step={1} 
                    value={[wordDisplayTime / 1000]} 
                    onValueChange={(val) => setWordDisplayTime(val[0] * 1000)}
                />
                <span className="font-bold w-12 text-center">{wordDisplayTime/1000}s</span>
            </div>
        </Card>
        
        <Progress value={progress} className="w-full mb-8 h-3" />

        <Card className="w-full min-h-[350px] sm:min-h-[400px] p-6 sm:p-8 flex flex-col justify-between items-center shadow-2xl">
          {feedback === 'showing' ? (
            <div className="flex flex-col items-center justify-center w-full h-full animate-in fade-in">
              <p className="font-bold text-5xl sm:text-7xl font-body tracking-wider">{currentWord}</p>
              <button onClick={handleSpeak} className="mt-8 text-muted-foreground hover:text-primary transition-colors">
                <Volume2 className="h-8 w-8" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full animate-in fade-in">
              <div className="relative w-full max-w-md">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Écris le mot ici..."
                  className={cn("h-16 text-2xl text-center",
                    feedback === 'correct' && 'border-green-500 ring-green-500',
                    feedback === 'incorrect' && 'border-red-500 ring-red-500 animate-shake'
                  )}
                  disabled={feedback === 'correct'}
                />
                 {feedback === 'correct' && <Check className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-green-500"/>}
                 {feedback === 'incorrect' && <X className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-red-500"/>}
              </div>
              
              {feedback === 'idle' && (
                <Button onClick={handleSubmit} size="lg" className="mt-8 w-full max-w-md text-lg">Valider</Button>
              )}
              {feedback === 'incorrect' && (
                <div className="mt-6 text-center w-full max-w-md">
                    <p className="text-destructive font-semibold mb-4">Ce n'est pas tout à fait ça. Le mot était :</p>
                    <p className="font-bold text-4xl text-primary mb-6">{currentWord}</p>
                    <Button onClick={handleTryAgain} size="lg" variant="outline" className="w-full text-lg">Réessayer</Button>
                </div>
              )}
               {feedback === 'correct' && (
                <div className="mt-6 text-center text-green-600 font-semibold text-2xl animate-pulse">
                    Parfait !
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
      {renderDebugArea()}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
}
