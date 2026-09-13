/**
 * Les textes de l'exercice « Compter les phrases ».
 *
 * Un texte est stocké découpé : chaque entrée de `phrases` est une phrase
 * complète, la réponse attendue est donc leur nombre. C'est ce découpage qui
 * sert aussi à la correction, où l'on rend au texte ses phrases une à une —
 * inutile de le redécouper à l'écran avec une expression régulière qui
 * trébucherait sur les points de suspension ou les guillemets.
 *
 * La difficulté suit deux pentes : la longueur du texte, et le nombre de
 * pièges. Ce qui trompe un élève qui compte les phrases, ce sont toujours les
 * mêmes choses :
 *
 * - une virgule ou une énumération, qui découpent la phrase sans la terminer ;
 * - un point d'exclamation ou d'interrogation, qui la terminent aussi sûrement
 *   qu'un point ;
 * - des points de suspension, qui ressemblent à une pause et la terminent
 *   pourtant ;
 * - un point-virgule ou un deux-points, qui ne la terminent pas ;
 * - une question entre guillemets à l'intérieur d'une phrase plus longue ;
 * - un point d'abréviation (« M. Berger »), qui n'est pas un point final.
 *
 * Le champ `piege` n'est jamais montré à l'élève : il documente le corpus pour
 * l'adulte qui le relit ou l'enrichit.
 */

export interface TexteAPhrases {
  /** Le texte, phrase par phrase. Elles sont affichées à la suite. */
  phrases: string[];
  /** Ce que ce texte fait travailler, pour l'adulte qui relit le corpus. */
  piege: string;
}

/**
 * Niveau B — trois à cinq phrases courtes.
 * Un seul piège à la fois : une virgule, ou une phrase de deux mots.
 */
export const TEXTES_B: TexteAPhrases[] = [
  {
    phrases: [
      "Le chat de Léa s'appelle Filou.",
      "Il dort toute la journée sur le canapé.",
      "Le soir, il court dans le jardin.",
      "Quel drôle d'animal !",
    ],
    piege: "Une virgule en début de phrase, un point d'exclamation pour finir.",
  },
  {
    phrases: [
      "Ce matin, il pleut.",
      "Papa a pris son parapluie.",
      "Nous partons à l'école en voiture.",
    ],
    piege: "Le texte le plus simple du niveau : trois phrases, trois points.",
  },
  {
    phrases: [
      "Tom aime le vélo.",
      "Il pédale vite, très vite.",
      "Attention à la flaque !",
      "Trop tard.",
      "Tom est tout mouillé.",
    ],
    piege: "Une phrase de deux mots seulement : « Trop tard. »",
  },
  {
    phrases: [
      "Dans mon cartable, il y a un livre, une trousse et un cahier.",
      "J'ai oublié mon goûter.",
      "Maman va me le rapporter.",
      "Ouf !",
    ],
    piege: "Une énumération à trois virgules, et une phrase d'un seul mot.",
  },
  {
    phrases: [
      "Où est passé le ballon ?",
      "Il a roulé sous le banc.",
      "Louise le récupère.",
    ],
    piege: "Le texte s'ouvre sur une question.",
  },
  {
    phrases: [
      "La maîtresse ouvre la fenêtre.",
      "Un oiseau entre dans la classe.",
      "Tout le monde crie.",
      "L'oiseau repart aussitôt.",
    ],
    piege: "Quatre phrases de même longueur : il faut vraiment les compter.",
  },
  {
    phrases: [
      "C'est l'automne.",
      "Les feuilles tombent des arbres.",
      "Elles sont rouges, jaunes et marron.",
      "Nous les ramassons.",
      "Nous en faisons un grand tas.",
    ],
    piege: "Une énumération de couleurs au milieu du texte.",
  },
  {
    phrases: [
      "Mamie fait un gâteau au chocolat.",
      "Elle casse trois œufs dans le saladier.",
      "Ça sent très bon !",
    ],
    piege: "Un point d'exclamation en fin de texte.",
  },
  {
    phrases: [
      "Le train entre en gare.",
      "Les portes s'ouvrent.",
      "Est-ce que c'est le bon quai ?",
      "Papa vérifie son billet.",
    ],
    piege: "Une question au milieu du texte, pas à la fin.",
  },
  {
    phrases: [
      "Nino a perdu une dent.",
      "Il la met sous son oreiller.",
      "Le matin, il trouve une pièce.",
      "Quelle surprise !",
    ],
    piege: "Virgule d'ouverture et exclamation finale.",
  },
  {
    phrases: [
      "Il neige sur le village.",
      "Les toits sont tout blancs.",
      "Les enfants sortent leurs luges.",
      "Ils glissent sur la colline.",
      "Personne n'a froid.",
    ],
    piege: "Cinq phrases sans aucun signe autre que le point.",
  },
  {
    phrases: [
      "Le vétérinaire soigne un lapin.",
      "Le lapin a mal à la patte.",
      "Dans une semaine, il pourra sauter.",
    ],
    piege: "Trois phrases, dont une commence par un complément.",
  },
  {
    phrases: [
      "Nous plantons des graines dans un pot.",
      "Nous mettons de la terre, de l'eau et du soleil.",
      "Rien ne pousse.",
      "Il faut être patient.",
    ],
    piege: "Une énumération suivie d'une phrase très courte.",
  },
  {
    phrases: [
      "Qui a mangé mon fromage ?",
      "Le fermier cherche partout.",
      "Une petite souris se cache derrière le seau.",
      "Elle a l'air très contente.",
    ],
    piege: "Question d'ouverture, puis trois points.",
  },
];

