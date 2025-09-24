'use client';

import * as React from 'react';
import { useState, useMemo, useCallback, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/context/user-context';
import { addScore } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';

const syllableTable = {
    headers: ['a', 'e', 'i', 'o', 'u', 'y'],
    rows: [
        { consonant: 'f', syllables: ['fa', 'fe', 'fi', 'fo', 'fu', 'fy'] },
        { consonant: 'j', syllables: ['ja', 'je', 'ji', 'jo', 'ju', 'jy'] },
        { consonant: 'l', syllables: ['la', 'le', 'li', 'lo', 'lu', 'ly'] },
        { consonant: 'm', syllables: ['ma', 'me', 'mi', 'mo', 'mu', 'my'] },
        { consonant: 'n', syllables: ['na', 'ne', 'ni', 'no', 'nu', 'ny'] },
        { consonant: 'p', syllables: ['pa', 'pe', 'pi', 'po', 'pu', 'py'] },
        { consonant: 'r', syllables: ['ra', 're', 'ri', 'ro', 'ru', 'ry'] },
        { consonant: 's', syllables: ['sa', 'se', 'si', 'so', 'su', 'sy'] },
        { consonant: 't', syllables: ['ta', 'te', 'ti', 'to', 'tu', 'ty'] },
        { consonant: 'v', syllables: ['va', 've', 'vi', 'vo', 'vu', 'vy'] },
    ]
};

const raceTrackSyllables = [
    'la', 'li', 'lu', 'lo', 'ly', 'le', 'ra', 'ri', 'ru', 'ro', 'ry', 're', 
    'fa', 'fi', 'fu', 'fo', 'fy', 'fe', 'ma', 'mi', 'mu', 'mo', 'my', 'me'
];


const syllablePronunciationMap: { [key: string]: string } = {
  lo: "l'eau", fo: "faux", pa: "pas", va: "vas", ja: "jas",
  li: "lie", lu: "lue", le: "le",
  ri: "rie", ru: "rue", re: "re",
  fi: "fil", fu: "fut", fe: "feu",
  mi: "mie", mu: "mue", me: "meuh",
  ni: "nie", nu: "nue", ne: "nœud",
  pi: "pie", pu: "pue", po: "peau", pe: "peu",
  si: "si", su: "su", so: "seau",
  ti: "tie", tu: "tu", to: "tôt",
  vi: "vie", vu: "vue", vo: "veau", ve: "veu",
  // With y
  fy: "fi", jy: "ji", ly: "li", my: "mi", ny: "ni", 
  py: "pi", ry: "ri", sy: "si", ty: "ti", vy: "vi",
};

export function DecodingLevel1() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');
  const { toast } = useToast();

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

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

  React.useEffect(() => {
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

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const syllablesPerMinute = useMemo(() => {
    if (time === 0) return 0;
    const minutes = time / 60;
    return Math.round(raceTrackSyllables.length / minutes);
  }, [time]);

  const handleSaveScore = async () => {
    if (!student) {
        toast({
            variant: "destructive",
            title: "Non connecté",
            description: "Vous devez être connecté pour enregistrer un score.",
        });
        return;
    }
    if (hasBeenSaved) return;

    setHasBeenSaved(true);
    const score = 100; // Signifies completion

    if (isHomework && homeworkDate) {
        await saveHomeworkResult({
            userId: student.id,
            date: homeworkDate,
            skillSlug: 'decoding',
            score: score,
        });
    } else {
        await addScore({
            userId: student.id,
            skill: 'decoding',
            score: score,
            details: [{
                question: 'Syllabes simples',
                userAnswer: `Temps: ${time}s, Vitesse: ${syllablesPerMinute} syll/min`,
                correctAnswer: 'Exercice terminé',
                status: 'completed'
            }],
            numberLevelSettings: { level: 'A' }
        });
    }

    toast({
        title: "Exercice terminé !",
        description: "Ton score a bien été enregistré.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Tableau de Syllabes - Niveau 1</CardTitle>
            </CardHeader>
            <CardContent>
                 <table className="w-full border-collapse">
                     <thead>
                        <tr>
                            <th className="border p-2 w-12"></th>
                            {syllableTable.headers.map(header => (
                                <th key={header} className="border p-2 text-2xl font-bold text-orange-600">{header}</th>
                            ))}
                        </tr>
                     </thead>
                    <tbody>
                        {syllableTable.rows.map((row) => (
                            <tr key={row.consonant}>
                                <td className="border p-2 text-center text-2xl font-bold text-orange-600">{row.consonant}</td>
                                {row.syllables.map((syllable, sIndex) => (
                                    <td 
                                        key={sIndex} 
                                        className="border p-2 text-center text-2xl cursor-pointer hover:bg-muted"
                                        onClick={() => handleSpeak(syllable)}
                                    >
                                        {syllable}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Circuit de Lecture</CardTitle>
                <CardDescription>Lis les syllabes autour du circuit le plus vite possible. Chronomètre ton temps pour un tour complet !</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <div className="relative w-full h-[300px] sm:h-[400px]">
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 200 120"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <pattern id="checkers" patternUnits="userSpaceOnUse" width="10" height="10">
                          <rect width="5" height="5" fill="black"/>
                          <rect x="5" y="5" width="5" height="5" fill="black"/>
                          <rect y="5" width="5" height="5" fill="white"/>
                          <rect x="5" width="5" height="5" fill="white"/>
                        </pattern>
                      </defs>
                       {/* Outer track */}
                      <path
                        d="M 100,10 
                           A 90,50 0 1,1 100,110 
                           A 90,50 0 1,1 100,10 Z"
                        fill="#4A4A4A"
                      />
                       {/* Inner grass */}
                       <path
                        d="M 100,30 
                           A 60,30 0 1,1 100,90 
                           A 60,30 0 1,1 100,30 Z"
                        fill="hsl(var(--background))"
                      />
                      {/* Dashed line */}
                      <path
                        d="M 100,20
                          A 75,40 0 1,1 100,100
                          A 75,40 0 1,1 100,20 Z"
                        fill="none"
                        stroke="white"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      {/* Finish line */}
                      <rect x="80" y="99" width="10" height="15" fill="url(#checkers)" transform="rotate(12, 100, 100)" />
                    </svg>
                    {isClient && raceTrackSyllables.map((syllable, index) => {
                        const total = raceTrackSyllables.length;
                        const angle = (index / total) * 2 * Math.PI;
                        
                        const xOffset = 50; // %
                        const yOffset = 50; // %
                        const xRadius = 45; // %
                        const yRadius = 40; // %
                        
                        const x = xOffset + xRadius * Math.cos(angle - Math.PI / 2);
                        const y = yOffset + yRadius * Math.sin(angle - Math.PI / 2);

                        return (
                            <div 
                                key={index} 
                                className="absolute text-lg sm:text-xl font-bold cursor-pointer transition-transform hover:scale-110 p-2 rounded bg-yellow-300 border-2 border-black shadow-md"
                                style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                                onClick={() => handleSpeak(syllable)}
                            >
                                {syllable}
                            </div>
                        )
                    })}
                </div>
                 <div className="w-full flex flex-col sm:flex-row items-center justify-around gap-4 p-4 rounded-lg bg-muted">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Chronomètre</p>
                        <p className="font-mono text-5xl font-bold">{formatTime(time)}</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsRunning(!isRunning)}
                            size="lg"
                            variant={isRunning ? 'destructive' : 'default'}
                            className="w-36"
                        >
                            {isRunning ? <><Pause className="mr-2"/> Stop</> : <><Play className="mr-2"/> Démarrer</>}
                        </Button>
                        <Button
                            onClick={() => { setTime(0); setIsRunning(false); }}
                            size="lg"
                            variant="secondary"
                            disabled={isRunning}
                            className="w-36"
                        >
                            <RefreshCw className="mr-2"/> Réinitialiser
                        </Button>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Vitesse (syllabes/min)</p>
                        <p className="text-5xl font-bold">{syllablesPerMinute}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="pt-6 flex justify-center">
                 <Button onClick={handleSaveScore} disabled={!student || hasBeenSaved} size="lg">
                    {hasBeenSaved ? <CheckCircle className="mr-2"/> : <Save className="mr-2"/>}
                    {hasBeenSaved ? "Score enregistré !" : "J'ai terminé, j'enregistre mon score"}
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}
