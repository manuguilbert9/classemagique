
'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import RaceTrackImage from '../../public/images/race-track.png';

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


export function DecodingExercise() {
  
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSpeak = useCallback((text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    const textToSpeak = text.length <= 3 ? `${text}.` : text;
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
                <div className="relative w-[300px] h-[450px] sm:w-[400px] sm:h-[600px]">
                    <Image src={RaceTrackImage.src} layout="fill" objectFit="contain" alt="Circuit de course"/>
                    {raceTrackSyllables.map((syllable, index) => {
                        const total = raceTrackSyllables.length;
                        const angle = (index / total) * 2 * Math.PI;
                        // Adjust these values to position syllables along the track
                        const xOffset = 50; // %
                        const yOffset = 50; // %
                        const xRadius = 40; // %
                        const yRadius = 46; // %
                        
                        const x = xOffset + xRadius * Math.cos(angle - Math.PI / 2);
                        const y = yOffset + yRadius * Math.sin(angle - Math.PI / 2);

                        return (
                            <div 
                                key={index} 
                                className="absolute text-lg sm:text-xl font-bold cursor-pointer hover:scale-110 transition-transform"
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

    </div>
  )
}
