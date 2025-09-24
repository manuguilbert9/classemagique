
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

export const allSyllableTables: SyllableTable[] = [
    {
        id: 1,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Tableau 1 : Son [a]',
        newSound: 'a (ananas)',
        vowels: ['a'],
    },
    {
        id: 2,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Tableau 2 : Son [i]',
        newSound: 'i (ibis)',
        vowels: ['a', 'i'],
        vowelCombinations: ['ai', 'ia'],
    },
    {
        id: 3,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Tableau 3 : Son [u]',
        newSound: 'u (usine)',
        vowels: ['a', 'i', 'u'],
        vowelCombinations: ['au', 'ua', 'iu', 'ui', 'ai', 'ia'],
    },
    {
        id: 4,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Tableau 4 : Son [o]',
        newSound: 'o (orange)',
        vowels: ['a', 'i', 'u', 'o'],
        vowelCombinations: ['oi', 'io', 'ou', 'ao', 'oa', 'ai', 'ia', 'au', 'ua', 'iu', 'ui'],
        words: ['où'],
    },
    {
        id: 5,
        step: 'Étape 1 : Les voyelles simples',
        title: 'Tableau 5 : Son [é]',
        newSound: 'é, er, ez (bébé, panier, nez)',
        vowels: ['a', 'i', 'u', 'o', 'é'],
        vowelCombinations: ['éa', 'éi', 'éo', 'oé', 'ié', 'aé', 'oi', 'io', 'ou', 'ao', 'oa', 'ai', 'ia', 'au', 'ua', 'iu', 'ui'],
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
        pseudoWords: ['lila', 'lalo', 'luli', 'lilé', 'lola', 'alu', 'ila', 'olo'],
        words: ['allo', 'lila'],
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
        pseudoWords: ['rila', 'rari', 'rolu', 'ralé', 'lora', 'ralo', 'aro', 'iré'],
        words: ['rare', 'oral', 'lira', 'ara', 'rira'],
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
        words: ['fil', 'fer', 'fur', 'far', 'fifo'],
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
        words: ['ami', 'mari', 'mur', 'mime', 'mal', 'film', 'formé'],
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
        words: ['lune', 'animal', 'mine', 'fini', 'une', 'nom'],
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
        pseudoWords: ['pali', 'pira', 'pumo', 'péfa', 'lipa', 'ropu', 'napo', 'ipa'],
        words: ['papa', 'pipe', 'papi', 'pur', 'pile', 'parole'],
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
        pseudoWords: ['tita', 'toru', 'tami', 'télo', 'patu', 'poti', 'rato', 'uti'],
        words: ['patate', 'tortue', 'tape', 'petite', 'moto', 'pirate'],
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
        words: ['loup', 'mou', 'pour', 'tout', 'tour', 'four', 'moule', 'roule'],
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
        words: ['sol', 'si', 'sou', 'sale', 'salut', 'sirop', 'tasse', 'assis'],
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
        words: ['chat', 'chou', 'niche', 'fiche', 'chute', 'chose', 'fâché'],
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
        words: ['bal', 'bol', 'bulle', 'bébé', 'beau', 'un abri', 'robot'],
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
        words: ['date', 'dé', 'dur', 'douche', 'malade', 'soda', 'rideau'],
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
        words: ['vie', 'vite', 'vélo', 'vuvu', 'lavabo', 'olive', 'valise'],
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
        words: ['zéro', 'zoo', 'gaz', 'onze', 'douze', 'case', 'base', 'vase'],
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
        words: ['car', 'cube', 'cou', 'qui', 'coq', 'quatre', 'quand'],
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
        words: ['ce', 'ceci', 'cinéma', 'leçon', 'façade', 'reçu'],
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
        words: ['gare', 'gomme', 'figure', 'guide', 'guépard', 'vague'],
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
        words: ['jupe', 'joli', 'pyjama', 'magie', 'page', 'pigeon'],
    },
    {
        id: 24,
        step: 'Étape 7 : Autres voyelles et sons complexes',
        title: 'Tableau 24 : Son [è]',
        newSound: 'è, ê, ai, ei',
        words: ['mère', 'père', 'sel', 'elle', 'mer', 'lait', 'reine', 'treize', 'seize', 'forêt', 'arrêt', 'secret'],
    },
    {
        id: 25,
        step: 'Étape 7 : Autres voyelles et sons complexes',
        title: 'Tableau 25 : Son [o ouvert]',
        newSound: 'au, eau',
        words: ['auto', 'jaune', 'autre', 'beau', 'eau', 'cadeau', 'chapeau', 'gauche', 'faute'],
    },
    {
        id: 26,
        step: 'Étape 7 : Autres voyelles et sons complexes',
        title: 'Tableau 26 : Son [eu]',
        newSound: 'eu, œu',
        words: ['feu', 'jeu', 'deux', 'neuf', 'leur', 'fleur', 'cœur', 'sœur', 'beurre', 'heure'],
    },
    {
        id: 27,
        step: 'Étape 7 : Autres voyelles et sons complexes',
        title: 'Tableau 27 : Son [oi]',
        newSound: 'oi',
        words: ['roi', 'moi', 'toi', 'soir', 'noir', 'voir', 'poire', 'voiture', 'boire', 'miroir'],
    },
    {
        id: 28,
        step: 'Étape 8 : Les voyelles nasales',
        title: 'Tableau 28 : Son [an]',
        newSound: 'an, en',
        words: ['maman', 'enfant', 'dent', 'temps', 'grand', 'chanter', 'danser', 'entre'],
    },
    {
        id: 29,
        step: 'Étape 8 : Les voyelles nasales',
        title: 'Tableau 29 : Son [on]',
        newSound: 'on',
        words: ['bonbon', 'pont', 'non', 'son', 'long', 'rond', 'mouton', 'maison', 'front', 'compte'],
    },
    {
        id: 30,
        step: 'Étape 8 : Les voyelles nasales',
        title: 'Tableau 30 : Son [in]',
        newSound: 'in, ain, ein',
        words: ['matin', 'sapin', 'moulin', 'pain', 'main', 'train', 'plein', 'peinture', 'faim', 'demain'],
    },
    {
        id: 31,
        step: 'Étape 8 : Les voyelles nasales',
        title: 'Tableau 31 : Son [oin]',
        newSound: 'oin',
        words: ['foin', 'coin', 'loin', 'point', 'moins', 'soin', 'besoin', 'rejoindre'],
    },
    {
        id: 32,
        step: 'Étape 9 : Derniers sons complexes',
        title: 'Tableau 32 : Son [gn]',
        newSound: 'gn',
        words: ['montagne', 'campagne', 'chignon', 'champignon', 'magnifique', 'peigne', 'soigner', 'gagner'],
    },
    {
        id: 33,
        step: 'Étape 9 : Derniers sons complexes',
        title: 'Tableau 33 : Son [ill]',
        newSound: 'ill',
        words: ['fille', 'bille', 'quille', 'famille', 'vanille', 'papillon', 'feuille', 'grenouille', 'réveil'],
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
            headers: ['a', 'i', 'o'],
            rows: [
                { consonant: 'bl', syllables: ['bla', 'bli', 'blo'] },
                { consonant: 'cl', syllables: ['cla', 'cli', 'clo'] },
                { consonant: 'fl', syllables: ['fla', 'fli', 'flo'] },
                { consonant: 'gl', syllables: ['gla', 'gli', 'glo'] },
                { consonant: 'pl', syllables: ['pla', 'pli', 'plo'] },
            ],
        },
        words: ['table', 'classe', 'flocon', 'plage', 'aigle', 'blanc', 'clou', 'flamme'],
    },
    {
        id: 36,
        step: 'Étape 11 : Les groupes consonantiques',
        title: 'Tableau 36 : Groupes avec r',
        newSound: 'br, cr, dr, fr, gr, pr, tr, vr',
         cvTable: {
            headers: ['a', 'i', 'o'],
            rows: [
                { consonant: 'br', syllables: ['bra', 'bri', 'bro'] },
                { consonant: 'cr', syllables: ['cra', 'cri', 'cro'] },
                { consonant: 'dr', syllables: ['dra', 'dri', 'dro'] },
                { consonant: 'fr', syllables: ['fra', 'fri', 'fro'] },
                { consonant: 'gr', syllables: ['gra', 'gri', 'gro'] },
                { consonant: 'pr', syllables: ['pra', 'pri', 'pro'] },
                { consonant: 'tr', syllables: ['tra', 'tri', 'tro'] },
                { consonant: 'vr', syllables: ['vra', 'vri', 'vro'] },
            ],
        },
        words: ['bras', 'cravate', 'drap', 'fruit', 'gros', 'prix', 'train', 'livre', 'abricot', 'crocodile'],
    },
];
