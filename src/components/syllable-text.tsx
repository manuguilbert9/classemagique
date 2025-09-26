
import * as React from 'react';
import { cn } from '@/lib/utils';

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

function isVoyelle(char: string): boolean { return char && VOYELLES.includes(char.toLowerCase()); }
function isConsonne(char: string): boolean { return char && CONSONNES.includes(char.toLowerCase()); }

function reconstructCase(original: string, syllabes: string[]): string[] {
    let result: string[] = [];
    let currentIndex = 0;
    for (const syllabe of syllabes) {
        result.push(original.substring(currentIndex, currentIndex + syllabe.length));
        currentIndex += syllabe.length;
    }
    // Gérer les restes si le découpage n'a pas couvert tout le mot
    if (currentIndex < original.length) {
        if (result.length > 0) {
            result[result.length - 1] += original.substring(currentIndex);
        } else {
            result.push(original);
        }
    }
    return result;
}

export function syllabify(mot: string): string[] {
    const motOriginal = mot;
    const motLower = mot.toLowerCase();

    if (LEXIQUE_EXCEPTIONS[motLower]) {
        return reconstructCase(motOriginal, LEXIQUE_EXCEPTIONS[motLower]);
    }

    if (mot.length <= 3) return [motOriginal];

    let syllabes: string[] = [];
    let syllabeCourante = '';

    for (let i = 0; i < motLower.length; i++) {
        syllabeCourante += motLower[i];
        let lookahead = motLower.substring(i + 1, i + 4);

        if (isVoyelle(motLower[i]) && isConsonne(lookahead[0]) && isVoyelle(lookahead[1])) {
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
        } else if (isVoyelle(motLower[i]) && isConsonne(lookahead[0]) && isConsonne(lookahead[1]) && isVoyelle(lookahead[2])) {
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
    
    return reconstructCase(motOriginal, syllabes);
}


// --- Composant React ---

interface SyllableTextProps {
  text: string;
}

export function SyllableText({ text }: SyllableTextProps) {
  const elements = text.split(/(\s+|[.,;!?:\(\)])/);
  let colorIndex = 0;

  return (
    <p>
      {elements.map((element, i) => {
        if (element && !/(\s+|[.,;!?:\(\)])/.test(element)) {
          const syllabes = syllabify(element);
          return (
            <React.Fragment key={i}>
              {syllabes.map((syllabe, j) => {
                const currentColorIndex = colorIndex;
                colorIndex++;
                return (
                  <span key={j} className={currentColorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600'}>
                    {syllabe}
                  </span>
                )
              })}
            </React.Fragment>
          );
        } else {
          return <React.Fragment key={i}>{element}</React.Fragment>;
        }
      })}
    </p>
  );
}
