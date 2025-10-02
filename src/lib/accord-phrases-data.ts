/**
 * Données pour l'exercice "Le chemin des accords"
 * 300 tableaux avec accords dans le GN et sujet-verbe
 * Le chemin correct zigzague de manière imprévisible entre les lignes
 */

export interface AccordPhrase {
  id: number;
  level: 'B' | 'C';
  row1: string[]; // Ligne du haut (mélange de mots corrects et incorrects)
  row2: string[]; // Ligne du bas (mélange de mots corrects et incorrects)
  correctPath: number[]; // Chemin correct (0 = ligne du haut, 1 = ligne du bas)
}

export const accordPhrases: AccordPhrase[] = [
  // NIVEAU B (1-150) : Phrases simples, 5-8 mots, 1 verbe
  // 1-50: Accords sujet-verbe au présent
  // Phrase correcte: "Le musicien joue des mélodies."
  { id: 1, level: 'B', row1: ['La', 'musicien', 'jouent', 'des', 'mélodie.'], row2: ['Le', 'musicienne', 'joue', 'une', 'mélodies.'], correctPath: [1, 0, 1, 0, 1] },
  // Phrase correcte: "Les chats adorent les croquettes."
  { id: 2, level: 'B', row1: ['Les', 'chat', 'adorent', 'les', 'croquette.'], row2: ['Le', 'chats', 'adore', 'la', 'croquettes.'], correctPath: [0, 1, 0, 0, 1] },
  // Phrase correcte: "Les enfants cherchent son stylo."
  { id: 3, level: 'B', row1: ['Les', 'fillette', 'cherchent', 'leurs', 'stylo.'], row2: ['La', 'enfants', 'cherche', 'son', 'crayon.'], correctPath: [0, 1, 0, 1, 0] },
  // Phrase correcte: "Mes amis partent chez leurs cousins."
  { id: 4, level: 'B', row1: ['Mon', 'amis', 'parte', 'chez', 'leur', 'cousins.'], row2: ['Mes', 'ami', 'partent', 'de', 'leurs', 'cousin.'], correctPath: [1, 0, 1, 0, 1, 0] },
  // Phrase correcte: "La petite fille mange une pomme."
  { id: 5, level: 'B', row1: ['Les', 'petites', 'fille', 'mange', 'un', 'pommes.'], row2: ['La', 'petit', 'filles', 'mangent', 'une', 'pomme.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les oiseaux chantent dans les arbres."
  { id: 6, level: 'B', row1: ['Les', 'oiseau', 'chantent', 'dans', 'le', 'arbre.'], row2: ['Le', 'oiseaux', 'chante', 'dans', 'les', 'arbres.'], correctPath: [0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Mon chien aboie contre le facteur."
  { id: 7, level: 'B', row1: ['Mes', 'chien', 'aboie', 'contre', 'les', 'facteur.'], row2: ['Mon', 'chiens', 'aboie', 'contre', 'le', 'facteur.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les élèves écoutent la maîtresse."
  { id: 8, level: 'B', row1: ['Le', 'élève', 'écoutent', 'les', 'maîtresses.'], row2: ['Les', 'élèves', 'écoute', 'la', 'maîtresse.'], correctPath: [1, 1, 0, 1, 1] },
  // Phrase correcte: "Ta sœur dessine un beau château."
  { id: 9, level: 'B', row1: ['Ta', 'sœurs', 'dessine', 'des', 'beau', 'château.'], row2: ['Tes', 'sœur', 'dessine', 'un', 'beaux', 'château.'], correctPath: [0, 1, 0, 1, 0, 0] },
  // Phrase correcte: "Les fleurs poussent dans le jardin."
  { id: 10, level: 'B', row1: ['Les', 'fleur', 'poussent', 'dans', 'les', 'jardins.'], row2: ['La', 'fleurs', 'pousse', 'dans', 'le', 'jardin.'], correctPath: [0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Notre professeur explique la leçon."
  { id: 11, level: 'B', row1: ['Nos', 'professeur', 'explique', 'les', 'leçon.'], row2: ['Notre', 'professeurs', 'explique', 'la', 'leçon.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les voitures roulent sur l'autoroute."
  { id: 12, level: 'B', row1: ['La', 'voitures', 'roulent', 'sur', "l'autoroute."], row2: ['Les', 'voiture', 'roule', 'sur', 'les', 'autoroutes.'], correctPath: [1, 1, 0, 0, 0] },
  // Phrase correcte: "Ton frère construit une cabane."
  { id: 13, level: 'B', row1: ['Tes', 'frère', 'construit', 'des', 'cabane.'], row2: ['Ton', 'frères', 'construit', 'une', 'cabane.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les abeilles butinent les fleurs."
  { id: 14, level: 'B', row1: ['Les', 'abeille', 'butinent', 'la', 'fleur.'], row2: ['Le', 'abeilles', 'butine', 'les', 'fleurs.'], correctPath: [0, 1, 0, 1, 1] },
  // Phrase correcte: "Ma mère prépare le repas."
  { id: 15, level: 'B', row1: ['Mes', 'mère', 'prépare', 'les', 'repas.'], row2: ['Ma', 'mères', 'prépare', 'le', 'repas.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les pirates cherchent un trésor."
  { id: 16, level: 'B', row1: ['Le', 'pirates', 'cherchent', 'des', 'trésors.'], row2: ['Les', 'pirate', 'cherche', 'un', 'trésor.'], correctPath: [1, 1, 0, 1, 1] },
  // Phrase correcte: "Sa cousine joue du piano."
  { id: 17, level: 'B', row1: ['Ses', 'cousine', 'joue', 'de', 'la', 'pianos.'], row2: ['Sa', 'cousines', 'joue', 'du', 'piano.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les poissons nagent dans l'aquarium."
  { id: 18, level: 'B', row1: ['Les', 'poisson', 'nagent', 'dans', 'les', 'aquariums.'], row2: ['Le', 'poissons', 'nage', 'dans', "l'aquarium."], correctPath: [0, 1, 0, 0, 1] },
  // Phrase correcte: "Leur père répare la voiture."
  { id: 19, level: 'B', row1: ['Leurs', 'pères', 'répare', 'les', 'voiture.'], row2: ['Leur', 'père', 'répare', 'la', 'voiture.'], correctPath: [1, 1, 0, 1, 1] },
  // Phrase correcte: "Les lions rugissent dans la savane."
  { id: 20, level: 'B', row1: ['Le', 'lions', 'rugissent', 'dans', 'les', 'savanes.'], row2: ['Les', 'lion', 'rugit', 'dans', 'la', 'savane.'], correctPath: [1, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Cette dame travaille à l'hôpital."
  { id: 21, level: 'B', row1: ['Ces', 'dame', 'travaille', 'aux', 'hôpitaux.'], row2: ['Cette', 'dames', 'travaille', 'à', "l'hôpital."], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les papillons volent dans le ciel."
  { id: 22, level: 'B', row1: ['Les', 'papillon', 'volent', 'dans', 'les', 'ciels.'], row2: ['Le', 'papillons', 'vole', 'dans', 'le', 'ciel.'], correctPath: [0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Mon voisin tond sa pelouse."
  { id: 23, level: 'B', row1: ['Mon', 'voisins', 'tond', 'ses', 'pelouse.'], row2: ['Mes', 'voisin', 'tond', 'sa', 'pelouse.'], correctPath: [0, 1, 0, 1, 1] },
  // Phrase correcte: "Les bébés dorment dans leur lit."
  { id: 24, level: 'B', row1: ['Le', 'bébés', 'dorment', 'dans', 'leurs', 'lits.'], row2: ['Les', 'bébé', 'dors', 'dans', 'leur', 'lit.'], correctPath: [1, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Votre chat grimpe aux arbres."
  { id: 25, level: 'B', row1: ['Vos', 'chat', 'grimpe', 'au', 'arbre.'], row2: ['Votre', 'chats', 'grimpe', 'aux', 'arbres.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les dragons crachent du feu."
  { id: 26, level: 'B', row1: ['Le', 'dragons', 'crachent', 'des', 'feux.'], row2: ['Les', 'dragon', 'crache', 'du', 'feu.'], correctPath: [1, 1, 0, 1, 1] },
  // Phrase correcte: "Son ami collectionne les timbres."
  { id: 27, level: 'B', row1: ['Ses', 'ami', 'collectionne', 'le', 'timbre.'], row2: ['Son', 'amis', 'collectionne', 'les', 'timbres.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les dauphins sautent hors de l'eau."
  { id: 28, level: 'B', row1: ['Les', 'dauphin', 'sautent', 'hors', 'des', 'eaux.'], row2: ['Le', 'dauphins', 'saute', 'hors', 'de', "l'eau."], correctPath: [0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Cette chanteuse interprète une chanson."
  { id: 29, level: 'B', row1: ['Ces', 'chanteuses', 'interprète', 'des', 'chanson.'], row2: ['Cette', 'chanteuse', 'interprète', 'une', 'chanson.'], correctPath: [1, 1, 0, 1, 1] },
  // Phrase correcte: "Les clowns amusent les enfants."
  { id: 30, level: 'B', row1: ['Le', 'clowns', 'amusent', 'le', 'enfant.'], row2: ['Les', 'clown', 'amuse', 'les', 'enfants.'], correctPath: [1, 1, 0, 1, 1] },
  // Phrase correcte: "Leur grand-mère tricote une écharpe."
  { id: 31, level: 'B', row1: ['Leurs', 'grand-mère', 'tricote', 'des', 'écharpe.'], row2: ['Leur', 'grand-mères', 'tricote', 'une', 'écharpe.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les pingouins marchent sur la glace."
  { id: 32, level: 'B', row1: ['Les', 'pingouin', 'marchent', 'sur', 'les', 'glaces.'], row2: ['Le', 'pingouins', 'marche', 'sur', 'la', 'glace.'], correctPath: [0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Ma copine lit un livre passionnant."
  { id: 33, level: 'B', row1: ['Mes', 'copine', 'lit', 'des', 'livre', 'passionnant.'], row2: ['Ma', 'copines', 'lit', 'un', 'livre', 'passionnant.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Les loups hurlent à la lune."
  { id: 34, level: 'B', row1: ['Le', 'loups', 'hurlent', 'aux', 'lunes.'], row2: ['Les', 'loup', 'hurle', 'à', 'la', 'lune.'], correctPath: [1, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Ton oncle conduit un camion."
  { id: 35, level: 'B', row1: ['Ton', 'oncles', 'conduit', 'des', 'camion.'], row2: ['Tes', 'oncle', 'conduit', 'un', 'camion.'], correctPath: [0, 1, 0, 1, 1] },
  // Phrase correcte: "Les sorcières préparent une potion."
  { id: 36, level: 'B', row1: ['La', 'sorcières', 'préparent', 'des', 'potions.'], row2: ['Les', 'sorcière', 'prépare', 'une', 'potion.'], correctPath: [1, 1, 0, 1, 1] },
  // Phrase correcte: "Notre équipe remporte le match."
  { id: 37, level: 'B', row1: ['Nos', 'équipe', 'remporte', 'les', 'matchs.'], row2: ['Notre', 'équipes', 'remporte', 'le', 'match.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les tortues avancent très lentement."
  { id: 38, level: 'B', row1: ['Les', 'tortue', 'avancent', 'très', 'lentement.'], row2: ['La', 'tortues', 'avance', 'très', 'lentement.'], correctPath: [0, 1, 0, 0, 0] },
  // Phrase correcte: "Sa tante cuisine des crêpes."
  { id: 39, level: 'B', row1: ['Ses', 'tante', 'cuisine', 'de', 'la', 'crêpe.'], row2: ['Sa', 'tantes', 'cuisine', 'des', 'crêpes.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les étoiles brillent la nuit."
  { id: 40, level: 'B', row1: ['Le', 'étoiles', 'brillent', 'les', 'nuits.'], row2: ['Les', 'étoile', 'brille', 'la', 'nuit.'], correctPath: [1, 1, 0, 1, 1] },
  // Phrase correcte: "Mon cousin adore le chocolat."
  { id: 41, level: 'B', row1: ['Mon', 'cousins', 'adore', 'les', 'chocolat.'], row2: ['Mes', 'cousin', 'adore', 'le', 'chocolat.'], correctPath: [0, 1, 0, 1, 1] },
  // Phrase correcte: "Les chevaux galopent dans le pré."
  { id: 42, level: 'B', row1: ['Les', 'cheval', 'galopent', 'dans', 'les', 'prés.'], row2: ['Le', 'chevaux', 'galope', 'dans', 'le', 'pré.'], correctPath: [0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Votre fille apprend ses leçons."
  { id: 43, level: 'B', row1: ['Vos', 'fille', 'apprend', 'son', 'leçon.'], row2: ['Votre', 'filles', 'apprend', 'ses', 'leçons.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les robots obéissent aux ordres."
  { id: 44, level: 'B', row1: ['Le', 'robots', 'obéissent', 'à', "l'ordre."], row2: ['Les', 'robot', 'obéit', 'aux', 'ordres.'], correctPath: [1, 1, 0, 1, 1] },
  // Phrase correcte: "Leur ami raconte une histoire."
  { id: 45, level: 'B', row1: ['Leurs', 'ami', 'raconte', 'des', 'histoire.'], row2: ['Leur', 'amis', 'raconte', 'une', 'histoire.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les fourmis transportent des miettes."
  { id: 46, level: 'B', row1: ['Les', 'fourmi', 'transportent', 'de', 'la', 'miette.'], row2: ['La', 'fourmis', 'transporte', 'des', 'miettes.'], correctPath: [0, 1, 0, 1, 1] },
  // Phrase correcte: "Cette histoire plaît aux enfants."
  { id: 47, level: 'B', row1: ['Ces', 'histoire', 'plaît', 'au', 'enfant.'], row2: ['Cette', 'histoires', 'plaît', 'aux', 'enfants.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les baleines plongent dans l'océan."
  { id: 48, level: 'B', row1: ['Les', 'baleine', 'plongent', 'dans', 'les', 'océans.'], row2: ['La', 'baleines', 'plonge', 'dans', "l'océan."], correctPath: [0, 1, 0, 0, 1] },
  // Phrase correcte: "Ton camarade range ses affaires."
  { id: 49, level: 'B', row1: ['Tes', 'camarade', 'range', 'son', 'affaire.'], row2: ['Ton', 'camarades', 'range', 'ses', 'affaires.'], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Les grenouilles coassent près de l'étang."
  { id: 50, level: 'B', row1: ['Les', 'grenouille', 'coassent', 'près', 'des', 'étangs.'], row2: ['La', 'grenouilles', 'coasse', 'près', 'de', "l'étang."], correctPath: [0, 1, 0, 0, 1, 1] },

  // 51-100: Accords dans le GN (adjectifs, déterminants)
  // Phrase correcte: "Les grandes maisons sont blanches."
  { id: 51, level: 'B', row1: ['Le', 'grandes', 'maisons', 'sont', 'blanche.'], row2: ['Les', 'grand', 'maison', 'est', 'blanches.'], correctPath: [1, 0, 0, 0, 1] },
  // Phrase correcte: "Un petit garçon court vite."
  { id: 52, level: 'B', row1: ['Des', 'petit', 'garçon', 'court', 'vite.'], row2: ['Un', 'petits', 'garçons', 'court', 'vite.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Mes nouvelles chaussures sont rouges."
  { id: 53, level: 'B', row1: ['Mes', 'nouvelle', 'chaussures', 'est', 'rouges.'], row2: ['Ma', 'nouvelles', 'chaussure', 'sont', 'rouge.'], correctPath: [0, 1, 0, 1, 0] },
  // Phrase correcte: "Les gentils animaux mangent l'herbe."
  { id: 54, level: 'B', row1: ['Les', 'gentil', 'animaux', 'mange', 'les', 'herbes.'], row2: ['Le', 'gentils', 'animal', 'mangent', "l'herbe."], correctPath: [0, 1, 0, 1, 1] },
  // Phrase correcte: "Une jolie fleur pousse ici."
  { id: 55, level: 'B', row1: ['Une', 'jolies', 'fleurs', 'pousse', 'ici.'], row2: ['Des', 'jolie', 'fleur', 'pousse', 'ici.'], correctPath: [0, 1, 1, 0, 0] },
  // Phrase correcte: "Les vieux livres restent fermés."
  { id: 56, level: 'B', row1: ['Le', 'vieux', 'livres', 'restent', 'fermé.'], row2: ['Les', 'vieil', 'livre', 'reste', 'fermés.'], correctPath: [1, 0, 0, 0, 1] },
  // Phrase correcte: "Ton meilleur ami arrive demain."
  { id: 57, level: 'B', row1: ['Ton', 'meilleurs', 'amis', 'arrive', 'demain.'], row2: ['Tes', 'meilleur', 'ami', 'arrive', 'demain.'], correctPath: [0, 1, 1, 0, 0] },
  // Phrase correcte: "Les hautes montagnes touchent le ciel."
  { id: 58, level: 'B', row1: ['Les', 'haute', 'montagnes', 'touche', 'les', 'ciels.'], row2: ['La', 'hautes', 'montagne', 'touchent', 'le', 'ciel.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Ma petite sœur pleure souvent."
  { id: 59, level: 'B', row1: ['Mes', 'petite', 'sœur', 'pleure', 'souvent.'], row2: ['Ma', 'petites', 'sœurs', 'pleure', 'souvent.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les beaux jardins fleurissent au printemps."
  { id: 60, level: 'B', row1: ['Le', 'beaux', 'jardins', 'fleurissent', 'aux', 'printemps.'], row2: ['Les', 'beau', 'jardin', 'fleurit', 'au', 'printemps.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Un gros nuage cache le soleil."
  { id: 61, level: 'B', row1: ['Un', 'gros', 'nuages', 'cache', 'les', 'soleils.'], row2: ['Des', 'gros', 'nuage', 'cache', 'le', 'soleil.'], correctPath: [0, 0, 1, 0, 1, 1] },
  // Phrase correcte: "Les longs cheveux brillent au soleil."
  { id: 62, level: 'B', row1: ['Les', 'long', 'cheveux', 'brille', 'aux', 'soleils.'], row2: ['Le', 'longs', 'cheveu', 'brillent', 'au', 'soleil.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Votre nouveau vélo roule bien."
  { id: 63, level: 'B', row1: ['Vos', 'nouveau', 'vélo', 'roule', 'bien.'], row2: ['Votre', 'nouveaux', 'vélos', 'roule', 'bien.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les jeunes filles dansent ensemble."
  { id: 64, level: 'B', row1: ['Les', 'jeune', 'filles', 'danse', 'ensemble.'], row2: ['La', 'jeunes', 'fille', 'dansent', 'ensemble.'], correctPath: [0, 1, 0, 1, 0] },
  // Phrase correcte: "Son grand frère joue dehors."
  { id: 65, level: 'B', row1: ['Ses', 'grand', 'frère', 'joue', 'dehors.'], row2: ['Son', 'grands', 'frères', 'joue', 'dehors.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les belles histoires finissent bien."
  { id: 66, level: 'B', row1: ['La', 'belles', 'histoires', 'finissent', 'bien.'], row2: ['Les', 'belle', 'histoire', 'finis', 'bien.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Leur vieille voiture démarre mal."
  { id: 67, level: 'B', row1: ['Leurs', 'vieille', 'voiture', 'démarre', 'mal.'], row2: ['Leur', 'vieilles', 'voitures', 'démarre', 'mal.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les bonnes notes réjouissent les parents."
  { id: 68, level: 'B', row1: ['Les', 'bonne', 'notes', 'réjouit', 'le', 'parent.'], row2: ['La', 'bonnes', 'note', 'réjouissent', 'les', 'parents.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Cette grande tour domine la ville."
  { id: 69, level: 'B', row1: ['Ces', 'grande', 'tour', 'domine', 'les', 'villes.'], row2: ['Cette', 'grandes', 'tours', 'domine', 'la', 'ville.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les petites souris grignotent le fromage."
  { id: 70, level: 'B', row1: ['Les', 'petite', 'souris', 'grignote', 'les', 'fromages.'], row2: ['La', 'petites', 'souris', 'grignotent', 'le', 'fromage.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Mon cher papa travaille beaucoup."
  { id: 71, level: 'B', row1: ['Mon', 'chers', 'papas', 'travaille', 'beaucoup.'], row2: ['Mes', 'cher', 'papa', 'travaille', 'beaucoup.'], correctPath: [0, 1, 1, 0, 0] },
  // Phrase correcte: "Les fortes pluies inondent les rues."
  { id: 72, level: 'B', row1: ['La', 'fortes', 'pluies', 'inondent', 'la', 'rue.'], row2: ['Les', 'forte', 'pluie', 'inonde', 'les', 'rues.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Ta jolie robe brille magnifiquement."
  { id: 73, level: 'B', row1: ['Tes', 'jolie', 'robe', 'brille', 'magnifiquement.'], row2: ['Ta', 'jolies', 'robes', 'brille', 'magnifiquement.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les derniers jours passent rapidement."
  { id: 74, level: 'B', row1: ['Les', 'dernier', 'jours', 'passe', 'rapidement.'], row2: ['Le', 'derniers', 'jour', 'passent', 'rapidement.'], correctPath: [0, 1, 0, 1, 0] },
  // Phrase correcte: "Notre cher ami part en voyage."
  { id: 75, level: 'B', row1: ['Nos', 'cher', 'ami', 'part', 'en', 'voyages.'], row2: ['Notre', 'chers', 'amis', 'part', 'en', 'voyage.'], correctPath: [1, 0, 0, 0, 0, 1] },
  // Phrase correcte: "Les premiers fruits mûrissent en été."
  { id: 76, level: 'B', row1: ['Le', 'premiers', 'fruits', 'mûrit', 'en', 'étés.'], row2: ['Les', 'premier', 'fruit', 'mûrissent', 'en', 'été.'], correctPath: [1, 0, 0, 1, 0, 1] },
  // Phrase correcte: "Sa douce voix charme l'audience."
  { id: 77, level: 'B', row1: ['Ses', 'douce', 'voix', 'charme', 'les', 'audiences.'], row2: ['Sa', 'douces', 'voix', 'charme', "l'audience."], correctPath: [1, 0, 0, 0, 1] },
  // Phrase correcte: "Les mauvaises herbes envahissent le jardin."
  { id: 78, level: 'B', row1: ['Les', 'mauvaise', 'herbes', 'envahit', 'les', 'jardins.'], row2: ['La', 'mauvaises', 'herbe', 'envahissent', 'le', 'jardin.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Ton fidèle compagnon reste près de toi."
  { id: 79, level: 'B', row1: ['Ton', 'fidèles', 'compagnons', 'reste', 'près', 'de', 'toi.'], row2: ['Tes', 'fidèle', 'compagnon', 'reste', 'près', 'de', 'toi.'], correctPath: [0, 1, 1, 0, 0, 0, 0] },
  // Phrase correcte: "Les brillantes étoiles scintillent toujours."
  { id: 80, level: 'B', row1: ['La', 'brillantes', 'étoiles', 'scintillent', 'toujours.'], row2: ['Les', 'brillante', 'étoile', 'scintille', 'toujours.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Mon brave chien défend la maison."
  { id: 81, level: 'B', row1: ['Mes', 'brave', 'chien', 'défend', 'les', 'maisons.'], row2: ['Mon', 'braves', 'chiens', 'défend', 'la', 'maison.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les froids hivers glacent les lacs."
  { id: 82, level: 'B', row1: ['Les', 'froid', 'hivers', 'glace', 'le', 'lac.'], row2: ['Le', 'froids', 'hiver', 'glacent', 'les', 'lacs.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Votre sage décision plaît à tous."
  { id: 83, level: 'B', row1: ['Vos', 'sage', 'décision', 'plaît', 'à', 'tous.'], row2: ['Votre', 'sages', 'décisions', 'plaît', 'à', 'tous.'], correctPath: [1, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Les drôles de clowns font rire."
  { id: 84, level: 'B', row1: ['Le', 'drôles', 'de', 'clowns', 'font', 'rire.'], row2: ['Les', 'drôle', 'de', 'clown', 'fait', 'rire.'], correctPath: [1, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Leur importante réunion commence bientôt."
  { id: 85, level: 'B', row1: ['Leurs', 'importante', 'réunion', 'commence', 'bientôt.'], row2: ['Leur', 'importantes', 'réunions', 'commence', 'bientôt.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les légères plumes volent au vent."
  { id: 86, level: 'B', row1: ['Les', 'légère', 'plumes', 'vole', 'aux', 'vents.'], row2: ['La', 'légères', 'plume', 'volent', 'au', 'vent.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Cette étrange créature apparaît la nuit."
  { id: 87, level: 'B', row1: ['Ces', 'étrange', 'créature', 'apparaît', 'les', 'nuits.'], row2: ['Cette', 'étranges', 'créatures', 'apparaît', 'la', 'nuit.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les plates surfaces réfléchissent la lumière."
  { id: 88, level: 'B', row1: ['Les', 'plate', 'surfaces', 'réfléchit', 'les', 'lumières.'], row2: ['La', 'plates', 'surface', 'réfléchissent', 'la', 'lumière.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Ton seul espoir reste vivant."
  { id: 89, level: 'B', row1: ['Tes', 'seul', 'espoir', 'reste', 'vivant.'], row2: ['Ton', 'seuls', 'espoirs', 'reste', 'vivant.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les verts pâturages nourrissent les vaches."
  { id: 90, level: 'B', row1: ['Le', 'verts', 'pâturages', 'nourrit', 'la', 'vache.'], row2: ['Les', 'vert', 'pâturage', 'nourrissent', 'les', 'vaches.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Ma préférée chanson passe souvent."
  { id: 91, level: 'B', row1: ['Ma', 'préférées', 'chansons', 'passe', 'souvent.'], row2: ['Mes', 'préférée', 'chanson', 'passe', 'souvent.'], correctPath: [0, 1, 1, 0, 0] },
  // Phrase correcte: "Les lourds colis arrivent demain."
  { id: 92, level: 'B', row1: ['Les', 'lourd', 'colis', 'arrive', 'demain.'], row2: ['Le', 'lourds', 'colis', 'arrivent', 'demain.'], correctPath: [0, 1, 0, 1, 0] },
  // Phrase correcte: "Son unique talent impressionne tout le monde."
  { id: 93, level: 'B', row1: ['Ses', 'unique', 'talent', 'impressionne', 'tout', 'le', 'monde.'], row2: ['Son', 'uniques', 'talents', 'impressionne', 'tout', 'le', 'monde.'], correctPath: [1, 0, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Les courts chemins mènent au village."
  { id: 94, level: 'B', row1: ['Le', 'courts', 'chemins', 'mène', 'aux', 'villages.'], row2: ['Les', 'court', 'chemin', 'mènent', 'au', 'village.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Leur prochaine aventure commence ici."
  { id: 95, level: 'B', row1: ['Leurs', 'prochaine', 'aventure', 'commence', 'ici.'], row2: ['Leur', 'prochaines', 'aventures', 'commence', 'ici.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les rapides coureurs gagnent la course."
  { id: 96, level: 'B', row1: ['Les', 'rapide', 'coureurs', 'gagne', 'les', 'courses.'], row2: ['Le', 'rapides', 'coureur', 'gagnent', 'la', 'course.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Notre ancienne école ferme ses portes."
  { id: 97, level: 'B', row1: ['Nos', 'ancienne', 'école', 'ferme', 'son', 'porte.'], row2: ['Notre', 'anciennes', 'écoles', 'ferme', 'ses', 'portes.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les molles couvertures réchauffent les enfants."
  { id: 98, level: 'B', row1: ['La', 'molles', 'couvertures', 'réchauffe', 'le', 'enfant.'], row2: ['Les', 'molle', 'couverture', 'réchauffent', 'les', 'enfants.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Sa vraie nature apparaît enfin."
  { id: 99, level: 'B', row1: ['Ses', 'vraie', 'nature', 'apparaît', 'enfin.'], row2: ['Sa', 'vraies', 'natures', 'apparaît', 'enfin.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les dures épreuves renforcent le caractère."
  { id: 100, level: 'B', row1: ['Les', 'dure', 'épreuves', 'renforce', 'les', 'caractères.'], row2: ['La', 'dures', 'épreuve', 'renforcent', 'le', 'caractère.'], correctPath: [0, 1, 0, 1, 1, 1] },

  // 101-150: Mélange accords GN + sujet-verbe
  // Phrase correcte: "Les petits oiseaux chantent doucement."
  { id: 101, level: 'B', row1: ['Le', 'petits', 'oiseaux', 'chante', 'doucement.'], row2: ['Les', 'petit', 'oiseau', 'chantent', 'doucement.'], correctPath: [1, 0, 0, 1, 0] },
  // Phrase correcte: "Ma grande sœur étudie beaucoup."
  { id: 102, level: 'B', row1: ['Ma', 'grandes', 'sœurs', 'étudie', 'beaucoup.'], row2: ['Mes', 'grande', 'sœur', 'étudie', 'beaucoup.'], correctPath: [0, 1, 1, 0, 0] },
  // Phrase correcte: "Les gentilles dames aident les pauvres."
  { id: 103, level: 'B', row1: ['Les', 'gentille', 'dames', 'aide', 'le', 'pauvre.'], row2: ['La', 'gentilles', 'dame', 'aident', 'les', 'pauvres.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Ton nouveau jouet fonctionne bien."
  { id: 104, level: 'B', row1: ['Tes', 'nouveau', 'jouet', 'fonctionne', 'bien.'], row2: ['Ton', 'nouveaux', 'jouets', 'fonctionne', 'bien.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les hauts immeubles dominent la ville."
  { id: 105, level: 'B', row1: ['Le', 'hauts', 'immeubles', 'domine', 'les', 'villes.'], row2: ['Les', 'haut', 'immeuble', 'dominent', 'la', 'ville.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Votre jeune enfant grandit vite."
  { id: 106, level: 'B', row1: ['Vos', 'jeune', 'enfant', 'grandit', 'vite.'], row2: ['Votre', 'jeunes', 'enfants', 'grandit', 'vite.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les bons élèves réussissent toujours."
  { id: 107, level: 'B', row1: ['Les', 'bon', 'élèves', 'réussit', 'toujours.'], row2: ['Le', 'bons', 'élève', 'réussissent', 'toujours.'], correctPath: [0, 1, 0, 1, 0] },
  // Phrase correcte: "Leur vieille maison tombe en ruine."
  { id: 108, level: 'B', row1: ['Leurs', 'vieille', 'maison', 'tombe', 'en', 'ruines.'], row2: ['Leur', 'vieilles', 'maisons', 'tombe', 'en', 'ruine.'], correctPath: [1, 0, 0, 0, 0, 1] },
  // Phrase correcte: "Les rares moments passent trop vite."
  { id: 109, level: 'B', row1: ['Le', 'rares', 'moments', 'passe', 'trop', 'vite.'], row2: ['Les', 'rare', 'moment', 'passent', 'trop', 'vite.'], correctPath: [1, 0, 0, 1, 0, 0] },
  // Phrase correcte: "Cette belle journée finit bien."
  { id: 110, level: 'B', row1: ['Ces', 'belle', 'journée', 'finit', 'bien.'], row2: ['Cette', 'belles', 'journées', 'finit', 'bien.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les fous rires éclatent partout."
  { id: 111, level: 'B', row1: ['Les', 'fou', 'rires', 'éclate', 'partout.'], row2: ['Le', 'fous', 'rire', 'éclatent', 'partout.'], correctPath: [0, 1, 0, 1, 0] },
  // Phrase correcte: "Son long voyage commence maintenant."
  { id: 112, level: 'B', row1: ['Ses', 'long', 'voyage', 'commence', 'maintenant.'], row2: ['Son', 'longs', 'voyages', 'commence', 'maintenant.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les profondes mers cachent des secrets."
  { id: 113, level: 'B', row1: ['La', 'profondes', 'mers', 'cache', 'de', 'secret.'], row2: ['Les', 'profonde', 'mer', 'cachent', 'des', 'secrets.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Mon cher ami arrive demain."
  { id: 114, level: 'B', row1: ['Mon', 'chers', 'amis', 'arrive', 'demain.'], row2: ['Mes', 'cher', 'ami', 'arrive', 'demain.'], correctPath: [0, 1, 1, 0, 0] },
  // Phrase correcte: "Les douces mélodies bercent les bébés."
  { id: 115, level: 'B', row1: ['Les', 'douce', 'mélodies', 'berce', 'le', 'bébé.'], row2: ['La', 'douces', 'mélodie', 'bercent', 'les', 'bébés.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Ta seule chance reste intacte."
  { id: 116, level: 'B', row1: ['Tes', 'seule', 'chance', 'reste', 'intacte.'], row2: ['Ta', 'seules', 'chances', 'reste', 'intacte.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les forts vents secouent les arbres."
  { id: 117, level: 'B', row1: ['Le', 'forts', 'vents', 'secoue', "l'arbre."], row2: ['Les', 'fort', 'vent', 'secouent', 'les', 'arbres.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Notre petite chatte dort tranquillement."
  { id: 118, level: 'B', row1: ['Nos', 'petite', 'chatte', 'dort', 'tranquillement.'], row2: ['Notre', 'petites', 'chattes', 'dort', 'tranquillement.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les sombres forêts abritent des animaux."
  { id: 119, level: 'B', row1: ['Les', 'sombre', 'forêts', 'abrite', 'un', 'animal.'], row2: ['La', 'sombres', 'forêt', 'abritent', 'des', 'animaux.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Sa dernière tentative réussit enfin."
  { id: 120, level: 'B', row1: ['Ses', 'dernière', 'tentative', 'réussit', 'enfin.'], row2: ['Sa', 'dernières', 'tentatives', 'réussit', 'enfin.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les gros camions transportent des marchandises."
  { id: 121, level: 'B', row1: ['Le', 'gros', 'camions', 'transporte', 'de', 'la', 'marchandise.'], row2: ['Les', 'gros', 'camion', 'transportent', 'des', 'marchandises.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Leur nouvelle idée plaît beaucoup."
  { id: 122, level: 'B', row1: ['Leurs', 'nouvelle', 'idée', 'plaît', 'beaucoup.'], row2: ['Leur', 'nouvelles', 'idées', 'plaît', 'beaucoup.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les fraîches salades accompagnent le repas."
  { id: 123, level: 'B', row1: ['Les', 'fraîche', 'salades', 'accompagne', 'les', 'repas.'], row2: ['La', 'fraîches', 'salade', 'accompagnent', 'le', 'repas.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Mon vieux pull tient chaud."
  { id: 124, level: 'B', row1: ['Mes', 'vieux', 'pulls', 'tient', 'chaud.'], row2: ['Mon', 'vieux', 'pull', 'tient', 'chaud.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les premières neiges tombent en novembre."
  { id: 125, level: 'B', row1: ['La', 'premières', 'neiges', 'tombe', 'en', 'novembres.'], row2: ['Les', 'première', 'neige', 'tombent', 'en', 'novembre.'], correctPath: [1, 0, 0, 1, 0, 1] },
  // Phrase correcte: "Votre meilleure amie reste fidèle."
  { id: 126, level: 'B', row1: ['Vos', 'meilleure', 'amie', 'reste', 'fidèle.'], row2: ['Votre', 'meilleures', 'amies', 'reste', 'fidèle.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les larges fenêtres laissent entrer la lumière."
  { id: 127, level: 'B', row1: ['La', 'larges', 'fenêtres', 'laisse', 'entrer', 'les', 'lumières.'], row2: ['Les', 'large', 'fenêtre', 'laissent', 'entrer', 'la', 'lumière.'], correctPath: [1, 0, 0, 1, 0, 1, 1] },
  // Phrase correcte: "Cette simple question demande réflexion."
  { id: 128, level: 'B', row1: ['Ces', 'simple', 'question', 'demande', 'réflexion.'], row2: ['Cette', 'simples', 'questions', 'demande', 'réflexion.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les pâles couleurs apaisent l'esprit."
  { id: 129, level: 'B', row1: ['Les', 'pâle', 'couleurs', 'apaise', 'les', 'esprits.'], row2: ['La', 'pâles', 'couleur', 'apaisent', "l'esprit."], correctPath: [0, 1, 0, 1, 1] },
  // Phrase correcte: "Son important discours marque les esprits."
  { id: 130, level: 'B', row1: ['Ses', 'important', 'discours', 'marque', "l'esprit."], row2: ['Son', 'importants', 'discours', 'marque', 'les', 'esprits.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les doux parfums embaument l'air."
  { id: 131, level: 'B', row1: ['Le', 'doux', 'parfums', 'embaume', 'les', 'airs.'], row2: ['Les', 'doux', 'parfum', 'embaument', "l'air."], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Ma chère maman prépare le dîner."
  { id: 132, level: 'B', row1: ['Mes', 'chère', 'maman', 'prépare', 'les', 'dîners.'], row2: ['Ma', 'chères', 'mamans', 'prépare', 'le', 'dîner.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les braves soldats défendent le pays."
  { id: 133, level: 'B', row1: ['Les', 'brave', 'soldats', 'défend', 'les', 'pays.'], row2: ['Le', 'braves', 'soldat', 'défendent', 'le', 'pays.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Ton étrange comportement inquiète tout le monde."
  { id: 134, level: 'B', row1: ['Ton', 'étranges', 'comportements', 'inquiète', 'tout', 'le', 'monde.'], row2: ['Tes', 'étrange', 'comportement', 'inquiète', 'tout', 'le', 'monde.'], correctPath: [0, 1, 1, 0, 0, 0, 0] },
  // Phrase correcte: "Les plates régions favorisent l'agriculture."
  { id: 135, level: 'B', row1: ['La', 'plates', 'régions', 'favorise', 'les', 'agricultures.'], row2: ['Les', 'plate', 'région', 'favorisent', "l'agriculture."], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Leur unique fille part étudier."
  { id: 136, level: 'B', row1: ['Leurs', 'unique', 'fille', 'part', 'étudier.'], row2: ['Leur', 'uniques', 'filles', 'part', 'étudier.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les sages conseils guident nos choix."
  { id: 137, level: 'B', row1: ['Le', 'sages', 'conseils', 'guide', 'notre', 'choix.'], row2: ['Les', 'sage', 'conseil', 'guident', 'nos', 'choix.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Notre commune passion nous unit."
  { id: 138, level: 'B', row1: ['Nos', 'commune', 'passion', 'nous', 'unit.'], row2: ['Notre', 'communes', 'passions', 'nous', 'unit.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les drôles d'oiseaux volent à l'envers."
  { id: 139, level: 'B', row1: ['Les', 'drôle', "d'oiseaux", 'vole', 'à', "l'envers."], row2: ['Le', 'drôles', "d'oiseau", 'volent', 'à', "l'envers."], correctPath: [0, 1, 0, 1, 0, 0] },
  // Phrase correcte: "Sa fausse excuse trompe personne."
  { id: 140, level: 'B', row1: ['Ses', 'fausse', 'excuse', 'trompe', 'personne.'], row2: ['Sa', 'fausses', 'excuses', 'trompe', 'personne.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les légères brises rafraîchissent l'atmosphère."
  { id: 141, level: 'B', row1: ['La', 'légères', 'brises', 'rafraîchit', 'les', 'atmosphères.'], row2: ['Les', 'légère', 'brise', 'rafraîchissent', "l'atmosphère."], correctPath: [1, 0, 0, 1, 1] },
  // Phrase correcte: "Mon fidèle compagnon reste toujours là."
  { id: 142, level: 'B', row1: ['Mon', 'fidèles', 'compagnons', 'reste', 'toujours', 'là.'], row2: ['Mes', 'fidèle', 'compagnon', 'reste', 'toujours', 'là.'], correctPath: [0, 1, 1, 0, 0, 0] },
  // Phrase correcte: "Les basses températures gèlent l'eau."
  { id: 143, level: 'B', row1: ['Les', 'basse', 'températures', 'gèle', 'les', 'eaux.'], row2: ['La', 'basses', 'température', 'gèlent', "l'eau."], correctPath: [0, 1, 0, 1, 1] },
  // Phrase correcte: "Votre prochaine visite nous réjouit."
  { id: 144, level: 'B', row1: ['Vos', 'prochaine', 'visite', 'nous', 'réjouit.'], row2: ['Votre', 'prochaines', 'visites', 'nous', 'réjouit.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les fines herbes parfument les plats."
  { id: 145, level: 'B', row1: ['La', 'fines', 'herbes', 'parfume', 'le', 'plat.'], row2: ['Les', 'fine', 'herbe', 'parfument', 'les', 'plats.'], correctPath: [1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Cette lointaine époque fascine les historiens."
  { id: 146, level: 'B', row1: ['Ces', 'lointaine', 'époque', 'fascine', "l'historien."], row2: ['Cette', 'lointaines', 'époques', 'fascine', 'les', 'historiens.'], correctPath: [1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les denses forêts protègent la faune."
  { id: 147, level: 'B', row1: ['Les', 'dense', 'forêts', 'protège', 'les', 'faunes.'], row2: ['La', 'denses', 'forêt', 'protègent', 'la', 'faune.'], correctPath: [0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Ton prochain anniversaire arrive bientôt."
  { id: 148, level: 'B', row1: ['Tes', 'prochain', 'anniversaire', 'arrive', 'bientôt.'], row2: ['Ton', 'prochains', 'anniversaires', 'arrive', 'bientôt.'], correctPath: [1, 0, 0, 0, 0] },
  // Phrase correcte: "Les chaudes journées fatiguent tout le monde."
  { id: 149, level: 'B', row1: ['Les', 'chaude', 'journées', 'fatigue', 'tout', 'le', 'monde.'], row2: ['La', 'chaudes', 'journée', 'fatiguent', 'tout', 'le', 'monde.'], correctPath: [0, 1, 0, 1, 0, 0, 0] },
  // Phrase correcte: "Leur grande maison accueille beaucoup d'invités."
  { id: 150, level: 'B', row1: ['Leurs', 'grande', 'maison', 'accueille', 'beaucoup', "d'invité."], row2: ['Leur', 'grandes', 'maisons', 'accueille', 'beaucoup', "d'invités."], correctPath: [1, 0, 0, 0, 0, 1] },

  // NIVEAU C (151-300) : Phrases complexes, 8-12 mots, 2 verbes
  // 151-200: Phrases avec propositions relatives
  // Phrase correcte: "Les enfants qui jouent dehors rentrent à cinq heures."
  { id: 151, level: 'C', row1: ['Le', 'enfants', 'qui', 'jouent', 'dehors', 'rentre', 'à', 'cinq', 'heures.'], row2: ['Les', 'enfant', 'qui', 'joue', 'dehors', 'rentrent', 'à', 'cinq', 'heure.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 0, 0] },
  // Phrase correcte: "Ma sœur qui habite Paris viendra nous voir demain."
  { id: 152, level: 'C', row1: ['Ma', 'sœurs', 'qui', 'habite', 'Paris', 'viendra', 'nous', 'voir', 'demain.'], row2: ['Mes', 'sœur', 'qui', 'habite', 'Paris', 'viendra', 'nous', 'voir', 'demain.'], correctPath: [0, 1, 0, 0, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Les oiseaux qui chantent le matin réveillent tout le quartier."
  { id: 153, level: 'C', row1: ['Les', 'oiseau', 'qui', 'chante', 'le', 'matin', 'réveillent', 'tout', 'le', 'quartier.'], row2: ['Le', 'oiseaux', 'qui', 'chantent', 'le', 'matin', 'réveille', 'tout', 'le', 'quartier.'], correctPath: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Le chat qui dort sur le canapé appartient à mon voisin."
  { id: 154, level: 'C', row1: ['Les', 'chat', 'qui', 'dort', 'sur', 'le', 'canapé', 'appartient', 'à', 'mon', 'voisin.'], row2: ['Le', 'chats', 'qui', 'dort', 'sur', 'le', 'canapé', 'appartient', 'à', 'mon', 'voisin.'], correctPath: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Les élèves qui travaillent bien réussissent leurs examens."
  { id: 155, level: 'C', row1: ['Le', 'élèves', 'qui', 'travaille', 'bien', 'réussissent', 'leur', 'examen.'], row2: ['Les', 'élève', 'qui', 'travaillent', 'bien', 'réussit', 'leurs', 'examens.'], correctPath: [1, 0, 0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Mon frère qui aime le sport joue au football chaque samedi."
  { id: 156, level: 'C', row1: ['Mes', 'frère', 'qui', 'aime', 'le', 'sport', 'joue', 'au', 'football', 'chaque', 'samedi.'], row2: ['Mon', 'frères', 'qui', 'aime', 'le', 'sport', 'joue', 'au', 'football', 'chaque', 'samedi.'], correctPath: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Les fleurs qui poussent ici embaument tout le jardin."
  { id: 157, level: 'C', row1: ['Les', 'fleur', 'qui', 'pousse', 'ici', 'embaument', 'tout', 'le', 'jardin.'], row2: ['La', 'fleurs', 'qui', 'poussent', 'ici', 'embaume', 'tout', 'le', 'jardin.'], correctPath: [0, 1, 0, 1, 0, 0, 0, 0, 0] },
  // Phrase correcte: "La dame qui vend des fleurs sourit toujours gentiment."
  { id: 158, level: 'C', row1: ['Les', 'dame', 'qui', 'vend', 'des', 'fleur', 'sourit', 'toujours', 'gentiment.'], row2: ['La', 'dames', 'qui', 'vend', 'des', 'fleurs', 'sourit', 'toujours', 'gentiment.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 0, 0] },
  // Phrase correcte: "Les livres qui racontent des aventures passionnent les jeunes."
  { id: 159, level: 'C', row1: ['Le', 'livres', 'qui', 'raconte', 'des', 'aventure', 'passionnent', 'le', 'jeune.'], row2: ['Les', 'livre', 'qui', 'racontent', 'des', 'aventures', 'passionne', 'les', 'jeunes.'], correctPath: [1, 0, 0, 1, 0, 1, 0, 1, 1] },
  // Phrase correcte: "Mon ami qui collectionne les timbres possède des pièces rares."
  { id: 160, level: 'C', row1: ['Mon', 'amis', 'qui', 'collectionne', 'le', 'timbre', 'possède', 'de', 'la', 'pièce', 'rare.'], row2: ['Mes', 'ami', 'qui', 'collectionne', 'les', 'timbres', 'possède', 'des', 'pièces', 'rares.'], correctPath: [0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1] },
  // Phrase correcte: "Les nuages qui arrivent du nord annoncent la pluie."
  { id: 161, level: 'C', row1: ['Le', 'nuages', 'qui', 'arrive', 'du', 'nord', 'annoncent', 'les', 'pluies.'], row2: ['Les', 'nuage', 'qui', 'arrivent', 'du', 'nord', 'annonce', 'la', 'pluie.'], correctPath: [1, 0, 0, 1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "La voiture qui roule trop vite risque l'accident."
  { id: 162, level: 'C', row1: ['Les', 'voiture', 'qui', 'roule', 'trop', 'vite', 'risque', 'les', 'accidents.'], row2: ['La', 'voitures', 'qui', 'roule', 'trop', 'vite', 'risque', "l'accident."], correctPath: [1, 0, 0, 0, 0, 0, 0, 1] },
  // Phrase correcte: "Les histoires qui finissent bien plaisent aux enfants."
  { id: 163, level: 'C', row1: ['Les', 'histoire', 'qui', 'finis', 'bien', 'plaisent', 'à', "l'enfant."], row2: ['Le', 'histoires', 'qui', 'finissent', 'bien', 'plaît', 'aux', 'enfants.'], correctPath: [0, 1, 0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Mon cousin qui étudie la médecine deviendra bientôt docteur."
  { id: 164, level: 'C', row1: ['Mon', 'cousins', 'qui', 'étudie', 'la', 'médecine', 'deviendra', 'bientôt', 'docteurs.'], row2: ['Mes', 'cousin', 'qui', 'étudie', 'la', 'médecine', 'deviendra', 'bientôt', 'docteur.'], correctPath: [0, 1, 0, 0, 0, 0, 0, 0, 1] },
  // Phrase correcte: "Les chiens qui aboient fort effraient les passants."
  { id: 165, level: 'C', row1: ['Le', 'chiens', 'qui', 'aboie', 'fort', 'effraient', 'le', 'passant.'], row2: ['Les', 'chien', 'qui', 'aboient', 'fort', 'effraie', 'les', 'passants.'], correctPath: [1, 0, 0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "La fillette qui porte une robe rouge danse gracieusement."
  { id: 166, level: 'C', row1: ['Les', 'fillette', 'qui', 'porte', 'des', 'robe', 'rouge', 'danse', 'gracieusement.'], row2: ['La', 'fillettes', 'qui', 'porte', 'une', 'robes', 'rouges', 'danse', 'gracieusement.'], correctPath: [1, 0, 0, 0, 1, 0, 0, 0, 0] },
  // Phrase correcte: "Les étoiles qui brillent la nuit guident les marins."
  { id: 167, level: 'C', row1: ['Les', 'étoile', 'qui', 'brille', 'les', 'nuits', 'guident', 'le', 'marin.'], row2: ['Le', 'étoiles', 'qui', 'brillent', 'la', 'nuit', 'guide', 'les', 'marins.'], correctPath: [0, 1, 0, 1, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Mon père qui travaille dur rentre tard le soir."
  { id: 168, level: 'C', row1: ['Mes', 'père', 'qui', 'travaille', 'dur', 'rentre', 'tard', 'les', 'soirs.'], row2: ['Mon', 'pères', 'qui', 'travaille', 'dur', 'rentre', 'tard', 'le', 'soir.'], correctPath: [1, 0, 0, 0, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les oiseaux qui migrent en hiver reviennent au printemps."
  { id: 169, level: 'C', row1: ['Le', 'oiseaux', 'qui', 'migre', 'en', 'hiver', 'reviennent', 'aux', 'printemps.'], row2: ['Les', 'oiseau', 'qui', 'migrent', 'en', 'hiver', 'revient', 'au', 'printemps.'], correctPath: [1, 0, 0, 1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "La maîtresse qui enseigne les maths explique très bien."
  { id: 170, level: 'C', row1: ['Les', 'maîtresse', 'qui', 'enseigne', 'la', 'math', 'explique', 'très', 'bien.'], row2: ['La', 'maîtresses', 'qui', 'enseigne', 'les', 'maths', 'explique', 'très', 'bien.'], correctPath: [1, 0, 0, 0, 1, 1, 0, 0, 0] },
  // Phrase correcte: "Les poissons qui nagent en banc échappent aux prédateurs."
  { id: 171, level: 'C', row1: ['Le', 'poissons', 'qui', 'nage', 'en', 'bancs', 'échappent', 'au', 'prédateur.'], row2: ['Les', 'poisson', 'qui', 'nagent', 'en', 'banc', 'échappe', 'aux', 'prédateurs.'], correctPath: [1, 0, 0, 1, 0, 1, 0, 1, 1] },
  // Phrase correcte: "Mon grand-père qui raconte des histoires captive son auditoire."
  { id: 172, level: 'C', row1: ['Mon', 'grand-pères', 'qui', 'raconte', 'de', "l'histoire", 'captive', 'ses', 'auditoires.'], row2: ['Mes', 'grand-père', 'qui', 'raconte', 'des', 'histoires', 'captive', 'son', 'auditoire.'], correctPath: [0, 1, 0, 0, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Les fruits qui mûrissent en été sont délicieux."
  { id: 173, level: 'C', row1: ['Le', 'fruits', 'qui', 'mûrit', 'en', 'étés', 'sont', 'délicieux.'], row2: ['Les', 'fruit', 'qui', 'mûrissent', 'en', 'été', 'est', 'délicieux.'], correctPath: [1, 0, 0, 1, 0, 1, 0, 0] },
  // Phrase correcte: "La chanteuse qui interprète cette chanson possède une belle voix."
  { id: 174, level: 'C', row1: ['La', 'chanteuses', 'qui', 'interprète', 'ces', 'chanson', 'possède', 'de', 'belles', 'voix.'], row2: ['Les', 'chanteuse', 'qui', 'interprète', 'cette', 'chansons', 'possède', 'une', 'belle', 'voix.'], correctPath: [0, 1, 0, 0, 1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Les arbres qui perdent leurs feuilles refleurissent au printemps."
  { id: 175, level: 'C', row1: ['Le', 'arbres', 'qui', 'perd', 'leur', 'feuille', 'refleurissent', 'aux', 'printemps.'], row2: ['Les', 'arbre', 'qui', 'perdent', 'leurs', 'feuilles', 'refleurit', 'au', 'printemps.'], correctPath: [1, 0, 0, 1, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Mon oncle qui conduit des camions parcourt tout le pays."
  { id: 176, level: 'C', row1: ['Mon', 'oncles', 'qui', 'conduit', 'de', 'camion', 'parcourt', 'tout', 'les', 'pays.'], row2: ['Mes', 'oncle', 'qui', 'conduit', 'des', 'camions', 'parcourt', 'tout', 'le', 'pays.'], correctPath: [0, 1, 0, 0, 1, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Les sorcières qui volent sur des balais terrifient les villages."
  { id: 177, level: 'C', row1: ['Les', 'sorcière', 'qui', 'vole', 'sur', 'un', 'balai', 'terrifient', 'le', 'village.'], row2: ['La', 'sorcières', 'qui', 'volent', 'sur', 'des', 'balais', 'terrifie', 'les', 'villages.'], correctPath: [0, 1, 0, 1, 0, 1, 1, 0, 1, 1] },
  // Phrase correcte: "La chanson qui passe à la radio plaît à tout le monde."
  { id: 178, level: 'C', row1: ['Les', 'chanson', 'qui', 'passe', 'à', 'les', 'radios', 'plaît', 'à', 'tout', 'le', 'monde.'], row2: ['La', 'chansons', 'qui', 'passe', 'à', 'la', 'radio', 'plaît', 'à', 'tout', 'le', 'monde.'], correctPath: [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Les dragons qui crachent du feu effraient les chevaliers."
  { id: 179, level: 'C', row1: ['Le', 'dragons', 'qui', 'crache', 'des', 'feux', 'effraient', 'le', 'chevalier.'], row2: ['Les', 'dragon', 'qui', 'crachent', 'du', 'feu', 'effraie', 'les', 'chevaliers.'], correctPath: [1, 0, 0, 1, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Mon amie qui adore les animaux veut devenir vétérinaire."
  { id: 180, level: 'C', row1: ['Mon', 'amies', 'qui', 'adore', 'un', 'animal', 'veut', 'devenir', 'vétérinaires.'], row2: ['Mes', 'amie', 'qui', 'adore', 'les', 'animaux', 'veut', 'devenir', 'vétérinaire.'], correctPath: [0, 1, 0, 0, 1, 1, 0, 0, 1] },
  // Phrase correcte: "Les pirates qui naviguent sur les mers cherchent des trésors."
  { id: 181, level: 'C', row1: ['Le', 'pirates', 'qui', 'navigue', 'sur', 'la', 'mer', 'cherchent', 'un', 'trésor.'], row2: ['Les', 'pirate', 'qui', 'naviguent', 'sur', 'les', 'mers', 'cherche', 'des', 'trésors.'], correctPath: [1, 0, 0, 1, 0, 1, 1, 0, 1, 1] },
  // Phrase correcte: "La rivière qui coule près du village nourrit la terre."
  { id: 182, level: 'C', row1: ['Les', 'rivière', 'qui', 'coule', 'près', 'des', 'villages', 'nourrit', 'les', 'terres.'], row2: ['La', 'rivières', 'qui', 'coule', 'près', 'du', 'village', 'nourrit', 'la', 'terre.'], correctPath: [1, 0, 0, 0, 0, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Les sportifs qui s'entraînent dur gagnent les compétitions."
  { id: 183, level: 'C', row1: ['Les', 'sportif', 'qui', "s'entraîne", 'dur', 'gagne', 'la', 'compétition.'], row2: ['Le', 'sportifs', 'qui', "s'entraînent", 'dur', 'gagnent', 'les', 'compétitions.'], correctPath: [0, 1, 0, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Mon professeur qui aime son métier inspire ses élèves."
  { id: 184, level: 'C', row1: ['Mon', 'professeurs', 'qui', 'aime', 'leur', 'métier', 'inspire', 'son', 'élève.'], row2: ['Mes', 'professeur', 'qui', 'aime', 'son', 'métier', 'inspire', 'ses', 'élèves.'], correctPath: [0, 1, 0, 0, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Les baleines qui vivent dans l'océan sont majestueuses."
  { id: 185, level: 'C', row1: ['La', 'baleines', 'qui', 'vis', 'dans', 'les', 'océans', 'sont', 'majestueux.'], row2: ['Les', 'baleine', 'qui', 'vivent', 'dans', "l'océan", 'est', 'majestueuses.'], correctPath: [1, 0, 0, 1, 0, 1, 0, 1] },
  // Phrase correcte: "La tour qui domine la ville attire les touristes."
  { id: 186, level: 'C', row1: ['Les', 'tour', 'qui', 'domine', 'les', 'villes', 'attire', 'le', 'touriste.'], row2: ['La', 'tours', 'qui', 'domine', 'la', 'ville', 'attire', 'les', 'touristes.'], correctPath: [1, 0, 0, 0, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Les dessins qui ornent les murs racontent des histoires."
  { id: 187, level: 'C', row1: ['Le', 'dessins', 'qui', 'orne', 'le', 'mur', 'racontent', 'une', 'histoire.'], row2: ['Les', 'dessin', 'qui', 'ornent', 'les', 'murs', 'raconte', 'des', 'histoires.'], correctPath: [1, 0, 0, 1, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Mon voisin qui cultive son jardin récolte de beaux légumes."
  { id: 188, level: 'C', row1: ['Mon', 'voisins', 'qui', 'cultive', 'leur', 'jardin', 'récolte', 'un', 'beau', 'légume.'], row2: ['Mes', 'voisin', 'qui', 'cultive', 'son', 'jardin', 'récolte', 'de', 'beaux', 'légumes.'], correctPath: [0, 1, 0, 0, 1, 1, 0, 1, 1, 1] },
  // Phrase correcte: "Les éclairs qui illuminent le ciel précèdent le tonnerre."
  { id: 189, level: 'C', row1: ['Les', 'éclair', 'qui', 'illumine', 'les', 'ciels', 'précèdent', 'les', 'tonnerres.'], row2: ['Le', 'éclairs', 'qui', 'illuminent', 'le', 'ciel', 'précède', 'le', 'tonnerre.'], correctPath: [0, 1, 0, 1, 1, 1, 0, 1, 1] },
  // Phrase correcte: "La lionne qui chasse dans la savane nourrit ses petits."
  { id: 190, level: 'C', row1: ['Les', 'lionne', 'qui', 'chasse', 'dans', 'les', 'savanes', 'nourrit', 'son', 'petit.'], row2: ['La', 'lionnes', 'qui', 'chasse', 'dans', 'la', 'savane', 'nourrit', 'ses', 'petits.'], correctPath: [1, 0, 0, 0, 0, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Les robots qui travaillent dans l'usine remplacent les ouvriers."
  { id: 191, level: 'C', row1: ['Le', 'robots', 'qui', 'travaille', 'dans', 'les', 'usines', 'remplacent', "l'ouvrier."], row2: ['Les', 'robot', 'qui', 'travaillent', 'dans', "l'usine", 'remplace', 'les', 'ouvriers.'], correctPath: [1, 0, 0, 1, 0, 1, 0, 1, 1] },
  // Phrase correcte: "Mon dentiste qui soigne mes dents travaille avec douceur."
  { id: 192, level: 'C', row1: ['Mon', 'dentistes', 'qui', 'soigne', 'ma', 'dent', 'travaille', 'avec', 'douceur.'], row2: ['Mes', 'dentiste', 'qui', 'soigne', 'mes', 'dents', 'travaille', 'avec', 'douceur.'], correctPath: [0, 1, 0, 0, 1, 1, 0, 0, 0] },
  // Phrase correcte: "Les papillons qui butinent les fleurs transportent le pollen."
  { id: 193, level: 'C', row1: ['Le', 'papillons', 'qui', 'butine', 'la', 'fleur', 'transportent', 'les', 'pollens.'], row2: ['Les', 'papillon', 'qui', 'butinent', 'les', 'fleurs', 'transporte', 'le', 'pollen.'], correctPath: [1, 0, 0, 1, 1, 1, 0, 1, 1] },
  // Phrase correcte: "La cloche qui sonne chaque heure rythme la journée."
  { id: 194, level: 'C', row1: ['Les', 'cloche', 'qui', 'sonne', 'chaque', 'heures', 'rythme', 'les', 'journées.'], row2: ['La', 'cloches', 'qui', 'sonne', 'chaque', 'heure', 'rythme', 'la', 'journée.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 1, 1] },
  // Phrase correcte: "Les acteurs qui jouent cette pièce reçoivent des applaudissements."
  { id: 195, level: 'C', row1: ['Le', 'acteurs', 'qui', 'joue', 'ces', 'pièces', 'reçoivent', 'un', 'applaudissement.'], row2: ['Les', 'acteur', 'qui', 'jouent', 'cette', 'pièce', 'reçoit', 'des', 'applaudissements.'], correctPath: [1, 0, 0, 1, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Mon cheval qui galope dans le pré hennit joyeusement."
  { id: 196, level: 'C', row1: ['Mes', 'cheval', 'qui', 'galope', 'dans', 'les', 'prés', 'hennit', 'joyeusement.'], row2: ['Mon', 'chevaux', 'qui', 'galope', 'dans', 'le', 'pré', 'hennit', 'joyeusement.'], correctPath: [1, 0, 0, 0, 0, 1, 1, 0, 0] },
  // Phrase correcte: "Les navires qui traversent l'océan affrontent les tempêtes."
  { id: 197, level: 'C', row1: ['Le', 'navires', 'qui', 'traverse', 'les', 'océans', 'affrontent', 'la', 'tempête.'], row2: ['Les', 'navire', 'qui', 'traversent', "l'océan", 'affronte', 'les', 'tempêtes.'], correctPath: [1, 0, 0, 1, 1, 0, 1, 1] },
  // Phrase correcte: "La bibliothèque qui ouvre le matin ferme le soir."
  { id: 198, level: 'C', row1: ['Les', 'bibliothèque', 'qui', 'ouvre', 'les', 'matins', 'ferme', 'les', 'soirs.'], row2: ['La', 'bibliothèques', 'qui', 'ouvre', 'le', 'matin', 'ferme', 'le', 'soir.'], correctPath: [1, 0, 0, 0, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Les monuments qui datent du Moyen Âge attirent les visiteurs."
  { id: 199, level: 'C', row1: ['Le', 'monuments', 'qui', 'date', 'des', 'Moyen', 'Âges', 'attirent', 'le', 'visiteur.'], row2: ['Les', 'monument', 'qui', 'datent', 'du', 'Moyen', 'Âge', 'attire', 'les', 'visiteurs.'], correctPath: [1, 0, 0, 1, 1, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Mon héros qui sauve le monde inspire tous les enfants."
  { id: 200, level: 'C', row1: ['Mon', 'héros', 'qui', 'sauve', 'les', 'mondes', 'inspire', 'tout', 'le', 'enfant.'], row2: ['Mes', 'héros', 'qui', 'sauve', 'le', 'monde', 'inspire', 'tous', 'les', 'enfants.'], correctPath: [0, 0, 0, 0, 1, 1, 0, 1, 1, 1] },

  // 201-250: Phrases avec conjonctions de coordination
  // Phrase correcte: "Les garçons jouent au ballon et les filles dessinent."
  { id: 201, level: 'C', row1: ['Le', 'garçons', 'jouent', 'aux', 'ballons', 'et', 'la', 'filles', 'dessinent.'], row2: ['Les', 'garçon', 'joue', 'au', 'ballon', 'et', 'les', 'fille', 'dessine.'], correctPath: [1, 0, 0, 1, 1, 0, 1, 0, 0] },
  // Phrase correcte: "Mon chat dort sur le canapé mais mon chien court dehors."
  { id: 202, level: 'C', row1: ['Mon', 'chats', 'dort', 'sur', 'les', 'canapés', 'mais', 'mes', 'chien', 'court', 'dehors.'], row2: ['Mes', 'chat', 'dort', 'sur', 'le', 'canapé', 'mais', 'mon', 'chiens', 'court', 'dehors.'], correctPath: [0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0] },
  // Phrase correcte: "Les fleurs poussent vite car le soleil brille fort."
  { id: 203, level: 'C', row1: ['Les', 'fleur', 'poussent', 'vite', 'car', 'les', 'soleils', 'brille', 'fort.'], row2: ['La', 'fleurs', 'pousse', 'vite', 'car', 'le', 'soleil', 'brille', 'fort.'], correctPath: [0, 1, 0, 0, 0, 1, 1, 0, 0] },
  // Phrase correcte: "Ma sœur aime lire et mon frère préfère jouer."
  { id: 204, level: 'C', row1: ['Ma', 'sœurs', 'aime', 'lire', 'et', 'mes', 'frère', 'préfère', 'jouer.'], row2: ['Mes', 'sœur', 'aime', 'lire', 'et', 'mon', 'frères', 'préfère', 'jouer.'], correctPath: [0, 1, 0, 0, 0, 1, 0, 0, 0] },
  // Phrase correcte: "Les oiseaux chantent le matin ou se taisent la nuit."
  { id: 205, level: 'C', row1: ['Le', 'oiseaux', 'chante', 'les', 'matins', 'ou', 'se', 'tait', 'les', 'nuits.'], row2: ['Les', 'oiseau', 'chantent', 'le', 'matin', 'ou', 'se', 'taisent', 'la', 'nuit.'], correctPath: [1, 0, 1, 1, 1, 0, 0, 1, 1, 1] },
  // Phrase correcte: "Le vent souffle fort donc les arbres plient."
  { id: 206, level: 'C', row1: ['Les', 'vent', 'souffle', 'fort', 'donc', 'le', 'arbres', 'plient.'], row2: ['Le', 'vents', 'souffle', 'fort', 'donc', 'les', 'arbre', 'plie.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 0] },
  // Phrase correcte: "Les élèves travaillent dur et leurs parents sont fiers."
  { id: 207, level: 'C', row1: ['Les', 'élève', 'travaille', 'dur', 'et', 'leur', 'parents', 'sont', 'fier.'], row2: ['Le', 'élèves', 'travaillent', 'dur', 'et', 'leurs', 'parent', 'est', 'fiers.'], correctPath: [0, 1, 1, 0, 0, 1, 0, 0, 1] },
  // Phrase correcte: "Mon père cuisine le dîner tandis que ma mère met la table."
  { id: 208, level: 'C', row1: ['Mon', 'pères', 'cuisine', 'les', 'dîners', 'tandis', 'que', 'mes', 'mère', 'met', 'les', 'tables.'], row2: ['Mes', 'père', 'cuisine', 'le', 'dîner', 'tandis', 'que', 'ma', 'mères', 'met', 'la', 'table.'], correctPath: [0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Les nuages cachent le soleil mais la chaleur reste."
  { id: 209, level: 'C', row1: ['Le', 'nuages', 'cache', 'les', 'soleils', 'mais', 'les', 'chaleur', 'reste.'], row2: ['Les', 'nuage', 'cachent', 'le', 'soleil', 'mais', 'la', 'chaleurs', 'reste.'], correctPath: [1, 0, 1, 1, 1, 0, 1, 0, 0] },
  // Phrase correcte: "La pluie tombe doucement et les plantes en profitent."
  { id: 210, level: 'C', row1: ['Les', 'pluie', 'tombe', 'doucement', 'et', 'la', 'plantes', 'en', 'profitent.'], row2: ['La', 'pluies', 'tombe', 'doucement', 'et', 'les', 'plante', 'en', 'profite.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 0, 0] },
  // Phrase correcte: "Les enfants rient fort car le clown fait des grimaces."
  { id: 211, level: 'C', row1: ['Le', 'enfants', 'ris', 'fort', 'car', 'les', 'clown', 'fait', 'de', 'grimace.'], row2: ['Les', 'enfant', 'rient', 'fort', 'car', 'le', 'clowns', 'fait', 'des', 'grimaces.'], correctPath: [1, 0, 1, 0, 0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Mon ami viendra demain ou il restera chez lui."
  { id: 212, level: 'C', row1: ['Mes', 'ami', 'viendra', 'demain', 'ou', 'ils', 'restera', 'chez', 'eux.'], row2: ['Mon', 'amis', 'viendra', 'demain', 'ou', 'il', 'restera', 'chez', 'lui.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 0, 1] },
  // Phrase correcte: "Les voitures roulent vite donc les piétons font attention."
  { id: 213, level: 'C', row1: ['Les', 'voiture', 'roulent', 'vite', 'donc', 'le', 'piétons', 'font', 'attention.'], row2: ['La', 'voitures', 'roule', 'vite', 'donc', 'les', 'piéton', 'fait', 'attention.'], correctPath: [0, 1, 0, 0, 0, 1, 0, 0, 0] },
  // Phrase correcte: "Ma cousine étudie beaucoup et elle réussit ses examens."
  { id: 214, level: 'C', row1: ['Mes', 'cousine', 'étudie', 'beaucoup', 'et', 'elles', 'réussit', 'son', 'examen.'], row2: ['Ma', 'cousines', 'étudie', 'beaucoup', 'et', 'elle', 'réussit', 'ses', 'examens.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 1, 1] },
  // Phrase correcte: "Les lions rugissent fort mais les touristes restent calmes."
  { id: 215, level: 'C', row1: ['Le', 'lions', 'rugit', 'fort', 'mais', 'le', 'touristes', 'restent', 'calme.'], row2: ['Les', 'lion', 'rugissent', 'fort', 'mais', 'les', 'touriste', 'reste', 'calmes.'], correctPath: [1, 0, 1, 0, 0, 1, 0, 0, 1] },
  // Phrase correcte: "Le soleil se couche et les étoiles apparaissent dans le ciel."
  { id: 216, level: 'C', row1: ['Les', 'soleil', 'se', 'couche', 'et', 'le', 'étoiles', 'apparaissent', 'dans', 'les', 'ciels.'], row2: ['Le', 'soleils', 'se', 'couche', 'et', 'les', 'étoile', 'apparaît', 'dans', 'le', 'ciel.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1] },
  // Phrase correcte: "Les poules pondent des œufs car l'éleveur les nourrit bien."
  { id: 217, level: 'C', row1: ['La', 'poules', 'pond', 'un', 'œuf', 'car', 'les', 'éleveur', 'la', 'nourrit', 'bien.'], row2: ['Les', 'poule', 'pondent', 'des', 'œufs', 'car', "l'éleveur", 'les', 'nourrit', 'bien.'], correctPath: [1, 0, 1, 1, 1, 0, 1, 1, 0, 0] },
  // Phrase correcte: "Mon oncle travaille tard donc il rentre fatigué."
  { id: 218, level: 'C', row1: ['Mon', 'oncles', 'travaille', 'tard', 'donc', 'ils', 'rentre', 'fatigué.'], row2: ['Mes', 'oncle', 'travaille', 'tard', 'donc', 'il', 'rentre', 'fatigué.'], correctPath: [0, 1, 0, 0, 0, 1, 0, 0] },
  // Phrase correcte: "Les bébés pleurent souvent et les parents les consolent."
  { id: 219, level: 'C', row1: ['Le', 'bébés', 'pleure', 'souvent', 'et', 'le', 'parents', 'les', 'consolent.'], row2: ['Les', 'bébé', 'pleurent', 'souvent', 'et', 'les', 'parent', 'le', 'console.'], correctPath: [1, 0, 1, 0, 0, 1, 0, 0, 0] },
  // Phrase correcte: "La neige tombe doucement ou la pluie fouette les vitres."
  { id: 220, level: 'C', row1: ['Les', 'neige', 'tombe', 'doucement', 'ou', 'les', 'pluie', 'fouette', 'la', 'vitre.'], row2: ['La', 'neiges', 'tombe', 'doucement', 'ou', 'la', 'pluies', 'fouette', 'les', 'vitres.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Les chevaux galopent librement car le pré est grand."
  { id: 221, level: 'C', row1: ['Le', 'chevaux', 'galope', 'librement', 'car', 'les', 'pré', 'est', 'grands.'], row2: ['Les', 'cheval', 'galopent', 'librement', 'car', 'le', 'prés', 'est', 'grand.'], correctPath: [1, 0, 1, 0, 0, 1, 0, 0, 1] },
  // Phrase correcte: "Mon professeur explique bien donc les élèves comprennent vite."
  { id: 222, level: 'C', row1: ['Mon', 'professeurs', 'explique', 'bien', 'donc', 'le', 'élèves', 'comprend', 'vite.'], row2: ['Mes', 'professeur', 'explique', 'bien', 'donc', 'les', 'élève', 'comprennent', 'vite.'], correctPath: [0, 1, 0, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Les dauphins sautent joyeusement et les spectateurs applaudissent."
  { id: 223, level: 'C', row1: ['Le', 'dauphins', 'saute', 'joyeusement', 'et', 'le', 'spectateurs', 'applaudissent.'], row2: ['Les', 'dauphin', 'sautent', 'joyeusement', 'et', 'les', 'spectateur', 'applaudit.'], correctPath: [1, 0, 1, 0, 0, 1, 0, 0] },
  // Phrase correcte: "Ma grand-mère tricote des pulls tandis que mon grand-père lit."
  { id: 224, level: 'C', row1: ['Ma', 'grand-mères', 'tricote', 'un', 'pull', 'tandis', 'que', 'mes', 'grand-père', 'lit.'], row2: ['Mes', 'grand-mère', 'tricote', 'des', 'pulls', 'tandis', 'que', 'mon', 'grand-pères', 'lit.'], correctPath: [0, 1, 0, 1, 1, 0, 0, 1, 0, 0] },
  // Phrase correcte: "Les fourmis travaillent dur mais les cigales chantent."
  { id: 225, level: 'C', row1: ['La', 'fourmis', 'travaille', 'dur', 'mais', 'la', 'cigales', 'chantent.'], row2: ['Les', 'fourmi', 'travaillent', 'dur', 'mais', 'les', 'cigale', 'chante.'], correctPath: [1, 0, 1, 0, 0, 1, 0, 0] },
  // Phrase correcte: "Le feu brûle dans la cheminée et la chaleur réchauffe la maison."
  { id: 226, level: 'C', row1: ['Le', 'feux', 'brûle', 'dans', 'les', 'cheminées', 'et', 'la', 'chaleurs', 'réchauffe', 'les', 'maison.'], row2: ['Les', 'feu', 'brûle', 'dans', 'la', 'cheminée', 'et', 'les', 'chaleur', 'réchauffe', 'la', 'maisons.'], correctPath: [0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Les pirates cherchent le trésor car la carte indique sa position."
  { id: 227, level: 'C', row1: ['Les', 'pirate', 'cherche', 'les', 'trésor', 'car', 'la', 'cartes', 'indique', 'leur', 'position.'], row2: ['Le', 'pirates', 'cherchent', 'le', 'trésors', 'car', 'les', 'carte', 'indique', 'sa', 'position.'], correctPath: [0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Mon petit frère grandit vite donc ses vêtements deviennent petits."
  { id: 228, level: 'C', row1: ['Mes', 'petit', 'frère', 'grandit', 'vite', 'donc', 'son', 'vêtements', 'devient', 'petits.'], row2: ['Mon', 'petits', 'frères', 'grandit', 'vite', 'donc', 'ses', 'vêtement', 'deviennent', 'petit.'], correctPath: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Les abeilles butinent les fleurs et elles fabriquent du miel."
  { id: 229, level: 'C', row1: ['Le', 'abeilles', 'butine', 'les', 'fleur', 'et', 'elle', 'fabriquent', 'des', 'miel.'], row2: ['Les', 'abeille', 'butinent', 'la', 'fleurs', 'et', 'elles', 'fabrique', 'du', 'miels.'], correctPath: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
  // Phrase correcte: "La lune brille la nuit ou les nuages la cachent."
  { id: 230, level: 'C', row1: ['Les', 'lune', 'brille', 'les', 'nuit', 'ou', 'les', 'nuage', 'les', 'cachent.'], row2: ['La', 'lunes', 'brille', 'la', 'nuits', 'ou', 'le', 'nuages', 'la', 'cache.'], correctPath: [1, 0, 0, 1, 0, 0, 0, 1, 1, 0] },
  // Phrase correcte: "Les enfants adorent les bonbons mais ils mangent des fruits."
  { id: 231, level: 'C', row1: ['Le', 'enfants', 'adore', 'les', 'bonbon', 'mais', 'il', 'mangent', 'un', 'fruits.'], row2: ['Les', 'enfant', 'adorent', 'le', 'bonbons', 'mais', 'ils', 'mange', 'des', 'fruit.'], correctPath: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Mon voisin tond sa pelouse et il arrose ses fleurs."
  { id: 232, level: 'C', row1: ['Mon', 'voisins', 'tond', 'leur', 'pelouse', 'et', 'ils', 'arrose', 'son', 'fleurs.'], row2: ['Mes', 'voisin', 'tond', 'sa', 'pelouse', 'et', 'il', 'arrose', 'ses', 'fleur.'], correctPath: [0, 1, 0, 1, 0, 0, 1, 1, 1, 0] },
  // Phrase correcte: "Les trains arrivent à l'heure donc les voyageurs sont contents."
  { id: 233, level: 'C', row1: ['Les', 'train', 'arrive', 'aux', "l'heure", 'donc', 'le', 'voyageurs', 'est', 'contents.'], row2: ['Le', 'trains', 'arrivent', 'à', 'heures', 'donc', 'les', 'voyageur', 'sont', 'content.'], correctPath: [0, 1, 1, 1, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Ma tante cuisine des gâteaux car elle reçoit des invités."
  { id: 234, level: 'C', row1: ['Ma', 'tantes', 'cuisine', 'un', 'gâteaux', 'car', 'elles', 'reçoit', 'un', 'invités.'], row2: ['Mes', 'tante', 'cuisine', 'des', 'gâteau', 'car', 'elle', 'reçoit', 'des', 'invité.'], correctPath: [0, 1, 0, 1, 0, 0, 1, 1, 1, 0] },
  // Phrase correcte: "Les étoiles filantes traversent le ciel et les enfants font des vœux."
  { id: 235, level: 'C', row1: ['Le', 'étoiles', 'filante', 'traverse', 'le', 'ciels', 'et', 'les', 'enfant', 'font', 'un', 'vœux.'], row2: ['Les', 'étoile', 'filantes', 'traversent', 'les', 'ciel', 'et', 'le', 'enfants', 'fait', 'des', 'vœu.'], correctPath: [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Le jardinier plante des fleurs tandis que son assistant arrose."
  { id: 236, level: 'C', row1: ['Les', 'jardinier', 'plante', 'une', 'fleurs', 'tandis', 'que', 'ses', 'assistant', 'arrose.'], row2: ['Le', 'jardiniers', 'plante', 'des', 'fleur', 'tandis', 'que', 'son', 'assistants', 'arrose.'], correctPath: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0] },
  // Phrase correcte: "Les loups hurlent dans la forêt mais personne ne les entend."
  { id: 237, level: 'C', row1: ['Le', 'loups', 'hurle', 'dans', 'les', 'forêt', 'mais', 'personne', 'ne', 'le', 'entend.'], row2: ['Les', 'loup', 'hurlent', 'dans', 'la', 'forêts', 'mais', 'personne', 'ne', 'les', 'entend.'], correctPath: [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0] },
  // Phrase correcte: "Mon chat attrape des souris car il est un bon chasseur."
  { id: 238, level: 'C', row1: ['Mon', 'chats', 'attrape', 'une', 'souris', 'car', 'ils', 'est', 'de', 'bon', 'chasseur.'], row2: ['Mes', 'chat', 'attrape', 'des', 'souris', 'car', 'il', 'est', 'un', 'bons', 'chasseurs.'], correctPath: [0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0] },
  // Phrase correcte: "Les voitures électriques protègent l'environnement donc elles deviennent populaires."
  { id: 239, level: 'C', row1: ['La', 'voitures', 'électrique', 'protège', "l'environnement", 'donc', 'elle', 'deviennent', 'populaires.'], row2: ['Les', 'voiture', 'électriques', 'protègent', 'les', 'environnements', 'donc', 'elles', 'devient', 'populaire.'], correctPath: [1, 0, 1, 1, 0, 0, 1, 0, 0] },
  // Phrase correcte: "Ma mère travaille le jour et elle se repose le soir."
  { id: 240, level: 'C', row1: ['Mes', 'mère', 'travaille', 'les', 'jour', 'et', 'elles', 'se', 'repose', 'les', 'soir.'], row2: ['Ma', 'mères', 'travaille', 'le', 'jours', 'et', 'elle', 'se', 'repose', 'le', 'soirs.'], correctPath: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0] },
  // Phrase correcte: "Les tournesols suivent le soleil car ils cherchent la lumière."
  { id: 241, level: 'C', row1: ['Le', 'tournesols', 'suit', 'le', 'soleils', 'car', 'il', 'cherchent', 'les', 'lumière.'], row2: ['Les', 'tournesol', 'suivent', 'les', 'soleil', 'car', 'ils', 'cherche', 'la', 'lumières.'], correctPath: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Le pompier éteint les feux donc il sauve des vies."
  { id: 242, level: 'C', row1: ['Les', 'pompier', 'éteint', 'le', 'feux', 'donc', 'ils', 'sauve', 'une', 'vies.'], row2: ['Le', 'pompiers', 'éteint', 'les', 'feu', 'donc', 'il', 'sauve', 'des', 'vie.'], correctPath: [1, 0, 0, 1, 0, 0, 1, 1, 1, 0] },
  // Phrase correcte: "Les papillons colorés volent dans le jardin et ils butinent les fleurs."
  { id: 243, level: 'C', row1: ['Le', 'papillons', 'coloré', 'vole', 'dans', 'les', 'jardin', 'et', 'il', 'butinent', 'la', 'fleurs.'], row2: ['Les', 'papillon', 'colorés', 'volent', 'dans', 'le', 'jardins', 'et', 'ils', 'butine', 'les', 'fleur.'], correctPath: [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Mon dentiste soigne mes dents tandis que l'assistante prépare les outils."
  { id: 244, level: 'C', row1: ['Mon', 'dentistes', 'soigne', 'ma', 'dents', 'tandis', 'que', 'les', 'assistante', 'prépare', "l'outil."], row2: ['Mes', 'dentiste', 'soigne', 'mes', 'dent', 'tandis', 'que', "l'assistante", 'assistantes', 'prépare', 'les', 'outils.'], correctPath: [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1] },
  // Phrase correcte: "Les pirates naviguent sur les mers mais la marine les poursuit."
  { id: 245, level: 'C', row1: ['Le', 'pirates', 'navigue', 'sur', 'la', 'mers', 'mais', 'les', 'marine', 'le', 'poursuit.'], row2: ['Les', 'pirate', 'naviguent', 'sur', 'les', 'mer', 'mais', 'la', 'marines', 'les', 'poursuit.'], correctPath: [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "La rivière coule doucement et les poissons y nagent."
  { id: 246, level: 'C', row1: ['Les', 'rivière', 'coule', 'doucement', 'et', 'le', 'poissons', 'y', 'nage.'], row2: ['La', 'rivières', 'coule', 'doucement', 'et', 'les', 'poisson', 'y', 'nagent.'], correctPath: [1, 0, 0, 0, 0, 1, 0, 0, 1] },
  // Phrase correcte: "Les écureuils ramassent des noisettes car l'hiver approche."
  { id: 247, level: 'C', row1: ['Le', 'écureuils', 'ramasse', 'une', 'noisettes', 'car', 'les', "l'hiver", 'approche.'], row2: ['Les', 'écureuil', 'ramassent', 'des', 'noisette', 'car', "l'hiver", 'hivers', 'approche.'], correctPath: [1, 0, 1, 1, 0, 0, 1, 0, 0] },
  // Phrase correcte: "Mon frère joue du piano donc il prend des cours."
  { id: 248, level: 'C', row1: ['Mes', 'frère', 'joue', 'des', 'piano', 'donc', 'ils', 'prend', 'un', 'cours.'], row2: ['Mon', 'frères', 'joue', 'du', 'pianos', 'donc', 'il', 'prend', 'des', 'cours.'], correctPath: [1, 0, 0, 1, 0, 0, 1, 1, 1, 1] },
  // Phrase correcte: "Les nuages noirs arrivent vite et l'orage éclate bientôt."
  { id: 249, level: 'C', row1: ['Le', 'nuages', 'noir', 'arrive', 'vite', 'et', 'les', "l'orage", 'éclate', 'bientôt.'], row2: ['Les', 'nuage', 'noirs', 'arrivent', 'vite', 'et', "l'orage", 'orages', 'éclate', 'bientôt.'], correctPath: [1, 0, 1, 1, 0, 0, 1, 0, 0, 0] },
  // Phrase correcte: "Ma sœur lit des romans tandis que je regarde la télévision."
  { id: 250, level: 'C', row1: ['Mes', 'sœur', 'lit', 'un', 'romans', 'tandis', 'que', 'je', 'regarde', 'les', 'télévision.'], row2: ['Ma', 'sœurs', 'lit', 'des', 'roman', 'tandis', 'que', 'je', 'regarde', 'la', 'télévisions.'], correctPath: [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0] },

  // 251-300: Phrases avec propositions subordonnées variées
  // Phrase correcte: "Quand les enfants arrivent à l'école, ils rangent leurs affaires."
  { id: 251, level: 'C', row1: ['Quand', 'le', 'enfants', 'arrive', 'aux', "l'école,", 'il', 'rangent', 'son', 'affaires.'], row2: ['Quand', 'les', 'enfant', 'arrivent', 'à', 'écoles,', 'ils', 'range', 'leurs', 'affaire.'], correctPath: [0, 1, 0, 1, 1, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Si ma sœur étudie bien, elle réussira son examen."
  { id: 252, level: 'C', row1: ['Si', 'mes', 'sœur', 'étudie', 'bien,', 'elles', 'réussira', 'leur', 'examen.'], row2: ['Si', 'ma', 'sœurs', 'étudie', 'bien,', 'elle', 'réussira', 'son', 'examen.'], correctPath: [0, 1, 0, 0, 0, 1, 1, 1, 0] },
  // Phrase correcte: "Pendant que les oiseaux chantent, le soleil se lève doucement."
  { id: 253, level: 'C', row1: ['Pendant', 'que', 'le', 'oiseaux', 'chante,', 'les', 'soleil', 'se', 'lève', 'doucement.'], row2: ['Pendant', 'que', 'les', 'oiseau', 'chantent,', 'le', 'soleils', 'se', 'lève', 'doucement.'], correctPath: [0, 0, 1, 0, 1, 1, 0, 0, 0, 0] },
  // Phrase correcte: "Lorsque mon père rentre tard, il dîne seul."
  { id: 254, level: 'C', row1: ['Lorsque', 'mes', 'père', 'rentre', 'tard,', 'ils', 'dîne', 'seul.'], row2: ['Lorsque', 'mon', 'pères', 'rentre', 'tard,', 'il', 'dîne', 'seul.'], correctPath: [0, 1, 0, 0, 0, 1, 1, 0] },
  // Phrase correcte: "Parce que les fleurs fanent, le jardinier les arrose souvent."
  { id: 255, level: 'C', row1: ['Parce', 'que', 'la', 'fleurs', 'fane,', 'les', 'jardinier', 'la', 'arrose', 'souvent.'], row2: ['Parce', 'que', 'les', 'fleur', 'fanent,', 'le', 'jardiniers', 'les', 'arrose', 'souvent.'], correctPath: [0, 0, 1, 0, 1, 1, 0, 1, 1, 0] },
  // Phrase correcte: "Bien que la nuit tombe, les enfants jouent encore dehors."
  { id: 256, level: 'C', row1: ['Bien', 'que', 'les', 'nuit', 'tombe,', 'le', 'enfants', 'joue', 'encore', 'dehors.'], row2: ['Bien', 'que', 'la', 'nuits', 'tombe,', 'les', 'enfant', 'jouent', 'encore', 'dehors.'], correctPath: [0, 0, 1, 0, 0, 1, 0, 1, 0, 0] },
  // Phrase correcte: "Dès que les invités arrivent, mon oncle ouvre la porte."
  { id: 257, level: 'C', row1: ['Dès', 'que', 'le', 'invités', 'arrive,', 'mes', 'oncle', 'ouvre', 'les', 'porte.'], row2: ['Dès', 'que', 'les', 'invité', 'arrivent,', 'mon', 'oncles', 'ouvre', 'la', 'portes.'], correctPath: [0, 0, 1, 0, 1, 1, 0, 0, 1, 0] },
  // Phrase correcte: "Puisque les lions dorment, les touristes peuvent approcher."
  { id: 258, level: 'C', row1: ['Puisque', 'le', 'lions', 'dors', 'les', 'touriste', 'peut', 'approcher.'], row2: ['Puisque', 'les', 'lion', 'dorment,', 'le', 'touristes', 'peuvent', 'approcher.'], correctPath: [0, 1, 0, 1, 0, 1, 1, 0] },
  // Phrase correcte: "Aussitôt que ma mère appelle, je descends rapidement."
  { id: 259, level: 'C', row1: ['Aussitôt', 'que', 'mes', 'mère', 'appelle,', 'je', 'descends', 'rapidement.'], row2: ['Aussitôt', 'que', 'ma', 'mères', 'appelle,', 'je', 'descends', 'rapidement.'], correctPath: [0, 0, 1, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Tandis que les chats chassent, les souris se cachent."
  { id: 260, level: 'C', row1: ['Tandis', 'que', 'le', 'chats', 'chasse,', 'la', 'souris', 'se', 'cache.'], row2: ['Tandis', 'que', 'les', 'chat', 'chassent,', 'les', 'souris', 'se', 'cachent.'], correctPath: [0, 0, 1, 0, 1, 1, 1, 0, 1] },
  // Phrase correcte: "Avant que le jour se lève, les coqs chantent déjà."
  { id: 261, level: 'C', row1: ['Avant', 'que', 'les', 'jour', 'se', 'lève,', 'le', 'coqs', 'chante', 'déjà.'], row2: ['Avant', 'que', 'le', 'jours', 'se', 'lève,', 'les', 'coq', 'chantent', 'déjà.'], correctPath: [0, 0, 1, 0, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Après que les élèves ont fini, le professeur corrige les copies."
  { id: 262, level: 'C', row1: ['Après', 'que', 'le', 'élèves', 'a', 'fini,', 'les', 'professeur', 'corrige', 'la', 'copies.'], row2: ['Après', 'que', 'les', 'élève', 'ont', 'fini,', 'le', 'professeurs', 'corrige', 'les', 'copie.'], correctPath: [0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0] },
  // Phrase correcte: "Même si ma sœur est fatiguée, elle termine ses devoirs."
  { id: 263, level: 'C', row1: ['Même', 'si', 'mes', 'sœur', 'est', 'fatiguée,', 'elles', 'termine', 'leur', 'devoirs.'], row2: ['Même', 'si', 'ma', 'sœurs', 'est', 'fatiguée,', 'elle', 'termine', 'ses', 'devoir.'], correctPath: [0, 0, 1, 0, 0, 0, 1, 1, 1, 0] },
  // Phrase correcte: "Comme les nuages arrivent, la pluie va tomber bientôt."
  { id: 264, level: 'C', row1: ['Comme', 'le', 'nuages', 'arrive,', 'les', 'pluie', 'va', 'tomber', 'bientôt.'], row2: ['Comme', 'les', 'nuage', 'arrivent,', 'la', 'pluies', 'va', 'tomber', 'bientôt.'], correctPath: [0, 1, 0, 1, 1, 0, 0, 0, 0] },
  // Phrase correcte: "Quoique le vent soit fort, les voiliers naviguent encore."
  { id: 265, level: 'C', row1: ['Quoique', 'les', 'vent', 'soit', 'fort,', 'le', 'voiliers', 'navigue', 'encore.'], row2: ['Quoique', 'le', 'vents', 'soit', 'fort,', 'les', 'voilier', 'naviguent', 'encore.'], correctPath: [0, 1, 0, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Pendant que mon frère dort, je lis tranquillement."
  { id: 266, level: 'C', row1: ['Pendant', 'que', 'mes', 'frère', 'dort,', 'je', 'lis', 'tranquillement.'], row2: ['Pendant', 'que', 'mon', 'frères', 'dort,', 'je', 'lis', 'tranquillement.'], correctPath: [0, 0, 1, 0, 0, 0, 0, 0] },
  // Phrase correcte: "Quand les feuilles tombent, l'automne s'installe vraiment."
  { id: 267, level: 'C', row1: ['Quand', 'la', 'feuilles', 'tombe,', 'les', "l'automne", "s'installe", 'vraiment.'], row2: ['Quand', 'les', 'feuille', 'tombent,', "l'automne", 'automnes', "s'installe", 'vraiment.'], correctPath: [0, 1, 0, 1, 1, 0, 0, 0] },
  // Phrase correcte: "Si les poules pondent bien, l'éleveur sera content."
  { id: 268, level: 'C', row1: ['Si', 'la', 'poules', 'pond', 'bien,', 'les', "l'éleveur", 'sera', 'contents.'], row2: ['Si', 'les', 'poule', 'pondent', 'bien,', "l'éleveur", 'éleveurs', 'sera', 'content.'], correctPath: [0, 1, 0, 1, 0, 1, 0, 0, 1] },
  // Phrase correcte: "Lorsque ma tante cuisine, toute la maison sent bon."
  { id: 269, level: 'C', row1: ['Lorsque', 'mes', 'tante', 'cuisine,', 'toutes', 'la', 'maisons', 'sent', 'bon.'], row2: ['Lorsque', 'ma', 'tantes', 'cuisine,', 'toute', 'les', 'maison', 'sent', 'bon.'], correctPath: [0, 1, 0, 0, 1, 0, 1, 0, 0] },
  // Phrase correcte: "Parce que les routes sont glissantes, les voitures roulent doucement."
  { id: 270, level: 'C', row1: ['Parce', 'que', 'la', 'routes', 'est', 'glissante,', 'la', 'voitures', 'roule', 'doucement.'], row2: ['Parce', 'que', 'les', 'route', 'sont', 'glissantes,', 'les', 'voiture', 'roulent', 'doucement.'], correctPath: [0, 0, 1, 0, 1, 1, 1, 0, 1, 0] },
  // Phrase correcte: "Bien que le film soit long, les enfants restent attentifs."
  { id: 271, level: 'C', row1: ['Bien', 'que', 'les', 'film', 'soit', 'long,', 'le', 'enfants', 'reste', 'attentifs.'], row2: ['Bien', 'que', 'le', 'films', 'soit', 'long,', 'les', 'enfant', 'restent', 'attentif.'], correctPath: [0, 0, 1, 0, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Dès que ma mère rentre, je lui raconte ma journée."
  { id: 272, level: 'C', row1: ['Dès', 'que', 'mes', 'mère', 'rentre,', 'je', 'leur', 'raconte', 'mes', 'journée.'], row2: ['Dès', 'que', 'ma', 'mères', 'rentre,', 'je', 'lui', 'raconte', 'ma', 'journées.'], correctPath: [0, 0, 1, 0, 0, 0, 1, 1, 1, 0] },
  // Phrase correcte: "Puisque les magasins ferment, les gens rentrent chez eux."
  { id: 273, level: 'C', row1: ['Puisque', 'le', 'magasins', 'ferme,', 'le', 'gens', 'rentre', 'chez', 'lui.'], row2: ['Puisque', 'les', 'magasin', 'ferment,', 'les', 'gen', 'rentrent', 'chez', 'eux.'], correctPath: [0, 1, 0, 1, 1, 0, 1, 0, 1] },
  // Phrase correcte: "Aussitôt que le professeur entre, les élèves se taisent."
  { id: 274, level: 'C', row1: ['Aussitôt', 'que', 'les', 'professeur', 'entre,', 'le', 'élèves', 'se', 'tait.'], row2: ['Aussitôt', 'que', 'le', 'professeurs', 'entre,', 'les', 'élève', 'se', 'taisent.'], correctPath: [0, 0, 1, 0, 0, 1, 0, 0, 1] },
  // Phrase correcte: "Tandis que les adultes travaillent, les enfants vont à l'école."
  { id: 275, level: 'C', row1: ['Tandis', 'que', 'le', 'adultes', 'travaille,', 'le', 'enfants', 'va', 'aux', "l'école."], row2: ['Tandis', 'que', 'les', 'adulte', 'travaillent,', 'les', 'enfant', 'vont', 'à', 'écoles.'], correctPath: [0, 0, 1, 0, 1, 1, 0, 1, 1, 0] },
  // Phrase correcte: "Avant que les invités arrivent, ma sœur nettoie la maison."
  { id: 276, level: 'C', row1: ['Avant', 'que', 'le', 'invités', 'arrive,', 'mes', 'sœur', 'nettoie', 'les', 'maison.'], row2: ['Avant', 'que', 'les', 'invité', 'arrivent,', 'ma', 'sœurs', 'nettoie', 'la', 'maisons.'], correctPath: [0, 0, 1, 0, 1, 1, 0, 0, 1, 0] },
  // Phrase correcte: "Après que le spectacle finit, les spectateurs applaudissent fort."
  { id: 277, level: 'C', row1: ['Après', 'que', 'les', 'spectacle', 'finit,', 'le', 'spectateurs', 'applaudit', 'fort.'], row2: ['Après', 'que', 'le', 'spectacles', 'finit,', 'les', 'spectateur', 'applaudissent', 'fort.'], correctPath: [0, 0, 1, 0, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Même si les journées sont longues, mon père reste souriant."
  { id: 278, level: 'C', row1: ['Même', 'si', 'la', 'journées', 'est', 'longue,', 'mes', 'père', 'reste', 'souriant.'], row2: ['Même', 'si', 'les', 'journée', 'sont', 'longues,', 'mon', 'pères', 'reste', 'souriant.'], correctPath: [0, 0, 1, 0, 1, 1, 1, 0, 0, 0] },
  // Phrase correcte: "Comme la mer est calme, les bateaux sortent du port."
  { id: 279, level: 'C', row1: ['Comme', 'les', 'mer', 'est', 'calme,', 'le', 'bateaux', 'sort', 'des', 'port.'], row2: ['Comme', 'la', 'mers', 'est', 'calme,', 'les', 'bateau', 'sortent', 'du', 'ports.'], correctPath: [0, 1, 0, 0, 0, 1, 0, 1, 1, 0] },
  // Phrase correcte: "Quoique les exercices soient difficiles, ma sœur les réussit."
  { id: 280, level: 'C', row1: ['Quoique', 'le', 'exercices', 'soit', 'difficile,', 'mes', 'sœur', 'le', 'réussit.'], row2: ['Quoique', 'les', 'exercice', 'soient', 'difficiles,', 'ma', 'sœurs', 'les', 'réussit.'], correctPath: [0, 1, 0, 1, 1, 1, 0, 1, 1] },
  // Phrase correcte: "Pendant que les musiciens jouent, le public écoute attentivement."
  { id: 281, level: 'C', row1: ['Pendant', 'que', 'le', 'musiciens', 'joue,', 'les', 'public', 'écoute', 'attentivement.'], row2: ['Pendant', 'que', 'les', 'musicien', 'jouent,', 'le', 'publics', 'écoute', 'attentivement.'], correctPath: [0, 0, 1, 0, 1, 1, 0, 0, 0] },
  // Phrase correcte: "Quand le réveil sonne, les enfants se lèvent péniblement."
  { id: 282, level: 'C', row1: ['Quand', 'les', 'réveil', 'sonne,', 'le', 'enfants', 'se', 'lève', 'péniblement.'], row2: ['Quand', 'le', 'réveils', 'sonne,', 'les', 'enfant', 'se', 'lèvent', 'péniblement.'], correctPath: [0, 1, 0, 0, 1, 0, 0, 1, 0] },
  // Phrase correcte: "Si les plantes manquent d'eau, elles flétrissent rapidement."
  { id: 283, level: 'C', row1: ['Si', 'la', 'plantes', 'manque', 'des', "d'eau,", 'elle', 'flétrissent', 'rapidement.'], row2: ['Si', 'les', 'plante', 'manquent', "d'eau,", 'eaux,', 'elles', 'flétrit', 'rapidement.'], correctPath: [0, 1, 0, 1, 1, 0, 1, 0, 0] },
  // Phrase correcte: "Lorsque les vacances commencent, toute la famille se réjouit."
  { id: 284, level: 'C', row1: ['Lorsque', 'la', 'vacances', 'commence,', 'toutes', 'la', 'familles', 'se', 'réjouit.'], row2: ['Lorsque', 'les', 'vacance', 'commencent,', 'toute', 'les', 'famille', 'se', 'réjouit.'], correctPath: [0, 1, 0, 1, 1, 0, 1, 0, 0] },
  // Phrase correcte: "Parce que mon chat a faim, il miaule bruyamment."
  { id: 285, level: 'C', row1: ['Parce', 'que', 'mes', 'chat', 'a', 'faim,', 'ils', 'miaule', 'bruyamment.'], row2: ['Parce', 'que', 'mon', 'chats', 'a', 'faim,', 'il', 'miaule', 'bruyamment.'], correctPath: [0, 0, 1, 0, 0, 0, 1, 1, 0] },
  // Phrase correcte: "Bien que les montagnes soient hautes, les alpinistes les gravissent."
  { id: 286, level: 'C', row1: ['Bien', 'que', 'la', 'montagnes', 'soit', 'haute,', 'le', 'alpinistes', 'la', 'gravissent.'], row2: ['Bien', 'que', 'les', 'montagne', 'soient', 'hautes,', 'les', 'alpiniste', 'les', 'gravit.'], correctPath: [0, 0, 1, 0, 1, 1, 1, 0, 1, 0] },
  // Phrase correcte: "Dès que les oiseaux chantent, le jour se lève."
  { id: 287, level: 'C', row1: ['Dès', 'que', 'le', 'oiseaux', 'chante,', 'les', 'jour', 'se', 'lève.'], row2: ['Dès', 'que', 'les', 'oiseau', 'chantent,', 'le', 'jours', 'se', 'lève.'], correctPath: [0, 0, 1, 0, 1, 1, 0, 0, 0] },
  // Phrase correcte: "Puisque ma cousine aime danser, elle prend des cours."
  { id: 288, level: 'C', row1: ['Puisque', 'mes', 'cousine', 'aime', 'danser,', 'elles', 'prend', 'un', 'cours.'], row2: ['Puisque', 'ma', 'cousines', 'aime', 'danser,', 'elle', 'prend', 'des', 'cours.'], correctPath: [0, 1, 0, 0, 0, 1, 1, 1, 1] },
  // Phrase correcte: "Aussitôt que les lumières s'éteignent, le spectacle commence."
  { id: 289, level: 'C', row1: ['Aussitôt', 'que', 'la', 'lumières', "s'éteint,", 'les', 'spectacle', 'commence.'], row2: ['Aussitôt', 'que', 'les', 'lumière', "s'éteignent,", 'le', 'spectacles', 'commence.'], correctPath: [0, 0, 1, 0, 1, 1, 0, 0] },
  // Phrase correcte: "Tandis que le bébé dort, les parents se reposent."
  { id: 290, level: 'C', row1: ['Tandis', 'que', 'les', 'bébé', 'dort,', 'le', 'parents', 'se', 'repose.'], row2: ['Tandis', 'que', 'le', 'bébés', 'dort,', 'les', 'parent', 'se', 'reposent.'], correctPath: [0, 0, 1, 0, 0, 1, 0, 0, 1] },
  // Phrase correcte: "Avant que la cloche sonne, les élèves rangent leurs affaires."
  { id: 291, level: 'C', row1: ['Avant', 'que', 'les', 'cloche', 'sonne,', 'le', 'élèves', 'range', 'son', 'affaires.'], row2: ['Avant', 'que', 'la', 'cloches', 'sonne,', 'les', 'élève', 'rangent', 'leurs', 'affaire.'], correctPath: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0] },
  // Phrase correcte: "Après que les fleurs ont fané, le jardinier les remplace."
  { id: 292, level: 'C', row1: ['Après', 'que', 'la', 'fleurs', 'a', 'fané,', 'les', 'jardinier', 'la', 'remplace.'], row2: ['Après', 'que', 'les', 'fleur', 'ont', 'fané,', 'le', 'jardiniers', 'les', 'remplace.'], correctPath: [0, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
  // Phrase correcte: "Même si le temps est mauvais, les coureurs continuent la course."
  { id: 293, level: 'C', row1: ['Même', 'si', 'les', 'temps', 'est', 'mauvais,', 'le', 'coureurs', 'continue', 'les', 'course.'], row2: ['Même', 'si', 'le', 'temps', 'est', 'mauvais,', 'les', 'coureur', 'continuent', 'la', 'courses.'], correctPath: [0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0] },
  // Phrase correcte: "Comme les fruits sont mûrs, mon père les cueille."
  { id: 294, level: 'C', row1: ['Comme', 'le', 'fruits', 'est', 'mûr,', 'mes', 'père', 'le', 'cueille.'], row2: ['Comme', 'les', 'fruit', 'sont', 'mûrs,', 'mon', 'pères', 'les', 'cueille.'], correctPath: [0, 1, 0, 1, 1, 1, 0, 1, 0] },
  // Phrase correcte: "Quoique ma sœur soit jeune, elle comprend beaucoup de choses."
  { id: 295, level: 'C', row1: ['Quoique', 'mes', 'sœur', 'soit', 'jeune,', 'elles', 'comprend', 'beaucoup', 'de', 'chose.'], row2: ['Quoique', 'ma', 'sœurs', 'soit', 'jeune,', 'elle', 'comprend', 'beaucoup', 'de', 'choses.'], correctPath: [0, 1, 0, 0, 0, 1, 1, 0, 0, 1] },
  // Phrase correcte: "Pendant que les poissons nagent, le pêcheur lance sa ligne."
  { id: 296, level: 'C', row1: ['Pendant', 'que', 'le', 'poissons', 'nage,', 'les', 'pêcheur', 'lance', 'leur', 'ligne.'], row2: ['Pendant', 'que', 'les', 'poisson', 'nagent,', 'le', 'pêcheurs', 'lance', 'sa', 'ligne.'], correctPath: [0, 0, 1, 0, 1, 1, 0, 0, 1, 0] },
  // Phrase correcte: "Quand les étoiles apparaissent, la nuit est tombée."
  { id: 297, level: 'C', row1: ['Quand', 'le', 'étoiles', 'apparaît,', 'les', 'nuit', 'est', 'tombée.'], row2: ['Quand', 'les', 'étoile', 'apparaissent,', 'la', 'nuits', 'est', 'tombée.'], correctPath: [0, 1, 0, 1, 1, 0, 0, 0] },
  // Phrase correcte: "Si le lion rugit, tous les animaux se cachent."
  { id: 298, level: 'C', row1: ['Si', 'les', 'lion', 'rugit,', 'tout', 'le', 'animaux', 'se', 'cache.'], row2: ['Si', 'le', 'lions', 'rugit,', 'tous', 'les', 'animal', 'se', 'cachent.'], correctPath: [0, 1, 0, 0, 1, 1, 0, 0, 1] },
  // Phrase correcte: "Lorsque les cloches sonnent, l'église se remplit de fidèles."
  { id: 299, level: 'C', row1: ['Lorsque', 'la', 'cloches', 'sonne,', 'les', "l'église", 'se', 'remplit', 'de', 'fidèle.'], row2: ['Lorsque', 'les', 'cloche', 'sonnent,', "l'église", 'églises', 'se', 'remplit', 'de', 'fidèles.'], correctPath: [0, 1, 0, 1, 1, 0, 0, 0, 0, 1] },
  // Phrase correcte: "Parce que les trains sont en retard, les voyageurs s'impatientent."
  { id: 300, level: 'C', row1: ['Parce', 'que', 'le', 'trains', 'est', 'en', 'retards,', 'le', 'voyageurs', "s'impatiente."], row2: ['Parce', 'que', 'les', 'train', 'sont', 'en', 'retard,', 'les', 'voyageur', "s'impatientent."], correctPath: [0, 0, 1, 0, 1, 0, 1, 1, 0, 1] },
];
