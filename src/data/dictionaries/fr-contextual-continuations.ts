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
      "crois",
      "comprends",
      "viens",
    ],
  },
  {
    context: ["je", "ne"],
    suggestions: ["sais", "suis", "peux", "veux", "pense"],
  },
  {
    context: ["je", "suis"],
    suggestions: ["là", "désolé", "fatigué", "pressé", "prêt", "en route"],
  },
  {
    context: ["je", "vais"],
    suggestions: ["bien", "arriver", "venir", "faire", "essayer", "voir"],
  },
  {
    context: ["je", "peux"],
    suggestions: ["venir", "aider", "essayer", "répondre", "passer", "t'aider"],
  },
  {
    context: ["je", "dois"],
    suggestions: ["partir", "rendre", "finir", "y aller", "me dépêcher"],
  },
  {
    context: ["je", "voudrais"],
    suggestions: ["savoir", "venir", "te voir", "qu'on parle"],
  },
  {
    context: ["tu"],
    suggestions: ["es", "vas", "peux", "veux", "dois", "fais"],
  },
  {
    context: ["tu", "es"],
    suggestions: ["où", "prêt", "là", "dispo", "libre"],
  },
  {
    context: ["tu", "peux"],
    suggestions: ["venir", "m'aider", "répondre", "passer", "me dire"],
  },
  {
    context: ["tu", "veux"],
    suggestions: ["venir", "qu'on", "faire", "dire", "essayer"],
  },
  {
    context: ["tu", "as"],
    suggestions: ["vu", "pris", "fini", "besoin"],
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
    suggestions: ["va", "se", "peut", "arrive", "se retrouve"],
  },
  {
    context: ["on", "se"],
    suggestions: ["voit", "retrouve", "tient", "dit", "capte"],
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
    suggestions: ["a", "avait", "aura", "en a"],
  },
  {
    context: ["c"],
    suggestions: ["est", "était", "sera", "serait"],
  },
  {
    context: ["c'est"],
    suggestions: ["bon", "noté", "parti", "super", "ok"],
  },
  {
    context: ["ça"],
    suggestions: ["va", "marche", "se passe", "change"],
  },
  {
    context: ["merci"],
    suggestions: ["beaucoup", "pour", "d'avance", "à toi"],
  },
  {
    context: ["merci", "pour"],
    suggestions: ["ton", "ta", "votre", "l'aide", "tout"],
  },
  {
    context: ["bon"],
    suggestions: ["jour", "soir", "courage", "appétit", "anniversaire"],
  },
  {
    context: ["à"],
    suggestions: ["bientôt", "plus", "demain", "tout", "tout de suite", "lundi"],
  },
  {
    context: ["à", "tout"],
    suggestions: ["de suite", "à l'heure", "moment"],
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
    context: ["est-ce", "que"],
    suggestions: ["tu", "je", "vous", "nous", "c'est"],
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
    context: ["pas"],
    suggestions: ["de souci", "de problème", "grave", "encore"],
  },
  {
    context: ["bien"],
    suggestions: ["sûr", "joué", "merci", "vu"],
  },
  {
    context: ["très"],
    suggestions: ["bien", "vite", "content", "drôle"],
  },
];
