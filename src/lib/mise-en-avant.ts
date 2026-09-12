/**
 * Résolution du "Aujourd'hui" d'un élève : ce qui est mis en avant sur sa page
 * En classe. Un professeur peut le régler à la main (élève par élève ou groupe
 * par groupe) ; s'il ne l'a pas fait aujourd'hui et qu'il est 17h passées, le
 * système le renouvelle tout seul avec les exercices adaptés au niveau déclaré
 * de l'élève dans chaque domaine.
 */

import { skills, type SkillCategory } from './skills';
import { competencePertinente, type NiveauScolaire } from './niveaux-scolaires';

/** La date du jour au format yyyy-MM-dd, dans le fuseau horaire local de l'appareil. */
export function dateDuJourLocal(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Vrai si la mise en avant n'a pas été touchée aujourd'hui et qu'il est 17h ou
 * plus : le moment où, faute d'intervention du professeur, le système la
 * renouvelle de lui-même.
 */
export function estMiseEnAvantPerimee(misEnAvantUpdatedAt: string | undefined): boolean {
    return misEnAvantUpdatedAt !== dateDuJourLocal() && new Date().getHours() >= 17;
}

/**
 * Les exercices (hors outils libres) dans la plage de chacun des niveaux
 * déclarés, domaine par domaine. Sert à générer une mise en avant "adaptée"
 * quand personne n'en a choisi une.
 */
export function exercicesAdaptesAuxNiveaux(
    niveauxParDomaine: Partial<Record<SkillCategory, NiveauScolaire>> | undefined
): string[] {
    const slugs = new Set<string>();
    for (const [domaine, niveau] of Object.entries(niveauxParDomaine || {})) {
        for (const skill of skills) {
            if (!skill.isTool && skill.category === domaine && competencePertinente(skill, niveau as NiveauScolaire)) {
                slugs.add(skill.slug);
            }
        }
    }
    return [...slugs];
}
