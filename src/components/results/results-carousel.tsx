
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, XCircle } from 'lucide-react';
import type { Score, ScoreDetail } from '@/services/scores';
import { getSkillBySlug, allSkillCategories, type SkillCategory } from '@/lib/skills';
import { ScoreTube } from '../score-tube';
import { Rocket } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';


interface ResultCardProps {
    skillSlug: string;
    averageScore: number;
    count: number;
    scores: Score[]; // Pass all scores for this skill to show details
}

function ResultCard({ skillSlug, averageScore, count, scores }: ResultCardProps) {
    const skill = getSkillBySlug(skillSlug);
    const [selectedScore, setSelectedScore] = React.useState<Score | null>(null);

    if (!skill) return null;

    const isMCLM = skill.slug === 'fluence' || skill.slug === 'reading-race';

    return (
        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedScore(null)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Card className="h-full flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:shadow-md hover:border-primary transition-all">
                        <div className="text-primary [&>svg]:h-12 [&>svg]:w-12 mb-2">
                            {skill.icon}
                        </div>
                        <h3 className="font-headline text-xl">{skill.name}</h3>
                        {isMCLM ? (
                            <div className="flex flex-col items-center justify-center mt-2">
                                <Rocket className="h-10 w-10 text-muted-foreground" />
                                <p className="text-2xl font-bold font-headline mt-1">{averageScore}</p>
                                <p className="text-xs text-muted-foreground">MCLM</p>
                            </div>
                        ) : (
                            <ScoreTube score={averageScore} />
                        )}
                        <p className="text-xs text-muted-foreground mt-1">({count} {count > 1 ? 'exercices' : 'exercice'})</p>
                    </Card>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none text-center pb-2 border-b">Historique</h4>
                        <ul className="space-y-1">
                            {scores.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(score => (
                                <DialogTrigger asChild key={score.id}>
                                    <li 
                                        className="text-sm flex justify-between items-center p-1 rounded-md hover:bg-muted cursor-pointer"
                                        onClick={() => setSelectedScore(score)}
                                    >
                                        <span>{format(new Date(score.createdAt), 'd MMM yy', { locale: fr })}</span>
                                        <span className="font-semibold">{isMCLM ? `${score.score} MCLM` : `${Math.round(score.score)}%`}</span>
                                    </li>
                                </DialogTrigger>
                            ))}
                        </ul>
                    </div>
                </PopoverContent>
            </Popover>

            {selectedScore && (
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Détail de la session</DialogTitle>
                        <DialogDescription>
                            {skill.name} - {format(new Date(selectedScore.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedScore.details && selectedScore.details.length > 0 ? (
                        <ScrollArea className="max-h-[60vh] pr-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Question</TableHead>
                                        <TableHead>Ta réponse</TableHead>
                                        <TableHead className="text-right">Statut</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedScore.details?.map((detail, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-xs font-mono max-w-xs truncate">{detail.question}</TableCell>
                                            <TableCell className="text-xs font-mono max-w-xs truncate">{detail.userAnswer}</TableCell>
                                            <TableCell className="text-right">
                                                {detail.status === 'correct' ? <CheckCircle className="h-4 w-4 text-green-500 inline"/> : <XCircle className="h-4 w-4 text-red-500 inline"/>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                     ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            Aucun détail disponible pour cette session.
                        </div>
                     )}
                </DialogContent>
            )}
        </Dialog>
    )
}

interface ResultsCarouselProps {
    title: string;
    subtitle: string;
    icon: React.ReactElement;
    scores: Score[];
    onPrevious: () => void;
    onNext: () => void;
    isNextDisabled: boolean;
}

export function ResultsCarousel({ title, subtitle, icon, scores, onPrevious, onNext, isNextDisabled }: ResultsCarouselProps) {
    
    const resultsBySkill = React.useMemo(() => {
        const grouped: Record<string, { totalScore: number; count: number, category: SkillCategory, scores: Score[] }> = {};
        
        scores.forEach(score => {
            const skill = getSkillBySlug(score.skill);
            if(skill) {
                if (!grouped[score.skill]) {
                    grouped[score.skill] = { totalScore: 0, count: 0, category: skill.category, scores: [] };
                }
                grouped[score.skill].totalScore += score.score;
                grouped[score.skill].count += 1;
                grouped[score.skill].scores.push(score);
            }
        });

        const results = Object.entries(grouped).map(([skillSlug, data]) => ({
            skillSlug,
            averageScore: Math.round(data.totalScore / data.count),
            count: data.count,
            category: data.category,
            scores: data.scores,
        }));
        
        // Sort by category order, then by skill name
        return results.sort((a,b) => {
            const categoryAIndex = allSkillCategories.indexOf(a.category);
            const categoryBIndex = allSkillCategories.indexOf(b.category);
            if (categoryAIndex !== categoryBIndex) {
                return categoryAIndex - categoryBIndex;
            }
            return a.skillSlug.localeCompare(b.skillSlug);
        });

    }, [scores]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-primary bg-primary/10 p-3 rounded-lg">
                            {React.cloneElement(icon, { className: "h-6 w-6" })}
                        </div>
                        <div>
                            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
                            <CardDescription>{subtitle}</CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={onPrevious}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={onNext} disabled={isNextDisabled}>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {resultsBySkill.length > 0 ? (
                    <Carousel opts={{ align: "start", slidesToScroll: 'auto' }} className="w-full">
                        <CarouselContent className="-ml-4">
                            {resultsBySkill.map(result => (
                                <CarouselItem key={result.skillSlug} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-4">
                                    <ResultCard {...result} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden sm:flex" />
                        <CarouselNext className="hidden sm:flex"/>
                    </Carousel>
                ) : (
                    <div className="h-48 flex items-center justify-center">
                        <p className="text-muted-foreground text-center">Aucun exercice réalisé pour cette période.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
