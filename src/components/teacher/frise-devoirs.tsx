'use client';

import { useMemo } from 'react';
import { format, parseISO, startOfToday, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getSkillBySlug } from '@/lib/skills';
import type { Assignment, Homework, HomeworkResult } from '@/services/homework';
import { getSemaine, parseSessionId } from '@/services/dictees';
import type { Seance } from '@/lib/programmation-devoirs';
import type { Student } from '@/services/students';
import type { Group } from '@/services/groups';

export type EtatDevoir = 'fait' | 'retard' | 'programme' | 'propose' | 'vide';

interface FriseDevoirsProps {
  students: Student[];
  groups: Group[];
  seances: Seance[];
  allHomework: Homework[];
  allHomeworkResults: HomeworkResult[];
  /** Devoirs proposés par la programmation, pas encore écrits : date → élève → devoir. */
  proposition?: Map<string, Record<string, Assignment>>;
  filtre: 'tous' | 'vides' | 'retard';
  onEleveClick: (eleve: Student) => void;
  onCaseClick: (eleve: Student, date: string, assignment: Assignment) => void;
}

/** Le libellé court d'un devoir de français : la séance de dictée ou le nom de l'exercice. */
function libelleFrancais(assignment: Assignment): string | null {
  if (assignment.orthographe) {
    const seance = parseSessionId(assignment.orthographe);
    if (!seance) return assignment.orthographe;
    const semaine = getSemaine(seance.semaine);
    return `Dictée S${seance.semaine} · J${seance.jour}${semaine ? '' : ' (?)'}`;
  }
  if (assignment.francais) return getSkillBySlug(assignment.francais)?.name ?? assignment.francais;
  return null;
}

function libelleMaths(assignment: Assignment): string | null {
  if (!assignment.maths) return null;
  return getSkillBySlug(assignment.maths)?.name ?? assignment.maths;
}

/**
 * La frise des séances : une ligne par élève, une colonne par séance.
 *
 * La couleur porte l'état — fait, programmé, non fait après la date — de sorte
 * que le tableau serve autant à préparer qu'à suivre.
 */
