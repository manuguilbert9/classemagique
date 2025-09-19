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
  { syllable: 'ba', word: 'ballon', image: BallonImage.src },
  { syllable: 'ba', word: 'bateau', image: BateauImage.src },
  { syllable: 'ba', word: 'banane', image: BananeImage.src },
  { syllable: 'bon', word: 'bonbon', image: BonbonImage.src },
  { syllable: 'ca', word: 'canard', image: CanardImage.src },
  { syllable: 'ca', word: 'camion', image: CamionImage.src },
  { syllable: 'ca', word: 'cadeau', image: CadeauImage.src },
  { syllable: 'che', word: 'cheval', image: ChevalImage.src },
  { syllable: 'chou', word: 'chouchou', image: ChouchouImage.src },
  { syllable: 'ci', word: 'citron', image: CitronImage.src },
  { syllable: 'co', word: 'cochon', image: CochonImage.src },
  { syllable: 'do', word: 'domino', image: DominoImage.src },
  { syllable: 'four', word: 'fourmi', image: FourmiImage.src },
  { syllable: 'fu', word: 'fusée', image: FuseeImage.src },
  { syllable: 'ga', word: 'gâteau', image: GateauImage.src },
  { syllable: 'gi', word: 'girafe', image: GirafeImage.src },
  { syllable: 'la', word: 'lapin', image: LapinImage.src },
  { syllable: 'li', word: 'lit', image: LitImage.src },
  { syllable: 'lu', word: 'lune', image: LuneImage.src },
  { syllable: 'mai', word: 'maison', image: MaisonImage.src },
  { syllable: 'mo', word: 'moto', image: MotoImage.src },
  { syllable: 'mou', word: 'mouton', image: MoutonImage.src },
  { syllable: 'mur', word: 'mur', image: MurImage.src },
  { syllable: 'papa', word: 'papa', image: PapaImage.src },
  { syllable: 'pa', word: 'papillon', image: PapillonImage.src },
  { syllable: 'pi', word: 'pizza', image: PizzaImage.src },
  { syllable: 'po', word: 'pomme', image: PommeImage.src },
  { syllable: 'pou', word: 'poule', image: PouleImage.src },
  { syllable: 'ra', word: 'rat', image: RatImage.src },
  { syllable: 'ro', word: 'robot', image: RobotImage.src },
  { syllable: 'sa', word: 'sapin', image: SapinImage.src },
  { syllable: 'sa', word: 'sac', image: SacImage.src },
  { syllable: 'si', word: 'sirène', image: SireneImage.src },
  { syllable: 'su', word: 'sucre', image: SucreImage.src },
  { syllable: 'ta', word: 'tapis', image: TapisImage.src },
  { syllable: 'ta', word: 'tasse', image: TasseImage.src },
  { syllable: 'to', word: 'tomate', image: TomateImage.src },
  { syllable: 'va', word: 'vache', image: VacheImage.src },
  { syllable: 'vé', word: 'vélo', image: VeloImage.src },
  { syllable: 'voi', word: 'voiture', image: VoitureImage.src },
];
