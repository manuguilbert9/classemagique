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
import type { RealWord, PseudoWord } from './decoding.d';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

const realWords: RealWord[] = [
    { word: 'narine', syllables: ['na', 'ri', 'ne'], silent: '' },
    { word: 'tomate', syllables: ['to', 'ma', 'te'], silent: '' },
    { word: 'farine', syllables: ['fa', 'ri', 'ne'], silent: '' },
    { word: 'tétine', syllables: ['té', 'ti', 'ne'], silent: '' },
    { word: 'saleté', syllables: ['sa', 'le', 'té'], silent: '' },
    { word: 'relire', syllables: ['re', 'li', 're'], silent: '' },
    { word: 'marine', syllables: ['ma', 'ri', 'ne'], silent: '' },
    { word: 'affalé', syllables: ['af', 'fa', 'lé'], silent: '' },
    { word: 'rassure', syllables: ['ras', 'su', 're'], silent: '' },
    { word: 'numéro', syllables: ['nu', 'mé', 'ro'], silent: '' },
    { word: 'assure', syllables: ['as', 'su', 're'], silent: '' },
    { word: 'tatami', syllables: ['ta', 'ta', 'mi'], silent: '' },
    { word: 'anime', syllables: ['a', 'ni', 'me'], silent: '' },
    { word: 'totale', syllables: ['to', 'ta', 'le'], silent: '' },
    { word: 'sonnerie', syllables: ['son', 'ne', 'rie'], silent: '' },
    { word: 'Mélanie', syllables: ['Mé', 'la', 'nie'], silent: '' },
];

const pseudoWords: PseudoWord[] = [
    { word: 'paromi', syllables: ['pa', 'ro', 'mi'] },
    { word: 'fichuso', syllables: ['fi', 'chu', 'so'] },
    { word: 'chutare', syllables: ['chu', 'ta', 're'] },
    { word: 'limona', syllables: ['li', 'mo', 'na'] },
    { word: 'sulema', syllables: ['su', 'le', 'ma'] },
    { word: 'chafipo', syllables: ['cha', 'fi', 'po'] },
    { word: 'domira', syllables: ['do', 'mi', 'ra'] },
    { word: 'ponura', syllables: ['po', 'nu', 'ra'] },
    { word: 'sotara', syllables: ['so', 'ta', 'ra'] },
    { word: 'basoru', syllables: ['ba', 'so', 'ru'] },
    { word: 'melado', syllables: ['me', 'la', 'do'] },
    { word: 'chipota', syllables: ['chi', 'po', 'ta'] },
    { word: 'sochulé', syllables: ['so', 'chu', 'lé'] },
    { word: 'ruméfi', syllables: ['ru', 'mé', 'fi'] },
];

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


export function DecodingLevel3() {
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
  const [isUppercase, setIsUppercase] = useState(false);

  React.useEffect(() => { setIsClient(true); }, []);

  const handleSpeak = useCallback((text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    
    const textToSpeak = syllablePronunciationMap[text.toLowerCase()] || `${text}.`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }, []);

  React.useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const wordsPerMinute = useMemo(() => {
    if (time === 0) return 0;
    const minutes = time / 60;
    return Math.round(pseudoWords.length / minutes);
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
                question: 'Mots à trois syllabes',
                userAnswer: `Temps circuit: ${time}s, Vitesse: ${wordsPerMinute} mots/min`,
                correctAnswer: 'Exercice terminé',
                status: 'completed'
            }],
            numberLevelSettings: { level: 'C' }
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
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-3xl">Mots à trois syllabes</CardTitle>
                    <CardDescription>Clique sur un mot pour l'entendre. Les syllabes sont colorées pour t'aider.</CardDescription>
                </div>
                 <div className="flex items-center space-x-2">
                    <Label htmlFor="case-switch-1">Script</Label>
                    <Switch id="case-switch-1" checked={isUppercase} onCheckedChange={setIsUppercase} />
                    <Label htmlFor="case-switch-1">Capitale</Label>
                </div>
            </CardHeader>
            <CardContent className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4", isUppercase && "uppercase")}>
                {realWords.map(({ word, syllables, silent }, index) => (
                    <Button key={`${word}-${index}`} onClick={() => handleSpeak(word)} variant="outline" className="h-auto justify-start text-2xl p-4">
                        <span className="text-blue-600">{syllables[0]}</span>
                        <span className="text-red-600">{syllables[1]}</span>
                        {syllables[2] && <span className="text-blue-600">{syllables[2]}</span>}
                        {silent && <span className="text-gray-400">{silent}</span>}
                    </Button>
                ))}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-3xl">Circuit de Mots Inventés</CardTitle>
                    <CardDescription>Lis les mots inventés le plus vite possible et chronomètre ton temps.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="case-switch-2">Script</Label>
                    <Switch id="case-switch-2" checked={isUppercase} onCheckedChange={setIsUppercase} />
                    <Label htmlFor="case-switch-2">Capitale</Label>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <div className="relative w-full h-[350px] sm:h-[450px]">
                     <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <pattern id="checkers-lvl3" patternUnits="userSpaceOnUse" width="10" height="10">
                          <rect width="5" height="5" fill="black"/><rect x="5" y="5" width="5" height="5" fill="black"/><rect y="5" width="5" height="5" fill="white"/><rect x="5" width="5" height="5" fill="white"/>
                        </pattern>
                      </defs>
                      <path d="M 100,10 A 90,50 0 1,1 100,110 A 90,50 0 1,1 100,10 Z" fill="#4A4A4A" />
                      <path d="M 100,30 A 60,30 0 1,1 100,90 A 60,30 0 1,1 100,30 Z" fill="hsl(var(--background))" />
                      <path d="M 100,20 A 75,40 0 1,1 100,100 A 75,40 0 1,1 100,20 Z" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                      <rect x="80" y="99" width="10" height="15" fill="url(#checkers-lvl3)" transform="rotate(12, 100, 100)" />
                    </svg>
                    {isClient && pseudoWords.map(({word, syllables}, index) => {
                        const total = pseudoWords.length;
                        const angle = (index / total) * 2 * Math.PI;
                        const x = 50 + 45 * Math.cos(angle - Math.PI / 2);
                        const y = 50 + 40 * Math.sin(angle - Math.PI / 2);
                        return (
                            <div 
                                key={index} 
                                className={cn("absolute text-lg sm:text-xl font-bold cursor-pointer transition-transform hover:scale-110 p-2 rounded bg-white border-2 border-black shadow-md", isUppercase && "uppercase")}
                                style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                                onClick={() => handleSpeak(word)}
                            >
                               <span className="text-blue-600">{syllables[0]}</span>
                               <span className="text-red-600">{syllables[1]}</span>
                               <span className="text-blue-600">{syllables[2]}</span>
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
                        <Button onClick={() => setIsRunning(!isRunning)} size="lg" variant={isRunning ? 'destructive' : 'default'} className="w-36">
                            {isRunning ? <><Pause className="mr-2"/> Stop</> : <><Play className="mr-2"/> Démarrer</>}
                        </Button>
                        <Button onClick={() => { setTime(0); setIsRunning(false); }} size="lg" variant="secondary" disabled={isRunning} className="w-36">
                            <RefreshCw className="mr-2"/> Réinitialiser
                        </Button>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Vitesse (mots/min)</p>
                        <p className="text-5xl font-bold">{wordsPerMinute}</p>
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
