import type { DicteeSemaine } from './types';

/**
 * Période 3 — semaines 13 à 19.
 * Déroulé : J1 dictée de groupes de mots complexes, J2 dictée à choix multiples,
 * J3 dictée transposée, J4 dictée bilan.
 *
 * Pour les dictées à choix multiples, les propositions sont notées telles quelles,
 * séparées par des barres obliques, comme dans le guide de la méthode.
 */
export const PERIODE_3: DicteeSemaine[] = [
  {
    semaine: 13,
    periode: 3,
    notion: { numero: 17, titre: "Les formes de phrases" },
    corpusTheme: "La ville",
    objectifSequence:
      "Amener les élèves à écrire différents types et formes de phrases en observant que la ponctuation (point, point d'interrogation, point d'exclamation) et certains mots modifient le sens de l'énoncé.",
    objectifsTransversaux: [
      "Respecter les accords au pluriel dans les groupes nominaux",
      "Écrire correctement des mots du corpus lexical de la ville",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -aire »",
        explication:
          "Beaucoup de noms et d'adjectifs se terminent par « -aire ». Ce suffixe désigne souvent une fonction ou un métier dans les noms (secrétaire, libraire) ou une relation à quelque chose dans les adjectifs (scolaire → lié à l'école / solaire → lié au soleil). On retrouve cette terminaison ici dans extraordinaire. Cette terminaison est fréquente et régulière, aussi bien au masculin qu'au féminin.",
      },
      {
        titre: "Le mot « aujourd'hui »",
        explication:
          "Le mot aujourd'hui est formé de plusieurs éléments anciens : au jourd'hui, c'est-à-dire « au jour de ce jour ». Le mot hui vient du latin hodie, qui signifiait déjà « aujourd'hui ». Il contient le mot jour, ce qui peut aider à l'écrire correctement.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une animation" },
        { mot: "la boulangerie" },
        { mot: "un croissant" },
        { mot: "bruyant" },
        { mot: "extraordinaire" },
      ],
      niveau2: [
        { mot: "un panneau" },
        { mot: "belle" },
        { mot: "sans" },
        { mot: "prêter attention" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots-complexes",
        niveau1: [
          "j'observe",
          "les animations de rue",
          "tout autour de moi",
          "des croissants chauds",
          "est-ce que",
        ],
        niveau2: ["ils traversent", "sans prêter attention"],
      },
      {
        jour: 2,
        type: "choix-multiples",
        niveau1: ["Les route/nt/routes/route en ville sont/est/être bruyantes/bruyant/bruyante."],
        niveau2: [
          "Les passants/passant/passante regardes/regardent/regarde les panneau/x/panneaux/panneau.",
        ],
      },
      {
        jour: 3,
        type: "transposee",
        niveau1: ["Aujourd'hui, je marche en ville et je profite des animations."],
        niveau2: ["Ces routes traversent la ville."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Aujourd'hui, je marche dans la ville et j'observe tout autour de moi.",
          "Les routes sont bruyantes, mais je profite des animations de rue.",
          "Cette boulangerie fait des croissants extraordinaires !",
          "Est-ce que tu aimes la bonne odeur du pain chaud, toi aussi ?",
        ],
        mots: 43,
      },
      niveau2: {
        phrases: ["Les passants traversent sans prêter attention aux panneaux."],
        mots: 51,
      },
      bonus: {
        phrases: ["Ce jardin fleuri est bien entretenu par les agents municipaux !"],
        mots: 63,
      },
    },
    guidePage: 132,
    cahierPage: 32,
  },
  {
    semaine: 14,
    periode: 3,
    notion: { numero: 1, titre: "L'ordre alphabétique et la recherche dans le dictionnaire" },
    corpusTheme: "Les animaux domestiques",
    objectifSequence:
      "Amener les élèves à repérer et classer le vocabulaire des animaux et de la vie quotidienne selon l'ordre alphabétique, en lien avec l'utilisation du dictionnaire pour vérifier le sens et l'orthographe des mots rencontrés dans la dictée.",
    objectifsTransversaux: [
      "Écrire correctement des phrases interrogatives en respectant l'inversion sujet-verbe",
      "Écrire correctement des mots du corpus lexical des animaux de compagnie",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Le verbe être à la 3e personne du singulier",
        explication:
          "Le mot est (verbe être) est un héritage du latin. Il s'agit, en effet, de la forme de la 3e personne du singulier de esse (être en latin). La lettre t finale ne se prononce plus, mais elle est restée dans l'écriture pour marquer la fonction grammaticale. Le verbe être mélange des formes issues de esse (être) et de stare (se tenir debout), ce qui explique la diversité de ses conjugaisons (est, été, étant, étais...).",
      },
      {
        titre: "Le graphème « gn »",
        explication:
          "Les lettres « gn » se prononcent généralement [ɲ], comme dans les mots compagnie, compagnon, mignon. C'est la règle qu'il faut retenir au cycle 2. Toutefois, dans certains mots, ces lettres se prononcent [gn], comme dans le mot gnou.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une compagnie" },
        { mot: "la vigilance" },
        { mot: "le bien-être" },
        { mot: "gentil" },
        { mot: "important" },
        { mot: "prendre soin" },
        { mot: "souhaiter", temps: "au présent" },
        { mot: "préférer", temps: "au présent" },
      ],
      niveau2: [
        { mot: "un panier" },
        { mot: "une gamelle" },
        { mot: "un besoin" },
        { mot: "douillet" },
        { mot: "avoir", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots-complexes",
        niveau1: [
          "un animal de compagnie",
          "prendre soin de lui",
          "tu aimes",
          "ils demandent",
          "préfères-tu",
          "son bien-être",
        ],
        niveau2: ["un panier douillet", "nous avons besoin"],
      },
      {
        jour: 2,
        type: "choix-multiples",
        niveau1: [
          "Les chiens/chien/chiennes est/sont/ont des animaux/animal/animaux de compagnie.",
        ],
        niveau2: [
          "Ils on/ont/oné besoin d'une gammelle/gamelle/gammele propre/propres/proprent.",
        ],
      },
      {
        jour: 3,
        type: "transposee",
        niveau1: ["Je souhaite adopter une lapine et des poissons rouges."],
        niveau2: ["Les chiens ont besoin d'un panier douillet."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Je souhaite adopter un animal de compagnie pour prendre soin de lui.",
          "J'aime les chiens car ils sont des gentils compagnons de promenade.",
          "Les lapins sont mignons, mais ils demandent beaucoup de vigilance.",
          "Préfères-tu un poisson ?",
          "Il est important de penser, avant tout, à son bien-être.",
        ],
        mots: 48,
      },
      niveau2: {
        phrases: ["Un chien a besoin d'un panier douillet et d'une gamelle propre."],
        mots: 61,
      },
      bonus: { phrases: ["Les chats, eux, sont des animaux solitaires."], mots: 68 },
    },
    guidePage: 19,
    cahierPage: 34,
  },
  {
    semaine: 15,
    periode: 3,
    notion: { numero: 18, titre: "La ponctuation et les marques du discours rapporté" },
    corpusTheme: "La recette",
    objectifSequence:
      "Amener les élèves à observer l'usage des signes de ponctuation dans un passage au discours direct, en distinguant les paroles rapportées du reste du texte.",
    objectifsTransversaux: [
      "Repérer et écrire des verbes d'action propres aux recettes de cuisine",
      "Écrire correctement des mots du corpus lexical de la recette",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Le graphème « qu »",
        explication:
          "Le son [k] s'écrit très souvent avec la lettre c, mais la deuxième façon la plus fréquente de l'écrire est avec les lettres « qu », que l'on retrouve dans environ un mot sur cinq (20 % des cas). Cette écriture a quelques particularités : « qu » n'est jamais suivi d'une consonne, mais presque toujours d'une voyelle, surtout e ou i. On trouve, par exemple, cette orthographe dans les mots quiche, maquillage, banque, question, technique ou encore musique.",
      },
      {
        titre: "Les mots en « -tion »",
        explication:
          "Dans les mots qui se terminent par le son [sjɔ̃], on écrit le plus souvent « -tion ». On retrouve cette terminaison dans de nombreux mots, en particulier après les lettres : c (soustraction), o (potion), a (préparation), p (option), i (addition), u (pollution). Le moyen mnémotechnique est : coupai.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une quiche" },
        { mot: "le champignon" },
        { mot: "une poêle" },
        { mot: "la muscade" },
        { mot: "fraîche" },
        { mot: "lorraine" },
        { mot: "griller / grillé" },
        { mot: "casser", temps: "au présent" },
        { mot: "répéter", temps: "au présent" },
      ],
      niveau2: [
        { mot: "une préparation" },
        { mot: "la pâte" },
        { mot: "homogène" },
        { mot: "verser", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots-complexes",
        niveau1: [
          "une quiche lorraine",
          "vous mélangez",
          "la crème fraîche",
          "les champignons grillés",
          "tu n'oublies pas",
        ],
        niveau2: ["la préparation homogène", "tu verses", "la pâte brisée"],
      },
      {
        jour: 2,
        type: "choix-multiples",
        niveau1: [
          "D'abord, je cassent/casse/casses les œuf/œufs/eufs et nous/je/tu mélange la crémière/crème/crèmerie et les champignon/champignons/champignonne.",
        ],
        niveau2: [
          "La quiche lorrain/lorraine/loranine est faite avec une pâte brisées/brisée/brisé.",
        ],
      },
      {
        jour: 3,
        type: "transposee",
        niveau1: ["Mon père oublie de préparer la quiche lorraine pour le dîner."],
        niveau2: ["La préparation est homogène."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Je prépare une quiche lorraine revisitée pour le dîner.",
          "D'abord, je casse les œufs et je mélange avec de la crème fraîche.",
          "Ensuite, je fais revenir les champignons dans une poêle pour les faire griller.",
          "Mon père me répète : « Surtout, tu n'oublies pas la muscade ! »",
        ],
        mots: 46,
      },
      niveau2: {
        phrases: ["Puis, je verse la préparation homogène sur la pâte brisée."],
        mots: 56,
      },
      bonus: {
        phrases: ["Quand elle est enfin cuite, la croûte doit être dorée et croustillante."],
        mots: 68,
      },
    },
    guidePage: 139,
    cahierPage: 36,
  },
  {
    semaine: 16,
    periode: 3,
    notion: { numero: 30, titre: "Les marques de personne du singulier (il/elle)" },
    corpusTheme: "Les devoirs scolaires",
    objectifSequence:
      "Amener les élèves à écrire correctement les verbes conjugués à la 3e personne du singulier au présent.",
    objectifsTransversaux: [
      "Écrire correctement des mots en lien avec l'école et les devoirs scolaires",
      "Respecter les accords au sein du groupe nominal",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots qui commencent par « ter- » ou « terr- »",
        explication:
          "Les mots qui commencent par « ter- » ont, généralement, un seul r lorsqu'ils sont suivis d'une consonne comme dans terminer. Ils en ont deux lorsqu'ils sont suivis d'une voyelle comme dans terre. Cette régularité est utile pour écrire correctement les mots de la même famille : terre → terrestre, territoire / terminer → terminaison, terminologie.",
      },
      {
        titre: "Les mots en « -oire »",
        explication:
          "Les noms communs en « -oir » et « -oire » suivent, généralement, une logique liée au genre. Les noms féminins se terminent par « -oire », comme histoire, poire, armoire. Il existe quelques exceptions : un laboratoire, un répertoire, un auditoire, un territoire, un accessoire ou un observatoire.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un bureau" },
        { mot: "un cahier" },
        { mot: "la leçon" },
        { mot: "un texte" },
        { mot: "la multiplication" },
        { mot: "imaginaire" },
        { mot: "soigneusement" },
        { mot: "réciter", temps: "au présent" },
        { mot: "étudier", temps: "au présent" },
      ],
      niveau2: [
        { mot: "les mathématiques" },
        { mot: "une règle" },
        { mot: "nouvelle" },
        { mot: "glisser", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots-complexes",
        niveau1: [
          "une leçon de grammaire",
          "le livre de français",
          "elles s'installent",
          "tu termines",
          "il récite soigneusement",
        ],
        niveau2: ["une nouvelle règle", "le cahier de mathématiques"],
      },
      {
        jour: 2,
        type: "choix-multiples",
        niveau1: [
          "Un courte/courts/court texte raconte/racontent/racontez une histoire/histoires imaginaires/imaginaire.",
        ],
        niveau2: [
          "Dans/Dan/Danse son cartable/cartablé/cartables, Mano glisse/glissé/glisses ses/son/sa livre.",
        ],
      },
      {
        jour: 3,
        type: "transposee",
        niveau1: ["À son bureau, il récite soigneusement sa leçon."],
        niveau2: ["Elle prépare sa règle pour la leçon de mathématiques."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Chaque soir, Mano s'installe à son bureau.",
          "Il regarde son cahier et il récite soigneusement sa leçon de grammaire.",
          "Ensuite, il étudie un court texte dans son livre de français qui raconte une histoire imaginaire.",
          "Enfin, Mano termine par une révision de ses tables de multiplication.",
        ],
        mots: 47,
      },
      niveau2: {
        phrases: ["Dans son cartable, il glisse sa nouvelle règle pour les mathématiques."],
        mots: 58,
      },
      bonus: {
        phrases: ["Avant de fermer son sac, il vérifie son cahier de textes pour ne rien oublier."],
        mots: 73,
      },
    },
    guidePage: 224,
    cahierPage: 38,
  },
  {
    semaine: 17,
    periode: 3,
    notion: { numero: 15, titre: "Le verbe dans la phrase et ses compléments" },
    corpusTheme: "La lettre",
    objectifSequence:
      "Amener les élèves à écrire correctement les verbes, en respectant les accords avec le sujet et en observant que le verbe peut être accompagné de compléments qui précisent ou complètent son sens.",
    objectifsTransversaux: [
      "Écrire correctement les marques du féminin en -e et du pluriel en -s",
      "Écrire correctement des mots du corpus lexical de la correspondance",
      "Respecter les accords au sein du groupe nominal",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Le graphème « e »",
        explication:
          "Dans une majorité des cas (51 %), on écrit le son [ɛ] avec la lettre e sans accent. C'est le cas lorsqu'elle est placée devant une double consonne comme dans lettre.",
      },
      {
        titre: "La terminaison des adjectifs",
        explication:
          "Pour connaître la terminaison d'un adjectif ou d'un participe passé au masculin singulier, il suffit souvent de le mettre au féminin. Exemple : allemand s'écrit allemande au féminin, il y a donc un d muet à la fin du mot au masculin.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un courrier" },
        { mot: "la boîte aux lettres" },
        { mot: "une enveloppe" },
        { mot: "un timbre" },
        { mot: "un correspondant" },
        { mot: "envoyé" },
        { mot: "allemand" },
        { mot: "en haut" },
      ],
      niveau2: [{ mot: "un cours" }, { mot: "les sciences" }, { mot: "le sport" }],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots-complexes",
        niveau1: [
          "une boîte aux lettres",
          "un timbre collé en haut",
          "une enveloppe pliée avec soin",
          "un correspondant allemand",
          "elles ont",
        ],
        niveau2: [
          "c'est une lettre en allemand",
          "Je préfère ce timbre",
          "En Allemagne, les élèves étudient l'allemand et le français.",
        ],
      },
      {
        jour: 2,
        type: "choix-multiples",
        niveau1: [
          "C'est une jolie/jolis/jolie enveloppe coloré/colorés/colorée avec un timbre/timbre/tunbre collé/colis/collé à droite.",
        ],
        niveau2: [
          "La/Le/Les carte postal/postale/post montre un quoi/courent/cours de sience/sciences/sçances.",
        ],
      },
      {
        jour: 3,
        type: "transposee",
        niveau1: ["Elle a une carte postale de son amie Lina."],
        niveau2: ["En Allemagne, les élèves étudient l'allemand et le français."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Ce matin, il y a du courrier dans la boîte aux lettres de Nour.",
          "L'enveloppe est pliée avec soin et le timbre est collé en haut à droite.",
          "Elle récupère la lettre.",
          "C'est une carte postale envoyée par Lina, sa correspondante allemande !",
          "Lina raconte sa journée à l'école.",
        ],
        mots: 50,
      },
      niveau2: {
        phrases: ["Lina a des cours d'allemand, mais elle préfère les sciences et le sport."],
        mots: 64,
      },
      bonus: { phrases: ["Nour décide de lui répondre immédiatement."], mots: 70 },
    },
    guidePage: 118,
    cahierPage: 40,
  },
  {
    semaine: 18,
    periode: 3,
    notion: { numero: 9, titre: "Les mots invariables" },
    corpusTheme: "Le supermarché",
    objectifSequence:
      "Amener les élèves à écrire correctement des mots invariables en contexte, en observant qu'ils s'écrivent toujours de la même manière, quel que soit leur usage dans la phrase.",
    objectifsTransversaux: [
      "Écrire correctement la négation dans une phrase.",
      "Écrire correctement des mots du corpus lexical du supermarché",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Le mot monsieur",
        explication:
          "Le mot monsieur vient de l'ancienne expression mon sieur qui signifiait « mon seigneur ». Son pluriel, messieurs, vient de mes sieurs. L'orthographe de ces mots a peu changé avec le temps, mais leur prononciation a beaucoup évolué, ce qui peut rendre leur écriture difficile à deviner. Connaître leur origine permet de mieux retenir leur orthographe.",
      },
      {
        titre: "Les mots en « -ette »",
        explication:
          "Beaucoup de mots féminins qui se terminent par [ɛt] s'écrivent « -ette », notamment avec l'ajout du suffixe diminutif « -ette » comme dans brochette (une petite broche), courgette (une petite courge), maisonnette (une petite maison).",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "monsieur" },
        { mot: "un chariot" },
        { mot: "l'osier" },
        { mot: "les rayons" },
        { mot: "une courgette" },
        { mot: "un yaourt" },
        { mot: "finalement" },
        { mot: "comparer", temps: "au présent" },
        { mot: "décider", temps: "au présent" },
      ],
      niveau2: [
        { mot: "une barquette" },
        { mot: "les lasagnes" },
        { mot: "ajouter", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots-complexes",
        niveau1: [
          "un panier en osier",
          "elle décide",
          "des brochettes marinées",
          "des belles courgettes",
          "un yaourt préféré",
        ],
        niveau2: ["nous ajoutons", "pour le dîner", "une barquette de lasagnes"],
      },
      {
        jour: 2,
        type: "choix-multiples",
        niveau1: [
          "Monsieur/Monsieur/Monsieur Verdi compare/comparent/compare les produits/produit/produisent dans les rads/rallier/rayons.",
        ],
        niveau2: [
          "Cette/Ces/Cet barquette de lasagnes/lasagns/lasagne sera/seront/serat savoureuse pour la/le/les dîner.",
        ],
      },
      {
        jour: 3,
        type: "transposee",
        niveau1: ["Monsieur Paul demande une courgette et des yaourts."],
        niveau2: ["Il ajoute une belle barquette de lasagnes pour le dîner."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Monsieur Verdi entre dans le supermarché avec un chariot et un panier en osier.",
          "Il marche dans les rayons et il compare les produits.",
          "Finalement, il décide de prendre quelques brochettes marinées et des courgettes pour le déjeuner.",
          "Avant d'aller en caisse, il n'oublie pas de prendre ses yaourts préférés.",
        ],
        mots: 52,
      },
      niveau2: {
        phrases: ["Il ajoute aussi une barquette de lasagnes pour le dîner."],
        mots: 62,
      },
      bonus: { phrases: ["Il patiente à la caisse avec ses articles."], mots: 70 },
    },
    guidePage: 75,
    cahierPage: 42,
  },
  {
    semaine: 19,
    periode: 3,
    notion: { numero: 31, titre: "La construction du présent" },
    corpusTheme: "La montagne en été",
    objectifSequence:
      "Amener les élèves à écrire correctement des verbes conjugués au présent de l'indicatif, en observant que la terminaison varie selon la personne et que l'accord sujet/verbe est essentiel.",
    objectifsTransversaux: [
      "Écrire correctement des mots invariables fréquents",
      "Écrire correctement des mots du corpus lexical de la montagne en été",
      "Respecter les accords au sein du groupe nominal",
      "Écrire correctement les mots qui présentent des régularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -ile »",
        explication:
          "Que ce soit pour un nom commun (une file, un mobile, un domicile) ou un adjectif (fragile, docile, subtil, facile), le son [il] à la fin d'un mot s'écrit très majoritairement « -ile ». Cette régularité concerne aussi bien les adjectifs que les mots masculins et féminins, elle est donc très stable.",
      },
      {
        titre: "Les mots qui contiennent « aise »",
        explication:
          "Le son [ɛz] s'écrit généralement « -aise », surtout dans les noms féminins (la falaise, une chaise, une fraise, la braise) et les adjectifs (anglaise, mauvaise). Mais il y a des exceptions notables : treize, seize (des nombres) ; synthèse, genèse, thèse, hypothèse, etc. (mots d'origine savante ou scientifique terminés en « -èse »).",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une falaise" },
        { mot: "le sommet" },
        { mot: "le silence" },
        { mot: "escarpé" },
        { mot: "jusqu'au" },
        { mot: "prudemment" },
        { mot: "à la file indienne" },
        { mot: "apercevoir" },
        { mot: "pouvoir", temps: "au présent" },
      ],
      niveau2: [
        { mot: "une crête" },
        { mot: "un alpage" },
        { mot: "atteindre" },
        { mot: "espérer", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots-complexes",
        niveau1: ["Il avance prudemment", "à la file indienne", "ils s'arrêtent", "jusqu'au rocher"],
        niveau2: ["avant de rentrer", "les pentes escarpées"],
      },
      {
        jour: 2,
        type: "choix-multiples",
        niveau1: [
          "Elle peut/peux/peuvent enfin apersevoir/apercevoir/appercevoir la cascades/cascade/cascad/cascadent au sommet/sommai/sommet.",
        ],
        niveau2: ["Elles espèrent/aspère/espères étendre/détendre/attendre le lacs/laque/lac."],
      },
      {
        jour: 3,
        type: "transposee",
        niveau1: ["Les enfants s'arrêtent en silence près du rocher."],
        niveau2: ["Ils escaladent une crête au sommet de la montagne."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Le soleil brille sur les montagnes d'été.",
          "Ilyan avance prudemment sur le sentier escarpé.",
          "Il escalade la falaise.",
          "Il peut enfin apercevoir la cascade au loin.",
          "Le groupe marche à la file indienne jusqu'au grand rocher.",
          "Au sommet, les enfants s'arrêtent près du lac pour admirer le paysage en silence.",
        ],
        mots: 52,
      },
      niveau2: {
        phrases: ["Ils espèrent bien atteindre la crête et les plages avant de rentrer."],
        mots: 64,
      },
      bonus: {
        phrases: ["Ilyan s'installe sur un tronc pour dessiner ce qu'il voit."],
        mots: 76,
      },
    },
    guidePage: 231,
    cahierPage: 44,
  },
];
