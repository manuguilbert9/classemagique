# Architecture du Projet - Classe Magique

## 📋 Vue d'ensemble

**Classe Magique** est une application éducative Next.js 15 pour l'enseignement primaire en France. Elle combine des exercices interactifs, une génération d'histoires par IA, et un système de suivi des progrès.

### Stack technique
- **Framework**: Next.js 15.5.2 (App Router, Turbopack)
- **UI**: React 18, Tailwind CSS, Radix UI, shadcn/ui
- **Backend**: Firebase (Firestore, Storage, Cloud Messaging)
- **IA**: Google Genkit + Gemini 2.5 Pro
- **Déploiement**: Firebase App Hosting (standalone mode)

---

## 🏗️ Structure du projet

```
classemagique/
├── src/
│   ├── ai/                    # Flows IA avec Genkit
│   │   ├── genkit.ts         # Configuration Genkit + Gemini
│   │   ├── dev.ts            # Point d'entrée Genkit Dev UI
│   │   └── flows/            # Flows d'IA (génération de contenu)
│   │       ├── story-flow.ts           # Génération d'histoires pour enfants
│   │       ├── image-flow.ts           # Génération d'images avec Gemini
│   │       ├── tts-flow.ts             # Text-to-Speech (désactivé actuellement)
│   │       ├── phrase-construction-flow.ts   # Génération/validation de phrases
│   │       ├── mental-math-analysis-flow.ts  # Analyse de performance maths
│   │       └── generate-word-families-flow.ts # Familles de mots
│   │
│   ├── app/                   # Routes Next.js (App Router)
│   │   ├── page.tsx          # Page d'accueil : sélection de mode (Devoirs/En classe/Boîte à histoires/Progrès)
│   │   ├── devoirs/page.tsx  # Liste des devoirs personnalisés de l'élève
│   │   ├── en-classe/page.tsx  # Outils interactifs pour la classe
│   │   ├── story-box/page.tsx  # Générateur d'histoires avec IA
│   │   ├── results/page.tsx    # Visualisation des progrès de l'élève
│   │   ├── planning/page.tsx   # Planning hebdomadaire (devoirs/activités)
│   │   ├── rewards/page.tsx    # Jeux récompenses (Snake, Boccia, Ghost Hunt)
│   │   ├── exercise/[skill]/page.tsx  # Page d'exercice dynamique par compétence
│   │   ├── spelling/[exerciseId]/page.tsx  # Exercices de dictée
│   │   ├── teacher/            # Interface enseignant
│   │   │   ├── login/page.tsx       # Connexion enseignant
│   │   │   └── dashboard/page.tsx   # Tableau de bord enseignant
│   │   └── api/               # API Routes
│   │       ├── spell/route.ts          # Correction orthographique
│   │       ├── expansion-texts/route.ts # Textes pour exercices d'expansion
│   │       └── fluence-texts/route.ts   # Textes pour exercices de fluence
│   │
│   ├── components/            # Composants React
│   │   ├── ui/               # Composants shadcn/ui (Button, Card, Dialog, etc.)
│   │   ├── teacher/          # Composants spécifiques enseignant
│   │   │   ├── database-manager.tsx     # Gestion base de données élèves
│   │   │   ├── group-manager.tsx        # Gestion des groupes
│   │   │   ├── results-manager.tsx      # Vue résultats élèves
│   │   │   └── report-generator.tsx     # Génération PDF de rapports
│   │   ├── results/          # Composants d'affichage des résultats
│   │   │   ├── overall-progress-chart.tsx  # Graphique progression globale
│   │   │   └── results-carousel.tsx        # Carousel de résultats
│   │   ├── chat/             # Système de chat enseignant-élève
│   │   │   ├── chat-notification.tsx
│   │   │   ├── chat-message-content.tsx
│   │   │   └── constants.ts
│   │   ├── decoding/         # Exercices de décodage par niveaux
│   │   │   ├── decoding-level1.tsx  # Voyelles simples
│   │   │   ├── decoding-level2.tsx  # Consonnes + voyelles
│   │   │   ├── decoding-level3.tsx  # Syllabes complexes
│   │   │   ├── decoding-level-bd.tsx, decoding-level-ch.tsx, etc.
│   │   │   └── decoding.d.ts        # Types TypeScript pour décodage
│   │   │
│   │   ├── [EXERCICES PÉDAGOGIQUES]  # ~40 composants d'exercices
│   │   │   ├── adaptive-mental-calculation-exercise.tsx  # Calcul mental adaptatif
│   │   │   ├── mental-calculation-exercise.tsx           # Calcul mental classique
│   │   │   ├── long-calculation-exercise.tsx             # Opérations posées
│   │   │   ├── complement-dix-exercise.tsx               # Compléments à 10
│   │   │   ├── somme-dix-exercise.tsx                    # Sommes de 10
│   │   │   ├── mystery-number-exercise.tsx               # Nombres mystères
│   │   │   ├── nombres-complexes-exercise.tsx            # Nombres grands/décimaux
│   │   │   ├── calendar-exercise.tsx                     # Lecture de calendrier
│   │   │   ├── interactive-clock.tsx                     # Apprentissage heure
│   │   │   ├── analog-clock.tsx                          # Horloge analogique
│   │   │   ├── fluence-exercise.tsx                      # Fluence de lecture
│   │   │   ├── simple-word-reading-exercise.tsx          # Lecture mots simples
│   │   │   ├── sentence-reading-exercise.tsx             # Lecture phrases
│   │   │   ├── decoding-exercise.tsx                     # Décodage progressif
│   │   │   ├── letter-recognition-exercise.tsx           # Reconnaissance lettres
│   │   │   ├── reading-direction-exercise.tsx            # Sens de lecture
│   │   │   ├── lettres-et-sons-exercise.tsx              # Association lettres-sons
│   │   │   ├── syllable-table-exercise.tsx               # Syllabes
│   │   │   ├── son-an-exercise.tsx, son-in-exercise.tsx  # Sons complexes
│   │   │   ├── mbp-rule-exercise.tsx                     # Règle m/b/p
│   │   │   ├── dictation-exercise.tsx                    # Dictée
│   │   │   ├── spelling-exercise.tsx                     # Orthographe
│   │   │   ├── keyboard-copy-exercise.tsx                # Frappe clavier
│   │   │   ├── coded-path-exercise.tsx                   # Déplacements codés
│   │   │   └── label-game-exercise.tsx                   # Jeu d'étiquettes
│   │   │
│   │   ├── [JEUX RÉCOMPENSES]
│   │   │   ├── snake-game.tsx              # Jeu Snake classique (2 pépites)
│   │   │   ├── boccia-game.tsx             # Jeu de boccia (2 pépites)
│   │   │   ├── gear-racer-game.tsx         # Course d'engrenages (2 pépites)
│   │   │   ├── air-defense-game.tsx        # Défense aérienne (2 pépites)
│   │   │   └── ghost-hunt-game.tsx         # Chasse aux fantômes Halloween (4 pépites)
│   │   │       # Mécaniques: flashlight, dormeurs qui se réveillent, pénalités
│   │   │
│   │   ├── [COMPOSANTS UTILITAIRES]
│   │   │   ├── logo.tsx                    # Logo de l'application
│   │   │   ├── score-tube.tsx              # Affichage score (tube à essai)
│   │   │   ├── score-history-display.tsx   # Historique des scores
│   │   │   ├── syllable-text.tsx           # Affichage texte syllabé
│   │   │   ├── fullscreen-toggle.tsx       # Bouton plein écran
│   │   │   ├── student-schedule.tsx        # Emploi du temps élève
│   │   │   ├── calculation-settings.tsx    # Config calcul mental
│   │   │   ├── time-settings.tsx           # Config exercices temps
│   │   │   ├── count-settings.tsx          # Config exercices comptage
│   │   │   ├── price-tag.tsx               # Étiquette prix (monnaie)
│   │   │   └── erlenmeyer-flask.tsx        # Flacon (visuel score)
│   │   │
│   │   └── icons/            # Icônes SVG personnalisées
│   │       ├── addition-icon.tsx
│   │       └── soustraction-icon.tsx
│   │
│   ├── lib/                   # Logique métier et utilitaires
│   │   ├── firebase.ts       # Configuration Firebase (Firestore, Storage, Messaging)
│   │   ├── nuggets.ts        # Système de pépites (monnaie virtuelle)
│   │   ├── utils.ts          # Utilitaires généraux (cn, etc.)
│   │   ├── questions.ts      # Interface générique pour questions d'exercices
│   │   ├── mental-math.ts    # Générateur de questions calcul mental
│   │   ├── adaptive-mental-math.ts  # Système adaptatif calcul mental
│   │   ├── reading-texts.ts  # Textes pour exercices de lecture
│   │   ├── syllable-data.ts  # Données syllabiques
│   │   ├── word-list.ts      # Liste de mots pour exercices
│   │   ├── [GÉNÉRATEURS DE QUESTIONS PAR DOMAINE]
│   │   │   ├── count-questions.ts          # Questions comptage
│   │   │   ├── keyboard-count-questions.ts # Questions comptage clavier
│   │   │   ├── number-listening-questions.ts # Questions nombres audio
│   │   │   ├── reading-number-questions.ts   # Questions lecture nombres
│   │   │   ├── complex-number-questions.ts   # Questions nombres complexes
│   │   │   ├── time-questions.ts             # Questions sur l'heure
│   │   │   ├── calendar-questions.ts         # Questions calendrier
│   │   │   ├── currency-questions.ts         # Questions monnaie
│   │   │   ├── letter-sound-questions.ts     # Questions lettres-sons
│   │   │   └── syllabe-questions.ts          # Questions syllabes
│   │   ├── currency.ts       # Utilitaires monnaie
│   │   └── prefix-suggester.ts  # Suggestion de préfixes pour décodage
│   │
│   ├── services/             # Services d'accès aux données Firebase
│   │   ├── students.ts       # CRUD élèves, login, progression
│   │   ├── exercises.ts      # Gestion des exercices
│   │   ├── scores.ts         # Sauvegarde et récupération des scores
│   │   ├── groups.ts         # Gestion des groupes d'élèves
│   │   └── chat.ts           # Service de chat enseignant-élève
│   │
│   ├── context/              # Contextes React
│   │   ├── user-context.tsx  # Contexte utilisateur (élève connecté)
│   │   └── teacher-context.tsx  # Contexte enseignant
│   │
│   ├── hooks/                # Custom React Hooks
│   │   ├── use-speech-recognition.ts  # Hook reconnaissance vocale Web Speech API
│   │   ├── use-toast.ts      # Hook pour toasts (notifications)
│   │   └── use-confetti.ts   # Hook pour animations confettis
│   │
│   └── types/                # Types TypeScript globaux
│       ├── student.ts        # Type Student (élève)
│       ├── exercise.ts       # Type Exercise (exercice)
│       └── score.ts          # Type Score (résultat)
│
├── public/                   # Assets statiques
│   ├── halloween/           # Assets Halloween (toiles araignées, curseurs)
│   │   ├── spider-web.png
│   │   ├── spider-cursor.png
│   │   └── spider-cursor-small.png
│   ├── sounds/              # Sons pour exercices
│   └── images/              # Images diverses
│
├── functions/               # Firebase Cloud Functions
│   └── index.js            # Functions backend (si nécessaires)
│
└── [FICHIERS CONFIG]
    ├── package.json         # Dépendances npm
    ├── next.config.ts       # Config Next.js (standalone, outputFileTracingIncludes)
    ├── tailwind.config.ts   # Config Tailwind CSS
    ├── tsconfig.json        # Config TypeScript
    ├── firebase.json        # Config Firebase Hosting
    └── .gitignore          # Exclusions Git (.env, .genkit, etc.)
```

