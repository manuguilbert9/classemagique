
'use client';

import * as React from 'react';

// --- MOTEUR DE SYLLABATION AMÉLIORÉ ---

// 1. LEXIQUE D'EXCEPTIONS
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

/**
 * Reconstruit la casse du mot original sur les syllabes découpées.
 * @param {string} original Le mot original.
 * @param {string[]} syllabes Le tableau de syllabes en minuscule.
 * @returns {string[]} Le tableau de syllabes avec la bonne casse.
 */
function reconstructCase(original: string, syllabes: string[]): string[] {
    let result = [];
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
function syllabify(mot: string): string[] {
    const motOriginal = mot;
    mot = mot.toLowerCase();

    // Étape 1 : Vérifier dans le lexique d'exceptions
    if (LEXIQUE_EXCEPTIONS[mot]) {
        return LEXIQUE_EXCEPTIONS[mot];
    }

    // Étape 2 : Appliquer l'algorithme de découpage si non trouvé
    if (mot.length < 3) return [motOriginal];

    let syllabes: string[] = [];
    let syllabeCourante = '';

    const isVoyelle = (char: string) => VOYELLES.includes(char);
    const isConsonne = (char: string) => CONSONNES.includes(char);

    for (let i = 0; i < mot.length; i++) {
        syllabeCourante += mot[i];

        let lookahead = mot.substring(i + 1, i + 4); // Regarde jusqu'à 3 caractères en avance
        
        // Ex: VCV -> coupe V-CV (ka-yak)
        if (isVoyelle(mot[i]) && isConsonne(lookahead[0]) && isVoyelle(lookahead[1])) {
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
        }
        // Ex: VCCV -> coupe VC-CV (par-tir)
        else if (isVoyelle(mot[i]) && isConsonne(lookahead[0]) && isConsonne(lookahead[1]) && isVoyelle(lookahead[2])) {
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


interface SyllableTextProps {
  text: string;
}

export function SyllableText({ text }: SyllableTextProps) {
  const words = text.split(/(\s+)/); // Split by space but keep spaces

  return (
    <p className="font-body leading-relaxed">
      {words.map((word, wordIndex) => {
        if (/\s+/.test(word)) {
          return <React.Fragment key={wordIndex}>{word}</React.Fragment>;
        }
        
        // Utilise la nouvelle fonction de syllabation
        const syllabes = syllabify(word);
        
        return (
          <span key={wordIndex} className="inline-block">
            {syllabes.map((syllable, syllableIndex) => (
              <span
                key={syllableIndex}
                className={syllableIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600'}
              >
                {syllable}
              </span>
            ))}
          </span>
        );
      })}
    </p>
  );
}
