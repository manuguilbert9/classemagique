# Miaoudoku Implementation Plan

**Goal:** Ajouter un jeu de placement de chats aux récompenses.
**Architecture:** Moteur TypeScript pur, catalogue de grilles originales vérifiées,
composant React client et raccord au paiement existant.
**Tech Stack:** Next.js, React, Tailwind, lucide-react, node:test ; aucune dépendance ajoutée.
**Spec:** `docs/superpowers/specs/2026-11-13-miaoudoku-design.md`

## Contraintes

- 2 pépites par session ; pas de débit pour chaque grille.
- 24 grilles : 8 en 5×5, 8 en 6×6, 8 en 8×8 ; une solution par grille.
- Interface française, souris/tactile/clavier, stockage local par élève.

## Points de contrôle

Conflits diagonaux limités aux cases voisines ; nombre de chats insuffisant ;
indices après une erreur ; stockage local invalide ou inaccessible ; double clic
rapide sur l'achat d'une session.

## Étapes

- [x] Écrire et exécuter les tests du moteur dans `tests/miaoudoku.test.mjs`.
- [x] Implémenter `src/lib/miaoudoku.ts` (conflits, cycle, victoire, indices et historique).
- [x] Générer `src/lib/miaoudoku-levels.ts` via `scripts/generate-miaoudoku-levels.mjs` ; tester connexité et unicité indépendamment.
- [x] Créer `src/components/miaoudoku-game.tsx` et raccorder `src/app/rewards/page.tsx`.
- [x] Exécuter les tests, le typecheck et vérifier la présentation et les interactions locales.

## Résultats

- `npm test` : 128 tests réussis, dont 36 nouveaux tests de logique, catalogue,
  persistance et raccord au paiement (débit unique, refus et nouvelle tentative).
- `npm run typecheck` puis `npm run build` : réussis. Le build final valide les
  types et génère les 15 pages, dont `/rewards`, sans route de test.
- Navigateur : cycle des cases, conflit, annulation, indice correctif, victoire,
  changement de niveau, remise à zéro annulable, retour et règles testés.
- Vue ordinateur et largeurs 390 / 320 px : pas de débordement horizontal.
  Navigation par flèches et activation par Entrée vérifiées.
- Relecture indépendante : un risque de perte de progression entre onglets a été
  corrigé. Une clé par niveau évite les écrasements ; l'événement `storage`
  synchronise les compteurs. Vérifié dans deux onglets puis après rechargement.
- La route temporaire de test a été supprimée. Les tests n'ont pas utilisé de
  compte élève réel ni débité de pépites dans Firebase.
- Serveur de développement lancé sur le port 9003 à la demande de l'utilisateur.

## Ajustement demandé : signalement immédiat des erreurs

- `getMistakes` compare croix et chats à la solution unique, indépendamment des
  seuls conflits entre chats. Le composant calcule les erreurs depuis le plateau,
  ce qui garantit leur mise à jour après correction, annulation, indice ou reset.
- Message au-dessus de la grille et contour rouge uniquement sur les cases fausses.
  Le message indique les coordonnées et comment corriger ; il est annoncé avec
  `role="alert"`, et les cases utilisent `aria-invalid`.
- Quatre tests de régression ajoutés : 132 tests réussis ; TypeScript valide.
- Navigateur : mauvaise croix, correction en chat, chat erroné isolé, annulation,
  remise à zéro et suppression du chat testés. À 320 px, aucun débordement et
  message entièrement visible. La position de la grille reste stable.