---

## 🎯 Fonctionnalités principales

### 1. **Système d'authentification**
- **Élèves**: Connexion par prénom + code à 4 chiffres
- **Enseignants**: Connexion sécurisée séparée
- **Contexte utilisateur**: `UserContext` pour gérer l'état de connexion

### 2. **Modes d'utilisation**

#### **Devoirs** (`/devoirs`)
- Liste personnalisée d'exercices assignés à l'élève
- Récupération depuis Firestore des exercices actifs
- Navigation vers les exercices spécifiques

#### **En classe** (`/en-classe`)
- Outils interactifs pour usage en classe
- Exercices collectifs
- Accès rapide aux compétences

#### **Boîte à Histoires** (`/story-box`) 🎨 **[Feature IA]**
- Génération d'histoires personnalisées avec Gemini 2.5 Pro
- Deux modes de création:
  - **Émojis**: Sélection de 6 émojis max (avec emojis spéciaux Halloween oct-nov)
  - **Vocal**: Description vocale avec Web Speech API
- Paramètres:
  - Longueur: extra-courte, courte, moyenne, longue
  - Ton: aventure, comique, effrayante, terrifiante, cauchemardesque
- Features additionnelles (Halloween):
  - Génération d'illustrations avec Gemini 2.5 Flash IMAGE mode
  - TTS (Text-to-Speech) désactivé actuellement
