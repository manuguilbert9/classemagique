
'use client';

import Link from 'next/link';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getSkillBySlug, categoryStyles } from '@/lib/skills';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseWorkspace } from '@/components/exercise-workspace';
import { LongCalculationExercise } from '@/components/long-calculation-exercise';
import { WordFamiliesExercise } from '@/components/word-families-exercise';
import { MentalCalculationExercise } from '@/components/mental-calculation-exercise';
import { CalendarExercise } from '@/components/calendar-exercise';
import { SentenceReadingExercise } from '@/components/sentence-reading-exercise';
import { SimpleWordReadingExercise } from '@/components/simple-word-reading-exercise';
import { WritingNotebook } from '@/components/writing-notebook';
import { KeyboardCopyExercise } from '@/components/keyboard-copy-exercise';
import { SommeDixExercise } from '@/components/somme-dix-exercise';
import { LetterRecognitionExercise } from '@/components/letter-recognition-exercise';
import { ReadingDirectionExercise } from '@/components/reading-direction-exercise';
import { ComplementDixExercise } from '@/components/complement-dix-exercise';
import { SonAnExercise } from '@/components/son-an-exercise';
import { SonInExercise } from '@/components/son-in-exercise';
import { NombresComplexesExercise } from '@/components/nombres-complexes-exercise';
import { LettresEtSonsExercise } from '@/components/lettres-et-sons-exercise';
import { FluenceExercise } from '@/components/fluence-exercise';
import { PhraseConstructionExercise } from '@/components/phrase-construction-exercise';
import { CodedPathExercise } from '@/components/coded-path-exercise';
import { LabelGameExercise } from '@/components/label-game-exercise';
import { FullscreenToggle } from '@/components/fullscreen-toggle';
import { SpellingExercise } from '@/components/spelling-exercise';
import { AdaptiveMentalCalculationExercise } from '@/components/adaptive-mental-calculation-exercise';
import { SyllableTableExercise } from '@/components/syllable-table-exercise';
import { DecodingExercise } from '@/components/decoding-exercise';
import { MysteryNumberExercise } from '@/components/mystery-number-exercise';
import { MbpRuleExercise } from '@/components/mbp-rule-exercise';
import { PlaceValueTableExercise } from '@/components/place-value-table-exercise';
import { SubtractionTrainingExercise } from '@/components/subtraction-training-exercise';
import { NounIdentificationExercise } from '@/components/noun-identification-exercise';
import { AdjectiveIdentificationExercise } from '@/components/adjective-identification-exercise';
import { FleaMarketExercise } from '@/components/flea-market-exercise';
import { SumCompositionExercise } from '@/components/sum-composition-exercise';
import { cn } from '@/lib/utils';

export default function ExercisePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const skillSlug = typeof params.skill === 'string' ? params.skill : '';
  const from = searchParams.get('from');

  const skill = getSkillBySlug(skillSlug);

  if (!skill) {
    notFound();
  }

  const style = categoryStyles[skill.category] || { bg: 'bg-gray-200', text: 'text-gray-800' };
  const returnHref = from === 'devoirs' ? '/devoirs' : '/en-classe';

  const renderExercise = () => {
    let exerciseComponent;
    switch (skill.slug) {
      case 'somme-dix':
        exerciseComponent = <SommeDixExercise />;
        break;
      case 'long-calculation':
        exerciseComponent = <LongCalculationExercise />;
        break;
      case 'word-families':
        exerciseComponent = <WordFamiliesExercise />;
        break;
      case 'mental-calculation':
        exerciseComponent = <MentalCalculationExercise />;
        break;
      case 'adaptive-mental-calculation':
        exerciseComponent = <AdaptiveMentalCalculationExercise />;
        break;
      case 'calendar':
        exerciseComponent = <CalendarExercise />;
        break;
      case 'lire-des-phrases':
        exerciseComponent = <SentenceReadingExercise />;
        break;
      case 'fluence':
        exerciseComponent = <FluenceExercise />;
        break;
      case 'simple-word-reading':
        exerciseComponent = <SimpleWordReadingExercise />;
        break;
      case 'writing-notebook':
        exerciseComponent = <WritingNotebook />;
        break;
      case 'keyboard-copy':
        exerciseComponent = <KeyboardCopyExercise />;
        break;
      case 'letter-recognition':
        exerciseComponent = <LetterRecognitionExercise />;
        break;
      case 'reading-direction':
        exerciseComponent = <ReadingDirectionExercise />;
        break;
      case 'complement-dix':
        exerciseComponent = <ComplementDixExercise />;
        break;
      case 'son-an':
        exerciseComponent = <SonAnExercise />;
        break;
      case 'son-in':
        exerciseComponent = <SonInExercise />;
        break;
      case 'nombres-complexes':
        exerciseComponent = <NombresComplexesExercise />;
        break;
      case 'lettres-et-sons':
        exerciseComponent = <LettresEtSonsExercise />;
        break;
      case 'spelling':
        // The /spelling/[id] page handles specific exercises, but this renders the selector.
        exerciseComponent = <SpellingExercise exerciseId="" onFinish={() => { }} />;
        break;
      case 'phrase-construction':
        exerciseComponent = <PhraseConstructionExercise />;
        break;
      case 'label-game':
        exerciseComponent = <LabelGameExercise />;
        break;
      case 'reperer-nom':
        exerciseComponent = <NounIdentificationExercise />;
        break;
      case 'reperer-adjectif':
        exerciseComponent = <AdjectiveIdentificationExercise />;
        break;
      case 'flea-market':
        exerciseComponent = <FleaMarketExercise />;
        break;
      case 'composition-somme':
        exerciseComponent = <SumCompositionExercise />;
        break;
      case 'coded-path':
        exerciseComponent = <CodedPathExercise />;
        break;
      case 'syllable-table':
        exerciseComponent = <SyllableTableExercise />;
        break;
      case 'decoding':
        exerciseComponent = <DecodingExercise />;
        break;
      case 'mystery-number':
        exerciseComponent = <MysteryNumberExercise />;
        break;
      case 'regle-mbp':
        exerciseComponent = <MbpRuleExercise />;
        break;
      case 'place-value-table':
        exerciseComponent = <PlaceValueTableExercise />;
        break;
      case 'subtraction-training':
        exerciseComponent = <SubtractionTrainingExercise />;
        break;
      case 'denombrement':
      case 'time':
      case 'lire-les-nombres':
      case 'ecoute-les-nombres':
      case 'syllabe-attaque':
      case 'currency':
      default:
        exerciseComponent = <ExerciseWorkspace skill={skill} />;
    }
    // Wrap every exercise component in a Card with the correct style
    return <div className={cn("rounded-lg p-0.5", style.bg, style.text === 'text-white' ? 'text-white' : 'text-gray-800')}><div className="bg-background rounded-md">{exerciseComponent}</div></div>;
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="relative flex items-center justify-between mb-8">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href={returnHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="sm:hidden">
            <Link href={returnHref} aria-label="Retour">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Card className={cn("flex-grow mx-4 sm:mx-8", style.bg, style.text)}>
            <CardHeader className="flex flex-row items-center justify-center space-x-4 p-4">
              <div className="[&>svg]:h-12 [&>svg]:w-12">{skill.icon}</div>
              <CardTitle className="font-exercise text-4xl">{skill.name}</CardTitle>
            </CardHeader>
          </Card>
          <div className="w-10 sm:w-[150px] flex justify-end">
            <FullscreenToggle />
          </div>
        </header>

        <main>
          {renderExercise()}
        </main>
      </div>
    </div>
  );
}
