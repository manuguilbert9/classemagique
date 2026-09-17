# Correctifs français — 16 septembre 2026

Périmètre de cet intervenant : données, générateurs, oral, dictée et interactions françaises. Les corrections clavier, fluence, suivi commun et catalogue sont suivies par les autres intervenants. Aucun appel IA réel ni écriture de résultat élève.

| Constat | Correction et preuve |
| --- | --- |
| 1 : attaque phonémique, images vides, doublons | Banque dédiée de 23 mots avec syllabe orale initiale explicite et image locale existante. Une seule cible, distracteurs de syllabes différentes, trois mots distincts. 100 tirages testés. |
| 3 : construction D vide | 10 phrases de plus de 10 mots ajoutées ; 30 tirages D testés sans phrase B/C. |
| 4 : GN/NI | ga + gn + er ; les 20 reconstructions sont testées, count est respecté. |
| 4/8 : adjectifs | Remplacement de la banque non relue par 16 items relus : B phrases courtes, C plusieurs GN/accords/déterminants ; variante « petit canapé » acceptée ; « Le épais », « Des belles », « vieux ami » retirés/corrigés. Ajustement de Le/La en L’ et Des belles en De belles, prévisualisation. Niveau élève/URL transmis au stock. |
| 4 : tri | Moustique et crocodile retirés de Mer ; Savane devient Animaux terrestres ; doublon léopard retiré. |
| 5 : oral | Accumulation de tous les segments finaux de la session. Aucune transcription ni panne ne produit une erreur pédagogique : validation explicite par adulte, réussie/à retravailler ; progression manuelle possible sans micro et sans service de transcription. Arrêt/nettoyage du moteur et démarrage protégé. |
| 6 : dictée | Alignement par distance d’édition ; insertions, suppressions et substitutions explicites. Le chat noir ne peut plus obtenir 100 % pour Le chat ; une insertion initiale conserve les mots suivants correctement orthographiés. |
| 8 : repérer nom | D possède un corpus distinct : plusieurs noms, noms abstraits/propres, groupes développés et subordonnées. C conserve les phrases simples. |
| 8/10 : passé composé | Générateur noté alimenté exclusivement par 30 conjugaisons relues (10 par niveau), sans appel IA ; B singulier court, C pluriel/accords être, D GN développés/contextes longs. Auxiliaires et groupes filtrés. Combinaison être seul + deuxième groupe refusée explicitement (pas de substitution silencieuse). Ancien flow : exemple contradictoire corrigé, count/niveau et validation de structure/options ajoutés. |
| 9 : déplacements | Étiquettes et lettres : boutons natifs Avant/Après pour chaque élément. Adjectifs : liste native de destinations, utilisable au clavier et au toucher ; déplacement d’un adjectif déjà placé possible. |
| 11 : familles | Filtrage des originaux inconnus, doublons dans chaque colonne et entre colonnes, chaînes vides/identiques ; prompt impose une bijection. Banque de secours relue si résultat vide ou erreur. Message précise l’usage possible du corpus de secours. |
| Réserve MBP | Exceptions n devant b/p réellement ciblées, dont bonbon ; tirages sans répétition avant épuisement du corpus. |
| Suivi des corrections | Étiquettes, lettres, adjectifs enregistrent première réponse, essais et aide via l’API commune. Réinitialisation du droit à l’erreur entre phrases d’étiquettes ajoutée. |

## Vérifications

`node --test tests/french-audit.test.cjs` : 8 tests réussis (images/tirages, GN/NI exhaustif, dictée, D construction/noms, adjectifs, passé composé, collisions familles, exceptions MBP).

`npx tsc --noEmit --pretty false` : seule erreur signalée au moment du contrôle dans `calendar-exercise.tsx:219` (propriété doublée, signalée à l’intervenant racine), aucune erreur française.

## Intégration et limites explicites

- Racine : registry `generatePhrasesAEnrichir(count, niveau)` et `questions.ts` troisième paramètre de `generatePasseComposeQuestions(settings, count, niveau)` ; transmettre le niveau effectif dans numberLevel pour le passé composé.
- Le thème libre de génération a été retiré par racine de l’écran passé composé ; les combinaisons incompatibles sont signalées et le démarrage reste récupérable après erreur.
- Le moteur vocal n’évalue plus la compétence : les scores reflètent exclusivement l’observation adulte, indiquée dans les détails.
- Les résultats IA de familles restent validés structurellement, pas certifiés linguistiquement mot par mot ; aucun appel live prétendument relu.
- Les petits corpus relus remplacent volontairement des banques plus vastes contenant des erreurs ; élargissement possible après relecture pédagogique.
- Pas de prétention de relecture exhaustive des 34 semaines, de certification TTS ou de validation visuelle de chaque emoji. Ces réserves nécessitent une séance enseignante ; elles ne sont pas présentées comme des tests réussis.
- Validation navigateur ajoutée : `node scripts/verify-french-interactions.cjs`, 10 scénarios réussis à 390 px ; preuve structurée dans `fixes-french-browser.json`. Étiquettes et lettres entièrement remises en ordre via Entrée sur boutons Avant/Après ; adjectifs B/C résolus par liste native ; deux séances orales complétées sans moteur vocal ; niveaux B/C/D passé composé transmis ; combinaison incompatible bloquée puis corrigée sans quitter l’écran. Le harnais utilise un élève fictif, des écritures simulées et une liste synthétique « chat », tout réseau externe est bloqué.
