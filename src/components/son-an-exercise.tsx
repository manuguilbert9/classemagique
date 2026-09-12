'use client';

import { SoundChoiceExercise } from '@/components/sound-choice-exercise';

/** Le son [an] : quatre graphies possibles, an / en / am / em. */
export function SonAnExercise() {
    return <SoundChoiceExercise slug="son-an" sound="[an]" options={['an', 'en', 'am', 'em']} />;
}