/**
 * Niveau C — cinq à huit phrases.
 * Les phrases s'allongent : virgules multiples, propositions reliées par
 * « et » ou « mais », questions et exclamations mêlées aux points.
 */
export const TEXTES_C: TexteAPhrases[] = [
  {
    phrases: [
      "Samedi matin, le marché s'installe sur la place.",
      "Les marchands crient pour attirer les clients.",
      "Sur l'étal du poissonnier, il y a des crevettes, des moules et un énorme cabillaud.",
      "Maman s'arrête devant les fraises.",
      "Elles sont bien rouges, mais elles coûtent cher.",
      "Nous prendrons des pommes.",
    ],
    piege: "Une longue énumération, puis deux propositions reliées par « mais ».",
  },
  {
    phrases: [
      "Le maître nous a annoncé une grande nouvelle.",
      "Nous partons en classe de mer au mois de mai !",
      "Nous dormirons dans un centre, tout près de la plage.",
      "Est-ce qu'on pourra se baigner ?",
      "Il faudra sans doute attendre que l'eau se réchauffe.",
      "Chacun doit rapporter la fiche signée par ses parents.",
      "Je la range tout de suite dans mon cartable.",
    ],
    piege: "Les trois ponctuations finales se suivent : point, exclamation, question.",
  },
  {
    phrases: [
      "Depuis trois jours, notre voisine cherche son chien.",
      "Elle a collé des affiches sur les poteaux, dans la rue et à la boulangerie.",
      "Hier soir, on a entendu des aboiements du côté du parc.",
      "Papa a pris une lampe et nous sommes partis voir.",
      "C'était bien lui !",
    ],
    piege: "Une phrase longue reliée par « et » : elle en paraît deux.",
  },
  {
    phrases: [
      "La sonnerie retentit.",
      "Les élèves rangent leurs affaires, enfilent leur manteau et se mettent en rang.",
      "Dehors, la pluie a cessé.",
      "Karim saute dans une flaque.",
      "Ses chaussures sont trempées.",
      "Sa sœur le gronde.",
      "Il rit quand même.",
      "Demain, il recommencera sûrement.",
    ],
    piege: "Huit phrases, dont une énumération de trois actions.",
  },
  {
    phrases: [
      "Le vieux moulin se dresse en haut de la colline.",
      "Ses ailes ne tournent plus depuis longtemps.",
      "Autrefois, le meunier y écrasait le blé pour faire de la farine.",
      "Aujourd'hui, les hirondelles y font leur nid.",
      "Veux-tu monter jusque là-haut ?",
      "Le chemin est raide, mais la vue est magnifique.",
    ],
    piege: "Une question glissée entre deux phrases descriptives.",
  },
  {
    phrases: [
      "Nous avons construit une cabane au fond du jardin.",
      "Il nous a fallu des planches, des clous, une scie et beaucoup de patience.",
      "Le toit penche un peu.",
      "Tant pis !",
      "On y tient à quatre, serrés comme des sardines.",
      "Papa dit qu'il faudra la consolider avant l'hiver.",
      "En attendant, c'est notre quartier général.",
    ],
    piege: "Une phrase de deux mots au milieu d'un texte de phrases longues.",
  },
  {
    phrases: [
      "Un orage s'est levé pendant la nuit.",
      "Le tonnerre a réveillé toute la maison.",
      "Le chat s'est caché sous le lit et il a refusé d'en sortir.",
      "Au matin, le jardin était couvert de branches.",
      "Quel désordre !",
    ],
    piege: "Une phrase à deux verbes reliés par « et ».",
  },
  {
    phrases: [
      "Léna apprend à jouer de la guitare.",
      "Au début, ses doigts lui faisaient mal.",
      "Maintenant, elle connaît trois accords et une chanson entière.",
      "Sa professeure lui a proposé de jouer devant la classe.",
      "Est-ce qu'elle osera ?",
      "Elle a encore deux semaines pour s'entraîner.",
    ],
    piege: "Trois phrases de suite commencent par un complément suivi d'une virgule.",
  },
  {
    phrases: [
      "Le boulanger se lève à quatre heures du matin.",
      "Pendant que le village dort, il pétrit la pâte, la laisse reposer et allume son four.",
      "L'odeur du pain chaud sort par la petite fenêtre.",
      "Les premiers clients arrivent à sept heures.",
      "Certains achètent une baguette, d'autres deux croissants.",
      "Le samedi, la file va jusqu'au trottoir.",
      "Le dimanche, la boutique est fermée.",
    ],
    piege: "Une phrase de dix-huit mots avec quatre virgules.",
  },
  {
    phrases: [
      "Un chantier a commencé devant l'école.",
      "Une grue immense soulève des poutres de métal.",
      "Les ouvriers portent des casques jaunes, des gants et des chaussures renforcées.",
      "Nous regardons par la grille pendant la récréation.",
      "Combien de temps faudra-t-il pour construire l'immeuble ?",
      "Le maître dit qu'il sera fini avant Noël.",
    ],
    piege: "Une question longue, qui se termine loin de son mot interrogatif.",
  },
  {
    phrases: [
      "Grand-père garde ses outils dans une vieille caisse en bois.",
      "Il y a des tournevis, un marteau, des vis de toutes les tailles.",
      "Ce matin, il répare la chaise de la cuisine.",
      "Il me laisse tenir le pied pendant qu'il visse.",
      "Voilà, elle ne bouge plus !",
    ],
    piege: "Une énumération sans « et » final, qui semble s'arrêter en chemin.",
  },
  {
    phrases: [
      "L'aquarium de la classe a un nouvel habitant.",
      "C'est un poisson rouge que Sarah a apporté dans un bocal.",
      "Nous l'avons appelé Bulle.",
      "Il tourne, il monte, il redescend.",
      "Chaque matin, un élève lui donne à manger.",
      "Il ne faut pas exagérer les grains !",
      "Un poisson trop nourri tombe malade.",
      "C'est la maîtresse qui l'a expliqué.",
    ],
    piege: "Trois propositions séparées par des virgules dans une seule phrase.",
  },
  {
    phrases: [
      "Le facteur passe vers dix heures.",
      "Aujourd'hui, il a laissé un colis devant la porte.",
      "Il est léger, il fait du bruit quand on le secoue.",
      "Sur l'étiquette, il y a le nom de ma sœur.",
      "Elle ouvrira le paquet ce soir, pour son anniversaire.",
      "J'ai très envie de savoir ce qu'il y a dedans.",
    ],
    piege: "Une virgule qui relie deux propositions complètes.",
  },
  {
    phrases: [
      "Nous avons visité une ferme mardi.",
      "Il y avait des vaches, des poules, deux ânes et un cochon énorme.",
      "L'agricultrice nous a montré la machine à traire.",
      "Le lait passe dans de longs tuyaux transparents.",
      "Ensuite, il est refroidi dans une grande cuve.",
      "Avez-vous déjà bu du lait tout juste trait ?",
      "Il est tiède et un peu sucré.",
    ],
    piege: "Une énumération d'animaux, puis une question en fin de texte.",
  },
];

