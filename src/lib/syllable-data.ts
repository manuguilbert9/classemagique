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
    sound: string; // Phonetic sound (e.g., "b", "ch", "f", "a")
    word: string;
    image: string; // Path to the image
}

export const syllableAttackData: SyllableData[] = [
  // Son [a]
  { sound: 'a', word: 'arbre', image: '' },
  { sound: 'a', word: 'avion', image: '' },
  { sound: 'a', word: 'ami', image: '' },
  { sound: 'a', word: 'ananas', image: '' },
  { sound: 'a', word: 'abeille', image: '' },
  { sound: 'a', word: 'âne', image: '' },
  { sound: 'a', word: 'assiette', image: '' },
  { sound: 'a', word: 'anorak', image: '' },
  { sound: 'a', word: 'araignée', image: '' },
  { sound: 'a', word: 'ascenseur', image: '' },

  // Son [b]
  { sound: 'b', word: 'ballon', image: BallonImage.src },
  { sound: 'b', word: 'bateau', image: BateauImage.src },
  { sound: 'b', word: 'banane', image: BananeImage.src },
  { sound: 'b', word: 'bonbon', image: BonbonImage.src },
  { sound: 'b', word: 'bébé', image: '' },
  { sound: 'b', word: 'baleine', image: '' },
  { sound: 'b', word: 'bille', image: '' },
  { sound: 'b', word: 'bouton', image: '' },
  { sound: 'b', word: 'boîte', image: '' },
  { sound: 'b', word: 'brosse', image: '' },
  { sound: 'b', word: 'bureau', image: '' },
  { sound: 'b', word: 'bague', image: '' },

  // Son [k] (c dur, k, qu)
  { sound: 'k', word: 'canard', image: CanardImage.src },
  { sound: 'k', word: 'camion', image: CamionImage.src },
  { sound: 'k', word: 'cadeau', image: CadeauImage.src },
  { sound: 'k', word: 'carotte', image: '' },
  { sound: 'k', word: 'cochon', image: CochonImage.src },
  { sound: 'k', word: 'koala', image: '' },
  { sound: 'k', word: 'kangourou', image: '' },
  { sound: 'k', word: 'kiwi', image: '' },
  { sound: 'k', word: 'karaté', image: '' },
  { sound: 'k', word: 'kayak', image: '' },
  { sound: 'k', word: 'quatre', image: '' },
  { sound: 'k', word: 'queue', image: '' },
  { sound: 'k', word: 'quai', image: '' },
  { sound: 'k', word: 'quinze', image: '' },

  // Son [ch]
  { sound: 'ch', word: 'cheval', image: ChevalImage.src },
  { sound: 'ch', word: 'chouchou', image: ChouchouImage.src },
  { sound: 'ch', word: 'château', image: '' },
  { sound: 'ch', word: 'chapeau', image: '' },
  { sound: 'ch', word: 'chocolat', image: '' },
  { sound: 'ch', word: 'chat', image: '' },
  { sound: 'ch', word: 'chien', image: '' },
  { sound: 'ch', word: 'chaussure', image: '' },
  { sound: 'ch', word: 'chambre', image: '' },
  { sound: 'ch', word: 'cheminée', image: '' },

  // Son [s] (s, c doux)
  { sound: 's', word: 'sapin', image: SapinImage.src },
  { sound: 's', word: 'sac', image: SacImage.src },
  { sound: 's', word: 'sirène', image: SireneImage.src },
  { sound: 's', word: 'sucre', image: SucreImage.src },
  { sound: 's', word: 'soleil', image: '' },
  { sound: 's', word: 'serpent', image: '' },
  { sound: 's', word: 'singe', image: '' },
  { sound: 's', word: 'souris', image: '' },
  { sound: 's', word: 'savon', image: '' },
  { sound: 's', word: 'sorcière', image: '' },
  { sound: 's', word: 'citron', image: CitronImage.src },
  { sound: 's', word: 'cerise', image: '' },

  // Son [d]
  { sound: 'd', word: 'domino', image: DominoImage.src },
  { sound: 'd', word: 'dent', image: '' },
  { sound: 'd', word: 'dinosaure', image: '' },
  { sound: 'd', word: 'drapeau', image: '' },
  { sound: 'd', word: 'dauphin', image: '' },
  { sound: 'd', word: 'dindon', image: '' },
  { sound: 'd', word: 'douche', image: '' },
  { sound: 'd', word: 'deux', image: '' },
  { sound: 'd', word: 'dragon', image: '' },
  { sound: 'd', word: 'doigt', image: '' },

  // Son [e] / [é]
  { sound: 'e', word: 'éléphant', image: '' },
  { sound: 'e', word: 'école', image: '' },
  { sound: 'e', word: 'escargot', image: '' },
  { sound: 'e', word: 'épée', image: '' },
  { sound: 'e', word: 'étoile', image: '' },
  { sound: 'e', word: 'escalier', image: '' },
  { sound: 'e', word: 'écureuil', image: '' },
  { sound: 'e', word: 'écharpe', image: '' },

  // Son [f]
  { sound: 'f', word: 'fourmi', image: FourmiImage.src },
  { sound: 'f', word: 'fusée', image: FuseeImage.src },
  { sound: 'f', word: 'fenêtre', image: '' },
  { sound: 'f', word: 'fromage', image: '' },
  { sound: 'f', word: 'fille', image: '' },
  { sound: 'f', word: 'fleur', image: '' },
  { sound: 'f', word: 'fraise', image: '' },
  { sound: 'f', word: 'fourchette', image: '' },
  { sound: 'f', word: 'feu', image: '' },
  { sound: 'f', word: 'forêt', image: '' },

  // Son [g] (g dur)
  { sound: 'g', word: 'gâteau', image: GateauImage.src },
  { sound: 'g', word: 'guitare', image: '' },
  { sound: 'g', word: 'gant', image: '' },
  { sound: 'g', word: 'grenouille', image: '' },
  { sound: 'g', word: 'gomme', image: '' },
  { sound: 'g', word: 'goutte', image: '' },
  { sound: 'g', word: 'garage', image: '' },
  { sound: 'g', word: 'gare', image: '' },
  { sound: 'g', word: 'gorille', image: '' },

  // Son [i]
  { sound: 'i', word: 'igloo', image: '' },
  { sound: 'i', word: 'île', image: '' },
  { sound: 'i', word: 'insecte', image: '' },
  { sound: 'i', word: 'image', image: '' },
  { sound: 'i', word: 'indien', image: '' },
  { sound: 'i', word: 'igname', image: '' },
  { sound: 'i', word: 'imprimante', image: '' },

  // Son [j] (j, g doux)
  { sound: 'j', word: 'jardin', image: '' },
  { sound: 'j', word: 'joue', image: '' },
  { sound: 'j', word: 'jupe', image: '' },
  { sound: 'j', word: 'jambe', image: '' },
  { sound: 'j', word: 'journal', image: '' },
  { sound: 'j', word: 'jouet', image: '' },
  { sound: 'j', word: 'judo', image: '' },
  { sound: 'j', word: 'jaune', image: '' },
  { sound: 'j', word: 'girafe', image: GirafeImage.src },
  { sound: 'j', word: 'gilet', image: '' },

  // Son [l]
  { sound: 'l', word: 'lapin', image: LapinImage.src },
  { sound: 'l', word: 'lit', image: LitImage.src },
  { sound: 'l', word: 'lune', image: LuneImage.src },
  { sound: 'l', word: 'lion', image: '' },
  { sound: 'l', word: 'loup', image: '' },
  { sound: 'l', word: 'livre', image: '' },
  { sound: 'l', word: 'lunettes', image: '' },
  { sound: 'l', word: 'lampe', image: '' },
  { sound: 'l', word: 'légume', image: '' },
  { sound: 'l', word: 'lavabo', image: '' },

  // Son [m]
  { sound: 'm', word: 'maison', image: MaisonImage.src },
  { sound: 'm', word: 'moto', image: MotoImage.src },
  { sound: 'm', word: 'mouton', image: MoutonImage.src },
  { sound: 'm', word: 'mur', image: MurImage.src },
  { sound: 'm', word: 'maman', image: '' },
  { sound: 'm', word: 'mer', image: '' },
  { sound: 'm', word: 'main', image: '' },
  { sound: 'm', word: 'marteau', image: '' },
  { sound: 'm', word: 'mouche', image: '' },
  { sound: 'm', word: 'montagne', image: '' },

  // Son [n]
  { sound: 'n', word: 'nez', image: '' },
  { sound: 'n', word: 'nuage', image: '' },
  { sound: 'n', word: 'neige', image: '' },
  { sound: 'n', word: 'nuit', image: '' },
  { sound: 'n', word: 'nounours', image: '' },
  { sound: 'n', word: 'navire', image: '' },
  { sound: 'n', word: 'nature', image: '' },
  { sound: 'n', word: 'nombre', image: '' },
  { sound: 'n', word: 'nid', image: '' },
  { sound: 'n', word: 'nœud', image: '' },

  // Son [o]
  { sound: 'o', word: 'oiseau', image: '' },
  { sound: 'o', word: 'orange', image: '' },
  { sound: 'o', word: 'ordinateur', image: '' },
  { sound: 'o', word: 'oreille', image: '' },
  { sound: 'o', word: 'olive', image: '' },
  { sound: 'o', word: 'ourson', image: '' },
  { sound: 'o', word: 'ours', image: '' },
  { sound: 'o', word: 'eau', image: '' },
  { sound: 'o', word: 'hôpital', image: '' },

  // Son [p]
  { sound: 'p', word: 'papa', image: PapaImage.src },
  { sound: 'p', word: 'papillon', image: PapillonImage.src },
  { sound: 'p', word: 'pizza', image: PizzaImage.src },
  { sound: 'p', word: 'pomme', image: PommeImage.src },
  { sound: 'p', word: 'poule', image: PouleImage.src },
  { sound: 'p', word: 'pain', image: '' },
  { sound: 'p', word: 'poire', image: '' },
  { sound: 'p', word: 'porte', image: '' },
  { sound: 'p', word: 'poupée', image: '' },
  { sound: 'p', word: 'poisson', image: '' },
  { sound: 'p', word: 'plume', image: '' },

  // Son [r]
  { sound: 'r', word: 'rat', image: RatImage.src },
  { sound: 'r', word: 'robot', image: RobotImage.src },
  { sound: 'r', word: 'robe', image: '' },
  { sound: 'r', word: 'renard', image: '' },
  { sound: 'r', word: 'roi', image: '' },
  { sound: 'r', word: 'rivière', image: '' },
  { sound: 'r', word: 'ruche', image: '' },
  { sound: 'r', word: 'raisin', image: '' },
  { sound: 'r', word: 'route', image: '' },
  { sound: 'r', word: 'rideau', image: '' },

  // Son [t]
  { sound: 't', word: 'tapis', image: TapisImage.src },
  { sound: 't', word: 'tasse', image: TasseImage.src },
  { sound: 't', word: 'tomate', image: TomateImage.src },
  { sound: 't', word: 'table', image: '' },
  { sound: 't', word: 'tigre', image: '' },
  { sound: 't', word: 'tortue', image: '' },
  { sound: 't', word: 'tulipe', image: '' },
  { sound: 't', word: 'trésor', image: '' },
  { sound: 't', word: 'train', image: '' },
  { sound: 't', word: 'téléphone', image: '' },

  // Son [u]
  { sound: 'u', word: 'usine', image: '' },
  { sound: 'u', word: 'uniforme', image: '' },
  { sound: 'u', word: 'univers', image: '' },
  { sound: 'u', word: 'urgent', image: '' },
  { sound: 'u', word: 'utile', image: '' },
  { sound: 'u', word: 'urus', image: '' },

  // Son [v]
  { sound: 'v', word: 'vache', image: VacheImage.src },
  { sound: 'v', word: 'vélo', image: VeloImage.src },
  { sound: 'v', word: 'voiture', image: VoitureImage.src },
  { sound: 'v', word: 'vert', image: '' },
  { sound: 'v', word: 'verre', image: '' },
  { sound: 'v', word: 'violon', image: '' },
  { sound: 'v', word: 'ville', image: '' },
  { sound: 'v', word: 'ventre', image: '' },
  { sound: 'v', word: 'vague', image: '' },
  { sound: 'v', word: 'valise', image: '' },

  // Son [w] (rare en français)
  { sound: 'w', word: 'wagon', image: '' },
  { sound: 'w', word: 'wapiti', image: '' },
  { sound: 'w', word: 'weekend', image: '' },

  // Son [z]
  { sound: 'z', word: 'zèbre', image: '' },
  { sound: 'z', word: 'zoo', image: '' },
  { sound: 'z', word: 'zéro', image: '' },
  { sound: 'z', word: 'zone', image: '' },
  { sound: 'z', word: 'zigzag', image: '' },
  { sound: 'z', word: 'zénith', image: '' },

  // Sons particuliers (h aspiré, y, x)
  { sound: 'h', word: 'hérisson', image: '' },
  { sound: 'h', word: 'hibou', image: '' },
  { sound: 'h', word: 'haricot', image: '' },
  { sound: 'h', word: 'hélicoptère', image: '' },
  { sound: 'h', word: 'hamster', image: '' },
  { sound: 'h', word: 'habit', image: '' },
  { sound: 'h', word: 'huître', image: '' },
  { sound: 'h', word: 'hache', image: '' },

  { sound: 'y', word: 'yoga', image: '' },
  { sound: 'y', word: 'yaourt', image: '' },
  { sound: 'y', word: 'yeux', image: '' },
  { sound: 'y', word: 'yoyo', image: '' },
  { sound: 'y', word: 'yacht', image: '' },

  { sound: 'gz', word: 'xylophone', image: '' },
  { sound: 'gz', word: 'examen', image: '' },
];
