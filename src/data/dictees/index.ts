import type { DicteeSemaine } from './types';
import { PERIODE_1 } from './periode-1';
import { PERIODE_2 } from './periode-2';
import { PERIODE_3 } from './periode-3';
import { PERIODE_4 } from './periode-4';
import { PERIODE_5 } from './periode-5';

export * from './types';

/** Les 34 semaines de la méthode Dyna-Mots CE2, dans l'ordre. */
export const DICTEES_CE2: DicteeSemaine[] = [
  ...PERIODE_1,
  ...PERIODE_2,
  ...PERIODE_3,
  ...PERIODE_4,
  ...PERIODE_5,
];
