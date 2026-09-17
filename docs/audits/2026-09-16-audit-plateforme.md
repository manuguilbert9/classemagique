# Audit de cohérence des exercices historiques

16 septembre 2026 — Classe Magique — état local du dépôt.

## Conclusion

**La plateforme possède une base pédagogique riche, mais son intégrité n'est pas encore suffisante pour considérer tous les niveaux et tous les scores comme fiables.** Les principales faiblesses concernent des blocages ponctuels, quelques corrigés faux, des niveaux sans différenciation effective et un suivi qui confond parfois activité terminée, réponse corrigée et maîtrise autonome.

L'enjeu prioritaire est de fiabiliser les activités existantes et leur mesure. Pour un élève à besoins éducatifs particuliers, une erreur de reconnaissance vocale, une touche inaccessible ou une aide non tracée peut être interprétée à tort comme une difficulté d'apprentissage.

Cet audit ajoute des rapports et des outils de vérification. **Aucune correction du code de production n'a été effectuée au titre de cette demande ; aucune donnée élève n'a été modifiée.** Les modifications de l'implémentation précédente restent présentes.

## Périmètre et preuves

| Périmètre | Couverture |
|---|---|
| Catalogue actuel | 76 entrées : 20 nouveaux exercices progressifs, exclus de cette analyse, et 56 entrées historiques |
| Historique audité | 55 exercices et le cahier d'écriture libre |
| Disciplines | 29 entrées françaises, cahier compris ; 27 mathématiques |
| Niveaux du catalogue | 111 couples exercice/niveau déclarés ou déduits des réglages par défaut ; le cahier ne constitue pas trois exercices gradués |
| Inspection navigateur isolée | 112 vues ordinateur : les 111 couples et le cahier ; 56 vues petit écran à 390 px, au premier niveau de chaque entrée |
| Analyse fonctionnelle | Catalogue, plages scolaires, composants, générateurs, corpus, correction, sauvegarde, devoirs et affichages enseignants |

Les matrices détaillées couvrent chaque entrée et distinguent niveaux affichés, contenu effectif, modalités de réponse et réserves :

- [Français : matrice des 29 entrées et constats détaillés](2026-09-16-francais.md).
- [Mathématiques : matrice des 27 exercices et constats détaillés](2026-09-16-maths.md).
- [Scores, devoirs et suivi enseignant](2026-09-16-suivi.md).
- [Inventaire calculé, niveaux et affectations scolaires](2026-09-16-catalogue.json).
- [Mesures des vues navigateur](2026-09-16-visuel.json) et [interactions ciblées](2026-09-16-interactions.json).

**Portée des preuves.** Les défauts de corpus et les chemins de code sont établis dans le dépôt. Plusieurs générateurs ont été exécutés isolément ; les boucles sans fin ont été interrompues en sous-processus. Le navigateur utilise les véritables composants, avec profil fictif, services de sauvegarde simulés et IA désactivée. Il vérifie principalement le premier écran et la première activité accessible, pas toutes les séances complètes. Lire les nombres est volontairement exclu de la génération navigateur à cause de sa boucle non bornée ; ses quatre niveaux ont été éprouvés séparément. Les réponses IA et les règles Firestore en production ne sont pas validées par ce banc.

La revue couvre toutes les familles et tous leurs réglages de niveau, **sans prétendre certifier linguistiquement chaque phrase des banques, toutes les combinaisons aléatoires ou tous les résultats futurs de l'IA**. Les observations visuelles ne constituent pas une certification WCAG. Les alertes de nom accessible du JSON sont des candidats issus d'une heuristique DOM : les noms fournis par label, title ou contenu d'image doivent être contrôlés avant d'en conclure une non-conformité.

## Corrections prioritaires

P1 : activité bloquante, réponse fausse ou suivi trompeur/perdu. P2 : progression et accessibilité à consolider. Les références précises et scénarios figurent dans les trois rapports spécialisés.

