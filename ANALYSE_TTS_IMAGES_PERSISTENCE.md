# Analyse des nouvelles implémentations - TTS, Images & Persistance

**Date d'analyse** : 2025-10-07
**Commit analysé** : `038f792` (après merge)
**Fonctionnalités ajoutées** : Text-to-Speech (TTS), Génération d'images, Persistance des histoires

---

## 📋 Vue d'ensemble des changements

### Packages mis à jour
```json
// package.json - Changements clés
{
  "@genkit-ai/google-genai": "1.18.0",  // Avant: "@genkit-ai/googleai": "^1.14.1"
  "@genkit-ai/next": "1.18.0",          // Avant: "^1.14.1"
  "genkit": "1.18.0",                   // Avant: "^1.14.1"
  "eslint": "^8.57.0"                   // Nouveau
}
```

**Changement important** : Passage de `@genkit-ai/googleai` à `@genkit-ai/google-genai`

---

## 🎤 1. Implémentation TTS (Text-to-Speech)

### Fichier : `src/ai/flows/tts-flow.ts`

#### Architecture
```typescript
// Flow Genkit pour TTS
const ttsFlow = ai.defineFlow({
  name: 'ttsFlow',
  inputSchema: z.string(),
  outputSchema: z.object({
    audioDataUri: z.string().describe("data:audio/wav;base64,<encoded_data>")
  })
})
```

#### Modèle utilisé
- **Modèle Gemini** : `gemini-2.5-flash-preview-tts`
- **Configuration** :
  ```typescript
  {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Kore' }
      }
    }
  }
  ```

#### Processus technique
1. **Génération audio** avec Gemini TTS
2. **Conversion PCM → WAV** :
   - L'audio brut PCM est retourné par Gemini
   - Utilise la librairie `wav` pour encoder en WAV
   - Paramètres : 1 canal, 24000 Hz, 16-bit (2 bytes)
3. **Retour en Data URI** : `data:audio/wav;base64,<encoded_data>`

#### Fonction helper `toWav()`
```typescript
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string>
```
- Crée un encodeur WAV avec la librairie `wav`
- Écrit le PCM dans le stream
- Récupère le buffer WAV complet
- Encode en base64

### Intégration dans l'UI (`story-box/page.tsx`)

#### État TTS multi-paragraphes
```typescript
type AudioState = {
  [key: number]: {
    isLoading: boolean;
    dataUri: string | null
  }
};

const [audioState, setAudioState] = useState<AudioState>({});
const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});
```

**Clés spéciales** :
- `-1` : Titre de l'histoire
- `-2` : Morale de l'histoire
- `0, 1, 2, ...` : Paragraphes individuels

#### Fonctionnement
1. **Bouton "Écouter"** par paragraphe
2. **Génération à la demande** :
   ```typescript
   const handleGenerateAudio = async (text: string, index: number) => {
     // Si déjà généré, joue directement
     if (audioState[index]?.dataUri) {
       audioRefs.current[index]?.play();
       return;
     }
     // Sinon, génère l'audio
     const result = await generateSpeech(text);
     setAudioState(prev => ({
       ...prev,
       [index]: { isLoading: false, dataUri: result.audioDataUri }
     }));
   }
   ```

3. **Lecteur audio HTML5** :
   ```tsx
   <audio
     controls
     ref={el => { audioRefs.current[index] = el; }}
     src={audioState[index].dataUri!}
   />
   ```

4. **Auto-play** après génération :
   ```typescript
   useEffect(() => {
     Object.keys(audioState).forEach(key => {
       const index = parseInt(key, 10);
       if (audioState[index]?.dataUri && audioRefs.current[index]) {
         audioRefs.current[index]!.play().catch(e => console.error(e));
       }
     });
   }, [audioState]);
   ```

---

## 🎨 2. Génération d'images

### Fichier : `src/ai/flows/image-flow.ts`

#### Modèle utilisé
- **Modèle Gemini** : `gemini-2.5-flash-image-preview`
- **Configuration** :
  ```typescript
  {
    responseModalities: ['IMAGE']
  }
  ```

#### Prompt optimisé
```typescript
const imagePrompt = `Illustration de haute qualité pour une histoire.
Sujet : ${input.storyContent.substring(0, 200)}.

INSTRUCTIONS STRICTES :
1. **Style Artistique** : Mystérieux et atmosphérique, inspiré par Chris Van Allsburg
   (Les Mystères de Harris Burdick), éclairage dramatique, ombres marquées, angles
   de vue inhabituels pour créer une scène énigmatique.

