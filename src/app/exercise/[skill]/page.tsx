
'use client';

import { notFound, useParams, useSearchParams } from 'next/navigation';
import { getSkillBySlug, categoryStyles } from '@/lib/skills';
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
import { ExerciseBanner } from '@/components/exercise/exercise-banner';
import { DicteeExercise } from '@/components/dictee-exercise';
import { CopieCapitalesExercise } from '@/components/copie-capitales-exercise';
import { MotImageExercise } from '@/components/mot-image-exercise';
import { MontreImageExercise } from '@/components/montre-image-exercise';
import { ComptagePointageExercise } from '@/components/comptage-pointage-exercise';
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
import { WordProblemsExercise } from '@/components/word-problems-exercise';
import { AddAdjectivesExercise } from '@/components/add-adjectives-exercise';
import { JumbledWordsExercise } from '@/components/jumbled-words-exercise';
import { MentalSubtractionExercise } from '@/components/mental-subtraction-exercise';
import { MultiplicationTablesExercise } from '@/components/multiplication-tables-exercise';
import { ColorAlgorithmExercise } from '@/components/color-algorithm-exercise';
import { CategorySortingExercise } from '@/components/category-sorting-exercise';
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
        // La page /dictee/[sessionId] joue une séance précise ; ici, l'élève choisit la sienne.
        exerciseComponent = <DicteeExercise />;
        break;
      case 'copie-capitales':
        exerciseComponent = <CopieCapitalesExercise />;
        break;
      case 'mot-image':
        exerciseComponent = <MotImageExercise />;
        break;
      case 'montre-image':
        exerciseComponent = <MontreImageExercise />;
        break;
      case 'comptage-pointage':
        exerciseComponent = <ComptagePointageExercise />;
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
      case 'add-adjectives':
        exerciseComponent = <AddAdjectivesExercise />;
        break;
      case 'jumbled-words':
        exerciseComponent = <JumbledWordsExercise />;
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
      case 'soustraction-mentale':
        exerciseComponent = <MentalSubtractionExercise />;
        break;
      case 'tables-multiplication':
        exerciseComponent = <MultiplicationTablesExercise />;
        break;
      case 'color-algorithm':
        exerciseComponent = <ColorAlgorithmExercise />;
        break;
      case 'category-sorting':
        exerciseComponent = <CategorySortingExercise />;
        break;
      case 'problemes-transformation':
      case 'problemes-composition':
      case 'problemes-comparaison':
      case 'problemes-composition-transformation':
        exerciseComponent = <WordProblemsExercise />;
        break;
      case 'denombrement':
      case 'time':
      case 'lire-les-nombres':
      case 'ecoute-les-nombres':
      case 'syllabe-attaque':
      case 'currency':
      case 'passe-compose':
      default:
        exerciseComponent = <ExerciseWorkspace skill={skill} />;
    }
    // Un liseré à la couleur de la matière encadre l'exercice : il prolonge
    // le bandeau et raccroche l'écran à la famille visuelle du site.
    return (
      <div className={cn('rounded-[22px] p-1', style.bg)}>
        <div className="rounded-[18px] bg-background p-1">{exerciseComponent}</div>
      </div>
    );
  };

  const isWideTool = skill.slug === 'writing-notebook';

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6">
      <div className={cn('flex w-full flex-col gap-6', isWideTool ? 'max-w-6xl' : 'max-w-4xl')}>
        <ExerciseBanner skill={skill} returnHref={returnHref} />

        <main>
          {renderExercise()}
        </main>
      </div>
    </div>
  );
}