| Priorité | Constat établi | Conséquence pour l'élève ou l'enseignant | Correction attendue |
|---|---|---|---|
| P1 | **Lire les nombres A/B/C/D** : distracteurs impossibles aux bornes 10, 1 000, 100 000 et 1 000 000 | Génération sans fin ; A particulièrement exposé | Tirage borné dans un ensemble de distracteurs valides, tests des bornes |
| P1 | **Chemin codé A/B** : moins de deux coins libres après placement des murs | Génération sans fin | Réserver les extrémités avant les murs, garantir une sortie de chaque boucle |
| P1 | **Copie au clavier A** : « vélo », « école », etc., mais accents non saisissables | Mot impossible à terminer | Saisie Unicode et clavier adapté à la graphie demandée |
| P1 | **Syllabe d'attaque A** : phonème demandé sous le nom de syllabe ; 182 images vides sur 222 entrées | Mauvais objectif phonologique et choix visuels absents | Définir et annoter la syllabe orale, exiger une image disponible, dédupliquer |
| P1 | **Calcul adaptatif D5** : 0,1 + 0,2 attend la chaîne 0.30000000000000004 | Réponse juste refusée ; difficulté artificielle | Comparaison numérique contrôlée et normalisation des décimaux |
| P1 | **Corrigés erronés** : GN/NI « gaggner », adjectif « Le épais livre », augmentation de +2 à +5 corrigée 7 | Enseignement d'une erreur | Relecture des banques et vérifications métier ; accepter les variantes grammaticales légitimes |
| P1 | **Calendrier A** : jour d'une date arbitraire sans calendrier visible | Question insoluble à partir du support proposé | Afficher le mois utile et rendre la consigne accessible oralement |
| P1 | **Tables de multiplication** : état de réponse conservé après la vingtième question sans chrono ; arrêt sans réponse produit NaN | Nouvelle partie verrouillée ou résultat invalide | Réinitialiser tous les états ; définir le cas zéro réponse |
| P1 | **Devoirs** : sauvegarder le groupe remplace le document qui contient les affectations individuelles | Perte des devoirs personnalisés | Préserver les deux affectations et vérifier le scénario groupe + individu |
| P1 | **Fin de devoir absente** dans quatre composants couvrant sept activités | Travail accompli encore indiqué « à faire » | Contrat commun de fin de séance, testé pour chaque activité attribuable |
| P1 | **Fluence** : sauvegarde avant saisie finale des erreurs ; niveau parfois perdu à l'affichage | MCLM enregistré différent du bilan à l'écran | Validation après correction et conservation des conditions de passation |
| P1 | **Sauvegardes échouées ignorées**, niveau parfois déduit du taux de réussite | Historique incomplet ou niveau inventé | Vérifier le retour du service ; stocker le niveau réel et afficher les données manquantes |

Autres corrections importantes : dictée donnant 100 % avec un mot supplémentaire, monnaie prononçant « zéro-undefined » pour les centimes, reconnaissance vocale transformant un incident technique en erreur de lecture, entraînement à la soustraction validant des opérandes différents de ceux demandés. Les conditions et limites de chacun de ces constats sont détaillées dans les annexes.

## Cohérence de la progression

**La lettre du niveau n'est pas une garantie de difficulté ni une mesure de l'élève.** Les niveaux historiques A/B/C/D ne doivent pas être assimilés automatiquement aux nouveaux groupes A/B−/B/B+/C. Un A de copie, de phonologie ou de calendrier mobilise des prérequis différents.

