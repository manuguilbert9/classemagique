# Reprise pédagogique des 20 activités

**État : terminé et validé le 16 septembre 2026.** Les quatre tâches ci-dessous ont été réalisées. Validation : 57 tests automatisés, 80 manches navigateur, 20 redémarrages, contrôles mobile et clavier ciblés, TypeScript sans erreur.

**Objectif :** faire porter les manipulations sur la compétence, avec des supports lisibles, sans dévoiler les réponses par la disposition ou les contrôles désactivés.

**Architecture :** conserver les trois familles et le contrat `RoundProps` / `useRoundFeedback`, extraire les supports spécialisés si nécessaire. Réutiliser les conventions des gabarits existants (dizaines rouges, unités bleues, chiffres barrés et valeurs d'emprunt). Pas de nouvelle dépendance, pas de modification des résultats historiques.

**Spécification :** demande utilisateur du 16 septembre : chronologie paraphrasée, emprunts matérialisés dans le calcul posé, preuves sélectionnées directement dans le texte ; examiner et améliorer les autres nouvelles activités. Travail local sur le serveur 9005, sans publication.

## Tâche 1 — Français (6 activités)
- [ ] Chronologie : récit distinct des cartes, reformulations véritables, quelques récits avec retour en arrière, liens causaux plausibles et variés ; conserver une seule chronologie possible.
- [ ] Preuves et détective : sélectionner des phrases dans un texte continu ; conserver la réponse choisie et la preuve surlignée.
- [ ] Accord : ne plus désactiver les mots déjà corrects, ce qui révèle les erreurs ; conserver des choix et une justification grammaticale.
- [ ] Référent : désigner directement le nom dans le texte et matérialiser le lien au pronom.
- [ ] Message : phrase manipulable avec outil majuscule/point réversible et lecture finale.
- [ ] Adapter les tests de données et de navigation du français.

## Tâche 2 — Mathématiques (6 activités)
- [ ] Soustraction : gabarit D/U interactif, chiffres barrés et emprunts visibles, cellule erronée cliquable puis correction dans la cellule ; résultat à compléter après correction de l'emprunt.
- [ ] Milieu : points directement sélectionnables dans le segment, mesures des deux parties visibles après vérification.
- [ ] Mesure : déplacement de la règle pour aligner son zéro puis vérification de longueur.
- [ ] Estimation : faire expliciter le contrôle avec un résultat incohérent à rejeter et des arrondis lisibles.
- [ ] Opération : visualiser réellement le retrait dans la collection initiale, éviter deux collections donnant l'impression d'une réunion.
- [ ] Voisins : droite graduée adaptative lisible sur mobile, maintien de l'appui puis retrait.
- [ ] Tests de calculs, erreurs et interaction des nouveaux supports.

## Tâche 3 — Premiers apprentissages (8 activités)
- [ ] Objets : réponse montrée avec son usage, choix visuels stables et lisibles.
- [ ] Deux actions : trace pictographique des deux actions et ordre lisible sans exiger la lecture.
- [ ] Distribution : fleurs déplacées visuellement, destinataires servis visibles ; navigation maladroite ne compte pas comme erreur de compétence.
- [ ] Comparaison : choisir directement une collection, correspondance visible et rejouable.
- [ ] Mot / phrase : retour sur le mot ou l'action observée, scène du sommeil réellement couchée.
- [ ] Commande : compléter concrètement un panier, visualiser les ajouts sans les confondre avec le stock.
- [ ] Train : wagons liés et quantités structurées, nombre choisi inséré puis règle +1/−1 explicitée.

## Tâche 4 — Intégration et validation
- [ ] Vérifier les 20 parcours et les mauvaises réponses ciblées sans données d'élève réelles.
- [ ] Vérifier mobile, clavier, absence d'erreurs JS et redémarrage des séances.
- [ ] Exécuter tests unitaires et TypeScript ; consigner les résultats et les limites.

## Décisions
- L'autorisation d'implémenter et de faire les choix est déjà donnée. Pas de nouvelle étape d'approbation.
- Conserver l'espace courant : changements précédents non commités nécessaires à la version testée sur 9005 ; aucun déplacement ou écrasement.
- Déléguer la famille français conformément à la méthode subagent-driven-development ; le coordinateur réalise les autres familles et l'intégration. Un seul sous-agent d'implémentation à la fois, fichiers distincts.
