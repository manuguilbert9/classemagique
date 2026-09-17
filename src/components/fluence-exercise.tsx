
'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, RefreshCw, ArrowLeft, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UserContext } from '@/context/user-context';
import { addScore } from '@/services/scores';
import { calculateMCLM, readingSeconds } from '@/lib/fluence-metrics';
import { saveHomeworkResult } from '@/services/homework';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { categoryStyles } from '@/lib/skills';
import { Slider } from './ui/slider';
import { SyllableText } from './syllable-text';

interface FluenceText {
  level: string;
  title: string;
  content: string;
  wordCount: number;
  subCategory?: string;
}

type ExerciseState = 'selecting' | 'reading' | 'finished';

export function FluenceExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');
  const { toast } = useToast();

  const [allTexts, setAllTexts] = useState<Record<string, FluenceText[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedText, setSelectedText] = useState<FluenceText | null>(null);
  const [exerciseState, setExerciseState] = useState<ExerciseState>('selecting');
  
  // Timer state
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const elapsedMs = React.useRef(0);
  const startedAt = React.useRef<number | null>(null);

  // Score state
  const [errors, setErrors] = useState(0);
  const [wordsRead, setWordsRead] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const sessionId = React.useRef<string>(crypto.randomUUID());
  const mclm = calculateMCLM(wordsRead, time, errors);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);

  // Display state
  const [fontSize, setFontSize] = useState(20);
  const [showSyllables, setShowSyllables] = useState(false);
  const syllablesUsed = React.useRef(false);
  const fontSizes = [16, 18, 20, 24, 28, 32];

  useEffect(() => {
    async function fetchTexts() {
      setIsLoading(true);
      try {
        const levels = ['B', 'C', 'D'];
        const textsByLevel: Record<string, FluenceText[]> = {};
        for (const level of levels) {
          const response = await fetch(`/api/fluence-texts?level=${level}`);
          if (!response.ok) throw new Error(`Failed to fetch texts for level ${level}`);
          const texts: FluenceText[] = await response.json();
          textsByLevel[`Niveau ${level}`] = texts;
        }
        setAllTexts(textsByLevel);
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les textes de fluence.' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchTexts();
  }, [toast]);
  
   useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(readingSeconds(elapsedMs.current, startedAt.current, Date.now()));
      }, 250);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);
  
  const handleSelectText = (text: FluenceText) => {
    setSelectedText(text);
    syllablesUsed.current = showSyllables;
    setExerciseState('reading');
    setTime(0);
    elapsedMs.current = 0;
    startedAt.current = null;
    setErrors(0);
    setWordsRead(0);
    sessionId.current = crypto.randomUUID();
    setHasBeenSaved(false);
    setSubmitted(false);
  };
  
  const handleStop = () => {
    if (startedAt.current !== null) elapsedMs.current += Date.now() - startedAt.current;
    startedAt.current = null;
    setTime(readingSeconds(elapsedMs.current, null, Date.now()));
    setIsRunning(false);
  };
  const toggleTimer = () => {
    if (isRunning) handleStop();
    else { startedAt.current = Date.now(); setIsRunning(true); }
  };
  const saveFinalResult = async () => {
    if (!student || !selectedText || time <= 0 || isRunning || isSaving || hasBeenSaved) return;
    setIsSaving(true);
    setSubmitted(true);
    const details = [{question:selectedText.title, userAnswer:`${mclm} MCLM`, correctAnswer:`${wordsRead} mots lus, ${time}s, ${errors} erreurs`,status:'completed' as const, hintUsed:syllablesUsed.current}];
    const result = await addScore({userId:student.id,skill:'fluence',score:mclm,sessionId:sessionId.current,details,
      readingRaceSettings:{level:(`Niveau ${selectedText.level.replace('Niveau ', '')}`) as 'Niveau B' | 'Niveau C' | 'Niveau D'},
      metadata:{unit:'MCLM',durationSeconds:time,text:selectedText.content,wordsRead,errors,assistance:syllablesUsed.current ? ['syllabes'] : []}});
    setIsSaving(false);
    setHasBeenSaved(result.success);
    toast(result.success ? {title:'Résultat enregistré',description:`${mclm} MCLM, après validation de l’adulte.`} : {variant:'destructive',title:'Résultat à enregistrer',description:'Utilise Réessayer l’enregistrement. Le résultat final est conservé.'});
  };

  const resetExercise = () => {
    setExerciseState('selecting');
    setSelectedText(null);
    setIsRunning(false);
  };

  const textsForLevelB = useMemo(() => {
    const texts = allTexts['Niveau B'] || [];
    const grouped: Record<string, FluenceText[]> = {
      'Sons simples': [],
      'Sons complexes': [],
    };
    texts.forEach(t => {
      if(t.subCategory && grouped[t.subCategory]) {
        grouped[t.subCategory].push(t);
      }
    });
    return grouped;
  }, [allTexts]);
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </Card>
    );
  }
  
  if (exerciseState === 'selecting' || !selectedText) {
    const style = categoryStyles['Lecture / compréhension'];
    return (
      <Card className={cn("w-full max-w-2xl mx-auto shadow-2xl", style.bg, style.text)}>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">Choisis un texte à lire</CardTitle>
          <CardDescription className="text-center">Le but est de lire le texte à voix haute le plus vite et le mieux possible.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(allTexts).map(([level, texts]) => {
              if (texts.length === 0) return null;

              if (level === 'Niveau B') {
                return (
                  <AccordionItem value={level} key={level}>
                    <AccordionTrigger className="text-xl font-semibold">{level}</AccordionTrigger>
                    <AccordionContent>
                      <Accordion type="single" collapsible className="w-full pl-4">
                        {Object.entries(textsForLevelB).map(([subCategory, subTexts]) => {
                          if (subTexts.length === 0) return null;
                          return (
                            <AccordionItem value={subCategory} key={subCategory}>
                              <AccordionTrigger>{subCategory}</AccordionTrigger>
                              <AccordionContent className="flex flex-col gap-2 pl-4">
                                {subTexts.map(text => (
                                  <Button key={text.title} onClick={() => handleSelectText(text)} variant="ghost" className="justify-between h-auto py-2">
                                    <span>{text.title}</span>
                                    <span className="text-xs text-muted-foreground">{text.wordCount} mots</span>
                                  </Button>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                )
              }

              return (
                 <AccordionItem value={level} key={level}>
                  <AccordionTrigger className="text-xl font-semibold">{level}</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-2">
                    {texts.map(text => (
                      <Button key={text.title} onClick={() => handleSelectText(text)} variant="ghost" className="justify-between h-auto py-2">
                        <span>{text.title}</span>
                        <span className="text-xs text-muted-foreground">{text.wordCount} mots</span>
                      </Button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    );
  }
  
  if(selectedText) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <Button disabled={isSaving} onClick={resetExercise} variant="outline"><ArrowLeft className="mr-2"/> Choisir un autre texte</Button>
                <div className="flex items-center gap-4">
                    <Button variant="outline" disabled={submitted} onClick={() => setShowSyllables(prev => { if (!prev) syllablesUsed.current = true; return !prev; })}>
                        <SyllableText text="Syllabes" />
                    </Button>
                    <div className="flex items-center gap-2 w-48">
                        <Label>Taille</Label>
                        <Slider
                            min={0}
                            max={fontSizes.length - 1}
                            step={1}
                            value={[fontSizes.indexOf(fontSize)]}
                            onValueChange={(value) => setFontSize(fontSizes[value[0]])}
                        />
                    </div>
                </div>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{selectedText.title}</CardTitle>
                    <CardDescription>{selectedText.level}{selectedText.subCategory && ` - ${selectedText.subCategory}`} - {selectedText.wordCount} mots</CardDescription>
                </CardHeader>
                <CardContent 
                    className="prose max-w-none leading-relaxed"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {showSyllables ? (
                        <SyllableText text={selectedText.content} />
                    ) : (
                        <p>{selectedText.content}</p>
                    )}
                </CardContent>
            </Card>

            <Card className="sticky bottom-4 shadow-2xl">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-around gap-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Chronomètre</p>
                        <p className="font-mono text-5xl font-bold">{formatTime(time)}</p>
                    </div>

                    <div className="flex items-center gap-4">
                         <Button
                            disabled={submitted}
                            onClick={toggleTimer}
                            size="lg"
                            variant={isRunning ? 'destructive' : 'default'}
                            className="w-40"
                         >
                            {isRunning ? <><Pause className="mr-2"/> Stop</> : <><Play className="mr-2"/> Démarrer</>}
                        </Button>
                         <Button
                            onClick={handleStop}
                            size="lg"
                            variant="secondary"
                            disabled={isRunning || submitted}
                            className="w-40"
                         >
                            <Calculator className="mr-2"/> Calculer
                        </Button>
                    </div>
                    
                     <div className="flex items-center gap-2">
                        <div><Label htmlFor="words-read">Mots réellement lus (numéro du dernier mot)</Label>
                        <Input id="words-read" type="number" min={0} max={selectedText.wordCount} value={wordsRead} disabled={submitted} onChange={e=>{const value=Math.max(0,Math.min(selectedText.wordCount,Math.floor(Number(e.target.value))||0));setWordsRead(value);setErrors(n=>Math.min(n,value));}} /></div>
                        <div className="text-center">
                             <Label htmlFor="errors" className="text-sm text-muted-foreground">Erreurs</Label>
                            <Input 
                                id="errors"
                                type="number" 
                                value={errors}
                                min={0} max={wordsRead} disabled={submitted}
                                onChange={e => setErrors(Math.min(wordsRead, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                                className="w-24 h-14 text-2xl text-center font-bold"

                            />
                        </div>
                         <div className="text-center pt-5">
                            <p className="text-sm text-muted-foreground">Score</p>
                            <p className="text-4xl font-bold">{mclm} <span className="text-base font-normal text-muted-foreground">MCLM</span></p>
                        </div>
                    </div>

                </CardContent>
                <p className="px-4 text-sm">L’adulte chronomètre uniquement la lecture, indique le dernier mot lu et les erreurs, puis valide. Le temps de saisie ne compte pas.</p>
                <Button className="m-4" disabled={isRunning || time <= 0 || submitted} onClick={saveFinalResult}>{hasBeenSaved ? 'Résultat enregistré' : isSaving ? 'Enregistrement…' : submitted ? 'Résultat conservé — réessayer ci-dessus' : 'Valider le résultat final (adulte)'}</Button>
            </Card>
        </div>
    )
  }

  return null;
}
