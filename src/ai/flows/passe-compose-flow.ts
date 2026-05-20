import { z } from 'zod';
import { ai } from '../genkit';

const PasseComposeInputSchema = z.object({
  auxiliaries: z.array(z.enum(['avoir', 'etre'])),
  groups: z.array(z.enum(['1er', '2eme', '3eme'])),
  theme: z.string().optional(),
  count: z.number().default(10),
});

const PasseComposeOutputSchema = z.object({
  questions: z.array(z.object({
    sentence: z.string().describe("La phrase avec un trou pour le verbe (ex: 'Hier, nous _____ une pomme.')"),
    infinitive: z.string().describe("L'infinitif du verbe à conjuguer (ex: 'manger', 'aller', 'finir')"),
    answer: z.string().describe("Le verbe correctement conjugué au passé composé. Pour les verbes pronominaux, inclure le pronom réfléchi (ex: 's'est levée', 't'es levé', 'nous nous sommes promenés'). Pour les non-pronominaux: 'avons mangé', 'sont allés'."),
    options: z.array(z.string()).describe("3 options pour le QCM, incluant la bonne réponse et 2 distracteurs plausibles (erreurs d'accord, mauvais auxiliaire, mauvais participe passé)"),
  }))
});

export const passeComposeFlow = ai.defineFlow({
  name: 'passeComposeFlow',
  inputSchema: PasseComposeInputSchema,
  outputSchema: PasseComposeOutputSchema,
}, async (input): Promise<z.infer<typeof PasseComposeOutputSchema>> => {

  const prompt = `
    Génère un exercice de conjugaison au passé composé en français.
    Tu dois générer exactement ${input.count} phrases.

    Contraintes pour les phrases :
    - Auxiliaires autorisés : ${input.auxiliaries.join(', ')}
    - Groupes de verbes autorisés : ${input.groups.join(', ')} (1er = -er, 2eme = -ir avec participe présent en -issant, 3eme = irréguliers).
    ${input.theme ? `- Thème de l'exercice : ${input.theme}` : '- Thème libre, adapté pour des enfants.'}
    - Fais attention à l'accord du participe passé avec l'auxiliaire 'être' (et avec 'avoir' si COD placé avant, mais évite de préférence les cas trop complexes pour des enfants).
    - Varie les pronoms sujets (je, tu, il, elle, on, nous, vous, ils, elles) ou utilise des groupes nominaux (ex: 'Les enfants', 'Marie et Paul').
    - RÈGLE STRUCTURE DU TROU (critique) : le participe passé du verbe NE DOIT JAMAIS apparaître dans la phrase en dehors du trou. Le trou '_____' contient toujours la forme verbale COMPLÈTE : auxiliaire + participe passé. Aucun mot ne peut s'intercaler entre les deux.
      * INTERDIT : 'Les enfants _____ beaucoup joué.' ← 'joué' visible hors du trou.
      * INTERDIT : 'Déjà, les enfants _____ mangé.' ← 'mangé' visible hors du trou.
      * INTERDIT : 'Elle _____ bien dormi hier.' ← 'dormi' visible hors du trou.
      * CORRECT : 'Les enfants _____ dans le jardin.' (answer: 'ont joué') ← rien du verbe hors du trou.
      * CORRECT : 'Hier, les enfants _____ dehors.' (answer: 'ont joué')
      * CORRECT : 'Elle _____ très tard hier soir.' (answer: 'est arrivée')
    - RÈGLE VERBES PRONOMINAUX (se lever, se promener, s'habiller, etc.) — TRÈS IMPORTANT :
      * Le trou doit contenir le pronom réfléchi + l'auxiliaire + le participe passé en entier.
      * NE JAMAIS mettre le pronom réfléchi avant le trou dans la phrase.
      * Formes correctes dans le trou : 's'est levé', 'se sont levés', 'me suis levé(e)', 't'es levé(e)', 'nous nous sommes levés', 'vous vous êtes levés'.
      * EXEMPLE CORRECT phrase affirmative : 'Ce matin, Marie _____ tôt.' → answer: 's'est levée'
      * EXEMPLE INCORRECT (INTERDIT) : 'Ce matin, Marie s'_____ levée tôt.' ← le pronom réfléchi est déjà dans la phrase, le trou ne contiendrait que l'auxiliaire, ce qui est ambigu.
      * Pour les phrases interrogatives avec un verbe pronominal : utilise OBLIGATOIREMENT la tournure "est-ce que" pour éviter l'inversion sujet-verbe. Ex: 'Pourquoi est-ce que tu _____ tôt ce matin ?' → answer: 't'es levé'

    - RÈGLE D'ÉLISION (non-pronominaux) : l'élision (je→j') ne s'applique QUE si le mot suivant commence par une VOYELLE.
      * Auxiliaire 'avoir' (ai, as, a...) → commence par voyelle → élision : 'j'_____', ex: answer 'ai mangé'
      * 'être' : VÉRIFIE la forme selon le sujet :
        - 'suis' (je) → S consonne → PAS d'élision → 'je _____'
        - 'sommes' (nous) → S consonne → PAS d'élision → 'nous _____'
        - 'sont' (ils/elles) → S consonne → PAS d'élision → 'ils _____' / 'elles _____'
      * EXEMPLE CORRECT : 'Les joueurs se _____ entraînés.' (answer: 'sont entraînés') — car 'sont' commence par S.

    Pour chaque phrase, tu dois fournir :
    1. 'sentence': La phrase avec un trou (indiqué par '_____') à la place du verbe conjugué au passé composé.
    2. 'infinitive': L'infinitif du verbe à conjuguer (ex: 'manger', 'aller', 'se promener'). C'est l'indice donné à l'élève en mode saisie clavier.
    3. 'answer': La bonne réponse à insérer dans le trou (ex: 'sont allés', 'a fini').
    4. 'options': Un tableau contenant exactement 3 choix pour un QCM.
       - L'un des choix DOIT être la bonne réponse (identique à 'answer').
       - Les 2 autres choix doivent être des erreurs courantes :
         - Erreur d'auxiliaire (ex: 'ont allés' au lieu de 'sont allés')
         - Erreur d'accord du participe passé (ex: 'sont allé' au lieu de 'sont allés' pour un sujet pluriel)
         - Autre temps (ex: 'allons' au lieu de 'sommes allés')
         - Participe passé mal formé (ex: 'a prendu' au lieu de 'a pris')

    Assure-toi que les distracteurs ont l'air plausibles pour un enfant qui apprend le passé composé.
  `;

  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: prompt,
    output: {
      schema: PasseComposeOutputSchema,
    },
  });

  if (!output) {
      throw new Error("Failed to generate passe compose questions");
  }

  return output;
});
