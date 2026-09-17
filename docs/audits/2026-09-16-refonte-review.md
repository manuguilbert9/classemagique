# Revue ciblée — 20 nouvelles activités

## Clôture après corrections

Les trois constats encore ouverts lors de la seconde lecture sont résolus : les unions de preuves pertinentes sont acceptées, les explications orales restent disponibles après validation et les distracteurs causaux ont été remplacés par des événements possibles mais absents ou contredits par le récit.

Validation finale : 57 tests automatisés, 80 manches sur les 20 parcours, 20 redémarrages, affichages mobiles, interactions clavier ciblées et vérification TypeScript réussis. Aucun profil élève ni service distant n’a été utilisé.

Revue statique finale du 16 septembre 2026 : français, mathématiques et huit premiers apprentissages. Aucun code modifié, aucun test global lancé. Les validations navigateur/clavier sont réalisées séparément par le coordinateur.

## Corrections confirmées

- **Ancien constat 2 — résolu** : la soustraction ne demande plus de recopier le résultat déjà affiché. La correction reste effectuée dans la cellule du gabarit et le résultat apparaît comme bilan.
- **Ancien constat 3 — résolu** : les boutons des points voisins alternent maintenant au-dessus et au-dessous du segment, avec traits de liaison ; ils ne partagent plus la même zone tactile sur mobile.
- **Ancien constat 5 — résolu** : après une mesure correcte, le message distingue explicitement la mesure réussie de l'avis initial à revoir. Le quatrième argument optionnel de `shared.check` conserve la comptabilisation des erreurs et le comportement par défaut.
- **Ancien constat 4 — partiellement résolu** : chacune des deux preuves de Zoé est désormais acceptée individuellement, mais leur sélection conjointe est encore rejetée, voir ci-dessous.
- **Ancien constat 1 — partiellement résolu** : les distracteurs de Nour sont désormais crédibles. Plusieurs liens de chronologie restent impossibles, voir ci-dessous.

## Défauts encore ouverts

1. **P2 — Des sélections réunissant uniquement de bonnes preuves sont rejetées.** `src/components/progressive/french-round.tsx:53` et `src/lib/progressive/french-data.ts:26–29` : le contrôle exige l'égalité exacte avec un tableau d'indices. Pour Zoé et Adam, sélectionner ensemble les phrases 2 et 3 (`[1,2]`) échoue alors que chacune est acceptée seule et que la consigne autorise plusieurs phrases. Pour les pots, sélectionner les phrases arrosage / absence d'eau / résultat (`[1,2,3]`) échoue, alors que c'est la preuve complète de la comparaison. Ajouter les combinaisons pertinentes aux options acceptées ; ne pas accepter aveuglément tous les sur-ensembles, qui pourraient comprendre des phrases sans rapport.

2. **P2 — Les nouvelles lectures des explications sont toujours désactivées.** `src/components/progressive/early-round.tsx:61,65,90,93,105`, avec `src/components/progressive/session.tsx:81` : `choose` appelle immédiatement `finish`. La session désactive alors tout le `fieldset` contenant le composant. Les boutons « Écouter » qui viennent d'apparaître pour l'objet utile, le mot, la phrase-image et le train sont donc impossibles à activer, y compris au clavier. Afficher ce retour avant d'appeler `finish`, avec un bouton final explicite et les réponses verrouillées, ou isoler les contrôles d'écoute hors du champ désactivé. Le texte demeure visible, mais les élèves non lecteurs ne peuvent pas accéder à l'explication orale annoncée par le bouton.

3. **P2 — Des liens causaux restent éliminables sans lecture du récit.** `src/lib/progressive/french-data.ts:32,34,35` : sécher qui mouille, examiner une roue qui empêche l'air de sortir, prendre une éponge qui fait disparaître une flaque restent physiquement impossibles. La bonne réponse se distingue par sa seule vraisemblance.

   Remplacements précis proposés pour les deux distracteurs, en conservant le bon lien et sa position :
   - Léo : « La pluie mouille le chapeau pendant le retour de Léo. » ; « Léo mouille le chapeau en le lavant après l'avoir ramassé. »
   - Sam : « Sam remplace la roue abîmée avant de repartir. » ; « Sam change de vélo pour poursuivre son trajet. »
   - Mila : « Mila enlève l'eau avec le torchon, puis utilise l'éponge pour finir. » ; « Mila recueille l'eau dans le verre avant d'essuyer la table. »

   Ces alternatives sont des événements possibles mais non relatés, ou un ordre contraire au récit : le texte permet alors de les départager. Pour expliciter le critère, la question peut devenir « Quel lien explique la suite des événements dans ce récit ? ».