| Activité | Niveau affiché | Contenu réellement différencié |
|---|---|---|
| Construction de phrases | B, C, D | 103 phrases B, 88 C, aucune D ; D retombe sur toute la banque |
| Repérer le nom | B, C, D | C et D partagent la même banque |
| Ajouter des adjectifs | B, C | Niveau non utilisé pour choisir les questions |
| Passé composé | B, C, D | Réglages d'auxiliaire/groupe/thème effectifs, lettre de niveau non transmise au générateur ; items B |
| Quatre familles de problèmes | B/C/D selon activité | Génération « easy » et stock non différencié par le niveau demandé |
| Calendrier | A, B, C, D | D appelle explicitement C |
| Dictée | B, C, D | C et D identiques le jour 1 ; bonus D le jour 4 : différence partielle, à présenter comme telle |
| Lettres mélangées | B/C/D par défaut | Difficulté déterminée par la liste choisie, pas par ces lettres |

Le catalogue ne contient ni doublon de slug ni plage scolaire manquante. En revanche, le calcul automatique du niveau n'atteint jamais D dans les plages autorisées de **lettres mélangées, construction de phrases et jeu des étiquettes**. Cela concerne l'affectation automatique, pas nécessairement la sélection manuelle. La monnaie possède une génération A sans A dans les niveaux proposés par défaut. Un cas de route `time` subsiste sans entrée de catalogue et ne constitue donc pas une activité accessible normale.

Pour chaque exercice, remplacer la seule lettre par une fiche de progression : objectif observable, prérequis, nombres ou graphèmes autorisés, distracteurs, quantité de lecture, aide disponible et critère de passage. Augmenter une variable principale à la fois. Une difficulté de manipulation ou de déchiffrage ne devrait pas faire baisser artificiellement le niveau de calcul.

## Regard pédagogique spécialisé

Les grandes zones de choix, la réécoute, les essais supplémentaires, les séances courtes et les activités de manipulation constituent de bons points d'appui. Les tableaux de syllabes proposent une progression interne riche ; la dictée dispose d'une structure hebdomadaire. Il faut conserver ces possibilités tout en clarifiant ce qu'elles mesurent.

1. **Séparer entraînement et évaluation.** Un 100 de complétion en décodage n'est pas un 100 de lecture exacte. Une suite de couleurs suivie avec surbrillance n'atteste pas la même autonomie qu'une suite reconstruite sans aide. Enregistrer première réponse, essais, aide et résultat final.
2. **Distinguer correction autonome et réponse aidée.** Le message « Tu t'es corrigé tout seul » n'est pas justifié lorsque l'aide montre la réponse. Un élève ayant finalement trouvé dix réponses ne devrait pas lire seulement « 0 bonnes réponses ». Présenter « trouvé du premier coup » et « trouvé après correction ou aide ».
3. **Dissocier oralité et reconnaissance automatique.** Proposer une validation adulte ou une autre voie de réponse ; ne pas noter comme erreur scolaire une panne du micro ou une transcription incertaine. Cela est particulièrement important pour les élèves présentant des difficultés d'élocution.
4. **Contrôler la charge de lecture et de mémoire.** Pour une consigne à plusieurs étapes, afficher les étapes et l'avancement, permettre la réécoute et conserver les informations utiles. Le support visuel doit donner l'information nécessaire, pas seulement décorer.
5. **Rendre le rythme réglable.** Le chronomètre peut servir l'automatisation, mais doit être distingué de l'apprentissage sans contrainte temporelle. Tracer le mode et éviter de comparer directement vitesse, exactitude et complétion.

