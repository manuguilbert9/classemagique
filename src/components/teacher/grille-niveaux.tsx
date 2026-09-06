'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { allSkillCategories, type SkillCategory, type SkillLevel } from '@/lib/skills';
import {
  ECHELLE_SCOLAIRE,
  difficultesDuDomaine,
  libelleNiveauScolaire,
  type NiveauScolaire,
} from '@/lib/niveaux-scolaires';
import { updateStudent, type Student } from '@/services/students';
import type { Group } from '@/services/groups';

const ANNEES = ['GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'] as const;
const MOMENTS = ['debut', 'milieu', 'fin'] as const;
const LIBELLE_MOMENT: Record<(typeof MOMENTS)[number], string> = {
  debut: 'Début',
  milieu: 'Milieu',
  fin: 'Fin',
};

/** Une teinte par année, du plus clair au plus profond. */
const TEINTE: Record<(typeof ANNEES)[number], string> = {
  GS: '#a9c6a3',
  CP: '#8dbcae',
  CE1: '#6ea5b4',
  CE2: '#4f89ac',
  CM1: '#3a6c96',
  CM2: '#2c4a7c',
};

function decomposer(niveau: NiveauScolaire) {
  const [annee, moment] = niveau.split('-') as [(typeof ANNEES)[number], (typeof MOMENTS)[number]];
  return { annee, moment };
}

interface GrilleNiveauxProps {
  students: Student[];
  groups: Group[];
  onEleveClick: (eleve: Student) => void;
  onSaved: () => void;
}

/**
 * La matrice élèves × domaines.
 *
 * Le pinceau est le cœur de l'écran : on charge un niveau une fois, puis on
 * clique les cases à remplir — une ligne pour un élève, une colonne pour mettre
 * tout un groupe au même niveau dans un domaine.
 */
