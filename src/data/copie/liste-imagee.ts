/**
 * Mots illustrés pour la copie en capitales.
 *
 * Deux cents mots concrets répartis en vingt thèmes, choisis pour être compris et
 * écrits par un élève en début d'apprentissage : des noms courants, courts, et
 * tous illustrables. À l'intérieur d'un thème, les mots vont du plus court au plus
 * long, de sorte qu'une séance commence toujours par le plus accessible.
 *
 * Chaque mot est associé à un pictogramme ARASAAC, identifié une fois pour toutes
 * via l'API du portail. L'image est servie par leur CDN :
 * https://static.arasaac.org/pictograms/<picto>/<picto>_300.png
 *
 * Pictogrammes : ARASAAC (https://arasaac.org), auteur Sergio Palao, propriété du
 * Gouvernement d'Aragon, diffusés sous licence CC BY-NC-SA.
 */

export interface MotIllustre {
  mot: string;
  /** Identifiant du pictogramme ARASAAC. */
  picto: number;
  /** Clé du thème auquel le mot appartient. */
  theme: string;
}

export interface ThemeIllustre {
  cle: string;
  intitule: string;
}

export const THEMES_ILLUSTRES: ThemeIllustre[] = [
  { cle: 'ferme', intitule: "Les animaux de la ferme" },
  { cle: 'savane', intitule: "Les animaux de la savane" },
  { cle: 'halloween', intitule: "Les monstres d'Halloween" },
  { cle: 'hiver', intitule: "L'hiver" },
  { cle: 'marche', intitule: "Les fruits et les légumes" },
  { cle: 'ecole', intitule: "L'école" },
  { cle: 'vetements', intitule: "Les vêtements" },
  { cle: 'repas', intitule: "Le repas" },
  { cle: 'transports', intitule: "Les transports" },
  { cle: 'corps', intitule: "Le corps" },
  { cle: 'mer', intitule: "La mer et la plage" },
  { cle: 'petites-betes', intitule: "Les petites bêtes" },
  { cle: 'foret', intitule: "La forêt" },
  { cle: 'noel', intitule: "Noël" },
  { cle: 'musique', intitule: "La musique" },
  { cle: 'couleurs', intitule: "Les couleurs" },
  { cle: 'maison', intitule: "La maison" },
  { cle: 'metiers', intitule: "Les métiers" },
  { cle: 'sport', intitule: "Le sport" },
  { cle: 'meteo', intitule: "La météo" },
];

