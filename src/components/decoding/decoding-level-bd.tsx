
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

const syllablePronunciationMap: { [key: string]: string } = {
  bo: "beau", do: "dos", ba: "bas", da: "das",
  be: "beu", de: "de", bi: "bie", di: "die",
  bu: "bue", du: "due", by: "bi", dy: "di",
};

const SyllableTable = ({ title, data, colored = false }: { title: string, data: string[][], colored?: boolean }) => {
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
        
        const textToSpeak = `${text}.`;

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0;
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="space-y-2">
             <h4 className="font-semibold">{title}</h4>
             <div className="flex gap-4 p-4 border rounded-md justify-center">
                {data.map((letter, index) => (
                    <span key={index} className="text-3xl font-bold cursor-pointer" onClick={() => handleSpeak(letter)}>{letter}</span>
                ))}
             </div>
        </div>
    )
}

const tableB = [
  ['ba', 'be', 'bi', 'bo', 'bu', 'by'],
  ['by', 'ba', 'bu', 'be', 'bo', 'bi'],
  ['bu', 'bi', 'bo', 'ba', 'by', 'be'],
  ['be', 'bo', 'by', 'bu', 'bi', 'ba'],
];

const tableD = [
  ['da', 'de', 'di', 'do', 'du', 'dy'],
  ['dy', 'da', 'du', 'de', 'do', 'di'],
  ['du', 'di', 'do', 'da', 'dy', 'de'],
  ['de', 'do', 'dy', 'du', 'di', 'da'],
];

const lineBD = ['d', 'd', 'b', 'b', 'd', 'd', 'b', 'b', 'd', 'b'];

const tableBD = [
  ['da', 'be', 'di', 'bo', 'bu', 'dy'],
  ['by', 'da', 'bu', 'de', 'do', 'bi'],
  ['du', 'bi', 'do', 'ba', 'dy', 'be'],
  ['be', 'do', 'by', 'du', 'di', 'ba'],
];

const realWordsLvlBD1 = [
    { word: 'vide', syllables: ['vi', 'de'], silent: '' },
    { word: 'radis', syllables: ['ra', 'di'], silent: 's' },
    { word: 'robot', syllables: ['ro', 'bo'], silent: 't' },
    { word: 'balle', syllables: ['bal', 'le'], silent: '' },
    { word: 'dame', syllables: ['da', 'me'], silent: '' },
    { word: 'Dora', syllables: ['Do', 'ra'], silent: '' },
    { word: 'barre', syllables: ['bar', 're'], silent: '' },
];

const realWordsLvlBD2 = [
    { word: 'salade', syllables: ['sa', 'la', 'de'], silent: '' },
    { word: 'malade', syllables: ['ma', 'la', 'de'], silent: '' },
    { word: 'timide', syllables: ['ti', 'mi', 'de'], silent: '' },
    { word: 'banane', syllables: ['ba', 'na', 'ne'], silent: '' },
    { word: 'rapide', syllables: ['ra', 'pi', 'de'], silent: '' },
    { word: 'lavabo', syllables: ['la', 'va', 'bo'], silent: '' },
    { word: 'bobine', syllables: ['bo', 'bi', 'ne'], silent: '' },
    { word: 'bassine', syllables: ['bas', 'si', 'ne'], silent: '' },
    { word: 'défile', syllables: ['dé', 'fi', 'le'], silent: '' },
    { word: 'dévale', syllables: ['dé', 'va', 'le'], silent: '' },
    { word: 'solide', syllables: ['so', 'li', 'de'], silent: '' },
    { word: 'adore', syllables: ['a', 'do', 're'], silent: '' },
    { word: 'débute', syllables: ['dé', 'bu', 'te'], silent: '' },
    { word: 'abime', syllables: ['a', 'bi', 'me'], silent: '' },
    { word: 'domino', syllables: ['do', 'mi', 'no'], silent: '' },
    { word: 'pédale', syllables: ['pé', 'da', 'le'], silent: '' },
];


export function DecodingLevelBD() {
  const { student } = React.useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');
  const { toast } = useToast();
  const [hasBeenSaved, setHasBeenSaved] = React.useState(false);

  const handleSpeak = (text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    
    const textToSpeak = syllablePronunciationMap[text.toLowerCase()] || `${text}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
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
                question: 'Niveau Spécial b/d',
                userAnswer: `Exercice terminé`,
                correctAnswer: 'Exercice terminé',
                status: 'completed'
            }],
            // We use 'B' as a proxy for this special level as it's not in the regular A-D progression
            numberLevelSettings: { level: 'B' }
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
        <CardTitle className="font-headline text-3xl text-center">Niveau Spécial : Confusion b/d</CardTitle>
        <CardDescription className="text-center">Clique sur les lettres et les syllabes pour les entendre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <SyllableTable title="Tableau de syllabes avec la lettre b :" data={tableB} />
        <SyllableTable title="Tableau de syllabes avec la lettre d :" data={tableD} />
        <LetterLine title="Ligne de b ou d :" data={lineBD} />
        <SyllableTable title="Tableau de syllabes avec les lettres b et d :" data={tableBD} colored />
        <SyllableTable title="Tableau de syllabes avec les lettres b et d (sans aide) :" data={tableBD} />
        
        <div className="space-y-4">
            <h4 className="font-semibold">Je lis des mots :</h4>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {realWordsLvlBD1.map(({ word, syllables, silent }, index) => (
                    <Button key={`${word}-${index}`} onClick={() => handleSpeak(word)} variant="outline" className="h-auto justify-start text-2xl p-4">
                        <span className="text-blue-600">{syllables[0]}</span>
                        <span className="text-red-600">{syllables[1]}</span>
                        {syllables[2] && <span className="text-blue-600">{syllables[2]}</span>}
                        {silent && <span className="text-gray-400">{silent}</span>}
                    </Button>
                ))}
            </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {realWordsLvlBD2.map(({ word, syllables, silent }, index) => (
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