- Affichage syllabé optionnel
- Export Immersive Reader (Microsoft Edge)

#### **Mes Progrès** (`/results`)
- Graphiques de progression globale
- Historique des scores par compétence
- Carousel interactif des résultats

### 3. **Système d'exercices** (`/exercise/[skill]`)

**40+ types d'exercices** couvrant:
- 📚 **Lecture**: Fluence, décodage, reconnaissance lettres, sens de lecture
- ✍️ **Écriture**: Dictée, orthographe, frappe clavier
- 🔢 **Mathématiques**: Calcul mental (adaptatif), opérations posées, compléments, nombres complexes
- ⏰ **Temps**: Horloge analogique/interactive, calendrier
- 💰 **Monnaie**: Calculs avec pièces et billets
- 🧩 **Logique**: Chemin codé, nombres mystères

**Architecture des exercices**:
```typescript
// Chaque exercice suit ce pattern:
interface ExerciseProps {
  studentName: string;      // Nom de l'élève
  onComplete: (score: number, details: any) => void;  // Callback fin exercice
}

// Exemple: adaptive-mental-calculation-exercise.tsx
// - Génère des questions adaptées au niveau de l'élève
// - Suit les réussites/échecs en temps réel
// - Ajuste la difficulté dynamiquement
// - Utilise le flow AI mental-math-analysis-flow.ts pour feedback
```

