
'use client';

import * as React from 'react';

// Simplified syllabation logic for French
const syllabify = (word: string): string[] => {
    // This is a very basic syllabation and will have errors.
    // It's a placeholder for a more complex engine.
    const vowels = 'aàâeéèêëiîïoôuùûœæ';
    const consonants = 'bcdfghjklmnpqrstvwxz';
    const digraphs = ['ch', 'ph', 'th', 'gn', 'ou', 'au', 'eau', 'ai', 'ei', 'eu', 'œu', 'oi', 'an', 'en', 'in', 'on', 'un', 'om', 'am', 'em', 'im', 'um'];
    const trigraphs = ['oin', 'eau'];

    let syllables: string[] = [];
    let currentSyllable = '';

    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        let nextChar = word[i + 1] || '';
        let nextTwoChars = word.substring(i + 1, i + 3);
        let currentGroup = char + nextChar;
        let currentTrigraph = char + nextTwoChars;

        if (trigraphs.includes(currentTrigraph.toLowerCase())) {
            currentSyllable += currentTrigraph;
            i += 2;
        } else if (digraphs.includes(currentGroup.toLowerCase())) {
            currentSyllable += currentGroup;
            i += 1;
        } else {
            currentSyllable += char;
        }

        // Basic rule: A syllable often ends after a vowel if followed by a consonant
        if (vowels.includes(char.toLowerCase())) {
            if (consonants.includes(nextChar.toLowerCase())) {
                // Look ahead for consonant cluster (e.g., "tr", "pl")
                let nextNextChar = word[i + 2] || '';
                if (!['l', 'r'].includes(nextNextChar.toLowerCase()) || !consonants.includes(nextChar.toLowerCase())) {
                    syllables.push(currentSyllable);
                    currentSyllable = '';
                }
            }
        }
    }
    
    if (currentSyllable) {
        syllables.push(currentSyllable);
    }
    
    // Post-processing to merge single consonants with the previous syllable
    if (syllables.length > 1) {
       for (let i = syllables.length - 1; i > 0; i--) {
            if (consonants.includes(syllables[i]) && syllables[i].length === 1) {
                syllables[i-1] += syllables[i];
                syllables.splice(i, 1);
            }
        }
    }


    return syllables.filter(s => s.length > 0);
};


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
        
        const syllables = syllabify(word);
        
        return (
          <span key={wordIndex} className="inline-block">
            {syllables.map((syllable, syllableIndex) => (
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
