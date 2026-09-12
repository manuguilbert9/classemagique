'use server';

/**
 * Le stock de contenus partagé entre les élèves.
 *
 * Principe : le premier élève qui entre dans un exercice génère le contenu, on
 * le mémorise, et tous les suivants reçoivent exactement le même. Quand un
 * élève arrive au bout du stock, on génère un lot supplémentaire que l'on
 * ajoute à la suite — jamais à la place. Chaque soir à 23 h le stock est
 * périmé et le premier élève du lendemain repart sur du neuf.
 *
 * Le stock est cloisonné par exercice + niveau + réglages : un élève de niveau A
 * ne reçoit jamais le contenu préparé pour le niveau D.
 *
 * Chaque élève garde son propre curseur de lecture : s'il refait l'exercice
 * dans la journée, il reprend la suite du stock au lieu de revoir les mêmes
 * questions.
 */

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, runTransaction, deleteDoc, writeBatch, type DocumentData, type DocumentReference } from 'firebase/firestore';
import { getSchoolDay } from '@/lib/school-day';
import {
  POOLED_GENERATORS,
  type PooledContentGenerator,
  type PooledItem,
  type PooledSettings,
} from '@/lib/exercise-content-registry';
import { generateQuestions, type AllSettings, type Question } from '@/lib/questions';
import type { SkillLevel } from '@/lib/skills';

const POOLS_COLLECTION = 'exerciseContentPools';

/** Durée au-delà de laquelle un verrou de génération est considéré comme abandonné. */
const LOCK_TTL_MS = 60_000;
/** Intervalle entre deux vérifications quand on attend la génération d'un autre élève. */
const POLL_INTERVAL_MS = 500;
/** Au-delà, on cesse d'attendre et on génère soi-même plutôt que de bloquer l'élève. */
const MAX_WAIT_MS = 20_000;
/** Garde-fou : un document Firestore est limité à 1 Mio. */
const MAX_POOL_ITEMS = 500;

