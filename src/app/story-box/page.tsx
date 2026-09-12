

'use client';

import { useState, useRef, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle as DialogTitleComponent } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Home, Loader2, Sparkles, Wand2, BookOpen, FileText, File, FilePlus, Drama, Swords, Mic, MicOff, MessageSquareText, Smile, Volume2, FileQuestion, Image as ImageIcon, Users, BookHeart, Trash2, Settings2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageBanner, PillLink, PillButton } from '@/components/layout/page-banner';
import { EmptyState, PageShell, SectionLabel } from '@/components/layout/section';
import { generateStory, type StoryInput, type StoryOutput } from '@/ai/flows/story-flow';
import Link from 'next/link';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { Textarea } from '@/components/ui/textarea';
import { generateSpeech, type SpeechInput } from '@/ai/flows/tts-flow';
import { generateImage, type ImageInput } from '@/ai/flows/image-flow';
import { SyllableText } from '@/components/syllable-text';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserContext } from '@/context/user-context';
import { saveStory, getSavedStories, deleteStory, type SavedStory } from '@/services/stories';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// Available emojis for story creation
const availableEmojisList = [
  '👑', '🏰', '🐉', '🦄', '🏴‍☠️', '🚀', '👽', '🤖',
  'détective', '🌲', '🦊', '🦉', '🔑', '🗺️', '💎', '🕰️',
  '🎩', '🧪', '✨', '🍪', '🎈', '⚽', '🎨', '🎤',
  '🧛', '🧟', '👻', '🧜‍♀️', '🧞', 'fées', '🌊', '🌋', '🏜️', '🏝️',
  '🧭', '🏆', '🎁', '🍭', '🍕', '🍰', '🎸', '🎻', '🎭', '🎪',
  '🚂', '⛵', '🚁', 'sous-marin', 'amulette', 'potion', 'sortilège', 'trésor',
  'sorcière', 'ogre', 'loup', 'prince', 'princesse', 'chevalier', 'navire', 'forêt hantée',
  'grotte secrète', 'montagne', 'désert', 'planète lointaine', 'robot ami', 'extraterrestre farceur',
  'école de magie', 'cirque', 'zoo', 'musée', 'parc d\'attractions', 'bibliothèque', 'laboratoire',
  'bague magique', 'épée légendaire', 'tapis volant', 'grimoire ancien', 'portail mystérieux'
];





type ViewState = 'menu' | 'creation' | 'reading' | 'library';
type CreationMode = 'emoji' | 'vocal';
type StoryLength = 'extra-courte' | 'courte' | 'moyenne' | 'longue';
type StoryTone = 'aventure' | 'comique' | 'effrayante';
type AudioState = { [key: number]: { isLoading: boolean; dataUri: string | null } };