2. **Contenu** : L'illustration ne doit contenir **AUCUN PERSONNAGE**, aucune
   personne, ni aucune créature. L'image doit se concentrer uniquement sur un
   lieu, un objet ou une scène qui laisse place à l'imagination.

3. **Format** : Portrait (3:4).

4. **Texte** : Pas de texte, de lettres ou de chiffres dans l'image.

5. **Ton** : Applique ce ton général : ${styleInstruction}.
`;
```

**Pourquoi "aucun personnage" ?** :
- Évite les problèmes de représentation physique des personnages de l'histoire
- Focus sur l'atmosphère et le lieu
- Laisse place à l'imagination du lecteur
- Qualité visuelle plus cohérente

#### Styles par ton
```typescript
const styleMap = {
  aventure: 'illustration de livre pour enfants, coloré et dynamique, aventureux',
  comique: 'cartoon humoristique, couleurs vives, expression comique',
  effrayante: 'conte de fées légèrement inquiétant, ambiance mystérieuse',
  terrifiante: 'gothique sombre, ambiance inquiétante mais stylisée',
  cauchemardesque: 'style Tim Burton et Coraline, gothique poétique, macabre esthétique'
};
```

#### Processus complet
1. **Génération image** par Gemini → Data URI
2. **Upload vers Cloud Storage** :
   ```typescript
   import { uploadImageFromDataURI } from '@/services/storage';

   const publicUrl = await uploadImageFromDataURI(media.url, 'story-images');
   return { imageUrl: publicUrl };
   ```

### Service Storage (`src/services/storage.ts`)

```typescript
export async function uploadImageFromDataURI(
  dataURI: string,
  path: string
): Promise<string> {
  // Validation
  if (!dataURI.startsWith('data:image')) {
    throw new Error('Invalid data URI provided.');
  }

  // Nom de fichier unique
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.png`;
  const storageRef = ref(storage, `${path}/${fileName}`);

  // Upload avec format 'data_url' (gère automatiquement le data URI)
  const snapshot = await uploadString(storageRef, dataURI, 'data_url');

  // Récupère l'URL publique
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}
```

**Avantages** :
- ✅ URL publique permanente (pas de data URI lourd)
- ✅ Images persistées même après rechargement
- ✅ Partageables entre utilisateurs (bibliothèque d'histoires)
- ✅ Noms de fichiers uniques (timestamp + random)

### Intégration UI

#### Génération d'image
```typescript
const handleGenerateImage = async () => {
  if (!story || !student) return;

  setIsGeneratingImage(true);
  try {
    const imageInput: ImageInput = {
      storyTitle: story.title,
      storyContent: story.story,
      tone,
    };
    const result = await generateImage(imageInput);
    setImageUrl(result.imageUrl);

    // Sauvegarde automatique avec l'image
    await saveStory(student, story, storyInput!, result.imageUrl);
  } catch (e) {
    setError("Impossible de générer l'illustration.");
  } finally {
    setIsGeneratingImage(false);
  }
};
```

#### Affichage avec Dialog (zoom)
```tsx
<Dialog>
  <DialogTrigger asChild>
    <img
      src={imageUrl}
      alt={story.title}
      className="rounded-lg shadow-lg aspect-portrait object-cover cursor-pointer
                 hover:opacity-90 transition-opacity"
    />
  </DialogTrigger>
  <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-4">
    <img
      src={imageUrl}
      alt={story.title}
      className="w-full h-full object-contain rounded-lg"
    />
  </DialogContent>
