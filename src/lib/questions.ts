

'use server';

import type { SkillLevel } from './skills';
import { generateCalendarQuestions } from './calendar-questions';
import { generateMentalMathQuestions } from './mental-math';
import { generateTimeQuestion } from "./time-questions";
import { generateSyllabeAttaqueQuestion } from "./syllabe-questions";
import { generateDénombrementQuestion } from "./count-questions";
import { generateKeyboardCountQuestion } from "./keyboard-count-questions";
import { generateEcouteLesNombresQuestion } from './number-listening-questions';
import { generateNombresComplexesQuestion } from './complex-number-questions';
import { generateLireLesNombresQuestion } from './reading-number-questions';
import { generateCurrencyQuestion } from './currency-questions';
import { generateAdaptiveMentalMathQuestion, type HelpData } from './adaptive-mental-math';
import { generateChangeMakingQuestions } from './change-making-questions';
import { generateGnNiQuestions } from './gn-ni-questions';


export interface Question {
  id: number;
  level: SkillLevel;
  type: 'qcm' | 'set-time' | 'count' | 'audio-qcm' | 'written-to-audio-qcm' | 'audio-to-text-input' | 'keyboard-count' | 'image-qcm' | 'click-date' | 'count-days' | 'compose-sum' | 'select-multiple' | 'drag-and-drop-recognition' | 'qcm-image' | 'mystery-number';
  question: string;
  // For adaptive mental math
  competencyId?: string;
  help?: HelpData;
  // For QCM
  options?: string[];
  answer?: string;
  images?: { src: string; alt: string; hint?: string }[];
  image?: string | null;
  hint?: string;
  // For QCM with images as options
  imageOptions?: { src: string; alt: string; value: string; hint?: string }[];
  // For time questions (QCM and set-time)
  hour?: number;
  minute?: number;
  timeSettings?: TimeSettings;
  // For count questions
  countEmoji?: string;
  countNumber?: number;
  countSettings?: CountSettings;
  // For audio questions
  textToSpeak?: string;
  // For written-to-audio questions
  optionsWithAudio?: { text: string; audio: string }[];
  // For audio-to-text-input questions
  answerInWords?: string;
  // For letter-sound questions
  letter?: string;
  // For syllable-attack questions
  syllable?: string;
  // For calendar
  description?: string;
  answerDate?: string;
  month?: string;
  answerNumber?: number;
  calendarSettings?: CalendarSettings;
  numberLevelSettings?: NumberLevelSettings;
  // For mental math
  visuals?: { emoji: string; count: number }[];
  // For currency
  targetAmount?: number;
  cost?: number;
  paymentImages?: { name: string, image: string }[];
  items?: { id?: string | number, name: string, image: string, value: number, type: 'pièce' | 'billet' }[];
  correctValue?: number;
  boxLabel?: string;
  currencySettings?: CurrencySettings;
}

export interface CalculationSettings {
  operations: number; // 0-4
  numberSize: number; // 0-4
  complexity: number; // 0-2
}

export interface CurrencySettings {
  difficulty: number; // 0-3
}

export interface TimeSettings {
  difficulty: number;
  showMinuteCircle: boolean;
  matchColors: boolean;
  coloredHands: boolean;
}

export interface CountSettings {
  maxNumber: number;
}

export interface NumberLevelSettings {
  level: SkillLevel;
}

export interface CalendarSettings {
  level: SkillLevel;
}

export interface ReadingRaceSettings {
  level: 'Niveau A' | 'Niveau B' | 'Niveau C' | 'Niveau D';
}

export interface AllSettings {
  time?: TimeSettings;
  count?: CountSettings;
  numberLevel?: NumberLevelSettings;
  calendar?: CalendarSettings;
  readingRace?: ReadingRaceSettings;
  calculation?: CalculationSettings;
  currency?: CurrencySettings;
}

export async function generateQuestions(
  skill: string,
  count: number,
  settings?: AllSettings
): Promise<Question[]> {
  const questionPromises: Promise<Question>[] = [];

  if (skill === 'time' && settings?.time) {
    for (let i = 0; i < count; i++) {
      questionPromises.push(generateTimeQuestion(settings.time.difficulty as any));
    }
    return Promise.all(questionPromises);
  }

  if (skill === 'denombrement' && settings?.count) {
    for (let i = 0; i < count; i++) {
      questionPromises.push(generateDénombrementQuestion(settings.count!));
    }
    return Promise.all(questionPromises);
  }

  if (skill === 'keyboard-count') {
    for (let i = 0; i < count; i++) {
      questionPromises.push(generateKeyboardCountQuestion());
    }
    return Promise.all(questionPromises);
  }

  if (skill === 'ecoute-les-nombres') {
    for (let i = 0; i < count; i++) {
      questionPromises.push(generateEcouteLesNombresQuestion());
    }
    return Promise.all(questionPromises);
  }

  if (skill === 'nombres-complexes') {
    for (let i = 0; i < count; i++) {
      questionPromises.push(generateNombresComplexesQuestion());
    }
    return Promise.all(questionPromises);
  }

  if (skill === 'lire-les-nombres' && settings?.numberLevel) {
    for (let i = 0; i < count; i++) {
      questionPromises.push(generateLireLesNombresQuestion(settings.numberLevel!));
    }
    return Promise.all(questionPromises);
  }

  if (skill === 'syllabe-attaque') {
    for (let i = 0; i < count; i++) {
      questionPromises.push(generateSyllabeAttaqueQuestion());
    }
    return Promise.all(questionPromises);
  }

  if (skill === 'calendar' && settings?.calendar) {
    return generateCalendarQuestions(settings.calendar.level, count);
  }

  if (skill === 'mental-calculation' && settings?.numberLevel) {
    return generateMentalMathQuestions(settings.numberLevel.level, count);
  }

  if (skill === 'currency' && settings?.currency) {
    for (let i = 0; i < count; i++) {
      questionPromises.push(generateCurrencyQuestion(settings.currency!));
    }
    return Promise.all(questionPromises);
  }
  if (skill === 'change-making' && settings?.numberLevel) {
    return Promise.resolve(generateChangeMakingQuestions(settings.numberLevel.level as 'B' | 'C' | 'D', count));
  }

  if (skill === 'gn-ni') {
    return Promise.resolve(generateGnNiQuestions());
  }

  if (skill === 'mystery-number') {
    // This exercise manages its own state, so we just need a placeholder
    return Promise.resolve([{ id: 1, level: 'B', type: 'mystery-number', question: '' }]);
  }

  // Fallback
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      id: Date.now() + i,
      level: 'A',
      type: 'qcm',
      question: 'Ceci est un exemple de question. Choisissez la bonne réponse.',
      options: ['Bonne réponse', 'Mauvaise réponse', 'Autre mauvaise réponse', 'Encore une autre'],
      answer: 'Bonne réponse',
      hint: "point d'interrogation",
    });
  }
  return Promise.resolve(questions);
}
