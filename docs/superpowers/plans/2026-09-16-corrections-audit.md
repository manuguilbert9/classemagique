# Corrections de l'audit — Implementation Plan

> **For agentic workers:** utiliser les domaines indépendants de superpowers:dispatching-parallel-agents, puis revue et intégration communes. Ne pas écraser les modifications existantes.

**Goal:** Corriger les anomalies et incohérences actionnables du rapport, avec preuves de non-régression.
**Architecture:** Conserver les composants existants et les vingt nouveaux exercices. Corriger les générateurs à la source, les contrats communs de résultat et les interfaces accessibles ; tracer séparément aide, complétion et exactitude. Les données élève existantes ne sont jamais migrées ou réécrites pendant les tests.
**Tech Stack:** Next.js, React, TypeScript, Firebase ; tests Node et Playwright isolé.
**Spec:** docs/audits/2026-09-16-audit-plateforme.md et ses trois annexes.

## Contraintes communes

- Préserver toutes les modifications antérieures, dont package-lock et les exercices progressifs.
- Aucun appel d'écriture sur des données réelles pour valider les corrections.
- Niveaux réellement différents, réponses atteignables, boucles bornées, aucune difficulté inférée du score.
- La lecture, la motricité et la reconnaissance vocale ne doivent pas fausser la compétence évaluée.
- Les réserves non démontrées sont vérifiées avant correction ; les lacunes de couverture disciplinaire n'impliquent pas d'ajouter un nouveau programme.

## Lots et responsabilité

- [ ] Français (fix_french) : corpus et phonologie, niveaux, réponses acceptées, dictée, parole, validation IA, alternatives au glissement. Tests de banques, alignement, niveaux et sorties invalides. Rapport fixes-french.md.
- [ ] Mathématiques (fix_maths) : bornes, décimaux, historique adaptatif, problèmes et niveaux, calendrier, monnaie, tables, soustraction, sorties IA. Tests déterministes bornes et calculs. Rapport fixes-maths.md.
- [ ] Suivi (fix_tracking) : préserver devoirs individuels, résolution élève/enseignant, persistance et reprise, fluence, bilan et unités, aide/complétion. Tests sans réseau des contrats communs. Rapport fixes-tracking.md.
- [ ] Intégration et accessibilité (root) : saisie Unicode, clavier adaptable, colonnes visibles, annotations, lettres/sons, temps réglable et saisie tactile, couleurs et indices ; registre, catalogue et affectation scolaire cohérents.
- [ ] Recette : tests unitaires de tous les lots, typecheck et build, parcours isolés aux bornes, reprise et mobile ; revue des changements et tableau final de couverture de chaque constat.

## Critères de recette ciblés

1. Les distracteurs terminent aux bornes de chaque niveau, sans répétition ni réponse hors choix.
2. La saisie « vélo » fonctionne au clavier et en tactile ; toutes les touches restent dans la fenêtre à 390 px.
3. Les données des niveaux B/C/D sont distinctes là où le catalogue le promet ; chaque niveau est atteignable dans sa plage scolaire.
4. Les réponses 0,3 à 0,1 + 0,2 et 3 à l'augmentation de 2 à 5 sont reconnues exactes.
5. Vingt réponses puis Rejouer fonctionnent ; une séance vide ne sauvegarde jamais NaN.
6. Une sauvegarde de groupe préserve les devoirs individuels ; une activité attribuable termine son devoir ; un échec d'enregistrement reste visible et peut être repris.
7. La fluence enregistre le nombre réellement lu et les erreurs après validation ; « achevé » n'est pas représenté comme faux.
8. Les tâches sont réalisables au clic/toucher/clavier sans glissement obligatoire ni commande masquée.

## Journal

- Plan ouvert : corrections autorisées explicitement par « d'après le rapport corrige tout ». Travail dans le dossier courant pour conserver les travaux déjà présents ; pas de changement de branche ni de commit global incluant les modifications préexistantes.
- Implémentations des quatre lots intégrées ; 53 tests et 18 scénarios navigateur réussis, build réussi avant dernière finition textuelle.
- Vérification supplémentaire interrompue explicitement à la demande de Manu. Reprise hebdomadaire, sans relancer tout le chantier : voir `docs/audits/2026-09-16-corrections-et-reprise.md`. Un signal de rognage des propositions calendrier mobile reste à examiner ; ne pas déclarer la recette exhaustive terminée.