### 4. **Système de récompenses** (`/rewards`)

**Monnaie virtuelle**: Pépites 💎
- Gagnées en complétant des exercices
- Stockées dans Firestore (`students/{id}/nuggets`)
- Dépensées pour jouer à des jeux

**Jeux disponibles**:
1. **Snake** (2 pépites) - Jeu classique du serpent
2. **Boccia** (2 pépites) - Jeu de boules
3. **Gear Racer** (2 pépites) - Course d'engrenages
4. **Air Defense** (2 pépites) - Défense aérienne
5. **Ghost Hunt** (4 pépites) 🎃 **[Halloween]**
   - Lampe torche qui suit la souris
   - 8 fantômes (👻) à attraper
   - 12 personnes endormies (😴, 😪, 💤) à éviter
   - Si éclairés >1.5s ou cliqués → se réveillent furieux (😡) → -4 points
   - Timer 2 minutes
   - Physique: rebonds sur les bords

### 5. **Interface enseignant** (`/teacher/*`)

**Dashboard** (`/teacher/dashboard`):
- Vue d'ensemble de tous les élèves
- Gestion des groupes
- Attribution des exercices
- Suivi des progrès (tableaux, graphiques)
- Génération de rapports PDF (jsPDF + autoTable)
- Chat avec les élèves (Firebase Cloud Messaging)

**Fonctionnalités**:
- Import/Export base de données élèves (JSON)
- Création/modification d'élèves (nom, code, photo, groupe)
- Assignation d'exercices par élève ou par groupe
- Visualisation détaillée des résultats (ResultsManager)
- Génération de rapports personnalisés

---

## 🧠 Intégration IA - Google Genkit

### Configuration (`src/ai/genkit.ts`)
```typescript
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-pro',  // Modèle par défaut
});
```

### Flows IA

