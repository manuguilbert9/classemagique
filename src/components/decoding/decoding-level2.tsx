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
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

const realWords = [
    { word: 'lave', syllables: ['la', 've'], silent: '' },
    { word: 'jupe', syllables: ['ju', 'pe'], silent: '' },
    { word: 'rame', syllables: ['ra', 'me'], silent: '' },
    { word: 'pile', syllables: ['pi', 'le'], silent: '' },
    { word: 'sale', syllables: ['sa', 'le'], silent: '' },
    { word: 'lune', syllables: ['lu', 'ne'], silent: '' },
    { word: 'moto', syllables: ['mo', 'to'], silent: '' },
    { word: 'purée', syllables: ['pu', 'ré'], silent: 'e' },
    { word: 'repas', syllables: ['re', 'pa'], silent: 's' },
    { word: 'rôti', syllables: ['rô', 'ti'], silent: '' },
    { word: 'vide', syllables: ['vi', 'de'], silent: '' },
    { word: 'mare', syllables: ['ma', 're'], silent: '' },
    { word: 'momie', syllables: ['mo', 'mi'], silent: 'e' },
    { word: 'radis', syllables: ['ra', 'di'], silent: 's' },
    { word: 'assis', syllables: ['as', 'si'], silent: 's' },
    { word: 'relis', syllables: ['re', 'li'], silent: 's' },
    { word: 'tapis', syllables: ['ta', 'pi'], silent: 's' },
    { word: 'lama', syllables: ['la', 'ma'], silent: '' },
    { word: 'furie', syllables: ['fu', 'rie'], silent: '' },
    { word: 'folie', syllables: ['fo', 'lie'], silent: '' },
    { word: 'râle', syllables: ['râ', 'le'], silent: '' },
    { word: 'série', syllables: ['sé', 'ri'], silent: 'e' },
    { word: 'lasso', syllables: ['las', 'so'], silent: '' },
    { word: 'tape', syllables: ['ta', 'pe'], silent: '' },
    { word: 'rime', syllables: ['ri', 'me'], silent: '' },
    { word: 'malle', syllables: ['mal', 'le'], silent: '' },
    { word: 'Lola', syllables: ['Lo', 'la'], silent: '' },
    { word: 'Rémi', syllables: ['Ré', 'mi'], silent: '' },
    { word: 'mamie', syllables: ['ma', 'mi'], silent: 'e' },
    { word: 'file', syllables: ['fi', 'le'], silent: '' },
    { word: 'menue', syllables: ['me', 'nu'], silent: 'e' },
    { word: 'roche', syllables: ['ro', 'che'], silent: '' },
    { word: 'chassé', syllables: ['chas', 'sé'], silent: '' },
    { word: 'morue', syllables: ['mo', 'ru'], silent: 'e' },
    { word: 'lâche', syllables: ['lâ', 'che'], silent: '' },
    { word: 'Mila', syllables: ['Mi', 'la'], silent: '' },
    { word: 'passe', syllables: ['pas', 'se'], silent: '' },
    { word: 'ruche', syllables: ['ru', 'che'], silent: '' },
    { word: 'mari', syllables: ['ma', 'ri'], silent: '' },
    { word: 'sirop', syllables: ['si', 'ro'], silent: 'p' },
    { word: 'robot', syllables: ['ro', 'bo'], silent: 't' },
    { word: 'mine', syllables: ['mi', 'ne'], silent: '' },
    { word: 'salut', syllables: ['sa', 'lu'], silent: 't' },
    { word: 'vache', syllables: ['va', 'che'], silent: '' },
    { word: 'ami', syllables: ['a', 'mi'], silent: '' },
    { word: 'nappe', syllables: ['nap', 'pe'], silent: '' },
    { word: 'repas', syllables: ['re', 'pa'], silent: 's' },
    { word: 'Jules', syllables: ['Ju', 'le'], silent: 's' },
    { word: 'Paris', syllables: ['Pa', 'ri'], silent: 's' },
];

const pseudoWords = [
    'jylu', 'maro', 'sufa', 'jole', 'ruva', 'lefu', 'jafy', 'noro', 
    'syna', 'fija', 'nufi', 'suju', 'saru', 'nufu', 'sero', 'lure', 
    'semy', 'sora', 'lifo', 'mulu', 'naji', 'vachu', 'soly', 'ryma', 'sije'
];

const pathWords = [ 'il', 'le', 'un', 'la', 'sa', 'ma', 'sur', 'son', 'sous', 'dans'];

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

export function DecodingLevel2() {
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
                question: 'Mots à deux syllabes',
                userAnswer: `Temps circuit: ${time}s, Vitesse: ${wordsPerMinute} mots/min`,
                correctAnswer: 'Exercice terminé',
                status: 'completed'
            }],
            numberLevelSettings: { level: 'B' }
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
                    <CardTitle className="font-headline text-3xl">Mots à deux syllabes</CardTitle>
                    <CardDescription>Clique sur un mot pour l'entendre. Les syllabes sont colorées pour t'aider.</CardDescription>
                </div>
                 <div className="flex items-center space-x-2">
                    <Label htmlFor="case-switch-1">Script</Label>
                    <Switch id="case-switch-1" checked={isUppercase} onCheckedChange={setIsUppercase} />
                    <Label htmlFor="case-switch-1">Capitale</Label>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {realWords.map(({ word, syllables, silent }, index) => (
                    <Button key={`${word}-${index}`} onClick={() => handleSpeak(word)} variant="outline" className={cn("h-auto justify-start text-2xl p-4", isUppercase && "uppercase")}>
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
                        <pattern id="checkers-lvl2" patternUnits="userSpaceOnUse" width="10" height="10">
                          <rect width="5" height="5" fill="black"/><rect x="5" y="5" width="5" height="5" fill="black"/><rect y="5" width="5" height="5" fill="white"/><rect x="5" width="5" height="5" fill="white"/>
                        </pattern>
                      </defs>
                      <path d="M 100,10 A 90,50 0 1,1 100,110 A 90,50 0 1,1 100,10 Z" fill="#4A4A4A" />
                      <path d="M 100,30 A 60,30 0 1,1 100,90 A 60,30 0 1,1 100,30 Z" fill="hsl(var(--background))" />
                      <path d="M 100,20 A 75,40 0 1,1 100,100 A 75,40 0 1,1 100,20 Z" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                      <rect x="80" y="99" width="10" height="15" fill="url(#checkers-lvl2)" transform="rotate(12, 100, 100)" />
                    </svg>
                    {isClient && pseudoWords.map((word, index) => {
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
                               <span className="text-blue-600">{word.slice(0, 2)}</span>
                               <span className="text-red-600">{word.slice(2)}</span>
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
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-3xl">Le Chemin des Mots</CardTitle>
                    <CardDescription>Lis les mots pour suivre le chemin.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="case-switch-3">Script</Label>
                    <Switch id="case-switch-3" checked={isUppercase} onCheckedChange={setIsUppercase} />
                    <Label htmlFor="case-switch-3">Capitale</Label>
                </div>
            </CardHeader>
            <CardContent className={cn("flex flex-wrap items-center justify-center gap-2 p-6", isUppercase && "uppercase")}>
                {pathWords.map((word, index) => (
                    <React.Fragment key={word}>
                        <Button variant="outline" className="text-xl" onClick={() => handleSpeak(word)}>{word}</Button>
                        {index < pathWords.length - 1 && <span className="text-2xl text-muted-foreground">→</span>}
                    </React.Fragment>
                ))}
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
