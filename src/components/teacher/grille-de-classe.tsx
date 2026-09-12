'use client';

import { useMemo, useState } from 'react';
import { addWeeks, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { allSkillCategories, getSkillBySlug, skills, type SkillCategory } from '@/lib/skills';
import { competencePertinente, libelleNiveauScolaire } from '@/lib/niveaux-scolaires';
import { dateDuJourLocal, exercicesAdaptesAuxNiveaux } from '@/lib/mise-en-avant';
import {
  OPTIONS_PAR_DEFAUT,
  diagnostiquerEleve,
  genererPourEleves,
  listerSeances,
  type OptionsProgrammation,
} from '@/lib/programmation-devoirs';
import { DICTEES_CE2 } from '@/services/dictees';
import {
  saveHomeworkForStudents,
  type Assignment,
  type Homework,
  type HomeworkResult,
} from '@/services/homework';
import { updateStudent, type Student } from '@/services/students';
import type { Group } from '@/services/groups';
import { GrilleNiveaux } from './grille-niveaux';
import { FriseDevoirs } from './frise-devoirs';
import { AujourdhuiManager } from './aujourdhui-manager';

interface GrilleDeClasseProps {
  students: Student[];
  groups: Group[];
  allHomework: Homework[];
  allHomeworkResults: HomeworkResult[];
  onDataRefresh: () => void;
}

type Onglet = 'aujourdhui' | 'niveaux' | 'devoirs' | 'programmer';

/** Le lundi de la semaine en cours, point de départ naturel de la frise. */
function lundiCourant(): string {
  const aujourdhui = new Date();
  const decalage = (aujourdhui.getDay() + 6) % 7;
  aujourdhui.setDate(aujourdhui.getDate() - decalage);
  return format(aujourdhui, 'yyyy-MM-dd');
}

/**
 * L'écran unique de pilotage de la classe : les niveaux, les devoirs et leur
 * programmation partagent les mêmes données et le même tableau.
 */
export function GrilleDeClasse({
  students,
  groups,
  allHomework,
  allHomeworkResults,
  onDataRefresh,
}: GrilleDeClasseProps) {
  const { toast } = useToast();
  const [onglet, setOnglet] = useState<Onglet>('aujourdhui');
  const [eleveOuvert, setEleveOuvert] = useState<Student | null>(null);
  const [filtre, setFiltre] = useState<'tous' | 'vides' | 'retard'>('tous');
  const [isSaving, setIsSaving] = useState(false);

  /** Fenêtre affichée par la frise : trois semaines, décalables. */
  const [debutFrise, setDebutFrise] = useState(lundiCourant());

  const [options, setOptions] = useState<OptionsProgrammation & { groupIds: string[] }>({
    dateDebut: lundiCourant(),
    ...OPTIONS_PAR_DEFAUT,
    groupIds: groups.map((g) => g.id),
  });

  const [proposition, setProposition] = useState<Map<string, Record<string, Assignment>> | undefined>();

  /** La case en cours de modification depuis la frise. */
  const [caseEditee, setCaseEditee] = useState<
    { eleve: Student; date: string; assignment: Assignment } | null
  >(null);

  const enregistrerLaCase = async () => {
    if (!caseEditee) return;
    setIsSaving(true);
    const res = await saveHomeworkForStudents(caseEditee.date, {
      [caseEditee.eleve.id]: caseEditee.assignment,
    });
    if (res.success) {
      toast({
        title: 'Devoir modifié',
        description: `${caseEditee.eleve.name}, ${format(parseISO(caseEditee.date), 'EEEE d MMMM', { locale: fr })}.`,
      });
      setCaseEditee(null);
      onDataRefresh();
    } else {
      toast({ variant: 'destructive', title: 'Erreur', description: res.error });
    }
    setIsSaving(false);
  };

  const seancesAffichees = useMemo(
    () =>
      listerSeances({
        dateDebut: debutFrise,
        nombreDeSemaines: 3,
        semaineDicteeDepart: options.semaineDicteeDepart,
        jours: options.jours,
      }),
    [debutFrise, options.semaineDicteeDepart, options.jours]
  );

  const elevesConcernes = useMemo(
    () => students.filter((e) => e.groupId && options.groupIds.includes(e.groupId)),
    [students, options.groupIds]
  );

  const nombreDeDevoirs = elevesConcernes.length * options.nombreDeSemaines * options.jours.length;

  /** Les élèves pour qui la programmation ne produirait rien, et pourquoi. */
  const laisses = useMemo(
    () => elevesConcernes.map((e) => diagnostiquerEleve(e, options)).filter((d) => d.sansDevoir),
    [elevesConcernes, options]
  );

  /**
   * Ce qui est mis en avant pour un élève. Les fiches d'avant ce réglage
   * retombent sur leurs anciennes activations, le temps de la transition.
   */
  const misEnAvantDe = (eleve: Student): string[] =>
    eleve.misEnAvant ??
    Object.entries(eleve.enabledSkills || {})
      .filter(([, actif]) => actif)
      .map(([slug]) => slug);

  const enregistrerMiseEnAvant = async (eleve: Student, slugs: string[]) => {
    const misEnAvantUpdatedAt = dateDuJourLocal();
    const res = await updateStudent(eleve.id, {
      misEnAvant: slugs,
      misEnAvantUpdatedAt,
      misEnAvantSource: 'manuel',
    });
    if (res.success) {
      setEleveOuvert({ ...eleve, misEnAvant: slugs, misEnAvantUpdatedAt, misEnAvantSource: 'manuel' });
      onDataRefresh();
    } else {
      toast({ variant: 'destructive', title: 'Erreur', description: res.error });
    }
  };

  const basculerMiseEnAvant = (eleve: Student, slug: string) => {
    const actuels = misEnAvantDe(eleve);
    enregistrerMiseEnAvant(
      eleve,
      actuels.includes(slug) ? actuels.filter((s) => s !== slug) : [...actuels, slug]
    );
  };

  /** Met en avant tous les exercices qui correspondent aux niveaux de l'élève. */
  const mettreEnAvantSonNiveau = (eleve: Student) => {
    const slugs = exercicesAdaptesAuxNiveaux(eleve.niveauxParDomaine);
    if (slugs.length === 0) {
      toast({
        title: 'Aucun niveau renseigné',
        description: `Situe d'abord ${eleve.name} dans l'onglet Niveaux.`,
      });
      return;
    }
    enregistrerMiseEnAvant(eleve, slugs);
  };

  const voirLaProposition = () => {
    setProposition(genererPourEleves(elevesConcernes, options));
    setDebutFrise(options.dateDebut);
    setOnglet('devoirs');
  };

  const ecrireLesDevoirs = async () => {
    if (!proposition) return;
    setIsSaving(true);
    let succes = 0;
    let echecs = 0;
    for (const [date, assignments] of proposition) {
      const res = await saveHomeworkForStudents(date, assignments);
      if (res.success) succes++;
      else echecs++;
    }
    if (echecs === 0) {
      toast({
        title: 'Devoirs écrits',
        description: `${succes} journées programmées pour ${elevesConcernes.length} élève(s).`,
      });
      setProposition(undefined);
      onDataRefresh();
    } else {
      toast({ variant: 'destructive', title: 'Erreur partielle', description: `${echecs} journées en échec.` });
    }
    setIsSaving(false);
  };

  const onglets: { cle: Onglet; libelle: string; compteur?: string }[] = [
    { cle: 'aujourdhui', libelle: "Aujourd'hui" },
    {
      cle: 'niveaux',
      libelle: 'Niveaux',
      compteur: `${students.length * allSkillCategories.length} cases`,
    },
    { cle: 'devoirs', libelle: 'Devoirs', compteur: `${seancesAffichees.length} séances` },
    { cle: 'programmer', libelle: 'Programmer' },
  ];

  return (
    <div className="space-y-5">
      {/* Onglets */}
      <div className="flex flex-wrap items-end gap-0.5 border-b" role="tablist">
        {onglets.map((o) => (
          <button
            key={o.cle}
            role="tab"
            type="button"
            aria-selected={onglet === o.cle}
            onClick={() => setOnglet(o.cle)}
            className={cn(
              '-mb-px flex items-baseline gap-2 border-b-2 px-4 py-2.5 font-semibold transition-colors',
              onglet === o.cle
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {o.libelle}
            {o.compteur && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-mono text-[11px] font-normal',
                  onglet === o.cle ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                {o.compteur}
              </span>
            )}
          </button>
        ))}
      </div>

      {onglet === 'aujourdhui' && (
        <AujourdhuiManager students={students} groups={groups} onDataRefresh={onDataRefresh} />
      )}

      {onglet === 'niveaux' && (
        <GrilleNiveaux
          students={students}
          groups={groups}
          onEleveClick={setEleveOuvert}
          onSaved={onDataRefresh}
        />
      )}

      {onglet === 'devoirs' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Afficher
              </span>
              {(['tous', 'vides', 'retard'] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filtre === f ? 'default' : 'outline'}
                  onClick={() => setFiltre(f)}
                >
                  {f === 'tous' ? 'Tous' : f === 'vides' ? 'Cases vides' : 'Non faits'}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Semaine du {format(parseISO(debutFrise), 'd MMMM', { locale: fr })}
              </span>
              <Button
                size="icon"
                variant="outline"
                aria-label="Semaines précédentes"
                onClick={() => setDebutFrise(format(addWeeks(parseISO(debutFrise), -3), 'yyyy-MM-dd'))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Semaines suivantes"
                onClick={() => setDebutFrise(format(addWeeks(parseISO(debutFrise), 3), 'yyyy-MM-dd'))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {proposition && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-purple-400 bg-purple-50 p-3 text-sm dark:bg-purple-950/40">
              <span>
                Proposition affichée en pointillé — <strong>{nombreDeDevoirs} devoirs</strong> pour{' '}
                {elevesConcernes.length} élève(s). Rien n&apos;est encore enregistré.
              </span>
              <span className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setProposition(undefined)}>
                  Abandonner
                </Button>
                <Button size="sm" onClick={ecrireLesDevoirs} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Écrire ces devoirs
                </Button>
              </span>
            </div>
          )}

          <FriseDevoirs
            students={students}
            groups={groups}
            seances={seancesAffichees}
            allHomework={allHomework}
            allHomeworkResults={allHomeworkResults}
            proposition={proposition}
            filtre={filtre}
            onEleveClick={setEleveOuvert}
            onCaseClick={(eleve, date, assignment) => setCaseEditee({ eleve, date, assignment })}
          />

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <i className="block h-2.5 w-2.5 rounded-sm bg-emerald-600" /> Fait
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="block h-2.5 w-2.5 rounded-sm bg-red-600" /> Non fait, date passée
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="block h-2.5 w-2.5 rounded-sm bg-muted-foreground/50" /> Programmé
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="block h-2.5 w-2.5 rounded-sm bg-purple-500" /> Proposé, pas encore écrit
            </span>
          </div>
        </div>
      )}

      {onglet === 'programmer' && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ce que reçoit chaque élève</CardTitle>
              <CardDescription>
                Les règles s&apos;appliquent à tout le monde ; leur contenu est choisi élève par élève,
                d&apos;après ses niveaux de l&apos;onglet Niveaux. Un élève pour qui la dictée n&apos;a pas de
                sens reçoit à sa place l&apos;exercice d&apos;écriture le plus proche de son niveau.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted p-3 text-sm">
                <span className="font-semibold">Français</span>
                <span className="text-muted-foreground">
                  les mots de la semaine de la méthode, ou l&apos;écrit adapté au niveau
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted p-3 text-sm">
                <span className="font-semibold">Mathématiques</span>
                <span className="text-muted-foreground">
                  un exercice de sa plage de niveau, en rotation d&apos;une séance à l&apos;autre
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sur quelle période</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Première semaine
                  </Label>
                  <Input
                    type="date"
                    value={options.dateDebut}
                    onChange={(e) => setOptions({ ...options, dateDebut: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Nombre de semaines
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={36}
                    value={options.nombreDeSemaines}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        nombreDeSemaines: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Jours de devoirs
                  </Label>
                  <Select
                    value={options.jours.join('-')}
                    onValueChange={(v) => setOptions({ ...options, jours: v.split('-').map(Number) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-4">Lundi et jeudi</SelectItem>
                      <SelectItem value="1">Lundi seulement</SelectItem>
                      <SelectItem value="1-3-4">Lundi, mercredi, jeudi</SelectItem>
                      <SelectItem value="1-2-4-5">Lundi, mardi, jeudi, vendredi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Dictée : semaine de départ
                  </Label>
                  <Select
                    value={String(options.semaineDicteeDepart)}
                    onValueChange={(v) => setOptions({ ...options, semaineDicteeDepart: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DICTEES_CE2.map((s) => (
                        <SelectItem key={s.semaine} value={String(s.semaine)}>
                          S{s.semaine} — {s.corpusTheme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Élèves</Label>
                <div className="flex flex-wrap gap-2">
                  {groups.map((groupe) => {
                    const choisi = options.groupIds.includes(groupe.id);
                    const combien = students.filter((e) => e.groupId === groupe.id).length;
                    return (
                      <Button
                        key={groupe.id}
                        size="sm"
                        variant={choisi ? 'default' : 'outline'}
                        onClick={() =>
                          setOptions({
                            ...options,
                            groupIds: choisi
                              ? options.groupIds.filter((id) => id !== groupe.id)
                              : [...options.groupIds, groupe.id],
                          })
                        }
                      >
                        {groupe.name} ({combien})
                      </Button>
                    );
                  })}
                </div>
              </div>

              {laisses.length > 0 && (
                <div className="space-y-2 rounded-xl border border-amber-400 bg-amber-50 p-4 text-sm dark:bg-amber-950/40">
                  <p className="font-semibold">
                    {laisses.length} élève(s) ne recevraient aucun devoir
                  </p>
                  <ul className="space-y-1">
                    {laisses.map((d) => (
                      <li key={d.eleveId}>
                        <span className="font-medium">{d.nom}</span>{' '}
                        {!d.niveauxRenseignes ? (
                          <span className="text-muted-foreground">
                            — aucun niveau renseigné. Va le situer dans l&apos;onglet Niveaux.
                          </span>
                        ) : d.domainesSansExercice.length > 0 ? (
                          <span className="text-muted-foreground">
                            — aucun exercice de la plateforme ne couvre son niveau en{' '}
                            {d.domainesSansExercice.join(', ')}.
                          </span>
                        ) : (
                          <span className="text-muted-foreground">— rien à lui proposer ces jours-là.</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={voirLaProposition} disabled={elevesConcernes.length === 0}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Voir la proposition
                </Button>
                <span className="text-sm text-muted-foreground">
                  {nombreDeDevoirs} devoirs pour {elevesConcernes.length} élève(s) — la proposition
                  s&apos;affiche dans la frise avant d&apos;être écrite.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modification d'une case de la frise, sans quitter le tableau */}
      <Dialog open={!!caseEditee} onOpenChange={(ouvert) => !ouvert && setCaseEditee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {caseEditee?.eleve.name} —{' '}
              {caseEditee && format(parseISO(caseEditee.date), 'EEEE d MMMM', { locale: fr })}
            </DialogTitle>
          </DialogHeader>

          {caseEditee && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Français
                </Label>
                <Select
                  value={
                    caseEditee.assignment.orthographe
                      ? `dictee:${caseEditee.assignment.orthographe}`
                      : caseEditee.assignment.francais
                        ? `exo:${caseEditee.assignment.francais}`
                        : 'aucun'
                  }
                  onValueChange={(v) =>
                    setCaseEditee({
                      ...caseEditee,
                      assignment: {
                        ...caseEditee.assignment,
                        orthographe: v.startsWith('dictee:') ? v.slice(7) : null,
                        francais: v.startsWith('exo:') ? v.slice(4) : null,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aucun">Aucun</SelectItem>
                    {seancesAffichees
                      .filter((s) => s.date === caseEditee.date)
                      .map((s) => (
                        <SelectItem key={s.date} value={`dictee:S${s.semaineDictee}-J${s.jourDeMethode}`}>
                          Dictée S{s.semaineDictee} · {s.jourDeMethode === 1 ? 'jour 1' : 'bilan'}
                        </SelectItem>
                      ))}
                    {skills
                      .filter((s) =>
                        ['Orthographe', 'Ecriture', 'Lecture / compréhension', 'Phonologie'].includes(
                          s.category
                        )
                      )
                      .map((s) => (
                        <SelectItem key={s.slug} value={`exo:${s.slug}`}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Mathématiques
                </Label>
                <Select
                  value={caseEditee.assignment.maths ?? 'aucun'}
                  onValueChange={(v) =>
                    setCaseEditee({
                      ...caseEditee,
                      assignment: { ...caseEditee.assignment, maths: v === 'aucun' ? null : v },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aucun">Aucun</SelectItem>
                    {skills
                      .filter((s) =>
                        [
                          'Nombres et calcul',
                          'Problèmes',
                          'Grandeurs et mesures',
                          'Espace et géométrie',
                        ].includes(s.category)
                      )
                      .map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-muted-foreground">
                Ce devoir ne concerne que {caseEditee.eleve.name} : il prend le pas sur celui de son groupe.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCaseEditee(null)}>
              Annuler
            </Button>
            <Button onClick={enregistrerLaCase} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Panneau élève */}
      <Sheet open={!!eleveOuvert} onOpenChange={(ouvert) => !ouvert && setEleveOuvert(null)}>
        <SheetContent className="w-[380px] overflow-y-auto sm:max-w-[380px]">
          <SheetHeader>
            <SheetTitle className="font-headline text-2xl">{eleveOuvert?.name}</SheetTitle>
          </SheetHeader>
          {eleveOuvert && (
            <div className="mt-4 space-y-5">
              <p className="text-sm text-muted-foreground">
                {groups.find((g) => g.id === eleveOuvert.groupId)?.name ?? '—'} ·{' '}
                {
                  Object.entries(eleveOuvert.enabledSkills || {}).filter(([, actif]) => actif).length
                }{' '}
                exercice(s) actif(s)
              </p>

              <div>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Niveaux par domaine
                </h4>
                <div className="divide-y">
                  {allSkillCategories.map((domaine) => {
                    const niveau = eleveOuvert.niveauxParDomaine?.[domaine as SkillCategory];
                    return (
                      <div key={domaine} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                        <span>{domaine}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {niveau ? libelleNiveauScolaire(niveau) : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Mis en avant sur sa page
                  </h4>
                  <Button size="sm" variant="ghost" onClick={() => mettreEnAvantSonNiveau(eleveOuvert)}>
                    Ceux de son niveau
                  </Button>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Ces exercices s&apos;affichent d&apos;emblée. Tous les autres restent accessibles dans
                  son tiroir, et n&apos;importe lequel peut lui être donné en devoirs si son niveau
                  le permet.
                </p>
                <div className="space-y-3">
                  {allSkillCategories.map((domaine) => {
                    const duDomaine = skills.filter((s) => s.category === domaine);
                    if (duDomaine.length === 0) return null;
                    const niveau = eleveOuvert.niveauxParDomaine?.[domaine as SkillCategory];
                    return (
                      <div key={domaine}>
                        <p className="mb-1 text-xs font-semibold">{domaine}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {duDomaine.map((s) => {
                            const enAvant = misEnAvantDe(eleveOuvert).includes(s.slug);
                            const dansSaPlage = niveau ? competencePertinente(s, niveau) : true;
                            return (
                              <button
                                key={s.slug}
                                type="button"
                                onClick={() => basculerMiseEnAvant(eleveOuvert, s.slug)}
                                className={cn(
                                  'rounded-md border px-2 py-1 text-xs transition-colors',
                                  enAvant
                                    ? 'border-primary bg-primary/10 font-semibold text-primary'
                                    : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/70',
                                  !dansSaPlage && !enAvant && 'opacity-50'
                                )}
                                title={
                                  dansSaPlage
                                    ? 'Dans sa plage de niveau'
                                    : 'Hors de sa plage de niveau — jamais donné en devoirs'
                                }
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
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
