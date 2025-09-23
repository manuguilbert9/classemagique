
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, RefreshCw, ArrowLeft, Volume2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { allSyllableTables, SyllableTable } from '@/data/syllable-tables';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

type ExerciseState = 'selecting' | 'reading';

export function SyllableTableExercise() {
  const [exerciseState, setExerciseState] = useState<ExerciseState>('selecting');
  const [selectedTable, setSelectedTable] = useState<SyllableTable | null>(null);
  
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSpeak = useCallback((text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    
    // Quick check to prevent spamming
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleSelectTable = (table: SyllableTable) => {
    setSelectedTable(table);
    setExerciseState('reading');
    setTime(0);
    setIsRunning(false);
  };

  const handleBackToSelection = () => {
    setExerciseState('selecting');
    setSelectedTable(null);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (exerciseState === 'selecting' || !selectedTable) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">Choisis un tableau de syllabes</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {Object.values(
                allSyllableTables.reduce((acc, table) => {
                    const step = table.step;
                    if (!acc[step]) {
                        acc[step] = [];
                    }
                    acc[step].push(table);
                    return acc;
                }, {} as Record<string, SyllableTable[]>)
            ).map((tablesInStep, index) => (
                <AccordionItem value={`step-${index + 1}`} key={index}>
                    <AccordionTrigger className="text-xl font-semibold">{tablesInStep[0].step}</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2 pl-4">
                        {tablesInStep.map(table => (
                             <Button key={table.id} onClick={() => handleSelectTable(table)} variant="ghost" className="justify-between h-auto py-2">
                                <span>{table.title}</span>
                                {table.newSound && <Badge>{table.newSound}</Badge>}
                             </Button>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
            <Button onClick={handleBackToSelection} variant="outline"><ArrowLeft className="mr-2"/> Choisir un autre tableau</Button>
        </header>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">{selectedTable.title}</CardTitle>
                {selectedTable.newSound && <CardDescription>Nouveau son : {selectedTable.newSound}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
                {selectedTable.vowelCombinations && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Je combine les voyelles :</h3>
                        <div className="flex flex-wrap gap-2 text-xl">
                            {selectedTable.vowelCombinations.map((syllable, index) => (
                                <Button key={index} variant="outline" onClick={() => handleSpeak(syllable)} className="px-4 py-2 h-auto text-xl">{syllable}</Button>
                            ))}
                        </div>
                    </div>
                )}
                {selectedTable.cvTable && (
                     <div>
                        <h3 className="font-semibold text-lg mb-2">Je lis les syllabes (Consonne + Voyelle) :</h3>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border p-2 w-12"></th>
                                    {selectedTable.cvTable.headers.map(header => <th key={header} className="border p-2 font-bold text-xl">{header}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedTable.cvTable.rows.map(row => (
                                    <tr key={row.consonant}>
                                        <td className="border p-2 font-bold text-xl text-center">{row.consonant}</td>
                                        {row.syllables.map((syllable, index) => (
                                            <td key={index} className="border p-2 text-center text-xl cursor-pointer hover:bg-muted" onClick={() => handleSpeak(syllable)}>
                                                {syllable}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {selectedTable.vcSyllables && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Je lis les syllabes (Voyelle + Consonne) :</h3>
                        <div className="flex flex-wrap gap-2 text-xl">
                            {selectedTable.vcSyllables.map((syllable, index) => (
                                <Button key={index} variant="outline" onClick={() => handleSpeak(syllable)} className="px-4 py-2 h-auto text-xl">{syllable}</Button>
                            ))}
                        </div>
                    </div>
                )}
                {selectedTable.pseudoWords && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Je lis des pseudo-mots :</h3>
                        <div className="flex flex-wrap gap-2 text-xl">
                            {selectedTable.pseudoWords.map((word, index) => (
                                <Button key={index} variant="ghost" onClick={() => handleSpeak(word)} className="px-4 py-2 h-auto text-xl">{word}</Button>
                            ))}
                        </div>
                    </div>
                )}
                {selectedTable.words && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Je lis mes premiers mots :</h3>
                        <div className="flex flex-wrap gap-2 text-xl">
                            {selectedTable.words.map((word, index) => (
                                <Button key={index} variant="secondary" onClick={() => handleSpeak(word)} className="px-4 py-2 h-auto text-xl">{word}</Button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

        <Card className="sticky bottom-4 shadow-2xl">
            <CardContent className="p-4 flex items-center justify-around gap-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Chronomètre</p>
                    <p className="font-mono text-5xl font-bold">{formatTime(time)}</p>
                </div>
                <div className="flex items-center gap-4">
                     <Button
                        onClick={() => setIsRunning(!isRunning)}
                        size="lg"
                        variant={isRunning ? 'destructive' : 'default'}
                        className="w-40"
                     >
                        {isRunning ? <><Pause className="mr-2"/> Stop</> : <><Play className="mr-2"/> Démarrer</>}
                    </Button>
                     <Button
                        onClick={() => setTime(0)}
                        size="lg"
                        variant="secondary"
                        disabled={isRunning}
                        className="w-40"
                     >
                        <RefreshCw className="mr-2"/> Réinitialiser
                    </Button>
                </div>
                 <div className="text-center">
                    <Button onClick={() => handleSpeak(selectedTable.title)} variant="ghost" size="lg">
                        <Volume2 className="mr-2"/> Écouter le titre
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
