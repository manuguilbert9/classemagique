# Refonte progressive — activités de français

## Flux et sélecteurs pour l’automatisation

Les contrôles interactifs sont des `button` natifs et restent accessibles au clavier. Les libellés ci-dessous peuvent être utilisés avec `getByRole('button', { name: ... })`.

### `detective-phrase`

1. Cliquer directement sur la phrase probante dans le groupe `role="group"` nommé `Texte de l’enquête`.
2. La phrase correcte reste surlignée (`aria-pressed="true"`).
3. Cliquer sur `prouve l’affirmation` ou `contredit l’affirmation` selon le cas. Ce choix termine le round.

### `reparer-message`

1. Choisir `Outil majuscule`, puis toucher le premier mot de la phrase.
2. Choisir `Outil point`, puis toucher le dernier mot.
3. Un second clic sur le même mot retire le signe : les deux opérations sont réversibles.
4. Cliquer `Vérifier la phrase`, puis `J’ai lu la phrase` pour terminer.

La phrase est le groupe `role="group"` nommé `Phrase à réparer`. Les mots choisis exposent `aria-pressed="true"`.

### `accord-reparer`

1. Chaque mot du groupe nominal est un bouton, y compris ceux dont la forme initiale est déjà correcte.
2. Cliquer un mot, puis choisir sa forme dans les boutons proposés. Répéter pour les trois mots.
3. Cliquer `Vérifier l’accord`.
4. Après validation, chaque mot reçoit un retour visuel `✓` avec un libellé accessible de la forme `Nom correctement accordé`.
5. Cliquer `J’ai compris l’accord` pour terminer.

### `referent-pronom`

1. Le pronom est immédiatement visible dans un élément `mark` violet.
2. Cliquer directement sur l’un des noms encadrés dans le texte. Il n’y a plus de QCM intermédiaire.
3. Le bon antécédent reste jaune, avec `aria-pressed="true"`, et le lien textuel `Pronom → antécédent` apparaît.
4. Cliquer `J’ai trouvé le référent` pour terminer.

### `preuves-texte`

1. Choisir une réponse dans le QCM initial.
2. La réponse retenue reste affichée sous `Ma réponse :`.
3. Sélectionner une ou plusieurs phrases complètes dans le groupe `role="group"` nommé `Texte à lire`. Un clic ajoute une phrase ; un second clic la retire.
4. Cliquer `Vérifier mes preuves`. Pour Zoé et Adam, chacune des deux phrases qui justifie à elle seule la réponse est acceptée. Le round Nour demande sa phrase de but explicite. Seule la comparaison des deux pots exige les deux observations complémentaires annoncées par la question.
5. Les preuves correctes restent surlignées avec `aria-pressed="true"` et sont répétées sous `Mes preuves :`.
6. Cliquer `Terminer ma réponse` pour terminer ; la justification écrite reste facultative.

### `chronologie-coherente`

1. Le récit continu est distinct des quatre cartes : celles-ci reformulent les événements.
2. Réordonner avec les boutons dont les noms commencent par `Monter :` et `Descendre :`, puis cliquer `Vérifier l’ordre`.
3. Choisir l’événement causal demandé. Sa position correcte varie selon le round.
4. Choisir le lien causal plausible, puis `Terminer ma réponse`.

Les rounds 1 et 3 présentent volontairement le récit dans un ordre narratif non chronologique (résultat ou fin raconté en premier), tout en gardant une seule chronologie correcte pour les cartes.

## Vérifications locales

- `node --experimental-strip-types --test tests/french-data.test.mjs` : 6 tests réussis.
- `npx tsc --noEmit --pretty false` : aucune erreur.
