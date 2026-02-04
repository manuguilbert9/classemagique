'use client';

import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Play, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// ========================
// CONSTANTS
// ========================

const COLORS: Record<string, { name: string; hex: string; textColor: string }> = {
  rouge: { name: 'Rouge', hex: '#EF4444', textColor: 'white' },
  bleu: { name: 'Bleu', hex: '#3B82F6', textColor: 'white' },
  vert: { name: 'Vert', hex: '#22C55E', textColor: 'white' },
  jaune: { name: 'Jaune', hex: '#EAB308', textColor: 'black' },
  orange: { name: 'Orange', hex: '#F97316', textColor: 'white' },
  violet: { name: 'Violet', hex: '#8B5CF6', textColor: 'white' },
  noir: { name: 'Noir', hex: '#1F2937', textColor: 'white' },
  blanc: { name: 'Blanc', hex: '#F9FAFB', textColor: 'black' },
  marron: { name: 'Marron', hex: '#92400E', textColor: 'white' },
  rose: { name: 'Rose', hex: '#EC4899', textColor: 'white' },
};

const COLOR_KEYS = Object.keys(COLORS);

type AlgorithmType = 'AB' | 'ABC' | 'ABBC' | 'ABCD' | 'ABAC' | 'ABABC' | 'AABBCC' | 'ABCB';

interface AlgorithmDefinition {
  id: AlgorithmType;
  label: string;
  pattern: string; // e.g., "ABABAB" for display
  letters: string[]; // e.g., ['A', 'B'] for the unique letters
  sequence: string[]; // e.g., ['A', 'B', 'A', 'B', 'A', 'B'] for one cycle
}

const ALGORITHMS: AlgorithmDefinition[] = [
  { id: 'AB', label: 'A-B-A-B', pattern: 'ABABAB', letters: ['A', 'B'], sequence: ['A', 'B'] },
  { id: 'ABC', label: 'A-B-C', pattern: 'ABCABC', letters: ['A', 'B', 'C'], sequence: ['A', 'B', 'C'] },
  { id: 'ABBC', label: 'A-B-B-C', pattern: 'ABBCABBC', letters: ['A', 'B', 'C'], sequence: ['A', 'B', 'B', 'C'] },
  { id: 'ABCD', label: 'A-B-C-D', pattern: 'ABCDABCD', letters: ['A', 'B', 'C', 'D'], sequence: ['A', 'B', 'C', 'D'] },
  { id: 'ABAC', label: 'A-B-A-C', pattern: 'ABACABAC', letters: ['A', 'B', 'C'], sequence: ['A', 'B', 'A', 'C'] },
  { id: 'ABABC', label: 'A-B-A-B-C', pattern: 'ABABCABABC', letters: ['A', 'B', 'C'], sequence: ['A', 'B', 'A', 'B', 'C'] },
  { id: 'AABBCC', label: 'A-A-B-B-C-C', pattern: 'AABBCCAABBCC', letters: ['A', 'B', 'C'], sequence: ['A', 'A', 'B', 'B', 'C', 'C'] },
  { id: 'ABCB', label: 'A-B-C-B', pattern: 'ABCBABCB', letters: ['A', 'B', 'C'], sequence: ['A', 'B', 'C', 'B'] },
];

type HintMode = 'none' | 'highlight' | 'opaque';

const HINT_MODES: { id: HintMode; label: string; description: string }[] = [
  { id: 'none', label: 'Aucune aide', description: '' },
  { id: 'highlight', label: 'Indication couleur', description: 'Surbrillance de la bonne couleur à sélectionner' },
  { id: 'opaque', label: 'Algorithme complet visible', description: "Affichage de l'algorithme complet avec indicateur de position" },
];

const REPETITION_OPTIONS = [2, 3, 4, 5];

// ========================
// UTILITY FUNCTIONS
// ========================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandomColors(count: number): string[] {
  const shuffled = shuffleArray(COLOR_KEYS);
  return shuffled.slice(0, count);
}

// ========================
// COMPONENT
// ========================

