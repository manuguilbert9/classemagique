
'use client';

import * as React from 'react';
import Link from 'next/link';
import { getSkillBySlug } from '@/lib/skills';
import { Button } from '@/components/ui/button';
import { SyllableText } from '../syllable-text';

export const EXERCISE_URL_REGEX = new RegExp('(https://studio--classemagique2\\.us-central1\\.hosted\\.app/exercise/([a-zA-Z0-9-]+))', 'g');

interface ChatMessageContentProps {
    text: string;
    colorizeSyllables: boolean;
}

export function ChatMessageContent({ text, colorizeSyllables }: ChatMessageContentProps) {
    const parts = text.split(EXERCISE_URL_REGEX);

    return (
        <span>
            {parts.map((part, index) => {
                // Check if the part is a captured URL
                if (index % 3 === 1) {
                    const url = part;
                    const skillSlug = parts[index + 1];
                    const skill = getSkillBySlug(skillSlug);

                    if (skill) {
                        return (
                            <Button asChild key={index} size="sm" className="h-auto py-1 px-2 my-1">
                                <Link href={url}>
                                    <span className="mr-2 h-4 w-4">{skill.icon}</span>
                                    {skill.name}
                                </Link>
                            </Button>
                        );
                    }
                }
                // Check if the part is not the skill slug from the capture group
                else if (index % 3 === 0) {
                     if (colorizeSyllables) {
                        return <SyllableText key={index} text={part} />;
                    }
                    return <span key={index}>{part}</span>;
                }
                
                // This part is the skill slug capture group, so we render nothing for it
                return null;
            })}
        </span>
    );
}
