import { HOMEWORK_READINGS } from '../data/homework-p2';
import { HOMEWORK_MATHS, mathsRevision } from '../data/homework-maths-p2';
import type { HomeworkPlan, HomeworkProfiles, HomeworkProfile, HomeworkActivity } from './homework-plan';

export function parisDate(now = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Consultation locale : ne change jamais le compte connecté ni son contexte global. */
export function homeworkViewer(student: {id:string;name:string}, requestedId='') {
  const canPreview=student.name.trim().toLocaleLowerCase('fr-FR')==='m. manu';
  return {canPreview,studentId:canPreview&&requestedId?requestedId:student.id,readOnly:canPreview&&!!requestedId};
}
export function periodDates(from = '2026-11-03') {
  const dates: { date: string; availableOn: string; week: number; day: 1 | 4 }[] = [];
  for (let week = 8; week <= 14; week++) for (const day of [1, 4] as const) {
    const time = Date.UTC(2026, 10, 2 + (week - 8) * 7 + day - 1);
    const date = new Date(time).toISOString().slice(0, 10);
    if (date < from) continue;
    dates.push({ date, week, day, availableOn: new Date(time - (day === 1 ? 3 : 2) * 86400000).toISOString().slice(0, 10) });
  }
  return dates;
}

/** Le cadrage nominatif récent définit les parcours de devoirs, pas les niveaux scolaires généraux. */
export function profileForStudent(student: { name: string; groupId?: string }): HomeworkProfiles | null {
  if (!student.groupId) return null;
  const name = student.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const roster: Record<string, HomeworkProfile> = {
    matteo: 'B-', helena: 'B', telyann: 'B', youssouf: 'B', leo: 'B', noham: 'B', jessy: 'B', ismael: 'B',
    mathis: 'B+', nolan: 'B+', stelina: 'C', emma: 'C', lenny: 'C', nessa: 'C', axelle: 'C', julie: 'C',
  };
  const profile = roster[name];
  return profile ? { reading: profile, spelling: profile, maths: name === 'axelle' ? 'B+' : profile, support: ['leo', 'helena'].includes(name) ? 'syllabes' : 'standard' } : null;
}

export function createPeriodPlan(week: number, day: 1 | 4, profiles: HomeworkProfiles): HomeworkPlan {
  if (!Number.isInteger(week) || week < 8 || week > 14 || ![1, 4].includes(day)) throw new Error('Séance hors période P2.');
  const seed = HOMEWORK_READINGS[week];
  const code = profiles.reading === 'B-';
  const minuteReading = code ? 3 : profiles.reading === 'C' ? 4 : 3;
  const reading = code ? {
    title: 'Mes syllabes', mode: 'code' as const, minutes: minuteReading,
    instruction: 'Lis les syllabes, puis les assemblages. Tu peux les montrer ou utiliser des lettres mobiles. Pas de copie.',
    passage: week % 2 ? ['LO LU MO MU', 'MULO LUMO'] : ['LA LI MA MI', 'LAMI MILA'],
    adultText: 'Mila veut sortir. Elle regarde la pluie par la fenêtre. Elle prend son manteau avant d’ouvrir la porte.',
    questions: [{ prompt: day === 1 ? 'Pourquoi Mila prend-elle son manteau ?' : 'Qu’est-ce qui montre que Mila se prépare avant de sortir ?', answer: day === 1 ? 'Elle veut se protéger de la pluie.' : 'Elle prend son manteau avant d’ouvrir la porte.', hint: 'Un adulte lit la petite histoire. Explique ton idée ou montre la partie utile.' }],
  } : {
    title: seed.title, mode: 'text' as const, minutes: minuteReading,
    instruction: day === 1 ? 'Lis ce petit texte. Raconte ce que tu as compris, puis réponds à la question à voix haute.' : 'Relis le texte de la semaine à ton rythme. Réponds à la nouvelle question à voix haute.',
    passage: seed.passages[profiles.reading as 'B' | 'B+' | 'C'],
    questions: [seed.questions[profiles.reading as 'B' | 'B+' | 'C'][day === 1 ? 0 : 1]],
  };
  const spelling = profiles.spelling === 'B-' ? null : {
    title: `Dyna-Mots · ${seed.theme}`, minutes: profiles.spelling === 'C' ? 5 : 3,
    instruction: day === 1 ? 'Observe un mot ou groupe de mots. Cache-le, épelle-le ou reconstruis-le, puis vérifie. Arrête au temps prévu.' : 'Cache les mots et essaie de les retrouver. Vérifie, puis revois ceux qui résistent. Le bilan se fait en classe.',
    words: profiles.spelling === 'B' ? seed.short : profiles.spelling === 'C' ? [...seed.base, ...seed.extension] : seed.base,
    questions: day === 4 ? [seed.agreement] : [],
  };
  const maths = { ...HOMEWORK_MATHS[profiles.maths][week - 8][day === 1 ? 0 : 1], minutes: profiles.maths === 'B-' ? 3 : profiles.maths === 'C' ? 5 : 4, tokens: profiles.maths === 'B-' || profiles.maths === 'B' };
  if (maths.prerequisite) maths.fallback = { ...mathsRevision(profiles.maths, week), minutes: maths.minutes };
  const slot = periodDates('2026-11-02').find(d => d.week === week && d.day === day)!;
  return structuredClone({ version: 1, week, day, theme: seed.theme, availableOn: slot.availableOn, profiles,
    maxMinutes: Math.max(8, minuteReading + (spelling?.minutes ?? 0) + maths.minutes), reading, spelling, maths });
}

export function mathsForPlan(plan: HomeworkPlan): HomeworkActivity {
  return !plan.maths.introduced && plan.maths.fallback ? plan.maths.fallback : plan.maths;
}

export function planIsAvailable(plan: HomeworkPlan, now = new Date()): boolean {
  const today=parisDate(now);
  if(plan.availableOn!==today)return plan.availableOn<today;
  const time=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
  return plan.day!==4 || time>='15:00';
}

export function validHomeworkPlan(value: unknown): value is HomeworkPlan {
  if(!value||typeof value!=='object')return false;
  const plan=value as HomeworkPlan;
  const text=(s:unknown)=>typeof s==='string'&&s.trim().length>0;
  const texts=(items:unknown)=>Array.isArray(items)&&items.length>0&&items.every(text);
  const activity=(a:HomeworkActivity|undefined|null)=>!!a&&text(a.title)&&text(a.instruction)&&Number.isFinite(a.minutes)&&a.minutes>0&&Array.isArray(a.questions)&&a.questions.every(q=>q&&text(q.prompt)&&text(q.answer)&&text(q.hint));
  const slot=periodDates('2026-11-02').find(s=>s.week===plan.week&&s.day===plan.day);
  if(plan.version!==1||!slot||plan.availableOn!==slot.availableOn||!plan.profiles||!text(plan.theme))return false;
  if(![plan.profiles.reading,plan.profiles.spelling,plan.profiles.maths].every(p=>['B-','B','B+','C'].includes(p))||!['standard','syllabes'].includes(plan.profiles.support))return false;
  if(!activity(plan.reading)||!texts(plan.reading?.passage)||!['code','text'].includes(plan.reading.mode)||!activity(plan.maths)||typeof plan.maths.introduced!=='boolean')return false;
  if(plan.spelling!==null&&(!activity(plan.spelling)||!texts(plan.spelling?.words)))return false;
  if(!plan.maths.introduced&&!activity(plan.maths.fallback))return false;
  return Number.isFinite(plan.maxMinutes)&&plan.maxMinutes<=15&&plan.maxMinutes>=plan.reading.minutes+(plan.spelling?.minutes??0)+plan.maths.minutes;
}
