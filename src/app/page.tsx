'use client';

import { useState, FormEvent, useContext } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import {
  Book,
  Users,
  LogOut,
  ArrowRight,
  School,
  KeyRound,
  User,
  Loader2,
  BookHeart,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserContext } from '@/context/user-context';
import { loginStudent } from '@/services/students';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PageBanner, PillButton, PillLink } from '@/components/layout/page-banner';
import { PageShell } from '@/components/layout/section';
import { PageLoading } from '@/components/layout/states';
import { cn } from '@/lib/utils';

/** Les quatre portes d'entrée de l'application, dans l'ordre où on s'en sert. */
const DESTINATIONS = [
  {
    href: '/en-classe',
    icon: <Users />,
    title: 'En classe',
    description: 'Mes exercices du jour et mes outils.',
    chip: 'bg-orange text-white',
    glow: 'hover:border-orange',
  },
  {
    href: '/devoirs',
    icon: <Book />,
    title: 'Mes devoirs',
    description: 'Ce qu\'il y a à faire pour la prochaine fois.',
    chip: 'bg-yellow text-amber-950',
    glow: 'hover:border-yellow',
  },
  {
    href: '/story-box',
    icon: <BookHeart />,
    title: 'Boîte à histoires',
    description: 'Inventer et lire mes propres histoires.',
    chip: 'bg-pink text-white',
    glow: 'hover:border-pink',
  },
  {
    href: '/results',
    icon: <BarChart3 />,
    title: 'Mes progrès',
    description: 'Voir tout le chemin déjà parcouru.',
    chip: 'bg-blue text-white',
    glow: 'hover:border-blue',
  },
];

export default function ModeSelectionPage() {
  const { student, setStudent, isLoading } = useContext(UserContext);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    setStudent(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() && code.trim()) {
      setIsLoggingIn(true);
      const loggedInStudent = await loginStudent(name, code);
      setIsLoggingIn(false);
      if (loggedInStudent) {
        setStudent(loggedInStudent);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur de connexion',
          description: 'Le prénom ou le code est incorrect. Veuillez réessayer.',
        });
      }
    }
  };

  if (isLoading) {
    return <PageLoading>J&apos;ouvre Classe Magique…</PageLoading>;
  }

  // — L'écran de connexion —
  if (!student) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden rounded-[26px] shadow-xl animate-in fade-in zoom-in-95">
          {/* Le bandeau de l'identité, en réduction : l'élève reconnaît la
              maison dès l'écran de connexion. */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-accent p-6 text-center text-white">
            <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 left-[12%] h-28 w-28 rounded-full bg-white/10" />
            <span className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
              <Sparkles className="h-8 w-8" />
            </span>
            <h1 className="relative font-headline text-3xl font-extrabold tracking-tight sm:text-4xl">Bienvenue !</h1>
            <p className="relative mt-1 text-white/90">Connecte-toi pour commencer.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Ton prénom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 pl-11 text-base"
                    required
                    aria-label="Prénom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-base">Code secret</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ton code à 4 chiffres"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="h-12 pl-11 font-mono text-base tracking-[0.5em]"
                    required
                    maxLength={4}
                    aria-label="Code secret"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-accent py-6 text-lg text-accent-foreground hover:bg-accent/90"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Continuer'}
                {!isLoggingIn && <ArrowRight className="ml-2" />}
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link href="/teacher/login">
                  <School className="mr-2 h-4 w-4" />
                  Accès enseignant
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 opacity-80">
          <Logo />
        </div>
      </main>
    );
  }

  // — Le choix de la destination, une fois connecté —
  return (
    <PageShell>
      <PageBanner
        icon={<Sparkles />}
        title={`Bonjour, ${student.name} !`}
        subtitle="Où veux-tu aller aujourd'hui ?"
        actions={
          <>
            {student.showPhoto && student.photoURL && (
              <Avatar className="h-10 w-10 border-2 border-white/40">
                <AvatarImage src={student.photoURL} alt={student.name} />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <PillLink href="/teacher/login" icon={School}>Enseignant</PillLink>
            <PillButton icon={LogOut} onClick={handleLogout}>Déconnexion</PillButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {DESTINATIONS.map((destination) => (
          <Link
            key={destination.href}
            href={destination.href}
            aria-label={destination.title}
            className={cn(
              'group flex items-center gap-5 rounded-[22px] border-2 border-transparent bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-8',
              destination.glow
            )}
          >
            <span
              className={cn(
                'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform duration-200 group-hover:scale-110 [&>svg]:h-8 [&>svg]:w-8 sm:h-20 sm:w-20 sm:[&>svg]:h-10 sm:[&>svg]:w-10',
                destination.chip
              )}
            >
              {destination.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-headline text-2xl leading-tight sm:text-3xl">{destination.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground sm:text-base">{destination.description}</span>
            </span>
            <ArrowRight className="ml-auto hidden h-6 w-6 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 sm:block" />
          </Link>
        ))}
      </div>

      <div className="flex justify-center opacity-70">
        <Logo />
      </div>
    </PageShell>
  );
}