export const MOTS_ILLUSTRES: MotIllustre[] = [
  // Les animaux de la ferme
  { mot: 'âne', picto: 2291, theme: 'ferme' },
  { mot: 'coq', picto: 2404, theme: 'ferme' },
  { mot: 'lapin', picto: 2351, theme: 'ferme' },
  { mot: 'poule', picto: 2403, theme: 'ferme' },
  { mot: 'vache', picto: 2609, theme: 'ferme' },
  { mot: 'canard', picto: 28479, theme: 'ferme' },
  { mot: 'cheval', picto: 2294, theme: 'ferme' },
  { mot: 'cochon', picto: 24972, theme: 'ferme' },
  { mot: 'mouton', picto: 2489, theme: 'ferme' },
  { mot: 'tracteur', picto: 2600, theme: 'ferme' },

  // Les animaux de la savane
  { mot: 'lion', picto: 25187, theme: 'savane' },
  { mot: 'singe', picto: 2477, theme: 'savane' },
  { mot: 'zèbre', picto: 2324, theme: 'savane' },
  { mot: 'girafe', picto: 2437, theme: 'savane' },
  { mot: 'gazelle', picto: 17241, theme: 'savane' },
  { mot: 'serpent', picto: 2568, theme: 'savane' },
  { mot: 'antilope', picto: 27570, theme: 'savane' },
  { mot: 'autruche', picto: 2650, theme: 'savane' },
  { mot: 'éléphant', picto: 2372, theme: 'savane' },
  { mot: 'crocodile', picto: 2343, theme: 'savane' },

  // Les monstres d'Halloween
  { mot: 'balai', picto: 2693, theme: 'halloween' },
  { mot: 'momie', picto: 26427, theme: 'halloween' },
  { mot: 'bonbon', picto: 2686, theme: 'halloween' },
  { mot: 'fantôme', picto: 5469, theme: 'halloween' },
  { mot: 'monstre', picto: 11306, theme: 'halloween' },
  { mot: 'vampire', picto: 6239, theme: 'halloween' },
  { mot: 'araignée', picto: 38275, theme: 'halloween' },
  { mot: 'sorcière', picto: 5404, theme: 'halloween' },
  { mot: 'squelette', picto: 5727, theme: 'halloween' },
  { mot: 'citrouille', picto: 2679, theme: 'halloween' },

  // L'hiver
  { mot: 'ski', picto: 16701, theme: 'hiver' },
  { mot: 'gant', picto: 8314, theme: 'hiver' },
  { mot: 'luge', picto: 8710, theme: 'hiver' },
  { mot: 'botte', picto: 8299, theme: 'hiver' },
  { mot: 'igloo', picto: 8137, theme: 'hiver' },
  { mot: 'neige', picto: 3135, theme: 'hiver' },
  { mot: 'sapin', picto: 3051, theme: 'hiver' },
  { mot: 'bonnet', picto: 39395, theme: 'hiver' },
  { mot: 'écharpe', picto: 2290, theme: 'hiver' },
  { mot: 'manteau', picto: 2242, theme: 'hiver' },

  // Les fruits et les légumes
  { mot: 'poire', picto: 2561, theme: 'marche' },
  { mot: 'pomme', picto: 2462, theme: 'marche' },
  { mot: 'banane', picto: 2530, theme: 'marche' },
  { mot: 'cerise', picto: 8303, theme: 'marche' },
  { mot: 'citron', picto: 3022, theme: 'marche' },
  { mot: 'fraise', picto: 2400, theme: 'marche' },
  { mot: 'orange', picto: 2888, theme: 'marche' },
  { mot: 'salade', picto: 2377, theme: 'marche' },
  { mot: 'tomate', picto: 2594, theme: 'marche' },
  { mot: 'carotte', picto: 2619, theme: 'marche' },

  // L'école
  { mot: 'colle', picto: 2709, theme: 'ecole' },
  { mot: 'gomme', picto: 2409, theme: 'ecole' },
  { mot: 'livre', picto: 25191, theme: 'ecole' },
  { mot: 'règle', picto: 2815, theme: 'ecole' },
  { mot: 'stylo', picto: 2282, theme: 'ecole' },
  { mot: 'cahier', picto: 2359, theme: 'ecole' },
  { mot: 'crayon', picto: 2440, theme: 'ecole' },
  { mot: 'ciseaux', picto: 2591, theme: 'ecole' },
  { mot: 'tableau', picto: 6222, theme: 'ecole' },
  { mot: 'trousse', picto: 8575, theme: 'ecole' },

  // Les vêtements
  { mot: 'jupe', picto: 2391, theme: 'vetements' },
  { mot: 'pull', picto: 2436, theme: 'vetements' },
  { mot: 'robe', picto: 2613, theme: 'vetements' },
  { mot: 'short', picto: 13638, theme: 'vetements' },
  { mot: 'veste', picto: 2319, theme: 'vetements' },
  { mot: 'pyjama', picto: 2522, theme: 'vetements' },
  { mot: 'chapeau', picto: 2572, theme: 'vetements' },
  { mot: 'pantalon', picto: 2565, theme: 'vetements' },
  { mot: 'chaussure', picto: 32922, theme: 'vetements' },
  { mot: 'chaussette', picto: 8339, theme: 'vetements' },

  // Le repas
  { mot: 'pain', picto: 2494, theme: 'repas' },
  { mot: 'soupe', picto: 2573, theme: 'repas' },
  { mot: 'verre', picto: 9140, theme: 'repas' },
  { mot: 'gâteau', picto: 2502, theme: 'repas' },
  { mot: 'yaourt', picto: 2618, theme: 'repas' },
  { mot: 'couteau', picto: 4931, theme: 'repas' },
  { mot: 'fromage', picto: 2541, theme: 'repas' },
  { mot: 'assiette', picto: 16857, theme: 'repas' },
  { mot: 'cuillère', picto: 2362, theme: 'repas' },
  { mot: 'fourchette', picto: 2588, theme: 'repas' },

  // Les transports
  { mot: 'bus', picto: 38090, theme: 'transports' },
  { mot: 'moto', picto: 7166, theme: 'transports' },
  { mot: 'vélo', picto: 6935, theme: 'transports' },
  { mot: 'avion', picto: 2264, theme: 'transports' },
  { mot: 'fusée', picto: 2344, theme: 'transports' },
  { mot: 'train', picto: 2603, theme: 'transports' },
  { mot: 'bateau', picto: 6932, theme: 'transports' },
  { mot: 'camion', picto: 6956, theme: 'transports' },
  { mot: 'tramway', picto: 2602, theme: 'transports' },
  { mot: 'voiture', picto: 2339, theme: 'transports' },

  // Le corps
  { mot: 'nez', picto: 2887, theme: 'corps' },
  { mot: 'bras', picto: 2669, theme: 'corps' },
  { mot: 'dent', picto: 10267, theme: 'corps' },
  { mot: 'main', picto: 2928, theme: 'corps' },
  { mot: 'pied', picto: 25327, theme: 'corps' },
  { mot: 'tête', picto: 2673, theme: 'corps' },
  { mot: 'doigt', picto: 3298, theme: 'corps' },
  { mot: 'jambe', picto: 8666, theme: 'corps' },
  { mot: 'bouche', picto: 2663, theme: 'corps' },
  { mot: 'oreille', picto: 2871, theme: 'corps' },

  // La mer et la plage
  { mot: 'crabe', picto: 2312, theme: 'mer' },
  { mot: 'phare', picto: 4646, theme: 'mer' },
  { mot: 'sable', picto: 4565, theme: 'mer' },
  { mot: 'requin', picto: 2589, theme: 'mer' },
  { mot: 'baleine', picto: 2268, theme: 'mer' },
  { mot: 'dauphin', picto: 2732, theme: 'mer' },
  { mot: 'mouette', picto: 3334, theme: 'mer' },
  { mot: 'parasol', picto: 4746, theme: 'mer' },
  { mot: 'poisson', picto: 2520, theme: 'mer' },
  { mot: 'coquillage', picto: 38075, theme: 'mer' },

  // Les petites bêtes
  { mot: 'ver', picto: 28485, theme: 'petites-betes' },
  { mot: 'guêpe', picto: 6925, theme: 'petites-betes' },
  { mot: 'fourmi', picto: 2425, theme: 'petites-betes' },
  { mot: 'mouche', picto: 2478, theme: 'petites-betes' },
  { mot: 'abeille', picto: 24823, theme: 'petites-betes' },
  { mot: 'chenille', picto: 16727, theme: 'petites-betes' },
  { mot: 'escargot', picto: 8061, theme: 'petites-betes' },
  { mot: 'papillon', picto: 26200, theme: 'petites-betes' },
  { mot: 'libellule', picto: 9066, theme: 'petites-betes' },
  { mot: 'coccinelle', picto: 2924, theme: 'petites-betes' },

  // La forêt
  { mot: 'nid', picto: 7173, theme: 'foret' },
  { mot: 'cerf', picto: 3263, theme: 'foret' },
  { mot: 'arbre', picto: 3057, theme: 'foret' },
  { mot: 'hibou', picto: 2671, theme: 'foret' },
  { mot: 'renard', picto: 2623, theme: 'foret' },
  { mot: 'feuille', picto: 8349, theme: 'foret' },
  { mot: 'écureuil', picto: 25815, theme: 'foret' },
  { mot: 'hérisson', picto: 26829, theme: 'foret' },
  { mot: 'sanglier', picto: 2965, theme: 'foret' },
  { mot: 'champignon', picto: 8328, theme: 'foret' },

  // Noël
  { mot: 'lutin', picto: 5445, theme: 'noel' },
  { mot: 'bougie', picto: 6242, theme: 'noel' },
  { mot: 'cadeau', picto: 25381, theme: 'noel' },
  { mot: 'cloche', picto: 5938, theme: 'noel' },
  { mot: 'étoile', picto: 2752, theme: 'noel' },
  { mot: 'cheminée', picto: 2333, theme: 'noel' },
  { mot: 'chocolat', picto: 25940, theme: 'noel' },
  { mot: 'couronne', picto: 2718, theme: 'noel' },
  { mot: 'traîneau', picto: 3161, theme: 'noel' },
  { mot: 'guirlande', picto: 3085, theme: 'noel' },

  // La musique
  { mot: 'flûte', picto: 2396, theme: 'musique' },
  { mot: 'harpe', picto: 8493, theme: 'musique' },
  { mot: 'micro', picto: 2912, theme: 'musique' },
  { mot: 'piano', picto: 2521, theme: 'musique' },
  { mot: 'casque', picto: 2691, theme: 'musique' },
  { mot: 'violon', picto: 2615, theme: 'musique' },
  { mot: 'guitare', picto: 2417, theme: 'musique' },
  { mot: 'tambour', picto: 2578, theme: 'musique' },
  { mot: 'batterie', picto: 5923, theme: 'musique' },
  { mot: 'trompette', picto: 2607, theme: 'musique' },

  // Les couleurs
  { mot: 'bleu', picto: 4869, theme: 'couleurs' },
  { mot: 'gris', picto: 3340, theme: 'couleurs' },
  { mot: 'noir', picto: 2886, theme: 'couleurs' },
  { mot: 'rose', picto: 3151, theme: 'couleurs' },
  { mot: 'vert', picto: 4887, theme: 'couleurs' },
  { mot: 'blanc', picto: 8043, theme: 'couleurs' },
  { mot: 'jaune', picto: 2648, theme: 'couleurs' },
  { mot: 'rouge', picto: 2808, theme: 'couleurs' },
  { mot: 'marron', picto: 2923, theme: 'couleurs' },
  { mot: 'violet', picto: 2907, theme: 'couleurs' },

  // La maison
  { mot: 'clé', picto: 8153, theme: 'maison' },
  { mot: 'lit', picto: 25900, theme: 'maison' },
  { mot: 'lampe', picto: 4936, theme: 'maison' },
  { mot: 'porte', picto: 3244, theme: 'maison' },
  { mot: 'tapis', picto: 2249, theme: 'maison' },
  { mot: 'canapé', picto: 25479, theme: 'maison' },
  { mot: 'chaise', picto: 3155, theme: 'maison' },
  { mot: 'miroir', picto: 8573, theme: 'maison' },
  { mot: 'fenêtre', picto: 2611, theme: 'maison' },
  { mot: 'escalier', picto: 27491, theme: 'maison' },

  // Les métiers
  { mot: 'pilote', picto: 3370, theme: 'metiers' },
  { mot: 'docteur', picto: 6561, theme: 'metiers' },
  { mot: 'facteur', picto: 2690, theme: 'metiers' },
  { mot: 'fermier', picto: 2982, theme: 'metiers' },
  { mot: 'pompier', picto: 6066, theme: 'metiers' },
  { mot: 'coiffeur', picto: 6588, theme: 'metiers' },
  { mot: 'policier', picto: 37367, theme: 'metiers' },
  { mot: 'boulanger', picto: 3358, theme: 'metiers' },
  { mot: 'cuisinier', picto: 30526, theme: 'metiers' },
  { mot: 'jardinier', picto: 6533, theme: 'metiers' },

  // Le sport
  { mot: 'judo', picto: 21943, theme: 'sport' },
  { mot: 'danse', picto: 35747, theme: 'sport' },
  { mot: 'patin', picto: 8318, theme: 'sport' },
  { mot: 'ballon', picto: 3241, theme: 'sport' },
  { mot: 'basket', picto: 10166, theme: 'sport' },
  { mot: 'course', picto: 11205, theme: 'sport' },
  { mot: 'tennis', picto: 10158, theme: 'sport' },
  { mot: 'piscine', picto: 30516, theme: 'sport' },
  { mot: 'football', picto: 16743, theme: 'sport' },
  { mot: 'raquette', picto: 2544, theme: 'sport' },

  // La météo
  { mot: 'vent', picto: 7259, theme: 'meteo' },
  { mot: 'nuage', picto: 2883, theme: 'meteo' },
  { mot: 'pluie', picto: 3123, theme: 'meteo' },
  { mot: 'éclair', picto: 34545, theme: 'meteo' },
  { mot: 'soleil', picto: 7252, theme: 'meteo' },
  { mot: 'tempête', picto: 34296, theme: 'meteo' },
  { mot: 'tonnerre', picto: 3225, theme: 'meteo' },
  { mot: 'parapluie', picto: 2500, theme: 'meteo' },
  { mot: 'brouillard', picto: 35049, theme: 'meteo' },
  { mot: 'arc-en-ciel', picto: 2986, theme: 'meteo' },
];

/** Les mots d'un thème, du plus court au plus long. */
export function motsDuTheme(cle: string): MotIllustre[] {
  return MOTS_ILLUSTRES.filter((m) => m.theme === cle);
}

/** L'URL du pictogramme ARASAAC, dans la taille demandée. */
export function urlPictogramme(picto: number, taille: 300 | 500 = 300): string {
  return `https://static.arasaac.org/pictograms/${picto}/${picto}_${taille}.png`;
}
