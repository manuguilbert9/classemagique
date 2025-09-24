
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DecodingLevel1 } from './decoding/decoding-level1';
import { DecodingLevel2 } from './decoding/decoding-level2';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

type Level = 1 | 2;

export function DecodingExercise() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  if (selectedLevel === 1) {
    return (
        <div>
            <Button onClick={() => setSelectedLevel(null)} variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour au choix du niveau
            </Button>
            <DecodingLevel1 />
        </div>
    );
  }
  
  if (selectedLevel === 2) {
      return (
        <div>
            <Button onClick={() => setSelectedLevel(null)} variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour au choix du niveau
            </Button>
            <DecodingLevel2 />
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
      </CardContent>
    </Card>
  );
}
