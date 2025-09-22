
'use client';

import { useState, useEffect, useMemo, useContext, useRef } from 'react';
import type { SkillLevel } from '@/lib/skills';
import { useSearchParams } from 'next/navigation';
import { generateAdaptiveMentalMathQuestion, type StudentPerformance, allCompetencies } from '@/lib/adaptive-mental-math';
import type { Question } from '@/lib/questions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Check, RefreshCw, X, Loader2, ListTree, Sparkles, CheckCircle, Hourglass, XCircle, BrainCircuit } from 'lucide-react';
import Confetti from 'react-dom-confetti';
import { Progress } from '@/components/ui/progress';
import { UserContext } from '@/context/user-context';
import { addScore, ScoreDetail } from '@/services/scores';
import { updateStudent } from '@/services/students';
import { saveHomeworkResult } from '@/services/homework';
import { ScoreTube } from './score-tube';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from './ui/sheet';
import { analyzeMentalMathPerformance } from '@/ai/flows/mental-math-analysis-flow';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

const NUM_QUESTIONS = 10;

export function AdaptiveMentalCalculationExercise() {
  const { student, refreshStudent } = useContext(UserContext);
  const searchParams = useSearchParams();
  const isHomework = searchParams.get('from') === 'devoirs';
  const homeworkDate = searchParams.get('date');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<ScoreDetail[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // For adaptive logic
  const [sessionPerformance, setSessionPerformance] = useState<StudentPerformance>({});
  
  // For AI Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');


  const generateNextQuestion = (perf: StudentPerformance, lastCompetencyId: string | null, wasCorrect: boolean) => {
    const nextQuestion = generateAdaptiveMentalMathQuestion(lastCompetencyId, wasCorrect, perf);
    setQuestions(prev => [...prev, nextQuestion]);
  };
  
  useEffect(() => {
    setIsLoading(true);
    // Combine session and global performance for the next question choice.
    const combinedPerformance = { ...(student?.mentalMathPerformance || {}), ...sessionPerformance };
    generateNextQuestion(combinedPerformance, null, true); // Start with an easy question
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  const handleNextQuestion = () => {
    setShowConfetti(false);
    if (currentQuestionIndex < NUM_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const lastAnswerWasCorrect = feedback === 'correct';
      const lastCompetencyId = currentQuestion?.competencyId || null;
      const combinedPerformance = { ...(student?.mentalMathPerformance || {}), ...sessionPerformance };
      generateNextQuestion(combinedPerformance, lastCompetencyId, lastAnswerWasCorrect);

      setUserInput('');
      setFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsFinished(true);
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion || feedback || !currentQuestion.answer) return;
    
    const userAnswer = userInput.replace(',', '.').trim().toLowerCase();
    const correctAnswer = String(currentQuestion.answer).toLowerCase();
    const isCorrect = userAnswer === correctAnswer;
    
    // Update performance stats for the session
    const competencyId = currentQuestion.competencyId;
    if (competencyId) {
        setSessionPerformance(prev => {
            const newPerformance = { ...prev };
            if (!newPerformance[competencyId]) {
                newPerformance[competencyId] = { successes: 0, failures: 0 };
            }
            if (isCorrect) newPerformance[competencyId].successes++;
            else newPerformance[competencyId].failures++;
            return newPerformance;
        });
    }

    const detail: ScoreDetail = {
      question: currentQuestion.question,
      userAnswer: userAnswer || "vide",
      correctAnswer: String(currentQuestion.answer),
      status: isCorrect ? 'correct' : 'incorrect',
    };
    setSessionDetails(prev => [...prev, detail]);

    if (isCorrect) {
      setFeedback('correct');
      setCorrectAnswers(prev => prev + 1);
      setShowConfetti(true);
    } else {
      setFeedback('incorrect');
    }
    setTimeout(handleNextQuestion, 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
  }

  useEffect(() => {
      const saveFinalScore = async () => {
           if (isFinished && student && !hasBeenSaved) {
              setHasBeenSaved(true);
              const score = (correctAnswers / NUM_QUESTIONS) * 100;
              
              // Merge session performance with global performance
              const finalPerformance: StudentPerformance = { ...student.mentalMathPerformance };
              Object.entries(sessionPerformance).forEach(([id, {successes, failures}]) => {
                  if (!finalPerformance[id]) finalPerformance[id] = { successes: 0, failures: 0 };
                  finalPerformance[id].successes += successes;
                  finalPerformance[id].failures += failures;
              });

              if (isHomework && homeworkDate) {
                  await saveHomeworkResult({
                      userId: student.id,
                      date: homeworkDate,
                      skillSlug: 'adaptive-mental-calculation',
                      score: score,
                  });
              } else {
                  await addScore({
                      userId: student.id,
                      skill: 'adaptive-mental-calculation',
                      score: score,
                      details: sessionDetails,
                  });
              }
              // Save the updated performance map to the student's profile
              await updateStudent(student.id, { mentalMathPerformance: finalPerformance });
              refreshStudent(); // Refresh student context to get the latest performance data for next session
          }
      }
      saveFinalScore();
  }, [isFinished, student, correctAnswers, hasBeenSaved, sessionDetails, isHomework, homeworkDate, sessionPerformance, refreshStudent]);

  const restartExercise = () => {
    setQuestions([]);
    setIsFinished(false);
    setCorrectAnswers(0);
    setCurrentQuestionIndex(0);
    setUserInput('');
    setFeedback(null);
    setHasBeenSaved(false);
    setSessionDetails([]);
    setSessionPerformance({});
    setAnalysisResult('');
    
    setIsLoading(true);
    const initialPerformance = student?.mentalMathPerformance || {};
    generateNextQuestion(initialPerformance, null, true);
    setIsLoading(false);
  };

  const handleAnalyzePerformance = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    
    const performanceData = Object.entries(sessionPerformance).map(([id, data]) => {
      const competency = allCompetencies.find(c => c.id === id);
      return {
        id,
        description: competency?.description || 'Compétence inconnue',
        ...data,
      };
    });

    try {
      const result = await analyzeMentalMathPerformance({ performance: performanceData });
      setAnalysisResult(result.analysis);
    } catch (e) {
      console.error("AI Analysis failed", e);
      setAnalysisResult("Désolé, l'analyse n'a pas pu être effectuée pour le moment.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || !currentQuestion) {
    return <Card className="w-full shadow-2xl p-8 text-center"><Loader2 className="mx-auto animate-spin" /></Card>;
  }

  if (isFinished) {
    const score = (correctAnswers / NUM_QUESTIONS) * 100;
    return (
      <Card className="w-full max-w-lg mx-auto shadow-2xl text-center p-4 sm:p-8">
        <CardHeader>
          <CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-2xl">
            Tu as obtenu <span className="font-bold text-primary">{correctAnswers}</span> bonnes réponses sur <span className="font-bold">{NUM_QUESTIONS}</span>.
          </p>
          <ScoreTube score={score} />
           {isHomework ? (
                <p className="text-muted-foreground">Tes devoirs sont terminés !</p>
            ) : (
                <Button onClick={restartExercise} variant="outline" size="lg" className="mt-4">
                    <RefreshCw className="mr-2" />
                    Recommencer
                </Button>
            )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
       <Progress value={((currentQuestionIndex + 1) / NUM_QUESTIONS) * 100} className="w-full mb-4" />
        <Card className="shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-4 right-4">
                <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="outline" size="sm">
                            <ListTree className="mr-2 h-4 w-4" /> Voir mes compétences
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]">
                        <SheetHeader>
                            <SheetTitle>Progression en Calcul Mental</SheetTitle>
                            <SheetDescription>
                                Voici la liste des compétences et ta performance pendant cette session.
                            </SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100%-160px)] pr-4">
                        <div className="space-y-4 py-4">
                            {allCompetencies.map(competency => {
                                const perfData = sessionPerformance[competency.id];
                                let status: 'acquired' | 'in-progress' | 'failed' | 'not-started' = 'not-started';
                                if (perfData) {
                                    if (perfData.successes > 0 && perfData.failures === 0) status = 'acquired';
                                    else if (perfData.successes > 0 && perfData.failures > 0) status = 'in-progress';
                                    else if (perfData.failures > 0) status = 'failed';
                                }

                                return (
                                <div key={competency.id} className="flex items-center gap-3 p-2 border-l-4 rounded-r-md bg-muted/50" style={{borderColor: status === 'acquired' ? 'hsl(var(--chart-2))' : status === 'in-progress' ? 'hsl(var(--chart-4))' : status === 'failed' ? 'hsl(var(--chart-5))' : 'hsl(var(--border))'}}>
                                    {status === 'acquired' && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0"/>}
                                    {status === 'in-progress' && <Hourglass className="h-5 w-5 text-yellow-500 flex-shrink-0"/>}
                                    {status === 'failed' && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0"/>}
                                    {status === 'not-started' && <BrainCircuit className="h-5 w-5 text-muted-foreground flex-shrink-0"/>}
                                    <p className="text-sm font-medium flex-grow text-left">{competency.description}</p>
                                    <Badge variant="outline">Niv. {competency.level}</Badge>
                                </div>
                                )
                            })}
                        </div>
                        </ScrollArea>
                        <SheetFooter className="pt-4 border-t">
                            <div className="w-full space-y-3">
                                {analysisResult && (
                                    <Card className="bg-primary/10 border-primary/20">
                                        <CardContent className="p-4 text-sm text-center">
                                            {analysisResult}
                                        </CardContent>
                                    </Card>
                                )}
                                <Button onClick={handleAnalyzePerformance} disabled={isAnalyzing || Object.keys(sessionPerformance).length === 0} className="w-full">
                                    {isAnalyzing ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2" />}
                                    {analysisResult ? "Analyser à nouveau" : "Analyser ma session"}
                                </Button>
                            </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <Confetti active={showConfetti} config={{angle: 90, spread: 360, startVelocity: 40, elementCount: 100, dragFriction: 0.12, duration: 2000, stagger: 3, width: "10px", height: "10px"}} />
            </div>

            <CardHeader>
                <CardTitle className="font-headline text-2xl">Question {currentQuestionIndex + 1}</CardTitle>
                <CardDescription>Niveau {currentQuestion.level}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[250px] flex flex-col items-center justify-center gap-8 p-6">
                <p className="font-body text-5xl sm:text-6xl font-bold tracking-wider">{currentQuestion.question}</p>
                <div className="relative w-full max-w-sm flex flex-col gap-4">
                    <Input
                        ref={inputRef}
                        type="text"
                        inputMode="decimal"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ta réponse..."
                        className={cn(
                          "h-20 text-4xl text-center font-numbers",
                          feedback === 'correct' && 'border-green-500 ring-green-500',
                          feedback === 'incorrect' && 'border-red-500 ring-red-500 animate-shake'
                        )}
                        disabled={!!feedback}
                        autoFocus
                    />
                     {feedback === 'correct' && <Check className="absolute right-4 top-8 -translate-y-1/2 h-8 w-8 text-green-500"/>}
                     {feedback === 'incorrect' && <X className="absolute right-4 top-8 -translate-y-1/2 h-8 w-8 text-red-500"/>}

                     <Button onClick={checkAnswer} disabled={!!feedback || !userInput} size="lg">
                        Valider
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="h-24 flex items-center justify-center">
                 {feedback === 'incorrect' && (
                    <div className="text-xl font-bold text-red-600 animate-shake">
                        La bonne réponse était {currentQuestion.answer}.
                    </div>
                )}
            </CardFooter>
        </Card>
        <style jsx>{\`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        \`}</style>
    </div>
  );
}
