'use client';

import { SoundChoiceExercise } from '@/components/sound-choice-exercise';

/** Le son [in] : quatre graphies possibles, in / im / ain / ein. */
export function SonInExercise() {
    return <SoundChoiceExercise slug="son-in" sound="[in]" options={['in', 'im', 'ain', 'ein']} />;
}
