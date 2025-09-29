export interface ContextualContinuation {
  context: string[];
  suggestions: string[];
}

export const CONTEXTUAL_CONTINUATIONS: ContextualContinuation[] = [
  {
    context: ["je"],
    suggestions: [
      "suis",
      "vais",
      "peux",
      "voudrais",
      "dois",
      "reviens",
      "pense",
    ],
  },
  {
    context: ["je", "ne"],
    suggestions: ["sais", "suis", "peux", "veux"],
  },
  {
    context: ["tu"],
    suggestions: ["es", "vas", "peux", "veux", "dois"],
  },
  {
    context: ["il"],
    suggestions: ["est", "va", "faut", "avait"],
  },
  {
    context: ["elle"],
    suggestions: ["est", "va", "arrive"],
  },
  {
    context: ["on"],
    suggestions: ["va", "se", "peut", "arrive"],
  },
  {
    context: ["nous"],
    suggestions: ["sommes", "allons", "pouvons", "devons", "voudrions"],
  },
  {
    context: ["vous"],
    suggestions: ["êtes", "avez", "pouvez", "voulez", "devriez"],
  },
  {
    context: ["ils"],
    suggestions: ["sont", "vont", "ont"],
  },
  {
    context: ["elles"],
    suggestions: ["sont", "vont", "ont"],
  },
  {
    context: ["il", "y"],
    suggestions: ["a", "avait", "aura"],
  },
  {
    context: ["c"],
    suggestions: ["est", "était", "sera", "serait"],
  },
  {
    context: ["ça"],
    suggestions: ["va", "marche", "se passe"],
  },
  {
    context: ["merci"],
    suggestions: ["beaucoup", "pour", "d'avance"],
  },
  {
    context: ["bon"],
    suggestions: ["jour", "soir", "courage"],
  },
  {
    context: ["à"],
    suggestions: ["bientôt", "plus", "demain", "tout"],
  },
  {
    context: ["qu"],
    suggestions: ["est-ce", "on", "il", "elle"],
  },
  {
    context: ["est-ce"],
    suggestions: ["que"],
  },
  {
    context: ["d"],
    suggestions: ["accord", "ailleurs", "avance"],
  },
  {
    context: ["t"],
    suggestions: ["es", "as", "inquiète"],
  },
  {
    context: ["bien"],
    suggestions: ["sûr", "joué", "merci"],
  },
  {
    context: ["très"],
    suggestions: ["bien", "vite", "content"],
  },
];
