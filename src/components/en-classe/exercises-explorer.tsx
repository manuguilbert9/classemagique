'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { allSkillCategories, categoryAccents, categoryIcons, categoryPoles, type Skill, type SkillPole } from '@/lib/skills';
import { cn } from '@/lib/utils';
import { ExerciseCard } from './exercise-card';

const POLES: { id: SkillPole | 'all'; label: string }[] = [
    { id: 'all', label: 'Tout' },
    { id: 'francais', label: 'Français' },
    { id: 'maths', label: 'Mathématiques' },
    { id: 'autres', label: 'Autres' },
];

interface ExercisesExplorerProps {
    skills: Skill[];
    skillsCompletedToday: Set<string>;
}

/**
 * Le contenu du tiroir "Tous les exercices" : recherche par nom, onglets par pôle
 * (Français / Mathématiques / Autres) et une accordéon par matière.
 */
export function ExercisesExplorer({ skills, skillsCompletedToday }: ExercisesExplorerProps) {
    const [pole, setPole] = useState<SkillPole | 'all'>('all');
    const [search, setSearch] = useState('');
    const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

    const normalizedSearch = search.trim().toLowerCase();

    const groups = useMemo(() => {
        return allSkillCategories
            .map((category) => ({
                category,
                skills: skills.filter(
                    (s) => s.category === category && (!normalizedSearch || s.name.toLowerCase().includes(normalizedSearch))
                ),
            }))
            .filter((group) => group.skills.length > 0 && (pole === 'all' || categoryPoles[group.category] === pole));
    }, [skills, pole, normalizedSearch]);

    const toggleCategory = (category: string) => {
        setOpenCategories((prev) => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    return (
        <div className="rounded-3xl border bg-card p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1 rounded-full border bg-muted/40 p-1">
                    {POLES.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setPole(p.id)}
                            className={cn(
                                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                                pole === p.id ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            )}
                            aria-pressed={pole === p.id}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <div className="flex min-w-[220px] max-w-xs flex-1 items-center gap-2 rounded-full border bg-muted/40 px-4 py-2">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        id="explorer-search"
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Chercher une activité..."
                        aria-label="Chercher une activité"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {groups.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    Aucune activité ne correspond à ta recherche.
                </p>
            ) : (
                <div className="divide-y">
                    {groups.map(({ category, skills: categorySkills }) => {
                        const isOpen = normalizedSearch.length > 0 || openCategories.has(category);
                        const accent = categoryAccents[category];
                        return (
                            <div key={category} className="py-3 first:pt-0">
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(category)}
                                    className="flex w-full items-center gap-3 py-1 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl [&>svg]:h-[18px] [&>svg]:w-[18px]', accent.chipBg, accent.chipText)}>
                                        {categoryIcons[category]}
                                    </span>
                                    <span className="flex-1 font-semibold">{category}</span>
                                    <span className="text-xs font-medium text-muted-foreground">{categorySkills.length}</span>
                                    <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                                </button>
                                {isOpen && (
                                    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                        {categorySkills.map((skill) => (
                                            <ExerciseCard
                                                key={skill.slug}
                                                skill={skill}
                                                done={skillsCompletedToday.has(skill.slug)}
                                                variant="compact"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
