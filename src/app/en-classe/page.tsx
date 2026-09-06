

'use client';

import { useContext, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { skills as allSkills, type Skill, allSkillCategories, categoryStyles } from '@/lib/skills';
import { Logo } from '@/components/logo';
import { Home, BarChart3, CheckCircle, ListChecks, Gem, MessageSquare, Boxes, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { UserContext } from '@/context/user-context';
import { FullscreenToggle } from '@/components/fullscreen-toggle';
import { getScoresForUser } from '@/services/scores';
import { isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChatManager } from '@/components/chat/chat-manager';
import { ChatContext } from '@/context/chat-context';

/** Une carte d'exercice, la même en mise en avant et dans le tiroir. */
function CarteExercice({ skill, fait }: { skill: Skill; fait: boolean }) {
  const style = categoryStyles[skill.category] || { bg: 'bg-gray-200', text: 'text-gray-800' };
  return (
    <Link href={`/exercise/${skill.slug}`} className="group" aria-label={`Pratiquer ${skill.name}`}>
      <Card
        className={cn(
          'flex h-full flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative',
          style.bg,
          style.text
        )}
      >
        {fait && (
          <div className="absolute top-3 right-3 h-7 w-7 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
        )}
        <div
          className={cn(
            'mb-4 transition-transform duration-300 group-hover:scale-110 [&>svg]:h-16 [&>svg]:w-16 sm:[&>svg]:h-20 sm:[&>svg]:w-20',
            style.text
          )}
        >
          {skill.icon}
        </div>
        <h3 className="font-exercise text-2xl sm:text-3xl mb-2 drop-shadow-sm">{skill.name}</h3>
        <p
          className={cn(
            'opacity-80 text-sm sm:text-base',
            style.text === 'text-white' ? 'text-white/80' : 'text-black/80'
          )}
        >
          {skill.description}
        </p>
      </Card>
    </Link>
  );
}

export default function EnClassePage() {
  const { student, isLoading: isUserLoading } = useContext(UserContext);
  const [enabledSkillsList, setEnabledSkillsList] = useState<Skill[] | null>(null);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const [skillsCompletedToday, setSkillsCompletedToday] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { totalUnreadCount } = useContext(ChatContext);

  useEffect(() => {
      async function determineEnabledSkills() {
        if (!student) {
            if (!isUserLoading) {
                setEnabledSkillsList([]); 
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(true);
        
        const scores = await getScoresForUser(student.id);
        const completedToday = new Set<string>();
        scores.forEach(score => {
            if (isToday(new Date(score.createdAt))) {
                completedToday.add(score.skill);
            }
        });
        setSkillsCompletedToday(completedToday);

        // Les exercices mis en avant par l'enseignant. Tout le reste demeure
        // accessible dans le tiroir : plus rien n'est hors de portée de l'élève.
        const misEnAvant = student.misEnAvant
          ? allSkills.filter(skill => student.misEnAvant!.includes(skill.slug))
          : allSkills.filter(skill => student.enabledSkills?.[skill.slug]);

        setEnabledSkillsList(misEnAvant);
        setIsLoading(false);
      }

      if (!isUserLoading) {
        determineEnabledSkills();
      }
  }, [student, isUserLoading]);

  const skillsByCategory = useMemo(() => {
    if (!enabledSkillsList) return {};
    const grouped: Record<string, Skill[]> = {};
    for (const skill of enabledSkillsList) {
        if (!grouped[skill.category]) {
            grouped[skill.category] = [];
        }
        grouped[skill.category].push(skill);
    }
    return grouped;
  }, [enabledSkillsList]);

  if (isLoading || isUserLoading) {
    return (
        <main className="container mx-auto px-4 py-8">
            <header className="mb-12 text-center space-y-4">
                <Skeleton className="h-10 w-48 mx-auto" />
                <Skeleton className="h-12 w-80 mx-auto" />
                <Skeleton className="h-8 w-64 mx-auto" />
            </header>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="flex h-full flex-col items-center justify-center p-6 text-center">
                        <Skeleton className="h-20 w-20 rounded-full mb-4" />
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </Card>
                ))}
            </div>
        </main>
    );
  }
  
  if (!student) {
       return (
        <main className="container mx-auto px-4 py-8">
            <header className="mb-12 text-center space-y-4">
                <Logo />
                 <h2 className="font-headline text-4xl sm:text-5xl">Veuillez vous connecter</h2>
                 <Button asChild>
                    <Link href="/">Retour à l'accueil</Link>
                 </Button>
            </header>
        </main>
       )
  }

  return (
    <>
    <main className="container mx-auto px-4 py-8">
       <header className="mb-12 text-center space-y-4 relative">
        <div className="absolute top-0 left-0 flex items-center gap-2">
             <Button asChild variant="outline" size="sm">
                <Link href="/">
                    <Home className="mr-2" />
                    Accueil
                </Link>
            </Button>
            <FullscreenToggle />
        </div>
        <Logo />
        <h2 className="font-headline text-4xl sm:text-5xl">Bonjour, {student.name}!</h2>
        <p className="text-lg sm:text-xl text-muted-foreground">Prêt(e) à relever un défi ?</p>
         <div className="absolute top-0 right-0 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setIsChatOpen(prev => !prev)}>
                  <MessageSquare className="h-6 w-6" />
                  {totalUnreadCount > 0 && (
                      <span className="absolute top-0 right-0 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{totalUnreadCount}</span>
                      </span>
                  )}
              </Button>
             <Link href="/rewards" className="flex items-center gap-2 bg-amber-100 border border-amber-300 rounded-full px-3 py-1 text-amber-800 font-bold transition-transform hover:scale-105 cursor-pointer">
                <Gem className="h-5 w-5" />
                <span>{student.nuggets || 0}</span>
             </Link>
             <Button asChild variant="outline" size="sm">
                <Link href="/results">
                    <BarChart3 className="mr-2" />
                    Mes Progrès
                </Link>
            </Button>
             {student.hasCustomSchedule && (
                <Button asChild variant="outline" size="sm">
                    <Link href="/planning">
                        <ListChecks className="mr-2" />
                        Mon Planning
                    </Link>
                </Button>
            )}
        </div>
      </header>
      
      {/* Ce que l'enseignant met en avant aujourd'hui */}
      {enabledSkillsList && enabledSkillsList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
          {enabledSkillsList.map((skill) => (
            <CarteExercice
              key={skill.slug}
              skill={skill}
              fait={skillsCompletedToday.has(skill.slug)}
            />
          ))}
        </div>
      ) : (
        <Card className="w-full max-w-2xl mx-auto p-8 text-center">
          <h3 className="font-headline text-2xl">Rien de particulier aujourd&apos;hui</h3>
          <p className="text-muted-foreground mt-2">
            Ouvre le tiroir ci-dessous : tous les exercices t&apos;attendent.
          </p>
        </Card>
      )}

      {/* Le tiroir : tous les exercices, rangés par domaine, toujours accessibles */}
      <Collapsible open={tiroirOuvert} onOpenChange={setTiroirOuvert} className="mt-12">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-5 font-headline text-2xl transition-colors hover:bg-muted"
          >
            <Boxes className="h-7 w-7 text-primary" />
            Tous les exercices
            <ChevronDown
              className={cn('h-6 w-6 transition-transform', tiroirOuvert && 'rotate-180')}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-8 space-y-12">
          {allSkillCategories.map((category) => {
            const categorySkills = allSkills.filter((s) => s.category === category);
            if (categorySkills.length === 0) return null;
            return (
              <div key={category}>
                <h2 className="text-3xl font-headline border-b-2 border-primary pb-2 mb-6">{category}</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
                  {categorySkills.map((skill) => (
                    <CarteExercice
                      key={skill.slug}
                      skill={skill}
                      fait={skillsCompletedToday.has(skill.slug)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </main>
    {isChatOpen && student && <ChatManager student={student} onClose={() => setIsChatOpen(false)} />}
    </>
  );
}
