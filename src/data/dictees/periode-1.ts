import type { DicteeSemaine } from './types';

/**
 * Période 1 — semaines 1 à 6.
 * Déroulé : J1 dictée de mots, J2 dictée photo, J3 dictée du jour, J4 dictée bilan.
 */
export const PERIODE_1: DicteeSemaine[] = [
  {
    semaine: 1,
    periode: 1,
    notion: { numero: 13, titre: "La phrase simple" },
    corpusTheme: "Le jardinage à la fin de l'été",
    objectifSequence:
      "Amener les élèves à écrire une phrase simple, en respectant la majuscule initiale et le point final, et en identifiant ses deux constituants essentiels, le groupe sujet et le groupe du verbe, afin de consolider leur compréhension de la structure de la phrase.",
    objectifsTransversaux: [
      "Accorder le sujet avec le verbe",
      "Écrire correctement des mots du corpus lexical du jardinage en fin d'été",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots qui contiennent « ouss »",
        explication:
          "Dans les mots de la langue française, le son [us] s'écrit toujours « ouss », comme dans pousse ou la poussière. Ces lettres sont très souvent suivies d'un e, notamment dans les mots féminins : rousse, une secousse, une housse, la mousse, une trousse, etc.",
      },
      {
        titre: "Le graphème « ai »",
        explication:
          "Le graphème « ai » produit le son [ɛ]. Il est assez rare : on le retrouve dans environ 18 % des cas. Il est présent en début de mot (aiguille) ; en fin de mot avec un e final, comme dans monnaie, ou un s final, comme dans japonais (nom de langue ou d'habitants d'un pays). Ici, on le retrouve dans le mot graine qui est une dérivation de grain.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "le potager" },
        { mot: "la terre" },
        { mot: "le printemps" },
        { mot: "les grains, les graines" },
        { mot: "les framboises" },
        { mot: "quelques" },
        { mot: "ramasser", temps: "au présent" },
        { mot: "semer", temps: "au présent" },
        { mot: "mélanger", temps: "au présent" },
      ],
      niveau2: [{ mot: "une citrouille" }, { mot: "un jardin" }, { mot: "belle" }],
    },
    jours: [
      {
        jour: 1,
        type: "mots",
        niveau1: ["l'été", "le potager", "la terre", "le printemps", "avec", "nous semons"],
        niveau2: ["une citrouille", "un jardin", "belle", "elle", "pousse"],
      },
      {
        jour: 2,
        type: "photo",
        niveau1: ["Ils ramassent les légumes du potager."],
        niveau2: ["Une belle citrouille pousse dans le jardin."],
      },
      {
        jour: 3,
        type: "du-jour",
        niveau1: ["Les enfants ramassent les légumes et les framboises."],
        niveau2: ["Elles poussent dans la terre."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "À la fin de l'été, les framboisiers poussent dans la terre.",
          "Les enfants ramassent les légumes du potager.",
          "Ils sèment aussi quelques graines pour le printemps.",
        ],
        mots: 27,
      },
      niveau2: { phrases: ["Des belles citrouilles poussent dans le jardin."], mots: 34 },
      bonus: {
        phrases: ["Pendant l'automne, ils utilisent la bêche et le râteau pour préparer le sol."],
        mots: 48,
      },
    },
    guidePage: 104,
    cahierPage: 8,
  },
  {
    semaine: 2,
    periode: 1,
    notion: { numero: 7, titre: "La lettre E et ses accents" },
    corpusTheme: "Le cirque",
    objectifSequence:
      "Amener les élèves à écrire correctement les mots contenant la lettre e avec ses différents accents (aigu, grave, circonflexe, tréma) et à identifier sa valeur sonore selon sa position dans le mot, y compris lorsqu'il est muet en fin de mot.",
    objectifsTransversaux: [
      "Mettre une majuscule en début de phrase et un point à la fin.",
      "Écrire correctement des mots du corpus lexical du cirque",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -age »",
        explication:
          "La plupart des mots qui se terminent par « -age » sont masculins, comme le maquillage, le nuage, le visage, etc. Ce suffixe permet de construire de nombreux mots à partir de verbes, comme maquiller (→ le maquillage), laver (→ le lavage), etc. Toutefois, il existe quelques mots féminins qui se terminent par « -age ». Parmi les plus courants, on retrouve la plage, la cage, l'image, la page.",
      },
      {
        titre: "Les mots en « -eau »",
        explication:
          "De nombreux noms masculins se terminent par « -eau », comme le chapiteau, un bateau, un manteau, le drapeau. Cette terminaison est très régulière et se pluralise presque toujours avec un x (des chapiteaux, des châteaux, des bateaux).",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "le clown" },
        { mot: "le cirque" },
        { mot: "le maquillage" },
        { mot: "le public" },
        { mot: "devant" },
        { mot: "commencer", temps: "au présent" },
        { mot: "jongler", temps: "au présent" },
        { mot: "ajuster", temps: "au présent" },
      ],
      niveau2: [
        { mot: "le directeur" },
        { mot: "l'artiste" },
        { mot: "une arrivée" },
        { mot: "annoncer", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "mots",
        niveau1: ["le clown", "le cirque", "le maquillage", "devant", "je commence", "il jongle"],
        niveau2: ["un directeur", "une arrivée", "doré", "sous", "tu annonces"],
      },
      {
        jour: 2,
        type: "photo",
        niveau1: ["Le clown ajuste son maquillage et son costume coloré."],
        niveau2: ["Les artistes arrivent sous une lumière dorée."],
      },
      {
        jour: 3,
        type: "du-jour",
        niveau1: ["Les clowns jonglent avec des balles."],
        niveau2: ["Le directeur annonce les artistes."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Le clown commence son maquillage.",
          "Il ajuste son costume coloré.",
          "Il entre sous le chapiteau du cirque.",
          "Devant le public, il jongle avec des balles et il marche sur un fil.",
        ],
        mots: 31,
      },
      niveau2: {
        phrases: ["Le directeur annonce l'arrivée des artistes sous la lumière dorée."],
        mots: 42,
      },
      bonus: {
        phrases: ["Les acrobates grimpent à la corde et ils réalisent un numéro spectaculaire."],
        mots: 54,
      },
    },
    guidePage: 61,
    cahierPage: 10,
  },
  {
    semaine: 3,
    periode: 1,
    notion: { numero: 19, titre: "Le groupe nominal" },
    corpusTheme: "Le spectacle de magie",
    objectifSequence:
      "Amener les élèves à écrire correctement un groupe nominal dans une phrase, en comprenant son fonctionnement.",
    objectifsTransversaux: [
      "Conjuguer correctement les verbes au présent",
      "Écrire correctement des mots du corpus lexical du spectacle de magie",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Le graphème « ien »",
        explication:
          "Dans environ 11 % des cas, le son [jɛ̃] s'écrit avec les lettres en précédées de la lettre i comme dans magicien. On le retrouve dans les noms de métiers ou de nationalités. Très souvent, ce graphème est situé à la fin des mots. Au féminin, « -ien » devient « -ienne » : un magicien / une magicienne.",
      },
      {
        titre: "Le graphème « sc »",
        explication:
          "Ce graphème permet de faire le son [s]. Il est très rare : on le retrouve dans environ 1 % des cas. Le son [s] peut s'écrire « sc » devant les voyelles i et e (scie, scène, discipline).",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "le magicien" },
        { mot: "la scène" },
        { mot: "une baguette" },
        { mot: "le rideau" },
        { mot: "incroyable" },
        { mot: "lentement" },
        { mot: "tomber", temps: "au présent" },
        { mot: "mélanger", temps: "au présent" },
      ],
      niveau2: [
        { mot: "un chapeau" },
        { mot: "des confettis" },
        { mot: "libérer", temps: "au présent" },
        { mot: "soulever", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "mots",
        niveau1: ["le magicien", "la scène", "une baguette", "incroyable", "lentement", "elle tombe"],
        niveau2: ["libérer", "un chapeau", "des confettis"],
      },
      {
        jour: 2,
        type: "photo",
        niveau1: ["Le magicien réalise son incroyable numéro."],
        niveau2: ["Il soulève son chapeau."],
      },
      {
        jour: 3,
        type: "du-jour",
        niveau1: ["Il mélange lentement les cartes."],
        niveau2: ["Les confettis tombent sur scène."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Le magicien arrive sur scène.",
          "Il ramasse sa belle baguette.",
          "Devant lui, il mélange lentement les cartes.",
          "Puis il réalise un numéro incroyable et le rideau rouge tombe.",
        ],
        mots: 30,
      },
      niveau2: { phrases: ["Il soulève son chapeau pour libérer des confettis."], mots: 38 },
      bonus: { phrases: ["Le magicien se jette dans une explosion de lumière."], mots: 47 },
    },
    guidePage: 146,
    cahierPage: 12,
  },
  {
    semaine: 4,
    periode: 1,
    notion: { numero: 26, titre: "Le passé, le présent et le futur" },
    corpusTheme: "L'espace, l'univers",
    objectifSequence:
      "Conjuguer correctement les verbes au présent de l'indicatif et prendre conscience que le verbe indique le temps de la phrase (passé, présent ou futur).",
    objectifsTransversaux: [
      "Repérer la « première patte » (le sujet) et la « deuxième patte » (le verbe) dans la phrase afin de faciliter l'accord sujet/verbe.",
      "Écrire correctement des mots du corpus lexical de l'espace",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Le graphème « e »",
        explication:
          "Dans une majorité des cas (51 %), on écrit le son [ɛ] avec la lettre e sans accent. C'est le cas lorsqu'il est placé à l'intérieur d'une syllabe : ciel ou ob-ser-ve. Si, au contraire, la lettre e est la dernière de la syllabe, alors on ajoute un accent comme dans pla-nè-te.",
      },
      {
        titre: "Les familles de mots",
        explication:
          "Les familles de mots permettent d'orthographier le radical toujours de la même manière et d'ajouter des préfixes ou suffixes qui apportent du sens. Le nom étoile permet de créer l'adjectif étoilé. L'adjectif lointain est de la famille de loin, et mystérieuse est de la famille du nom mystère.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un astronaute" },
        { mot: "un télescope" },
        { mot: "une galaxie" },
        { mot: "brillant" },
        { mot: "lointain" },
        { mot: "mystérieuse" },
        { mot: "soudain" },
        { mot: "remarquer", temps: "au présent" },
      ],
      niveau2: [
        { mot: "l'immensité" },
        { mot: "l'espace" },
        { mot: "contempler", temps: "au présent" },
        { mot: "marcher", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "mots",
        niveau1: [
          "un astronaute",
          "un télescope",
          "une galaxie",
          "brillant",
          "lointain",
          "soudain",
          "il remarque",
        ],
        niveau2: ["l'immensité", "l'espace", "vous contemplez"],
      },
      {
        jour: 2,
        type: "photo",
        niveau1: ["Un astronaute observe une galaxie lointaine."],
        niveau2: ["Il contemple l'espace depuis la Lune."],
      },
      {
        jour: 3,
        type: "du-jour",
        niveau1: ["Soudain, l'astronaute remarque une mystérieuse météorite."],
        niveau2: ["Ils marchèrent sur la Lune et ils observèrent l'immensité."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "La fusée traverse le ciel étoilé.",
          "L'astronaute observe une planète lointaine avec son télescope.",
          "Il remarque une galaxie mystérieuse.",
          "Soudain, une météorite surgit et il la suit du regard.",
        ],
        mots: 28,
      },
      niveau2: {
        phrases: ["L'astronaute marche sur la Lune et contemple l'immensité de l'espace."],
        mots: 41,
      },
      bonus: {
        phrases: ["Un extraterrestre courageux arrive sur la planète bleue et s'approche lentement."],
        mots: 53,
      },
    },
    guidePage: 196,
    cahierPage: 14,
  },
  {
    semaine: 5,
    periode: 1,
    notion: { numero: 14, titre: "Le sujet dans la phrase" },
    corpusTheme: "Les animaux sauvages",
    objectifSequence:
      "Amener les élèves à repérer le sujet dans la phrase, à comprendre qu'il constitue la « première patte » de la phrase et qu'il détermine l'accord du verbe en personne, en nombre et en genre.",
    objectifsTransversaux: [
      "Accorder correctement les mots dans le groupe nominal, notamment dans des phrases descriptives avec des adjectifs qualificatifs.",
      "Écrire correctement des mots du corpus lexical des animaux sauvages",
      "Respecter les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les adjectifs en « -ou »",
        explication:
          "Les adjectifs en « -ou » prennent la lettre s au pluriel, sauf ceux qui se terminent par la lettre x comme doux, roux, jaloux. Ces derniers se transforment au féminin : douce, rousse, jalouse.",
      },
      {
        titre: "Les mots en « -ard »",
        explication:
          "Le suffixe « -ard » permet de former des noms communs, souvent masculins, à partir d'un verbe ou d'un nom existant. Il désigne souvent un animal, comme dans renard, canard, lézard. Il peut aussi désigner une personne caractérisée par un comportement ou une attitude : bavard, fêtard, chauffard. Dans certains cas, il marque simplement une appartenance ou un lien : montagnard (celui qui vit en montagne), campagnard, savoyard, etc.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un mammifère" },
        { mot: "un museau" },
        { mot: "le pelage" },
        { mot: "roux" },
        { mot: "doux" },
        { mot: "se nourrir", temps: "au présent" },
        { mot: "chasser", temps: "au présent" },
        { mot: "être", temps: "au présent" },
      ],
      niveau2: [
        { mot: "une queue" },
        { mot: "l'équilibre" },
        { mot: "longue" },
        { mot: "grâce" },
        { mot: "sauter", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "mots",
        niveau1: ["le renard", "un mammifère", "la forêt", "un museau", "rusé", "roux", "j'habite"],
        niveau2: ["une queue", "l'équilibre", "une proie", "longue", "il saute"],
      },
      {
        jour: 2,
        type: "photo",
        niveau1: ["Le pelage du renard est roux."],
        niveau2: ["Il garde son équilibre quand il chasse."],
      },
      {
        jour: 3,
        type: "du-jour",
        niveau1: ["Les renards chassent la nuit."],
        niveau2: ["Il saute sur sa proie."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Le renard est un mammifère rusé.",
          "Il habite dans la forêt.",
          "Son pelage roux est doux, et son museau est pointu.",
          "Il chasse la nuit pour se nourrir.",
        ],
        mots: 28,
      },
      niveau2: {
        phrases: ["Il garde son équilibre grâce à sa longue queue et il saute sur sa proie."],
        mots: 43,
      },
      bonus: { phrases: ["En hiver, il se cache dans son terrier."], mots: 51 },
    },
    guidePage: 111,
    cahierPage: 16,
  },
  {
    semaine: 6,
    periode: 1,
    notion: { numero: 20, titre: "Le nom et le déterminant" },
    corpusTheme: "La soirée pyjama",
    objectifSequence:
      "Amener les élèves à identifier le nom comme noyau du groupe nominal et à repérer son déterminant, en comprenant qu'ils s'accordent en genre et en nombre.",
    objectifsTransversaux: [
      "Conjuguer correctement les verbes au présent",
      "Écrire correctement des mots du corpus lexical de la soirée pyjama",
      "Respecter les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots féminins en « -é »",
        explication:
          "La plupart des noms féminins en « -é » prennent un e final au féminin : la soirée, la cheminée, la rentrée. Exception : la clé.",
      },
      {
        titre: "Les mots d'origine anglaise",
        explication:
          "Le mot pop-corn est un mot composé d'origine anglaise, avec un trait d'union et une orthographe conservée : pop « éclater » et corn « maïs ». Ce type de mot est souvent invariable et transcrit à l'identique, comme week-end, chewing-gum, hot dog.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une soirée" },
        { mot: "un pyjama" },
        { mot: "le repas" },
        { mot: "un sachet" },
        { mot: "le pop-corn" },
        { mot: "chez" },
        { mot: "poser", temps: "au présent" },
        { mot: "s'installer", temps: "au présent" },
      ],
      niveau2: [
        { mot: "une veilleuse" },
        { mot: "le plafond" },
        { mot: "étoilé" },
        { mot: "diffuser", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "mots",
        niveau1: [
          "un pyjama",
          "le repas",
          "un sachet",
          "le pop-corn",
          "chez",
          "tu arrives",
          "ils s'installent",
        ],
        niveau2: ["l'obscurité", "une veilleuse", "le plafond", "étoilé"],
      },
      {
        jour: 2,
        type: "photo",
        niveau1: ["Les enfants posent les sacs chez Léa."],
        niveau2: ["La veilleuse diffuse sa lumière."],
      },
      {
        jour: 3,
        type: "du-jour",
        niveau1: ["Ils enfilent les pyjamas et ils s'installent sous une couverture."],
        niveau2: ["Elle contemple le ciel étoilé au plafond."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Les enfants arrivent chez Léa pour une soirée pyjama.",
          "Ils posent les sacs dans le salon et ils enfilent les pyjamas.",
          "Après un bon repas, ils s'installent sous une couverture avec un sachet de pop-corn.",
        ],
        mots: 36,
      },
      niveau2: {
        phrases: ["Dans l'obscurité, une veilleuse diffuse un ciel étoilé sur le plafond."],
        mots: 48,
      },
      bonus: {
        phrases: ["Plus tard, ils chuchotent sous les draps avant de s'endormir."],
        mots: 59,
      },
    },
    guidePage: 153,
    cahierPage: 18,
  },
];
