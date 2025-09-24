
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DecodingLevel1 } from './decoding/decoding-level1';
import { DecodingLevel2 } from './decoding/decoding-level2';
import { DecodingLevel3 } from './decoding/decoding-level3';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

type Level = 1 | 2 | 3;

export function DecodingExercise() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const renderLevel = () => {
    switch (selectedLevel) {
      case 1:
        return <DecodingLevel1 />;
      case 2:
        return <DecodingLevel2 />;
      case 3:
        return <DecodingLevel3 />;
      default:
        return null;
    }
  };

  if (selectedLevel) {
    return (
        <div>
            <Button onClick={() => setSelectedLevel(null)} variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour au choix du niveau
            </Button>
            {renderLevel()}
        </div>
    );
  }


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Exercice de Décodage</CardTitle>
        <CardDescription className="text-center">Choisis ton niveau pour commencer l'entraînement.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4 justify-center p-8">
        <Button onClick={() => setSelectedLevel(1)} className="h-24 text-xl w-full sm:w-64">
          Niveau 1
          <span className="block text-sm font-normal mt-1">Syllabes simples</span>
        </Button>
        <Button onClick={() => setSelectedLevel(2)} className="h-24 text-xl w-full sm:w-64">
          Niveau 2
          <span className="block text-sm font-normal mt-1">Mots à deux syllabes</span>
        </Button>
         <Button onClick={() => setSelectedLevel(3)} className="h-24 text-xl w-full sm:w-64">
          Niveau 3
          <span className="block text-sm font-normal mt-1">Mots à trois syllabes</span>
        </Button>
      </CardContent>
    </Card>
  );
}