/**
 * Niveau D — sept à dix phrases, et les vrais pièges.
 * Points de suspension, point-virgule, deux-points, guillemets contenant une
 * question, points d'abréviation : autant de signes qui ressemblent à une fin
 * de phrase sans en être une, ou l'inverse.
 */
export const TEXTES_D: TexteAPhrases[] = [
  {
    phrases: [
      "La forêt semblait dormir.",
      "Rien ne bougeait ; pas un oiseau, pas un souffle de vent.",
      "Nous avancions sur le sentier, les yeux grands ouverts.",
      "Soudain, un craquement…",
      "Nous nous sommes arrêtés net.",
      "Ce n'était qu'un écureuil : il a filé le long d'un tronc et a disparu dans les branches.",
      "Mon frère a éclaté de rire.",
      "Moi, j'avais encore le cœur qui battait très fort.",
    ],
    piege:
      "Un point-virgule et un deux-points qui ne terminent pas la phrase, des points de suspension qui la terminent.",
  },
  {
    phrases: [
      "M. Berger est le gardien du phare.",
      "Depuis trente ans, il monte chaque soir les cent quatre-vingt-douze marches qui mènent à la lampe.",
      "Il vérifie l'ampoule, nettoie les vitres et note la météo dans un carnet.",
      "En hiver, les vagues frappent si fort que les murs tremblent.",
      "« Vous n'avez jamais peur ? » lui a demandé une journaliste.",
      "Il a haussé les épaules.",
      "La mer, il la connaît : elle gronde, elle s'apaise, elle recommence.",
      "Un jour, le phare sera automatique.",
      "M. Berger, lui, préfère ne pas y penser.",
    ],
    piege:
      "Deux points d'abréviation (« M. »), et une question entre guillemets à l'intérieur d'une phrase qui continue.",
  },
  {
    phrases: [
      "Le train de nuit est parti à vingt-deux heures.",
      "Dans le couloir, les lumières étaient bleues et très faibles.",
      "Chacun cherchait sa couchette : certains parlaient bas, d'autres dormaient déjà.",
      "J'ai collé mon front contre la vitre.",
      "Des villages, des champs, une gare vide… tout défilait dans le noir.",
      "Ma mère m'a dit de fermer les yeux.",
      "Je n'y arrivais pas.",
      "Le matin, quand j'ai relevé le rideau, la montagne était là, énorme, toute blanche.",
    ],
    piege: "Des points de suspension au milieu d'une phrase, qui ne la terminent pas.",
  },
  {
    phrases: [
      "Notre classe a décidé de fabriquer un journal.",
      "Il fallait tout organiser : les articles, les photos, la mise en page et l'impression.",
      "Chacun a choisi sa rubrique.",
      "Ivan s'occupe du sport ; Aïcha écrit les recettes ; Malo dessine les bandes dessinées.",
      "Moi, je fais les interviews.",
      "J'ai commencé par la cantinière.",
      "« Combien de repas préparez-vous chaque jour ? » lui ai-je demandé.",
      "Deux cent quarante, sans compter les adultes !",
      "Je ne l'aurais jamais cru.",
      "Le premier numéro sortira avant les vacances.",
    ],
    piege: "Deux point-virgules dans une même phrase : elle en paraît trois.",
  },
  {
    phrases: [
      "Il existe un endroit, tout au fond de la bibliothèque, où presque personne ne va.",
      "Les livres y sont vieux ; leurs couvertures s'effritent quand on les ouvre.",
      "La bibliothécaire m'a laissé entrer un mercredi.",
      "Elle m'a prévenu : « Tu regardes, mais tu ne cornes pas les pages. »",
      "J'ai promis.",
      "Sur une étagère, j'ai trouvé un atlas immense.",
      "Les pays n'avaient pas les mêmes noms qu'aujourd'hui.",
      "Certaines régions étaient simplement blanches, sans rien…",
      "Personne ne savait encore ce qu'il y avait là-bas.",
    ],
    piege: "Une phrase rapportée entre guillemets, avec son point avant le guillemet fermant.",
  },
  {
    phrases: [
      "La recette paraît simple : de la farine, du beurre, du sucre et des pommes.",
      "Pourtant, la première fois, j'ai tout raté.",
      "La pâte collait aux doigts ; le four était trop chaud ; les pommes ont noirci.",
      "Ma tante n'a rien dit.",
      "Elle a sorti un autre saladier et nous avons recommencé, doucement.",
      "« Regarde tes mains, m'a-t-elle expliqué, elles doivent rester légères. »",
      "La deuxième tarte était dorée, parfumée, parfaite.",
      "Il n'en est pas resté une part.",
    ],
    piege: "Une phrase coupée en deux par une incise : « m'a-t-elle expliqué ».",
  },
  {
    phrases: [
      "Le volcan n'avait rien fait depuis des siècles.",
      "Les habitants avaient planté des vignes sur ses pentes ; le sol y est très fertile.",
      "Un matin de printemps, la terre s'est mise à trembler.",
      "D'abord légèrement, puis de plus en plus fort…",
      "Les scientifiques ont installé des appareils partout : sismographes, caméras, capteurs de gaz.",
      "Fallait-il évacuer le village ?",
      "La décision a été prise en une nuit.",
      "Trois jours plus tard, une coulée de lave descendait vers la vallée.",
      "Elle s'est arrêtée à deux kilomètres des premières maisons.",
      "Personne n'a été blessé.",
    ],
    piege: "Une phrase sans verbe terminée par des points de suspension.",
  },
  {
    phrases: [
      "Il paraît que les manchots empereurs traversent des dizaines de kilomètres sur la glace.",
      "Ils marchent en file, se serrent les uns contre les autres et se relaient pour affronter le vent.",
      "Celui qui est à l'extérieur prend le froid ; un peu plus tard, il se retrouvera au centre, bien au chaud.",
      "Ainsi, personne ne gèle.",
      "Le père garde l'œuf sur ses pattes pendant deux mois.",
      "Deux mois sans manger !",
      "Pendant ce temps, la mère pêche en mer.",
      "Quand elle revient, elle reconnaît son compagnon à son cri.",
      "Comment fait-elle, au milieu de milliers d'autres ?",
    ],
    piege: "Une exclamation sans verbe, et une question coupée par une virgule.",
  },
  {
    phrases: [
      "Le grenier de la maison sentait la poussière et le bois chaud.",
      "Nous n'avions pas le droit d'y monter seuls.",
      "Bien sûr, nous y sommes montés quand même.",
      "Il y avait des malles, une machine à coudre, des cadres empilés contre le mur…",
      "Dans une boîte en fer, j'ai trouvé des lettres attachées par une ficelle.",
      "L'écriture était fine, penchée, difficile à lire.",
      "C'était celle de mon arrière-grand-mère : elle écrivait à son frère parti travailler loin.",
      "Nous avons tout remis en place, sans rien dire à personne.",
    ],
    piege: "Une énumération qui s'achève sur des points de suspension.",
  },
  {
    phrases: [
      "Chaque année, au mois de juin, le collège organise une course.",
      "Les élèves courent pendant trente minutes ; chaque tour rapporte de l'argent pour une association.",
      "Cette fois, nous avons couru pour un refuge d'animaux.",
      "Il faisait une chaleur épouvantable.",
      "Certains sont partis trop vite : au bout de dix minutes, ils marchaient déjà.",
      "Mme Alvarez, notre professeure, nous répétait de garder un rythme régulier.",
      "Elle avait raison.",
      "J'ai fait onze tours.",
      "Ce n'est pas un record, mais je n'ai pas marché une seule fois.",
      "À l'arrivée, tout le monde s'est assis dans l'herbe, épuisé et content.",
    ],
    piege: "Dix phrases, un point-virgule et un deux-points au milieu du texte.",
  },
  {
    phrases: [
      "La panne est arrivée sans prévenir.",
      "D'un coup, plus d'électricité : ni lumière, ni frigo, ni écran.",
      "Ma mère a allumé deux bougies et sorti un jeu de cartes.",
      "Nous avons joué pendant des heures, en riant beaucoup trop fort.",
      "Vers minuit, les lampes se sont rallumées d'un seul coup.",
      "Personne n'a bougé…",
      "Nous aurions bien continué encore un peu.",
    ],
    piege: "Le texte le plus court du niveau, mais deux-points et suspension mêlés.",
  },
  {
    phrases: [
      "On croit souvent que le désert est vide.",
      "C'est faux.",
      "Sous le sable, une multitude d'animaux attendent la nuit : scorpions, serpents, renards des sables, minuscules rongeurs.",
      "Le jour, la température dépasse cinquante degrés ; la nuit, elle peut descendre près de zéro.",
      "Comment survivre à un tel écart ?",
      "Chaque espèce a sa méthode.",
      "Le fennec, par exemple, évacue la chaleur par ses immenses oreilles.",
      "Certaines plantes, elles, gardent leurs graines des années durant.",
      "Il suffit d'une pluie pour que le désert se couvre de fleurs.",
    ],
    piege: "Une phrase de deux mots coincée entre deux phrases très longues.",
  },
  {
    phrases: [
      "Le club de théâtre répète tous les jeudis, dans la salle du fond.",
      "Cette année, nous jouons une pièce sur un procès d'animaux.",
      "Je tiens le rôle du renard ; c'est moi l'accusé.",
      "Au début, je parlais beaucoup trop vite.",
      "« Respire, articule, prends ton temps », répétait le metteur en scène.",
      "Petit à petit, c'est venu.",
      "La représentation aura lieu le 14 mars, à dix-neuf heures.",
      "Mes parents ont déjà réservé leurs places.",
    ],
    piege: "Un ordre entre guillemets suivi d'une virgule : la phrase continue après.",
  },
  {
    phrases: [
      "Un matin, en ouvrant les volets, j'ai vu que la rivière avait débordé.",
      "L'eau recouvrait le pré, le chemin, le bas du jardin…",
      "Elle était marron, épaisse, et elle charriait des branches.",
      "Les pompiers sont passés très tôt : ils demandaient à chacun de monter à l'étage.",
      "Est-ce que la maison allait tenir ?",
      "Mon père répétait que oui, que ce n'était pas la première fois.",
      "Nous avons attendu deux jours.",
      "Puis l'eau s'est retirée, doucement, comme si de rien n'était.",
      "Elle a laissé partout une boue grise et collante.",
      "Il nous a fallu une semaine pour tout nettoyer.",
    ],
    piege: "Suspension, deux-points et question dans le même texte.",
  },
];