#### 1. **Story Flow** (`story-flow.ts`)
**Fonction**: Génération d'histoires pour enfants
- **Inputs**: Emojis OU description vocale, longueur, ton
- **Output**: Titre, histoire, morale
- **Spécificités**:
  - 2 prompts: un pour enfants (8-12 ans), un pour ados (cauchemardesque)
  - Instructions de longueur précises (60 mots à 500 mots)
  - Consignes de sécurité selon le ton (PEGI 12 pour effrayant/terrifiante)
  - Variété des prénoms (évite répétition "Léo")
- **Modèle**: Gemini 2.5 Pro

#### 2. **Image Flow** (`image-flow.ts`)
**Fonction**: Génération d'illustrations pour histoires
- **Inputs**: Titre, contenu histoire, ton
- **Output**: URL de l'image (data URI base64)
- **Spécificités**:
  - Style adapté au ton (cartoon, Halloween, gothique Tim Burton, etc.)
  - Format portrait 3:4
  - Pas de texte dans l'image
- **Modèle**: Gemini 2.5 Flash avec `responseModalities: ['IMAGE']`

#### 3. **TTS Flow** (`tts-flow.ts`) ⚠️ **Désactivé**
**Fonction**: Text-to-Speech
- **Status**: Commenté dans `story-box/page.tsx` (lignes 276-289)
- **Raison**: Gemini 2.5 Flash ne supporte pas encore TTS de manière stable
- **Alternative envisagée**: Web Speech API native du navigateur

#### 4. **Phrase Construction Flow** (`phrase-construction-flow.ts`)
**Fonction**: Exercice de construction de phrases
- **2 flows**:
  1. `generatePhraseWords`: Génère 3-5 mots à assembler (niveau B/C/D)
  2. `validateConstructedPhrase`: Corrige la phrase de l'élève
- **Critères d'évaluation**:
  - Inclusion des mots (40%)
  - Correction grammaticale (40%)
  - Cohérence sémantique (20%)
- **Output**: `isCorrect`, `feedback`, `score`, `correctedSentence`
- **Modèle**: Gemini 2.5 Pro

#### 5. **Mental Math Analysis Flow** (`mental-math-analysis-flow.ts`)
**Fonction**: Analyse des performances en calcul mental
- **Input**: Array de compétences avec réussites/échecs
- **Output**: Texte d'analyse en français (2-3 phrases)
- **Ton**: Encourageant, adapté enfant 7-11 ans
- **Utilisation**: Fin de session calcul mental adaptatif
- **Modèle**: Gemini 2.5 Pro

#### 6. **Word Families Flow** (`generate-word-families-flow.ts`)
**Fonction**: Génération de familles de mots
- **Input**: Liste de mots
- **Output**: Paires (mot original, mot de la même famille)
- **Exemple**: `["dent", "long"]` → `[{dent: dentiste}, {long: longueur}]`
- **Utilisation**: Exercices de vocabulaire
- **Modèle**: Gemini 2.5 Pro

### Genkit Dev UI
- **Commande**: `npm run genkit:dev` ou `npm run genkit:watch`
- **Point d'entrée**: `src/ai/dev.ts`
- **Usage**: Test des flows en développement (interface web Genkit)

---

## 🗄️ Base de données Firebase Firestore

### Collections principales