export default function StoryBoxPage() {
  const { student } = useContext(UserContext);
  const [viewState, setViewState] = useState<ViewState>('menu');

  // Inputs
  const [creationMode, setCreationMode] = useState<CreationMode | null>(null);
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [vocalDescription, setVocalDescription] = useState('');
  const [length, setLength] = useState<StoryLength>('courte');
  const [tone, setTone] = useState<StoryTone>('aventure');
  
  // Story state
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<StoryOutput | null>(null);
  const [storyInput, setStoryInput] = useState<StoryInput | null>(null);
  const [currentStory, setCurrentStory] = useState<SavedStory | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Library State
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // TTS State
  const [audioState, setAudioState] = useState<AudioState>({});
  const [speakingRate, setSpeakingRate] = useState(0.7);
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});

  // Image State
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Display state
  const [showSyllables, setShowSyllables] = useState(false);

  // Speech recognition state
  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition({
      onResult: (result) => {
          setVocalDescription(prev => `${prev} ${result}`.trim());
      }
  });



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
    setCurrentStory(null);

    const input: StoryInput = {
      emojis: creationMode === 'emoji' ? selectedEmojis : undefined,
      description: creationMode === 'vocal' ? vocalDescription : undefined,
      length,
      tone,
    };
    setStoryInput(input);
    
    try {
      const result = await generateStory(input);
      setStory(result);
      setViewState('reading');
      
      // Auto-save medium and long stories
      if (student && (length === 'moyenne' || length === 'longue')) {
        const saveResult = await saveStory(student, result, input, null);
        if (saveResult.success) {
           setCurrentStory({
               id: saveResult.id,
               authorId: student.id,
               authorName: student.name,
               title: result.title,
               content: result,
               createdAt: new Date().toISOString(),
               ...input
           });
        }
      }
    } catch(e) {
      console.error(e);
      setError('Une erreur est survenue lors de la création de l\'histoire. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

    const handleGenerateAudio = async (text: string, index: number) => {
        if (!text || !story || !student) return;

        const existingAudioUrl = currentStory?.audioUrls?.[index];
        
        // If audio already exists, play it directly
        if(existingAudioUrl) {
            const audio = new Audio(existingAudioUrl);
            audio.play().catch(e => console.error("Audio play failed:", e));
            return;
        }
        
        // If audio is loading, do nothing
        if (audioState[index]?.isLoading) return;

        // If audio data is in state, play it from there
        if(audioState[index]?.dataUri) {
            const audio = new Audio(audioState[index].dataUri!);
            audio.play().catch(e => console.error("Audio play failed:", e));
            return;
        }

        setAudioState(prev => ({ ...prev, [index]: { isLoading: true, dataUri: null } }));
        setError(null);

        try {
            const speechInput: SpeechInput = { text, speakingRate };
            const result = await generateSpeech(speechInput);
            
            // Play the new audio
            const audio = new Audio(result.audioUrl);
            audio.play().catch(e => console.error("Audio play failed:", e));

            // Update state with the new data URI
            setAudioState(prev => ({ ...prev, [index]: { isLoading: false, dataUri: result.audioUrl } }));
            
            // Persist the audio URL to the story document
            await saveStory(student, story, storyInput!, currentStory?.imageUrl ?? null, currentStory?.id, { [index]: result.audioUrl });
            
            // Update local currentStory state to reflect the new audio URL
            setCurrentStory(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    audioUrls: {
                        ...(prev.audioUrls || {}),
                        [index]: result.audioUrl
                    }
                };
            });

        } catch (e: any) {
            console.error("Audio generation failed:", e);
            setError(`Impossible de générer l'audio : ${e.message || "Erreur inconnue"}`);
            setAudioState(prev => ({ ...prev, [index]: { isLoading: false, dataUri: null } }));
        }
    };

    const handleGenerateImage = async () => {
        if (!story || !student) return;

        setIsGeneratingImage(true);
        setError(null);
        try {
            const imageInput: ImageInput = {
                storyTitle: story.title,
                storyContent: story.story,
                tone,
            };
            const result = await generateImage(imageInput);
            
            const saveResult = await saveStory(student, story, storyInput!, result.imageUrl, currentStory?.id);

            if (saveResult.success) {
                setCurrentStory(prev => prev ? ({ ...prev, imageUrl: result.imageUrl, id: saveResult.id }) : ({
                    id: saveResult.id,
                    authorId: student.id,
                    authorName: student.name,
                    title: story.title,
                    content: story,
                    imageUrl: result.imageUrl,
                    createdAt: new Date().toISOString(),
                    ...storyInput
                }));
            }

        } catch (e) {
            console.error("Image generation failed:", e);
            setError("Impossible de générer l'illustration pour cette histoire.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

  const getFontSize = () => {
    switch (length) {
      case 'extra-courte': return 'text-xl leading-relaxed';
      case 'courte': return 'text-lg leading-relaxed';
      case 'moyenne': return 'text-base leading-relaxed';
      case 'longue': return 'text-base leading-relaxed';
      default: return 'text-lg';
    }
  };

  const openImmersiveReader = () => {
    if (!story) return;
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

  const resetCreation = () => {
    setCreationMode(null);
    setSelectedEmojis([]);
    setVocalDescription('');
    setStory(null);
    setError(null);
    setAudioState({});
    audioRefs.current = {};
    setCurrentStory(null);
    setStoryInput(null);
    setViewState('menu');
  };

  const handleOpenLibrary = async () => {
    setIsLoadingLibrary(true);
    setViewState('library');
    try {
        const stories = await getSavedStories();
        setSavedStories(stories);
    } catch(e) {
        setError("Impossible de charger les histoires sauvegardées.");
    } finally {
        setIsLoadingLibrary(false);
    }
  };

  const handleReadStory = (savedStory: SavedStory) => {
    setStory(savedStory.content);
    setCurrentStory(savedStory);
    setAudioState({});
    const inputLength = savedStory.content.story.length;
    const determinedLength: StoryLength = inputLength < 200 ? 'extra-courte' : inputLength < 800 ? 'courte' : inputLength < 2000 ? 'moyenne' : 'longue';
    setStoryInput({
        emojis: savedStory.emojis,
        description: savedStory.description,
        length: determinedLength,
        tone: 'aventure' // Placeholder, tone is not saved yet.
    });
    setViewState('reading');
  };

  const handleDeleteStory = async (storyId: string) => {
    const result = await deleteStory(storyId);
    if (result.success) {
      setSavedStories(prev => prev.filter(s => s.id !== storyId));
    } else {
      alert('Erreur lors de la suppression : ' + (result.error || 'Erreur inconnue'));
    }
  };

  if (viewState === 'reading' && story) {
    const paragraphs = story.story.split('\n').filter(p => p.trim() !== '');
    return (
      <main className="flex min-h-screen w-full flex-col p-4 sm:p-8 bg-background">
        <div className="flex gap-2 mb-8 items-center">
            <Button onClick={() => setViewState('menu')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button onClick={openImmersiveReader} variant="secondary">
                <BookOpen className="mr-2 h-4 w-4" /> Lecteur immersif
            </Button>
            <Button onClick={() => setShowSyllables(prev => !prev)} variant={showSyllables ? "default" : "secondary"}>
                Syllabes
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary">
                  <Settings2 className="mr-2 h-4 w-4" /> Vitesse ({speakingRate.toFixed(2)}x)
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-4">
                <div className="space-y-4">
                  <Label htmlFor="speed-slider">Vitesse de lecture</Label>
                  <Slider
                    id="speed-slider"
                    min={0.25}
                    max={1.5}
                    step={0.05}
                    value={[speakingRate]}
                    onValueChange={(value) => setSpeakingRate(value[0])}
                  />
                </div>
              </PopoverContent>
            </Popover>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr,250px] gap-8">
          {/* Character Sidebar (Left) */}
          <div className="lg:sticky lg:top-8 self-start order-2 lg:order-1">
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
                  <p className="text-sm text-muted-foreground">Aucun personnage principal détecté.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Story Content (Center) */}
          <div className="order-1 lg:order-2">
            <Card className="shadow-xl">
                <CardHeader className="text-center">
                    {storyInput && (
                    <div className="mb-4 flex justify-center items-center gap-2 text-3xl">
                        <span className="text-sm font-medium text-muted-foreground">Inspiration :</span>
                        {storyInput.emojis && storyInput.emojis.length > 0 ? storyInput.emojis.map(emoji => (
                            <span key={emoji}>{emoji}</span>
                        )) : (
                            <p className="text-base italic text-muted-foreground">"{storyInput.description}"</p>
                        )}
                    </div>
                    )}
                <CardTitle className="font-headline text-4xl">{story.title}</CardTitle>
                <div className="flex justify-center gap-3 mt-4 flex-wrap">
                    <Button onClick={() => handleGenerateAudio(story.title, -1)} disabled={audioState[-1]?.isLoading}>
                        {audioState[-1]?.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
                        Écouter le titre
                    </Button>
                </div>
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
                    </div>
                </div>
                </CardContent>
            </Card>
          </div>

          {/* Illustration Sidebar (Right) */}
           <div className="lg:sticky lg:top-8 self-start order-3">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <ImageIcon />
                        Illustration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(!currentStory?.imageUrl) && (
                      <Button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full">
                        {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Générer l'illustration
                      </Button>
                    )}
                    {isGeneratingImage && !currentStory?.imageUrl && (
                        <div className="aspect-portrait bg-muted rounded-lg flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin"/>
                        </div>
                    )}
                    {currentStory?.imageUrl ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <img src={currentStory.imageUrl} alt={story.title} className="rounded-lg shadow-lg aspect-portrait object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                            </DialogTrigger>
                             <DialogContent className="max-w-[90vw] max-h-[90vh] p-4">
                                <DialogHeader>
                                    <DialogTitleComponent className="sr-only">{story.title}</DialogTitleComponent>
                                </DialogHeader>
                                <img src={currentStory.imageUrl} alt={story.title} className="w-full h-full object-contain rounded-lg" />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        !isGeneratingImage && (
                            <div className="aspect-portrait bg-muted rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                            </div>
                        )
                    )}
                    {error && <p className="text-destructive text-sm">{error}</p>}
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if(viewState === 'library') {
    return (
      <PageShell>
        <PageBanner
            icon={<BookOpen />}
            title="Ma bibliothèque"
            subtitle="Toutes les histoires que tu as gardées."
            actions={
                <>
                    <PillButton icon={ArrowLeft} onClick={() => setViewState('menu')}>Retour</PillButton>
                    <PillButton icon={Wand2} onClick={() => setViewState('creation')}>Nouvelle histoire</PillButton>
                </>
            }
        />
        <div className="w-full">
            {isLoadingLibrary ? (
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary"/>
            ) : savedStories.length === 0 ? (
                <EmptyState icon={<BookHeart />} title="Ta bibliothèque est vide">
                    Crée ta première histoire, elle viendra se ranger ici.
                </EmptyState>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedStories.map(s => (
                        <Card
                            key={s.id}
                            className="flex flex-col cursor-pointer hover:shadow-lg hover:border-primary transition-shadow relative group"
                        >
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity z-10">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Êtes-vous sûr de vouloir supprimer définitivement l'histoire "{s.title}" ? Cette action est irréversible.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteStory(s.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Supprimer
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex-grow" onClick={() => handleReadStory(s)}>
                                {s.imageUrl && (
                                    <img src={s.imageUrl} alt={s.title} className="rounded-t-lg aspect-[4/3] object-cover" />
                                )}
                                <CardHeader>
                                    <CardTitle>{s.title}</CardTitle>
                                    <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={s.authorShowPhoto ? s.authorPhotoURL : undefined} />
                                            <AvatarFallback>{s.authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{s.authorName}</p>
                                            <p className="text-xs">{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: fr })}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground line-clamp-4">{s.content.story}</p>
                                </CardContent>
                                <CardFooter className='pt-0'>
                                    {s.emojis && s.emojis.length > 0 && <div className="text-xl">{s.emojis.join(' ')}</div>}
                                </CardFooter>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </PageShell>
    );
  }

  // Fallback to menu view
  return (
    <PageShell>
      <PageBanner
        icon={<BookHeart />}
        title="La boîte à histoires"
        subtitle="Invente des histoires avec des emojis ou avec ta voix."
        actions={
            <>
                {viewState === 'creation' && <PillButton icon={ArrowLeft} onClick={() => setViewState('menu')}>Retour</PillButton>}
                <PillLink href="/en-classe" icon={Sparkles}>En classe</PillLink>
                <PillLink href="/" icon={Home}>Accueil</PillLink>
            </>
        }
      />
      <div className="mx-auto w-full max-w-3xl">
        {viewState === 'menu' ? (
             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Deux portes d'entrée, aussi grosses l'une que l'autre :
                    créer, ou relire ce qu'on a déjà écrit. */}
                <button
                    type="button"
                    onClick={() => setViewState('creation')}
                    className="group flex flex-col items-center gap-3 rounded-[22px] border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-accent/10 p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-md transition-transform group-hover:scale-110">
                        <Wand2 className="h-8 w-8"/>
                    </span>
                    <span className="font-headline text-2xl">Créer une histoire</span>
                    <span className="text-sm text-muted-foreground">Avec des emojis ou avec ta voix</span>
                </button>
                <button
                    type="button"
                    onClick={handleOpenLibrary}
                    className="group flex flex-col items-center gap-3 rounded-[22px] border-2 border-dashed bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-primary transition-transform group-hover:scale-110">
                        <BookOpen className="h-8 w-8"/>
                    </span>
                    <span className="font-headline text-2xl">Ma bibliothèque</span>
                    <span className="text-sm text-muted-foreground">Relire mes histoires gardées</span>
                </button>
            </div>
        ) : ( // viewState === 'creation'
            <Card className="rounded-[22px] shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-4xl">Nouvelle histoire</CardTitle>
                <CardDescription className="text-lg">
                    Choisis tes ingrédients et crée une histoire unique !
                </CardDescription>
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
                            {availableEmojisList.map((emoji) => (
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
                                    <Swords className="h-8 w-8 mb-2"/> Effrayante
                                </Label>
                            </div>
                        </RadioGroup>
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
        )}
      </div>
    </PageShell>
  );
}
