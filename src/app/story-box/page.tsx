
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Sparkles, Wand2, BookOpen, FileText, File, FilePlus, Drama, Ghost, Swords, Mic, MicOff, MessageSquareText, Smile, Volume2, FileQuestion, Image as ImageIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateStory, type StoryInput, type StoryOutput } from '@/ai/flows/story-flow';
import Link from 'next/link';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { Textarea } from '@/components/ui/textarea';
import { generateSpeech } from '@/ai/flows/tts-flow';
import { generateImage, type ImageInput } from '@/ai/flows/image-flow';
import { SyllableText } from '@/components/syllable-text';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import './halloween.css';

// Halloween-specific emojis (October 1 - November 3)
const halloweenEmojis = [
  '🎃', '👻', '🦇', '🕷️', '🕸️', '💀', '🧛', '🧟',
  '🧙', '🔮', '⚰️', '🪦', '🌕', '🌙', '⭐', '🕯️',
  '🏚️', '🌲', '🦉', '🐈‍⬛', '🧪', '📿', '🗝️', '🚪',
  '🪄', '📖', '⚡', '🌫️', '🍂', '🍁', '🎭', '👁️',
  'sorcière', 'fantôme', 'vampire', 'loup-garou', 'zombie', 'squelette',
  'maison hantée', 'cimetière', 'manoir abandonné', 'forêt mystérieuse', 'grotte sombre',
  'potion magique', 'sort maléfique', 'grimoire maudit', 'portail des ombres', 'miroir hanté'
];

// Base emojis, always present (normal period)
const baseEmojis = [
  '👑', '🏰', '🐉', '🦄', '🏴‍☠️', '🚀', '👽', '🤖',
  'détective', '🌲', '🦊', '🦉', '🔑', '🗺️', '💎', '🕰️',
  '🎩', '🧪', '✨', '🍪', '🎈', '⚽', '🎨', '🎤'
];

// Pool of extra emojis for random selection (normal period)
const extraEmojiPool = [
  '🧛', '🧟', '👻', '🧜‍♀️', '🧞', 'fées', '🌊', '🌋', '🏜️', '🏝️',
  '🧭', '🏆', '🎁', '🍭', '🍕', '🍰', '🎸', '🎻', '🎭', '🎪',
  '🚂', '⛵', '🚁', 'sous-marin', 'amulette', 'potion', 'sortilège', 'trésor',
  'sorcière', 'ogre', 'loup', 'prince', 'princesse', 'chevalier', 'navire', 'forêt hantée',
  'grotte secrète', 'montagne', 'désert', 'planète lointaine', 'robot ami', 'extraterrestre farceur',
  'école de magie', 'cirque', 'zoo', 'musée', 'parc d\'attractions', 'bibliothèque', 'laboratoire',
  'bague magique', 'épée légendaire', 'tapis volant', 'grimoire ancien', 'portail mystérieux'
];

// Function to check if we're in Halloween period (October 1 - November 3)
const isHalloweenPeriod = (): boolean => {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed: 9 = October, 10 = November
  const day = now.getDate();

  return (month === 9) || (month === 10 && day <= 3);
};

