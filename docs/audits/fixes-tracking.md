# Corrections du suivi — 16 septembre 2026

Référence : `2026-09-16-suivi.md`. Vérifications locales uniquement, sans connexion Firebase réelle ni écriture externe.

| Point | Correction et preuve |
|---|---|
| 1. Écrasement individuel | `homework-server.ts` remplace uniquement le champ `assignments` via `mergeFields`. Test d'une sauvegarde collective après affectation individuelle, y compris remplacement explicite par `null`. |
| 2. Affectation effective | `resolveAssignment` est partagé entre service élève et indicateurs enseignant. La page élève charge avec son identifiant même sans groupe. Test de résolution sans groupe. |
| 3. Validation manquante | La façade `addScore` reconnaît `from=devoirs&date=…` pour tous ses appelants, notamment les quatre composants manquants. Décodage : unité explicite `completion`, état achevé, jamais présenté comme 100 % de maîtrise. Les outils sans validation doivent être exclus du catalogue attribuable (intégration racine). |
| 4. Échecs perdus | Les deux fonctions historiques passent par une boîte d'envoi locale commune. État en cours/enregistré/à réessayer, reprise au retour réseau et manuelle, reprise après rechargement, filtrage par élève. Stockage par clé de séance sans écrasement entre onglets (test deux instances). Identifiant de séance conservé à chaque reprise et transaction idempotente. Tests réseau rejeté, rechargement, isolation des reprises et crédit unique. En cas de stockage local indisponible, le message demande de garder la page ouverte. |
| 5. Fluence finale | Aucune sauvegarde au calcul/arrêt. L'adulte indique les mots réellement lus et les erreurs avant validation explicite. Le résultat final, zéro compris, est figé pendant l'envoi/reprise. Temps, texte et syllabes utilisées sont conservés. Chronomètre fondé sur le temps réel, pauses exclues, résistant aux intervalles ralentis ; nombre de mots entier. Tests 60 mots/5 erreurs = 55 MCLM, texte partiel et zéro. |
| 6. Niveau historique | Aucun niveau n'est reconstitué depuis une note (correction `skills.tsx`, intégration racine). Les réglages persistés, y compris ceux des problèmes, sont les seuls repères de difficulté. Les anciennes données manquantes restent inconnues. |
| 7. Aide et autocorrection | `ScoreDetail` conserve première réponse, essais, aide et statut final. Les 22 importateurs de `useSecondChance` instrumentent la création de détails ; les appels sans réponse à `registerError` ont été renseignés. Absence de première réponse historique : aucune invention. Le feedback dit « Tu as trouvé ». Les composants sans révélation de réponse (adaptatif, reconnaissance de lettres, parcours codé, composition de somme) désactivent l'indicateur d'aide ciblée. Test correction avec/sans aide. |
| 8. Récompenses et périmètre | Une transaction commune écrit score détaillé, résultat de devoir et récompense une seule fois. Tous les réglages/détails sont acceptés par le contrat devoirs. Les anciens résultats devoirs sont fusionnés sans doubler les nouveaux miroirs dans ResultsManager. Filtre classe/devoirs/tous appliqué aussi au PDF. Aucun historique n'est migré silencieusement. Les scores bruts chronométrés ne servent pas comme pourcentages de récompense. |
| 9. Achevé neutre | `completed` s'affiche « Achevé », sans croix rouge. Un atelier de décodage ne trace pas une courbe de réussite ; il indique le nombre d'ateliers achevés. Test du libellé de complétion. |
| 10. Fluence affichée | Graphique, historique et PDF transmettent `readingRaceSettings`. Les unités pourcentage, nombre, MCLM et complétion sont explicites ; les graphiques séparent les unités. Conditions de séance visibles dans le détail. Test de formatage des unités. |
| 11. Historique adaptatif | Correction dédiée dans `adaptive-mental-calculation-exercise.tsx` et helpers de mathématiques (lot maths) : concaténation immuable, évaluation initiale distincte des essais suivants, abandon explicite. Voir les tests du lot maths et la vérification globale racine. |
| 12. Premiers essais | L'écran commun dit « X du premier coup sur N ». Les consommateurs disposant des détails affichent aussi les réponses trouvées après correction ou aide. Encouragement indépendant d'un score faible de premier essai. |

## Preuves locales

`node --experimental-strip-types --test tests/tracking-persistence.test.mjs` : **10 tests réussis**. Firestore est simulé dans un contexte VM ; aucun appel distant.

Les tests couvrent la préservation des devoirs individuels, la résolution effective, l'idempotence transactionnelle, le résultat zéro, les métadonnées, les reprises persistées et filtrées par élève, les unités, le sens des essais et le calcul de fluence.

La vérification TypeScript et les tests globaux sont repris par l'agent racine après intégration des lots. Aucune preuve de comportement avec un véritable élève ou de règle Firestore en production n'est revendiquée.
