// --- MOTEUR DE SYLLABATION AMÉLIORÉ ---

// 1. LEXIQUE D'EXCEPTIONS
// Dictionnaire de mots avec leur découpage correct.
// Idéal pour les mots irréguliers ou très fréquents.
const LEXIQUE_EXCEPTIONS: { [key: string]: string[] } = {
    "monsieur": ["mon", "sieur"],
    "femme": ["fem", "me"],
    "oeil": ["oeil"],
    "aujourd'hui": ["au", "jour", "d'hui"],
    "examen": ["e", "xa", "men"],
    "second": ["se", "cond"],
    "technique": ["tech", "nique"],
    "automne": ["au", "tomne"],
    "rythme": ["ryth", "me"],
    "baptême": ["ba", "ptê", "me"],
    "football": ["foot", "ball"],
    "omnibus": ["om","ni","bus"],
    "omniscient": ["om","ni","scient"],
    "onze": ["onze"],
    "quelqu'un": ["quel","qu'un"],
    "solennel": ["so","len","nel"],
};

const VOYELLES = 'aàâeéèêëiîïoôuùûüœy';
const CONSONNES = 'bcçdfghjklmnpqrstvwxz';
const INSECABLES = new Set(['bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'gn', 'ph', 'pl', 'pr', 'th', 'tr', 'vr']);

// Fonctions utilitaires
function isVoyelle(char: string): boolean { return VOYELLES.includes(char); }
function isConsonne(char: string): boolean { return CONSONNES.includes(char); }

/**
 * Reconstruit la casse du mot original sur les syllabes découpées.
 * @param {string} original Le mot original.
 * @param {string[]} syllabes Le tableau de syllabes en minuscule.
 * @returns {string[]} Le tableau de syllabes avec la bonne casse.
 */
function reconstructCase(original: string, syllabes: string[]): string[] {
    let result: string[] = [];
    let currentIndex = 0;
    for (const syllabe of syllabes) {
        result.push(original.substring(currentIndex, currentIndex + syllabe.length));
        currentIndex += syllabe.length;
    }
    return result;
}


/**
 * Fonction principale de syllabation.
 * @param {string} mot Le mot à découper.
 * @returns {string[]} Un tableau contenant les syllabes.
 */
export function syllabify(mot: string): string[] {
    const motOriginal = mot;
    const motLower = mot.toLowerCase();

    // Étape 1 : Vérifier dans le lexique d'exceptions
    if (LEXIQUE_EXCEPTIONS[motLower]) {
        return reconstructCase(motOriginal, LEXIQUE_EXCEPTIONS[motLower]);
    }

    // Étape 2 : Appliquer l'algorithme de découpage si non trouvé
    if (motLower.length < 3) return [motOriginal];

    let syllabes: string[] = [];
    let syllabeCourante = '';

    for (let i = 0; i < motLower.length; i++) {
        syllabeCourante += motLower[i];

        let lookahead = motLower.substring(i + 1, i + 4); // Regarde jusqu'à 3 caractères en avance
        
        // Ex: VCV -> coupe V-CV (ka-yak)
        if (isVoyelle(motLower[i]) && isConsonne(lookahead[0]) && isVoyelle(lookahead[1])) {
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
        }
        // Ex: VCCV -> coupe VC-CV (par-tir)
        else if (isVoyelle(motLower[i]) && isConsonne(lookahead[0]) && isConsonne(lookahead[1]) && isVoyelle(lookahead[2])) {
             // Sauf si le groupe de consonnes est insécable (ta-bleau)
            if (!INSECABLES.has(lookahead.substring(0, 2))) {
                syllabeCourante += lookahead[0];
                i++;
                syllabes.push(syllabeCourante);
                syllabeCourante = '';
            }
        }
    }
    if (syllabeCourante) {
        syllabes.push(syllabeCourante);
    }
    
    // Remettre la casse originale
    return reconstructCase(motOriginal, syllabes);
}
