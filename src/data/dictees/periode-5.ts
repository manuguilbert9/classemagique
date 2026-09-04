import type { DicteeSemaine } from './types';

/**
 * Période 5 — semaines 27 à 34.
 * Déroulé : J1 dictée de phrases, J2 dictée sans erreur, J3 dictée frigo, J4 dictée bilan.
 */
export const PERIODE_5: DicteeSemaine[] = [
  {
    semaine: 27,
    periode: 5,
    notion: { numero: 25, titre: "Les chaînes d'accords dans le groupe nominal" },
    corpusTheme: "La carte au trésor",
    objectifSequence:
      "Écrire correctement les accords en genre et en nombre au sein du groupe nominal (déterminant, nom, adjectif).",
    objectifsTransversaux: [
      "Conjuguer correctement des verbes au présent à la 3e personne du singulier",
      "Écrire correctement des mots du corpus lexical de la carte au trésor",
      "Respecter les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -ice »",
        explication:
          "Beaucoup de mots se terminent par « -ice » : des noms féminins (justice, épice, malice), mais aussi masculins (indice, artifice, service). Cette terminaison est fréquente et stable. On la retrouve également dans des noms de métiers ou de fonctions en -trice (la directrice, une actrice) souvent dérivés de noms masculins en -teur.",
      },
      {
        titre: "Les mots en « -isse »",
        explication:
          "Les mots en « -isse » sont très peu nombreux. Ils ont cependant une régularité dans le sens où ils sont quasiment tous issus de formes verbales (glisse, hisse, tisse). Parmi les noms communs qui se terminent en -isse, on retrouve une écrevisse ou encore une esquisse.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "l'emplacement" },
        { mot: "la détermination" },
        { mot: "un géant" },
        { mot: "un indice" },
        { mot: "long" },
        { mot: "gelé" },
        { mot: "indiquer", temps: "au présent" },
        { mot: "accoster", temps: "au présent" },
        { mot: "souffler", temps: "au présent" },
        { mot: "grimper", temps: "au présent" },
      ],
      niveau2: [
        { mot: "un passage" },
        { mot: "un gouffre" },
        { mot: "secret" },
        { mot: "se laisser", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: ["Anya grimpe avec détermination.", "Les indices sont cachés sur les branches."],
        niveau2: ["Il y a un passage secret.", "Elle glisse."],
      },
      {
        jour: 2,
        type: "sans-erreur",
        niveau1: ["Le bateau accoste sur une plage de galets."],
        niveau2: ["Anya se laisse glisser avec une corde."],
      },
      {
        jour: 3,
        type: "frigo",
        niveau1: ["Elle grimpe sur des montagnes gelées en suivant les indices."],
        niveau2: ["Elle trouve une corde près d'un tronc d'arbre."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "La carte indique l'emplacement d'un trésor caché sur une île.",
          "Après un long voyage en bateau, Anya accoste sur une plage de galets.",
          "Le vent souffle fort, mais elle avance avec détermination.",
          "Elle grimpe sur une montagne gelée, puis elle traverse la forêt des géants en suivant les indices cachés sous les troncs d'arbres.",
        ],
        mots: 57,
      },
      niveau2: {
        phrases: ["Elle trouve un passage secret et elle se laisse glisser avec une corde."],
        mots: 70,
      },
      bonus: {
        phrases: ["Enfin, elle arrive à un village englouti qui cache le trésor sous l'eau."],
        mots: 84,
      },
    },
    guidePage: 189,
    cahierPage: 60,
  },
  {
    semaine: 28,
    periode: 5,
    notion: { numero: 4, titre: "La dérivation des mots (préfixes et suffixes)" },
    corpusTheme: "Le numérique",
    objectifSequence:
      "Écrire correctement des mots dérivés en respectant l'orthographe du radical, des préfixes et des suffixes.",
    objectifsTransversaux: [
      "Conjuguer correctement des verbes au présent",
      "Écrire correctement des mots appartenant au corpus lexical du numérique",
      "Respecter les accords au sein du groupe nominal",
      "Écrire correctement les mots qui présentent des régularités et des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -té »",
        explication:
          "Les noms féminins en -té et -tié ne prennent pas de e final même s'ils sont féminins (la sécurité, la beauté, la pitié). Il y a des exceptions : certains noms comme la dictée, la montée, et les noms qui désignent un contenu comme la cuillérée, la pelletée.",
      },
      {
        titre: "La graphie du son [e]",
        explication:
          "Le son [e] s'écrit é quand il se trouve à la fin d'une syllabe : dé-li-cieux, prépare. Devant une double consonne ou un x, le son [e] s'écrit sans accent sur le e même s'il se prononce [e] : exercice, expliquer, effacer, etc.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une tablette" },
        { mot: "un exercice" },
        { mot: "une soustraction" },
        { mot: "un exposé" },
        { mot: "le vidéoprojecteur" },
        { mot: "un documentaire" },
        { mot: "directement" },
        { mot: "travailler" },
        { mot: "utiliser", temps: "au présent" },
        { mot: "corriger", temps: "au présent" },
      ],
      niveau2: [
        { mot: "une voix" },
        { mot: "un micro" },
        { mot: "enregistrer", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: ["Nous utilisons une tablette.", "Il y a des exercices sur l'écran."],
        niveau2: ["Nous enregistrons un film.", "J'utilise ma voix."],
      },
      {
        jour: 2,
        type: "sans-erreur",
        niveau1: ["La classe utilise le vidéoprojecteur pour corriger des exercices."],
        niveau2: ["Les garçons préparent leur film avec la tablette."],
      },
      {
        jour: 3,
        type: "frigo",
        niveau1: ["Maya prépare un exposé au coin bibliothèque."],
        niveau2: ["Elles utilisent des micros en toute sécurité."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Dans la classe, nous utilisons des tablettes en toute sécurité.",
          "Sur l'écran, des exercices défilent pour travailler la lecture.",
          "Maya corrige ses soustractions directement sur la tablette.",
          "Les garçons préparent un exposé au coin bibliothèque.",
          "Un groupe utilise le vidéoprojecteur pour nous montrer un documentaire sur les animaux.",
        ],
        mots: 49,
      },
      niveau2: {
        phrases: ["Ils préparent leur film et Sofiane enregistre sa voix avec un micro."],
        mots: 61,
      },
      bonus: {
        phrases: [
          "C'est important d'avoir une utilisation responsable du numérique, à l'école comme ailleurs.",
        ],
        mots: 76,
      },
    },
    guidePage: 40,
    cahierPage: 62,
  },
  {
    semaine: 29,
    periode: 5,
    notion: { numero: 33, titre: "Les marques du futur" },
    corpusTheme: "L'exploration de la forêt",
    objectifSequence:
      "Écrire correctement des verbes conjugués en respectant leur accord avec le sujet. L'étude du futur sera différée aux dictées suivantes, afin de laisser le temps de consolider les acquis.",
    objectifsTransversaux: [
      "Écrire correctement des mots invariables fréquemment rencontrés",
      "Écrire correctement des mots appartenant au corpus lexical de la forêt",
      "Respecter les accords au sein du groupe nominal",
      "Écrire correctement les mots qui présentent des régularités orthographiques",
    ],
    regularites: [
      {
        titre: "Les adverbes en « -mment »",
        explication:
          "Lorsqu'un adjectif se termine par -ant ou -ent, les adverbes se forment en remplaçant cette terminaison par « -amment » ou « -emment » (évident → évidemment ; constant → constamment ; patient → patiemment). Ces deux formes se prononcent [amɑ̃].",
      },
      {
        titre: "Le graphème « œ »",
        explication:
          "Les lettres œ sont, comme bien souvent, issues du latin. On les retrouve principalement avant les lettres u et i, comme dans les mots cœur, œuf, œil, bœuf, œuvre ou sœur.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une excursion" },
        { mot: "un craquement" },
        { mot: "le hululement" },
        { mot: "un pique-nique" },
        { mot: "sinueux" },
        { mot: "prudent" },
        { mot: "évidemment" },
        { mot: "prendre", temps: "au présent" },
        { mot: "aller", temps: "au présent" },
        { mot: "emprunter", temps: "au présent" },
      ],
      niveau2: [
        { mot: "un promontoire" },
        { mot: "une vallée" },
        { mot: "admirer", temps: "au présent" },
        { mot: "surplomber", temps: "au présent" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: ["Ils prennent leur pique-nique.", "C'est le hululement d'une chouette."],
        niveau2: ["Nous admirons la vue.", "Il surplombe la vallée."],
      },
      {
        jour: 2,
        type: "sans-erreur",
        niveau1: ["Demain, nous emprunterons un sentier sinueux."],
        niveau2: ["J'admire la vallée voisine."],
      },
      {
        jour: 3,
        type: "frigo",
        niveau1: ["Ils s'arrêtent pour écouter les bruits étranges et les craquements."],
        niveau2: ["Vous surplombez le sous-bois."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Mathéo et Samira vont faire une excursion dans la forêt voisine.",
          "Tout d'abord, ils empruntent un sentier sinueux au cœur du sous-bois.",
          "Évidemment, ils sont prudents et ils se méfient des bruits étranges : le craquement des feuilles ou le hululement d'une chouette.",
          "Puis, ils s'arrêtent à midi pour prendre leur pique-nique.",
        ],
        mots: 54,
      },
      niveau2: {
        phrases: ["Ils admirent la vue depuis le promontoire qui surplombe la vallée."],
        mots: 65,
      },
      bonus: {
        phrases: ["Ils ont pour objectif de croiser au moins un animal sauvage."],
        mots: 76,
      },
    },
    guidePage: 246,
    cahierPage: 64,
  },
  {
    semaine: 30,
    periode: 5,
    notion: { numero: 2, titre: "Le sens propre et le sens figuré" },
    corpusTheme: "Le match de tennis de table",
    objectifSequence:
      "Écrire correctement les mots et expressions au sens propre et au sens figuré, en respectant leur orthographe et leur emploi en contexte.",
    objectifsTransversaux: [
      "Accorder le sujet et le verbe dans des phrases longues et complexes",
      "Écrire correctement des mots appartenant au corpus lexical du tennis de table",
      "Respecter les accords au sein du groupe nominal",
      "Écrire correctement les mots qui présentent des régularités ou des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -aire »",
        explication:
          "Beaucoup de noms et d'adjectifs se terminent par « -aire ». Les noms se terminant par « -aire » désignent souvent une fonction ou un métier (une secrétaire, un libraire). Les adjectifs indiquent une relation à quelque chose : rectangulaire → lié au rectangle ; scolaire → lié à l'école ; solaire → lié au soleil. Cette terminaison est fréquente et régulière, aussi bien au masculin qu'au féminin.",
      },
      {
        titre: "Les mots qui commencent par « comm- »",
        explication:
          "La plupart des mots commençant par com s'écrivent « comm- » (comme, commerce, commencer), sauf les mots suivants (ainsi que leurs dérivés) : comédie, comète, comique, comestible.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "le tennis de table" },
        { mot: "la raquette" },
        { mot: "un service" },
        { mot: "la surface" },
        { mot: "un mouvement" },
        { mot: "un adversaire" },
        { mot: "rectangulaire" },
        { mot: "dynamique" },
        { mot: "s'enchaîner", temps: "au présent" },
        { mot: "anticiper", temps: "au présent" },
      ],
      niveau2: [{ mot: "l'arbitre" }, { mot: "un œil de lynx" }, { mot: "scrupuleusement" }],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: [
          "Le joueur fait du tennis de table.",
          "Les échanges dynamiques s'enchaînent.",
        ],
        niveau2: ["L'arbitre observe scrupuleusement la balle.", "Il a un œil de lynx."],
      },
      {
        jour: 2,
        type: "sans-erreur",
        niveau1: ["La balle en plastique touche la table rectangulaire pour rebondir."],
        niveau2: ["Elle anticipe chaque mouvement."],
      },
      {
        jour: 3,
        type: "frigo",
        niveau1: ["Vous êtes un adversaire précis avec un service dynamique."],
        niveau2: ["Un bon joueur enchaîne scrupuleusement les mouvements."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Le tennis de table est un sport qui se joue sur une table rectangulaire.",
          "Chaque joueur utilise une raquette légère pour frapper la balle en plastique.",
          "Le point commence par un service précis.",
          "La balle touche la surface de jeu pour rebondir, et les échanges dynamiques s'enchaînent.",
          "Un bon joueur anticipe les mouvements de son adversaire.",
        ],
        mots: 57,
      },
      niveau2: {
        phrases: ["L'arbitre a un œil de lynx.", "Il observe chaque mouvement scrupuleusement."],
        mots: 69,
      },
      bonus: {
        phrases: ["Les joueurs doivent remporter onze points pour gagner la partie."],
        mots: 79,
      },
    },
    guidePage: 26,
    cahierPage: 66,
  },
  {
    semaine: 31,
    periode: 5,
    notion: { numero: 23, titre: "Le pronom personnel sujet" },
    corpusTheme: "Le voyage en train",
    objectifSequence:
      "Écrire correctement les verbes conjugués en lien avec leur pronom personnel sujet et comprendre que le pronom personnel sujet remplace un groupe nominal pour éviter la répétition.",
    objectifsTransversaux: [
      "Conjuguer correctement des verbes au présent et au futur",
      "Écrire correctement des mots appartenant au corpus lexical du voyage en train",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités ou des irrégularités",
    ],
    regularites: [
      {
        titre: "La marque du futur « er »",
        explication:
          "La marque du futur des verbes du 1er groupe est l'ajout des lettres « er » avant la marque de personne : ils arriveront, nous regarderons, nous aimerons, vous travaillerez.",
      },
      {
        titre: "Le graphème « -et »",
        explication:
          "Le son [ɛ] s'écrit « -et » dans environ 9 % des cas. On le trouve principalement à la fin de noms communs masculins comme billet, trajet, jouet, volet, etc. On retrouve aussi cette terminaison dans des adjectifs masculins tels que muet, discret. Au féminin, ces adjectifs ont, généralement, la terminaison « -ette » (muette, coquette) mais aussi, dans certains cas, « -ète » (discrète, secrète, inquiète).",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un billet" },
        { mot: "un contrôleur" },
        { mot: "le trajet" },
        { mot: "un agent" },
        { mot: "une heure" },
        { mot: "l'arrivée" },
        { mot: "une consigne" },
        { mot: "à destination" },
        { mot: "plusieurs" },
        { mot: "préciser", temps: "au présent" },
      ],
      niveau2: [{ mot: "une correspondance" }, { mot: "prendre", temps: "au futur" }],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: [
          "Ils arriveront à Paris demain.",
          "Le contrôleur vérifie mon billet de train.",
        ],
        niveau2: ["Elle prendra une correspondance.", "C'est l'arrivée à Paris."],
      },
      {
        jour: 2,
        type: "sans-erreur",
        niveau1: ["Ils montent à bord pour plusieurs heures de trajet."],
        niveau2: ["Nous vérifions notre correspondance."],
      },
      {
        jour: 3,
        type: "frigo",
        niveau1: ["À la gare, l'agent vérifie les billets et il donne les consignes de sécurité."],
        niveau2: ["Le contrôleur précise l'heure des correspondances."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Le train en direction de Lille entre en gare et les passagers montent à bord.",
          "Léandre et sa famille trouvent des places près de la fenêtre.",
          "Le contrôleur vérifie les billets, puis le train démarre.",
          "Un agent précise l'heure d'arrivée et il donne les consignes de sécurité.",
          "Ils arriveront à destination après plusieurs heures de trajet.",
        ],
        mots: 58,
      },
      niveau2: {
        phrases: ["À leur arrivée à Lille, Léandre prendra une correspondance."],
        mots: 67,
      },
      bonus: { phrases: ["Enfin, il arrivera à bon port à la gare de Bruxelles."], mots: 79 },
    },
    guidePage: 174,
    cahierPage: 68,
  },
  {
    semaine: 32,
    periode: 5,
    notion: { numero: 5, titre: "Les synonymes et les contraires" },
    corpusTheme: "La fête de fin d'année",
    objectifSequence:
      "Écrire correctement des mots variés en utilisant des synonymes pour éviter les répétitions et des contraires pour enrichir le sens.",
    objectifsTransversaux: [
      "Conjuguer correctement des verbes à l'imparfait",
      "Écrire correctement des mots appartenant au corpus lexical de la fête",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités ou des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots en « -on » et leurs dérivés",
        explication:
          "Les noms en « -on » sont, généralement, masculins (garçon, poisson). Il y a cependant des exceptions comme maison, leçon. Les mots dérivés de noms en « -on » doublent souvent le n : champion → championnat.",
      },
      {
        titre: "Les marques de personne avec il ou elle",
        explication:
          "Avec il et elle, la marque de personne est -e au présent pour les verbes en -er (il mange), -d pour certains verbes du 3e groupe (il prend), -t à l'imparfait ou dans certains verbes irréguliers (il était, il dit), -a au futur (elle jouera). On peut retenir ces 4 marques avec le mot date.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "une nappe" },
        { mot: "une banderole" },
        { mot: "l'extérieur" },
        { mot: "prêt" },
        { mot: "méticuleusement" },
        { mot: "souhaiter" },
        { mot: "installer", temps: "à l'imparfait" },
        { mot: "résonner", temps: "à l'imparfait" },
        { mot: "arriver", temps: "à l'imparfait" },
        { mot: "faire", temps: "à l'imparfait" },
      ],
      niveau2: [
        { mot: "un dessert" },
        { mot: "un fraisier" },
        { mot: "la directrice" },
        { mot: "délicieux" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: [
          "Ils décorent la salle des fêtes méticuleusement.",
          "Les élèves installent les banderoles blanches.",
        ],
        niveau2: ["Le fraisier est le dessert-surprise.", "Il y avait toujours la directrice."],
      },
      {
        jour: 2,
        type: "sans-erreur",
        niveau1: ["Quand tout était prêt à l'extérieur, les familles faisaient la fête."],
        niveau2: ["Le dessert est un gros roulé au chocolat."],
      },
      {
        jour: 3,
        type: "frigo",
        niveau1: ["Les ballons dansaient dans l'air toute la soirée."],
        niveau2: ["Il y avait des ballons blancs et des banderoles colorées."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Les élèves aimaient décorer la salle : ils installaient méticuleusement les grandes banderoles et les nappes blanches.",
          "Quand tout était prêt, les familles arrivaient peu à peu dans la salle des fêtes.",
          "Les ballons dansaient dans l'air et la musique résonnait jusqu'à l'extérieur.",
          "Tout le monde faisait la fête.",
          "Puis, c'était l'heure de se souhaiter de bonnes vacances !",
        ],
        mots: 61,
      },
      niveau2: {
        phrases: [
          "Pour le dessert-surprise, il y avait toujours les délicieux fraisiers de la directrice.",
        ],
        mots: 75,
      },
      bonus: {
        phrases: ["Avant de partir, les élèves donnaient des fleurs aux professeurs."],
        mots: 85,
      },
    },
    guidePage: 47,
    cahierPage: 70,
  },
  {
    semaine: 33,
    periode: 5,
    notion: { numero: 34, titre: "Les marques du passé composé" },
    corpusTheme: "Le métier de nos rêves",
    objectifSequence:
      "Écrire correctement les verbes conjugués en mobilisant différents temps. Comme le passé composé constitue une notion complexe au cycle 2, son étude sera différée à la dictée suivante, afin de laisser le temps de consolider les acquis.",
    objectifsTransversaux: [
      "Écrire correctement un dialogue en respectant les marques du discours direct",
      "Écrire correctement des mots appartenant au corpus lexical des métiers",
      "Respecter les accords au sein du groupe nominal et les accords sujet-verbe",
      "Écrire correctement les mots qui présentent des régularités ou des irrégularités",
    ],
    regularites: [
      {
        titre: "Les mots qui commencent par « occ- »",
        explication:
          "La plupart des mots qui commencent par [ɔk] s'écrivent « occ- » comme occuper, occasion, occupation, occidental, etc.",
      },
      {
        titre: "Les mots en « -ique »",
        explication:
          "De très nombreux mots, qu'ils soient masculins ou féminins, se terminent par « -ique », comme la clinique, la musique, comique, etc. Cette terminaison est notamment fréquente pour les adjectifs et les noms abstraits.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un vétérinaire" },
        { mot: "une clinique" },
        { mot: "un métier" },
        { mot: "un atelier" },
        { mot: "une viennoiserie" },
        { mot: "croustillant" },
        { mot: "hier" },
        { mot: "être", temps: "au futur" },
        { mot: "annoncer", temps: "au présent" },
        { mot: "soigner", temps: "à l'imparfait" },
      ],
      niveau2: [
        { mot: "un incendie" },
        { mot: "coincé" },
        { mot: "sauver", temps: "au futur" },
        { mot: "s'occuper", temps: "au futur" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: [
          "Hier, j'étais dans une clinique vétérinaire.",
          "Tu prépareras des viennoiseries croustillantes.",
        ],
        niveau2: [
          "Je m'occuperai des chats coincés.",
          "Je sauverai les chiots dans les incendies.",
        ],
      },
      {
        jour: 2,
        type: "sans-erreur",
        niveau1: ["Louisa sera pompier car ce métier demande beaucoup de courage."],
        niveau2: ["Je m'occuperai des incendies."],
      },
      {
        jour: 3,
        type: "frigo",
        niveau1: ["Vous adorez la boulangerie et l'atelier cuisine de Toni."],
        niveau2: ["Louisa sauvera beaucoup de chats car elle a du courage."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "- Plus tard, je serai vétérinaire, annonce Noa.",
          "Hier, j'étais dans une clinique !",
          "Le docteur soignait des chats.",
          "- Moi, dit Louisa, je serai pompier !",
          "Ce métier demande beaucoup de courage !",
          "Et toi, Toni ?",
          "- Je serai boulanger !",
          "J'adore l'atelier cuisine !",
          "Je prépare des viennoiseries croustillantes chaque mercredi.",
        ],
        mots: 48,
      },
      niveau2: {
        phrases: ["- Je sauverai les chats coincés, et Louisa s'occupera des incendies ! dit Noa."],
        mots: 61,
      },
      bonus: {
        phrases: ["- Toni prépare des croissants délicieux, annonce Louisa."],
        mots: 67,
      },
    },
    guidePage: 253,
    cahierPage: 72,
  },
  {
    semaine: 34,
    periode: 5,
    notion: { numero: 6, titre: "Les niveaux de langue" },
    corpusTheme: "La fête foraine",
    objectifSequence:
      "Écrire correctement un texte en utilisant le registre courant, tout en prenant conscience qu'un même message peut s'exprimer différemment selon le niveau de langue (familier, courant, soutenu).",
    objectifsTransversaux: [
      "Conjuguer correctement des verbes au passé composé",
      "Écrire correctement des mots appartenant au corpus lexical de la fête foraine",
      "Respecter les accords au sein du groupe nominal (déterminant, nom, adjectif)",
      "Écrire correctement les mots qui présentent des régularités ou des irrégularités",
    ],
    regularites: [
      {
        titre: "La lettre « û »",
        explication:
          "Le « û » (avec accent circonflexe) est une lettre rare en français. L'accent ne modifie pas la prononciation. Il marque souvent la disparition d'un ancien s comme dans coût (→ coste). Cet accent tend à disparaître, sauf en cas d'homonymie comme sur (sur la table) et sûr (être sûr de soi, bien sûr), ou encore mur (un mur de brique) et mûr (un fruit mûr).",
      },
      {
        titre: "Les mots qui commencent par « imm- »",
        explication:
          "Lorsqu'un mot commence par [im], il s'écrit presque toujours « imm- » comme dans immense.",
      },
    ],
    corpus: {
      niveau1: [
        { mot: "un forain" },
        { mot: "la chance" },
        { mot: "une barbe à papa" },
        { mot: "forain/foraine" },
        { mot: "meilleur" },
        { mot: "rapidement" },
        { mot: "attirer", temps: "au passé composé" },
        { mot: "se diriger", temps: "au passé composé" },
        { mot: "avoir", temps: "à l'imparfait" },
        { mot: "remporter", temps: "au passé composé" },
      ],
      niveau2: [
        { mot: "le tournis" },
        { mot: "russe" },
        { mot: "aller", temps: "au passé composé" },
        { mot: "avoir", temps: "au passé composé" },
      ],
    },
    jours: [
      {
        jour: 1,
        type: "phrases",
        niveau1: [
          "Le forain s'est dirigé vers son stand.",
          "J'ai remporté une peluche géante.",
        ],
        niveau2: [
          "Ensuite, je suis allé à la grande roue.",
          "Une fois en haut, j'ai eu le tournis.",
        ],
      },
      {
        jour: 2,
        type: "sans-erreur",
        niveau1: ["Le meilleur stand de barbe à papa a attiré une foule immense."],
        niveau2: ["Nous sommes allés faire les montagnes russes."],
      },
      {
        jour: 3,
        type: "frigo",
        niveau1: ["Vous avez admiré la ville depuis le haut de la grande roue."],
        niveau2: ["J'ai eu le tournis pendant plusieurs minutes à chaque fois."],
      },
    ],
    bilan: {
      jour: 4,
      type: "bilan",
      niveau1: {
        phrases: [
          "Hier soir, la fête foraine a attiré une foule immense.",
          "Rapidement, tout le monde s'est dirigé vers la grande roue.",
          "Une fois en haut, nous avons admiré la ville.",
          "Il y avait, bien sûr, des stands de jeux et j'ai tenté ma chance !",
          "Mon meilleur ami a remporté une peluche géante et une barbe à papa.",
        ],
        mots: 58,
      },
      niveau2: {
        phrases: [
          "Ensuite, nous sommes allés faire les montagnes russes et j'ai eu le tournis pendant plusieurs minutes.",
        ],
        mots: 75,
      },
      bonus: {
        phrases: ["Pour finir la soirée, nous avons dégusté une pomme d'amour."],
        mots: 86,
      },
    },
    guidePage: 54,
    cahierPage: 74,
  },
];
