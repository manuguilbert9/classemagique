
'use client';

import * as React from 'react';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';
import { Delete } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  numericOnly?: boolean;
  disabled?: boolean;
}

const keyboardLayout = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['W', 'X', 'C', 'V', 'B', 'N', '⌫'],
  ['É', 'È', 'Ê', 'À', 'Â', 'Î', 'Ô', 'Ù', 'Û', 'Ç', 'Ë', 'Ï', 'Ü', 'Œ'],
];

const numericLayout = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '⌫']
]

export function VirtualKeyboard({ onKeyPress, numericOnly = false, disabled = false }: VirtualKeyboardProps) {
    const layout = numericOnly ? numericLayout : keyboardLayout;
  return (
    <div className="w-full min-w-0 bg-muted p-2 sm:p-4 rounded-lg shadow-inner" role="group" aria-label={numericOnly ? 'Clavier numérique' : 'Clavier de lettres et accents'}>
      <div className="flex flex-col items-center justify-center gap-2">
        {layout.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex flex-wrap justify-center gap-1 sm:gap-2 w-full">
            {row.map((key) => (
              <Button
                key={key}
                onClick={() => onKeyPress(key)}
                type="button"
                disabled={disabled}
                aria-label={key === '⌫' ? 'Effacer la dernière lettre ou le dernier chiffre' : key}
                variant="outline"
                className={cn(
                    "h-11 w-11 sm:h-14 sm:w-14 shrink-0 p-0 text-xl font-bold bg-background shadow-md transform active:scale-95 active:bg-accent"
                )}
              >
                {key === '⌫' ? <Delete /> : key}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
