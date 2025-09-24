
export interface SyllableTable {
    id: number;
    step: string;
    title: string;
    newSound?: string;
    vowels?: string[];
    vowelCombinations?: string[];
    cvTable?: {
        headers: string[];
        rows: {
            consonant: string;
            syllables: string[];
        }[];
    };
    vcSyllables?: string[];
    pseudoWords?: string[];
    words?: string[];
}

const baseVowels = ['a', 'i', 'u', 'o', 'é'];
// Helper to shuffle an array
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
const generateVowelMix = () => shuffleArray([...baseVowels, ...baseVowels, ...baseVowels, ...baseVowels, ...baseVowels, ...baseVowels]);


export const allSyllableTables: SyllableTable[] = [
    {
        id: 1,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Je lis les voyelles (1)',
        vowelCombinations: generateVowelMix(),
    },
    {
        id: 2,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Je lis les voyelles (2)',
        vowelCombinations: generateVowelMix(),
    },
    {
        id: 3,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Je lis les voyelles (3)',
        vowelCombinations: generateVowelMix(),
    },
    {
        id: 4,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Je lis les voyelles (4)',
        vowelCombinations: generateVowelMix(),
    },
    {
        id: 5,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Je lis les voyelles (5)',
        vowelCombinations: generateVowelMix(),
    },
    {
        id: 6,
        step: 'Étape 2 : Les consonnes continues',
        title: 'Tableau 6 : Son [l]',
        newSound: 'l (lune)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é'],
            rows: [{ consonant: 'l', syllables: ['la', 'li', 'lu', 'lo', 'lé'] }],
        },
        vcSyllables: ['al', 'il', 'ul', 'ol', 'él'],
        pseudoWords: ['lila', 'lalo', 'luli', 'lilé', 'lola', 'alu', 'ila', 'olo', 'ulal', 'ilélo', 'alil', 'lolu'],
        words: ['allo', 'lila', 'le', 'la', 'les', 'lui'],
    },
    {
        id: 7,
        step: 'Étape 2 : Les consonnes continues',
        title: 'Tableau 7 : Son [r]',
        newSound: 'r (robot)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é'],
            rows: [
                { consonant: 'l', syllables: ['la', 'li', 'lu', 'lo', 'lé'] },
                { consonant: 'r', syllables: ['ra', 'ri', 'ru', 'ro', 'ré'] },
            ],
        },
        vcSyllables: ['ar', 'ir', 'ur', 'or', 'ér'],
        pseudoWords: ['rila', 'rari', 'rolu', 'ralé', 'lora', 'ralo', 'aro', 'iré', 'rula', 'lori', 'aril'],
        words: ['rare', 'oral', 'lira', 'ara', 'rira', 'rue', 'rire', 'rat'],
    },
    {
        id: 8,
        step: 'Étape 2 : Les consonnes continues',
        title: 'Tableau 8 : Son [f]',
        newSound: 'f (fusée)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é'],
            rows: [
                { consonant: 'l', syllables: ['la', 'li', 'lu', 'lo', 'lé'] },
                { consonant: 'r', syllables: ['ra', 'ri', 'ru', 'ro', 'ré'] },
                { consonant: 'f', syllables: ['fa', 'fi', 'fu', 'fo', 'fé'] },
            ],
        },
        vcSyllables: ['af', 'if', 'uf', 'of', 'éf'],
        pseudoWords: ['filu', 'fora', 'fari', 'féla', 'lifo', 'rofa', 'afi', 'ufo'],
        words: ['fil', 'fer', 'fur', 'far', 'fifo', 'fée', 'foi', 'rafale'],
    },
    {
        id: 9,
        step: 'Étape 2 : Les consonnes continues',
        title: 'Tableau 9 : Son [m]',
        newSound: 'm (moto)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é'],
            rows: [
                { consonant: 'l', syllables: ['la', 'li', 'lu', 'lo', 'lé'] },
                { consonant: 'r', syllables: ['ra', 'ri', 'ru', 'ro', 'ré'] },
                { consonant: 'f', syllables: ['fa', 'fi', 'fu', 'fo', 'fé'] },
                { consonant: 'm', syllables: ['ma', 'mi', 'mu', 'mo', 'mé'] },
            ],
        },
        vcSyllables: ['am', 'im', 'um', 'om', 'ém'],
        pseudoWords: ['mola', 'muri', 'mifa', 'mélo', 'rima', 'fuma', 'ami', 'omi'],
        words: ['ami', 'mari', 'mur', 'mime', 'mal', 'film', 'formé', 'mort'],
    },
    {
        id: 10,
        step: 'Étape 2 : Les consonnes continues',
        title: 'Tableau 10 : Son [n]',
        newSound: 'n (niche)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é'],
            rows: [
                { consonant: 'l', syllables: ['la', 'li', 'lu', 'lo', 'lé'] },
                { consonant: 'r', syllables: ['ra', 'ri', 'ru', 'ro', 'ré'] },
                { consonant: 'f', syllables: ['fa', 'fi', 'fu', 'fo', 'fé'] },
                { consonant: 'm', syllables: ['ma', 'mi', 'mu', 'mo', 'mé'] },
                { consonant: 'n', syllables: ['na', 'ni', 'nu', 'no', 'né'] },
            ],
        },
        vcSyllables: ['an', 'in', 'un', 'on', 'én'],
        pseudoWords: ['nina', 'noru', 'nali', 'némo', 'fina', 'roni', 'mano', 'uno'],
        words: ['lune', 'animal', 'mine', 'fini', 'une', 'nom', 'non', 'ananas'],
    },
    {
        id: 11,
        step: 'Étape 3 : Les consonnes occlusives',
        title: 'Tableau 11 : Son [p]',
        newSound: 'p (papa)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é'],
            rows: [
                { consonant: 'n', syllables: ['na', 'ni', 'nu', 'no', 'né'] },
                { consonant: 'p', syllables: ['pa', 'pi', 'pu', 'po', 'pé'] },
            ],
        },
        vcSyllables: ['ap', 'ip', 'up', 'op', 'ép'],
        pseudoWords: ['pali', 'pira', 'pumo', 'péfa', 'lipa', 'ropu', 'napo', 'ipa', 'pina', 'pori'],
        words: ['papa', 'pipe', 'papi', 'pur', 'pile', 'parole', 'puni', 'parti'],
    },
    {
        id: 12,
        step: 'Étape 3 : Les consonnes occlusives',
        title: 'Tableau 12 : Son [t]',
        newSound: 't (tomate)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é'],
            rows: [
                { consonant: 'p', syllables: ['pa', 'pi', 'pu', 'po', 'pé'] },
                { consonant: 't', syllables: ['ta', 'ti', 'tu', 'to', 'té'] },
            ],
        },
        vcSyllables: ['at', 'it', 'ut', 'ot', 'ét'],
        pseudoWords: ['tita', 'toru', 'tami', 'télo', 'patu', 'poti', 'rato', 'uti', 'tapi', 'tora'],
        words: ['patate', 'tortue', 'tape', 'petite', 'moto', 'pirate', 'tête', 'tard'],
    },
    {
        id: 13,
        step: 'Étape 4 : Le son [ou] et les chuintantes',
        title: 'Tableau 13 : Son [ou]',
        newSound: 'ou (loup)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é', 'ou'],
            rows: [
                { consonant: 'l', syllables: ['la', 'li', 'lu', 'lo', 'lé', 'lou'] },
                { consonant: 'r', syllables: ['ra', 'ri', 'ru', 'ro', 'ré', 'rou'] },
                { consonant: 'f', syllables: ['fa', 'fi', 'fu', 'fo', 'fé', 'fou'] },
                { consonant: 'm', syllables: ['ma', 'mi', 'mu', 'mo', 'mé', 'mou'] },
                { consonant: 'n', syllables: ['na', 'ni', 'nu', 'no', 'né', 'nou'] },
                { consonant: 'p', syllables: ['pa', 'pi', 'pu', 'po', 'pé', 'pou'] },
                { consonant: 't', syllables: ['ta', 'ti', 'tu', 'to', 'té', 'tou'] },
            ],
        },
        words: ['loup', 'mou', 'pour', 'tout', 'tour', 'four', 'moule', 'roule', 'boule', 'chou'],
    },
    {
        id: 14,
        step: 'Étape 4 : Le son [ou] et les chuintantes',
        title: 'Tableau 14 : Son [s]',
        newSound: 's, ss (soleil, classe)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é', 'ou'],
            rows: [
                { consonant: 't', syllables: ['ta', 'ti', 'tu', 'to', 'té', 'tou'] },
                { consonant: 's', syllables: ['sa', 'si', 'su', 'so', 'sé', 'sou'] },
            ],
        },
        pseudoWords: ['sita', 'suto', 'sora', 'sési', 'sula', 'tasu', 'sipa'],
        words: ['sol', 'si', 'sou', 'sale', 'salut', 'sirop', 'tasse', 'assis', 'russe', 'os', 'sucre'],
    },
    {
        id: 15,
        step: 'Étape 4 : Le son [ou] et les chuintantes',
        title: 'Tableau 15 : Son [ch]',
        newSound: 'ch (chat)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é', 'ou'],
            rows: [
                { consonant: 's', syllables: ['sa', 'si', 'su', 'so', 'sé', 'sou'] },
                { consonant: 'ch', syllables: ['cha', 'chi', 'chu', 'cho', 'ché', 'chou'] },
            ],
        },
        pseudoWords: ['chasi', 'chuso', 'chora', 'chésu', 'sacho', 'chipa'],
        words: ['chat', 'chou', 'niche', 'fiche', 'chute', 'chose', 'fâché', 'riche', 'moche', 'sèche'],
    },
    {
        id: 16,
        step: 'Étape 5 : Les paires sourdes/sonores',
        title: 'Tableau 16 : Son [b] vs [p]',
        newSound: 'b (bateau)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é', 'ou'],
            rows: [
                { consonant: 'p', syllables: ['pa', 'pi', 'pu', 'po', 'pé', 'pou'] },
                { consonant: 'b', syllables: ['ba', 'bi', 'bu', 'bo', 'bé', 'bou'] },
            ],
        },
        pseudoWords: ['bapo', 'bipu', 'boba', 'bapi', 'pabu', 'pobi'],
        words: ['bal', 'bol', 'bulle', 'bébé', 'beau', 'un abri', 'robot', 'boule', 'bas', 'bus'],
    },
    {
        id: 17,
        step: 'Étape 5 : Les paires sourdes/sonores',
        title: 'Tableau 17 : Son [d] vs [t]',
        newSound: 'd (dame)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é', 'ou'],
            rows: [
                { consonant: 't', syllables: ['ta', 'ti', 'tu', 'to', 'té', 'tou'] },
                { consonant: 'd', syllables: ['da', 'di', 'du', 'do', 'dé', 'dou'] },
            ],
        },
        pseudoWords: ['dato', 'ditu', 'doda', 'dati', 'tadu', 'todi'],
        words: ['date', 'dé', 'dur', 'douche', 'malade', 'soda', 'rideau', 'mardi', 'dame'],
    },
    {
        id: 18,
        step: 'Étape 5 : Les paires sourdes/sonores',
        title: 'Tableau 18 : Son [v] vs [f]',
        newSound: 'v (vélo)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é', 'ou'],
            rows: [
                { consonant: 'f', syllables: ['fa', 'fi', 'fu', 'fo', 'fé', 'fou'] },
                { consonant: 'v', syllables: ['va', 'vi', 'vu', 'vo', 'vé', 'vou'] },
            ],
        },
        pseudoWords: ['vafo', 'vifu', 'vova', 'vafi', 'favu', 'fovi'],
        words: ['vie', 'vite', 'vélo', 'vuvu', 'lavabo', 'olive', 'valise', 'neveu', 'cheval'],
    },
    {
        id: 19,
        step: 'Étape 5 : Les paires sourdes/sonores',
        title: 'Tableau 19 : Son [z] vs [s]',
        newSound: 'z, s (zèbre, valise)',
        cvTable: {
            headers: ['a', 'i', 'u', 'o', 'é', 'ou'],
            rows: [
                { consonant: 's', syllables: ['sa', 'si', 'su', 'so', 'sé', 'sou'] },
                { consonant: 'z', syllables: ['za', 'zi', 'zu', 'zo', 'zé', 'zou'] },
            ],
        },
        pseudoWords: ['zaso', 'zisu', 'zoza', 'zasi', 'sazu', 'sozi'],
        words: ['zéro', 'zoo', 'gaz', 'onze', 'douze', 'case', 'base', 'vase', 'lizard', 'blouse'],
    },
    {
        id: 20,
        step: 'Étape 6 : Cas particuliers des lettres c et g',
        title: 'Tableau 20 : Son [k]',
        newSound: 'c, qu (canard, quille)',
        cvTable: {
            headers: ['a', 'o', 'u', 'i', 'é'],
            rows: [
                { consonant: 'c', syllables: ['ca', 'co', 'cu', '-', '-'] },
                { consonant: 'qu', syllables: ['-', '-', '-', 'qui', 'qué'] },
            ],
        },
        words: ['car', 'cube', 'cou', 'qui', 'coq', 'quatre', 'quand', 'parc', 'sac', 'lac', 'avec', 'cinq', 'casque', 'équipe'],
    },
    {
        id: 21,
        step: 'Étape 6 : Cas particuliers des lettres c et g',
        title: 'Tableau 21 : Son [s]',
        newSound: 'c, ç (cerise, garçon)',
        cvTable: {
            headers: ['e', 'i', 'a', 'o', 'u'],
            rows: [
                { consonant: 'c', syllables: ['ce', 'ci', '-', '-', '-'] },
                { consonant: 'ç', syllables: ['-', '-', 'ça', 'ço', 'çu'] },
            ],
        },
        words: ['ce', 'ceci', 'cinéma', 'leçon', 'façade', 'reçu', 'place', 'merci', 'garçon', 'glaçon', 'balance'],
    },
    {
        id: 22,
        step: 'Étape 6 : Cas particuliers des lettres c et g',
        title: 'Tableau 22 : Son [g]',
        newSound: 'g, gu (gâteau, guitare)',
        cvTable: {
            headers: ['a', 'o', 'u', 'i', 'e'],
            rows: [
                { consonant: 'g', syllables: ['ga', 'go', 'gu', '-', '-'] },
                { consonant: 'gu', syllables: ['-', '-', '-', 'gui', 'gue'] },
            ],
        },
        words: ['gare', 'gomme', 'figure', 'guide', 'guépard', 'vague', 'bague', 'longue', 'guitare', 'guy'],
    },
    {
        id: 23,
        step: 'Étape 6 : Cas particuliers des lettres c et g',
        title: 'Tableau 23 : Son [j]',
        newSound: 'g, j (girafe, jupe)',
        cvTable: {
            headers: ['a', 'o', 'u', 'e', 'i'],
            rows: [
                { consonant: 'g', syllables: ['-', '-', '-', 'ge', 'gi'] },
                { consonant: 'j', syllables: ['ja', 'jo', 'ju', 'je', 'ji'] },
            ],
        },
        words: ['jupe', 'joli', 'pyjama', 'magie', 'page', 'pigeon', 'jeudi', 'judo', 'juste', 'rouge', 'manger'],
    },
    {
        id: 24,
        step: 'Étape 7 : Autres voyelles et sons complexes',
        title: 'Tableau 24 : Son [è]',
        newSound: 'è, ê, ai, ei',
        words: ['mère', 'père', 'sel', 'elle', 'mer', 'lait', 'reine', 'treize', 'seize', 'forêt', 'arrêt', 'secret', 'balai', 'chaise', 'neige', 'peine', 'tête', 'bête'],
    },
    {
        id: 25,
        step: 'Étape 7 : Autres voyelles et sons complexes',
        title: 'Tableau 25 : Son [o ouvert]',
        newSound: 'au, eau',
        words: ['auto', 'jaune', 'autre', 'beau', 'eau', 'cadeau', 'chapeau', 'gauche', 'faute', 'épaule', 'marteau', 'taureau', 'oiseau', 'chaud'],
    },
    {
        id: 26,
        step: 'Étape 7 : Autres voyelles et sons complexes',
        title: 'Tableau 26 : Son [eu]',
        newSound: 'eu, œu',
        words: ['feu', 'jeu', 'deux', 'neuf', 'leur', 'fleur', 'cœur', 'sœur', 'beurre', 'heure', 'jeune', 'bleu', 'pneu', 'nœud', 'œuf'],
    },
    {
        id: 27,
        step: 'Étape 7 : Autres voyelles et sons complexes',
        title: 'Tableau 27 : Son [oi]',
        newSound: 'oi',
        words: ['roi', 'moi', 'toi', 'soir', 'noir', 'voir', 'poire', 'voiture', 'boire', 'miroir', 'trois', 'foi', 'loi', 'bois', 'noix'],
    },
    {
        id: 28,
        step: 'Étape 8 : Les voyelles nasales',
        title: 'Tableau 28 : Son [an]',
        newSound: 'an, en',
        words: ['maman', 'enfant', 'dent', 'temps', 'grand', 'chanter', 'danser', 'entre', 'banc', 'tante', 'lampe', 'chambre', 'quand', 'vent'],
    },
    {
        id: 29,
        step: 'Étape 8 : Les voyelles nasales',
        title: 'Tableau 29 : Son [on]',
        newSound: 'on',
        words: ['bonbon', 'pont', 'non', 'son', 'long', 'rond', 'mouton', 'maison', 'front', 'compte', 'garçon', 'ballon', 'onze', 'monde'],
    },
    {
        id: 30,
        step: 'Étape 8 : Les voyelles nasales',
        title: 'Tableau 30 : Son [in]',
        newSound: 'in, ain, ein',
        words: ['matin', 'sapin', 'moulin', 'pain', 'main', 'train', 'plein', 'peinture', 'faim', 'demain', 'jardin', 'lapin', 'copain', 'frein'],
    },
    {
        id: 31,
        step: 'Étape 8 : Les voyelles nasales',
        title: 'Tableau 31 : Son [oin]',
        newSound: 'oin',
        words: ['foin', 'coin', 'loin', 'point', 'moins', 'soin', 'besoin', 'rejoindre', 'poing', 'témoin', 'jointure'],
    },
    {
        id: 32,
        step: 'Étape 9 : Derniers sons complexes',
        title: 'Tableau 32 : Son [gn]',
        newSound: 'gn',
        words: ['montagne', 'campagne', 'chignon', 'champignon', 'magnifique', 'peigne', 'soigner', 'gagner', 'araignée', 'cygne', 'poignet'],
    },
    {
        id: 33,
        step: 'Étape 9 : Derniers sons complexes',
        title: 'Tableau 33 : Son [ill]',
        newSound: 'ill',
        words: ['fille', 'bille', 'quille', 'famille', 'vanille', 'papillon', 'feuille', 'grenouille', 'réveil', 'soleil', 'travail', 'abeille', 'gorille'],
    },
    {
        id: 34,
        step: 'Étape 10 : Syllabes inverses',
        title: 'Tableau 34 : Fusion V+C',
        cvTable: {
            headers: ['l', 'r', 'f', 'm', 'n', 'p', 't', 's', 'b', 'd', 'v', 'z'],
            rows: [
                { consonant: 'a', syllables: ['al', 'ar', 'af', 'am', 'an', 'ap', 'at', 'as', 'ab', 'ad', 'av', 'az'] },
                { consonant: 'i', syllables: ['il', 'ir', 'if', 'im', 'in', 'ip', 'it', 'is', 'ib', 'id', 'iv', 'iz'] },
                { consonant: 'u', syllables: ['ul', 'ur', 'uf', 'um', 'un', 'up', 'ut', 'us', 'ub', 'ud', 'uv', 'uz'] },
                { consonant: 'o', syllables: ['ol', 'or', 'of', 'om', 'on', 'op', 'ot', 'os', 'ob', 'od', 'ov', 'oz'] },
                { consonant: 'é', syllables: ['él', 'ér', 'éf', 'ém', 'én', 'ép', 'ét', 'és', 'éb', 'éd', 'év', 'éz'] },
            ],
        },
    },
    {
        id: 35,
        step: 'Étape 11 : Les groupes consonantiques',
        title: 'Tableau 35 : Groupes avec l',
        newSound: 'bl, cl, fl, gl, pl',
        cvTable: {
            headers: ['a', 'i', 'o', 'u', 'é', 'è', 'on', 'ou'],
            rows: [
                { consonant: 'bl', syllables: ['bla', 'bli', 'blo', 'blu', 'blé', 'blè', 'blon', 'blou'] },
                { consonant: 'cl', syllables: ['cla', 'cli', 'clo', 'clu', 'clé', 'clè', 'clon', 'clou'] },
                { consonant: 'fl', syllables: ['fla', 'fli', 'flo', 'flu', 'flé', 'flè', 'flon', 'flou'] },
                { consonant: 'gl', syllables: ['gla', 'gli', 'glo', 'glu', 'glé', 'glè', 'glon', 'glou'] },
                { consonant: 'pl', syllables: ['pla', 'pli', 'plo', 'plu', 'plé', 'plè', 'plon', 'plou'] },
            ],
        },
        words: ['table', 'classe', 'flocon', 'plage', 'aigle', 'blanc', 'clou', 'flamme', 'globe', 'simple', 'souple'],
    },
    {
        id: 36,
        step: 'Étape 11 : Les groupes consonantiques',
        title: 'Tableau 36 : Groupes avec r',
        newSound: 'br, cr, dr, fr, gr, pr, tr, vr',
         cvTable: {
            headers: ['a', 'i', 'o', 'u', 'é', 'è', 'on', 'ou'],
            rows: [
                { consonant: 'br', syllables: ['bra', 'bri', 'bro', 'bru', 'bré', 'brè', 'bron', 'brou'] },
                { consonant: 'cr', syllables: ['cra', 'cri', 'cro', 'cru', 'cré', 'crè', 'cron', 'crou'] },
                { consonant: 'dr', syllables: ['dra', 'dri', 'dro', 'dru', 'dré', 'drè', 'dron', 'drou'] },
                { consonant: 'fr', syllables: ['fra', 'fri', 'fro', 'fru', 'fré', 'frè', 'fron', 'frou'] },
                { consonant: 'gr', syllables: ['gra', 'gri', 'gro', 'gru', 'gré', 'grè', 'gron', 'grou'] },
                { consonant: 'pr', syllables: ['pra', 'pri', 'pro', 'pru', 'pré', 'prè', 'pron', 'prou'] },
                { consonant: 'tr', syllables: ['tra', 'tri', 'tro', 'tru', 'tré', 'trè', 'tron', 'trou'] },
                { consonant: 'vr', syllables: ['vra', 'vri', 'vro', 'vru', 'vré', 'vrè', 'vron', 'vrou'] },
            ],
        },
        words: ['bras', 'cravate', 'drap', 'fruit', 'gros', 'prix', 'train', 'livre', 'abricot', 'crocodile', 'drôle', 'vrai'],
    },
];
