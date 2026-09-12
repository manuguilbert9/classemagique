/**
 * Génération des calculs posés (additions et soustractions en colonnes).
 *
 * Le tirage vivait dans le composant client ; il est remonté ici pour que les
 * opérations soient mémorisées et partagées entre les élèves.
 */

import type { SkillLevel } from '../skills';

export type OperationType = 'addition' | 'subtraction';
export type CalculPose = {
    id: number;
    operands: number[];
    operation: OperationType;
    answer: number;
};

const generateNumber = (digits: number): number => {
    if (digits < 1) return 0;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateAddition = (numOperands: number, digits: number, withCarry: boolean): CalculPose => {
    let operands: number[] = [];
    let sum = 0;
    let attempts = 0;
    
    while (attempts < 50) {
        attempts++;
        operands = Array.from({ length: numOperands }, () => generateNumber(digits));
        sum = operands.reduce((acc, op) => acc + op, 0);

        if (!withCarry) {
            let hasCarry = false;
            let tempSum = 0;
            for (let d = 0; d < digits; d++) {
                const columnSum = operands.reduce((acc, op) => acc + (Math.floor(op / Math.pow(10, d)) % 10), 0) + Math.floor(tempSum / 10);
                if (columnSum >= 10) {
                    hasCarry = true;
                    break;
                }
                tempSum = columnSum;
            }
            if (!hasCarry) break;
        } else {
            let hasCarry = false;
            let tempSum = 0;
             for (let d = 0; d < digits; d++) {
                const columnSum = operands.reduce((acc, op) => acc + (Math.floor(op / Math.pow(10, d)) % 10), 0) + Math.floor(tempSum / 10);
                if (columnSum >= 10) {
                    hasCarry = true;
                    break;
                }
                 tempSum = columnSum;
            }
            if (hasCarry) break;
        }
    }
    if (attempts >= 50) {
        if (withCarry) {
             operands = Array.from({ length: numOperands - 1 }, () => generateNumber(digits > 1 ? digits -1 : 1)).concat([Number("9".repeat(digits > 1 ? digits - 1 : 1))]);
        } else {
             operands = Array.from({ length: numOperands }, () => Number("1".repeat(digits)));
        }
        sum = operands.reduce((a, b) => a + b, 0);
    }
    
    return { id: Date.now() + Math.random(), operands, operation: 'addition', answer: sum };
};


const generateSubtraction = (digits: number, withCarry: boolean): CalculPose => {
    let op1 = 0, op2 = 0;
    let attempts = 0;

    while (attempts < 50) {
        attempts++;
        op1 = generateNumber(digits);
        op2 = generateNumber(digits);

        if (op1 <= op2) {
            [op1, op2] = [op2, op1];
            if (op1 === op2) op1++;
        }
        
        if (op1 === 0 || op2 === 0) continue;

        let hasCarry = false;
        for (let d = 0; d < digits; d++) {
            const d1 = Math.floor(op1 / Math.pow(10, d)) % 10;
            const d2 = Math.floor(op2 / Math.pow(10, d)) % 10;
            let effectiveD1 = d1;
            
            if(d > 0) {
              const prevD1 = Math.floor(op1 / Math.pow(10, d - 1)) % 10;
              const prevD2 = Math.floor(op2 / Math.pow(10, d - 1)) % 10;
              if (prevD1 < prevD2) {
                effectiveD1 -= 1;
              }
            }

            if (effectiveD1 < d2) {
                hasCarry = true;
                break;
            }
        }
        if (hasCarry === withCarry) break;
    }
    
    if (attempts >= 50) {
        if(withCarry) {
            op1 = parseInt(`5` + '0'.repeat(digits - 1));
            op2 = 1;
        } else {
            op1 = parseInt('9'.repeat(digits));
            op2 = parseInt('1'.repeat(digits));
        }
    }

    return { id: Date.now() + Math.random(), operands: [op1, op2], operation: 'subtraction', answer: op1 - op2 };
};

/**
 * Une séance = trois opérations calibrées sur le niveau, dans un ordre mélangé.
 * On les produit par séries complètes pour que chaque élève reçoive un
 * ensemble cohérent.
 */
function serieDuNiveau(niveau: SkillLevel): CalculPose[] {
  switch (niveau) {
    case 'C':
      return [generateAddition(2, 3, true), generateSubtraction(3, true), generateSubtraction(3, true)];
    case 'D':
      return [generateAddition(3, 4, true), generateSubtraction(4, true), generateSubtraction(4, true)];
    case 'B':
    default:
      return [generateAddition(2, 2, false), generateSubtraction(2, false), generateAddition(2, 2, true)];
  }
}

export function generateCalculsPoses(niveau: SkillLevel, count: number): CalculPose[] {
  const calculs: CalculPose[] = [];
  while (calculs.length < count) {
    calculs.push(...serieDuNiveau(niveau).sort(() => Math.random() - 0.5));
  }
  return calculs.slice(0, count);
}
