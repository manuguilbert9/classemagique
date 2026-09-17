import type { Score } from '../services/scores-server';
type Payload = Omit<Score, 'id' | 'createdAt'> & {sessionId: string};
type Result = {success: boolean; error?: string; nuggetsEarned?: number};
type Entry = {data: Payload; state: 'saving' | 'pending' | 'saved'; error?: string};
const KEY = 'classemagique.result-outbox.v2.';
let entries: Entry[] = [];
const active = new Map<string, Promise<Result>>();
const listeners = new Set<() => void>();
function load() {
 if (typeof window === 'undefined') return;
 try {
  for (let i=0; i<localStorage.length; i++) {
   const key = localStorage.key(i);
   if (!key?.startsWith(KEY)) continue;
   const entry = JSON.parse(localStorage.getItem(key) || 'null') as Entry | null;
   if (entry?.data?.sessionId && !entries.some(e=>e.data.sessionId === entry.data.sessionId)) entries.push({...entry,state:'pending'});
  }
 } catch { /* Keep the in-memory queue available when storage is unavailable. */ }
}
function publish(entry: Entry) {
 if (typeof window !== 'undefined') {
  try {
   const key = KEY + entry.data.sessionId;
   if (entry.state === 'saved') localStorage.removeItem(key);
   else localStorage.setItem(key, JSON.stringify(entry));
  }
  catch { if (entry.state !== 'saved') entry.error = 'Stockage local indisponible : garde cette page ouverte et réessaie.'; }
 }
 listeners.forEach(listener => listener());
}
export function subscribeResults(listener: () => void) { listeners.add(listener); return () => {listeners.delete(listener);}; }
export function getPendingResults(userId: string) { load(); return entries.filter(e => e.data.userId === userId); }
export async function enqueueResult(data: Omit<Payload, 'sessionId'> & {sessionId?: string}, persist: (data:Payload) => Promise<Result>): Promise<Result> {
 load();
 const payload = {...data, sessionId:data.sessionId || crypto.randomUUID()} as Payload;
 let entry = entries.find(e => e.data.sessionId === payload.sessionId);
 if (!entry) { entry = {data:payload,state:'pending'}; entries.push(entry); }
 if (entry.state === 'saved') return {success:true,nuggetsEarned:0};
 return send(entry, persist);
}
function send(entry:Entry, persist:(data:Payload) => Promise<Result>): Promise<Result> {
 const running = active.get(entry.data.sessionId); if (running) return running;
 entry.state='saving'; publish(entry);
 const task = (async () => {
  let result:Result;
  try { result = await persist(entry.data); } catch { result = {success:false,error:'Connexion interrompue. Réessaie pour enregistrer.'}; }
  entry.state = result.success ? 'saved' : 'pending'; entry.error=result.error;
  active.delete(entry.data.sessionId); publish(entry); return result;
 })();
 active.set(entry.data.sessionId, task); return task;
}
export async function retryResults(userId:string, persist:(data:Payload)=>Promise<Result>) {
 load(); return Promise.all(entries.filter(e=>e.data.userId===userId && e.state==='pending').map(e=>send(e,persist)));
}
