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
    syllable: string;
    word: string;
    image: string; // Path to the image
}

export const syllableAttackData: SyllableData[] = [
  // A
  { syllable: 'a', word: 'arbre', image: '' },
  { syllable: 'a', word: 'avion', image: '' },
  { syllable: 'a', word: 'ami', image: '' },
  { syllable: 'a', word: 'ananas', image: '' },
  { syllable: 'a', word: 'abeille', image: '' },
  { syllable: 'a', word: 'âne', image: '' },
  { syllable: 'a', word: 'assiette', image: '' },
  { syllable: 'a', word: 'anorak', image: '' },

  // B
  { syllable: 'ba', word: 'ballon', image: BallonImage.src },
  { syllable: 'ba', word: 'bateau', image: BateauImage.src },
  { syllable: 'ba', word: 'banane', image: BananeImage.src },
  { syllable: 'bon', word: 'bonbon', image: BonbonImage.src },
  { syllable: 'b', word: 'bébé', image: '' },
  { syllable: 'b', word: 'baleine', image: '' },
  { syllable: 'b', word: 'bille', image: '' },
  { syllable: 'b', word: 'bouton', image: '' },
  { syllable: 'b', word: 'boîte', image: '' },
  { syllable: 'b', word: 'brosse', image: '' },

  // C
  { syllable: 'ca', word: 'canard', image: CanardImage.src },
  { syllable: 'ca', word: 'camion', image: CamionImage.src },
  { syllable: 'ca', word: 'cadeau', image: CadeauImage.src },
  { syllable: 'che', word: 'cheval', image: ChevalImage.src },
  { syllable: 'chou', word: 'chouchou', image: ChouchouImage.src },
  { syllable: 'ci', word: 'citron', image: CitronImage.src },
  { syllable: 'co', word: 'cochon', image: CochonImage.src },
  { syllable: 'c', word: 'château', image: '' },
  { syllable: 'c', word: 'chapeau', image: '' },
  { syllable: 'c', word: 'chocolat', image: '' },
  { syllable: 'c', word: 'cerise', image: '' },
  { syllable: 'c', word: 'carotte', image: '' },

  // D
  { syllable: 'do', word: 'domino', image: DominoImage.src },
  { syllable: 'd', word: 'dent', image: '' },
  { syllable: 'd', word: 'dinosaure', image: '' },
  { syllable: 'd', word: 'drapeau', image: '' },
  { syllable: 'd', word: 'dauphin', image: '' },
  { syllable: 'd', word: 'dindon', image: '' },
  { syllable: 'd', word: 'douche', image: '' },
  { syllable: 'd', word: 'deux', image: '' },

  // E
  { syllable: 'e', word: 'éléphant', image: '' },
  { syllable: 'e', word: 'école', image: '' },
  { syllable: 'e', word: 'escargot', image: '' },
  { syllable: 'e', word: 'épée', image: '' },
  { syllable: 'e', word: 'eau', image: '' },
  { syllable: 'e', word: 'étoile', image: '' },
  { syllable: 'e', word: 'escalier', image: '' },
  { syllable: 'e', word: 'ours', image: '' },

  // F
  { syllable: 'four', word: 'fourmi', image: FourmiImage.src },
  { syllable: 'fu', word: 'fusée', image: FuseeImage.src },
  { syllable: 'f', word: 'fenêtre', image: '' },
  { syllable: 'f', word: 'fromage', image: '' },
  { syllable: 'f', word: 'fille', image: '' },
  { syllable: 'f', word: 'fleur', image: '' },
  { syllable: 'f', word: 'fraise', image: '' },
  { syllable: 'f', word: 'fourchette', image: '' },

  // G
  { syllable: 'ga', word: 'gâteau', image: GateauImage.src },
  { syllable: 'gi', word: 'girafe', image: GirafeImage.src },
  { syllable: 'g', word: 'guitare', image: '' },
  { syllable: 'g', word: 'gant', image: '' },
  { syllable: 'g', word: 'grenouille', image: '' },
  { syllable: 'g', word: 'gomme', image: '' },
  { syllable: 'g', word: 'goutte', image: '' },
  { syllable: 'g', word: 'garage', image: '' },

  // H
  { syllable: 'h', word: 'hérisson', image: '' },
  { syllable: 'h', word: 'hibou', image: '' },
  { syllable: 'h', word: 'hôpital', image: '' },
  { syllable: 'h', word: 'haricot', image: '' },
  { syllable: 'h', word: 'hélicoptère', image: '' },
  { syllable: 'h', word: 'hamster', image: '' },
  { syllable: 'h', word: 'habit', image: '' },
  { syllable: 'h', word: 'huître', image: '' },

  // I
  { syllable: 'i', word: 'igloo', image: '' },
  { syllable: 'i', word: 'île', image: '' },
  { syllable: 'i', word: 'insecte', image: '' },
  { syllable: 'i', word: 'image', image: '' },
  { syllable: 'i', word: 'indien', image: '' },
  { syllable: 'i', word: 'igname', image: '' },

  // J
  { syllable: 'j', word: 'jardin', image: '' },
  { syllable: 'j', word: 'joue', image: '' },
  { syllable: 'j', word: 'jupe', image: '' },
  { syllable: 'j', word: 'jambe', image: '' },
  { syllable: 'j', word: 'journal', image: '' },
  { syllable: 'j', word: 'jouet', image: '' },
  { syllable: 'j', word: 'judo', image: '' },
  { syllable: 'j', word: 'jaune', image: '' },

  // K
  { syllable: 'k', word: 'koala', image: '' },
  { syllable: 'k', word: 'kangourou', image: '' },
  { syllable: 'k', word: 'kiwi', image: '' },
  { syllable: 'k', word: 'karaté', image: '' },
  { syllable: 'k', word: 'kayak', image: '' },

  // L
  { syllable: 'la', word: 'lapin', image: LapinImage.src },
  { syllable: 'li', word: 'lit', image: LitImage.src },
  { syllable: 'lu', word: 'lune', image: LuneImage.src },
  { syllable: 'l', word: 'lion', image: '' },
  { syllable: 'l', word: 'loup', image: '' },
  { syllable: 'l', word: 'livre', image: '' },
  { syllable: 'l', word: 'lunettes', image: '' },
  { syllable: 'l', word: 'lampe', image: '' },
  { syllable: 'l', word: 'légume', image: '' },

  // M
  { syllable: 'mai', word: 'maison', image: MaisonImage.src },
  { syllable: 'mo', word: 'moto', image: MotoImage.src },
  { syllable: 'mou', word: 'mouton', image: MoutonImage.src },
  { syllable: 'mur', word: 'mur', image: MurImage.src },
  { syllable: 'm', word: 'maman', image: '' },
  { syllable: 'm', word: 'mer', image: '' },
  { syllable: 'm', word: 'main', image: '' },
  { syllable: 'm', word: 'marteau', image: '' },
  { syllable: 'm', word: 'mouche', image: '' },
  { syllable: 'm', word: 'montagne', image: '' },

  // N
  { syllable: 'n', word: 'nez', image: '' },
  { syllable: 'n', word: 'nuage', image: '' },
  { syllable: 'n', word: 'neige', image: '' },
  { syllable: 'n', word: 'nuit', image: '' },
  { syllable: 'n', word: 'nounours', image: '' },
  { syllable: 'n', word: 'navire', image: '' },
  { syllable: 'n', word: 'nature', image: '' },
  { syllable: 'n', word: 'nombre', image: '' },

  // O
  { syllable: 'o', word: 'oiseau', image: '' },
  { syllable: 'o', word: 'orange', image: '' },
  { syllable: 'o', word: 'ordinateur', image: '' },
  { syllable: 'o', word: 'oreille', image: '' },
  { syllable: 'o', word: 'oignon', image: '' },
  { syllable: 'o', word: 'olive', image: '' },
  { syllable: 'o', word: 'ourson', image: '' },

  // P
  { syllable: 'papa', word: 'papa', image: PapaImage.src },
  { syllable: 'pa', word: 'papillon', image: PapillonImage.src },
  { syllable: 'pi', word: 'pizza', image: PizzaImage.src },
  { syllable: 'po', word: 'pomme', image: PommeImage.src },
  { syllable: 'pou', word: 'poule', image: PouleImage.src },
  { syllable: 'p', word: 'pain', image: '' },
  { syllable: 'p', word: 'poire', image: '' },
  { syllable: 'p', word: 'porte', image: '' },
  { syllable: 'p', word: 'poupée', image: '' },
  { syllable: 'p', word: 'poisson', image: '' },
  { syllable: 'p', word: 'plume', image: '' },

  // Q
  { syllable: 'q', word: 'quatre', image: '' },
  { syllable: 'q', word: 'queue', image: '' },
  { syllable: 'q', word: 'quai', image: '' },
  { syllable: 'q', word: 'quinze', image: '' },
  { syllable: 'q', word: 'quartier', image: '' },

  // R
  { syllable: 'ra', word: 'rat', image: RatImage.src },
  { syllable: 'ro', word: 'robot', image: RobotImage.src },
  { syllable: 'r', word: 'robe', image: '' },
  { syllable: 'r', word: 'renard', image: '' },
  { syllable: 'r', word: 'roi', image: '' },
  { syllable: 'r', word: 'rivière', image: '' },
  { syllable: 'r', word: 'ruche', image: '' },
  { syllable: 'r', word: 'raisin', image: '' },
  { syllable: 'r', word: 'route', image: '' },

  // S
  { syllable: 'sa', word: 'sapin', image: SapinImage.src },
  { syllable: 'sa', word: 'sac', image: SacImage.src },
  { syllable: 'si', word: 'sirène', image: SireneImage.src },
  { syllable: 'su', word: 'sucre', image: SucreImage.src },
  { syllable: 's', word: 'soleil', image: '' },
  { syllable: 's', word: 'serpent', image: '' },
  { syllable: 's', word: 'singe', image: '' },
  { syllable: 's', word: 'souris', image: '' },
  { syllable: 's', word: 'savon', image: '' },
  { syllable: 's', word: 'sorcière', image: '' },

  // T
  { syllable: 'ta', word: 'tapis', image: TapisImage.src },
  { syllable: 'ta', word: 'tasse', image: TasseImage.src },
  { syllable: 'to', word: 'tomate', image: TomateImage.src },
  { syllable: 't', word: 'table', image: '' },
  { syllable: 't', word: 'tigre', image: '' },
  { syllable: 't', word: 'tortue', image: '' },
  { syllable: 't', word: 'tulipe', image: '' },
  { syllable: 't', word: 'trésor', image: '' },
  { syllable: 't', word: 'train', image: '' },

  // U
  { syllable: 'u', word: 'usine', image: '' },
  { syllable: 'u', word: 'uniforme', image: '' },
  { syllable: 'u', word: 'univers', image: '' },
  { syllable: 'u', word: 'urgent', image: '' },
  { syllable: 'u', word: 'utile', image: '' },

  // V
  { syllable: 'va', word: 'vache', image: VacheImage.src },
  { syllable: 'vé', word: 'vélo', image: VeloImage.src },
  { syllable: 'voi', word: 'voiture', image: VoitureImage.src },
  { syllable: 'v', word: 'vert', image: '' },
  { syllable: 'v', word: 'verre', image: '' },
  { syllable: 'v', word: 'violon', image: '' },
  { syllable: 'v', word: 'ville', image: '' },
  { syllable: 'v', word: 'ventre', image: '' },
  { syllable: 'v', word: 'vague', image: '' },

  // W
  { syllable: 'w', word: 'wagon', image: '' },
  { syllable: 'w', word: 'wallon', image: '' },
  { syllable: 'w', word: 'wapiti', image: '' },

  // X
  { syllable: 'x', word: 'xylophone', image: '' },
  { syllable: 'x', word: 'xenon', image: '' },

  // Y
  { syllable: 'y', word: 'yoga', image: '' },
  { syllable: 'y', word: 'yaourt', image: '' },
  { syllable: 'y', word: 'yeux', image: '' },
  { syllable: 'y', word: 'yoyo', image: '' },

  // Z
  { syllable: 'z', word: 'zèbre', image: '' },
  { syllable: 'z', word: 'zoo', image: '' },
  { syllable: 'z', word: 'zéro', image: '' },
  { syllable: 'z', word: 'zone', image: '' },
  { syllable: 'z', word: 'zigzag', image: '' },
];
