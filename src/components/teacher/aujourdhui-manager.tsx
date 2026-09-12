'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, CheckCircle2, Clock, Wand2 } from 'lucide-react';
import { allSkillCategories, skills } from '@/lib/skills';
import { applyMiseEnAvantToStudents, type Student } from '@/services/students';
import type { Group } from '@/services/groups';
import { dateDuJourLocal, exercicesAdaptesAuxNiveaux } from '@/lib/mise-en-avant';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AujourdhuiManagerProps {
    students: Student[];
    groups: Group[];
    onDataRefresh: () => void;
}

const exercicesSelectionnables = skills.filter((s) => !s.isTool);

/**
 * La manière rapide de choisir "Aujourd'hui" : par groupe (un ou plusieurs à la
 * fois) plutôt qu'élève par élève. Ce qui n'a pas été touché aujourd'hui avant
 * 17h est ensuite renouvelé tout seul par l'appli, avec des exercices adaptés
 * au niveau déclaré de chaque élève.
 */
export function AujourdhuiManager({ students, groups, onDataRefresh }: AujourdhuiManagerProps) {
    const { toast } = useToast();
    const [groupIds, setGroupIds] = useState<string[]>([]);
    const [slugs, setSlugs] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const elevesConcernes = useMemo(
        () => students.filter((e) => e.groupId && groupIds.includes(e.groupId)),
        [students, groupIds]
    );

    const toggleGroupe = (groupId: string) => {
        setGroupIds((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]));
    };

    const toggleSkill = (slug: string) => {
        setSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    };

    /** Union des exercices adaptés au niveau de chacun des élèves des groupes choisis. */
    const remplirAvecLeurNiveau = () => {
        const set = new Set<string>();
        elevesConcernes.forEach((e) => exercicesAdaptesAuxNiveaux(e.niveauxParDomaine).forEach((s) => set.add(s)));
        if (set.size === 0) {
            toast({ title: 'Aucun niveau renseigné', description: "Situe d'abord ces élèves dans l'onglet Niveaux." });
            return;
        }
        setSlugs([...set]);
    };

    const appliquer = async () => {
        if (elevesConcernes.length === 0 || slugs.length === 0) return;
        setIsSaving(true);
        const res = await applyMiseEnAvantToStudents(
            elevesConcernes.map((e) => e.id),
            slugs,
            dateDuJourLocal(),
            'groupe'
        );
        setIsSaving(false);
        if (res.success) {
            toast({
                title: "Aujourd'hui mis à jour",
                description: `${elevesConcernes.length} élève(s) dans ${groupIds.length} groupe(s).`,
            });
            setGroupIds([]);
            setSlugs([]);
            onDataRefresh();
        } else {
            toast({ variant: 'destructive', title: 'Erreur', description: res.error });
        }
    };

    const aujourdhui = dateDuJourLocal();
    const statutDe = (e: Student): 'a-jour' | 'auto' | 'perime' => {
        if (e.misEnAvantUpdatedAt !== aujourdhui) return 'perime';
        return e.misEnAvantSource === 'auto' ? 'auto' : 'a-jour';
    };

    return (
        <div className="space-y-5">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Choisir "Aujourd'hui" pour un ou plusieurs groupes</CardTitle>
                    <CardDescription>
                        Sélectionne un ou plusieurs groupes, puis les exercices à mettre en avant : ils remplacent
                        aussitôt la sélection actuelle de chaque élève concerné. Si tu ne mets rien à jour avant
                        17h, l&apos;appli prend le relais toute seule avec des exercices adaptés au niveau de
                        chacun.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Groupes</Label>
                        <div className="flex flex-wrap gap-2">
                            {groups.map((groupe) => {
                                const choisi = groupIds.includes(groupe.id);
                                const combien = students.filter((e) => e.groupId === groupe.id).length;
                                return (
                                    <Button
                                        key={groupe.id}
                                        size="sm"
                                        variant={choisi ? 'default' : 'outline'}
                                        onClick={() => toggleGroupe(groupe.id)}
                                    >
                                        {groupe.name} ({combien})
                                    </Button>
                                );
                            })}
                            {groups.length === 0 && (
                                <p className="text-sm text-muted-foreground">Crée d&apos;abord un groupe dans l&apos;onglet Élèves.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                Exercices mis en avant
                            </Label>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={remplirAvecLeurNiveau}
                                disabled={elevesConcernes.length === 0}
                            >
                                <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Remplir avec leur niveau
                            </Button>
                        </div>
                        <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border p-3">
                            {allSkillCategories.map((categorie) => {
                                const duDomaine = exercicesSelectionnables.filter((s) => s.category === categorie);
                                if (duDomaine.length === 0) return null;
                                return (
                                    <div key={categorie}>
                                        <p className="mb-1 text-xs font-semibold">{categorie}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {duDomaine.map((s) => {
                                                const actif = slugs.includes(s.slug);
                                                return (
                                                    <button
                                                        key={s.slug}
                                                        type="button"
                                                        onClick={() => toggleSkill(s.slug)}
                                                        className={cn(
                                                            'rounded-md border px-2 py-1 text-xs transition-colors',
                                                            actif
                                                                ? 'border-primary bg-primary/10 font-semibold text-primary'
                                                                : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/70'
                                                        )}
                                                    >
                                                        {s.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={appliquer} disabled={isSaving || elevesConcernes.length === 0 || slugs.length === 0}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Appliquer à {elevesConcernes.length} élève(s)
                        </Button>
                        {slugs.length > 0 && (
                            <span className="text-sm text-muted-foreground">{slugs.length} exercice(s) sélectionné(s)</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">État d&apos;aujourd&apos;hui</CardTitle>
                    <CardDescription>Qui a déjà une sélection pour aujourd&apos;hui, et d&apos;où elle vient.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {students.map((e) => {
                            const statut = statutDe(e);
                            return (
                                <div key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                                    <span>{e.name}</span>
                                    {statut === 'a-jour' && (
                                        <span className="flex items-center gap-1.5 text-emerald-600">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> À jour
                                        </span>
                                    )}
                                    {statut === 'auto' && (
                                        <span className="flex items-center gap-1.5 text-amber-600">
                                            <Sparkles className="h-3.5 w-3.5" /> Généré automatiquement
                                        </span>
                                    )}
                                    {statut === 'perime' && (
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" /> Pas encore aujourd&apos;hui
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                        {students.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">Aucun élève.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
