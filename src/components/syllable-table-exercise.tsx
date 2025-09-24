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

const ITEMS_PER_ROW = 8; // Number of items per row in the unified grid

const syllablePronunciationMap: { [key: string]: string } = {
  bo: "beau", do: "dos", ba: "bas", da: "das",
  be: "beu", de: "de", bi: "bie", di: "die",
  bu: "bue", du: "due", by: "bi", dy: "di",
  lo: "l'eau", fo: "faux", pa: "pas", va: "vas",
  ne: "nœud", ve: "veux", jo: "j'eau", ro: "rot",
  li: "lie", lu: "lue", le: "le",
  ri: "rie", ru: "rue", re: "re",
  fu: "fut", fe: "feu",
  mi: "mie", mu: "mue", me: "meuh",
  ni: "nie", nu: "nue",
  pi: "pie", pu: "pue", po: "peau", pe: "peu",
  si: "si", su: "su", so: "seau",
  tu: "tu", to: "tôt",
  vi: "vie", vu: "vue", vo: "veau",
  // With y
  fy: "fi", jy: "ji", ly: "li", my: "mi", ny: "ni", 
  py: "pi", ry: "ri", sy: "si", ty: "ti", vy: "vie",
};


export function SyllableTableExercise() {
  const [exerciseState, setExerciseState] = useState<ExerciseState>('selecting');
  const [selectedTable, setSelectedTable] = useState<SyllableTable | null>(null);
  
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSpeak = useCallback((text: string) => {
    if (!text || !('speechSynthesis' in window)) return;

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const textToSpeak = syllablePronunciationMap[text.toLowerCase()] || `${text}.`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }, []);

  const unifiedSyllableList = useMemo(() => {
    if (!selectedTable) return [];
    
    let allItems: string[] = [];
    
    // Add items from cvTable first to maintain some structure
    if (selectedTable.cvTable) {
        selectedTable.cvTable.rows.forEach(row => {
            allItems.push(...row.syllables);
        });
    }

    if (selectedTable.vowelCombinations) {
        allItems.push(...selectedTable.vowelCombinations);
    }
    if (selectedTable.vcSyllables) {
        allItems.push(...selectedTable.vcSyllables);
    }
    if (selectedTable.pseudoWords) {
        allItems.push(...selectedTable.pseudoWords);
    }
    if (selectedTable.words) {
        allItems.push(...selectedTable.words);
    }

    // Chunk the flat array into rows for the table
    const chunkedItems = [];
    for (let i = 0; i < allItems.length; i += ITEMS_PER_ROW) {
        chunkedItems.push(allItems.slice(i, i + ITEMS_PER_ROW));
    }
    return chunkedItems;

  }, [selectedTable]);


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
            <CardContent>
                 <table className="w-full border-collapse">
                    <tbody>
                        {unifiedSyllableList.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((item, itemIndex) => (
                                    <td 
                                        key={`${rowIndex}-${itemIndex}`} 
                                        className="border p-2 text-center text-xl sm:text-2xl cursor-pointer hover:bg-muted"
                                        onClick={() => handleSpeak(item)}
                                    >
                                        {item}
                                    </td>
                                ))}
                                {/* Fill empty cells in the last row if it's not full */}
                                {row.length < ITEMS_PER_ROW && Array.from({ length: ITEMS_PER_ROW - row.length }).map((_, i) => (
                                    <td key={`empty-${i}`} className="border p-2"></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
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
