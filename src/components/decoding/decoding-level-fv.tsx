'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/context/user-context';
import { addScore, saveHomeworkResult } from '@/services/scores';
import { Save, CheckCircle } from 'lucide-react';

const SyllableTable = ({ title, data, colored = false }: { title: string, data: string[][], colored?: boolean }) => {
  const handleSpeak = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
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
                  {colored ? (
                     <span>
                        <span className="text-red-600">{syllable.charAt(0)}</span>
                        <span>{syllable.slice(1)}</span>
                    </span>
                  ) : (
                    syllable
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LetterLine = ({ title, data }: { title: string, data: string[] }) => {
    const handleSpeak = (text: string) => {
        if (!text || !('speechSynthesis' in window)) return;
        if (speechSynthesis.speaking) speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0;
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="space-y-2">
             <h4 className="font-semibold">{title}</h4>
             <div className="flex gap-4 p-4 border rounded-md justify-center flex-wrap">
                {data.map((letter, index) => (
                    <span key={index} className="text-3xl font-bold cursor-pointer" onClick={() => handleSpeak(letter)}>{letter}</span>
                ))}
             </div>
        </div>
    )
}

const tableF = [
  ['fa', 'fe', 'fi', 'fo', 'fu', 'fy'],
  ['fy', 'fa', 'fu', 'fe', 'fo', 'fi'],
  ['fu', 'fi', 'fo', 'fa', 'fy', 'fe'],
  ['fe', 'fo', 'fy', 'fu', 'fi', 'fa'],
];

const tableV = [
  ['va', 've', 'vi', 'vo', 'vu', 'vy'],
  ['vy', 'va', 'vu', 've', 'vo', 'vi'],
  ['vu', 'vi', 'vo', 'va', 'vy', 've'],
  ['ve', 'vo', 'vy', 'vu', 'vi', 'va'],
];

const lineFV = ['f', 'v', 'v', 'f', 'f', 'v', 'f', 'v', 'f', 'v', 'v', 'v', 'f', 'f'];

const tableFV = [
  ['va', 'fe', 'vi', 'fo', 'fu', 'vy'],
  ['fy', 'va', 'fu', 've', 'vo', 'fi'],
  ['vu', 'fi', 'vo', 'fa', 'vy', 'fe'],
  ['fe', 'vo', 'fy', 'vu', 'vi', 'fa'],
];


export function DecodingLevelFV() {
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
                question: 'Niveau Spécial f/v',
                userAnswer: `Exercice terminé`,
                correctAnswer: 'Exercice terminé',
                status: 'completed'
            }],
            numberLevelSettings: { level: 'C' } // Using 'C' as a proxy for this special level
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
        <CardTitle className="font-headline text-3xl text-center">Niveau Spécial : Confusion f/v</CardTitle>
        <CardDescription className="text-center">Clique sur les lettres et les syllabes pour les entendre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <SyllableTable title="Tableau de syllabes avec la lettre f :" data={tableF} />
        <SyllableTable title="Tableau de syllabes avec la lettre v :" data={tableV} />
        <LetterLine title="Ligne de f et v :" data={lineFV} />
        <SyllableTable title="Tableau de syllabes avec les lettres v et f :" data={tableFV} colored />
        <SyllableTable title="Tableau de syllabes avec les lettres v et f (sans aide) :" data={tableFV} />
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
