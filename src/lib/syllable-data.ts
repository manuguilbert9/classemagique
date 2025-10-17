import BallonImage from '../../public/images/syllables/ballon.png';
import BateauImage from '../../public/images/syllables/bateau.png';
import BananeImage from '../../public/images/syllables/banane.png';
import BonbonImage from '../../public/images/syllables/bonbon.png';
import CanardImage from '../../public/images/syllables/canard.png';
import CamionImage from '../../public/images/syllables/camion.png';
import CadeauImage from '../../public/images/syllables/cadeau.png';
import ChevalImage from '../../public/images/syllables/cheval.png';
import ChouchouImage from '../../public/images/syllables/chouchou.png';
import CitronImage from '../../public/images/syllables/citron.png';
import CochonImage from '../../public/images/syllables/cochon.png';
import DominoImage from '../../public/images/syllables/domino.png';
import FourmiImage from '../../public/images/syllables/fourmi.png';
import FuseeImage from '../../public/images/syllables/fusee.png';
import GateauImage from '../../public/images/syllables/gateau.png';
import GirafeImage from '../../public/images/syllables/girafe.png';
import LapinImage from '../../public/images/syllables/lapin.png';
import LitImage from '../../public/images/syllables/lit.png';
import LuneImage from '../../public/images/syllables/lune.png';
import MaisonImage from '../../public/images/syllables/maison.png';
import MotoImage from '../../public/images/syllables/moto.png';
import MoutonImage from '../../public/images/syllables/mouton.png';
import MurImage from '../../public/images/syllables/mur.png';
import PapaImage from '../../public/images/syllables/papa.png';
import PapillonImage from '../../public/images/syllables/papillon.png';
import PizzaImage from '../../public/images/syllables/pizza.png';
import PommeImage from '../../public/images/syllables/pomme.png';
import PouleImage from '../../public/images/syllables/poule.png';
import RatImage from '../../public/images/syllables/rat.png';
import RobotImage from '../../public/images/syllables/robot.png';
import SapinImage from '../../public/images/syllables/sapin.png';
import SacImage from '../../public/images/syllables/sac.png';
import SireneImage from '../../public/images/syllables/sirene.png';
import SucreImage from '../../public/images/syllables/sucre.png';
import TapisImage from '../../public/images/syllables/tapis.png';
import TasseImage from '../../public/images/syllables/tasse.png';
import TomateImage from '../../public/images/syllables/tomate.png';
import VacheImage from '../../public/images/syllables/vache.png';
import VeloImage from '../../public/images/syllables/velo.png';
import VoitureImage from '../../public/images/syllables/voiture.png';


export interface SyllableData {
    sounds: string[]; // Array of phonetic sounds in the word (e.g., ["b", "a", "l", "on"])
    word: string;
    image: string; // Path to the image
}