Ces recommandations s'appuient sur l'adaptation aux besoins identifiés de l'élève ([Éduscol](https://eduscol.education.gouv.fr/5481/enseigner-des-eleves-besoins-educatifs-particuliers)), sur des [consignes explicites par étapes](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p07-step-instructions/) et sur la possibilité d'[adapter les limites de temps](https://www.w3.org/WAI/WCAG21/Understanding/timing-adjustable.html). Ce sont des orientations de conception à tester avec les élèves concernés, pas un diagnostic individuel.

## Interface visuelle et accessibilité

Le parcours initial des vues testées ne provoque aucune erreur JavaScript non interceptée. Les pages à 390 px ne débordent pas au niveau du document. **Cela ne garantit pas que tous leurs contenus soient visibles** : des conteneurs masquent des éléments internes.

- **Copie au clavier** : emoji et bouton d'écoute partiellement coupés. Le clavier ouvert porte le document à 511 px pour une fenêtre de 390 px ; les touches A et Q sont entièrement hors écran à gauche (x = −121 à −65).
- **Tableau de numération B** : colonne des unités partiellement hors de la zone visible. Pour un exercice de position, cacher une colonne affecte directement la compréhension.
- **Lettres et sons** : des commandes débordent leur conteneur masqué dans le tirage observé.
- **Sens de lecture** : aucun débordement dans la capture à 390 px ; la largeur théorique du code ne suffit pas à conclure à un bug.
- **Étiquettes, lettres mélangées et adjectifs** : glisser-déposer sans alternative de déplacement suffisante. Ajouter « sélectionner puis placer » et commandes clavier ; des éléments focalisables ne suffisent pas à rendre l'action réalisable.
- **Touches et commandes secondaires** : viser des cibles tactiles confortables, notamment pour écoute, effacement et navigation. Le seuil WCAG 2.2 AA est de 24 × 24 CSS px avec exceptions ; 44 × 44 est ici une cible ergonomique recommandée, pas une obligation AA universelle.

Références : [alternative au glissement](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), [taille minimale des cibles et exceptions](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Les couleurs, contrastes, lecteurs d'écran et toutes les navigations clavier nécessitent encore une campagne dédiée avant toute déclaration de conformité.

Captures conservées : [copie, écran initial](assets/copie-mobile.png), [tableau de numération](assets/numeration-mobile.png), [clavier ouvert](assets/clavier-mobile.png), [tables après « Rejouer »](assets/tables-rejouer.png). Les données y sont fictives et les questions proviennent du banc isolé.

## Ordre recommandé des travaux

| Lot | Travail | Critère de fin vérifiable |
|---|---|---|
| 1 — Fiabilité | Boucles, accents, décimaux, corrigés faux, états de reprise | Toute question a une réponse atteignable et correcte ; tout générateur termine ; rejouer fonctionne |
| 2 — Suivi | Affectations individuelles, fin de devoir, erreurs de sauvegarde, fluence, niveau réel | Une séance correspond à un résultat fidèle ; groupe et individuel coexistent ; panne visible et reprise possible |
| 3 — Progression | Niveaux réellement distincts, banques manquantes, affectation automatique | Chaque niveau annoncé possède un contenu défini ; aucune substitution silencieuse par un autre niveau |
| 4 — Accessibilité | Zones coupées, alternatives au glissement, saisie tactile, oralité, rythme | Tâches réalisables sans geste précis ni saisie impossible ; validation sur ordinateur, tablette et petit écran |
| 5 — Validation pédagogique | Relecture des corpus, contrôle métier des sorties IA, essais accompagnés | Corrigés justes, objectifs explicites, aides tracées et scores interprétables pour chaque exercice |

Ne pas présenter un exercice comme « validé » sur la seule réussite du rendu. Les tests de recette doivent aussi couvrir mauvaise réponse, correction, aide, abandon, reprise, séance vide, limites des valeurs et devoir individualisé. Pour les contenus IA, contrôler la cohérence question/réponse/distracteurs avant de les soumettre à l'élève et disposer d'une banque de secours relue.

## Reproductibilité

Outils ajoutés : `scripts/audit-exercise-catalog.cjs`, `scripts/audit-visual-harness.cjs`, `scripts/audit-visual-scan.cjs`, `scripts/audit-targeted-interactions.cjs`. Le catalogue est inspecté sans importer de service ; le banc navigateur remplace explicitement les services externes et bloque les requêtes hors localhost. Playwright est requis pour les deux scripts navigateur ; son chemin peut être fourni dans `PLAYWRIGHT_MODULE`. Les fichiers générés dans `.next/audit-integrity` sont temporaires, les résultats retenus sont conservés dans ce dossier d'audit.
