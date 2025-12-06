
'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

// --- MOTEUR DE SYLLABATION AMÉLIORÉ V3 avec lettres muettes ---

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

// Digrammes et trigrammes vocaliques
const VOYELLES_COMPOSEES = [
  'eau', 'aux', 'eaux',
  'oeu', 'œu',
  'aie', 'aient',
  'oui', 'ouï',
  'oin', 'ien', 'ion', 'ieu',
  'ou', 'où', 'oû',
  'au', 'ai', 'aî',
  'ei', 'eu', 'eû',
  'œ', 'oi', 'oî',
  'an', 'am', 'en', 'em',
  'in', 'im', 'yn', 'ym',
  'on', 'om', 'un', 'um',
];

const CONSONNES = 'bcçdfghjklmnpqrstvwxz';

const INSECABLES = new Set([
  'bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'gn',
  'ph', 'pl', 'pr', 'th', 'tr', 'vr', 'sc', 'sk', 'sp', 'st', 'sw',
  'sch', 'scr', 'spl', 'spr', 'str'
]);

// Lettres muettes finales courantes
const LETTRES_MUETTES_FINALES = ['s', 't', 'd', 'x', 'z', 'p', 'g', 'c', 'b'];

// Mots où la lettre finale N'EST PAS muette
const EXCEPTIONS_NON_MUETTES = new Set([
  'bus', 'mars', 'tennis', 'vis', 'os', 'as', 'plus', 'tous', 'sens', 'fils',
  'net', 'mat', 'set', 'but', 'sept', 'est', 'ouest',
  'sud', 'nord',
  'index', 'latex', 'phoenix', 'sex',
  'gaz', 'quiz',
  'cap', 'stop', 'clip', 'top', 'hip', 'hop',
  'lac', 'sac', 'bac', 'sec', 'avec', 'donc', 'chic', 'truc',
  'club', 'snob', 'job', 'pub',
]);

function isVoyelle(char: string): boolean {
  return !!char && VOYELLES_SIMPLES.includes(char.toLowerCase());
}

function isConsonne(char: string): boolean {
  return !!char && CONSONNES.includes(char.toLowerCase());
}

function getVoyelleComposee(str: string): string | null {
  const strLower = str.toLowerCase();
  for (const vc of VOYELLES_COMPOSEES.sort((a, b) => b.length - a.length)) {
    if (strLower.startsWith(vc)) {
      const nextChar = str[vc.length];
      if (['an', 'am', 'en', 'em', 'in', 'im', 'yn', 'ym', 'on', 'om', 'un', 'um'].includes(vc)) {
        if (nextChar && (isVoyelle(nextChar) || nextChar.toLowerCase() === 'n' || nextChar.toLowerCase() === 'm')) {
          continue;
        }
      }
      return str.substring(0, vc.length);
    }
  }
  return null;
}

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