export const syllableAttackData: SyllableData[] = [
  // Mots avec son [a]
  { sounds: ['a', 'r', 'b', 'r'], word: 'arbre', image: '' },
  { sounds: ['a', 'v', 'j', 'on'], word: 'avion', image: '' },
  { sounds: ['a', 'm', 'i'], word: 'ami', image: '' },
  { sounds: ['a', 'n', 'a', 'n', 'a'], word: 'ananas', image: '' },
  { sounds: ['a', 'b', 'è', 'j'], word: 'abeille', image: '' },
  { sounds: ['a', 'n'], word: 'âne', image: '' },
  { sounds: ['a', 's', 'j', 'è', 't'], word: 'assiette', image: '' },
  { sounds: ['a', 'n', 'o', 'r', 'a', 'k'], word: 'anorak', image: '' },
  { sounds: ['a', 'r', 'è', 'gn', 'é'], word: 'araignée', image: '' },
  { sounds: ['a', 's', 'an', 's', 'eu', 'r'], word: 'ascenseur', image: '' },

  // Mots avec son [b]
  { sounds: ['b', 'a', 'l', 'on'], word: 'ballon', image: BallonImage.src },
  { sounds: ['b', 'a', 't', 'o'], word: 'bateau', image: BateauImage.src },
  { sounds: ['b', 'a', 'n', 'a', 'n'], word: 'banane', image: BananeImage.src },
  { sounds: ['b', 'on', 'b', 'on'], word: 'bonbon', image: BonbonImage.src },
  { sounds: ['b', 'é', 'b', 'é'], word: 'bébé', image: '' },
  { sounds: ['b', 'a', 'l', 'è', 'n'], word: 'baleine', image: '' },
  { sounds: ['b', 'i', 'j'], word: 'bille', image: '' },
  { sounds: ['b', 'ou', 't', 'on'], word: 'bouton', image: '' },
  { sounds: ['b', 'oi', 't'], word: 'boîte', image: '' },
  { sounds: ['b', 'r', 'o', 's'], word: 'brosse', image: '' },
  { sounds: ['b', 'u', 'r', 'o'], word: 'bureau', image: '' },
  { sounds: ['b', 'a', 'g'], word: 'bague', image: '' },

  // Mots avec son [k]
  { sounds: ['k', 'a', 'n', 'a', 'r'], word: 'canard', image: CanardImage.src },
  { sounds: ['k', 'a', 'm', 'j', 'on'], word: 'camion', image: CamionImage.src },
  { sounds: ['k', 'a', 'd', 'o'], word: 'cadeau', image: CadeauImage.src },
  { sounds: ['k', 'a', 'r', 'o', 't'], word: 'carotte', image: '' },
  { sounds: ['k', 'o', 'ch', 'on'], word: 'cochon', image: CochonImage.src },
  { sounds: ['k', 'o', 'a', 'l', 'a'], word: 'koala', image: '' },
  { sounds: ['k', 'an', 'g', 'ou', 'r', 'ou'], word: 'kangourou', image: '' },
  { sounds: ['k', 'i', 'oi'], word: 'kiwi', image: '' },
  { sounds: ['k', 'a', 'r', 'a', 't', 'é'], word: 'karaté', image: '' },
  { sounds: ['k', 'a', 'j', 'a', 'k'], word: 'kayak', image: '' },
  { sounds: ['k', 'a', 't', 'r'], word: 'quatre', image: '' },
  { sounds: ['k', 'eu'], word: 'queue', image: '' },
  { sounds: ['k', 'è'], word: 'quai', image: '' },
  { sounds: ['k', 'in', 'z'], word: 'quinze', image: '' },

  // Mots avec son [ch]
  { sounds: ['ch', 'e', 'v', 'a', 'l'], word: 'cheval', image: ChevalImage.src },
  { sounds: ['ch', 'ou', 'ch', 'ou'], word: 'chouchou', image: ChouchouImage.src },
  { sounds: ['ch', 'a', 't', 'o'], word: 'château', image: '' },
  { sounds: ['ch', 'a', 'p', 'o'], word: 'chapeau', image: '' },
  { sounds: ['ch', 'o', 'k', 'o', 'l', 'a'], word: 'chocolat', image: '' },
  { sounds: ['ch', 'a'], word: 'chat', image: '' },
  { sounds: ['ch', 'j', 'in'], word: 'chien', image: '' },
  { sounds: ['ch', 'o', 's', 'u', 'r'], word: 'chaussure', image: '' },
  { sounds: ['ch', 'an', 'b', 'r'], word: 'chambre', image: '' },
  { sounds: ['ch', 'e', 'm', 'i', 'n', 'é'], word: 'cheminée', image: '' },

  // Mots avec son [s]
  { sounds: ['s', 'a', 'p', 'in'], word: 'sapin', image: SapinImage.src },
  { sounds: ['s', 'a', 'k'], word: 'sac', image: SacImage.src },
  { sounds: ['s', 'i', 'r', 'è', 'n'], word: 'sirène', image: SireneImage.src },
  { sounds: ['s', 'u', 'k', 'r'], word: 'sucre', image: SucreImage.src },
  { sounds: ['s', 'o', 'l', 'è', 'j'], word: 'soleil', image: '' },
  { sounds: ['s', 'è', 'r', 'p', 'an'], word: 'serpent', image: '' },
  { sounds: ['s', 'in', 'j'], word: 'singe', image: '' },
  { sounds: ['s', 'ou', 'r', 'i'], word: 'souris', image: '' },
  { sounds: ['s', 'a', 'v', 'on'], word: 'savon', image: '' },
  { sounds: ['s', 'o', 'r', 's', 'j', 'è', 'r'], word: 'sorcière', image: '' },
  { sounds: ['s', 'i', 't', 'r', 'on'], word: 'citron', image: CitronImage.src },
  { sounds: ['s', 'e', 'r', 'i', 'z'], word: 'cerise', image: '' },

  // Mots avec son [d]
  { sounds: ['d', 'o', 'm', 'i', 'n', 'o'], word: 'domino', image: DominoImage.src },
  { sounds: ['d', 'an'], word: 'dent', image: '' },
  { sounds: ['d', 'i', 'n', 'o', 'z', 'o', 'r'], word: 'dinosaure', image: '' },
  { sounds: ['d', 'r', 'a', 'p', 'o'], word: 'drapeau', image: '' },
  { sounds: ['d', 'o', 'f', 'in'], word: 'dauphin', image: '' },
  { sounds: ['d', 'in', 'd', 'on'], word: 'dindon', image: '' },
  { sounds: ['d', 'ou', 'ch'], word: 'douche', image: '' },
  { sounds: ['d', 'eu'], word: 'deux', image: '' },
  { sounds: ['d', 'r', 'a', 'g', 'on'], word: 'dragon', image: '' },
  { sounds: ['d', 'oi'], word: 'doigt', image: '' },

  // Mots avec son [é] / [è]
  { sounds: ['é', 'l', 'é', 'f', 'an'], word: 'éléphant', image: '' },
  { sounds: ['é', 'k', 'o', 'l'], word: 'école', image: '' },
  { sounds: ['è', 's', 'k', 'a', 'r', 'g', 'o'], word: 'escargot', image: '' },
  { sounds: ['é', 'p', 'é'], word: 'épée', image: '' },
  { sounds: ['é', 't', 'oi', 'l'], word: 'étoile', image: '' },
  { sounds: ['è', 's', 'k', 'a', 'l', 'j', 'é'], word: 'escalier', image: '' },
  { sounds: ['é', 'k', 'u', 'r', 'eu', 'j'], word: 'écureuil', image: '' },
  { sounds: ['é', 'ch', 'a', 'r', 'p'], word: 'écharpe', image: '' },

  // Mots avec son [f]
  { sounds: ['f', 'ou', 'r', 'm', 'i'], word: 'fourmi', image: FourmiImage.src },
  { sounds: ['f', 'u', 'z', 'é'], word: 'fusée', image: FuseeImage.src },
  { sounds: ['f', 'e', 'n', 'è', 't', 'r'], word: 'fenêtre', image: '' },
  { sounds: ['f', 'r', 'o', 'm', 'a', 'j'], word: 'fromage', image: '' },
  { sounds: ['f', 'i', 'j'], word: 'fille', image: '' },
  { sounds: ['f', 'l', 'eu', 'r'], word: 'fleur', image: '' },
  { sounds: ['f', 'r', 'è', 'z'], word: 'fraise', image: '' },
  { sounds: ['f', 'ou', 'r', 'ch', 'è', 't'], word: 'fourchette', image: '' },
  { sounds: ['f', 'eu'], word: 'feu', image: '' },
  { sounds: ['f', 'o', 'r', 'è'], word: 'forêt', image: '' },

  // Mots avec son [g]
  { sounds: ['g', 'a', 't', 'o'], word: 'gâteau', image: GateauImage.src },
  { sounds: ['g', 'i', 't', 'a', 'r'], word: 'guitare', image: '' },
  { sounds: ['g', 'an'], word: 'gant', image: '' },
  { sounds: ['g', 'r', 'e', 'n', 'ou', 'j'], word: 'grenouille', image: '' },
  { sounds: ['g', 'o', 'm'], word: 'gomme', image: '' },
  { sounds: ['g', 'ou', 't'], word: 'goutte', image: '' },
  { sounds: ['g', 'a', 'r', 'a', 'j'], word: 'garage', image: '' },
  { sounds: ['g', 'a', 'r'], word: 'gare', image: '' },
  { sounds: ['g', 'o', 'r', 'i', 'j'], word: 'gorille', image: '' },

  // Mots avec son [i]
  { sounds: ['i', 'g', 'l', 'ou'], word: 'igloo', image: '' },
  { sounds: ['i', 'l'], word: 'île', image: '' },
  { sounds: ['in', 's', 'è', 'k', 't'], word: 'insecte', image: '' },
  { sounds: ['i', 'm', 'a', 'j'], word: 'image', image: '' },
  { sounds: ['in', 'd', 'j', 'in'], word: 'indien', image: '' },
  { sounds: ['i', 'gn', 'a', 'm'], word: 'igname', image: '' },
  { sounds: ['in', 'p', 'r', 'i', 'm', 'an', 't'], word: 'imprimante', image: '' },

  // Mots avec son [j]
  { sounds: ['j', 'a', 'r', 'd', 'in'], word: 'jardin', image: '' },
  { sounds: ['j', 'ou'], word: 'joue', image: '' },
  { sounds: ['j', 'u', 'p'], word: 'jupe', image: '' },
  { sounds: ['j', 'an', 'b'], word: 'jambe', image: '' },
  { sounds: ['j', 'ou', 'r', 'n', 'a', 'l'], word: 'journal', image: '' },
  { sounds: ['j', 'ou', 'è'], word: 'jouet', image: '' },
  { sounds: ['j', 'u', 'd', 'o'], word: 'judo', image: '' },
  { sounds: ['j', 'o', 'n'], word: 'jaune', image: '' },
  { sounds: ['j', 'i', 'r', 'a', 'f'], word: 'girafe', image: GirafeImage.src },
  { sounds: ['j', 'i', 'l', 'è'], word: 'gilet', image: '' },

  // Mots avec son [l]
  { sounds: ['l', 'a', 'p', 'in'], word: 'lapin', image: LapinImage.src },
  { sounds: ['l', 'i'], word: 'lit', image: LitImage.src },
  { sounds: ['l', 'u', 'n'], word: 'lune', image: LuneImage.src },
  { sounds: ['l', 'j', 'on'], word: 'lion', image: '' },
  { sounds: ['l', 'ou'], word: 'loup', image: '' },
  { sounds: ['l', 'i', 'v', 'r'], word: 'livre', image: '' },
  { sounds: ['l', 'u', 'n', 'è', 't'], word: 'lunettes', image: '' },
  { sounds: ['l', 'an', 'p'], word: 'lampe', image: '' },
  { sounds: ['l', 'é', 'g', 'u', 'm'], word: 'légume', image: '' },
  { sounds: ['l', 'a', 'v', 'a', 'b', 'o'], word: 'lavabo', image: '' },

  // Mots avec son [m]
  { sounds: ['m', 'è', 'z', 'on'], word: 'maison', image: MaisonImage.src },
  { sounds: ['m', 'o', 't', 'o'], word: 'moto', image: MotoImage.src },
  { sounds: ['m', 'ou', 't', 'on'], word: 'mouton', image: MoutonImage.src },
  { sounds: ['m', 'u', 'r'], word: 'mur', image: MurImage.src },
  { sounds: ['m', 'a', 'm', 'an'], word: 'maman', image: '' },
  { sounds: ['m', 'è', 'r'], word: 'mer', image: '' },
  { sounds: ['m', 'in'], word: 'main', image: '' },
  { sounds: ['m', 'a', 'r', 't', 'o'], word: 'marteau', image: '' },
  { sounds: ['m', 'ou', 'ch'], word: 'mouche', image: '' },
  { sounds: ['m', 'on', 't', 'a', 'gn'], word: 'montagne', image: '' },

  // Mots avec son [n]
  { sounds: ['n', 'é'], word: 'nez', image: '' },
  { sounds: ['n', 'u', 'a', 'j'], word: 'nuage', image: '' },
  { sounds: ['n', 'è', 'j'], word: 'neige', image: '' },
  { sounds: ['n', 'ui'], word: 'nuit', image: '' },
  { sounds: ['n', 'ou', 'n', 'ou', 'r', 's'], word: 'nounours', image: '' },
  { sounds: ['n', 'a', 'v', 'i', 'r'], word: 'navire', image: '' },
  { sounds: ['n', 'a', 't', 'u', 'r'], word: 'nature', image: '' },
  { sounds: ['n', 'on', 'b', 'r'], word: 'nombre', image: '' },
  { sounds: ['n', 'i'], word: 'nid', image: '' },
  { sounds: ['n', 'eu'], word: 'nœud', image: '' },

  // Mots avec son [o]
  { sounds: ['oi', 'z', 'o'], word: 'oiseau', image: '' },
  { sounds: ['o', 'r', 'an', 'j'], word: 'orange', image: '' },
  { sounds: ['o', 'r', 'd', 'i', 'n', 'a', 't', 'eu', 'r'], word: 'ordinateur', image: '' },
  { sounds: ['o', 'r', 'è', 'j'], word: 'oreille', image: '' },
  { sounds: ['o', 'l', 'i', 'v'], word: 'olive', image: '' },
  { sounds: ['ou', 'r', 's', 'on'], word: 'ourson', image: '' },
  { sounds: ['ou', 'r', 's'], word: 'ours', image: '' },
  { sounds: ['o'], word: 'eau', image: '' },
  { sounds: ['o', 'p', 'i', 't', 'a', 'l'], word: 'hôpital', image: '' },

  // Mots avec son [p]
  { sounds: ['p', 'a', 'p', 'a'], word: 'papa', image: PapaImage.src },
  { sounds: ['p', 'a', 'p', 'i', 'j', 'on'], word: 'papillon', image: PapillonImage.src },
  { sounds: ['p', 'i', 'd', 'z', 'a'], word: 'pizza', image: PizzaImage.src },
  { sounds: ['p', 'o', 'm'], word: 'pomme', image: PommeImage.src },
  { sounds: ['p', 'ou', 'l'], word: 'poule', image: PouleImage.src },
  { sounds: ['p', 'in'], word: 'pain', image: '' },
  { sounds: ['p', 'oi', 'r'], word: 'poire', image: '' },
  { sounds: ['p', 'o', 'r', 't'], word: 'porte', image: '' },
  { sounds: ['p', 'ou', 'p', 'é'], word: 'poupée', image: '' },
  { sounds: ['p', 'oi', 's', 'on'], word: 'poisson', image: '' },
  { sounds: ['p', 'l', 'u', 'm'], word: 'plume', image: '' },

  // Mots avec son [r]
  { sounds: ['r', 'a'], word: 'rat', image: RatImage.src },
  { sounds: ['r', 'o', 'b', 'o'], word: 'robot', image: RobotImage.src },
  { sounds: ['r', 'o', 'b'], word: 'robe', image: '' },
  { sounds: ['r', 'e', 'n', 'a', 'r'], word: 'renard', image: '' },
  { sounds: ['r', 'oi'], word: 'roi', image: '' },
  { sounds: ['r', 'i', 'v', 'j', 'è', 'r'], word: 'rivière', image: '' },
  { sounds: ['r', 'u', 'ch'], word: 'ruche', image: '' },
  { sounds: ['r', 'è', 'z', 'in'], word: 'raisin', image: '' },
  { sounds: ['r', 'ou', 't'], word: 'route', image: '' },
  { sounds: ['r', 'i', 'd', 'o'], word: 'rideau', image: '' },

  // Mots avec son [t]
  { sounds: ['t', 'a', 'p', 'i'], word: 'tapis', image: TapisImage.src },
  { sounds: ['t', 'a', 's'], word: 'tasse', image: TasseImage.src },
  { sounds: ['t', 'o', 'm', 'a', 't'], word: 'tomate', image: TomateImage.src },
  { sounds: ['t', 'a', 'b', 'l'], word: 'table', image: '' },
  { sounds: ['t', 'i', 'g', 'r'], word: 'tigre', image: '' },
  { sounds: ['t', 'o', 'r', 't', 'u'], word: 'tortue', image: '' },
  { sounds: ['t', 'u', 'l', 'i', 'p'], word: 'tulipe', image: '' },
  { sounds: ['t', 'r', 'é', 'z', 'o', 'r'], word: 'trésor', image: '' },
  { sounds: ['t', 'r', 'in'], word: 'train', image: '' },
  { sounds: ['t', 'é', 'l', 'é', 'f', 'o', 'n'], word: 'téléphone', image: '' },

  // Mots avec son [u]
  { sounds: ['u', 'z', 'i', 'n'], word: 'usine', image: '' },
  { sounds: ['u', 'n', 'i', 'f', 'o', 'r', 'm'], word: 'uniforme', image: '' },
  { sounds: ['u', 'n', 'i', 'v', 'è', 'r'], word: 'univers', image: '' },
  { sounds: ['u', 'r', 'j', 'an'], word: 'urgent', image: '' },
  { sounds: ['u', 't', 'i', 'l'], word: 'utile', image: '' },
  { sounds: ['u', 'r', 'u', 's'], word: 'urus', image: '' },

  // Mots avec son [v]
  { sounds: ['v', 'a', 'ch'], word: 'vache', image: VacheImage.src },
  { sounds: ['v', 'é', 'l', 'o'], word: 'vélo', image: VeloImage.src },
  { sounds: ['v', 'oi', 't', 'u', 'r'], word: 'voiture', image: VoitureImage.src },
  { sounds: ['v', 'è', 'r'], word: 'vert', image: '' },
  { sounds: ['v', 'è', 'r'], word: 'verre', image: '' },
  { sounds: ['v', 'j', 'o', 'l', 'on'], word: 'violon', image: '' },
  { sounds: ['v', 'i', 'l'], word: 'ville', image: '' },
  { sounds: ['v', 'an', 't', 'r'], word: 'ventre', image: '' },
  { sounds: ['v', 'a', 'g'], word: 'vague', image: '' },
  { sounds: ['v', 'a', 'l', 'i', 'z'], word: 'valise', image: '' },

  // Mots avec son [w]
  { sounds: ['v', 'a', 'g', 'on'], word: 'wagon', image: '' },
  { sounds: ['w', 'a', 'p', 'i', 't', 'i'], word: 'wapiti', image: '' },
  { sounds: ['w', 'i', 'k', 'è', 'n', 'd'], word: 'weekend', image: '' },

  // Mots avec son [z]
  { sounds: ['z', 'è', 'b', 'r'], word: 'zèbre', image: '' },
  { sounds: ['z', 'o'], word: 'zoo', image: '' },
  { sounds: ['z', 'é', 'r', 'o'], word: 'zéro', image: '' },
  { sounds: ['z', 'o', 'n'], word: 'zone', image: '' },
  { sounds: ['z', 'i', 'g', 'z', 'a', 'g'], word: 'zigzag', image: '' },
  { sounds: ['z', 'é', 'n', 'i', 't'], word: 'zénith', image: '' },

  // Mots avec h aspiré
  { sounds: ['é', 'r', 'i', 's', 'on'], word: 'hérisson', image: '' },
  { sounds: ['i', 'b', 'ou'], word: 'hibou', image: '' },
  { sounds: ['a', 'r', 'i', 'k', 'o'], word: 'haricot', image: '' },
  { sounds: ['é', 'l', 'i', 'k', 'o', 'p', 't', 'è', 'r'], word: 'hélicoptère', image: '' },
  { sounds: ['a', 'm', 's', 't', 'è', 'r'], word: 'hamster', image: '' },
  { sounds: ['a', 'b', 'i'], word: 'habit', image: '' },
  { sounds: ['ui', 't', 'r'], word: 'huître', image: '' },
  { sounds: ['a', 'ch'], word: 'hache', image: '' },

  // Mots avec y
  { sounds: ['j', 'o', 'g', 'a'], word: 'yoga', image: '' },
  { sounds: ['j', 'a', 'ou', 'r'], word: 'yaourt', image: '' },
  { sounds: ['j', 'eu'], word: 'yeux', image: '' },
  { sounds: ['j', 'o', 'j', 'o'], word: 'yoyo', image: '' },
  { sounds: ['j', 'o', 't'], word: 'yacht', image: '' },

  // Mots avec x
  { sounds: ['g', 'z', 'i', 'l', 'o', 'f', 'o', 'n'], word: 'xylophone', image: '' },
  { sounds: ['è', 'g', 'z', 'a', 'm', 'in'], word: 'examen', image: '' },
];
