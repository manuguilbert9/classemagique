

'use server';

import type { Question, TimeSettings } from './questions';

export async function generateTimeQuestion(difficulty: number): Promise<Question> {
  let hour: number;
  let minute: number;
  let settings: TimeSettings;
  
  const questionTypeRandomizer = Math.random();

  switch (difficulty) {
    case 0: // Level A
      hour = Math.floor(Math.random() * 13); // 0-12
      minute = Math.random() < 0.5 ? 0 : 30;
      settings = { difficulty: 0, showMinuteCircle: true, matchColors: true, coloredHands: true };
      break;
    case 1: // Level B
      hour = Math.floor(Math.random() * 13); // 0-12
      minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      settings = { difficulty: 1, showMinuteCircle: true, matchColors: false, coloredHands: true };
      break;
    case 2: // Level C
      hour = Math.floor(Math.random() * 24); // 0-23
      minute = Math.floor(Math.random() * 12) * 5;
      settings = { difficulty: 2, showMinuteCircle: true, matchColors: false, coloredHands: false };
      break;
    case 3: // Level D
    default:
      hour = Math.floor(Math.random() * 24); // 0-23
      minute = Math.floor(Math.random() * 60);
      settings = { difficulty: 3, showMinuteCircle: false, matchColors: false, coloredHands: false };
      break;
  }

  // 50% QCM, 50% set-time
  if (questionTypeRandomizer < 0.5) {
    // QCM Question
    const answerHour = hour;
    let displayHour = hour % 12;
    if (displayHour === 0 && hour > 0) displayHour = 12; // noon
    if (hour === 0) displayHour = 12; // midnight display

    const answer = `${answerHour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
    const options = new Set<string>([answer]);

    // Add trap answer for levels >= B
    if (difficulty > 0) {
      if (
        minute > 0 &&
        minute <= 12 * 5 &&
        displayHour > 0 &&
        displayHour <= 12
      ) {
        let trapHour = minute / 5;
        if (trapHour === 0) trapHour = 12;

        const trapMinute = (displayHour % 12) * 5;

        if (hour >= 13 && trapHour > 0 && trapHour < 12) {
          trapHour += 12;
        }

        const trapOption = `${trapHour
          .toString()
          .padStart(2, '0')}:${trapMinute.toString().padStart(2, '0')}`;
        if (trapOption !== answer) {
          options.add(trapOption);
        }
      }
    }

    while (options.size < 4) {
      let wrongHour: number;
      if (difficulty >= 2) {
        wrongHour = Math.floor(Math.random() * 24);
      } else {
        wrongHour = Math.floor(Math.random() * 13);
      }
      const wrongMinute = Math.floor(Math.random() * 12) * 5;
      const wrongOption = `${wrongHour
        .toString()
        .padStart(2, '0')}:${wrongMinute.toString().padStart(2, '0')}`;

      if (wrongOption !== answer) {
        options.add(wrongOption);
      }
    }

    return {
      id: Date.now(),
      level: ['A', 'B', 'C', 'D'][difficulty] as 'A' | 'B' | 'C' | 'D',
      type: 'qcm',
      question: "Quelle heure est-il sur l'horloge ?",
      hour: displayHour,
      minute,
      options: Array.from(options).sort(() => Math.random() - 0.5),
      answer,
      timeSettings: settings,
    };
  } else {
    // Set-Time Question
    return {
      id: Date.now(),
      level: ['A', 'B', 'C', 'D'][difficulty] as 'A' | 'B' | 'C' | 'D',
      type: 'set-time',
      question: `Réglez l'horloge sur ${hour
        .toString()
        .padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      hour,
      minute,
      timeSettings: settings,
    };
  }
}
