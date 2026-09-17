# Corrections intégrées et point de reprise

Vérifications arrêtées le 16 septembre 2026 à la demande de Manu, pour poursuivre par petits lots hebdomadaires. Les modifications restent dans le dossier de travail, sans commit global ni déploiement.

## Corrections intégrées

- Français : syllabes orales et images locales, GN/NI, corpus D, niveaux de grammaire, adjectifs et élision, alignement de dictée, validation adulte de lecture, alternatives au glissement, contrôle des familles et passé composé sur corpus relu.
- Mathématiques : boucles de génération, calcul décimal et historique adaptatif, corrigés, vrais niveaux des problèmes et du calendrier, monnaie, reprise des tables, vérification des opérandes de soustraction.
- Suivi : devoirs individuels préservés, sauvegarde commune avec reprise persistante et transaction idempotente, isolation entre onglets, métadonnées des essais et aides, unités distinctes, historique classe/devoirs et complétion neutre.
- Fluence : mots réellement lus, erreurs finales, validation explicite, chronométrage réel excluant les pauses et protection pendant l'enregistrement.
- Interface : clavier avec accents adapté au petit écran, copie Unicode, numération B visible, annotations de calcul et commandes accessibles, consignes/indices réécoutables, symboles pour les couleurs, compléments et soustractions sans chrono et saisie tactile.
- Catalogue : niveaux jamais inférés des notes, progression automatique atteignant le dernier palier, ateliers à progression interne explicitement présentés comme tels ; outils sans validation exclus des devoirs proposés.
- Stock de questions versionné pour ne pas réutiliser les anciennes questions erronées. Aucune suppression du stock réel ni écriture élève pendant les vérifications.

## Preuves obtenues avant l'arrêt

- `npm test` : **53 tests réussis**, aucun échec, incluant les vingt exercices progressifs précédents et les nouvelles régressions.
- `npm run typecheck` : réussi sur l'intégration ; les modifications ultérieures ont aussi été compilées lors du build suivant.
- `npm run build` : réussi. Une dernière modification textuelle du libellé du calcul et de la couleur du conseil facultatif a suivi ce build ; pas de nouveau build après cette finition avant l'arrêt demandé.
- **112 vues ordinateur et 56 vues petit écran** dans le banc isolé : aucune erreur JavaScript non interceptée et aucun débordement du document dans ce parcours initial. Ce parcours ne couvre pas toutes les transitions.
- **18 scénarios navigateur ciblés réussis** : dix français, huit transversaux/mathématiques. Ils comprennent vingt réponses puis Rejouer, dix copies Unicode avec détails de devoir, vingt compléments et soustractions sans chrono, arrêt précoce avec durée réelle, numération B, calendrier A et fluence partielle corrigée avant sauvegarde.
- Revue indépendante : défaut de concurrence entre onglets, course de sauvegarde fluence, durée des arrêts précoces et perte des détails de copie en devoirs repérés puis corrigés et relus.
- Encodage des sources contrôlé : UTF-8 valide, aucun caractère de remplacement.

## Première reprise hebdomadaire

1. **Calendrier sur petit écran — corrigé le 17 septembre 2026** : le conteneur et les choix de jours sont désormais adaptatifs. Le scénario navigateur vérifie que les trois ou quatre propositions restent entièrement visibles dans leur carte à 390 px.
2. **Niveaux C/D des tableaux de numération et calculs posés — vérifiés le 17 septembre 2026** : C utilise six colonnes jusqu'aux centaines de milliers et des calculs à trois chiffres ; D utilise neuf colonnes jusqu'aux centaines de millions et des calculs à quatre chiffres, dont les additions à trois opérandes. Les réponses, décompositions et transmissions de niveau sont testées.
3. Recette des sauvegardes sur un environnement de test connecté, avec comptes fictifs : jusqu'ici Firestore et l'IA ont été simulés, sans donnée élève réelle.
4. Relecture pédagogique hebdomadaire d'un petit corpus et écoute des voix réelles. La validation structurelle d'une sortie IA n'est pas une certification linguistique.

Le premier déploiement du 17 septembre a aussi révélé un verrouillage npm incomplet : les dépendances pair optionnelles de Genkit n'étaient plus décrites dans `package-lock.json`. Le verrouillage a été recréé depuis un dossier vide puis contrôlé par une installation `npm ci`, les tests et le build de production.

Ne pas relancer tout l'audit à chaque reprise. Choisir un petit lot, réutiliser les preuves existantes, tester seulement les changements et les parcours concernés.

## Pièces conservées

- [Français](fixes-french.md), [mathématiques](fixes-maths.md), [suivi](fixes-tracking.md).
- [Parcours français](fixes-french-browser.json), [parcours transversaux](fixes-browser.json), [scan des vues](fixes-visual-scan.json).
- Scripts : `scripts/verify-french-interactions.cjs`, `scripts/verify-audit-fixes.cjs`, `scripts/audit-visual-harness.cjs`, `scripts/audit-visual-scan.cjs`.
- Tests : `npm test`. Le banc navigateur est isolé et ne doit pas être confondu avec une validation du serveur réel.

## Choix de conception à conserver

Les banques françaises fautives ont parfois été remplacées par des corpus plus courts relus ; les enrichir demande une relecture, pas seulement davantage de génération. Le passé composé noté n'utilise plus de thème IA libre. La reconnaissance vocale aide la lecture mais ne note plus automatiquement la compétence. Le calcul des problèmes utilise les nombres de l'énoncé et accepte une phrase facultative ; l'orthographe ne réduit pas la réussite mathématique. Les anciennes données incomplètes restent explicitement inconnues.
