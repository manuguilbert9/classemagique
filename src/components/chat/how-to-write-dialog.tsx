'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';
import { HelpCircle, Mic, Square, Volume2, RotateCcw, Check, Sparkles } from 'lucide-react';

type Phase = 'idle' | 'listening' | 'review' | 'copying' | 'done';

interface HowToWriteDialogProps {
    onInsert: (text: string) => void;
}

function normalizeTranscript(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

function speak(text: string) {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
}

/** Découpe la phrase en mots et espaces pour permettre le retour à la ligne entre les mots. */
function tokenize(text: string): string[] {
    return text.match(/\S+|\s+/g) ?? [];
}

export function HowToWriteDialog({ onInsert }: HowToWriteDialogProps) {
    const [open, setOpen] = useState(false);
    const [phase, setPhase] = useState<Phase>('idle');
    const [transcript, setTranscript] = useState('');
    const [position, setPosition] = useState(0);
    const copyInputRef = useRef<HTMLInputElement>(null);

    const handleResult = useCallback((chunk: string) => {
        setTranscript((prev) => normalizeTranscript(`${prev} ${chunk}`));
    }, []);

    const { startListening, stopListening, isSupported } = useSpeechRecognition({
        onResult: handleResult,
        onEnd: () => setPhase((p) => (p === 'listening' ? 'review' : p)),
    });

    const resetAll = useCallback(() => {
        setTranscript('');
        setPosition(0);
        setPhase('idle');
    }, []);

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            stopListening();
            window.speechSynthesis?.cancel();
            resetAll();
        }
    };

    const handleStartListening = () => {
        setTranscript('');
        setPhase('listening');
        startListening();
    };

    const handleStopListening = () => {
        stopListening();
        setPhase('review');
    };

    const handleRestartFromReview = () => {
        setTranscript('');
        setPhase('idle');
    };

    const handleValidateReview = () => {
        setPosition(0);
        setPhase('copying');
    };

    // Focus la zone de recopie quand on entre en phase "copying"
    useEffect(() => {
        if (phase === 'copying') {
            copyInputRef.current?.focus();
        }
    }, [phase]);

    // La saisie passe par un vrai champ (pour que les lettres accentuées et les claviers
    // virtuels fonctionnent normalement), mais sa valeur est entièrement pilotée par
    // `position` : un copier-coller est bloqué par onPaste/onDrop, et toute modification
    // qui n'ajoute/n'enlève pas exactement une lettre correcte est simplement ignorée —
    // le champ contrôlé revient alors à son état précédent.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value.length === position + 1) {
            const typedChar = value[position];
            const targetChar = transcript[position];
            if (typedChar && targetChar && typedChar.toLowerCase() === targetChar.toLowerCase()) {
                const nextPosition = position + 1;
                setPosition(nextPosition);
                if (nextPosition >= transcript.length) {
                    setPhase('done');
                }
            }
            return;
        }

        if (value.length < position) {
            setPosition(value.length);
        }
        // Toute autre variation (saut de plusieurs lettres, etc.) est ignorée : le champ
        // contrôlé se réaffichera avec la valeur correspondant à `position`.
    };

    const handleInsert = () => {
        onInsert(transcript);
        handleOpenChange(false);
    };

    if (!isSupported) {
        // isSupported starts false on the server and on the first client render
        // (the underlying hook only detects the browser API after mount), so this
        // never causes a hydration mismatch — it just fades in once available.
        return null;
    }

    let charIndex = 0;

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => setOpen(true)}
            >
                <HelpCircle className="h-4 w-4" />
                Comment on écrit ?
            </Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Comment on écrit ?
                        </DialogTitle>
                        <DialogDescription>
                            Dis ce que tu veux écrire, puis recopie-le lettre par lettre.
                        </DialogDescription>
                    </DialogHeader>

                    {phase === 'idle' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <p className="text-center text-muted-foreground">
                                Appuie sur le micro et dis ta phrase à voix haute.
                            </p>
                            <Button
                                type="button"
                                size="lg"
                                className="h-20 w-20 rounded-full"
                                onClick={handleStartListening}
                                disabled={!isSupported}
                                aria-label="Commencer à parler"
                            >
                                <Mic className="h-8 w-8" />
                            </Button>
                            {!isSupported && (
                                <p className="text-sm text-destructive text-center">
                                    Le micro n'est pas disponible sur cet appareil.
                                </p>
                            )}
                        </div>
                    )}

                    {phase === 'listening' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="relative flex h-20 w-20 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                                <Button
                                    type="button"
                                    size="lg"
                                    className="relative h-20 w-20 rounded-full bg-primary"
                                    onClick={handleStopListening}
                                    aria-label="Arrêter d'écouter"
                                >
                                    <Square className="h-7 w-7" />
                                </Button>
                            </div>
                            <p className="text-center font-medium text-primary">Je t'écoute...</p>
                            <div className="min-h-[3rem] w-full rounded-lg bg-muted/60 p-3 text-center text-lg">
                                {transcript || <span className="text-muted-foreground">...</span>}
                            </div>
                            <Button type="button" variant="ghost" onClick={handleStopListening}>
                                J'ai fini de parler
                            </Button>
                        </div>
                    )}

                    {phase === 'review' && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            {transcript ? (
                                <>
                                    <p className="text-center text-muted-foreground">Tu as dit :</p>
                                    <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-4 py-3 text-center text-xl font-medium">
                                        {transcript}
                                        <Button type="button" variant="ghost" size="icon" onClick={() => speak(transcript)} title="Réécouter">
                                            <Volume2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="button" variant="outline" onClick={handleRestartFromReview} className="gap-1.5">
                                            <RotateCcw className="h-4 w-4" /> Recommencer
                                        </Button>
                                        <Button type="button" onClick={handleValidateReview} className="gap-1.5">
                                            C'est ça, je recopie ! <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-center text-muted-foreground">
                                        Je n'ai rien entendu. Essaie encore une fois !
                                    </p>
                                    <Button type="button" onClick={handleRestartFromReview} className="gap-1.5">
                                        <RotateCcw className="h-4 w-4" /> Réessayer
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {(phase === 'copying' || phase === 'done') && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">Recopie ce que tu as dit, lettre par lettre :</p>
                                <Button type="button" variant="ghost" size="icon" onClick={() => speak(transcript)} title="Réécouter">
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div
                                className="w-full select-none rounded-lg bg-muted/40 p-3 text-center"
                                onCopy={(e) => e.preventDefault()}
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <p className="whitespace-pre-wrap break-words text-2xl font-mono tracking-wide sm:text-3xl">
                                    {tokenize(transcript).map((token, tokenIdx) => {
                                        const isSpace = /^\s+$/.test(token);
                                        if (isSpace) {
                                            const spans = token.split('').map(() => {
                                                const i = charIndex++;
                                                const isCurrent = i === position;
                                                return (
                                                    <span key={i} className="relative inline-block w-3">
                                                        {isCurrent && (
                                                            <span className="absolute inset-x-0 top-1 h-1 rounded-full bg-primary" />
                                                        )}
                                                        {' '}
                                                    </span>
                                                );
                                            });
                                            return <span key={`s-${tokenIdx}`}>{spans}</span>;
                                        }

                                        return (
                                            <span key={`w-${tokenIdx}`} className="inline-flex">
                                                {token.split('').map((char) => {
                                                    const i = charIndex++;
                                                    const isTyped = i < position;
                                                    const isCurrent = i === position;
                                                    return (
                                                        <span
                                                            key={i}
                                                            className={cn(
                                                                'relative inline-block transition-all duration-150',
                                                                isTyped && 'text-emerald-600',
                                                                isCurrent && 'scale-125 text-primary',
                                                                !isTyped && !isCurrent && 'text-muted-foreground/50'
                                                            )}
                                                        >
                                                            {char}
                                                            {isCurrent && (
                                                                <span className="absolute -bottom-1 left-0 right-0 h-1 animate-pulse rounded-full bg-primary" />
                                                            )}
                                                        </span>
                                                    );
                                                })}
                                            </span>
                                        );
                                    })}
                                </p>
                            </div>

                            {phase === 'copying' && (
                                <div className="relative flex h-14 w-full max-w-sm items-center justify-center rounded-lg border-2 border-dashed border-primary/40 text-sm text-muted-foreground">
                                    <span className="pointer-events-none px-4 text-center">
                                        Clique ici puis tape les lettres sur ton clavier
                                    </span>
                                    <input
                                        ref={copyInputRef}
                                        type="text"
                                        inputMode="text"
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        aria-label="Zone de recopie"
                                        value={transcript.slice(0, position)}
                                        onChange={handleChange}
                                        onPaste={(e) => e.preventDefault()}
                                        onDrop={(e) => e.preventDefault()}
                                        onContextMenu={(e) => e.preventDefault()}
                                        onBlur={(e) => e.currentTarget.focus()}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 outline-none"
                                    />
                                </div>
                            )}

                            {phase === 'done' && (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="flex items-center gap-2 text-lg font-semibold text-emerald-600">
                                        <Check className="h-5 w-5" /> Bravo, bien recopié !
                                    </p>
                                    <div className="flex gap-3">
                                        <Button type="button" variant="outline" onClick={resetAll} className="gap-1.5">
                                            <RotateCcw className="h-4 w-4" /> Une autre phrase
                                        </Button>
                                        <Button type="button" onClick={handleInsert} className="gap-1.5">
                                            Ajouter au message <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
