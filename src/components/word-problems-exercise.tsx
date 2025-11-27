'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { UserContext } from '@/context/user-context';
import { addScore } from '@/services/scores';
import { generateProblem, correctProblem, type GeneratedProblem, type CorrectionFeedback, type ProblemCategory } from '@/ai/flows/word-problems-flow';
import { useToast } from '@/hooks/use-toast';
import { Gem, RefreshCw, Check, ArrowRight, Calculator, MessageSquare, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoreTube } from '@/components/score-tube';
import { getSkillBySlug } from '@/lib/skills';
import { useParams } from 'next/navigation';

const NUM_PROBLEMS = 3;

export function WordProblemsExercise() {
    const { student } = useContext(UserContext);
    const { toast } = useToast();
    const params = useParams();
    const skillSlug = typeof params.skill === 'string' ? params.skill : '';
    const skill = getSkillBySlug(skillSlug);

    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [problem, setProblem] = useState<GeneratedProblem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCorrecting, setIsCorrecting] = useState(false);

    // Student inputs
    const [calculation, setCalculation] = useState('');
    const [result, setResult] = useState('');
    const [sentence, setSentence] = useState('');

    const [feedback, setFeedback] = useState<CorrectionFeedback | null>(null);
    const [score, setScore] = useState(0); // This will now track "problems solved" for UI if needed, or we can just use totalPoints/2 for rough progress
    const [totalPoints, setTotalPoints] = useState(0); // Weighted score: 2 for 1st try, 1 for >1
    const [attempts, setAttempts] = useState(0); // Attempts for current problem
    const [isFinished, setIsFinished] = useState(false);

    const handleSpeak = (text: string) => {
        if (!text || !('speechSynthesis' in window)) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        loadProblem();
    }, [currentProblemIndex]);

    const loadProblem = async () => {
        setIsLoading(true);
        setFeedback(null);
        setCalculation('');
        setResult('');
        setSentence('');
        setAttempts(0);

        try {
            // Map skill slug to problem category
            let category: ProblemCategory = 'problemes-transformation';
            if (skillSlug === 'problemes-composition') category = 'problemes-composition';
            if (skillSlug === 'problemes-comparaison') category = 'problemes-comparaison';
            if (skillSlug === 'problemes-composition-transformation') category = 'problemes-composition-transformation';

            const newProblem = await generateProblem(category, 'easy');
            setProblem(newProblem);
        } catch (error) {
            console.error("Failed to generate problem:", error);
            toast({
                title: "Erreur",
                description: "Impossible de charger le problème. Réessaie plus tard.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!problem) return;

        setIsCorrecting(true);
        try {
            const correction = await correctProblem({
                problemText: problem.text,
                studentCalculation: calculation,
                studentResult: parseFloat(result.replace(',', '.')),
                studentSentence: sentence,
                expectedResult: problem.expectedResult,
            });

            setFeedback(correction);

            if (correction.isCorrect) {
                const pointsEarned = attempts === 0 ? 2 : 1;
                setTotalPoints(prev => prev + pointsEarned);
                setScore(prev => prev + 1); // Increment solved count

                toast({
                    title: "Bravo !",
                    description: `C'est la bonne réponse ! (+${pointsEarned} pépite${pointsEarned > 1 ? 's' : ''})`,
                    className: "bg-green-100 border-green-300 text-green-800",
                });
            } else {
                setAttempts(prev => prev + 1);
            }
        } catch (error) {
            console.error("Failed to correct problem:", error);
            toast({
                title: "Erreur",
                description: "Impossible de corriger le problème.",
                variant: "destructive",
            });
        } finally {
            setIsCorrecting(false);
        }
    };

    const handleNext = async () => {
        if (currentProblemIndex < NUM_PROBLEMS - 1) {
            setCurrentProblemIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
            await saveResult();
        }
    };

    const saveResult = async () => {
        if (!student) return;

        const maxPoints = NUM_PROBLEMS * 2; // 2 points per problem
        const finalScore = (totalPoints / maxPoints) * 100;

        const result = await addScore({
            userId: student.id,
            skill: skillSlug,
            score: finalScore,
        });

        if (result.success && result.nuggetsEarned) {
            toast({
                title: `+${result.nuggetsEarned} pépites !`,
                description: "Exercice terminé !",
                className: "bg-amber-100 border-amber-300 text-amber-800",
                icon: <Gem className="h-6 w-6 text-amber-500" />,
            });
        }
    };

    if (isFinished) {
        return (
            <Card className="w-full max-w-2xl mx-auto shadow-2xl text-center p-8">
                <CardHeader>
                    <CardTitle className="text-4xl font-headline mb-4">Exercice terminé !</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-2xl">
                        Tu as résolu <span className="font-bold text-primary">{score}</span> problèmes sur <span className="font-bold">{NUM_PROBLEMS}</span>.
                    </p>
                    <ScoreTube score={(totalPoints / (NUM_PROBLEMS * 2)) * 100} />
                    <Button onClick={() => window.location.reload()} variant="outline" size="lg" className="mt-4">
                        <RefreshCw className="mr-2" />
                        Recommencer
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary">Problème {currentProblemIndex + 1} / {NUM_PROBLEMS}</h2>
                <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full text-amber-800 font-bold">
                    <Gem className="h-4 w-4" />
                    <span>{totalPoints} pépites gagnées</span>
                </div>
            </div>

            <Card className="shadow-xl border-2 border-primary/10">
                <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : (
                        <div className="flex items-start gap-4">
                            <p className="text-xl sm:text-2xl font-medium leading-relaxed text-gray-800 flex-grow">
                                {problem?.text}
                            </p>
                            <Button variant="ghost" size="icon" onClick={() => handleSpeak(problem?.text || '')} className="flex-shrink-0 text-primary hover:text-primary/80 hover:bg-primary/10">
                                <Volume2 className="h-6 w-6" />
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-6 space-y-8">

                    {/* Calculation Section */}
                    <div className="space-y-3">
                        <Label htmlFor="calculation" className="text-lg flex items-center gap-2 text-blue-600">
                            <Calculator className="h-5 w-5" />
                            Le calcul
                        </Label>
                        <Input
                            id="calculation"
                            value={calculation}
                            onChange={(e) => setCalculation(e.target.value)}
                            disabled={!!feedback?.isCorrect || isCorrecting}
                            className={cn(
                                "text-xl p-6 font-numbers",
                                feedback?.calculationFeedback ? "border-red-500 bg-red-50" :
                                    feedback?.isCorrect ? "border-green-500 bg-green-50" : ""
                            )}
                        />
                        {feedback && feedback.calculationFeedback && (
                            <div className="flex items-start gap-2 text-red-600 text-sm">
                                <p className="flex-grow">
                                    <span className="font-bold">Attention :</span> {feedback.calculationFeedback}
                                </p>
                                <Button variant="ghost" size="icon" onClick={() => handleSpeak(`Attention : ${feedback.calculationFeedback}`)} className="h-6 w-6 text-red-600 hover:bg-red-100">
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Result Section */}
                    <div className="space-y-3">
                        <Label htmlFor="result" className="text-lg flex items-center gap-2 text-purple-600">
                            <span className="font-bold">=</span>
                            Le résultat
                        </Label>
                        <div className="relative">
                            <Input
                                id="result"
                                type="text"
                                inputMode="decimal"
                                value={result}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                                    setResult(val);
                                }}
                                disabled={!!feedback?.isCorrect || isCorrecting}
                                className={cn(
                                    "text-xl p-6 font-numbers pl-12",
                                    feedback?.resultFeedback ? "border-red-500 bg-red-50" :
                                        feedback?.isCorrect ? "border-green-500 bg-green-50" : ""
                                )}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">=</div>
                        </div>
                        {feedback && feedback.resultFeedback && (
                            <div className="flex items-start gap-2 text-red-600 text-sm">
                                <p className="flex-grow">
                                    <span className="font-bold">Attention :</span> {feedback.resultFeedback}
                                </p>
                                <Button variant="ghost" size="icon" onClick={() => handleSpeak(`Attention : ${feedback.resultFeedback}`)} className="h-6 w-6 text-red-600 hover:bg-red-100">
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Sentence Section */}
                    <div className="space-y-3">
                        <Label htmlFor="sentence" className="text-lg flex items-center gap-2 text-green-600">
                            <MessageSquare className="h-5 w-5" />
                            La phrase réponse
                        </Label>
                        <Textarea
                            id="sentence"
                            value={sentence}
                            onChange={(e) => setSentence(e.target.value)}
                            disabled={!!feedback?.isCorrect || isCorrecting}
                            className={cn(
                                "text-lg p-4 min-h-[100px]",
                                feedback?.sentenceFeedback ? "border-red-500 bg-red-50" :
                                    feedback?.isCorrect ? "border-green-500 bg-green-50" : ""
                            )}
                        />
                        {feedback && feedback.sentenceFeedback && (
                            <div className="flex items-start gap-2 text-red-600 text-sm">
                                <p className="flex-grow">
                                    <span className="font-bold">Attention :</span> {feedback.sentenceFeedback}
                                </p>
                                <Button variant="ghost" size="icon" onClick={() => handleSpeak(`Attention : ${feedback.sentenceFeedback}`)} className="h-6 w-6 text-red-600 hover:bg-red-100">
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* General Feedback */}
                    {feedback && !feedback.isCorrect && feedback.generalFeedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium flex items-center gap-2">
                                        💡 Petit conseil :
                                    </p>
                                    <p className="mt-1">{feedback.generalFeedback}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleSpeak(`Petit conseil : ${feedback.generalFeedback}`)} className="text-blue-800 hover:bg-blue-100">
                                    <Volume2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="bg-gray-50 p-6 flex justify-end">
                    {!feedback?.isCorrect ? (
                        <Button
                            size="lg"
                            onClick={handleValidate}
                            disabled={isCorrecting || !calculation || !result || !sentence}
                            className="w-full sm:w-auto text-lg px-8"
                        >
                            {isCorrecting ? (
                                <>
                                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                    Correction...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-5 w-5" />
                                    Valider
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleNext}
                            className="w-full sm:w-auto text-lg px-8 bg-green-600 hover:bg-green-700"
                        >
                            Suivant
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
