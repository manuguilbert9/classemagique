'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { type NumberLevelSettings } from '@/lib/questions';
import { type SkillLevel } from '@/lib/skills';

interface ChangeMakingSettingsProps {
  onStart: (settings: NumberLevelSettings) => void;
}

const difficultyDesc = [
  "Niveau B : Prix ronds sans cents, monnaie simple avec un seul billet",
  "Niveau C : Prix avec 50 cents, plusieurs billets possibles",
  "Niveau D : Tous les cents, grandes coupures (20€, 50€)",
];

const difficultyLevels: SkillLevel[] = ['B', 'C', 'D'];

export function ChangeMakingSettings({ onStart }: ChangeMakingSettingsProps) {
  const [difficulty, setDifficulty] = useState(0);

  const handleSubmit = () => {
    onStart({ level: difficultyLevels[difficulty] });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Rendre la Monnaie</CardTitle>
        <CardDescription className="text-center">Choisis le niveau de difficulté pour apprendre à rendre la monnaie.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-10 p-8">
        <div className="space-y-4">
          <Label htmlFor="difficulty" className="text-lg">Niveau de Difficulté</Label>
          <Slider
            id="difficulty"
            min={0}
            max={2}
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