interface ExercisePool {
  skill: string;
  level: string | null;
  settingsKey: string;
  /** Journée scolaire (bascule à 23 h) à laquelle ce stock appartient. */
  schoolDay: string;
  /** Le contenu mémorisé, dans l'ordre où il a été généré. */
  items: PooledItem[];
  /** Position de lecture de chaque élève : `studentId` → index du prochain élément. */
  cursors: Record<string, number>;
  /** Horodatage du verrou de génération en cours, `null` si personne ne génère. */
  lockedAt: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PoolContext {
  level: SkillLevel | string | null;
  settings?: PooledSettings;
  studentId?: string | null;
  /**
   * Pour les exercices dont le contenu découle d'un support choisi (une liste
   * de mots, par exemple) plutôt que d'une progression : tout le monde relit le
   * début du stock, et repasser l'exercice ne consomme rien.
   */
  reuseFromStart?: boolean;
}

export interface PooledContentOptions {
  settings?: PooledSettings;
  level?: SkillLevel | string | null;
  studentId?: string | null;
  /**
   * `true` quand le contenu découle d'un support choisi et non d'une
   * progression : l'élève relit toujours le début du stock, et repasser
   * l'exercice ne déclenche aucune génération.
   */
  reuseFromStart?: boolean;
}

/**
 * Point d'entrée des exercices dont le contenu est une liste de `Question`.
 * Passe par le stock partagé quand l'exercice y est inscrit, génère
 * directement sinon.
 */
export async function getExerciseQuestions(
  skill: string,
  count: number,
  options?: { settings?: AllSettings; level?: SkillLevel | string | null; studentId?: string | null }
): Promise<Question[]> {
  return getPooledContent<Question>(skill, count, options);
}

/**
 * Même dispositif, pour les exercices dont le contenu a sa propre forme
 * (manches de désignation, problèmes rédigés, séries de soustractions…).
 */
export async function getPooledContent<T extends PooledItem>(
  skill: string,
  count: number,
  options?: PooledContentOptions
): Promise<T[]> {
  const settings = options?.settings;
  const level = options?.level ?? null;
  const generator = POOLED_GENERATORS[skill];

  if (!generator || count <= 0) {
    // Exercice pas encore mutualisé : on garde le comportement historique.
    return (await generateQuestions(skill, count, settings as AllSettings | undefined)) as PooledItem[] as T[];
  }

  const context: PoolContext = {
    level,
    settings,
    studentId: options?.studentId ?? null,
    reuseFromStart: options?.reuseFromStart ?? false,
  };

  try {
    return (await serveFromPool(skill, count, context, generator)) as T[];
  } catch (error) {
    // Le stock est une optimisation : s'il tombe en panne, l'élève doit tout de
    // même pouvoir travailler.
    console.error(`[exercise-pool] stock indisponible pour « ${skill} », génération directe :`, error);
    return (await generator({ count, level, settings })) as T[];
  }
}

async function serveFromPool(
  skill: string,
  count: number,
  context: PoolContext,
  generator: PooledContentGenerator
): Promise<PooledItem[]> {
  const schoolDay = getSchoolDay();
  const settingsKey = stableStringify({ level: context.level ?? null, settings: context.settings ?? null });
  const ref = doc(db, POOLS_COLLECTION, buildPoolId(skill, context.level, settingsKey));
  const studentKey = buildStudentKey(context.studentId);
  const meta = { skill, level: (context.level as string) ?? null, settingsKey };

  const deadline = Date.now() + MAX_WAIT_MS;

  while (true) {
    const claim = await claimFromPool(ref, schoolDay, meta, studentKey, count, context.reuseFromStart);

    if (claim.status === 'ready') {
      return claim.items;
    }

    if (claim.status === 'generate') {
      const fresh = await generateBatch(generator, count - claim.have, context);
      return commitBatch(ref, schoolDay, meta, studentKey, count, fresh, context.reuseFromStart);
    }

    // Un autre élève est déjà en train de générer : on attend son contenu
    // plutôt que d'en produire un deuxième en parallèle.
    if (Date.now() >= deadline) {
      const fresh = await generateBatch(generator, count - claim.have, context);
      return commitBatch(ref, schoolDay, meta, studentKey, count, fresh, context.reuseFromStart);
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

type Claim =
  | { status: 'ready'; items: PooledItem[] }
  | { status: 'generate'; have: number }
  | { status: 'wait'; have: number };

/**
 * Réserve la part de stock de l'élève, en une transaction : soit le contenu
 * mémorisé suffit et on avance son curseur, soit il faut générer et on pose un
 * verrou pour éviter que deux élèves simultanés génèrent deux fois.
 */
async function claimFromPool(
  ref: DocumentReference<DocumentData>,
  schoolDay: string,
  meta: { skill: string; level: string | null; settingsKey: string },
  studentKey: string,
  count: number,
  reuseFromStart = false
): Promise<Claim> {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const now = Date.now();
    const stored = snapshot.exists() ? (snapshot.data() as ExercisePool) : null;

    // Un stock d'une journée précédente est périmé : on l'efface en le
    // remplaçant. C'est l'effacement de 23 h, appliqué à la première lecture.
    const pool = stored && stored.schoolDay === schoolDay ? stored : null;

    if (!pool) {
      const nowIso = new Date().toISOString();
      transaction.set(ref, {
        ...meta,
        schoolDay,
        items: [],
        cursors: {},
        lockedAt: now,
        createdAt: nowIso,
        updatedAt: nowIso,
      } satisfies ExercisePool);
      return { status: 'generate', have: 0 };
    }

    const items = pool.items ?? [];
    const cursor = reuseFromStart ? 0 : pool.cursors?.[studentKey] ?? 0;
    const available = Math.max(0, items.length - cursor);

    if (available >= count) {
      if (!reuseFromStart) {
        transaction.update(ref, {
          [`cursors.${studentKey}`]: cursor + count,
          updatedAt: new Date().toISOString(),
        });
      }
      return { status: 'ready', items: items.slice(cursor, cursor + count) };
    }

    if (pool.lockedAt && now - pool.lockedAt < LOCK_TTL_MS) {
      return { status: 'wait', have: available };
    }

    transaction.update(ref, { lockedAt: now, updatedAt: new Date().toISOString() });
    return { status: 'generate', have: available };
  });
}

/** Ajoute le contenu fraîchement généré à la suite du stock, puis sert l'élève. */
async function commitBatch(
  ref: DocumentReference<DocumentData>,
  schoolDay: string,
  meta: { skill: string; level: string | null; settingsKey: string },
  studentKey: string,
  count: number,
  fresh: PooledItem[],
  reuseFromStart = false
): Promise<PooledItem[]> {
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const stored = snapshot.exists() ? (snapshot.data() as ExercisePool) : null;
    const pool = stored && stored.schoolDay === schoolDay ? stored : null;

    const previous = pool?.items ?? [];
    // Cas extrême (des centaines de recharges dans la journée) : on repart de
    // zéro plutôt que de faire exploser la taille du document.
    const base = previous.length > MAX_POOL_ITEMS ? [] : previous;
    const cursors = base === previous ? { ...(pool?.cursors ?? {}) } : {};
    const cursor = reuseFromStart ? 0 : cursors[studentKey] ?? 0;

    // Les identifiants sont réattribués selon la position dans le stock : les
    // générateurs s'appuient sur `Date.now()` et produiraient des doublons.
    // Les contenus sans identifiant sont stockés tels quels.
    const items = [
      ...base,
      ...fresh.map((item, index) => ('id' in item ? { ...item, id: base.length + index + 1 } : item)),
    ];
    const slice = items.slice(cursor, cursor + count);
    if (!reuseFromStart) cursors[studentKey] = cursor + slice.length;

    const nowIso = new Date().toISOString();
    transaction.set(
      ref,
      stripUndefined({
        ...meta,
        schoolDay,
        items,
        cursors,
        lockedAt: null,
        createdAt: pool?.createdAt ?? nowIso,
        updatedAt: nowIso,
      } satisfies ExercisePool)
    );

    return slice;
  });
}