#### **students** (Élèves)
```typescript
interface Student {
  id: string;
  name: string;              // Prénom
  code: string;              // Code PIN (4 chiffres)
  group?: string;            // Groupe classe
  nuggets: number;           // Pépites (monnaie virtuelle)
  photoURL?: string;         // Photo profil
  showPhoto: boolean;        // Afficher photo sur l'accueil
  fcmToken?: string;         // Token Firebase Cloud Messaging (chat)
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

#### **exercises** (Exercices)
```typescript
interface Exercise {
  id: string;
  skill: string;             // ID compétence (ex: "mental-calculation")
  title: string;             // Titre affiché
  description: string;
  difficulty?: string;       // Niveau (facile/moyen/difficile)
  assignedTo: string[];      // IDs élèves assignés
  dueDate?: Timestamp;       // Date limite
  active: boolean;           // Exercice actif ou archivé
  createdBy: string;         // ID enseignant
  createdAt: Timestamp;
}
```

#### **scores** (Résultats)
```typescript
interface Score {
  id: string;
  studentId: string;
  exerciseId: string;
  skill: string;             // Compétence évaluée
  score: number;             // Score (0-100 généralement)
  maxScore?: number;
  timeSpent?: number;        // Temps en secondes
  details?: any;             // Détails spécifiques (questions ratées, etc.)
  completedAt: Timestamp;
}
```

#### **groups** (Groupes d'élèves)
```typescript
interface Group {
  id: string;
  name: string;              // Nom du groupe (ex: "CE1 A")
  studentIds: string[];      // IDs élèves du groupe
  teacherId: string;         // ID enseignant propriétaire
  createdAt: Timestamp;
}
```

#### **chats** (Messages enseignant ↔ élève)
```typescript
interface ChatMessage {
  id: string;
  fromId: string;            // ID expéditeur
  toId: string;              // ID destinataire
  message: string;
  timestamp: Timestamp;
  read: boolean;             // Lu ou non
}
```

### Services Firebase (`src/services/`)

#### **students.ts**
- `loginStudent(name, code)`: Authentification élève
- `getStudent(id)`: Récupération données élève
- `updateStudent(id, data)`: Mise à jour élève
- `addNuggets(studentId, amount)`: Ajouter pépites
- `spendNuggets(studentId, amount)`: Dépenser pépites

#### **exercises.ts**
- `getExercisesForStudent(studentId)`: Exercices assignés
- `createExercise(data)`: Créer un exercice
- `assignExercise(exerciseId, studentIds)`: Assigner exercice

#### **scores.ts**
- `saveScore(scoreData)`: Sauvegarder un résultat
- `getScoresForStudent(studentId, skill?)`: Récupérer résultats
- `getScoreHistory(studentId, skill)`: Historique par compétence

#### **chat.ts**
- `sendMessage(from, to, message)`: Envoyer message
- `getMessages(userId)`: Récupérer conversations
- `markAsRead(messageId)`: Marquer message lu

---

## 🎨 Thème et Design

### Tailwind CSS + shadcn/ui
- **Config**: `tailwind.config.ts`
- **Composants UI**: `src/components/ui/*`
- **Palette de couleurs**:
  - Primaire: Accent (orange/jaune éducatif)
  - Secondaire: Bleu/Vert pour catégories
  - Halloween: Orange/violet/noir (octobre-novembre)

### Animations
- **Confettis**: `react-dom-confetti` (succès exercices)
- **Transitions**: Tailwind `transition-all`, `hover:scale-110`
- **Loading**: Lucide `Loader2` avec `animate-spin`

### Responsive
- Mobile-first design
- Breakpoints: `sm:`, `md:`, `lg:`
- Grid adaptatif pour sélection de modes

### Thème Halloween 🎃
- **Période**: 1er octobre - 3 novembre
- **Features**:
  - Emojis Halloween dans story-box (fantômes, citrouilles, etc.)
  - Curseur araignée (`public/halloween/spider-cursor-small.png`)
  - Toiles d'araignée CSS (`src/app/story-box/halloween.css`)
  - Jeu Ghost Hunt (4 pépites)
  - Illustrations style "Halloween artistique"
- **Détection**: `isHalloweenPeriod()` dans `story-box/page.tsx`

---

## 🚀 Déploiement Firebase App Hosting

### Build standalone Next.js
```json
// next.config.ts
{
  output: 'standalone',
  outputFileTracingIncludes: {
    '/': ['./public/**/*'],  // Inclut public/ dans le build standalone
  },
}

