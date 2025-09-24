'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
                  className={cn(
                    "border p-2 text-center text-2xl cursor-pointer hover:bg-muted",
                    colored && (cellIndex % 2 === 0 ? 'text-black' : 'text-red-600')
                  )}
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

export function DecodingLevelBD() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Niveau Spécial : Confusion b/d</CardTitle>
        <CardDescription className="text-center">Clique sur les lettres et les syllabes pour les entendre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SyllableTable title="Tableau de syllabes avec la lettre b :" data={tableB} />
        <SyllableTable title="Tableau de syllabes avec la lettre d :" data={tableD} />
        <LetterLine title="Ligne de b ou d :" data={lineBD} />
        <SyllableTable title="Tableau de syllabes avec les lettres b et d :" data={tableBD} colored />
        <SyllableTable title="Tableau de syllabes avec les lettres b et d (sans aide) :" data={tableBD} />
      </CardContent>
    </Card>
  );
}
