
'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

// --- MOTEUR DE SYLLABATION AMÉLIORÉ V2 ---

// 1. LEXIQUE D'EXCEPTIONS
const LEXIQUE_EXCEPTIONS: { [key: string]: string[] } = {
  "monsieur": ["mon", "sieur"],
  "femme": ["fem", "me"],
  "oeil": ["oeil"],
  "yeux": ["yeux"],
  "aujourd'hui": ["au", "jour", "d'hui"],
  "examen": ["e", "xa", "men"],
  "second": ["se", "cond"],
  "technique": ["tech", "nique"],
  "automne": ["au", "tom", "ne"],
  "rythme": ["ryth", "me"],
  "baptême": ["bap", "tê", "me"],
  "football": ["foot", "ball"],
  "omnibus": ["om", "ni", "bus"],
  "omniscient": ["om", "ni", "scient"],
  "onze": ["on", "ze"],
  "quelqu'un": ["quel", "qu'un"],
  "solennel": ["so", "len", "nel"],
  "chocolat": ["cho", "co", "lat"],
  "meringue": ["me", "rin", "gue"],
  "transformer": ["trans", "for", "mer"],
  "bienvenue": ["bien", "ve", "nue"],
  "saucisson": ["sau", "cis", "son"],
  "chevalier": ["che", "va", "lier"],
  "royaume": ["ro", "yau", "me"],
  "interpella": ["in", "ter", "pel", "la"],
};

// Voyelles simples
const VOYELLES_SIMPLES = 'aàâeéèêëiîïoôuùûüy';

// Digrammes et trigrammes vocaliques (sons voyelles composés) - traités comme une seule unité
const VOYELLES_COMPOSEES = [
  'eau', 'aux', 'eaux', // o
  'oeu', 'œu', // eu
  'aie', 'aient', // è
  'oui', // wi
  'ouï', // wi
  'oin', // wɛ̃
  'ien', // jɛ̃
  'ion', // jɔ̃
  'ieu', // jø
  'ou', 'où', 'oû', // u
  'au', // o
  'ai', 'aî', // è
  'ei', // è  
  'eu', 'eû', // ø
  'œ', // ø
  'oi', 'oî', // wa
  'an', 'am', 'en', 'em', // ɑ̃ (nasales devant consonne)
  'in', 'im', 'yn', 'ym', // ɛ̃
  'on', 'om', // ɔ̃
  'un', 'um', // œ̃
];

const CONSONNES = 'bcçdfghjklmnpqrstvwxz';

// Groupes de consonnes insécables (ne se séparent pas)
const INSECABLES = new Set([
  'bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'gn',
  'ph', 'pl', 'pr', 'th', 'tr', 'vr', 'sc', 'sk', 'sp', 'st', 'sw',
  'sch', 'scr', 'spl', 'spr', 'str'
]);

function isVoyelle(char: string): boolean {
  return !!char && VOYELLES_SIMPLES.includes(char.toLowerCase());
}

function isConsonne(char: string): boolean {
  return !!char && CONSONNES.includes(char.toLowerCase());
}

// Vérifie si une séquence commence par une voyelle composée
function getVoyelleComposee(str: string): string | null {
  const strLower = str.toLowerCase();
  // Trier par longueur décroissante pour matcher les plus longs d'abord
  for (const vc of VOYELLES_COMPOSEES.sort((a, b) => b.length - a.length)) {
    if (strLower.startsWith(vc)) {
      // Vérifier que ce n'est pas suivi d'une voyelle (pour éviter "ou" dans "ouvre")
      const nextChar = str[vc.length];
      // Pour les nasales (an, en, in, on, un), vérifier qu'elles ne sont pas suivies d'une voyelle ou n/m
      if (['an', 'am', 'en', 'em', 'in', 'im', 'yn', 'ym', 'on', 'om', 'un', 'um'].includes(vc)) {
        if (nextChar && (isVoyelle(nextChar) || nextChar.toLowerCase() === 'n' || nextChar.toLowerCase() === 'm')) {
          continue; // Ce n'est pas une vraie nasale
        }
      }
      return str.substring(0, vc.length);
    }
  }
  return null;
}

// Vérifie si un groupe de consonnes est insécable
function isInsecable(consonnes: string): boolean {
  return INSECABLES.has(consonnes.toLowerCase());
}

