import type { HomeworkProfile, HomeworkQuestion } from '../lib/homework-plan';

type Reader = Exclude<HomeworkProfile, 'B-'>;
export interface ReadingSeed {
  theme: string;
  title: string;
  passages: Record<Reader, string[]>;
  questions: Record<Reader, [HomeworkQuestion, HomeworkQuestion]>;
  base: string[];
  short: string[];
  extension: string[];
  agreement: HomeworkQuestion;
}
const q = (prompt: string, answer: string, hint: string): HomeworkQuestion => ({ prompt, answer, hint });
const story = (short: string[], extra: string[], advanced: string[]) => ({ B: short, 'B+': [...short, ...extra], C: [...short, ...extra, ...advanced] });

/** Textes originaux. Corpus orthographiques : listes Dyna-Mots adaptées du projet, S8–S14. */
export const HOMEWORK_READINGS: Record<number, ReadingSeed> = {
  8: {
    theme: 'La campagne', title: 'Le panier de pommes',
    passages: story(['Lila ramasse des pommes.', 'Elle pose les fruits dans un panier.', 'Son papa porte le panier à la maison.'],
      ['Le panier est trop lourd pour Lila.', 'À la maison, ils préparent une compote.'],
      ['Lila garde deux pommes pour le goûter.', 'Elle remercie son papa : grâce à lui, aucun fruit ne reste dans le jardin.']),
    questions: {
      B: [q('Que ramasse Lila ?', 'Des pommes.', 'Relis la première phrase.'), q('Qui porte le panier ?', 'Son papa.', 'Relis la dernière phrase.')],
      'B+': [q('Que préparent Lila et son papa ?', 'Une compote.', 'Cherche ce qui se passe à la maison.'), q('Pourquoi son papa porte-t-il le panier ?', 'Le panier est trop lourd pour Lila.', 'Cherche la difficulté de Lila.')],
      C: [q('Raconte le trajet des pommes du jardin à la cuisine.', 'Lila les ramasse, les met dans le panier ; son papa le porte et ils préparent une compote.', 'Retrouve les actions dans leur ordre.'), q('Pourquoi Lila remercie-t-elle son papa ? Cite un indice.', 'Il l’aide à porter le panier trop lourd ; aucun fruit ne reste dans le jardin.', 'Relie la difficulté de Lila à la dernière phrase.')],
    },
    short: ['la campagne', 'les enfants jouent'],
    base: ['des journées joyeuses', 'à travers la campagne', 'les enfants jouent'],
    extension: ['un délicieux gâteau', 'les noix', 'ils aident', 'Nous préparons une délicieuse salade aux noix.'],
    agreement: q('Dans « les enfants jouent », pourquoi le verbe se termine-t-il par -ent ?', 'Le sujet « les enfants » est au pluriel ; le verbe s’écrit jouent.', 'Remplace les enfants par ils.'),
  },
  9: {
    theme: 'Le concert de rock', title: 'Une place pour Sami',
    passages: story(['Lila va au concert avec Sami.', 'Sami ne voit pas la scène.', 'Lila lui montre une place devant.'],
      ['Un grand adulte était debout devant lui.', 'De sa nouvelle place, Sami voit les musiciens.'],
      ['Quand la guitare commence, il lève le pouce vers Lila.', 'Elle sourit puis écoute le premier morceau.']),
    questions: {
      B: [q('Avec qui Lila va-t-elle au concert ?', 'Avec Sami.', 'Relis la première phrase.'), q('Où se trouve la nouvelle place ?', 'Devant.', 'Relis ce que Lila montre.')],
      'B+': [q('Quel problème rencontre Sami ?', 'Il ne voit pas la scène.', 'Relis le début.'), q('Pourquoi voit-il mieux à la nouvelle place ?', 'Le grand adulte n’est plus devant lui.', 'Relie les deux dernières phrases au début.')],
      C: [q('Comment Lila résout-elle le problème de Sami ?', 'Elle lui montre une place devant, où il voit les musiciens.', 'Explique le problème puis l’action de Lila.'), q('Que peut signifier le pouce levé de Sami ? Justifie.', 'Il montre que tout va bien ou remercie Lila : maintenant, il voit la scène.', 'Compare sa situation avant et après le changement de place.')],
    },
    short: ['la salle', 'la musique', 'les fans'],
    base: ['la salle de concert', 'les fans impatients', 'il ovationne', 'les musiciens entrent'],
    extension: ['un solo endiablé', 'tu joues de la guitare'],
    agreement: q('Pourquoi écrit-on « les musiciens entrent » avec -ent ?', 'Plusieurs musiciens entrent ; le sujet peut être remplacé par ils.', 'Qui entre ? Un musicien ou plusieurs ?'),
  },
  10: {
    theme: 'Le cours de musique', title: 'Le rythme retrouvé',
    passages: story(['Sami joue du tambour.', 'Il va trop vite.', 'Lila frappe doucement dans ses mains.', 'Sami suit le rythme de Lila.'],
      ['Le professeur leur demande de recommencer ensemble.'],
      ['Cette fois, le tambour et les mains s’arrêtent au même moment.', 'Sami peut enfin jouer avec les autres.']),
    questions: {
      B: [q('De quel instrument joue Sami ?', 'Du tambour.', 'Relis la première phrase.'), q('Que fait Lila avec ses mains ?', 'Elle frappe doucement dans ses mains.', 'Relis la troisième phrase.')],
      'B+': [q('Pourquoi doivent-ils recommencer ensemble ?', 'Sami allait trop vite ; ils doivent jouer au même rythme.', 'Compare les actions de Sami et de Lila.'), q('Comment Lila aide-t-elle Sami ?', 'Elle lui donne un rythme en frappant doucement dans ses mains.', 'Cherche ce que Sami suit.')],
      C: [q('Explique la difficulté, l’aide et le résultat.', 'Sami joue trop vite ; Lila lui donne un rythme ; il réussit à jouer avec les autres.', 'Appuie-toi sur le début, le milieu et la fin.'), q('Quelle phrase montre qu’ils jouent maintenant ensemble ?', '« Le tambour et les mains s’arrêtent au même moment. »', 'Cherche un événement qui se produit au même instant.')],
    },
    short: ['la musique', 'le piano', 'un cours'],
    base: ['un cours de musique', 'elles récupèrent', 'sous la direction', 'ils interprètent'],
    extension: ["j'écoute avec attention", 'il corrige'],
    agreement: q('Dans « elles récupèrent », qui fait l’action ?', 'Elles : plusieurs personnes. Le verbe porte -ent.', 'Observe le pronom placé devant le verbe.'),
  },
  11: {
    theme: 'Le voyage en montgolfière', title: 'Dans le ciel',
    passages: story(['Lila monte dans une montgolfière.', 'Sami reste au sol.', 'Il agite un foulard rouge.', 'Lila lui fait un signe.'],
      ['La montgolfière monte doucement au-dessus des champs.'],
      ['Lila distingue encore le foulard, mais elle ne peut plus entendre Sami.', 'Elle regarde la rivière qui traverse le paysage.']),
    questions: {
      B: [q('Qui reste au sol ?', 'Sami.', 'Relis la deuxième phrase.'), q('De quelle couleur est le foulard ?', 'Rouge.', 'Cherche le mot après foulard.')],
      'B+': [q('Où se trouve Lila ?', 'Dans la montgolfière.', 'Relis le début.'), q('Comment les deux amis se saluent-ils ?', 'Sami agite son foulard et Lila lui fait un signe.', 'Retrouve les deux gestes.')],
      C: [q('Décris ce que Lila voit depuis la montgolfière.', 'Les champs, le foulard rouge et la rivière.', 'Cherche les éléments du paysage et le signe de Sami.'), q('Pourquoi les gestes sont-ils utiles pour se parler ici ?', 'Lila est trop loin pour entendre Sami, mais elle voit encore son foulard.', 'Compare ce qu’elle peut voir et entendre.')],
    },
    short: ['le ciel', 'une lumière', 'le paysage'],
    base: ['le ciel est dégagé', 'une lumière orangée', 'tu défiles doucement', 'au-dessus du paysage'],
    extension: ['ils déclinent', 'il brille désormais'],
    agreement: q('Pourquoi écrit-on « une lumière orangée » avec un e à orangée ?', 'L’adjectif s’accorde avec lumière, un nom féminin.', 'Observe le déterminant une.'),
  },
  12: {
    theme: 'Le marché de Noël', title: 'Au marché',
    passages: {
      B: ['Lila va au marché.', 'Elle voit des guirlandes.', 'Sami choisit une étoile pour le sapin.'],
      'B+': ['Lila et Sami visitent le marché de Noël.', 'Ils regardent les guirlandes et les étoiles.', 'Sami choisit une petite étoile.', 'Il veut la placer en haut du sapin.', 'Lila la range dans un sac pour la protéger.'],
      C: ['Un marché de Noël rassemble des stands pendant une partie de l’hiver.', 'Certains proposent des décorations, d’autres des aliments.', 'Un artisan fabrique les objets qu’il vend.', 'Il peut utiliser du bois, du tissu ou du papier.', 'Les objets fragiles doivent être protégés pour le transport.', 'Les commerçants les enveloppent ou les placent dans une boîte.', 'Pour trouver un stand, on peut consulter le plan du marché.'],
    },
    questions: {
      B: [q('Que voit Lila au marché ?', 'Des guirlandes.', 'Relis la deuxième phrase.'), q('Que choisit Sami ?', 'Une étoile.', 'Relis la dernière phrase.')],
      'B+': [q('Où Sami veut-il placer son étoile ?', 'En haut du sapin.', 'Relis la quatrième phrase.'), q('Pourquoi Lila range-t-elle l’étoile dans un sac ?', 'Pour la protéger.', 'Relis la fin.')],
      C: [q('Quelle différence y a-t-il entre un artisan et un simple revendeur dans ce texte ?', 'L’artisan fabrique lui-même les objets qu’il vend.', 'Relis la phrase qui définit artisan.'), q('Retrouve deux façons de protéger un objet fragile.', 'L’envelopper ou le placer dans une boîte.', 'Cherche le passage sur le transport.')],
    },
    short: ['le marché de Noël', 'une guirlande', 'ils chantent'],
    base: ['ils installent', 'le marché de Noël', 'une guirlande hivernale', 'les passants regardent', 'ils chantent'],
    extension: ['des châtaignes grillées', 'tu prépares'],
    agreement: q('Dans « les passants regardent », pourquoi regardent se termine-t-il par -ent ?', 'Le sujet les passants est au pluriel, comme ils.', 'Trouve qui regarde.'),
  },
  13: {
    theme: 'La ville', title: 'Se repérer en ville',
    passages: {
      B: ['Lila cherche la bibliothèque.', 'Elle regarde un plan.', 'La bibliothèque est près du parc.'],
      'B+': ['Lila cherche la bibliothèque avec Sami.', 'Ils s’arrêtent devant un plan de la ville.', 'Sami trouve le dessin du parc.', 'La bibliothèque est juste à côté.', 'Les deux amis savent maintenant où aller.'],
      C: ['Un plan représente un lieu vu de dessus.', 'Il aide à repérer les rues et les bâtiments.', 'Des symboles peuvent indiquer une école, un parc ou une bibliothèque.', 'La légende explique le sens de ces symboles.', 'Pour préparer un trajet, on repère le départ et l’arrivée.', 'On cherche ensuite les rues qui les relient.', 'Le chemin le plus court n’est pas toujours le plus pratique : on tient aussi compte des passages pour piétons.'],
    },
    questions: {
      B: [q('Que cherche Lila ?', 'La bibliothèque.', 'Relis la première phrase.'), q('Près de quel lieu est la bibliothèque ?', 'Du parc.', 'Relis la dernière phrase.')],
      'B+': [q('Quel dessin Sami trouve-t-il sur le plan ?', 'Le dessin du parc.', 'Relis la troisième phrase.'), q('Comment le parc les aide-t-il à trouver la bibliothèque ?', 'La bibliothèque est juste à côté du parc.', 'Relie les deux lieux.')],
      C: [q('À quoi sert la légende d’un plan ?', 'À expliquer le sens des symboles.', 'Cherche le mot légende.'), q('Pourquoi ne choisit-on pas toujours le chemin le plus court ?', 'Un autre trajet peut être plus pratique pour traverser aux passages pour piétons.', 'Relis la dernière phrase et donne un exemple.')],
    },
    short: ['la rue', 'des croissants', "j'observe"],
    base: ["j'observe", 'les animations de rue', 'tout autour de moi', 'des croissants chauds', 'est-ce que'],
    extension: ['ils traversent', 'sans prêter attention'],
    agreement: q('Dans « des croissants chauds », pourquoi chauds prend-il un s ?', 'Il s’accorde avec croissants, masculin pluriel.', 'Observe des et la fin du nom croissants.'),
  },
  14: {
    theme: 'Les animaux domestiques', title: 'Prendre soin d’un animal',
    passages: {
      B: ['Sami remplit le bol du chat.', 'Le chat boit de l’eau.', 'Puis il dort dans son panier.'],
      'B+': ['Sami accueille un chat à la maison.', 'Il remplit son bol d’eau.', 'Il prépare aussi un panier dans un endroit calme.', 'Le chat s’y installe pour dormir.', 'Sami attend son réveil pour jouer avec lui.'],
      C: ['Un animal domestique dépend des personnes qui s’occupent de lui.', 'Il a besoin d’une nourriture adaptée et d’eau propre.', 'Ses besoins varient selon son espèce et son âge.', 'Il lui faut aussi un endroit où se reposer tranquillement.', 'Les jeux et les sorties dépendent de l’animal : un chien et un poisson n’ont pas les mêmes besoins.', 'Observer son comportement aide à remarquer un changement.', 'Lorsqu’un animal semble malade, un adulte peut demander conseil à un vétérinaire.'],
    },
    questions: {
      B: [q('Que boit le chat ?', 'De l’eau.', 'Relis la deuxième phrase.'), q('Où dort le chat ?', 'Dans son panier.', 'Relis la dernière phrase.')],
      'B+': [q('Où Sami place-t-il le panier ?', 'Dans un endroit calme.', 'Relis la troisième phrase.'), q('Pourquoi Sami attend-il avant de jouer ?', 'Le chat dort ; il le laisse se reposer.', 'Relie les deux dernières phrases.')],
      C: [q('Cite trois besoins d’un animal présentés dans le texte.', 'Une nourriture adaptée, de l’eau propre et un lieu calme pour se reposer.', 'Relis les premières phrases.'), q('Pourquoi faut-il connaître l’animal dont on s’occupe ?', 'Les besoins varient selon l’espèce et l’âge ; les mêmes soins ne conviennent pas à tous.', 'Appuie-toi sur la comparaison du chien et du poisson.')],
    },
    short: ['un animal', 'tu aimes', 'un panier'],
    base: ['un animal de compagnie', 'prendre soin de lui', 'tu aimes', 'ils demandent', 'préfères-tu', 'son bien-être'],
    extension: ['un panier douillet', 'nous avons besoin'],
    agreement: q('Dans « ils demandent », pourquoi le verbe se termine-t-il par -ent ?', 'Le sujet ils est à la troisième personne du pluriel.', 'Compare il demande et ils demandent.'),
  },
};
