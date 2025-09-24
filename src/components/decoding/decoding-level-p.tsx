'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const wordsData = [
    { word: 'jupe', syllables: ['ju', 'pe'], silent: '' },
    { word: 'pile', syllables: ['pi', 'le'], silent: '' },
    { word: 'petit', syllables: ['pe', 'ti'], silent: 't' },
    { word: 'purée', syllables: ['pu', 'rée'], silent: '' },
    { word: 'repas', syllables: ['re', 'pa'], silent: 's' },
    { word: 'tapis', syllables: ['ta', 'pi'], silent: 's' },
    { word: 'tape', syllables: ['ta', 'pe'], silent: '' },
    { word: 'Paris', syllables: ['Pa', 'ri'], silent: 's' },
    { word: 'passe', syllables: ['pas', 'se'], silent: '' },
    { word: 'nappe', syllables: ['nap', 'pe'], silent: '' },
    { word: 'patate', syllables: ['pa', 'ta', 'te'], silent: '' },
    { word: 'pirate', syllables: ['pi', 'ra', 'te'], silent: '' },
    { word: 'piano', syllables: ['pia', 'no'], silent: '' },
    { word: 'pyjama', syllables: ['py', 'ja', 'ma'], silent: '' },
    { word: 'tulipe', syllables: ['tu', 'li', 'pe'], silent: '' },
];


export function DecodingLevelP() {
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
        <CardDescription className="text-center">Clique sur les syllabes et les mots pour les entendre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <SyllableTable title="Tableau de syllabes avec le son [p] :" data={tableP} />
        <div className="space-y-4">
            <h4 className="font-semibold">Je lis des mots :</h4>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {wordsData.map(({ word, syllables, silent }, index) => (
                    <Button key={`${word}-${index}`} onClick={() => handleSpeak(word)} variant="outline" className="h-auto justify-start text-2xl p-4">
                        <span className="text-blue-600">{syllables[0]}</span>
                        <span className="text-red-600">{syllables[1]}</span>
                        {syllables[2] && <span className="text-blue-600">{syllables[2]}</span>}
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
