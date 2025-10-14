# Logiques Implémentées - Classe Magique

## Document de référence technique pour le développement

**Date de création:** 2025-10-13
**Objectif:** Comprendre rapidement les mécanismes clés du projet pour rester sur les bons rails

---

## Table des matières

1. [Flux d'authentification](#1-flux-dauthentification)
2. [Système de pépites (Nuggets)](#2-système-de-pépites-nuggets)
3. [Gestion des scores et progression](#3-gestion-des-scores-et-progression)
4. [Contexte utilisateur et état global](#4-contexte-utilisateur-et-état-global)
5. [Architecture des exercices](#5-architecture-des-exercices)
6. [Intégration IA avec Genkit](#6-intégration-ia-avec-genkit)
7. [Système de présence en temps réel](#7-système-de-présence-en-temps-réel)
8. [Gestion Firebase](#8-gestion-firebase)
9. [Patterns de développement à suivre](#9-patterns-de-développement-à-suivre)
10. [Points d'attention critiques](#10-points-dattention-critiques)

---

## 1. Flux d'authentification

### Principe
Authentication simple adaptée aux enfants : **Prénom + Code à 4 chiffres**

### Implémentation (`src/app/page.tsx` + `src/services/students.ts`)

```typescript
// Étape 1: L'utilisateur saisit prénom + code
const handleSubmit = async (e: FormEvent) => {
    const loggedInStudent = await loginStudent(name, code);
    if (loggedInStudent) {
        setStudent(loggedInStudent); // Stocké dans le contexte
    }
}

// Étape 2: loginStudent cherche dans Firestore
export async function loginStudent(name: string, code: string) {
    // Recherche case-insensitive sur le prénom
    if (studentData.name.toLowerCase() === name.trim().toLowerCase()
        && studentData.code === code) {
        return studentObject;
    }
    return null; // Échec de connexion
}
```

### Persistance de session
- **SessionStorage:** `classemagique_student_id` stocke l'ID de l'élève
- **Cookie:** Également stocké pour compatibilité server-side
- **Durée:** 1 jour (86400 secondes)

**Fichier:** `src/context/user-context.tsx:106-110`

```typescript
sessionStorage.setItem('classemagique_student_id', studentData.id);
document.cookie = `classemagique_student_id=${studentData.id}; path=/; max-age=86400`;
```

### Déconnexion
```typescript
const handleLogout = () => {
    setStudent(null); // Efface le contexte
    sessionStorage.removeItem('classemagique_student_id');
    document.cookie = 'classemagique_student_id=; max-age=-1';
}
```

---

## 2. Système de pépites (Nuggets)

### Principe
Monnaie virtuelle gagnée après chaque exercice pour motiver les élèves. Peut être dépensée pour jouer à des jeux.

### Calcul des pépites (`src/lib/nuggets.ts`)

#### Règle générale (exercices basés sur pourcentage)
```typescript
if (score >= 90) return 3;  // Excellence
if (score >= 80) return 2;  // Très bien
if (score >= 70) return 1;  // Bien
return 0;                    // En dessous de 70%
```

#### Règles spéciales

**Exercices de complétion** (fluence, décodage, etc.)
```typescript
const completionBasedSkills = [
    'fluence', 'reading-race', 'decoding',
    'syllable-table', 'writing-notebook', 'lire-des-phrases'
];
// Récompense fixe : 2 pépites si score > 0
```

**Exercices d'orthographe** (plus difficiles)
```typescript
if (skillSlug.startsWith('orthographe-')) {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    return 0; // Pas de pépites en dessous de 70%
}
```

### Attribution atomique des pépites

**IMPORTANT:** Les pépites sont ajoutées via une **transaction Firestore** pour éviter les incohérences.

**Fichier:** `src/services/scores.ts:47-86`

```typescript
export async function addScore(scoreData) {
    await runTransaction(db, async (transaction) => {
        // 1. Calculer les pépites
        nuggetsEarned = calculateNuggets(scoreData.score, scoreData.skill);

        // 2. Ajouter le score
        transaction.set(scoreRef, {...scoreData});

        // 3. Mettre à jour le compte de pépites
        transaction.update(studentRef, {
            nuggets: currentNuggets + nuggetsEarned
        });
    });
}
```

### Dépense de pépites

**Fichier:** `src/services/students.ts:276-305`

```typescript
export async function spendNuggets(studentId: string, amount: number) {
    await runTransaction(db, async (transaction) => {
        const currentNuggets = studentDoc.data().nuggets || 0;

        // Vérification avant déduction
        if (currentNuggets < amount) {
            throw new Error("Pépites insuffisantes.");
        }

        transaction.update(studentRef, {
            nuggets: currentNuggets - amount
        });
    });
}
```

**Coûts des jeux:**
- Snake: 2 pépites
- Boccia: 2 pépites
- Gear Racer: 2 pépites
- Air Defense: 2 pépites
- Ghost Hunt (Halloween): 4 pépites

---

## 3. Gestion des scores et progression

### Structure d'un score

**Fichier:** `src/services/scores.ts:28-43`

```typescript
interface Score {
    id: string;
    userId: string;          // ID de l'élève
    skill: string;           // Slug de la compétence
    score: number;           // Score obtenu (0-100 généralement)
    createdAt: string;       // ISO timestamp
    details?: ScoreDetail[]; // Détails question par question

    // Settings optionnels pour reproduire l'exercice
    timeSettings?: TimeSettings;
    calculationSettings?: CalculationSettings;
    currencySettings?: CurrencySettings;
    // ... autres settings
}

interface ScoreDetail {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    status: 'correct' | 'incorrect' | 'completed';
    calculationState?: CalculationState; // Pour opérations posées
    mistakes?: string[];                 // Erreurs de lecture/orthographe
    options?: string[];                  // Choix QCM proposés
    score?: number;                      // Score individuel (phrase construction)
}
```

### Enregistrement d'un score

**Pattern à suivre dans tous les exercices:**

```typescript
// Dans le composant d'exercice
const handleComplete = async () => {
    const scoreData = {
        userId: student.id,
        skill: 'nom-de-la-competence',
        score: calculateScore(),
        details: questionsAnswered.map(q => ({
            question: q.question,
            userAnswer: q.userAnswer,
            correctAnswer: q.correctAnswer,
            status: q.isCorrect ? 'correct' : 'incorrect'
        }))
    };

    const result = await addScore(scoreData);

    if (result.success) {
        // Afficher les pépites gagnées
        toast({
            title: "Bravo!",
            description: `Tu as gagné ${result.nuggetsEarned} pépites!`
        });
    }
};
```

### Récupération des scores pour l'élève

**Fichier:** `src/services/scores.ts:132-165`

```typescript
// Tous les scores d'un élève
const allScores = await getScoresForUser(studentId);

// Scores d'une compétence spécifique
const mathScores = await getScoresForUser(studentId, 'mental-calculation');
```

### Affichage des progrès

**Page:** `/results` (`src/app/results/page.tsx`)
- Graphique de progression globale
- Carousel des résultats par compétence
- Historique des scores

---

## 4. Contexte utilisateur et état global

### Architecture du UserContext

**Fichier:** `src/context/user-context.tsx`

```typescript
interface UserContextType {
    student: Student | null;       // Élève connecté
    setStudent: (student) => void; // Fonction pour changer d'élève
    isLoading: boolean;            // État de chargement initial
    refreshStudent: () => void;    // Rafraîchir les données de l'élève
}
```

### Système de synchronisation temps réel

**IMPORTANT:** Le contexte écoute les changements Firestore en temps réel avec `onSnapshot`.

```typescript
useEffect(() => {
    const storedId = sessionStorage.getItem('classemagique_student_id');

    // Écoute les changements en temps réel
    const unsub = onSnapshot(doc(db, "students", storedId), (doc) => {
        if (doc.exists()) {
            const newStudent = {
                id: doc.id,
                name: data.name,
                nuggets: data.nuggets || 0,
                // ... tous les champs
            };

            // Optimisation: ne met à jour que si des champs importants changent
            setStudentState(prev => {
                const hasChanged =
                    prev.nuggets !== newStudent.nuggets ||
                    prev.name !== newStudent.name ||
                    // ... autres champs critiques

                return hasChanged ? newStudent : prev;
            });
        }
    });

    return () => unsub(); // Cleanup
}, []);
```

### Champs ignorés pour éviter re-renders inutiles
- `isOnline` (système de présence)
- `lastSeenAt` (dernière activité)

Ces champs sont mis à jour toutes les 30s mais ne doivent pas déclencher de re-render.

### Utilisation dans un composant

```typescript
import { UserContext } from '@/context/user-context';

function MonComposant() {
    const { student, setStudent, isLoading, refreshStudent } = useContext(UserContext);

    if (isLoading) return <Skeleton />;
    if (!student) return <LoginPrompt />;

    return <div>Bonjour {student.name}</div>;
}
```

---

## 5. Architecture des exercices

### Pattern standard d'un exercice

**Tous les exercices suivent cette structure:**

```typescript
interface ExerciseProps {
    studentName: string;  // Nom de l'élève (pour personnalisation)
    onComplete: (score: number, details: ScoreDetail[]) => void;
}

export function MonExercice({ studentName, onComplete }: ExerciseProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [questions] = useState(() => generateQuestions());

    const handleAnswer = (answer: string) => {
        const isCorrect = checkAnswer(answer, questions[currentQuestion]);
        setAnswers([...answers, {
            question: questions[currentQuestion],
            userAnswer: answer,
            correctAnswer: getCorrectAnswer(questions[currentQuestion]),
            status: isCorrect ? 'correct' : 'incorrect'
        }]);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        const score = (answers.filter(a => a.status === 'correct').length / questions.length) * 100;
        onComplete(score, answers);
    };

    return (
        <div>
            {/* UI de l'exercice */}
        </div>
    );
}
```

### Génération de questions

**Les générateurs de questions sont dans `src/lib/`**

Exemples:
- `mental-math.ts` - Questions de calcul mental
- `time-questions.ts` - Questions sur l'heure
- `calendar-questions.ts` - Questions de calendrier
- `syllabe-questions.ts` - Questions de syllabes
- etc.

**Pattern type:**

```typescript
// src/lib/mental-math.ts
export function generateMentalMathQuestions(
    count: number,
    settings: CalculationSettings
): Question[] {
    const questions: Question[] = [];

    for (let i = 0; i < count; i++) {
        const { num1, num2, operation } = generateOperation(settings);
        questions.push({
            question: `${num1} ${operation} ${num2}`,
            answer: calculate(num1, num2, operation),
            operation: operation
        });
    }

    return questions;
}
```

### Intégration dans une page d'exercice

**Fichier:** `src/app/exercise/[skill]/page.tsx`

```typescript
export default function ExercisePage({ params }: { params: { skill: string } }) {
    const { student } = useContext(UserContext);
    const router = useRouter();

    const handleComplete = async (score: number, details: ScoreDetail[]) => {
        // Sauvegarder le score
        const result = await addScore({
            userId: student.id,
            skill: params.skill,
            score: score,
            details: details
        });

        // Afficher les pépites gagnées
        if (result.success) {
            toast({
                title: "Exercice terminé!",
                description: `Score: ${score}% - ${result.nuggetsEarned} pépites gagnées`
            });
        }

        // Retour à la page d'accueil ou résultats
        router.push('/results');
    };

    return (
        <MonExercice
            studentName={student.name}
            onComplete={handleComplete}
        />
    );
}
```

---

## 6. Intégration IA avec Genkit

### Configuration de base

**Fichier:** `src/ai/genkit.ts`

```typescript
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-pro', // Modèle par défaut
});
```

### Structure d'un flow

**Pattern à suivre:**

```typescript
// src/ai/flows/mon-flow.ts
import { ai } from '../genkit';
import { z } from 'zod';

// 1. Définir le schéma d'input
const InputSchema = z.object({
    prompt: z.string(),
    options: z.object({
        length: z.enum(['court', 'moyen', 'long']),
        tone: z.enum(['joyeux', 'sérieux'])
    })
});

// 2. Définir le schéma d'output
const OutputSchema = z.object({
    result: z.string(),
    metadata: z.object({
        wordCount: z.number()
    })
});

// 3. Créer le flow
export const monFlow = ai.defineFlow(
    {
        name: 'monFlow',
        inputSchema: InputSchema,
        outputSchema: OutputSchema,
    },
    async (input) => {
        const prompt = buildPrompt(input);

        const { text } = await ai.generate({
            model: 'googleai/gemini-2.5-pro',
            prompt: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 1000
            }
        });

        return {
            result: text,
            metadata: {
                wordCount: text.split(' ').length
            }
        };
    }
);
```

### Utilisation d'un flow

**Dans un composant ou Server Action:**

```typescript
'use server';

import { monFlow } from '@/ai/flows/mon-flow';

export async function generateContent(userInput: string) {
    try {
        const result = await monFlow({
            prompt: userInput,
            options: {
                length: 'moyen',
                tone: 'joyeux'
            }
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Erreur Genkit:', error);
        return { success: false, error: error.message };
    }
}
```

### Flows existants

#### 1. Story Flow (`story-flow.ts`)
**Usage:** Génération d'histoires pour enfants

```typescript
const result = await storyFlow({
    emojis: ['🐱', '🌙', '⭐'],
    length: 'moyenne',
    tone: 'aventure'
});
// => { title, story, moral }
```

#### 2. Image Flow (`image-flow.ts`)
**Usage:** Génération d'illustrations

```typescript
const result = await imageFlow({
    storyTitle: "Le chat et la lune",
    storyContent: "...",
    tone: 'aventure'
});
// => { imageUrl: 'data:image/png;base64,...' }
```

**IMPORTANT:** Utilise `gemini-2.5-flash` avec `responseModalities: ['IMAGE']`

#### 3. Mental Math Analysis Flow (`mental-math-analysis-flow.ts`)
**Usage:** Feedback personnalisé après calcul mental

```typescript
const result = await mentalMathAnalysisFlow({
    skills: [
        { name: 'Addition', successes: 8, failures: 2 },
        { name: 'Soustraction', successes: 5, failures: 5 }
    ]
});
// => "Tu es très fort en addition ! Continue à t'entraîner en soustraction."
```

#### 4. Phrase Construction Flow (`phrase-construction-flow.ts`)
**Usage:** Validation de phrases construites

```typescript
// Génération de mots
const words = await generatePhraseWords({ difficulty: 'B' });
// => ['chat', 'mange', 'souris']

// Validation de la phrase de l'élève
const validation = await validateConstructedPhrase({
    words: ['chat', 'mange', 'souris'],
    userSentence: "Le chat mange la souris."
});
// => { isCorrect: true, score: 95, feedback: "...", correctedSentence: "..." }
```

### Gestion des erreurs IA

**Pattern recommandé:**

```typescript
async function callAI() {
    try {
        const result = await monFlow(input);
        return result;
    } catch (error) {
        console.error('Erreur IA:', error);

        // Fallback si possible
        return {
            result: "Désolé, je ne peux pas générer de contenu pour le moment.",
            error: true
        };
    }
}
```

---

## 7. Système de présence en temps réel

### Principe
Affiche si un élève est en ligne ou non dans le dashboard enseignant.

### Implémentation

**Fichier:** `src/services/student-presence.ts`

```typescript
export function setupPresenceHeartbeat(studentId: string) {
    const studentRef = doc(db, "students", studentId);

    // Marquer comme en ligne
    updateDoc(studentRef, {
        isOnline: true,
        lastSeenAt: serverTimestamp()
    });

    // Heartbeat toutes les 30 secondes
    const interval = setInterval(() => {
        updateDoc(studentRef, {
            isOnline: true,
            lastSeenAt: serverTimestamp()
        });
    }, 30000);

    // Marquer comme hors ligne à la fermeture
    const handleBeforeUnload = () => {
        updateDoc(studentRef, {
            isOnline: false,
            lastSeenAt: serverTimestamp()
        });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updateDoc(studentRef, { isOnline: false });
    };
}
```

### Utilisation dans UserContext

**Fichier:** `src/context/user-context.tsx:93-101`

```typescript
useEffect(() => {
    if (!student?.id) return;

    const cleanupPresence = setupPresenceHeartbeat(student.id);

    return () => {
        cleanupPresence(); // Arrêter le heartbeat au démontage
    };
}, [student?.id]);
```

### Affichage dans le dashboard enseignant

```typescript
function StudentCard({ student }: { student: Student }) {
    return (
        <div>
            <Avatar>
                <AvatarImage src={student.photoURL} />
                <AvatarFallback>{student.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                    student.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span>{student.name}</span>
            </div>
        </div>
    );
}
```

---

## 8. Gestion Firebase

### Configuration

**Fichier:** `src/lib/firebase.ts`

```typescript
const firebaseConfig = {
    projectId: "classemagique2",
    appId: "1:461454261743:web:81c2fe779d83fb487fca1a",
    storageBucket: "classemagique2.firebasestorage.app",
    apiKey: "AIzaSyCWxtFBSdvAGiJN06WxRLFtFZ0xGPe9E9Q",
    authDomain: "classemagique2.firebaseapp.com",
    messagingSenderId: "461454261743"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
```

### Collections Firestore

#### `students`
```typescript
{
    id: string,
    name: string,
    code: string,
    nuggets: number,
    photoURL?: string,
    showPhoto: boolean,
    groupId?: string,
    levels: Record<string, SkillLevel>,
    enabledSkills: Record<string, boolean>,
    mentalMathPerformance: StudentPerformance,
    accordProgressionIndex: number,
    isOnline: boolean,
    lastSeenAt: Timestamp
}
```

#### `scores`
```typescript
{
    id: string,
    userId: string,
    skill: string,
    score: number,
    createdAt: Timestamp,
    details: ScoreDetail[]
}
```

#### `groups`
```typescript
{
    id: string,
    name: string,
    studentIds: string[],
    teacherId: string,
    createdAt: Timestamp
}
```

#### `chats`
```typescript
{
    id: string,
    fromId: string,
    toId: string,
    message: string,
    timestamp: Timestamp,
    read: boolean
}
```

### Services Firebase

**Pattern de service:**

```typescript
// src/services/ma-collection.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export async function createItem(data: ItemData) {
    try {
        const docRef = await addDoc(collection(db, 'items'), data);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Erreur:', error);
        return { success: false, error: error.message };
    }
}

export async function getItems(userId: string) {
    try {
        const q = query(
            collection(db, 'items'),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}
```

### Transactions atomiques

**Pour les opérations critiques (pépites, scores):**

```typescript
import { runTransaction, doc } from 'firebase/firestore';

await runTransaction(db, async (transaction) => {
    // 1. Lire les documents
    const studentDoc = await transaction.get(studentRef);

    // 2. Vérifications
    if (!studentDoc.exists()) {
        throw new Error("Élève introuvable");
    }

    // 3. Modifications atomiques
    transaction.update(studentRef, { nuggets: newNuggets });
    transaction.set(scoreRef, scoreData);
});
```

---

## 9. Patterns de développement à suivre

### 1. Composants Server vs Client

**Server Components (par défaut)**
- Pas d'interactivité
- Pas de hooks React
- Accès direct aux données Firebase

```typescript
// src/app/ma-page/page.tsx
import { getStudents } from '@/services/students';

export default async function MaPage() {
    const students = await getStudents(); // Server-side

    return <div>{/* ... */}</div>;
}
```

**Client Components (avec 'use client')**
- Interactivité (useState, useEffect, onClick, etc.)
- Hooks React
- Contexte

```typescript
'use client';

import { useState, useContext } from 'react';
import { UserContext } from '@/context/user-context';

export function MonComposant() {
    const [count, setCount] = useState(0);
    const { student } = useContext(UserContext);

    return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 2. Server Actions

**Pour les mutations depuis un Client Component:**

```typescript
// src/actions/mon-action.ts
'use server';

export async function sauvegarderDonnees(formData: FormData) {
    const name = formData.get('name');

    // Accès direct à Firebase
    await addDoc(collection(db, 'items'), { name });

    return { success: true };
}
```

```typescript
// Dans un Client Component
'use client';

import { sauvegarderDonnees } from '@/actions/mon-action';

export function MonFormulaire() {
    return (
        <form action={sauvegarderDonnees}>
            <input name="name" />
            <button type="submit">Envoyer</button>
        </form>
    );
}
```

### 3. Gestion des erreurs

**Pattern standardisé:**

```typescript
try {
    const result = await operation();

    if (result.success) {
        toast({
            title: "Succès",
            description: "Opération réussie"
        });
    } else {
        throw new Error(result.error);
    }
} catch (error) {
    console.error('Erreur:', error);
    toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue"
    });
}
```

### 4. Naming conventions

**Fichiers:**
- Composants: `mon-composant.tsx` (kebab-case)
- Services: `mon-service.ts` (kebab-case)
- Types: `mon-type.ts` (kebab-case)

**Variables:**
- React: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Types: `PascalCase`

**Fonctions:**
- Services: `verbNom` (ex: `getStudent`, `addScore`)
- Handlers: `handleAction` (ex: `handleSubmit`, `handleClick`)
- Composants: `PascalCase`

### 5. Structure d'un nouveau composant d'exercice

```typescript
// src/components/mon-nouvel-exercice.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MonNouvelExerciceProps {
    studentName: string;
    onComplete: (score: number, details: ScoreDetail[]) => void;
}

export function MonNouvelExercice({ studentName, onComplete }: MonNouvelExerciceProps) {
    // 1. State
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);

    // 2. Initialisation
    useEffect(() => {
        setQuestions(generateQuestions());
    }, []);

    // 3. Handlers
    const handleAnswer = (answer: string) => {
        // Logique de validation
    };

    const handleComplete = () => {
        const score = calculateScore(answers);
        onComplete(score, answers);
    };

    // 4. Render
    return (
        <div className="container mx-auto p-4">
            <Card>
                {/* UI de l'exercice */}
            </Card>
        </div>
    );
}
```

---

## 10. Points d'attention critiques

### ⚠️ Ne JAMAIS faire

1. **Modifier directement les pépites sans transaction**
   ```typescript
   // ❌ MAUVAIS
   await updateDoc(studentRef, {
       nuggets: student.nuggets + 2
   });

   // ✅ BON
   await addNuggets(studentId, 2); // Utilise une transaction
   ```

2. **Oublier de vérifier l'authentification**
   ```typescript
   // ❌ MAUVAIS
   export default function ProtectedPage() {
       return <div>Contenu protégé</div>;
   }

   // ✅ BON
   export default function ProtectedPage() {
       const { student, isLoading } = useContext(UserContext);

       if (isLoading) return <Skeleton />;
       if (!student) redirect('/');

       return <div>Contenu protégé</div>;
   }
   ```

3. **Utiliser des hooks dans un Server Component**
   ```typescript
   // ❌ MAUVAIS
   export default function MaPage() {
       const [data, setData] = useState([]); // Erreur!
       return <div>{data}</div>;
   }

   // ✅ BON - Option 1: Server Component
   export default async function MaPage() {
       const data = await fetchData();
       return <div>{data}</div>;
   }

   // ✅ BON - Option 2: Client Component
   'use client';
   export default function MaPage() {
       const [data, setData] = useState([]);
       useEffect(() => { fetchData(); }, []);
       return <div>{data}</div>;
   }
   ```

4. **Ignorer les erreurs IA**
   ```typescript
   // ❌ MAUVAIS
   const result = await storyFlow(input); // Pas de gestion d'erreur

   // ✅ BON
   try {
       const result = await storyFlow(input);
       return result;
   } catch (error) {
       console.error('Erreur IA:', error);
       return { error: true, message: "Erreur de génération" };
   }
   ```

5. **Créer des listeners sans cleanup**
   ```typescript
   // ❌ MAUVAIS
   useEffect(() => {
       const unsub = onSnapshot(docRef, callback);
       // Pas de cleanup!
   }, []);

   // ✅ BON
   useEffect(() => {
       const unsub = onSnapshot(docRef, callback);
       return () => unsub(); // Cleanup au démontage
   }, []);
   ```

### ✅ Bonnes pratiques

1. **Toujours utiliser des transactions pour les opérations atomiques**
   - Pépites
   - Scores + pépites
   - Déblocage de fonctionnalités

2. **Toujours nettoyer les listeners**
   - `onSnapshot` → `return () => unsub()`
   - `setInterval` → `return () => clearInterval()`
   - Event listeners → `removeEventListener`

3. **Toujours valider les inputs utilisateur**
   ```typescript
   if (!userId || !score) {
       return { success: false, error: 'Données manquantes' };
   }
   ```

4. **Toujours gérer les cas de chargement et d'erreur**
   ```typescript
   if (isLoading) return <Skeleton />;
   if (error) return <ErrorMessage />;
   if (!data) return <EmptyState />;
   return <Content data={data} />;
   ```

5. **Optimiser les re-renders**
   - Utiliser `useMemo` pour les calculs coûteux
   - Utiliser `useCallback` pour les fonctions passées en props
   - Éviter les objets/tableaux inline dans le JSX

### 🔐 Sécurité

1. **Variables d'environnement pour les clés API**
   - Clé Gemini dans `.env.local`
   - Jamais de secrets dans le code

2. **Validation côté serveur**
   - Toujours valider dans les Server Actions
   - Ne jamais faire confiance aux données client

3. **Firestore Security Rules**
   - Fichier `firestore.rules`
   - Restreindre l'accès aux données

### 🚀 Performance

1. **Utiliser Next/Image pour les images**
   ```typescript
   import Image from 'next/image';

   <Image
       src={photoURL}
       alt={name}
       width={100}
       height={100}
   />
   ```

2. **Lazy loading des composants lourds**
   ```typescript
   import dynamic from 'next/dynamic';

   const HeavyComponent = dynamic(() => import('./heavy-component'), {
       loading: () => <Skeleton />
   });
   ```

3. **Limiter les requêtes Firestore**
   - Utiliser `limit()` dans les queries
   - Paginer les résultats si nécessaire
   - Cacher les données fréquemment utilisées

---

## Checklist avant de développer une nouvelle feature

- [ ] J'ai vérifié si un pattern similaire existe déjà
- [ ] J'ai compris le flux de données (Student → Context → Component)
- [ ] Je sais où stocker les données (Firestore collection)
- [ ] J'ai prévu la gestion des erreurs
- [ ] J'ai prévu les états de chargement
- [ ] J'ai prévu le système de pépites si applicable
- [ ] J'ai prévu la sauvegarde des scores si applicable
- [ ] J'ai utilisé les composants UI existants (shadcn)
- [ ] J'ai suivi les conventions de nommage
- [ ] J'ai nettoyé les listeners/intervals si applicable

---

## Checklist avant de commit

- [ ] Le code compile sans erreur (`npm run typecheck`)
- [ ] Le code respecte les conventions du projet
- [ ] Les erreurs sont gérées correctement
- [ ] Les transactions sont utilisées pour les opérations atomiques
- [ ] Les listeners sont nettoyés
- [ ] Les composants sont optimisés (pas de re-renders inutiles)
- [ ] Le code est commenté si la logique est complexe
- [ ] Les console.log de debug sont supprimés

---

## Ressources rapides

### Documentation externe
- Next.js 15: https://nextjs.org/docs
- Firebase: https://firebase.google.com/docs
- Genkit: https://firebase.google.com/docs/genkit
- Radix UI: https://www.radix-ui.com/
- Tailwind: https://tailwindcss.com/docs

### Fichiers clés du projet
- Configuration Firebase: `src/lib/firebase.ts`
- Configuration Genkit: `src/ai/genkit.ts`
- Contexte utilisateur: `src/context/user-context.tsx`
- Services étudiants: `src/services/students.ts`
- Services scores: `src/services/scores.ts`
- Système de pépites: `src/lib/nuggets.ts`
- Liste des compétences: `src/lib/skills.ts`

### Commandes utiles
```bash
npm run dev           # Dev local (port 9002)
npm run build         # Build production
npm run typecheck     # Vérifier TypeScript
npm run genkit:dev    # Tester les flows IA
```

---

**Document mis à jour:** 2025-10-13
**Maintenir ce document à jour après chaque ajout de logique importante!**
