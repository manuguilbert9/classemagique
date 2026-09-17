'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { PasseComposeSettings } from '@/lib/questions';
import { Loader2 } from 'lucide-react';

interface PasseComposeSettingsProps {
  onStart: (settings: PasseComposeSettings) => void;
  isLoading?: boolean;
}

export function PasseComposeSettings({ onStart, isLoading }: PasseComposeSettingsProps) {
  const [auxiliaries, setAuxiliaries] = useState<('avoir' | 'etre')[]>(['avoir', 'etre']);
  const [groups, setGroups] = useState<('1er' | '2eme' | '3eme')[]>(['1er']);
  const [answerMode, setAnswerMode] = useState<'qcm' | 'text'>('qcm');

  const handleSubmit = () => {
    if (auxiliaries.length === 0 || groups.length === 0) return;
    onStart({ auxiliaries, groups, answerMode });
  };

  const handleAuxiliaryChange = (value: 'avoir' | 'etre') => {
    setAuxiliaries(prev =>
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    );
  };

  const handleGroupChange = (value: '1er' | '2eme' | '3eme') => {
    setGroups(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
    );
  };

  const unavailableCombination = auxiliaries.length === 1 && auxiliaries[0] === 'etre' && groups.length === 1 && groups[0] === '2eme';
  const isFormValid = auxiliaries.length > 0 && groups.length > 0 && !unavailableCombination;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Paramètres de l'exercice</CardTitle>
        <CardDescription className="text-center">Choisis les options pour générer des phrases au passé composé.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-8">

        <div className="space-y-4">
          <Label className="text-lg font-bold">Auxiliaires</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="aux-avoir" checked={auxiliaries.includes('avoir')} onCheckedChange={() => handleAuxiliaryChange('avoir')} />
              <Label htmlFor="aux-avoir" className="font-normal">Avoir</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="aux-etre" checked={auxiliaries.includes('etre')} onCheckedChange={() => handleAuxiliaryChange('etre')} />
              <Label htmlFor="aux-etre" className="font-normal">Être</Label>
            </div>
          </div>
          {auxiliaries.length === 0 && <p className="text-red-500 text-sm">Veuillez sélectionner au moins un auxiliaire.</p>}
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-bold">Groupes de verbes</Label>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <Checkbox id="grp-1" checked={groups.includes('1er')} onCheckedChange={() => handleGroupChange('1er')} />
              <Label htmlFor="grp-1" className="font-normal">1er groupe (-er)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="grp-2" checked={groups.includes('2eme')} onCheckedChange={() => handleGroupChange('2eme')} />
              <Label htmlFor="grp-2" className="font-normal">2ème groupe (-ir)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="grp-3" checked={groups.includes('3eme')} onCheckedChange={() => handleGroupChange('3eme')} />
              <Label htmlFor="grp-3" className="font-normal">3ème groupe (irréguliers)</Label>
            </div>
          </div>
          {groups.length === 0 && <p className="text-red-500 text-sm">Veuillez sélectionner au moins un groupe de verbes.</p>}
          {unavailableCombination && <p role="alert" className="text-sm">Les verbes simples du deuxième groupe proposés ici utilisent avoir. Choisis aussi avoir, ou un autre groupe.</p>}
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-bold">Mode de réponse</Label>
          <RadioGroup value={answerMode} onValueChange={(value) => setAnswerMode(value as 'qcm' | 'text')} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="qcm" id="mode-qcm" />
              <Label htmlFor="mode-qcm" className="font-normal">Choix multiple (QCM)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="text" id="mode-text" />
              <Label htmlFor="mode-text" className="font-normal">Écrire au clavier</Label>
            </div>
          </RadioGroup>
        </div>

      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} size="lg" className="w-full text-xl py-7" disabled={!isFormValid || isLoading}>
          {isLoading ? <><Loader2 className="mr-2 animate-spin" /> Génération des phrases...</> : "Commencer l'exercice !"}
        </Button>
      </CardFooter>
    </Card>
  );
}