export function GrilleNiveaux({ students, groups, onEleveClick, onSaved }: GrilleNiveauxProps) {
  const { toast } = useToast();
  const [pinceau, setPinceau] = useState<NiveauScolaire | null>(null);
  const [brouillon, setBrouillon] = useState<Record<string, Partial<Record<SkillCategory, NiveauScolaire>>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const nomDuGroupe = (id?: string) => groups.find((g) => g.id === id)?.name ?? '—';

  const eleves = useMemo(
    () =>
      [...students].sort(
        (a, b) => nomDuGroupe(a.groupId).localeCompare(nomDuGroupe(b.groupId)) || a.name.localeCompare(b.name)
      ),
    [students, groups]
  );

  const niveauDe = (eleve: Student, domaine: SkillCategory): NiveauScolaire | undefined =>
    brouillon[eleve.id]?.[domaine] ?? eleve.niveauxParDomaine?.[domaine];

  const modifications = Object.entries(brouillon).filter(([, v]) => Object.keys(v).length > 0);

  const renseignes = eleves.reduce(
    (total, e) => total + allSkillCategories.filter((d) => niveauDe(e, d)).length,
    0
  );

  const poser = (eleve: Student, domaine: SkillCategory, niveau: NiveauScolaire) => {
    setBrouillon((prev) => ({
      ...prev,
      [eleve.id]: { ...(prev[eleve.id] || {}), [domaine]: niveau },
    }));
  };

  /** Sans pinceau, un clic fait avancer la case d'un cran sur l'échelle. */
  const avancer = (eleve: Student, domaine: SkillCategory) => {
    const actuel = niveauDe(eleve, domaine);
    const index = actuel ? ECHELLE_SCOLAIRE.indexOf(actuel) : -1;
    poser(eleve, domaine, ECHELLE_SCOLAIRE[(index + 1) % ECHELLE_SCOLAIRE.length]);
  };

  const enregistrer = async () => {
    setIsSaving(true);
    let succes = 0;
    let echecs = 0;

    for (const [eleveId, niveauxModifies] of modifications) {
      const eleve = students.find((e) => e.id === eleveId);
      if (!eleve) continue;

      const niveauxParDomaine = { ...(eleve.niveauxParDomaine || {}), ...niveauxModifies };
      // Le niveau de domaine pilote la difficulté de tous ses exercices.
      const levels: Record<string, SkillLevel> = { ...(eleve.levels || {}) };
      for (const [domaine, niveau] of Object.entries(niveauxModifies)) {
        Object.assign(levels, difficultesDuDomaine(domaine as SkillCategory, niveau as NiveauScolaire));
      }

      const res = await updateStudent(eleveId, { niveauxParDomaine, levels });
      if (res.success) succes++;
      else echecs++;
    }

    if (echecs === 0) {
      toast({
        title: 'Niveaux enregistrés',
        description: `${succes} élève(s) mis à jour, avec la difficulté de leurs exercices.`,
      });
      setBrouillon({});
      onSaved();
    } else {
      toast({ variant: 'destructive', title: 'Erreur', description: `${echecs} élève(s) en échec.` });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Barre d'outils : le pinceau et l'enregistrement */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pinceau
          </span>
          <div className="flex flex-wrap gap-1">
            {ANNEES.map((annee) => (
              <div key={annee} className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5">
                  {MOMENTS.map((moment) => {
                    const valeur = `${annee}-${moment}` as NiveauScolaire;
                    const actif = pinceau === valeur;
                    return (
                      <button
                        key={moment}
                        type="button"
                        title={`${LIBELLE_MOMENT[moment]} ${annee}`}
                        aria-label={`${LIBELLE_MOMENT[moment]} ${annee}`}
                        aria-pressed={actif}
                        onClick={() => setPinceau(actif ? null : valeur)}
                        className={cn(
                          'relative h-7 w-6 rounded-sm transition-all',
                          actif && 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                        )}
                        style={{ background: TEINTE[annee] }}
                      >
                        <span
                          className="absolute bottom-1 left-1 h-[3px] rounded-full bg-white/90"
                          style={{ width: moment === 'debut' ? 4 : moment === 'milieu' ? 9 : 14 }}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{annee}</span>
              </div>
            ))}
          </div>
          {pinceau && (
            <Button variant="ghost" size="sm" onClick={() => setPinceau(null)}>
              Reposer le pinceau
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {renseignes} / {eleves.length * allSkillCategories.length} renseignés
          </span>
          <Button onClick={enregistrer} disabled={isSaving || modifications.length === 0}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer
            {modifications.length > 0 && ` (${modifications.length})`}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {pinceau ? (
          <>
            Pinceau chargé : <strong>{libelleNiveauScolaire(pinceau)}</strong>. Clique les cases à remplir ;
            clique de nouveau la teinte pour le reposer.
          </>
        ) : (
          <>
            Choisis un niveau dans le pinceau, puis clique les cases à remplir — une ligne entière, une
            colonne, un groupe. Sans pinceau, un clic fait avancer la case d&apos;un cran.
          </>
        )}
      </p>

      <div className="max-h-[70vh] overflow-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-30 min-w-[180px] border-b border-r bg-muted p-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Élève
              </th>
              {allSkillCategories.map((domaine) => (
                <th
                  key={domaine}
                  className="sticky top-0 z-20 h-28 w-12 border-b bg-muted p-0 align-bottom"
                >
                  <span
                    className="mx-auto block max-h-24 overflow-hidden whitespace-nowrap pb-2 text-xs font-semibold text-muted-foreground"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {domaine}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eleves.map((eleve) => (
              <tr key={eleve.id} className="group">
                <td
                  className="sticky left-0 z-10 cursor-pointer border-b border-r bg-card p-2 group-hover:bg-muted"
                  onClick={() => onEleveClick(eleve)}
                >
                  <span className="flex items-center gap-2">
                    <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-primary/10 font-mono text-[11px] font-bold text-primary">
                      {eleve.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="leading-tight">
                      <span className="block font-semibold">{eleve.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {nomDuGroupe(eleve.groupId)}
                      </span>
                    </span>
                  </span>
                </td>

                {allSkillCategories.map((domaine) => {
                  const niveau = niveauDe(eleve, domaine);
                  const modifie = brouillon[eleve.id]?.[domaine] !== undefined;
                  return (
                    <td key={domaine} className="border-b p-1">
                      <button
                        type="button"
                        onClick={() =>
                          pinceau ? poser(eleve, domaine, pinceau) : avancer(eleve, domaine)
                        }
                        title={
                          niveau
                            ? `${libelleNiveauScolaire(niveau)} — ${domaine}`
                            : `Non renseigné — ${domaine}`
                        }
                        className={cn(
                          'flex h-9 w-full flex-col items-center justify-center gap-1 rounded-sm text-white transition-transform hover:scale-105',
                          !niveau && 'border border-dashed bg-muted/40 text-muted-foreground',
                          modifie && 'ring-2 ring-foreground/50'
                        )}
                        style={niveau ? { background: TEINTE[decomposer(niveau).annee] } : undefined}
                      >
                        {niveau ? (
                          <>
                            <span className="font-mono text-[11px] leading-none">
                              {decomposer(niveau).annee}
                            </span>
                            <span className="flex gap-[2px]">
                              {MOMENTS.map((m) => (
                                <i
                                  key={m}
                                  className={cn(
                                    'block h-[3px] w-[7px] rounded-full',
                                    m === decomposer(niveau).moment ? 'bg-white' : 'bg-white/40'
                                  )}
                                />
                              ))}
                            </span>
                          </>
                        ) : (
                          <span className="font-mono text-[11px]">—</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {ANNEES.map((a) => (
          <span key={a} className="inline-flex items-center gap-1.5">
            <i className="block h-2.5 w-2.5 rounded-sm" style={{ background: TEINTE[a] }} />
            {a}
          </span>
        ))}
        <span>Les trois traits sous l&apos;année indiquent début, milieu ou fin.</span>
      </div>
    </div>
  );
}
