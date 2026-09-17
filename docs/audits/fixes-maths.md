# Corrections mathématiques — 16 septembre 2026

Périmètre : fichiers de génération mathématique et composants attribués au lot maths. Les autres corrections de l’audit (mystère, couleurs, compléments, soustractions chronométrées, numération et calcul posé, catalogue et persistance commune) sont intégrées par les autres intervenants.

## Corrections livrées

- Lecture des nombres : tirages de distracteurs bornés, repli déterministe à quatre choix aux maxima A/B/C/D ; le choix d’une deuxième position zéro ne peut plus boucler.
- Parcours codé A/B : sélection dans les coins libres, nouvelle grille si moins de deux ; repli déjà existant conservé.
- Nombres complexes : réponses et quatre propositions dans 60–99 ; dénombrement : maxNumber entier borné de 3 à 100.
- Calcul mental : saisie numérique complète obligatoire. Adaptatif : résultats décimaux arrondis, comparaison numérique acceptant virgule et zéros décimaux ; historique concaténé, état de séance lu depuis une référence synchrone par la transition différée ; abandon enregistré comme échec ; historique de début de séance figé pour éviter les doublons après actualisation du profil. Libellés de succession corrigés et clavier texte pour oui/non.
- Monnaie A : voix en centimes/euros et pluriels corrects ; B : coupures limitées à 5 €, totaux au plus 15 € ; C : véritable total de deux achats au lieu d’une recopie de prix.
- Calendrier : mois de référence livré pour tous les QCM A/B et montré dès A ; écoute de la question et des options ; calendrier de clic ouvert au mois de la question ; vrai D de durées franchissant un mois, jour de départ explicité comme zéro et navigation entre mois possible.
- Tables : Rejouer réinitialise champ/feedback, zéro réponse ne produit plus de sauvegarde ni de NaN ; syntaxe entière stricte, verrou synchrone empêchant double réponse, contrôle de l’échéance à la validation et à la transition, nettoyage des transitions au changement de séance/démontage ; chronomètre calculé depuis l’échéance réelle ; métadonnées unité/mode/tables/durée ; formule adaptée aux petits écrans.
- Guide de soustraction : nombres posés comparés aux opérandes demandés avant le début ; message explicite en cas d’erreur ; barrer accessible par toucher, Entrée/Espace et maintien ; sauvegarde identifiée comme complétion guidée.
- Problèmes : stock température corrigé (5−2=3) ; B stock simple, C dizaines et recherches de différence/partie/état, D centaines et bilans négatifs explicites pour les complexes. Niveau réel transmis au pool et utilisé par le registre (intégration racine).
- Correction des problèmes désormais déterministe : parseur arithmétique limité aux additions/soustractions signées, sans eval ni appel IA ; contrôle des opérandes de l’énoncé, du calcul et du résultat. Phrase facultative, aucune pénalité mathématique d’orthographe ; signe moins accepté ; bilan distinguant résolution et réussite initiale, détails avec première réponse et nombre d’essais.
- Brocante : prix contraint après la sortie IA et dans le secours local (B entier 1–19, C entier 1–99, D 0,01–99,99) ; texte de négociation réconcilié si prix normalisé.
- Français des nombres : « quatre-vingt mille » et « deux cent mille », pas de conversion décimale produisant undefined.

## Preuves

`node --experimental-strip-types --test tests/historical-maths-regressions.test.mjs` : **12/12 réussis**. Exécution des vrais modules transpilés avec aléas contrôlés et dépendances externes locales ; PNG simulés et année scolaire figée, aucun Firebase ni appel IA.

Couverture : quatre bornes hautes lecture, quatre coins murés, 150 générations nombres complexes, pluriels de mille, maxNumber invalide, parseur refusant code/résultats/operandes erronés, bornes brocante, stock température, problèmes C/D, calendriers A/D, nombres décimaux D5/D8, fusion d’historique immuable, voix monnaie et totaux B, vrais handlers des tables (reset, doublon, syntaxe et expiration).

`npx tsc --noEmit --pretty false` : passe après les corrections de ce lot et de la persistance commune ; vérification finale répétée après les handlers des tables.

## Limites et intégration

- Ces preuves sont des tests de générateurs et de handlers, pas une séance navigateur exhaustive. La validation tactile/visuelle et le build global relèvent de la vérification d’ensemble.
- Les anciennes questions déjà mises en cache nécessitent un changement de version du pool pour que les nouveaux générateurs s’appliquent immédiatement. Signalé à la racine ; aucune suppression de données ou écriture élève effectuée ici.
- Les remarques de couverture des domaines et l’absence de zéro dans certains petits exercices constituent des choix de progression à documenter, pas une extension implicite des exercices. Aucun nouvel exercice ajouté dans ce lot.
