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

const SyllableTable = ({ title, data }: { title: string, data: string[][] }) => {
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

const tableP = [
    ['pa', 'pe', 'pi', 'po', 'pu', 'py'],
    ['py', 'pa', 'pu', 'pe', 'po', 'pi'],
    ['pu', 'pi', 'po', 'pa', 'py', 'pe'],
    ['pe', 'po', 'py', 'pu', 'pi', 'pa'],
];


export function DecodingLevelP() {
  const { student } = React.useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');
  const { toast } = useToast();
  const [hasBeenSaved, setHasBeenSaved] = React.useState(false);

  
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
                question: 'Session Son [p]',
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
        <CardTitle className="font-headline text-3xl text-center">Session : Le son [p]</CardTitle>
        <CardDescription className="text-center">Clique sur les syllabes pour les entendre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <SyllableTable title="Tableau de syllabes avec le son [p] :" data={tableP} />
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
