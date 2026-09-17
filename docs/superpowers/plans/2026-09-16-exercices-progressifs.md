# Vingt exercices progressifs — plan d’implémentation

**Objectif :** réaliser les vingt activités du tableau A, B−, B, B+, C avec leurs étapes pédagogiques et le suivi existant.
**Architecture :** catalogue commun, cadre de séance partagé, composants spécialisés par famille. Les niveaux pédagogiques du tableau sont affichés sans modifier l’ancienne échelle technique A/B/C/D. Aucun prénom ne sert à attribuer automatiquement un exercice.
**Technologies :** Next.js, React, TypeScript, Tailwind, services de résultats existants. Contenus déterministes locaux, sans génération IA ni dépendance réseau pour les illustrations.
**Spécification :** tableau fourni par l’utilisateur le 16 septembre 2026.

## Contraintes communes
- Réponse tactile et clavier ; grandes cibles, consignes françaises et bouton de lecture orale.
- Plusieurs manches et variantes ; les erreurs permettent une nouvelle tentative, sans point de première réussite.
- Séparer estimation/calcul, opération/calcul, identification/correction, réponse/preuve.
- Les justifications écrites libres sont conservées mais jamais automatiquement jugées correctes.
- Conserver la navigation, les résultats et le parcours devoirs ; signaler et permettre de réessayer une sauvegarde échouée.
- Utiliser six pictogrammes locaux pour la consigne en deux actions : lapin, chapeau, baguette, étoile, fleur, carte. Les images exactes de jeudi ne sont pas dans le dépôt.

## Tâches et fichiers
- [x] 1. Cadre commun : `src/components/progressive/shared.tsx`, `session.tsx`, `src/lib/progressive-exercises.ts`. Contrats `RoundProps { round, onComplete }` et `ActivityResult { answer, expected, mistakes }`. Tester le calcul des résultats et les niveaux ; intégrer catalogue, routage et plages scolaires.
- [x] 2. A et B− : `early-round.tsx`, `early-data.ts`. Objet utile (2/3 choix), deux actions ordonnées, appariements 2–4, comparaison animée, mots proches, scènes d’action, compléments jusqu’à 10, trains croissants/décroissants. Tester les réponses, bornes et séquences.
- [x] 3. Français B/C : `french-round.tsx`, `french-data.ts`. Preuves/contradictions, ponctuation manipulable, accords mot à mot, référents avec surlignage, preuves puis justification facultative, chronologie puis lien causal. Tester les données et les validations.
- [x] 4. Mathématiques B/C : `math-round.tsx`, `math-data.ts`. Voisins avec/sans droite, opération puis résultat, estimation puis calcul, règle avec origine décalée, erreur d’emprunt puis correction, milieu cm/mm puis vérification des deux parties. Tester les calculs et les étapes.
- [x] 5. Vérification : tests unitaires Node sur modules purs, `npm run typecheck`, compilation de production et parcours navigateur si disponible. Relecture croisée des interactions et du cahier des charges.

## Exécution
Trois familles de composants indépendants, un cadre de séance et un catalogue partagés. Intégration dans la branche de travail existante ; relecture indépendante et contrôle des corrections. Les modifications préexistantes de `package-lock.json` sont conservées.

## Décisions
- Les niveaux B− et B+ sont des niveaux pédagogiques du catalogue, pas de nouvelles valeurs à injecter dans les réglages historiques.
- Les illustrations sont des SVG locaux et des pictogrammes ; aucune photo externe ne sera nécessaire.
- Les séances comportent quatre manches pour limiter la fatigue ; les variantes sont portées par les banques et les manches.

## Vérifications et utilisation
- `npm run test:progressive` : 19 tests unitaires sur Node 24, données pédagogiques, validations et calcul des scores.
- `npm run typecheck` : contrôle TypeScript de l’ensemble de l’application.
- `npm run build` : compilation de production Next.js.
- `tests/progressive-browser.mjs` : parcours Chromium des 80 manches, 20 redémarrages, écrans de 390 px, absence de débordement horizontal, erreurs/corrections et navigation devoirs.
- Lancer le navigateur contre un serveur local avec `BASE_URL` (par défaut `http://localhost:9003`) ; Playwright doit être disponible, ou `PLAYWRIGHT_MODULE` doit désigner son installation. `EXERCISE_SLUG` permet de limiter le parcours à un exercice.
- Les tests navigateur utilisent le mode découverte, sans profil ni écriture dans les données réelles des élèves. La sauvegarde en classe et en devoirs utilise les services existants, avec détails de réponses, erreurs et justifications ; elle n’a pas été exercée sur un compte réel.
- Accès depuis **En classe → Tous les exercices**. Les badges affichent les niveaux pédagogiques, également dans les réglages enseignants. Chaque URL suit `/exercise/<slug>` ; les slugs figurent dans `src/lib/progressive-exercises.ts`.
- Les explications libres sont conservées pour lecture humaine. Leur contenu n’est pas noté automatiquement.
- Trois contrôles de régression : réponses désactivées jusqu’à l’hydratation, erreur visuelle effacée après un appariement valide, résultat calculé verrouillé après validation.