export function ColorAlgorithmExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  // Setup state
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('AB');
  const [repetitions, setRepetitions] = useState(3);
  const [hintMode, setHintMode] = useState<HintMode>('highlight');
  const [reducedColors, setReducedColors] = useState(false);

  // Game state
  const [colorMapping, setColorMapping] = useState<Record<string, string>>({});
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [completedSeries, setCompletedSeries] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

  // Get the current algorithm definition
  const currentAlgorithm = useMemo(
    () => ALGORITHMS.find((a) => a.id === selectedAlgorithm) || ALGORITHMS[0],
    [selectedAlgorithm]
  );

  // Available colors for the palette (all or just mapping, shuffled when reduced)
  const availableColors = useMemo(() => {
    if (reducedColors && Object.keys(colorMapping).length > 0) {
      // Shuffle the reduced colors so they're not in algorithm order
      return shuffleArray(Object.values(colorMapping));
    }
    return COLOR_KEYS;
  }, [reducedColors, colorMapping]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  // Generate the full target sequence based on algorithm and repetitions
  const generateTargetSequence = useCallback(
    (algo: AlgorithmDefinition, reps: number, mapping: Record<string, string>) => {
      const sequence: string[] = [];
      for (let i = 0; i < reps; i++) {
        for (const letter of algo.sequence) {
          sequence.push(mapping[letter]);
        }
      }
      return sequence;
    },
    []
  );

  // Start the game
  const startGame = useCallback(() => {
    const algo = ALGORITHMS.find((a) => a.id === selectedAlgorithm) || ALGORITHMS[0];
    const colors = pickRandomColors(algo.letters.length);
    const mapping: Record<string, string> = {};
    algo.letters.forEach((letter, index) => {
      mapping[letter] = colors[index];
    });

    setColorMapping(mapping);
    const seq = generateTargetSequence(algo, repetitions, mapping);
    setTargetSequence(seq);
    setUserSequence([]);
    setCompletedSeries(0);
    setErrors(0);
    setFeedback(null);
    setStartTime(Date.now());
    setElapsedTime(0);
    setHasBeenSaved(false);
    setSessionDetails([]);
    setGameState('playing');
  }, [selectedAlgorithm, repetitions, generateTargetSequence]);

  // Handle color click
  const handleColorClick = useCallback(
    (colorKey: string) => {
      if (feedback) return; // Ignore clicks during feedback

      const nextIndex = userSequence.length;
      const expectedColor = targetSequence[nextIndex];

      if (colorKey === expectedColor) {
        // Correct
        const newUserSequence = [...userSequence, colorKey];
        setUserSequence(newUserSequence);
        setFeedback('correct');

        setTimeout(() => {
          setFeedback(null);

          // Check if completed all
          if (newUserSequence.length === targetSequence.length) {
            // All done!
            setCompletedSeries((prev) => prev + 1);
            setSessionDetails((prev) => [
              ...prev,
              {
                question: `Série ${currentAlgorithm.pattern}`,
                userAnswer: 'Complété',
                correctAnswer: 'Complété',
                status: 'correct',
              },
            ]);
            setGameState('finished');
          }
        }, 300);
      } else {
        // Incorrect - just count the error, don't reset progress
        setFeedback('incorrect');
        setErrors((prev) => prev + 1);

        setTimeout(() => {
          setFeedback(null);
          // Do NOT reset userSequence - keep the progress
        }, 600);
      }
    },
    [userSequence, targetSequence, feedback, currentAlgorithm]
  );

  // Clear user sequence
  const handleClear = useCallback(() => {
    setUserSequence([]);
    setFeedback(null);
  }, []);

  // Save result
  useEffect(() => {
    const saveResult = async () => {
      if (gameState === 'finished' && student && !hasBeenSaved) {
        setHasBeenSaved(true);
        const score = Math.max(0, 100 - errors * 10);

        if (isHomework && homeworkDate) {
          await saveHomeworkResult({
            userId: student.id,
            date: homeworkDate,
            skillSlug: 'color-algorithm',
            score: score,
          });
        } else {
          await addScore({
            userId: student.id,
            skill: 'color-algorithm',
            score: score,
            details: sessionDetails,
          });
        }
      }
    };
    saveResult();
  }, [gameState, student, hasBeenSaved, errors, sessionDetails, isHomework, homeworkDate]);

  // ========================
  // RENDER
  // ========================

  const renderSetup = () => (
    <div className="w-full max-w-xl mx-auto space-y-8">
      <h3 className="text-2xl font-bold text-center mb-6">Configure ton exercice</h3>

      {/* Algorithm selection */}
      <div className="space-y-2">
        <Label htmlFor="algorithm">Type d&apos;algorithme</Label>
        <Select value={selectedAlgorithm} onValueChange={(v) => setSelectedAlgorithm(v as AlgorithmType)}>
          <SelectTrigger id="algorithm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALGORITHMS.map((algo) => (
              <SelectItem key={algo.id} value={algo.id}>
                {algo.label} <span className="text-muted-foreground ml-2">({algo.pattern})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Repetitions */}
      <div className="space-y-2">
        <Label htmlFor="repetitions">Nombre de répétitions</Label>
        <Select value={String(repetitions)} onValueChange={(v) => setRepetitions(Number(v))}>
          <SelectTrigger id="repetitions">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REPETITION_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} répétitions
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hint mode */}
      <div className="space-y-2">
        <Label htmlFor="hintMode">Mode d&apos;aide</Label>
        <Select value={hintMode} onValueChange={(v) => setHintMode(v as HintMode)}>
          <SelectTrigger id="hintMode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HINT_MODES.map((mode) => (
              <SelectItem key={mode.id} value={mode.id}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hintMode !== 'none' && (
          <p className="text-sm text-muted-foreground">
            {HINT_MODES.find((m) => m.id === hintMode)?.description}
          </p>
        )}
      </div>

      {/* Reduced colors toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div>
          <Label htmlFor="reducedColors" className="text-base font-medium">
            Couleurs réduites
          </Label>
          <p className="text-sm text-muted-foreground">
            Affiche uniquement les couleurs utilisées dans l&apos;algorithme
          </p>
        </div>
        <Switch id="reducedColors" checked={reducedColors} onCheckedChange={setReducedColors} />
      </div>

      {/* Start button */}
      <Button onClick={startGame} size="lg" className="w-full text-xl py-6 rounded-xl">
        <Play className="mr-2 h-6 w-6" />
        C&apos;est parti !
      </Button>
    </div>
  );

  // Get one cycle of the algorithm for example display
  const exampleCycle = useMemo(() => {
    if (Object.keys(colorMapping).length === 0) return [];
    return currentAlgorithm.sequence.map((letter) => colorMapping[letter]);
  }, [colorMapping, currentAlgorithm]);

  const renderPlaying = () => {
    const nextExpectedColor = targetSequence[userSequence.length];

    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Timer and progress */}
        <div className="flex justify-between items-center text-lg">
          <span className="font-mono text-muted-foreground">
            ⏱️ {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-muted-foreground">
            {userSequence.length} / {targetSequence.length}
          </span>
        </div>

        {/* ALWAYS show example: one cycle of the algorithm */}
        <div className="p-4 bg-primary/10 rounded-xl">
          <span className="text-sm text-primary font-medium block text-center mb-3">🔄 Modèle à reproduire :</span>
          <div className="flex gap-2 justify-center">
            {exampleCycle.map((colorKey, index) => (
              <div
                key={index}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-md border-2 border-primary/30"
                style={{ backgroundColor: COLORS[colorKey]?.hex || '#ccc' }}
              />
            ))}
          </div>
        </div>

        {/* Opaque hint: show full algorithm with position indicator */}
        {hintMode === 'opaque' && (
          <div className="p-4 bg-muted/20 rounded-xl overflow-x-auto">
            <span className="text-sm text-muted-foreground block text-center mb-2">Série complète :</span>
            <div className="flex gap-2 justify-start min-w-max">
              {targetSequence.map((colorKey, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-8 h-8 rounded-md border-2 flex-shrink-0',
                    index < userSequence.length ? 'opacity-40' : 'opacity-80'
                  )}
                  style={{
                    backgroundColor: COLORS[colorKey]?.hex || '#ccc',
                    borderColor: index === userSequence.length ? '#000' : 'transparent',
                    boxShadow: index === userSequence.length ? '0 0 0 3px rgba(0,0,0,0.3)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* User built sequence - shrinkable squares, then scroll */}
        <div
          className={cn(
            'min-h-[80px] p-4 rounded-xl border-2 transition-all flex items-center justify-center',
            feedback === 'correct' ? 'border-green-500 bg-green-50' : '',
            feedback === 'incorrect' ? 'border-red-500 bg-red-50' : '',
            !feedback ? 'border-muted bg-muted/10' : ''
          )}
        >
          {userSequence.length === 0 ? (
            <span className="text-muted-foreground text-lg w-full text-center">Clique sur les couleurs pour construire ta série</span>
          ) : (
            <div className="flex gap-1 sm:gap-2 items-center w-full justify-center overflow-x-auto">
              {userSequence.map((colorKey, index) => {
                // Calculate size: start at 48px, shrink based on count, min 24px
                const baseSize = Math.max(24, Math.min(48, Math.floor(400 / userSequence.length)));
                return (
                  <div
                    key={index}
                    className="rounded-lg shadow-md animate-in zoom-in duration-200 flex-shrink-0"
                    style={{
                      backgroundColor: COLORS[colorKey]?.hex || '#ccc',
                      width: `${baseSize}px`,
                      height: `${baseSize}px`,
                    }}
                  />
                );
              })}
              {feedback === 'correct' && <Check className="h-6 w-6 text-green-600 ml-1 flex-shrink-0" />}
              {feedback === 'incorrect' && <X className="h-6 w-6 text-red-600 ml-1 flex-shrink-0" />}
            </div>
          )}
        </div>

        {/* Color palette */}
        <div className="grid grid-cols-5 gap-3 sm:gap-4">
          {availableColors.map((colorKey) => {
            const color = COLORS[colorKey];
            if (!color) return null;

            const isHinted = hintMode === 'highlight' && colorKey === nextExpectedColor;

            return (
              <button
                key={colorKey}
                onClick={() => handleColorClick(colorKey)}
                disabled={!!feedback}
                className={cn(
                  'aspect-square rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2',
                  isHinted ? 'ring-4 ring-primary ring-offset-2 scale-105' : '',
                  feedback ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            );
          })}
        </div>

        {/* Clear button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleClear} disabled={userSequence.length === 0 || !!feedback}>
            <Trash2 className="mr-2 h-4 w-4" />
            Effacer
          </Button>
        </div>
      </div>
    );
  };

  const renderFinished = () => (
    <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-4xl font-bold text-primary">Bravo !</h2>
      <p className="text-xl text-muted-foreground">Tu as complété l&apos;algorithme {currentAlgorithm.label}</p>

      <div className="py-8 bg-muted/20 rounded-xl max-w-sm mx-auto space-y-4">
        <div>
          <p className="text-lg text-muted-foreground">Temps</p>
          <p className="text-4xl font-bold text-primary">
            {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div>
          <p className="text-lg text-muted-foreground">Erreurs</p>
          <p className={cn('text-4xl font-bold', errors === 0 ? 'text-green-600' : 'text-orange-500')}>{errors}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button onClick={() => setGameState('setup')} size="lg" variant="outline" className="text-lg px-8 h-16">
          <RefreshCw className="mr-2 h-5 w-5" />
          Changer les options
        </Button>
        <Button onClick={startGame} size="lg" className="text-lg px-8 h-16">
          <Play className="mr-2 h-5 w-5" />
          Rejouer
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-2">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-center text-3xl font-headline">Algorithmes de couleurs</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[500px] flex flex-col justify-center items-center p-4 sm:p-8">
        {gameState === 'setup' && renderSetup()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'finished' && renderFinished()}
      </CardContent>
    </Card>
  );
}
