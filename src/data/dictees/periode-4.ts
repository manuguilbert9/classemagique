import type { DicteeSemaine } from './types';

/**
 * Période 4 — semaines 20 à 26.
 * Déroulé : J1 dictée de phrases, J2 dictée caviardée, J3 dictée négociée, J4 dictée bilan.
 * (En semaine 26, le guide intitule le jour 1 « dictée de groupes de mots complexes ».)
 */
export const PERIODE_4: DicteeSemaine[] = [
  {
    semaine: 20,
    periode: 4,
    notion: { numero: 10, titre: "Les valeurs de la lettre S" },
    corpusTheme: "Le musée d'art",
    objectifSequence:
      "Amener les élèves à écrire correctement les mots contenant la lettre s, en observant que celle-ci peut se prononcer [s], [z] ou être muette selon sa place dans le mot et les lettres qui l'entourent.",
    objectifsTransversaux: [
      "Conjuguer correctement des verbes au présent",
      "Écrire correctement des mots du corpus lexical du musée d'art",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les familles de mots",
        explication:
          "Les familles de mots permettent d'orthographier le radical toujours de la même manière et d'ajouter des préfixes ou suffixes qui apportent du sens. Dans cette dictée, on retrouve, par exemple, les mots visite, visiter, visiteur qui appartiennent à la même famille.",
      },
      {
        titre: "Le graphème « s »",
        explication:
          "Dans l'immense majorité des cas, on écrit le son [z] avec la lettre s (91 % de fréquence pour seulement 8 % avec la lettre z). La lettre s qui produit le son [z] se situe toujours entre deux voyelles, comme dans visite. Lorsque la lettre s est doublée, comme dans dessin, elle fait le son [s]. Bien souvent, le son [s] s'écrit avec la lettre s (dans environ 46 % des cas), comme dans fresque, piste, soudain.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un visiteur" },
        { mot: "un musée d'art" },
        { mot: "une œuvre" },
        { mot: "une fresque" },
        { mot: "ancien" },
        { mot: "moderne" },
        { mot: "principal" },
        { mot: "venir", temps: "au présent" },
        { mot: "trôner", temps: "au présent" },
      ],
      niveau2: [
        { mot: "une exposition" },
        { mot: "le fusain" },
        { mot: "temporaire" },
        { mot: "présenter", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: ["Le musée a beaucoup de visites.", "Je profite du silence."],
        niveau2: ["L'exposition présente une sculpture.", "Ce dessin est réalisé au fusain."],
      },
      {
        jour: 2,
        type: "caviardee",
        niveau1: ["Il y a des sculptures anciennes et des tableaux modernes."],
        niveau2: ["Une exposition temporaire est présente à droite de la grande salle."],
      },
      {
        jour: 3,
        type: "negociee",
        niveau1: ["Ces œuvres modernes trônent au centre de la grande galerie."],
        niveau2: ["Ces dessins au fusain sont très modernes."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Des visiteurs viennent chaque jour visiter ce musée d'art.",
          "Dans la grande galerie, il y a des tableaux anciens et des œuvres modernes.",
          "Une fresque décore le mur principal.",
          "Une sculpture et un meuble trônent au centre de la grande salle.",
          "Tout le monde profite du silence.",
        ],
        mots: 47,
      },
      niveau2: {
        phrases: ["À droite, une exposition temporaire présente des dessins au fusain."],
        mots: 57,
      },
      bonus: {
        phrases: ["À gauche, les jeunes artistes esquissent quelques croquis dans leur carnet."],
        mots: 68,
      },
    },
    guidePage: 82,
    cahierPage: 46,
  },
  {
    semaine: 21,
    periode: 4,
    notion: { numero: 27, titre: "La relation sujet - verbe" },
    corpusTheme: "Le départ en voyage",
    objectifSequence:
      "Amener les élèves à écrire correctement les verbes conjugués en respectant la relation sujet/verbe, en observant que le verbe s'accorde toujours avec son sujet en personne et en nombre.",
    objectifsTransversaux: [
      "Respecter les accords en genre et en nombre au sein du groupe nominal",
      "Écrire correctement des mots du corpus lexical du voyage",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots qui commencent par « aff- »",
        explication:
          "La plupart des mots qui commencent par le son [af] s'écrivent « aff- » comme affiche, affront, affaire, affichage, etc.",
      },
      {
        titre: "La marque de personne avec ils et elles",
        explication:
          "Avec ils et elles, la marque de personne est -nt. Elle ne se prononce pas mais indique la 3e personne du pluriel.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "le voyage, le voyageur" },
        { mot: "les vêtements" },
        { mot: "un taxi" },
        { mot: "indispensable" },
        { mot: "essentiel" },
        { mot: "certains" },
        { mot: "rejoindre" },
        { mot: "patienter", temps: "au présent" },
        { mot: "embarquer", temps: "au présent" },
      ],
      niveau2: [{ mot: "la gare" }, { mot: "le contrôleur" }, { mot: "un wagon" }],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: ["Une valise solide est indispensable.", "Les voyageurs montent dans des taxis."],
        niveau2: ["Ils aident les avions.", "Les contrôleurs montent."],
      },
      {
        jour: 2,
        type: "caviardee",
        niveau1: ["Avant de partir en vacances, les voyageurs montent dans les bus."],
        niveau2: ["Les contrôleurs sont à la gare."],
      },
      {
        jour: 3,
        type: "negociee",
        niveau1: ["Il monte dans l'avion avec sa valise, ses vêtements et ses affaires."],
        niveau2: ["Ils trouvent leur wagon."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Avant de partir en vacances, il est important de bien préparer son voyage.",
          "Une valise solide est indispensable pour ranger les vêtements et les affaires essentielles au séjour.",
          "À l'aéroport, certains voyageurs embarquent dans un avion.",
          "D'autres montent dans des bus ou des taxis pour rejoindre le centre-ville.",
        ],
        mots: 45,
      },
      niveau2: {
        phrases: ["À la gare, les contrôleurs aident les voyageurs à trouver leur wagon."],
        mots: 62,
      },
      bonus: { phrases: ["Les affichages indiquent les prochains départs."], mots: 68 },
    },
    guidePage: 203,
    cahierPage: 48,
  },
  {
    semaine: 22,
    periode: 4,
    notion: { numero: 22, titre: "L'adjectif" },
    corpusTheme: "Le voyage dans la savane",
    objectifSequence:
      "Amener les élèves à écrire correctement les adjectifs en respectant leur accord en genre et en nombre avec le nom qu'ils complètent, au sein du groupe nominal.",
    objectifsTransversaux: [
      "Repérer correctement le sujet et le verbe dans des phrases longues afin d'assurer l'accord sujet-verbe",
      "Écrire correctement des mots du corpus lexical de la savane",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "La terminaison des adjectifs et des participes passés",
        explication:
          "Pour connaître la terminaison d'un adjectif ou d'un participe passé au masculin singulier, il suffit souvent de le mettre au féminin. Exemple : recouvert → recouverte → donc le masculin se termine par t. Il y a des exceptions : turc → turque ; grec → grecque ; etc.",
      },
      {
        titre: "L'accord en nombre des mots en « -al »",
        explication:
          "Les noms qui se terminent par « -al » au singulier se terminent, en général, par « -aux » au pluriel : un animal → des animaux ; un cheval → des chevaux. Mais il y a des exceptions : un bal → des bals ; un festival → des festivals.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un millier" },
        { mot: "l'herbe" },
        { mot: "un acacia" },
        { mot: "africaine" },
        { mot: "immense" },
        { mot: "recouvert" },
        { mot: "faire", temps: "au présent" },
        { mot: "s'abriter", temps: "au présent" },
        { mot: "guetter", temps: "au présent" },
      ],
      niveau2: [
        { mot: "un fleuve" },
        { mot: "un hippopotame" },
        { mot: "boueux/boueuse" },
        { mot: "se reposer", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: ["C'est une plaine immense.", "Les lions guettent les antilopes."],
        niveau2: ["Un hippopotame se repose.", "Il est au bord du fleuve Sénégal."],
      },
      {
        jour: 2,
        type: "caviardee",
        niveau1: ["Les éléphants s'abritent sous les acacias."],
        niveau2: ["Près du fleuve, les lions guettent les jeunes hippopotames."],
      },
      {
        jour: 3,
        type: "negociee",
        niveau1: ["La savane fait des milliers de kilomètres."],
        niveau2: ["Les antilopes se reposent près d'une mare boueuse."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "La savane africaine est une immense plaine : elle fait des milliers de kilomètres !",
          "Elle est recouverte d'herbe, de buissons et d'arbres dispersés.",
          "Dans la savane, il y a beaucoup d'animaux sauvages.",
          "Les lions guettent les antilopes et les éléphants s'abritent du soleil sous les acacias.",
        ],
        mots: 49,
      },
      niveau2: {
        phrases: [
          "Au bord du fleuve Sénégal, un jeune hippopotame se repose dans une mare boueuse.",
        ],
        mots: 63,
      },
      bonus: {
        phrases: ["Dans le ciel, des oiseaux survolent la plaine immense."],
        mots: 72,
      },
    },
    guidePage: 167,
    cahierPage: 50,
  },
  {
    semaine: 23,
    periode: 4,
    notion: { numero: 32, titre: "Les marques de l'imparfait" },
    corpusTheme: "Le portrait d'une classe",
    objectifSequence:
      "Écrire correctement les verbes conjugués dans une dictée, en prêtant attention à l'accord sujet/verbe. L'étude de l'imparfait sera différée aux dictées suivantes, afin de laisser le temps de consolider les acquis.",
    objectifsTransversaux: [
      "Écrire correctement un portrait en respectant les accords des adjectifs",
      "Écrire correctement des mots du corpus lexical du portrait",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "L'accord en genre des adjectifs en « -eux »",
        explication:
          "Les adjectifs qui se terminent par « -euse » au féminin finissent presque toujours par « -eux » au masculin, même lorsqu'ils sont au singulier. C'est le cas pour : sérieuse/sérieux ; joyeuse/joyeux ; malheureuse/malheureux ; etc.",
      },
      {
        titre: "Le graphème « en »",
        explication:
          "Le son [ɑ̃] en fin de mot s'écrit très souvent en, notamment dans les adverbes comme énormément, souvent.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "la grimace" },
        { mot: "un œil / les yeux" },
        { mot: "sérieux/sérieuse" },
        { mot: "toujours" },
        { mot: "souvent" },
        { mot: "en réalité" },
        { mot: "porter", temps: "au présent" },
        { mot: "se trouver", temps: "au présent" },
        { mot: "ressembler", temps: "au présent" },
      ],
      niveau2: [{ mot: "des lunettes" }, { mot: "le maître" }, { mot: "poser", temps: "au présent" }],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: ["Il porte des habits.", "Elle a des grands yeux verts."],
        niveau2: ["Le maître a des lunettes.", "Il a un grand bureau bleu."],
      },
      {
        jour: 2,
        type: "caviardee",
        niveau1: ["Il a un large sourire qui amuse la galerie."],
        niveau2: ["Le maître pose ses lunettes vertes."],
      },
      {
        jour: 3,
        type: "negociee",
        niveau1: ["Enzo est le plus rapide et le plus sérieux des élèves."],
        niveau2: ["Zoé porte des habits larges."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "En sport, Zoé est toujours la plus rapide !",
          "Elle est très grande et elle porte des habits verts.",
          "Enzo amuse souvent la galerie avec ses grimaces, mais en réalité, c'est un élève très sérieux.",
          "Et puis, il y a Aïda avec ses grands yeux qui ressemblent à des noisettes et son large sourire.",
        ],
        mots: 54,
      },
      niveau2: { phrases: ["Le maître pose ses lunettes bleues sur son bureau."], mots: 63 },
      bonus: {
        phrases: ["Farid est le plus petit de la classe, mais aussi le plus bavard !"],
        mots: 76,
      },
    },
    guidePage: 239,
    cahierPage: 52,
  },
  {
    semaine: 24,
    periode: 4,
    notion: { numero: 11, titre: "Les valeurs de la lettre C" },
    corpusTheme: "La bibliothèque",
    objectifSequence:
      "Écrire correctement les mots contenant la lettre c, en distinguant ses différentes valeurs sonores ([k], [s], [ʃ]) selon leur position dans le mot et les lettres qui l'entourent.",
    objectifsTransversaux: [
      "Écrire correctement des mots de la famille de bibliothèque et des mots appartenant au lexique des livres (roman, BD, magazine...) et de la lecture",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Le mot temps",
        explication:
          "Le mot temps s'écrit toujours de la même façon. Ce mot présente des particularités orthographiques liées à son étymologie (du latin tempus) et à son évolution dans la langue française qu'il faut mémoriser. Il permet d'orthographier correctement d'autres mots et expressions qui contiennent temps comme longtemps, de temps en temps.",
      },
      {
        titre: "Le graphème « oin »",
        explication:
          "Le son [wɛ̃] s'écrit très souvent oin (dans environ 85 % des cas), comme dans coin. Il peut aussi s'écrire ouin, mais plus rarement (environ 15 % des cas), comme dans marsouin.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "la bibliothèque / le bibliothécaire" },
        { mot: "une bande dessinée" },
        { mot: "un magazine" },
        { mot: "un enseignant" },
        { mot: "municipal" },
        { mot: "concentré" },
        { mot: "tranquille" },
        { mot: "pendant ce temps" },
        { mot: "classer", temps: "au présent" },
        { mot: "apprécier", temps: "au présent" },
      ],
      niveau2: [{ mot: "une exposition" }, { mot: "un document" }, { mot: "au fond" }],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: [
          "Une élève regarde une bande dessinée.",
          "Les enseignants apprécient les romans.",
        ],
        niveau2: ["Les expositions présentent des documents."],
      },
      {
        jour: 2,
        type: "caviardee",
        niveau1: ["Les rayons abritent des magazines et des romans."],
        niveau2: ["Ce livre présente des animaux anciens."],
      },
      {
        jour: 3,
        type: "negociee",
        niveau1: ["À la bibliothèque municipale, il y a un rayon de bandes dessinées."],
        niveau2: ["Ce sont des documents nouveaux au fond de la salle."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "La bibliothèque municipale est ouverte aux lecteurs chaque jour.",
          "À côté des bandes dessinées, il y a des romans plus anciens.",
          "Dans un coin tranquille, une élève concentrée regarde un magazine.",
          "Pendant ce temps, le bibliothécaire classe les nouveaux ouvrages.",
          "L'enseignante apprécie le silence dans les rayons.",
        ],
        mots: 47,
      },
      niveau2: {
        phrases: [
          "Au fond de la salle, une exposition sur les animaux présente des documents anciens.",
        ],
        mots: 61,
      },
      bonus: {
        phrases: ["Cet ouvrage possède des illustrations détaillées et des citations célèbres."],
        mots: 71,
      },
    },
    guidePage: 89,
    cahierPage: 54,
  },
  {
    semaine: 25,
    periode: 4,
    notion: { numero: 24, titre: "Les marques de genre et de nombre" },
    corpusTheme: "La poésie",
    objectifSequence:
      "Écrire correctement les noms en respectant l'accord entre le déterminant et le nom, en genre et en nombre.",
    objectifsTransversaux: [
      "Écrire correctement des mots de la famille de poésie et du lexique abstrait lié aux émotions, à l'imaginaire et à la littérature",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -on » et leurs dérivés",
        explication:
          "Les mots dérivés de noms en « -on » doublent souvent le n. Exemples : un don → donner ; une sélection → sélectionner ; un lion → une lionne ; un champion → un championnat ; un poisson → un poissonnier ; etc.",
      },
      {
        titre: "Le graphème « euil » qui devient « ueil »",
        explication:
          "En français, les mots qui se terminent par le son [œj] s'écrivent presque toujours -euil, comme dans fauteuil, écureuil ou seuil. Mais, quand ce son se trouve après c ou g, on écrit -ueil pour que la prononciation reste correcte : accueil, orgueil, recueil. En effet, si on écrivait acceuil ou orgeuil, on ne le lirait pas correctement. C'est pour éviter cette confusion que l'on inverse le e et le u après c ou g.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "le rythme" },
        { mot: "l'imagination" },
        { mot: "un recueil" },
        { mot: "un genre" },
        { mot: "classique" },
        { mot: "poétique" },
        { mot: "rêver" },
        { mot: "exprimer" },
        { mot: "favoriser", temps: "au présent" },
        { mot: "sélectionner", temps: "au présent" },
      ],
      niveau2: [{ mot: "une aventure" }, { mot: "parler" }],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: ["Les poèmes favorisent l'imagination.", "C'est un rythme poétique."],
        niveau2: ["Ce poème parle d'une aventure."],
      },
      {
        jour: 2,
        type: "caviardee",
        niveau1: ["Les rimes donnent envie d'écouter la poésie."],
        niveau2: ["La poésie peut faire rêver."],
      },
      {
        jour: 3,
        type: "negociee",
        niveau1: ["On peut retrouver différents genres de poésies dans un recueil."],
        niveau2: ["Le poète sélectionne des mots sur la nature et les émotions."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Les poésies font rêver les lecteurs.",
          "Elles favorisent l'imagination.",
          "Le poète sélectionne ses mots soigneusement pour exprimer des émotions.",
          "Les rimes apportent du rythme.",
          "Elles donnent envie d'écouter la poésie.",
          "Dans un recueil de poèmes classiques, on peut retrouver différents genres poétiques.",
        ],
        mots: 44,
      },
      niveau2: {
        phrases: ["Les poésies peuvent parler de tout : la nature, les émotions ou les aventures."],
        mots: 57,
      },
      bonus: {
        phrases: ["Certaines poésies sont joyeuses et amusantes, et d'autres sont tristes."],
        mots: 68,
      },
    },
    guidePage: 182,
    cahierPage: 56,
  },
  {
    semaine: 26,
    periode: 4,
    notion: { numero: 12, titre: "Les valeurs de la lettre G" },
    corpusTheme: "La journée à la mer",
    objectifSequence:
      "Écrire correctement les mots contenant la lettre g en respectant ses différentes valeurs sonores ([g], [ʒ], [ɲ]), en fonction de sa position dans le mot et des lettres qui l'entourent.",
    objectifsTransversaux: [
      "Conjuguer correctement des verbes à l'imparfait",
      "Écrire correctement des mots du corpus lexical de la mer et de la plage",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots qui commencent par « ess- »",
        explication:
          "En début de mot, si les lettres « es » sont suivies d'une voyelle, on écrit « ess- » (avec deux s) pour conserver le son [s] et éviter que le s ne se prononce [z] : essayer, essuyer, essouffler, essorer, un essaim, une essence, un essai, un essorage.",
      },
      {
        titre: "La marque de l'imparfait « ai »",
        explication:
          "Lorsqu'un verbe est conjugué à l'imparfait aux personnes je, tu, il/elle, ils/elles, on écrit toujours la terminaison avec « ai » : je prenais, tu te promenais, il/elle préparait, ils/elles criaient.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "le week-end" },
        { mot: "un maillot de bain" },
        { mot: "la serviette" },
        { mot: "une mouette" },
        { mot: "un sandwich" },
        { mot: "se promener", temps: "à l'imparfait" },
        { mot: "fabriquer", temps: "à l'imparfait" },
        { mot: "prendre", temps: "à l'imparfait" },
        { mot: "crier", temps: "à l'imparfait" },
        { mot: "essayer", temps: "à l'imparfait" },
      ],
      niveau2: [{ mot: "un coquillage" }, { mot: "ramasser", temps: "à l'imparfait" }],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots-complexes",
        niveau1: ["Chaque week-end, je préparais mon sac.", "Elle prenait son chapeau."],
        niveau2: ["Tu ramassais des coquillages."],
      },
      {
        jour: 2,
        type: "caviardee",
        niveau1: ["Au bord de la mer, il y avait des châteaux de sable."],
        niveau2: ["Les enfants préparaient des sandwichs au fromage."],
      },
      {
        jour: 3,
        type: "negociee",
        niveau1: ["Je prenais de la crème solaire et un maillot de bain."],
        niveau2: ["Les mouettes ramassent les coquillages."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Chaque week-end, Liam préparait son sac.",
          "Il prenait un maillot de bain, une serviette, de la crème solaire et un chapeau.",
          "Il se promenait au bord de la mer et il fabriquait des châteaux de sable.",
          "Mais ce jour-là, les mouettes criaient au-dessus de sa tête.",
          "Elles essayaient de picorer son sandwich au fromage.",
        ],
        mots: 54,
      },
      niveau2: {
        phrases: ["Autour de lui, des enfants ramassaient des coquillages."],
        mots: 62,
      },
      bonus: {
        phrases: ["Finalement, Liam laissa tomber un morceau de pain pour les mouettes."],
        mots: 73,
      },
    },
    guidePage: 96,
    cahierPage: 58,
  },
];
