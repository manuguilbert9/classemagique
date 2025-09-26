
'use client';

import * as React from 'react';

// --- MOTEUR DE SYLLABATION AMÉLIORÉ ---
// Logique transposée depuis le script fourni par l'utilisateur.

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

// Fonctions utilitaires
const isVoyelle = (char: string) => char && VOYELLES.includes(char.toLowerCase());
const isConsonne = (char: string) => char && CONSONNES.includes(char.toLowerCase());

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
        const len = syllabe.length;
        result.push(original.substring(currentIndex, currentIndex + len));
        currentIndex += len;
    }
    return result;
}


/**
 * Fonction principale de syllabation, transposée du script JS fourni.
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
    if (mot.length <= 2) return [motOriginal];

    let syllabes: string[] = [];
    let syllabeCourante = '';

    for (let i = 0; i < mot.length; i++) {
        syllabeCourante += mot[i];

        let char = mot[i];
        let next1 = mot[i + 1];
        let next2 = mot[i + 2];
        let next3 = mot[i + 3];
        
        // Ex: VCV -> coupe V-CV (ka-yak)
        if (isVoyelle(char) && isConsonne(next1) && isVoyelle(next2)) {
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
        }
        // Ex: VCCV -> coupe VC-CV (par-tir)
        else if (isVoyelle(char) && isConsonne(next1) && isConsonne(next2) && isVoyelle(next3)) {
             // Sauf si le groupe de consonnes est insécable (ta-bleau)
            if (!INSECABLES.has(`${next1}${next2}`)) {
                syllabeCourante += next1;
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
        if (/\s+/.test(word) || word === '') {
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