// Function to get a unique random subset of emojis
const getRandomEmojis = (pool: string[], count: number): string[] => {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

type CreationMode = 'emoji' | 'vocal';
type StoryLength = 'extra-courte' | 'courte' | 'moyenne' | 'longue';
type StoryTone = 'aventure' | 'comique' | 'effrayante' | 'terrifiante' | 'cauchemardesque';
type AudioState = { [key: number]: { isLoading: boolean; dataUri: string | null } };


export default function StoryBoxPage() {
  const [creationMode, setCreationMode] = useState<CreationMode | null>(null);

  // Inputs
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [vocalDescription, setVocalDescription] = useState('');
  const [length, setLength] = useState<StoryLength>('courte');
  const [tone, setTone] = useState<StoryTone>(isHalloweenPeriod() ? 'effrayante' : 'aventure');
  
  // Story state
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<StoryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // TTS State
  const [audioState, setAudioState] = useState<AudioState>({});
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});


  // Image State (Halloween only)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Display state
  const [showSyllables, setShowSyllables] = useState(false);


  // Emoji list state
  const [availableEmojis, setAvailableEmojis] = useState<string[]>([]);

  // Speech recognition state
  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition({
      onResult: (result) => {
          setVocalDescription(prev => `${prev} ${result}`.trim());
      }
  });


  useEffect(() => {
    // Generate the emoji list on component mount for the emoji mode
    if (isHalloweenPeriod()) {
      // During Halloween, use only Halloween emojis
      setAvailableEmojis(halloweenEmojis);
    } else {
      // Normal period: use base + random extras
      const randomEmojis = getRandomEmojis(extraEmojiPool, 24);
      setAvailableEmojis([...baseEmojis, ...randomEmojis]);
    }
  }, []);

  const handleEmojiClick = (emoji: string) => {
    setSelectedEmojis((current) => {
      if (current.includes(emoji)) {
        return current.filter((e) => e !== emoji);
      }
      if (current.length < 6) {
        return [...current, emoji];
      }
      return current;
    });
  };
  
  const handleGenerateStory = async () => {
    if (creationMode === 'emoji' && selectedEmojis.length === 0) {
      setError('Veuillez choisir au moins un emoji !');
      return;
    }
     if (creationMode === 'vocal' && vocalDescription.trim() === '') {
      setError('Veuillez décrire votre histoire !');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setStory(null);
    setAudioState({});
    setImageUrl(null); // Reset image on new story

    const input: StoryInput = {
      emojis: creationMode === 'emoji' ? selectedEmojis : undefined,
      description: creationMode === 'vocal' ? vocalDescription : undefined,
      length,
      tone,
    };
    
    try {
      const result = await generateStory(input);
      setStory(result);
    } catch(e) {
      console.error(e);
      setError('Une erreur est survenue lors de la création de l\'histoire. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateAudio = async (text: string, index: number) => {
    if (!text) return;
    
    const existingAudio = audioState[index];
    if (existingAudio?.dataUri) {
      audioRefs.current[index]?.play();
      return;
    }
    if (existingAudio?.isLoading) return;

    setAudioState(prev => ({ ...prev, [index]: { isLoading: true, dataUri: null } }));
    setError(null);
    try {
      const result = await generateSpeech(text);
      setAudioState(prev => ({ ...prev, [index]: { isLoading: false, dataUri: result.audioDataUri } }));
    } catch (e: any) {
      console.error("Audio generation failed:", e);
      setError(`Impossible de générer l'audio : ${e.message || "Erreur inconnue"}`);
      setAudioState(prev => ({ ...prev, [index]: { isLoading: false, dataUri: null } }));
    }
  };

  const handleGenerateImage = async () => {
      if (!story) return;
      setIsGeneratingImage(true);
      setError(null);
      // We don't reset the image URL here so the old one stays visible during generation
      try {
          const imageInput: ImageInput = {
              storyTitle: story.title,
              storyContent: story.story,
              tone,
          };
          const result = await generateImage(imageInput);
          setImageUrl(result.imageUrl);
      } catch (e) {
          console.error("Image generation failed:", e);
          setError("Impossible de générer l'illustration pour cette histoire.");
      } finally {
          setIsGeneratingImage(false);
      }
  };

  useEffect(() => {
    // This effect ensures the audio plays automatically once it's loaded
    Object.keys(audioState).forEach(key => {
        const index = parseInt(key, 10);
        const state = audioState[index];
        if (state && state.dataUri && audioRefs.current[index]) {
            // Check if audio is new by seeing if src is different
            if (audioRefs.current[index]!.src !== state.dataUri) {
                audioRefs.current[index]!.src = state.dataUri;
                audioRefs.current[index]!.play().catch(e => console.error("Audio play failed:", e));
            }
        }
    });
  }, [audioState]);


  const getFontSize = () => {
    switch (length) {
      case 'extra-courte': return 'text-xl leading-relaxed';
      case 'courte': return 'text-lg leading-relaxed';
      case 'moyenne': return 'text-base leading-relaxed';
      case 'longue': return 'text-base leading-relaxed';
      default: return 'text-lg';
    }
  }

  const openImmersiveReader = () => {
    if (!story) return;

    // This creates a data URI with simple HTML content to launch in Edge's immersive reader.
    const content = `
        <!DOCTYPE html>
        <html>
        <head><title>${story.title.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</title></head>
        <body>
            <h1>${story.title.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h1>
            <p>${story.story.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\\n/g, '<br/>')}</p>
            <hr>
            <h2>Morale de l'histoire</h2>
            <p><em>${story.moral.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</em></p>
        </body>
        </html>
    `;
    
    const dataUri = `data:text/html,${encodeURIComponent(content)}`;
    window.location.href = `read:${dataUri}`;
  };

  const resetAll = () => {
      setCreationMode(null);
      setSelectedEmojis([]);
      setVocalDescription('');
      setStory(null);
      setError(null);
      setAudioState({});
      audioRefs.current = {};
      setImageUrl(null);
  }

  if (story) {
    const paragraphs = story.story.split('\n').filter(p => p.trim() !== '');

    return (
      <main className="flex min-h-screen w-full flex-col p-4 sm:p-8 bg-background">
        <div className="flex gap-2 mb-8">
            <Button onClick={() => setStory(null)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retourner
            </Button>
            <Button onClick={openImmersiveReader} variant="secondary">
            <BookOpen className="mr-2 h-4 w-4" /> Lecteur immersif
            </Button>
            <Button onClick={() => setShowSyllables(prev => !prev)} variant={showSyllables ? "default" : "secondary"}>
            <SyllableText text="Syllabes" />
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Character Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Users />Personnages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {story.characters.length > 0 ? (
                  <TooltipProvider delayDuration={100}>
                    <ul className="space-y-2">
                      {story.characters.map((char, index) => (
                        <li key={index}>
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-semibold text-lg cursor-default p-2 rounded-md hover:bg-muted">{char.name}</span>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="w-64">
                              <div className="space-y-2 p-2 text-sm">
                                <p><strong className="font-headline text-base">Apparence:</strong> {char.appearance}</p>
                                <p><strong className="font-headline text-base">Caractère:</strong> {char.character}</p>
                                <p><strong className="font-headline text-base">Motivation:</strong> {char.motivation}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </li>
                      ))}
                    </ul>
                  </TooltipProvider>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun personnage principal détecté dans cette histoire.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Story Content */}
          <div className="md:col-span-3">
            <Card className="shadow-xl">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center items-center gap-2 text-3xl">
                    <span className="text-sm font-medium text-muted-foreground">Inspiration :</span>
                    {creationMode === 'emoji' ? selectedEmojis.map(emoji => (
                        <span key={emoji}>{emoji}</span>
                    )) : (
                        <p className="text-base italic text-muted-foreground">"{vocalDescription}"</p>
                    )}
                    </div>
                <CardTitle className="font-headline text-4xl">{story.title}</CardTitle>
                <div className="flex justify-center gap-3 mt-4 flex-wrap">
                    <Button onClick={() => handleGenerateAudio(story.title, -1)} disabled={audioState[-1]?.isLoading}>
                        {audioState[-1]?.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
                        Écouter le titre
                    </Button>
                    {isHalloweenPeriod() && (
                    <Button onClick={handleGenerateImage} disabled={isGeneratingImage} variant="secondary">
                        {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                        {isGeneratingImage ? 'Création...' : (imageUrl ? 'Régénérer l\'illustration' : 'Créer l\'illustration')}
                    </Button>
                    )}
                </div>
                 {audioState[-1]?.dataUri && (
                    <div className="flex justify-center pt-4">
                        <audio controls ref={el => audioRefs.current[-1] = el} src={audioState[-1].dataUri!} />
                    </div>
                )}
                {imageUrl && (
                    <div className="flex justify-center pt-4">
                        <img src={imageUrl} alt={story.title} className="rounded-lg shadow-lg max-w-full h-auto" />
                    </div>
                )}
                </CardHeader>
                <CardContent className="space-y-6">
                {paragraphs.map((paragraph, index) => (
                    <div key={index} className="space-y-3 border-b pb-4 last:border-b-0">
                        <div className={cn("whitespace-pre-wrap font-body", getFontSize())}>
                            {showSyllables ? <SyllableText text={paragraph} /> : <p>{paragraph}</p>}
                        </div>
                        <div className="flex flex-col items-start gap-2">
                            <Button onClick={() => handleGenerateAudio(paragraph, index)} size="sm" variant="outline" disabled={audioState[index]?.isLoading}>
                                {audioState[index]?.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
                                Écouter
                            </Button>
                            {audioState[index]?.dataUri && (
                                <audio controls ref={el => audioRefs.current[index] = el} src={audioState[index].dataUri!} className="h-8" />
                            )}
                        </div>
                    </div>
                ))}
                <div className="border-t pt-4 text-center">
                    <p className="font-semibold text-lg font-headline">Morale de l'histoire</p>
                    {showSyllables ? (
                        <div className="italic text-muted-foreground mt-2"><SyllableText text={story.moral}/></div>
                    ) : (
                        <p className="italic text-muted-foreground mt-2">{story.moral}</p>
                    )}
                    <div className="flex flex-col items-center gap-2 mt-2">
                        <Button onClick={() => handleGenerateAudio(story.moral, -2)} size="sm" variant="outline" disabled={audioState[-2]?.isLoading}>
                                {audioState[-2]?.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
                                Écouter la morale
                        </Button>
                        {audioState[-2]?.dataUri && (
                             <audio controls ref={el => audioRefs.current[-2] = el} src={audioState[-2].dataUri!} className="h-8" />
                        )}
                    </div>
                </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  const halloweenClass = isHalloweenPeriod() ? 'halloween-mode' : '';

  return (
    <main className={`flex min-h-screen w-full flex-col items-center p-4 sm:p-8 ${isHalloweenPeriod() ? 'bg-[#1a0f0a]' : 'bg-background'} ${halloweenClass}`}>
      <div className="w-full max-w-3xl">
         <Button asChild variant="outline" className={isHalloweenPeriod() ? 'halloween-button' : ''}>
            <Link href="/">
             <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
            </Link>
         </Button>
        <Card className={`mt-8 shadow-xl ${isHalloweenPeriod() ? 'halloween-card' : ''}`}>
          <CardHeader className="text-center">
            {isHalloweenPeriod() ? (
              <div className="halloween-header">
                <CardTitle className="font-headline text-4xl halloween-title">La Boîte Maudite</CardTitle>
                <CardDescription className="text-lg halloween-subtitle">
                  Ose ouvrir cette boîte ancienne et libère les histoires interdites...
                </CardDescription>
              </div>
            ) : (
              <>
                <div className="mx-auto bg-primary/20 text-primary p-3 rounded-full w-fit mb-4">
                    <Wand2 className="h-8 w-8"/>
                </div>
                <CardTitle className="font-headline text-4xl">La Boîte à Histoires</CardTitle>
                <CardDescription className="text-lg">
                  Choisis tes ingrédients et crée une histoire unique !
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {!creationMode ? (
                 <div className="space-y-3 pt-6">
                    <Label className="text-lg font-semibold text-center block">Comment veux-tu créer ton histoire ?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <Button variant="outline" className="h-28 flex-col gap-2 text-lg" onClick={() => setCreationMode('emoji')}>
                            <Smile className="h-8 w-8 text-primary"/>
                            Avec des Emojis
                        </Button>
                        <Button variant="outline" className="h-28 flex-col gap-2 text-lg" onClick={() => setCreationMode('vocal')}>
                            <MessageSquareText className="h-8 w-8 text-primary"/>
                            Avec ma voix
                        </Button>
                    </div>
                </div>
            ) : (
             <>
                {/* Inspiration Section */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">1. Décris ton histoire ou choisis des images :</Label>
                   <Button variant="link" size="sm" onClick={() => setCreationMode(null)}>(Changer de mode)</Button>
                  {creationMode === 'emoji' ? (
                      <Card className="p-4 bg-muted/50">
                        <div className="flex flex-wrap gap-3 justify-center">
                          {availableEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleEmojiClick(emoji)}
                              className={cn(
                                'text-4xl p-2 rounded-lg transition-all transform hover:scale-110',
                                selectedEmojis.includes(emoji)
                                  ? 'bg-primary/20 ring-2 ring-primary'
                                  : 'bg-background'
                              )}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </Card>
                  ) : (
                      <div className="flex flex-col items-center gap-4">
                        <Textarea 
                            value={vocalDescription}
                            onChange={(e) => setVocalDescription(e.target.value)}
                            placeholder="Décris les personnages, le lieu, et ce qu'il se passe..."
                            rows={3}
                            className="text-base"
                        />
                        <Button onClick={isListening ? stopListening : startListening} disabled={!isSupported} variant={isListening ? "destructive" : "outline"}>
                            {isListening ? <MicOff className="mr-2"/> : <Mic className="mr-2"/>}
                            {isListening ? 'Arrêter la dictée' : 'Commencer la dictée'}
                        </Button>
                         {!isSupported && <p className="text-xs text-destructive">La reconnaissance vocale n'est pas supportée par ce navigateur.</p>}
                      </div>
                  )}
                </div>
                
                {/* Length Selection */}
                <div className="space-y-3">
                    <Label className="text-lg font-semibold">2. Choisis la longueur de l'histoire :</Label>
                     <RadioGroup value={length} onValueChange={(v) => setLength(v as StoryLength)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <RadioGroupItem value="extra-courte" id="extra-courte" className="sr-only" />
                            <Label htmlFor="extra-courte" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", length === 'extra-courte' && 'border-primary')}>
                                <FileQuestion className="h-8 w-8 mb-2"/> Extra Courte
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="courte" id="courte" className="sr-only" />
                            <Label htmlFor="courte" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", length === 'courte' && 'border-primary')}>
                                <File className="h-8 w-8 mb-2"/> Courte
                            </Label>
                        </div>
                         <div>
                            <RadioGroupItem value="moyenne" id="moyenne" className="sr-only" />
                            <Label htmlFor="moyenne" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", length === 'moyenne' && 'border-primary')}>
                                <FileText className="h-8 w-8 mb-2"/> Moyenne
                            </Label>
                        </div>
                         <div>
                            <RadioGroupItem value="longue" id="longue" className="sr-only" />
                            <Label htmlFor="longue" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", length === 'longue' && 'border-primary')}>
                               <FilePlus className="h-8 w-8 mb-2"/> Longue
                            </Label>
                        </div>
                     </RadioGroup>
                </div>

                 {/* Tone Selection */}
                <div className="space-y-3">
                    <Label className="text-lg font-semibold">3. Choisis le ton de l'histoire :</Label>
                     {isHalloweenPeriod() ? (
                       <RadioGroup value={tone} onValueChange={(v) => setTone(v as StoryTone)} className="grid grid-cols-3 gap-4">
                          <div>
                              <RadioGroupItem value="effrayante" id="effrayante" className="sr-only" />
                              <Label htmlFor="effrayante" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", tone === 'effrayante' && 'border-primary')}>
                                  <Ghost className="h-8 w-8 mb-2"/> Effrayante
                              </Label>
                          </div>
                          <div>
                              <RadioGroupItem value="terrifiante" id="terrifiante" className="sr-only" />
                              <Label htmlFor="terrifiante" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", tone === 'terrifiante' && 'border-primary')}>
                                  <Ghost className="h-8 w-8 mb-2"/> Terrifiante
                              </Label>
                          </div>
                          <div>
                              <RadioGroupItem value="cauchemardesque" id="cauchemardesque" className="sr-only" />
                              <Label htmlFor="cauchemardesque" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer relative", tone === 'cauchemardesque' && 'border-primary')}>
                                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">10+</div>
                                  <Ghost className="h-8 w-8 mb-2"/> Cauchemardesque
                              </Label>
                          </div>
                       </RadioGroup>
                     ) : (
                       <RadioGroup value={tone} onValueChange={(v) => setTone(v as StoryTone)} className="grid grid-cols-3 gap-4">
                          <div>
                              <RadioGroupItem value="aventure" id="aventure" className="sr-only" />
                              <Label htmlFor="aventure" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", tone === 'aventure' && 'border-primary')}>
                                  <Swords className="h-8 w-8 mb-2"/> Aventure
                              </Label>
                          </div>
                           <div>
                              <RadioGroupItem value="comique" id="comique" className="sr-only" />
                              <Label htmlFor="comique" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", tone === 'comique' && 'border-primary')}>
                                 <Drama className="h-8 w-8 mb-2"/> Comique
                              </Label>
                          </div>
                           <div>
                              <RadioGroupItem value="effrayante" id="effrayante" className="sr-only" />
                              <Label htmlFor="effrayante" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", tone === 'effrayante' && 'border-primary')}>
                                  <Ghost className="h-8 w-8 mb-2"/> Effrayante
                              </Label>
                          </div>
                       </RadioGroup>
                     )}
                </div>
                
                {/* Action Button */}
                <div className="pt-4 text-center">
                     <Button size="lg" onClick={handleGenerateStory} disabled={isLoading} className="text-xl py-7">
                        {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-6 w-6" />}
                        {isLoading ? 'Création en cours...' : 'Écrire l\'histoire !'}
                    </Button>
                    {error && <p className="text-destructive mt-4">{error}</p>}
                </div>
             </>
            )}

          </CardContent>
        </Card>
      </div>
    </main>
  );
}
