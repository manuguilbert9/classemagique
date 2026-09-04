import type { DicteeSemaine } from './types';

/**
 * Période 2 — semaines 7 à 12.
 * Déroulé : J1 dictée de groupes de mots, J2 dictée différée, J3 dictée dialoguée, J4 dictée bilan.
 */
export const PERIODE_2: DicteeSemaine[] = [
  {
    semaine: 7,
    periode: 2,
    notion: { numero: 3, titre: "Les termes génériques et spécifiques" },
    corpusTheme: "Les monstres",
    objectifSequence:
      "Amener les élèves à repérer la différence entre termes génériques et termes spécifiques, en observant que certains mots désignent une catégorie générale (ex. monstre) tandis que d'autres précisent un élément particulier de cette catégorie (ex. loup-garou, vampire), ce qui permet d'éviter les répétitions.",
    objectifsTransversaux: [
      "Écrire des groupes nominaux en respectant les accords en genre et en nombre",
      "Écrire correctement des mots du corpus lexical des monstres",
      "Respecter les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -ule »",
        explication:
          "De nombreux mots se terminent par « -ule » ou « -cule », au masculin ou au féminin. Ces suffixes viennent du latin « -ula » et « -culus », qui expriment souvent une petite taille ou une unité. On les retrouve dans des noms comme formule, mais aussi capsule, particule, fascicule. Ils sont fréquents dans le vocabulaire scientifique ou technique.",
      },
      {
        titre: "Le graphème « -tion »",
        explication:
          "L'écriture du son [s] avec la lettre t est rare (environ 8 % des cas), mais elle est très fréquente dans les mots qui se terminent par « -tion ». On retrouve cette terminaison dans de nombreux mots, en particulier après certaines lettres : c (soustraction), o (potion), u (pollution), p (option), a (récréation), i (addition). Le moyen mnémotechnique est : coupai.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une chaumière" },
        { mot: "une potion" },
        { mot: "une griffe" },
        { mot: "un loup-garou" },
        { mot: "un vampire" },
        { mot: "un chaudron" },
        { mot: "un éclair" },
        { mot: "bouillonnant" },
      ],
      niveau2: [
        { mot: "un grimoire" },
        { mot: "vieux" },
        { mot: "magique" },
        { mot: "réciter", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots",
        niveau1: ["une potion bouillonnante", "une dent de loup-garou", "la sorcière goûte"],
        niveau2: ["un vieux grimoire", "nous récitons"],
      },
      {
        jour: 2,
        type: "differee",
        niveau1: ["La sorcière mélange une potion et une griffe."],
        niveau2: ["Le vampire récite des formules magiques."],
      },
      {
        jour: 3,
        type: "dialoguee",
        niveau1: ["Soudain, un éclair traverse le ciel."],
        niveau2: ["Elle soulève un vieux chaudron."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Dans sa chaumière, la sorcière mélange une potion dans un chaudron bouillonnant.",
          "Son chat noir l'observe.",
          "Elle ajoute une griffe de loup-garou et une dent de vampire.",
          "Soudain, un éclair traverse le ciel.",
        ],
        mots: 35,
      },
      niveau2: { phrases: ["Elle soulève un vieux grimoire et récite une formule magique."], mots: 45 },
      bonus: { phrases: ["Un dragon approche dans un nuage de fumée."], mots: 53 },
    },
    guidePage: 33,
    cahierPage: 20,
  },
  {
    semaine: 8,
    periode: 2,
    notion: { numero: 21, titre: "Le verbe conjugué et son infinitif" },
    corpusTheme: "La campagne",
    objectifSequence:
      "Amener les élèves à écrire correctement les verbes conjugués dans les phrases et à les différencier de leur forme à l'infinitif, en observant que c'est grâce à la conjugaison que l'action se situe dans le temps et s'accorde avec le sujet.",
    objectifsTransversaux: [
      "Respecter la majuscule en début de phrase et la ponctuation (point, virgule)",
      "Écrire correctement des mots du corpus lexical de la campagne",
      "Respecter les accords dans le groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Le graphème « y »",
        explication:
          "La lettre « y » peut représenter différents sons selon sa position dans le mot. Elle se prononce souvent comme le son [j] lorsqu'elle est en début de mot ou entre deux voyelles : par exemple, dans yack, yaourt, royal ou joyeux. On dit alors que la lettre « y » est une consonne.",
      },
      {
        titre: "Le graphème « ui »",
        explication:
          "Les lettres « ui » produisent le son [ɥi], comme dans fruit, depuis. C'est un son parfois difficile à entendre. Les mots les plus fréquents qui possèdent ce phonème sont : nuit, lui, huit. Souvent, le graphème est suivi d'un t, comme dans les mots biscuit, nuit, fruit, bruit, circuit, etc.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "le matin" },
        { mot: "les fruits" },
        { mot: "la campagne" },
        { mot: "le chêne" },
        { mot: "joyeuse" },
        { mot: "à travers" },
        { mot: "préparer", temps: "au présent" },
        { mot: "jouer", temps: "au présent" },
      ],
      niveau2: [
        { mot: "une noix" },
        { mot: "délicieux" },
        { mot: "cuisiner" },
        { mot: "aider", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots",
        niveau1: ["des journées joyeuses", "à travers la campagne", "les enfants jouent"],
        niveau2: [
          "un délicieux gâteau",
          "les noix",
          "ils aident",
          "Nous préparons une délicieuse salade aux noix.",
        ],
      },
      {
        jour: 2,
        type: "differee",
        niveau1: ["Je prépare la confiture avec des fruits du jardin."],
        niveau2: ["Nous jouons à cuisiner un gâteau."],
      },
      {
        jour: 3,
        type: "dialoguee",
        niveau1: ["Dans l'après-midi, nous pédalons à travers la campagne."],
        niveau2: ["Nous préparons une délicieuse salade aux noix."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "À la campagne, les journées sont joyeuses.",
          "Le matin, nous préparons une confiture maison avec les fruits du jardin.",
          "Puis nous pédalons à vélo à travers la campagne.",
          "Dans l'après-midi, nous jouons sous le grand chêne.",
        ],
        mots: 37,
      },
      niveau2: { phrases: ["Le soir, nous cuisinons un délicieux gâteau aux noix."], mots: 46 },
      bonus: { phrases: ["Nous marchons à travers les prés des animaux."], mots: 54 },
    },
    guidePage: 160,
    cahierPage: 22,
  },
  {
    semaine: 9,
    periode: 2,
    notion: { numero: 28, titre: "Les marques de personne du pluriel (nous, vous, ils/elles)" },
    corpusTheme: "Le concert de rock",
    objectifSequence:
      "Amener les élèves à écrire correctement les verbes conjugués en observant leur terminaison, afin de préparer l'étude plus précise des marques de personne du pluriel (nous, vous, ils/elles) pour la suite.",
    objectifsTransversaux: [
      "Accorder en genre et en nombre les noms et les déterminants",
      "Écrire correctement des mots du corpus lexical du concert de rock",
      "Respecter les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -ique »",
        explication:
          "De très nombreux mots, qu'ils soient masculins ou féminins, se terminent par « -ique ». Cette terminaison est notamment fréquente pour les adjectifs (magique, électrique, magnifique) et les noms abstraits (musique, panique).",
      },
      {
        titre: "Les mots en « -eur »",
        explication:
          "De nombreux noms masculins se terminent par « -eur », notamment lorsqu'ils désignent des objets techniques, des appareils ou des machines (projecteur, radiateur, moteur, aspirateur, ordinateur, réfrigérateur, compteur, etc.).",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un concert" },
        { mot: "le projecteur" },
        { mot: "le rythme" },
        { mot: "les musiciens" },
        { mot: "impatient" },
        { mot: "rassembler", temps: "au présent" },
        { mot: "s'allumer", temps: "au présent" },
        { mot: "ovationner", temps: "au présent" },
      ],
      niveau2: [{ mot: "un guitariste" }, { mot: "le rock" }, { mot: "un solo" }, { mot: "endiablé" }],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots",
        niveau1: [
          "la salle de concert",
          "les fans impatients",
          "il ovationne",
          "les musiciens entrent",
        ],
        niveau2: ["un solo endiablé", "tu joues de la guitare"],
      },
      {
        jour: 2,
        type: "differee",
        niveau1: ["La musique résonne sur scène."],
        niveau2: ["Elle joue un solo de rock."],
      },
      {
        jour: 3,
        type: "dialoguee",
        niveau1: ["Les projecteurs s'allument en rythme."],
        niveau2: ["Le guitariste démarre un solo endiablé."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "La salle de concert rassemble tous les fans.",
          "Ils sont impatients !",
          "Les projecteurs s'allument, et le groupe entre sur la scène.",
          "La batterie résonne, puis la musique démarre en rythme.",
          "Le public ovationne les musiciens.",
        ],
        mots: 36,
      },
      niveau2: { phrases: ["Le guitariste joue un solo de rock endiablé."], mots: 44 },
      bonus: { phrases: ["À la fin du concert, les fans demandent un rappel."], mots: 54 },
    },
    guidePage: 210,
    cahierPage: 24,
  },
  {
    semaine: 10,
    periode: 2,
    notion: { numero: 8, titre: "Les familles de mots" },
    corpusTheme: "Le cours de musique",
    objectifSequence:
      "Amener les élèves à écrire correctement des mots appartenant à la même famille, en observant qu'ils partagent un radical commun et qu'ils sont liés par le sens (ex. musique / musicien).",
    objectifsTransversaux: [
      "Conjuguer correctement des verbes au présent en respectant leur terminaison",
      "Écrire correctement des mots du corpus lexical du cours de musique",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les adjectifs en « -eux »",
        explication:
          "Les adjectifs qui se terminent par « -euse » au féminin finissent presque toujours par « -eux » au masculin, même lorsqu'ils sont au singulier. C'est le cas pour harmonieuse/harmonieux, joyeuse/joyeux, malheureuse/malheureux, etc.",
      },
      {
        titre: "Les verbes en « -éter » et « -érer » au présent",
        explication:
          "Au présent, de nombreux verbes terminant par « -éter » ou « -érer » comme interpréter et récupérer changent la voyelle du radical : la lettre é devient è aux personnes du singulier et avec ils/elles. Exemples : elle se prépare ; le groupe interprète ; je lève ; tu achètes ; elle cède ; ils espèrent.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un instrument" },
        { mot: "la direction" },
        { mot: "un morceau" },
        { mot: "fausse" },
        { mot: "harmonieux" },
        { mot: "aucun" },
        { mot: "interpréter", temps: "au présent" },
        { mot: "récupérer", temps: "au présent" },
      ],
      niveau2: [
        { mot: "une erreur" },
        { mot: "avec attention" },
        { mot: "corriger", temps: "au présent" },
        { mot: "encourager", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots",
        niveau1: ["un cours de musique", "elles récupèrent", "sous la direction", "ils interprètent"],
        niveau2: ["j'écoute avec attention", "il corrige"],
      },
      {
        jour: 2,
        type: "differee",
        niveau1: ["C'est un morceau de musique harmonieux !"],
        niveau2: ["Les musiciens n'écoutent pas."],
      },
      {
        jour: 3,
        type: "dialoguee",
        niveau1: ["Les élèves se préparent à jouer du piano."],
        niveau2: ["Le professeur encourage ses élèves."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Les élèves arrivent en classe pour le cours de musique.",
          "Lana récupère son instrument et elle se prépare à jouer.",
          "Le piano débute sans aucune fausse note.",
          "Sous la direction de madame Piron, le groupe interprète un morceau harmonieux.",
        ],
        mots: 39,
      },
      niveau2: {
        phrases: [
          "La professeure écoute avec attention.",
          "Elle corrige les erreurs et elle encourage les musiciens.",
        ],
        mots: 53,
      },
      bonus: { phrases: ["Les élèves ont hâte de monter sur scène !"], mots: 61 },
    },
    guidePage: 69,
    cahierPage: 26,
  },
  {
    semaine: 11,
    periode: 2,
    notion: { numero: 29, titre: "Les marques de personne du singulier (je, tu)" },
    corpusTheme: "Le voyage en montgolfière",
    objectifSequence:
      "Amener les élèves à écrire correctement les verbes conjugués, afin de préparer l'étude plus précise des marques de personne du singulier (je et tu) par la suite.",
    objectifsTransversaux: [
      "Écrire correctement des mots invariables (désormais, au-dessus, en altitude...)",
      "Écrire correctement des mots du corpus lexical du voyage en montgolfière",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -elle »",
        explication:
          "La plupart des mots féminins qui se terminent par [ɛl] s'écrivent « -elle », comme la nacelle, la vaisselle, une poubelle, une sauterelle, etc.",
      },
      {
        titre: "Les adverbes en « -ment »",
        explication:
          "Les adverbes en « -ment » se forment à partir d'un adjectif, généralement à partir de sa forme féminine. Si l'adjectif se termine par une voyelle autre que e, on garde la forme masculine : poli → poliment. Si l'adjectif se termine par une consonne ou un e muet, on forme l'adverbe à partir du féminin : doux → doucement / lent → lentement.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "la montgolfière" },
        { mot: "le paysage" },
        { mot: "la nacelle" },
        { mot: "l'horizon" },
        { mot: "dégagé" },
        { mot: "au-dessus" },
        { mot: "s'élever", temps: "au présent" },
        { mot: "briller", temps: "au présent" },
        { mot: "illuminer", temps: "au présent" },
      ],
      niveau2: [
        { mot: "l'altitude" },
        { mot: "désormais" },
        { mot: "décliner", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots",
        niveau1: [
          "le ciel est dégagé",
          "une lumière orangée",
          "tu défiles doucement",
          "au-dessus du paysage",
        ],
        niveau2: ["ils déclinent", "il brille désormais"],
      },
      {
        jour: 2,
        type: "differee",
        niveau1: ["Le soleil illumine le ciel et le paysage."],
        niveau2: ["Je décline en altitude."],
      },
      {
        jour: 3,
        type: "dialoguee",
        niveau1: ["La nacelle de la montgolfière s'élève lentement."],
        niveau2: ["Désormais, j'observe le paysage dégagé."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "La montgolfière s'élève lentement au-dessus du paysage.",
          "Le vent porte la nacelle dans un ciel dégagé.",
          "En bas, les forêts et les collines défilent doucement.",
          "Le soleil brille à l'horizon.",
          "Il illumine le ciel d'une lumière orangée.",
        ],
        mots: 39,
      },
      niveau2: { phrases: ["Désormais, la montgolfière décline en altitude."], mots: 45 },
      bonus: { phrases: ["Le pilote prépare l'atterrissage avec précaution."], mots: 51 },
    },
    guidePage: 217,
    cahierPage: 28,
  },
  {
    semaine: 12,
    periode: 2,
    notion: { numero: 16, titre: "Les types de phrases" },
    corpusTheme: "Le marché de Noël",
    objectifSequence:
      "Amener les élèves à écrire correctement des phrases déclaratives, en observant qu'elles servent à raconter ou à décrire et qu'elles commencent par une majuscule et se terminent par un point.",
    objectifsTransversaux: [
      "Conjuguer correctement des verbes au présent à la 3e personne du pluriel",
      "Écrire correctement des mots du corpus lexical du marché de Noël",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Le tréma",
        explication:
          "Le tréma (¨) est un signe placé sur certaines voyelles pour indiquer qu'elles doivent être prononcées séparément de la voyelle précédente. Il est très rare sur la lettre e : il est utilisé après un a ou un o pour éviter la confusion avec les lettres liées æ ou œ. On le retrouve surtout dans des noms propres (prénoms) : Noël, Gaëlle, un canoë.",
      },
      {
        titre: "Le mot parfum",
        explication:
          "Le mot parfum est constitué du graphème « um » qui est un des graphèmes les plus rares pour écrire le son [œ̃]. Afin de mémoriser cette orthographe, il peut être utile de chercher un mot de la même famille, comme parfumer, parfumerie. Dans ces mots, les lettres u et m produisent bien les sons [y] et [m].",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une guirlande" },
        { mot: "un parfum" },
        { mot: "la cannelle" },
        { mot: "un passant" },
        { mot: "hivernal" },
        { mot: "lumineux/lumineuse" },
        { mot: "s'animer", temps: "au présent" },
        { mot: "flotter", temps: "au présent" },
      ],
      niveau2: [
        { mot: "un bonhomme / des bonshommes" },
        { mot: "le pain d'épices" },
        { mot: "une châtaigne" },
        { mot: "grillé" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "groupes-de-mots",
        niveau1: [
          "ils installent",
          "le marché de Noël",
          "une guirlande hivernale",
          "les passants regardent",
          "ils chantent",
        ],
        niveau2: ["des châtaignes grillées", "tu prépares"],
      },
      {
        jour: 2,
        type: "differee",
        niveau1: ["Le marchand chante devant son stand décoré."],
        niveau2: ["Les bonshommes en pain d'épices sont à la cannelle."],
      },
      {
        jour: 3,
        type: "dialoguee",
        niveau1: ["Les enfants regardent les gâteaux à la cannelle."],
        niveau2: ["Les lutins préparent des châtaignes grillées."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Le marché de Noël s'anime sous les lumières hivernales.",
          "Les marchands installent les stands décorés de guirlandes lumineuses.",
          "Un parfum de cannelle flotte dans l'air froid.",
          "Les enfants chantent devant le sapin, et les passants regardent les jolis cadeaux.",
        ],
        mots: 41,
      },
      niveau2: {
        phrases: ["Des lutins préparent des bonshommes en pain d'épices et des châtaignes grillées."],
        mots: 54,
      },
      bonus: {
        phrases: ["Devant son stand, un marchand chaleureux emballe des cadeaux."],
        mots: 63,
      },
    },
    guidePage: 125,
    cahierPage: 30,
  },
];