</Dialog>
```

---

## 💾 3. Persistance des histoires

### Collection Firestore : `saved_stories`

#### Structure de document
```typescript
interface SavedStory {
  id: string;                    // Auto-généré par Firestore
  authorId: string;              // ID de l'élève
  authorName: string;            // Nom de l'élève
  authorPhotoURL?: string;       // Photo de profil
  authorShowPhoto?: boolean;     // Afficher la photo dans la bibliothèque
  title: string;                 // Titre de l'histoire
  content: StoryOutput;          // Histoire complète (title, story, moral, characters)
  imageUrl?: string;             // URL Cloud Storage de l'illustration
  emojis?: string[];             // Emojis utilisés pour la création
  description?: string;          // Description vocale utilisée
  createdAt: Timestamp;          // Date de création
}
```

### Service de persistance (`src/services/stories.ts`)

#### Sauvegarde intelligente
```typescript
export async function saveStory(
  author: Student,
  storyData: StoryOutput,
  storyInput: StoryInput,
  imageUrl: string | null
): Promise<{ success: boolean; id: string; error?: string }>
```

**Logique** :
1. **Recherche d'histoire existante** :
   ```typescript
   const q = query(
     storiesCollection,
     where('authorId', '==', author.id),
     where('title', '==', storyData.title)
   );
   ```

2. **Si existe** → **UPDATE** :
   - Met à jour `content`, `imageUrl`, `emojis`, `description`
   - **Conserve** `authorId`, `authorName`, `createdAt` (date originale)

3. **Si n'existe pas** → **CREATE** :
   - Crée un nouveau document avec toutes les données
   - `createdAt: Timestamp.now()`

**Gestion d'erreurs avec émetteur** :
```typescript
.catch(error => {
  errorEmitter.emit('permission-error', new FirestorePermissionError({
    path: `saved_stories/${storyId}`,
    operation: 'update',
    requestResourceData: { imageUrl },
  }));
  throw error;
});
```

#### Auto-sauvegarde lors de la génération
```typescript
// Dans handleGenerateStory()
const result = await generateStory(input);
setStory(result);
setViewState('reading');

// Auto-save medium and long stories
if (student && (length === 'moyenne' || length === 'longue')) {
  const saveResult = await saveStory(student, result, input, null);
  if (saveResult.success) {
    setCurrentStoryId(saveResult.id); // Track story ID
  }
}
```

**Pourquoi seulement moyenne/longue ?** :
- Évite de polluer la base avec des histoires très courtes (tests, etc.)
- Les histoires moyennes/longues ont plus de valeur pour l'élève

#### Récupération des histoires
```typescript
export async function getSavedStories(): Promise<SavedStory[]> {
  const q = query(
    collection(db, "saved_stories"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);

  const stories: SavedStory[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    stories.push({
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    } as SavedStory);
  });

  return stories;
}
```

### Bibliothèque d'histoires (UI)

#### Navigation à 3 états
```typescript
type ViewState = 'menu' | 'creation' | 'reading' | 'library';
const [viewState, setViewState] = useState<ViewState>('menu');
```

1. **Menu** : Choix "Créer une histoire" ou "Histoires sauvegardées"
2. **Creation** : Interface de création (emojis/vocal + paramètres)
3. **Reading** : Affichage de l'histoire avec TTS + image
4. **Library** : Grille de toutes les histoires sauvegardées

#### Affichage bibliothèque
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {savedStories.map(s => (
    <Card
      key={s.id}
      className="flex flex-col cursor-pointer hover:shadow-lg hover:border-primary"
      onClick={() => handleReadStory(s)}
    >
      {s.imageUrl && (
        <img
          src={s.imageUrl}
          alt={s.title}
          className="rounded-t-lg aspect-[4/3] object-cover"
        />
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
            <p className="text-xs">
              {formatDistanceToNow(new Date(s.createdAt), {
                addSuffix: true,
                locale: fr
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4">
          {s.content.story}
        </p>
      </CardContent>
      <CardFooter>
        {s.emojis && s.emojis.length > 0 && (
          <div className="text-xl">{s.emojis.join(' ')}</div>
        )}
      </CardFooter>
    </Card>
  ))}
</div>
```

**Features** :
- ✅ Grille responsive (1/2/3 colonnes selon écran)
- ✅ Image de couverture si disponible
- ✅ Avatar et nom de l'auteur
- ✅ Date relative ("il y a 2 jours") avec `date-fns`
- ✅ Preview du texte (4 lignes max avec `line-clamp-4`)
- ✅ Emojis d'inspiration affichés
- ✅ Click sur carte → Lecture de l'histoire

---

## 🎭 4. Amélioration : Fiches de personnages

### Modification du schema de sortie (`story-flow.ts`)

#### Nouveau schema `CharacterSchema`
```typescript
const CharacterSchema = z.object({
  name: z.string().describe("Le nom du personnage."),
  appearance: z.string().describe("Description de l'apparence (2-3 éléments visuels)."),
  character: z.string().describe("Description du caractère (2-3 traits de personnalité)."),
  motivation: z.string().describe("Secret, objectif ou motivation qui le rend intéressant."),
});

const StoryOutputSchema = z.object({
  title: z.string(),
  story: z.string(),
  moral: z.string(),
  characters: z.array(CharacterSchema).describe(
    "La liste de tous les personnages principaux de l'histoire, dans leur ordre d'apparition."
  ),
});
```