// Détecte les lettres muettes à la fin d'un mot
function detectSilentLetters(mot: string): number {
  const motLower = mot.toLowerCase();

  // Mots trop courts
  if (motLower.length <= 2) return 0;

  // Exceptions : mots où la finale se prononce
  if (EXCEPTIONS_NON_MUETTES.has(motLower)) {
    return 0;
  }

  const lastChar = motLower[motLower.length - 1];
  const beforeLast = motLower[motLower.length - 2];
  const twoLast = motLower.slice(-2);
  const threeLast = motLower.slice(-3);

  // === Terminaisons verbales ===

  // "-ent" des verbes (3ème personne pluriel) - 3 lettres muettes
  // Ex: parlent, mangent, jouaient, finissent
  if (threeLast === 'ent' && motLower.length > 4) {
    const beforeEnt = motLower.slice(0, -3);
    // Après voyelle ou groupe vocalique typique des verbes
    if (beforeEnt.match(/(ai|i|a|ou|u|é|oi|ie|ue|ée)$/)) {
      return 3;
    }
  }

  // "-ait", "-aient" (imparfait) - 't' final muet
  if (motLower.endsWith('ait') || motLower.endsWith('aient')) {
    return motLower.endsWith('aient') ? 4 : 1;
  }

  // "-aient" déjà traité ci-dessus

  // === Terminaisons en -e ===

  // "-ée" final : généralement le 2ème 'e' n'est pas muet (idée, réputée)
  // mais parfois oui... On ne marque pas comme muet
  if (twoLast === 'ée') {
    return 0;
  }

  // "-es" final (pluriel, conjugaison) - 's' muet seulement
  // Ex: exquises, étoiles, pâtisseries
  if (twoLast === 'es' && motLower.length > 3) {
    return 1; // juste le 's'
  }

  // "-e" final muet (très courant en français)
  // Ex: jeune, idole, célèbre, tarte, boutique, forme, sucre, etc.
  if (lastChar === 'e' && motLower.length > 2) {
    // Exceptions où le 'e' n'est pas muet
    // - après une autre voyelle (sauf 'u' dans '-ue', '-que')
    const avantE = beforeLast;

    // 'e' après 'é', 'è', 'ê' = souvent prononcé (lycée, idée) - non muet
    if (['é', 'è', 'ê'].includes(avantE)) {
      return 0;
    }

    // Sinon, 'e' final est généralement muet
    return 1;
  }

  // === Consonnes finales muettes ===

  // "-ts" final (pluriel de mots en -t) - 2 lettres muettes
  // Ex: pétillants -> "ts" muet
  if (twoLast === 'ts' || twoLast === 'ds' || twoLast === 'ps') {
    return 2;
  }

  // Double consonne finale = généralement prononcé
  if (beforeLast === lastChar) {
    return 0;
  }

  // Consonnes finales muettes simples
  if (LETTRES_MUETTES_FINALES.includes(lastChar)) {
    // Vérifications spéciales

    // 'r' final est généralement prononcé
    if (lastChar === 'r') return 0;

    // 's' après consonne (sauf cas traités) = muet
    // 't' après voyelle = muet (vivait, fait, haut, tabouret, etc.)
    // 'd' final = muet (Gaspard, grand)
    // 'x' final = muet (Curieux, heureux)
    // 'z' final = muet (chez, nez)
    // 'p' final = muet (trop, coup)

    return 1;
  }

  return 0;
}

export function syllabify(mot: string): string[] {
  const motOriginal = mot;
  const motLower = mot.toLowerCase();

  if (LEXIQUE_EXCEPTIONS[motLower]) {
    return reconstructCase(motOriginal, LEXIQUE_EXCEPTIONS[motLower]);
  }

  if (mot.length <= 2) return [motOriginal];

  const tokens: { char: string, type: 'voyelle' | 'consonne' | 'autre' }[] = [];
  let i = 0;

  while (i < motLower.length) {
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

  let syllabes: string[] = [];
  let syllabeCourante = '';

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    syllabeCourante += token.char;

    if (token.type === 'voyelle') {
      let consonnesQuiSuivent: string[] = [];
      let j = t + 1;
      while (j < tokens.length && tokens[j].type === 'consonne') {
        consonnesQuiSuivent.push(tokens[j].char);
        j++;
      }

      const voyelleApres = j < tokens.length && tokens[j].type === 'voyelle';

      if (consonnesQuiSuivent.length === 0) {
        if (t < tokens.length - 1 && tokens[t + 1].type === 'voyelle') {
          syllabes.push(syllabeCourante);
          syllabeCourante = '';
        }
      } else if (consonnesQuiSuivent.length === 1 && voyelleApres) {
        syllabes.push(syllabeCourante);
        syllabeCourante = '';
      } else if (consonnesQuiSuivent.length >= 2 && voyelleApres) {
        const groupe = consonnesQuiSuivent.slice(0, 2).join('');
        const groupeTrois = consonnesQuiSuivent.slice(0, 3).join('');

        // Double consonne (ss, tt, mm, rr, ll, nn, pp, ff, cc) -> couper entre les deux
        // Ex: saucisson -> sau-cis-son, passer -> pas-ser
        if (consonnesQuiSuivent[0] === consonnesQuiSuivent[1]) {
          syllabeCourante += consonnesQuiSuivent[0];
          t++;
          syllabes.push(syllabeCourante);
          syllabeCourante = '';
        } else if (consonnesQuiSuivent.length >= 3 && isInsecable(groupeTrois)) {
          syllabes.push(syllabeCourante);
          syllabeCourante = '';
        } else if (isInsecable(groupe)) {
          if (consonnesQuiSuivent.length > 2) {
            syllabeCourante += consonnesQuiSuivent[0];
            t++;
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
          } else {
            syllabes.push(syllabeCourante);
            syllabeCourante = '';
          }
        } else {
          syllabeCourante += consonnesQuiSuivent[0];
          t++;
          syllabes.push(syllabeCourante);
          syllabeCourante = '';
        }
      }
    }
  }

  if (syllabeCourante) {
    syllabes.push(syllabeCourante);
  }

  return reconstructCase(motOriginal, syllabes.filter(s => s.length > 0));
}


