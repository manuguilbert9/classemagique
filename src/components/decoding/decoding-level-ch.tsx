'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/context/user-context';
import { addScore, saveHomeworkResult } from '@/services/scores';
import { Save, CheckCircle } from 'lucide-react';

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
  cha: "chat", che: "cheu", chi: "chi", cho: "chaud", chu: "chu", chy: "chi",
};

const SyllableTable = ({ title, data }: { title: string, data: string[][] }) => {
  const handleSpeak = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    
    const textToSpeak = syllablePronunciationMap[text.toLowerCase()] || `${text}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">{title}</h4>
      <table className="w-full border-collapse">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((syllable, cellIndex) => (
                <td
                  key={cellIndex}
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
    </div>
  );
};

const tableCH = [
    ['cha', 'che', 'chi', 'cho', 'chu', 'chy'],
    ['chy', 'cha', 'chu', 'che', 'cho', 'chi'],
    ['chu', 'chi', 'cho', 'cha', 'chy', 'che'],
    ['che', 'cho', 'chy', 'chu', 'chi', 'cha'],
];

const wordsData = [
    { word: 'ruche', syllables: ['ru', 'che'], silent: '' },
    { word: 'lâche', syllables: ['lâ', 'che'], silent: '' },
    { word: 'chassé', syllables: ['chas', 'sé'], silent: '' },
    { word: 'roche', syllables: ['ro', 'che'], silent: '' },
    { word: 'biche', syllables: ['bi', 'che'], silent: '' },
    { word: 'vache', syllables: ['va', 'che'], silent: '' },
    { word: 'chute', syllables: ['chu', 'te'], silent: '' },
    { word: 'tache', syllables: ['ta', 'che'], silent: '' },
    { word: 'machine', syllables: ['ma', 'chi', 'ne'], silent: '' },
    { word: 'affiche', syllables: ['af', 'fi', 'che'], silent: '' },
    { word: 'échasse', syllables: ['é', 'chas', 'se'], silent: '' },
    { word: 'arrache', syllables: ['ar', 'ra', 'che'], silent: '' },
    { word: 'cheminée', syllables: ['che', 'mi', 'née'], silent: '' },
    { word: 'parachute', syllables: ['pa', 'ra', 'chu', 'te'], silent: '' },
    { word: 'chevelure', syllables: ['che', 've', 'lu', 're'], silent: '' },
];


export function DecodingLevelCH() {
  const { student } = React.useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');
  const { toast } = useToast();
  const [hasBeenSaved, setHasBeenSaved] = React.useState(false);

  const handleSpeak = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };
  
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
    const score = 100;

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
                question: 'Session Son [ch]',
                userAnswer: `Exercice terminé`,
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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Session : Le son [ch]</CardTitle>
        <CardDescription className="text-center">Clique sur les syllabes et les mots pour les entendre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <SyllableTable title="Tableau de syllabes avec le son [ch] :" data={tableCH} />
        <div className="space-y-4">
            <h4 className="font-semibold">Je lis des mots :</h4>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {wordsData.map(({ word, syllables, silent }, index) => (
                    <Button key={`${word}-${index}`} onClick={() => handleSpeak(word)} variant="outline" className="h-auto justify-start text-2xl p-4">
                        <span className="text-blue-600">{syllables[0]}</span>
                        <span className="text-red-600">{syllables[1]}</span>
                        {syllables[2] && <span className="text-blue-600">{syllables[2]}</span>}
                        {syllables[3] && <span className="text-red-600">{syllables[3]}</span>}
                        {silent && <span className="text-gray-400">{silent}</span>}
                    </Button>
                ))}
            </div>
        </div>
      </CardContent>
       <CardContent className="pt-6 flex justify-center">
         <Button onClick={handleSaveScore} disabled={!student || hasBeenSaved} size="lg">
            {hasBeenSaved ? <CheckCircle className="mr-2"/> : <Save className="mr-2"/>}
            {hasBeenSaved ? "Score enregistré !" : "J'ai terminé, j'enregistre mon score"}
        </Button>
      </CardContent>
    </Card>
  );
}