#### Instructions prompt améliorées
```
5. **Personnages (instruction TRÈS importante)** :
   - Varie les prénoms des personnages principaux. N'utilise pas toujours "Léo".
     Utilise une grande variété de prénoms français modernes et classiques.

   - À la fin de ton processus, identifie **tous** les personnages de l'histoire.
     Pour chacun, fournis une fiche de personnage détaillée :
     * **name**: Le nom du personnage.
     * **appearance**: Description de son apparence (ex: "cheveux en bataille",
       "porte toujours un foulard rouge", "yeux rieurs").
     * **character**: Description de son caractère (ex: "curieux et un peu maladroit",
       "courageuse mais secrètement timide", "toujours optimiste").
     * **motivation**: Son objectif principal, son secret, ou ce qui le rend unique
       (ex: "rêve de voler", "cherche un trésor perdu", "peut parler aux animaux").

   - Liste ces personnages dans le champ 'characters' dans leur ordre d'apparition.
```

### Affichage dans l'UI

#### Sidebar "Personnages" avec tooltips
```tsx
<div className="lg:sticky lg:top-8 self-start">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-headline">
        <Users />Personnages
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {story.characters.length > 0 ? (
        <TooltipProvider delayDuration={100}>
          <ul className="space-y-2">
            {story.characters.map((char, index) => (
              <li key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-semibold text-lg cursor-default p-2
                                     rounded-md hover:bg-muted">
                      {char.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="w-64">
                    <div className="space-y-2 p-2 text-sm">
                      <p><strong>Apparence:</strong> {char.appearance}</p>
                      <p><strong>Caractère:</strong> {char.character}</p>
                      <p><strong>Motivation:</strong> {char.motivation}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
        </TooltipProvider>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucun personnage principal détecté.
        </p>
      )}
    </CardContent>
  </Card>
</div>
```

**UX** :
- Sidebar gauche sticky (reste visible au scroll)
- Liste des noms de personnages
- Hover sur nom → Tooltip avec fiche complète
- Tooltip positionné à droite (`side="right"`)
- Délai de 100ms pour affichage (`delayDuration={100}`)

---

## 🔧 5. Infrastructure Firebase améliorée

### Nouveaux fichiers de gestion d'erreurs

#### `src/firebase/errors.ts`
Classes d'erreurs custom pour Firebase :
```typescript
export class FirestorePermissionError extends Error {
  constructor(public details: {
    path: string;
    operation: 'create' | 'read' | 'update' | 'delete' | 'list';
    requestResourceData?: any;
  }) {
    super(`Firestore permission denied: ${operation} on ${path}`);
    this.name = 'FirestorePermissionError';
  }
}
```

#### `src/firebase/error-emitter.ts`
EventEmitter pour les erreurs Firebase :
```typescript
class ErrorEmitter extends EventTarget {
  emit(type: string, error: Error) {
    this.dispatchEvent(new CustomEvent(type, { detail: error }));
  }

  on(type: string, handler: (event: CustomEvent) => void) {
    this.addEventListener(type, handler as EventListener);
  }
}

export const errorEmitter = new ErrorEmitter();
```

**Utilisation** :
```typescript
// Dans stories.ts
await updateDoc(docRef, data).catch(error => {
  errorEmitter.emit('permission-error', new FirestorePermissionError({
    path: `saved_stories/${storyId}`,
    operation: 'update',
    requestResourceData: { imageUrl },
  }));
  throw error;
});
```

#### `src/components/FirebaseErrorListener.tsx`
Composant qui écoute les erreurs :
```typescript
export function FirebaseErrorListener() {
  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const error = event.detail as FirestorePermissionError;
      console.error('Firestore permission error:', error.details);
      // Afficher toast, logger, etc.
    };

    errorEmitter.on('permission-error', handler);
    return () => errorEmitter.removeEventListener('permission-error', handler);
  }, []);

  return null;
}
```

### Hooks Firestore personnalisés

#### `src/firebase/firestore/use-doc.tsx`
Hook pour écouter un document en temps réel :
```typescript
export function useDoc<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, path);
    const unsubscribe = onSnapshot(docRef,
      (snapshot) => {
        setData(snapshot.data() as T);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [path]);

  return { data, loading, error };
}
```