function reconstructCase(original: string, syllabes: string[]): string[] {
  let result: string[] = [];
  let currentIndex = 0;
  for (const syllabe of syllabes) {
    if (currentIndex + syllabe.length > original.length) break;
    result.push(original.substring(currentIndex, currentIndex + syllabe.length));
    currentIndex += syllabe.length;
  }
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

  // Vérifier les exceptions
  if (LEXIQUE_EXCEPTIONS[motLower]) {
    return reconstructCase(motOriginal, LEXIQUE_EXCEPTIONS[motLower]);
  }

  // Mots très courts
  if (mot.length <= 2) return [motOriginal];

  // Tokeniser le mot en unités phonétiques (voyelles composées ou caractères simples)
  const tokens: { char: string, type: 'voyelle' | 'consonne' | 'autre' }[] = [];
  let i = 0;

  while (i < motLower.length) {
    // Essayer de matcher une voyelle composée
    const voyelleComposee = getVoyelleComposee(motLower.substring(i));
    if (voyelleComposee) {
      tokens.push({ char: motLower.substring(i, i + voyelleComposee.length), type: 'voyelle' });
      i += voyelleComposee.length;
    } else if (isVoyelle(motLower[i])) {
      tokens.push({ char: motLower[i], type: 'voyelle' });
      i++;
    } else if (isConsonne(motLower[i])) {
      tokens.push({ char: motLower[i], type: 'consonne' });
      i++;
    } else {
      tokens.push({ char: motLower[i], type: 'autre' });
      i++;
    }
  }

  // Maintenant, appliquer les règles de syllabation sur les tokens
  let syllabes: string[] = [];
  let syllabeCourante = '';

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    syllabeCourante += token.char;

    // Si on est sur une voyelle, regarder ce qui suit
    if (token.type === 'voyelle') {
      // Compter les consonnes qui suivent
      let consonnesQuiSuivent: string[] = [];
      let j = t + 1;
      while (j < tokens.length && tokens[j].type === 'consonne') {
        consonnesQuiSuivent.push(tokens[j].char);
        j++;
      }

      // Vérifier s'il y a une voyelle après les consonnes
      const voyelleApres = j < tokens.length && tokens[j].type === 'voyelle';

      if (consonnesQuiSuivent.length === 0) {
        // V suivi de V ou fin de mot -> couper après la voyelle actuelle
        if (t < tokens.length - 1 && tokens[t + 1].type === 'voyelle') {
          syllabes.push(syllabeCourante);
          syllabeCourante = '';
        }
      } else if (consonnesQuiSuivent.length === 1 && voyelleApres) {
        // VCV -> V-CV (couper avant la consonne)
        syllabes.push(syllabeCourante);
        syllabeCourante = '';
      } else if (consonnesQuiSuivent.length >= 2 && voyelleApres) {
        // VCCV ou plus
        const groupe = consonnesQuiSuivent.slice(0, 2).join('');
        const groupeTrois = consonnesQuiSuivent.slice(0, 3).join('');

        if (consonnesQuiSuivent.length >= 3 && isInsecable(groupeTrois)) {
          // Groupe de 3 consonnes insécable -> couper avant
          syllabes.push(syllabeCourante);
          syllabeCourante = '';
        } else if (isInsecable(groupe)) {
          // Groupe insécable -> VC-CCV ou V-CCV selon le contexte
          if (consonnesQuiSuivent.length > 2) {
            // Prendre la première consonne et couper
            syllabeCourante += consonnesQuiSuivent[0];
            t++; // Avancer le pointeur
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
          } else {
            // Juste 2 consonnes insécables -> couper avant
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
          }
        } else {
          // Groupe sécable -> VC-CV (prendre la première consonne)
          syllabeCourante += consonnesQuiSuivent[0];
          t++; // Avancer le pointeur
          syllabes.push(syllabeCourante);
          syllabeCourante = '';
        }
      }
    }
  }

  // Ajouter la dernière syllabe
  if (syllabeCourante) {
    syllabes.push(syllabeCourante);
  }

  // Filtrer les syllabes vides et reconstruire avec la casse originale
  return reconstructCase(motOriginal, syllabes.filter(s => s.length > 0));
}


// --- Composant React ---

interface SyllableTextProps {
  text: string;
}

export function SyllableText({ text }: SyllableTextProps) {
  // Séparer par espaces et ponctuation, en gardant les apostrophes avec le mot
  const elements = text.split(/(\s+|[.,;!?:\(\)"])/);
  let colorIndex = 0;

  return (
    <span className="inline">
      {elements.map((element, i) => {
        if (element && !/^(\s+|[.,;!?:\(\)"])$/.test(element)) {
          // Gérer les mots avec apostrophe (l', d', qu', etc.)
          const apostropheMatch = element.match(/^([ldjstnmcLDJSTNMC]')(.+)$/);

          if (apostropheMatch) {
            // Mot avec apostrophe préfixe
            const prefix = apostropheMatch[1];
            const reste = apostropheMatch[2];
            const syllabesReste = syllabify(reste);

            return (
              <React.Fragment key={i}>
                <span className={colorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600'}>
                  {prefix}
                </span>
                {(() => { colorIndex++; return null; })()}
                {syllabesReste.map((syllabe, sIndex) => {
                  const currentColorIndex = colorIndex;
                  colorIndex++;
                  return (
                    <span key={`${syllabe}-${sIndex}`} className={currentColorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600'}>
                      {syllabe}
                    </span>
                  );
                })}
              </React.Fragment>
            );
          }

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
          // Espace ou ponctuation
          return <React.Fragment key={i}>{element}</React.Fragment>;
        }
      })}
    </span>
  );
}
