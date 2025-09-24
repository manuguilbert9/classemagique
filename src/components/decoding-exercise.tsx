
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DecodingLevel1 } from './decoding/decoding-level1';
import { DecodingLevel2 } from './decoding/decoding-level2';
import { DecodingLevel3 } from './decoding/decoding-level3';
import { DecodingLevelBD } from './decoding/decoding-level-bd';
import { DecodingLevelFV } from './decoding/decoding-level-fv';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

type Level = 1 | 2 | 3 | 'bd' | 'fv';

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
      case 'bd':
        return <DecodingLevelBD />;
      case 'fv':
        return <DecodingLevelFV />;
      default:
        return null;
    }
  };

  if (selectedLevel) {
    return (
        <div>
            <Button onClick={() => setSelectedLevel(null)} variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour au choix de la session
            </Button>
            {renderLevel()}
        </div>
    );
  }


  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Exercice de Décodage</CardTitle>
        <CardDescription className="text-center">Choisis une session pour commencer l'entraînement.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4 justify-center p-8">
        <Button onClick={() => setSelectedLevel(1)} className="h-24 text-xl w-full">
          Syllabes simples
        </Button>
        <Button onClick={() => setSelectedLevel(2)} className="h-24 text-xl w-full">
          Mots à deux syllabes
        </Button>
         <Button onClick={() => setSelectedLevel(3)} className="h-24 text-xl w-full">
          Mots à trois syllabes
        </Button>
         <Button onClick={() => setSelectedLevel('bd')} className="h-24 text-xl w-full">
          Confusion b / d
        </Button>
         <Button onClick={() => setSelectedLevel('fv')} className="h-24 text-xl w-full">
          Confusion f / v
        </Button>
      </CardContent>
    </Card>
  );
}