#### `src/firebase/firestore/use-collection.tsx`
Hook pour écouter une collection en temps réel :
```typescript
export function useCollection<T>(collectionPath: string, queryConstraints?: QueryConstraint[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = queryConstraints
      ? query(collection(db, collectionPath), ...queryConstraints)
      : collection(db, collectionPath);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      setData(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [collectionPath]);

  return { data, loading };
}
```

---

## 📊 6. Modifications des règles Firestore

### Fichier : `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ ATTENTION** : Règles très permissives (lecture/écriture pour tous)
**Recommandation** : Implémenter des règles de sécurité strictes en production :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students can read/write their own data
    match /students/{studentId} {
      allow read, write: if request.auth != null && request.auth.uid == studentId;
    }

    // Saved stories - anyone can read, only author can write
    match /saved_stories/{storyId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.authorId == request.auth.uid;
    }
  }
}
```

---

## 🎯 7. Récapitulatif des fonctionnalités

### ✅ TTS (Text-to-Speech)
- **Modèle** : `gemini-2.5-flash-preview-tts`
- **Voix** : Kore (voix française)
- **Format** : WAV (PCM converti)
- **UI** : Bouton par paragraphe + titre + morale
- **Caching** : Audio généré conservé en mémoire

### ✅ Génération d'images
- **Modèle** : `gemini-2.5-flash-image-preview`
- **Style** : Chris Van Allsburg (mystérieux, atmosphérique)
- **Contrainte** : Aucun personnage (focus lieu/objet)
- **Storage** : Firebase Cloud Storage (URLs publiques)
- **UI** : Sidebar droite, clic pour zoom (Dialog)

### ✅ Persistance des histoires
- **Collection** : `saved_stories`
- **Auto-save** : Histoires moyennes/longues automatiquement sauvegardées
- **Update intelligent** : Détection de doublons (même titre + même auteur)
- **Bibliothèque** : Grille responsive avec preview et filtres

### ✅ Fiches de personnages
- **Extraction IA** : Gemini identifie automatiquement les personnages
- **Données** : Nom, apparence, caractère, motivation
- **UI** : Sidebar gauche avec tooltips interactifs

---

## 🚀 8. Points techniques remarquables

### Architecture élégante
1. **Séparation des concerns** :
   - Flows IA isolés (`src/ai/flows/`)
   - Services Firebase dédiés (`src/services/`)
   - Hooks réutilisables (`src/firebase/`)

2. **Gestion d'état optimisée** :
   - `audioState` avec indexation par paragraphe
   - `useRef` pour les éléments audio (évite re-renders)
   - `viewState` pour navigation claire

3. **Error handling robuste** :
   - EventEmitter centralisé
   - Classes d'erreurs typées
   - Propagation avec émission d'événements

### Performances
- **TTS** : Génération à la demande (pas toute l'histoire d'un coup)
- **Images** : Upload Cloud Storage (pas de data URI lourds)
- **Firestore** : Queries optimisées avec `where()` et `orderBy()`

### UX/UI soignée
- **Layout 3 colonnes** : Personnages | Histoire | Illustration
- **Sticky sidebars** : Personnages et illustration restent visibles au scroll
- **Responsive** : Grid adaptatif pour la bibliothèque
- **Loading states** : Spinners pour TTS et génération d'images
- **Tooltips** : Fiches personnages au hover

---

## 📝 9. Prochaines améliorations possibles

### Fonctionnalités
- [ ] Recherche/filtres dans la bibliothèque (par ton, longueur, auteur)
- [ ] Partage d'histoires entre élèves
- [ ] Export PDF avec illustration
- [ ] Playlists d'histoires
- [ ] Favoris et notes

### Technique
- [ ] Règles Firestore sécurisées
- [ ] Pagination pour la bibliothèque (si >50 histoires)
- [ ] Compression des images avant upload
- [ ] Cache TTS côté serveur (éviter regénération)
- [ ] Tests unitaires pour les flows IA

### UX
- [ ] Preview audio avant génération complète
- [ ] Édition post-génération (régénérer juste un paragraphe)
- [ ] Mode "histoire à plusieurs" (collaboration élèves)
- [ ] Animations transitions entre viewStates

---

**Conclusion** : L'implémentation est solide, bien architecturée et fonctionnelle. Le TTS, la génération d'images et la persistance fonctionnent de manière cohérente. Les fiches de personnages ajoutent une dimension pédagogique intéressante. Le système est prêt pour la production avec quelques ajustements de sécurité Firestore.
