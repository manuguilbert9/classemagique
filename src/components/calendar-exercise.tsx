
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import type { SkillLevel } from '@/lib/skills';
import { type CalendarQuestion } from '@/lib/calendar-questions';
import { getExerciseQuestions } from '@/services/exercise-pool';
import {
  AnswerFeedback,
  DELAI_NOUVEL_ESSAI,
  ExerciseFinished,
  ExerciseProgress,
  useSecondChance,
  type FeedbackStatus,
} from '@/components/exercise/exercise-kit';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';
import { Check, RefreshCw, X, Loader2 } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { categoryStyles } from '@/lib/skills';

const NUM_QUESTIONS = 5;

const skillLevels: { value: SkillLevel, label: string }[] = [
    { value: 'A', label: 'Niveau A - Maternelle' },
    { value: 'B', label: 'Niveau B - CP/CE1' },
    { value: 'C', label: 'Niveau C - CE2/CM1' },
    { value: 'D', label: 'Niveau D - CM2/6ème' },
];

export function CalendarExercise() {
  const { student } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');
  
  const [level, setLevel] = useState<SkillLevel | null>(null);
  
  const [questions, setQuestions] = useState<CalendarQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [feedback, setFeedback] = useState<FeedbackStatus>(null);
  const secondChance = useSecondChance();
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);

  // User input states
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const [inputValue, setInputValue] = useState<string>('');

  const style = categoryStyles['Grandeurs et mesures'];

  useEffect(() => {
    if (student?.levels?.['calendar']) {
      setLevel(student.levels['calendar']);
    } else {
      setLevel('A'); // Default level if not logged in or no level set
    }
  }, [student]);

  const startExercise = async (lvl: SkillLevel) => {
    setIsLoading(true);
    const generatedQuestions = await getExerciseQuestions('calendar', NUM_QUESTIONS, {
      settings: { calendar: { level: lvl } },
      studentId: student?.id ?? null,
    });
    setQuestions(generatedQuestions as CalendarQuestion[]);
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setFeedback(null);
    setIsFinished(false);
    setHasBeenSaved(false);
    setSessionDetails([]);
    setSelectedDay(undefined);
    setSelectedOption(undefined);
    setInputValue('');
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (level) {
        startExercise(level);
    }
  }, [level]);

  const currentQuestion = useMemo(() => {
    if (questions.length > 0) {
      return questions[currentQuestionIndex];
    }
    return null;
  }, [questions, currentQuestionIndex]);

  const handleNextQuestion = () => {
    setShowConfetti(false);
    secondChance.reset();
    if (currentQuestionIndex < NUM_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setFeedback(null);
      setSelectedDay(undefined);
      setSelectedOption(undefined);
      setInputValue('');
    } else {
      setIsFinished(true);
    }
  };
  
  const getCorrectAnswerText = () => {
    if (!currentQuestion) return '';
    switch (currentQuestion.type) {
      case 'qcm':
        return currentQuestion.answer;
      case 'click-date':
        return currentQuestion.answerDate ? new Date(currentQuestion.answerDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      case 'count-days':
        return String(currentQuestion.answerNumber);
      default:
        return '';
    }
  };
  
  const getUserAnswerText = () => {
      if (!currentQuestion) return '';
      switch (currentQuestion.type) {
        case 'qcm':
            return selectedOption || "N/A";
        case 'click-date':
            return selectedDay ? selectedDay.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A";
        case 'count-days':
            return inputValue || "N/A";
        default:
            return "N/A";
      }
  }


  const checkAnswer = () => {
    if (!currentQuestion || feedback) return;
    
    let isCorrect = false;
    switch(currentQuestion.type) {
        case 'qcm':
            isCorrect = selectedOption === currentQuestion.answer;
            break;
        case 'click-date':
             if (selectedDay && currentQuestion.answerDate) {
                const selected = new Date(selectedDay.setHours(12, 0, 0, 0));
                const answer = new Date(new Date(currentQuestion.answerDate).setHours(12, 0, 0, 0));
                isCorrect = selected.getTime() === answer.getTime();
            }
            break;
        case 'count-days':
             isCorrect = parseInt(inputValue, 10) === currentQuestion.answerNumber;
             break;
    }
    
    // Faux : l'élève reprend la main et cherche jusqu'à trouver.
    if (!isCorrect) {
      secondChance.registerError();
      setFeedback('retry');
      setTimeout(() => setFeedback(null), DELAI_NOUVEL_ESSAI);
      return;
    }

    const issue = secondChance.resultOnSuccess();
    setSessionDetails(prev => [...prev, {
        question: currentQuestion.question,
        userAnswer: getUserAnswerText(),
        correctAnswer: getCorrectAnswerText() || '',
        status: issue,
    }]);

    // Seule une réussite du premier coup rapporte un point.
    if (issue === 'correct') {
      setCorrectAnswers(prev => prev + 1);
      setShowConfetti(true);
    }
    setFeedback(issue);
    setTimeout(handleNextQuestion, 2000);
  };
  
  useEffect(() => {
      const saveFinalScore = async () => {
           if (isFinished && student && !hasBeenSaved && level) {
              setHasBeenSaved(true);
              const score = (correctAnswers / NUM_QUESTIONS) * 100;
              if (isHomework && homeworkDate) {
                await saveHomeworkResult({
                    userId: student.id,
                    date: homeworkDate,
                    skillSlug: 'calendar',
                    score: score
                });
              } else {
                await addScore({
                    userId: student.id,
                    skill: 'calendar',
                    score: score,
                    calendarSettings: { level: level },
                    details: sessionDetails,
                });
              }
          }
      }
      saveFinalScore();
  }, [isFinished, student, correctAnswers, hasBeenSaved, level, sessionDetails, isHomework, homeworkDate]);

  const restartExercise = () => {
    if(level) {
        startExercise(level);
    }
  };

  if (!level) {
      // Level selector if no student level is found
      return (
        <Card className={cn("w-full max-w-lg mx-auto shadow-2xl p-6", style.bg, style.text)}>
            <CardHeader>
                <CardTitle>Choisis ton niveau</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Label>Niveau de difficulté</Label>
                 <Select onValueChange={(val) => setLevel(val as SkillLevel)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choisir un niveau..." />
                    </SelectTrigger>
                    <SelectContent>
                        {skillLevels.map(lvl => (
                            <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
      );
  }

  if (isLoading || !currentQuestion) {
    return <Card className="w-full shadow-2xl p-8 text-center"><Loader2 className="mx-auto animate-spin" /></Card>;
  }

  if (isFinished) {
    return (
      <ExerciseFinished
        correct={correctAnswers}
        total={NUM_QUESTIONS}
        canRestart={!isHomework}
        onRestart={restartExercise}
        returnHref={isHomework ? '/devoirs' : '/en-classe'}
        returnLabel={isHomework ? 'Retour aux devoirs' : 'Retour en classe'}
      />
    );
  }

  const renderQuestion = () => {
      switch(currentQuestion.type) {
          case 'qcm':
              return (
                  <div className='flex flex-col items-center gap-4'>
                    {(level === 'B' || level === 'C' || level === 'D') && (
                         <DayPicker
                            mode="single"
                            locale={fr}
                            className="p-4 rounded-md border bg-card"
                            classNames={{
                                day_today: "font-bold text-accent",
                            }}
                        />
                    )}
                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        {currentQuestion.options?.map(option => (
                            <Button
                            key={option}
                            variant={selectedOption === option ? 'default' : 'outline'}
                            onClick={() => setSelectedOption(option)}
                            className={cn(
                                "text-xl h-20 p-4 justify-center capitalize",
                                (feedback === 'correct' || feedback === 'corrected') && option === currentQuestion.answer && 'bg-green-500/80 text-white border-green-600 scale-105',
                                feedback === 'retry' && selectedOption === option && 'bg-red-500/80 text-white border-red-600 animate-shake',
                            )}
                            disabled={!!feedback}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                  </div>
              )
          case 'click-date':
              return (
                  <DayPicker
                    mode="single"
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    locale={fr}
                    className="p-4 rounded-md border bg-card"
                    classNames={{
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                        day_today: "font-bold text-accent",
                    }}
                   />
              )
          case 'count-days':
                return (
                     <div className="flex flex-col items-center gap-4">
                        <DayPicker
                            mode="single"
                            locale={fr}
                            month={new Date(currentQuestion.month!)}
                            className="p-4 rounded-md border bg-card"
                            classNames={{
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                                day_today: "font-bold text-accent",
                            }}
                        />
                        <InputOTP maxLength={2} value={inputValue} onChange={setInputValue}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                            </InputOTPGroup>
                        </InputOTP>
                     </div>
                )
      }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
       <ExerciseProgress current={currentQuestionIndex} total={NUM_QUESTIONS} results={sessionDetails.map(d => d.status as 'correct' | 'corrected' | 'incorrect')} className="mb-4" />
        <Card className="shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} config={{angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3, width: "10px", height: "10px"}} />
            </div>

            <CardHeader>
                <CardTitle className="font-headline text-2xl">{currentQuestion.question}</CardTitle>
                {currentQuestion.description && (
                     <CardDescription>{currentQuestion.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent className="min-h-[350px] flex flex-col items-center justify-center gap-8 p-6">
                {renderQuestion()}
            </CardContent>
            <CardFooter className="h-24 flex flex-col items-center justify-center gap-2">
                 <Button
                    onClick={checkAnswer}
                    disabled={!!feedback || (!selectedDay && !selectedOption && !inputValue)}
                    size="lg"
                    className="w-full max-w-md"
                  >
                    Valider
                </Button>
                 <AnswerFeedback status={feedback} hinted={secondChance.showHint} className="mt-2 w-full max-w-md" />
                 {/* Après deux erreurs, on montre la réponse : l'élève la désigne quand même. */}
                 {secondChance.showHint && !feedback && (
                    <p className="mt-2 rounded-[16px] border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-2 font-bold capitalize text-amber-700">
                        Réponse : {getCorrectAnswerText()}
                    </p>
                )}
            </CardFooter>
        </Card>
        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
    </div>
  );
}