// package.json
"build": "next build && npm run copy-public",
"copy-public": "node -e \"require('fs').cpSync('public', '.next/standalone/public', {recursive: true})\"",
```

**Pourquoi?**
- Firebase App Hosting utilise le mode standalone de Next.js
- Le dossier `public/` n'est pas automatiquement copié dans `.next/standalone/`
- Script `copy-public` résout ce problème pour les assets Halloween

### Configuration Firebase
```json
// firebase.json
{
  "hosting": {
    "public": ".next/standalone",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "function": "nextjs"
      }
    ]
  }
}
```

---

## 🔐 Sécurité et bonnes pratiques

### 1. **Pas de secrets dans le code**
- ❌ Pas de clés API hardcodées
- ✅ Firebase config publique (OK, pas sensible)
- ✅ Clés Gemini dans variables d'environnement
- ⚠️ `.env*` dans `.gitignore`

### 2. **Authentification**
- Login élève: Prénom + code PIN (simple, adapté enfants)
- Login enseignant: Système séparé (non détaillé ici)
- Pas de mots de passe complexes (public enfant)

### 3. **Validation des données**
- Zod pour typage fort des flows IA
- Vérification des inputs utilisateur avant soumission
- Sanitization des contenus générés par IA

### 4. **Performance**
- Next.js App Router avec Server Components
- Images optimisées (Next/Image)
- Lazy loading des exercices (dynamic imports possibles)
- Turbopack en dev pour build rapide

---

## 📝 Notes de développement

### Scripts npm
```bash
npm run dev          # Dev local (port 9002, Turbopack)
npm run build        # Build production + copie public/
npm run start        # Démarre serveur production
npm run genkit:dev   # Genkit Dev UI pour tester flows IA
npm run genkit:watch # Genkit en mode watch
npm run typecheck    # Vérification TypeScript
```

### Problèmes connus / À améliorer

#### 1. **TTS désactivé** (ligne 276-289 de `story-box/page.tsx`)
- Gemini TTS pas encore stable
- Alternative: Web Speech API native (à implémenter)

#### 2. **Genkit en production**
- Actuellement utilisé côté serveur (Server Actions)
- Pas de problème de build Firebase détecté pour l'instant
- Variables d'environnement nécessaires pour Gemini API

#### 3. **Ghost Hunt Game**
- Mécaniques complexes (light exposure tracking avec `useRef`)
- Performance: OK en DOM, pourrait être optimisé avec Canvas

#### 4. **Gestion des erreurs IA**
- Try/catch autour des appels Genkit
- Fallbacks limités si Gemini down

---

## 🎯 Prochaines fonctionnalités potentielles

1. **TTS fonctionnel** pour la boîte à histoires
2. **Plus de jeux récompenses** (idées: Tetris, Memory, Puissance 4)
3. **Système de badges** pour motivation élèves
4. **Mode hors-ligne** (PWA avec service workers)
5. **Notifications push** (déjà préparé avec FCM)
6. **Dictée vocale améliorée** (actuellement Web Speech API basique)
7. **Export des histoires** en PDF illustré
8. **Statistiques enseignant avancées** (progression temporelle, comparaisons inter-élèves)
9. **Thèmes saisonniers** supplémentaires (Noël, Pâques, etc.)
10. **Mode collaboratif** (exercices en groupe en temps réel)

---

## 📚 Ressources et dépendances clés

### Librairies principales
- **Next.js 15**: Framework React
- **Firebase**: Backend as a Service (auth, DB, storage, messaging)
- **Genkit**: Orchestration IA Google
- **Radix UI**: Composants accessibles
- **Tailwind CSS**: Styling
- **Recharts**: Graphiques de progression
- **jsPDF**: Génération PDF
- **react-hook-form**: Formulaires
- **date-fns**: Manipulation dates
- **lucide-react**: Icônes

### APIs externes
- **Gemini 2.5 Pro**: Génération de texte (histoires, analyses, etc.)
- **Gemini 2.5 Flash**: Génération d'images
- **Web Speech API**: Reconnaissance vocale (native navigateur)

---

## 🤝 Contribution et maintenance

### Structure de commit
- Messages en français
- Format: `[Type] Description courte`
- Types: `Feature`, `Fix`, `Refactor`, `Doc`, `Style`

### Tests
- ⚠️ Pas de suite de tests automatisés actuellement
- Tests manuels en dev avec `npm run dev`
- Tests flows IA avec `npm run genkit:dev`

### Documentation
- Ce fichier `ARCHITECTURE.md`
- Commentaires inline dans le code (à améliorer)
- README.md à créer avec guide de démarrage

---

**Dernière mise à jour**: 2025-10-07
**Version**: 0.1.0
**Auteur**: Projet Classe Magique
