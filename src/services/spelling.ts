

'use client';

import { SPELLING_LISTS_RAW } from '@/data/orthographe/listes_orthographe';

// This function can be called from client components as it fetches data.
// It is no longer a 'server' utility in the same way.

export interface SpellingList {
  id: string;
  title: string;
  words: string[];
  totalWords: number;
}

// This function parses the raw text content of the spelling list file.
function parseSpellingFile(fileContent: string, logDebug: (message: string) => void): SpellingList[] {
    logDebug("Début du parsing du fichier.");
    const lists: SpellingList[] = [];
    const lines = fileContent.split('\n').filter(line => line.trim() !== ''); // Ignore empty lines
    logDebug(`${lines.length} lignes non vides trouvées.`);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Check if the line is a list header (e.g., "D1 – ...")
        if (/^D\d+\s*–/.test(line)) {
            logDebug(`En-tête de liste trouvé à la ligne ${i + 1}: "${line}"`);
            const titleParts = line.split('–');
            const listId = titleParts[0].trim();
            const listTitle = titleParts.slice(1).join('–').trim();
            
            // The words are expected on the next line
            if (i + 1 < lines.length) {
                const wordsLine = lines[i + 1].trim();
                const words = wordsLine.split(',').map(word => word.trim()).filter(Boolean);
                logDebug(`  - ID: ${listId}, Titre: ${listTitle}, ${words.length} mots trouvés.`);
                
                lists.push({
                    id: listId,
                    title: listTitle,
                    words: words,
                    totalWords: words.length
                });
                // Skip the next line since we've already processed it
                i++; 
            } else {
                 logDebug(`  - AVERTISSEMENT: En-tête de liste trouvé à la fin du fichier sans ligne de mots.`);
            }
        }
    }
    logDebug(`Parsing terminé. ${lists.length} listes ont été créées.`);
    return lists;
}


/**
 * Parse les listes d'orthographe embarquées dans le bundle client.
 * Cette fonction reste compatible avec les composants client.
 */
export async function getSpellingLists(logDebug: (message: string) => void = () => {}): Promise<SpellingList[]> {
    logDebug('Chargement du fichier d\'orthographe embarqué.');

    try {
        if (!SPELLING_LISTS_RAW) {
            logDebug("ERREUR: Le contenu du fichier est vide.");
            return [];
        }

        logDebug(`Contenu du fichier chargé (100 premiers caractères): "${SPELLING_LISTS_RAW.substring(0, 100)}..."`);
        return parseSpellingFile(SPELLING_LISTS_RAW, logDebug);
    } catch (error) {
        if (error instanceof Error) {
            logDebug(`ERREUR lors du chargement ou du parsing: ${error.message}`);
        } else {
            logDebug(`ERREUR inconnue lors du chargement ou du parsing.`);
        }
        return [];
    }
}
