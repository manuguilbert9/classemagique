"use client";
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/user-context';
import { getPendingResults, retryResults, subscribeResults } from '@/lib/result-outbox';
import { persistResult } from '@/services/scores-server';
import { Button } from '@/components/ui/button';
export function ResultSaveStatus() {
 const {student} = useContext(UserContext);
 const [,refresh] = useState(0);
 useEffect(() => subscribeResults(() => refresh(n=>n+1)), []);
 useEffect(() => {
  if (!student) return;
  const retry=()=>{void retryResults(student.id,persistResult);};
  retry(); window.addEventListener('online',retry);
  return ()=>window.removeEventListener('online',retry);
 },[student?.id]);
 if (!student) return null;
 const entries = getPendingResults(student.id);
 if (!entries.length) return null;
 const pending = entries.filter(e=>e.state==='pending');
 const saving = entries.some(e=>e.state==='saving');
 return <aside role="status" aria-live="polite" className="rounded-lg border bg-card p-3 text-center">
  {saving ? 'Exercice terminé — enregistrement en cours…' : pending.length ? 'Exercice terminé — résultat à enregistrer.' : 'Résultat enregistré.'}
  {!!pending.length && <><p>{pending[0].error || 'Le résultat est conservé sur cet appareil jusqu’à la reprise.'}</p><Button onClick={()=>void retryResults(student.id,persistResult)}>Réessayer l’enregistrement</Button></>}
 </aside>;
}
