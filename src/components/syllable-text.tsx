
'use client';
import * as React from 'react';
import { syllabifier, SyllabeResult } from '@/lib/lirecouleur-engine';

// --- Composant React avec moteur LireCouleur ---

interface SyllableTextProps {
  text: string;
}

// Rend une syllabe avec les lettres muettes en gris
function renderSyllabeWithSilentLetters(
  result: SyllabeResult,
  colorClass: string,
  key: string
): React.ReactNode {
  if (result.muet) {
    return (
      <React.Fragment key={key}>
        <span className={colorClass}>{result.syllabe}</span>
        <span className="text-gray-400">{result.muet}</span>
      </React.Fragment>
    );
  }
  return <span key={key} className={colorClass}>{result.syllabe}</span>;
}

export function SyllableText({ text }: SyllableTextProps) {
  // Séparer par espaces, ponctuation ET tirets (en gardant les tirets)
  const elements = text.split(/(\s+|[.,;!?:\(\)"'-])/);
  let colorIndex = 0;

  return (
    <span className="inline">
      {elements.map((element, i) => {
        // Si c'est un espace, ponctuation ou tiret, on l'affiche tel quel
        if (!element || /^(\s+|[.,;!?:\(\)"'-])$/.test(element)) {
          return <React.Fragment key={i}>{element}</React.Fragment>;
        }

        // Gérer les mots avec apostrophe (l', d', qu', etc.)
        const apostropheMatch = element.match(/^([ldjstnmcLDJSTNMC][''])(.+)$/);

        if (apostropheMatch) {
          const prefix = apostropheMatch[1];
          const reste = apostropheMatch[2];
          const syllabesReste = syllabifier(reste);

          return (
            <React.Fragment key={i}>
              <span className={colorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600'}>
                {prefix}
              </span>
              {(() => { colorIndex++; return null; })()}
              {syllabesReste.map((result, sIndex) => {
                const currentColorIndex = colorIndex;
                const colorClass = currentColorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600';
                colorIndex++;
                return renderSyllabeWithSilentLetters(result, colorClass, `${result.syllabe}-${sIndex}`);
              })}
            </React.Fragment>
          );
        }

        // Mot normal
        const syllabes = syllabifier(element);

        return (
          <React.Fragment key={i}>
            {syllabes.map((result, sIndex) => {
              const currentColorIndex = colorIndex;
              const colorClass = currentColorIndex % 2 === 0 ? 'text-blue-600' : 'text-red-600';
              colorIndex++;
              return renderSyllabeWithSilentLetters(result, colorClass, `${result.syllabe}-${sIndex}`);
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
}

// Export syllabify for backward compatibility
export { syllabifier as syllabify } from '@/lib/lirecouleur-engine';