/**
 * Produit le complément manquant. Certains générateurs renvoient des lots de
 * taille imposée : on boucle jusqu'à avoir le compte, sans insister si le
 * générateur ne produit plus rien.
 */
async function generateBatch(
  generator: PooledContentGenerator,
  missing: number,
  context: PoolContext
): Promise<PooledItem[]> {
  const produced: PooledItem[] = [];
  let attempts = 0;

  while (produced.length < missing && attempts < 5) {
    const batch = await generator({
      count: missing - produced.length,
      level: context.level,
      settings: context.settings,
    });
    if (!batch || batch.length === 0) break;
    produced.push(...batch);
    attempts++;
  }

  return produced;
}

/** Supprime les stocks des journées précédentes. Ménage, appelable à la demande. */
export async function purgeStaleExercisePools(): Promise<number> {
  const schoolDay = getSchoolDay();
  const snapshot = await getDocs(collection(db, POOLS_COLLECTION));
  const stale = snapshot.docs.filter((d) => (d.data() as ExercisePool).schoolDay !== schoolDay);

  for (const d of stale) {
    await deleteDoc(d.ref);
  }
  return stale.length;
}

/** Vide entièrement le stock, y compris celui du jour (usage enseignant). */
export async function clearAllExercisePools(): Promise<number> {
  const snapshot = await getDocs(collection(db, POOLS_COLLECTION));
  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snapshot.size;
}

// — Utilitaires —

function buildPoolId(skill: string, level: SkillLevel | string | null, settingsKey: string): string {
  return `${sanitize(skill)}__${sanitize(level ? String(level) : 'na')}__${fingerprint(settingsKey)}`;
}

function buildStudentKey(studentId?: string | null): string {
  return sanitize(studentId || 'anonyme');
}

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

/** Empreinte courte et stable (FNV-1a), pour tenir dans un identifiant de document. */
function fingerprint(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/** Sérialisation déterministe : deux réglages identiques donnent la même clé. */
function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, v]) => `${key}:${stableStringify(v)}`).join(',')}}`;
  }
  return String(value);
}

/** Firestore refuse les `undefined` : les générateurs en produisent beaucoup. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item !== undefined) result[key] = stripUndefined(item);
    }
    return result as T;
  }
  return value;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
