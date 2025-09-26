
'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

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
function isVoyelle(char: string): boolean { return !!char && VOYELLES.includes(char.toLowerCase()); }
function isConsonne(char: string): boolean { return !!char && CONSONNES.includes(char.toLowerCase()); }

function reconstructCase(original: string, syllabes: string[]): string[] {
    let result: string[] = [];
    let currentIndex = 0;
    for (const syllabe of syllabes) {
        if (currentIndex + syllabe.length > original.length) break;
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
        let lookahead = motLower.substring(i + 1);

        // Nouvelle règle VV (Voyelle-Voyelle)
        if (isVoyelle(motLower[i]) && isVoyelle(lookahead[0])) {
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
            continue; // Passe à l'itération suivante
        }
        
        let char1 = lookahead[0];
        let char2 = lookahead.length > 1 ? lookahead[1] : undefined;
        let char3 = lookahead.length > 2 ? lookahead[2] : undefined;

        // Cas particulier "rbr" dans des mots comme "arbres"
        if (char1 === 'r' && char2 === 'b' && char3 === 'r') {
            syllabeCourante += char1; // syllabeCourante = "ar"
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
            i++; // Avance l'index pour sauter le 'r' déjà traité
            continue;
        }

        // Ex: VCV -> coupe V-CV (ka-yak)
        if (isVoyelle(motLower[i]) && char1 && isConsonne(char1) && char2 && isVoyelle(char2)) {
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
        }
        // Ex: VCCV -> coupe VC-CV (par-tir), mais pas pour les groupes insécables (ta-bleau)
        else if (isVoyelle(motLower[i]) && char1 && isConsonne(char1) && char2 && isConsonne(char2)) {
             const groupe = char1 + char2;
            if (!INSECABLES.has(groupe)) {
                syllabeCourante += char1;
                i++;
                syllabes.push(syllabeCourante);
                syllabeCourante = '';
            }
        }
    }

    if (syllabeCourante) {
        syllabes.push(syllabeCourante);
    }
    
    return reconstructCase(motOriginal, syllabes.filter(Boolean));
}


// --- Composant React ---

interface SyllableTextProps {
  text: string;
}

export function SyllableText({ text }: SyllableTextProps) {
  const elements = text.split(/(\s+|[.,;!?:\(\)])/);
  let colorIndex = 0;

  return (
    <p className="inline">
      {elements.map((element, i) => {
        if (element && !/(\s+|[.,;!?:\(\)])/.test(element)) {
          const syllabes = syllabify(element);
          
          return (
            <React.Fragment key={i}>
              {syllabes.map((syllabe, sIndex) => {
                const currentColorIndex = colorIndex;
                colorIndex++;
                return (
                  <span key={`${syllabe}-${sIndex}`} className={currentColorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600'}>
                    {syllabe}
                  </span>
                )
              })}
            </React.Fragment>
          );
        } else {
          // Espace ou ponctuation, on le remet tel quel
          return <React.Fragment key={i}>{element}</React.Fragment>;
        }
      })}
    </p>
  );
}
