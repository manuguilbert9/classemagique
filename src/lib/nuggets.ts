
'use server';

import { getSkillBySlug } from './skills';

/**
 * Calculates the number of nuggets earned for a given score and skill.
 * @param score The score achieved. For percentage-based exercises, this is 0-100. For others, it's a raw value (e.g., MCLM).
 * @param skillSlug The unique slug of the skill.
 * @returns The number of nuggets earned.
 */
export const calculateNuggets = (score: number, skillSlug: string): number => {
    const skill = getSkillBySlug(skillSlug);

    // For non-percentage based scores (like fluence or simple completion)
    // These exercises are completion-based.
    const completionBasedSkills = [
        'fluence', 'reading-race', // MCLM scores
        'decoding', 'syllable-table', 'writing-notebook', 'lire-des-phrases' // Completion scores
    ];

    if (completionBasedSkills.includes(skillSlug)) {
        if (score > 0) return 2; // Fixed 2 nuggets for completing the exercise
        return 0;
    }
    
    if (skillSlug.startsWith('orthographe-')) {
        if (score >= 90) return 3;
        if (score >= 70) return 2;
        return 0; // No nuggets below 70 for spelling
    }

    // For percentage-based scores (default)
    if (score >= 90) return 3;
    if (score >= 80) return 2;
    if (score >= 70) return 1;
    return 0;
};
