
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { TimeSettings as TimeSettingsType } from '@/lib/questions';

interface TimeSettingsProps {
  onStart: (settings: TimeSettingsType) => void;
}

const difficultyDesc = [
  "Niveau A : Guidage complet (cercle des minutes et couleurs)",
  "Niveau B : Aiguilles en couleur, sans fond coloré",
  "Niveau C : Introduction des heures de l'après-midi",
  "Niveau D : Maîtrise (sans cercle des minutes)",
];

interface TimeSettingsExtendedProps extends TimeSettingsProps {
  initialDifficulty?: number;
}

export function TimeSettings({ onStart, initialDifficulty = 0 }: TimeSettingsExtendedProps) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);

  const handleSubmit = () => {
    onStart({
      difficulty,
      // Level D (difficulty 3) should not show the minute circle.
      showMinuteCircle: difficulty < 3,
      // Only level A (difficulty 0) has color matching on background and numbers
      matchColors: difficulty === 0,
      // Level A and B have colored hands
      coloredHands: difficulty < 2,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Règle ton exercice sur l'heure</CardTitle>
        <CardDescription className="text-center">Choisis le niveau de difficulté de l'exercice.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-10 p-8">
        <div className="space-y-4">
          <Label htmlFor="difficulty" className="text-lg">Niveau de Difficulté</Label>
          <Slider
            id="difficulty"
            min={0}
            max={3}
            step={1}
            value={[difficulty]}
            onValueChange={(value) => setDifficulty(value[0])}
          />
          <p className="text-center text-muted-foreground font-medium">{difficultyDesc[difficulty]}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} size="lg" className="w-full text-xl py-7">
          Commencer l'exercice !
        </Button>
      </CardFooter>
    </Card>
  );
}