export function FriseDevoirs({
  students,
  groups,
  seances,
  allHomework,
  allHomeworkResults,
  proposition,
  filtre,
  onEleveClick,
  onCaseClick,
}: FriseDevoirsProps) {
  const aujourdhui = startOfToday();
  const nomDuGroupe = (id?: string) => groups.find((g) => g.id === id)?.name ?? '—';

  const eleves = useMemo(
    () =>
      [...students].sort(
        (a, b) => nomDuGroupe(a.groupId).localeCompare(nomDuGroupe(b.groupId)) || a.name.localeCompare(b.name)
      ),
    [students, groups]
  );

  /** Le devoir d'un élève à une date : le sien s'il existe, sinon celui de son groupe. */
  const devoirDe = (eleve: Student, date: string): { assignment: Assignment; propose: boolean } => {
    const propose = proposition?.get(date)?.[eleve.id];
    if (propose) return { assignment: propose, propose: true };
    const jour = allHomework.find((h) => h.id === date);
    const propre = jour?.assignmentsByStudent?.[eleve.id];
    const duGroupe = eleve.groupId ? jour?.assignments?.[eleve.groupId] : undefined;
    return {
      assignment: { ...(duGroupe || { francais: null, maths: null }), ...(propre || {}) },
      propose: false,
    };
  };

  const estFait = (eleve: Student, date: string, slug: string | null, prefixe = '') => {
    if (!slug) return false;
    const attendu = prefixe ? `${prefixe}${slug}` : slug;
    return allHomeworkResults.some(
      (r) => r.userId === eleve.id && r.date === date && (r.skillSlug === attendu || r.skillSlug === slug)
    );
  };

  const etat = (
    eleve: Student,
    seance: Seance,
    assignment: Assignment,
    propose: boolean,
    discipline: 'francais' | 'maths'
  ): EtatDevoir => {
    const slug =
      discipline === 'maths'
        ? assignment.maths
        : assignment.orthographe
          ? assignment.orthographe
          : assignment.francais;
    if (!slug) return 'vide';
    if (propose) return 'propose';
    const fait =
      discipline === 'francais' && assignment.orthographe
        ? estFait(eleve, seance.date, assignment.orthographe, 'orthographe-')
        : estFait(eleve, seance.date, slug);
    if (fait) return 'fait';
    return isBefore(parseISO(seance.date), aujourdhui) ? 'retard' : 'programme';
  };

  const stylesEtat: Record<EtatDevoir, string> = {
    fait: 'bg-emerald-50 text-emerald-700 border-transparent font-semibold dark:bg-emerald-950 dark:text-emerald-300',
    retard: 'bg-red-50 text-red-700 border-transparent font-semibold dark:bg-red-950 dark:text-red-300',
    programme: 'bg-muted text-muted-foreground border-border',
    propose: 'border-dashed border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    vide: 'border-dashed text-muted-foreground/70 justify-center',
  };

  const pointsEtat: Record<EtatDevoir, string> = {
    fait: 'bg-emerald-600',
    retard: 'bg-red-600',
    programme: 'bg-muted-foreground/50',
    propose: 'bg-purple-500',
    vide: 'bg-transparent',
  };

  const lignesVisibles = eleves.filter((eleve) => {
    if (filtre === 'tous') return true;
    return seances.some((seance) => {
      const { assignment, propose } = devoirDe(eleve, seance.date);
      const etats = [
        etat(eleve, seance, assignment, propose, 'francais'),
        etat(eleve, seance, assignment, propose, 'maths'),
      ];
      return filtre === 'vides' ? etats.includes('vide') : etats.includes('retard');
    });
  });

  return (
    <div className="max-h-[70vh] overflow-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 top-0 z-30 min-w-[180px] border-b border-r bg-muted p-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Élève
            </th>
            {seances.map((seance) => (
              <th
                key={seance.date}
                className="sticky top-0 z-20 min-w-[150px] border-b bg-muted p-2 text-left"
              >
                <span className="block text-[13px] font-semibold capitalize text-foreground">
                  {format(parseISO(seance.date), 'EEEE d MMM', { locale: fr })}
                </span>
                <span className="block font-mono text-[10px] font-normal text-muted-foreground">
                  S{seance.semaineDictee} · {seance.jourDeMethode === 1 ? 'jour 1' : 'bilan'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignesVisibles.map((eleve) => (
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

              {seances.map((seance) => {
                const { assignment, propose } = devoirDe(eleve, seance.date);
                const etatFr = etat(eleve, seance, assignment, propose, 'francais');
                const etatMa = etat(eleve, seance, assignment, propose, 'maths');
                const nomFr = libelleFrancais(assignment);
                const nomMa = libelleMaths(assignment);

                return (
                  <td key={seance.date} className="border-b p-1 align-top">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => onCaseClick(eleve, seance.date, assignment)}
                        title={nomFr ? `${nomFr} — ${etatFr}` : 'Aucun devoir de français'}
                        className={cn(
                          'flex w-full items-center gap-1.5 truncate rounded-sm border px-1.5 py-1 text-left text-xs hover:brightness-95',
                          stylesEtat[etatFr]
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 flex-none rounded-full', pointsEtat[etatFr])} />
                        <span className="truncate">{nomFr ?? 'ajouter'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCaseClick(eleve, seance.date, assignment)}
                        title={nomMa ? `${nomMa} — ${etatMa}` : 'Aucun devoir de mathématiques'}
                        className={cn(
                          'flex w-full items-center gap-1.5 truncate rounded-sm border px-1.5 py-1 text-left text-xs hover:brightness-95',
                          stylesEtat[etatMa]
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 flex-none rounded-full', pointsEtat[etatMa])} />
                        <span className="truncate">{nomMa ?? 'ajouter'}</span>
                      </button>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
          {lignesVisibles.length === 0 && (
            <tr>
              <td colSpan={seances.length + 1} className="p-8 text-center text-muted-foreground">
                Aucun élève ne correspond à ce filtre.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
