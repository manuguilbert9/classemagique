'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { HomeworkSupport } from '@/lib/homework-aids';

/** Scratch work: every placement is made by the pupil, with no computed answer. */
export function HomeworkMathsSupport({ support }: { support: HomeworkSupport }) {
  const [pointed, setPointed] = useState<number | null>(null);
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);
  const [parts, setParts] = useState<number[]>([]);
  const title = support.kind === 'number-line' ? 'Ma bande numérique' : support.kind === 'place-value' ? 'Mon tableau de numération' : support.kind === 'fraction' ? 'Ma bande à partager' : 'Mes jetons pour cette question';
  return <details className="rounded-xl border bg-white p-3 text-slate-900">
    <summary className="cursor-pointer py-2 font-semibold">{title}</summary>
    <div className="mt-3 space-y-4">
      <p>{support.instruction}</p>
      {support.kind === 'number-line' && <>
        <p className="text-sm">De {support.min} à {support.max}{support.unit ? ` ${support.unit}` : ''}{support.start !== undefined ? ` · départ : ${support.start}` : ''}. Chaque case représente une unité.</p>
        <div className="grid grid-cols-5 gap-1 sm:grid-cols-10" aria-label={`Bande de ${support.min} à ${support.max}`}>
          {Array.from({ length: support.max - support.min + 1 }, (_, i) => support.min + i).map(n => <button key={n} type="button" aria-label={`Repérer ${n}${support.unit ? ` ${support.unit}` : ''}`} aria-pressed={pointed === n} onClick={() => setPointed(n)} className={`min-h-11 rounded-md border p-1 text-lg ${n === support.start ? 'border-2 border-sky-700 font-bold' : 'border-slate-300'} ${pointed === n ? 'bg-amber-200' : 'bg-white'}`}>{n}</button>)}
        </div>
        <Button variant="outline" onClick={() => setPointed(null)}>Effacer mon repère</Button>
      </>}
      {support.kind === 'place-value' && <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><caption className="mb-2 text-left">Tableau vide à compléter pour chercher.</caption><thead><tr><th className="border p-2">Nombre</th>{support.columns.map(c => <th key={c} className="min-w-20 border p-2">{c}</th>)}</tr></thead><tbody>{support.rows.map((row, i) => <tr key={`${i}-${row}`}><th className="border p-2 text-left font-medium">{row}</th>{support.columns.map(c => <td key={c} className="border p-2"><Input aria-label={`${c} — ${row}`} inputMode="numeric" maxLength={3} autoComplete="off" className="min-w-12 text-center text-lg" /></td>)}</tr>)}</tbody></table></div>}
      {support.kind === 'counters' && <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: support.groups }, (_, i) => <div key={i} className="rounded-lg border p-3"><p className="font-semibold">Zone {i + 1}</p><div role="list" aria-label={`Jetons de la zone ${i + 1}`} className="my-3 flex min-h-12 flex-wrap gap-2">{Array.from({ length: counts[i] }, (_, n) => <span key={n} role="listitem" aria-label="Un jeton" className="h-7 w-7 rounded-full border-2 border-amber-800 bg-amber-300" />)}</div><div className="flex flex-wrap gap-2"><Button variant="outline" aria-label={`Retirer un jeton de la zone ${i + 1}`} disabled={counts[i] === 0} onClick={() => setCounts(old => old.map((v, j) => j === i ? v - 1 : v))}>− 1</Button><Button variant="outline" aria-label={`Ajouter un jeton à la zone ${i + 1}`} disabled={counts[i] >= support.max} onClick={() => setCounts(old => old.map((v, j) => j === i ? v + 1 : v))}>+ 1</Button></div></div>)}</div>}
      {support.kind === 'fraction' && <><div className="flex" aria-label={`Une unité partagée en ${support.parts} parts égales`}>{Array.from({ length: support.parts }, (_, i) => <button key={i} type="button" aria-label={`Colorier la part ${i + 1}`} aria-pressed={parts.includes(i)} onClick={() => setParts(old => old.includes(i) ? old.filter(p => p !== i) : [...old, i])} className={`h-20 min-w-0 flex-1 border-2 border-sky-800 ${parts.includes(i) ? 'bg-sky-400' : 'bg-white'}`} />)}</div><Button variant="outline" onClick={() => setParts([])}>Effacer mon coloriage</Button></>}
      <p className="text-sm text-slate-600">Utilise ce support comme brouillon, puis écris ta réponse dans « Ma réponse ».</p>
    </div>
  </details>;
}