// --- Composant React ---

interface SyllableTextProps {
  text: string;
}

// Rend une syllabe avec les lettres muettes en gris
function renderSyllabeWithSilentLetters(
  syllabe: string,
  silentCount: number,
  colorClass: string,
  key: string
): React.ReactNode {
  if (silentCount > 0 && silentCount < syllabe.length) {
    const pronounced = syllabe.slice(0, -silentCount);
    const silent = syllabe.slice(-silentCount);
    return (
      <React.Fragment key={key}>
        <span className={colorClass}>{pronounced}</span>
        <span className="text-gray-400">{silent}</span>
      </React.Fragment>
    );
  }
  return <span key={key} className={colorClass}>{syllabe}</span>;
}

export function SyllableText({ text }: SyllableTextProps) {
  const elements = text.split(/(\s+|[.,;!?:\(\)"])/);
  let colorIndex = 0;

  return (
    <span className="inline">
      {elements.map((element, i) => {
        if (element && !/^(\s+|[.,;!?:\(\)"])$/.test(element)) {
          // Gérer les mots avec apostrophe
          const apostropheMatch = element.match(/^([ldjstnmcLDJSTNMC]')(.+)$/);

          if (apostropheMatch) {
            const prefix = apostropheMatch[1];
            const reste = apostropheMatch[2];
            const syllabesReste = syllabify(reste);
            const silentCount = detectSilentLetters(reste);

            return (
              <React.Fragment key={i}>
                <span className={colorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600'}>
                  {prefix}
                </span>
                {(() => { colorIndex++; return null; })()}
                {syllabesReste.map((syllabe, sIndex) => {
                  const currentColorIndex = colorIndex;
                  const colorClass = currentColorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600';
                  colorIndex++;

                  // Appliquer les lettres muettes seulement à la dernière syllabe
                  if (sIndex === syllabesReste.length - 1 && silentCount > 0) {
                    return renderSyllabeWithSilentLetters(syllabe, silentCount, colorClass, `${syllabe}-${sIndex}`);
                  }
                  return <span key={`${syllabe}-${sIndex}`} className={colorClass}>{syllabe}</span>;
                })}
              </React.Fragment>
            );
          }

          const syllabes = syllabify(element);
          const silentCount = detectSilentLetters(element);

          return (
            <React.Fragment key={i}>
              {syllabes.map((syllabe, sIndex) => {
                const currentColorIndex = colorIndex;
                const colorClass = currentColorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600';
                colorIndex++;

                // Appliquer les lettres muettes seulement à la dernière syllabe
                if (sIndex === syllabes.length - 1 && silentCount > 0) {
                  return renderSyllabeWithSilentLetters(syllabe, silentCount, colorClass, `${syllabe}-${sIndex}`);
                }
                return <span key={`${syllabe}-${sIndex}`} className={colorClass}>{syllabe}</span>;
              })}
            </React.Fragment>
          );
        } else {
          return <React.Fragment key={i}>{element}</React.Fragment>;
        }
      })}
    </span>
  );
}
