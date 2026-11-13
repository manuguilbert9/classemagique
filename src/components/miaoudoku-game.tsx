'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, Cat, Check, CircleHelp, Lightbulb, RotateCcw, Trophy, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MIAOUDOKU_LEVELS } from '@/lib/miaoudoku-levels';
import { readCompletedLevels, recordCompletedLevel } from '@/lib/miaoudoku-progress';
import { applyMove, createBoard, cycleCell, getMistakes, getHint, isSolved, undoMove, type BoardState, type Difficulty } from '@/lib/miaoudoku';

const DIFFICULTIES: { id: Difficulty; label: string; size: number }[] = [
  { id: 'easy', label: 'Facile', size: 5 },
  { id: 'normal', label: 'Normal', size: 6 },
  { id: 'hard', label: 'Difficile', size: 8 },
];
const COLORS = ['#fbcfe8', '#bfdbfe', '#fde68a', '#bbf7d0', '#ddd6fe', '#fed7aa', '#a5f3fc', '#e2e8f0'];
const LEVEL_IDS = MIAOUDOKU_LEVELS.map(level => level.id);

export function MiaoudokuGame({ onExit, studentId }: { onExit: () => void; studentId: string }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [levelIndex, setLevelIndex] = useState(0);
  const [games, setGames] = useState<Record<string, BoardState>>({});
  const [completed, setCompleted] = useState<string[] | null>(null);
  const [message, setMessage] = useState('Commence par la plus petite zone colorée.');
  const [hintCell, setHintCell] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [focusCell, setFocusCell] = useState(0);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const storageKey = `classemagique:miaoudoku:v1:${studentId}`;
  const levels = useMemo(() => MIAOUDOKU_LEVELS.filter(level => level.difficulty === difficulty), [difficulty]);
  const level = levels[levelIndex];
  const emptyGame = useMemo<BoardState>(() => ({ board: createBoard(level), history: [] }), [level]);
  const game = games[level.id] ?? emptyGame;
  const mistakes = getMistakes(level, game.board);
  const mistakeCells = new Set(mistakes.map(mistake => mistake.index));
  const mistake = mistakes.find(item => item.index === focusCell) ?? mistakes[0];
  const catCount = game.board.filter(value => value === 'cat').length;
  const won = isSolved(level, game.board);

  useEffect(() => {
    const syncProgress = () => {
      try { setCompleted(readCompletedLevels(localStorage, storageKey, LEVEL_IDS)); }
      catch { setCompleted([]); } // Some browsers disallow even accessing localStorage.
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith(`${storageKey}:level:`)) syncProgress();
    };
    syncProgress();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  useEffect(() => {
    if (!won || completed === null || completed.includes(level.id)) return;
    setCompleted([...completed, level.id]);
    try { recordCompletedLevel(localStorage, storageKey, level.id); } catch { /* Keep playing without storage. */ }
  }, [won, completed, level.id, storageKey]);

  const updateGame = (update: (previous: BoardState) => BoardState) => {
    setGames(previous => ({ ...previous, [level.id]: update(previous[level.id] ?? emptyGame) }));
  };

  const chooseLevel = (index: number, nextDifficulty = difficulty) => {
    setDifficulty(nextDifficulty);
    setLevelIndex(index);
    setHintCell(null);
    setFocusCell(0);
    setMessage('Commence par la plus petite zone colorée.');
  };

  const playCell = (index: number) => {
    if (won) return;
    updateGame(previous => applyMove(previous, index, cycleCell(previous.board[index])));
    setHintCell(null);
    setMessage('Prends ton temps. Chaque chat a sa place !');
  };

  const hint = () => {
    const next = getHint(level, game.board);
    if (!next) return;
    updateGame(previous => applyMove(previous, next.index, next.value));
    setHintCell(next.index);
    setMessage(next.message);
  };

  const navigateGrid = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const row = Math.floor(index / level.size), col = index % level.size;
    let target = index;
    if (event.key === 'ArrowLeft') target = row * level.size + Math.max(0, col - 1);
    else if (event.key === 'ArrowRight') target = row * level.size + Math.min(level.size - 1, col + 1);
    else if (event.key === 'ArrowUp') target = Math.max(0, row - 1) * level.size + col;
    else if (event.key === 'ArrowDown') target = Math.min(level.size - 1, row + 1) * level.size + col;
    else if (event.key === 'Home') target = row * level.size;
    else if (event.key === 'End') target = (row + 1) * level.size - 1;
    else return;
    event.preventDefault();
    setFocusCell(target);
    cells.current[target]?.focus();
  };

  const advance = () => {
    if (levelIndex < levels.length - 1) chooseLevel(levelIndex + 1);
    else {
      const next = DIFFICULTIES[DIFFICULTIES.findIndex(d => d.id === difficulty) + 1];
      if (next) chooseLevel(0, next.id);
      else onExit();
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-3 py-5 text-slate-700 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onExit} className="gap-2 px-2"><ArrowLeft className="h-4 w-4" /> Récompenses</Button>
        <span className="flex items-center gap-2 text-sm font-bold text-teal-800"><Trophy className="h-4 w-4" /> {completed?.length ?? 0} / 24 grilles réussies</span>
      </header>

      <div className="mb-6 text-center">
        <h1 className="flex items-center justify-center gap-3 font-headline text-4xl font-bold text-teal-800 sm:text-5xl"><Cat aria-hidden="true" className="h-10 w-10 fill-teal-100" /> Miaoudoku</h1>
        <p className="mt-2 text-sm sm:text-base">À chaque chat, son petit coin de couleur.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-8">
        <section aria-label="Jeu de logique" className="min-w-0">
          <div className="mx-auto max-w-[544px]">
            <div className="mb-4 grid grid-cols-3 gap-2" role="group" aria-label="Difficulté">
              {DIFFICULTIES.map(option => (
                <button key={option.id} type="button" aria-pressed={difficulty === option.id} onClick={() => chooseLevel(0, option.id)} className={cn('min-h-12 rounded-xl border-2 px-2 py-2 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700', difficulty === option.id ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-200 bg-white hover:border-teal-400')}>
                  {option.label} <span className="ml-1 whitespace-nowrap text-xs font-normal">{option.size} × {option.size}</span>
                </button>
              ))}
            </div>

            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-bold">
                Niveau
                <select aria-label="Niveau" value={levelIndex} onChange={event => chooseLevel(Number(event.target.value))} className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-base focus-visible:outline-teal-700">
                  {levels.map((item, index) => <option key={item.id} value={index}>{index + 1} / {levels.length}{completed?.includes(item.id) ? ' ✓' : ''}</option>)}
                </select>
              </label>
              <span className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 font-bold', mistakes.length ? 'bg-rose-100 text-rose-800' : 'bg-teal-50 text-teal-800')}><Cat className="h-5 w-5" aria-hidden="true" /> {catCount} / {level.size} <span className="text-sm">chats</span></span>
            </div>

            {/* A fixed height keeps the grid still between the first and second click. */}
            <div id="miaoudoku-feedback" role={mistake ? 'alert' : 'status'} aria-live={mistake ? 'assertive' : 'polite'} aria-atomic="true" className={cn('mb-3 flex h-28 items-center justify-center overflow-y-auto rounded-xl px-4 py-3 text-center text-sm', won ? 'bg-teal-100 text-teal-900' : mistake ? 'border-2 border-rose-500 bg-rose-50 text-rose-800' : 'bg-slate-50 text-slate-600')}>
              <div>
                {won ? <><p className="font-headline text-2xl font-bold">Bravo, tous les chats sont installés !</p><p className="mt-1">Tu as trouvé une place pour chacun.</p></> : mistake ? <>
                  <strong>{mistake.value === 'mark' ? 'Oups, cette croix est mal placée !' : 'Oups, ce chat est mal placé !'}</strong>
                  <p className="mt-1">{mistake.value === 'mark'
                    ? `Un chat doit aller en ligne ${Math.floor(mistake.index / level.size) + 1}, colonne ${mistake.index % level.size + 1}. Clique encore pour le poser.`
                    : `La case ligne ${Math.floor(mistake.index / level.size) + 1}, colonne ${mistake.index % level.size + 1} n’accueille pas de chat. Clique dessus pour le retirer.`}</p>
                </> : message}
              </div>
            </div>

            <div role="grid" aria-label={`Grille de ${level.size} lignes et ${level.size} colonnes`} aria-describedby="miaoudoku-controls" className="overflow-hidden rounded-2xl border-[3px] border-slate-600 bg-slate-600 shadow-[0_6px_0_0_#cbd5e1]">
              {Array.from({ length: level.size }, (_, row) => (
                <div role="row" key={row} className="grid" style={{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))` }}>
                  {Array.from({ length: level.size }, (_, col) => {
                    const index = row * level.size + col, region = level.regions[index], value = game.board[index];
                    return (
                      <button key={index} type="button" role="gridcell" ref={element => { cells.current[index] = element; }} tabIndex={focusCell === index ? 0 : -1} aria-label={`Ligne ${row + 1}, colonne ${col + 1}, zone ${region + 1}, ${value === 'cat' ? 'chat' : value === 'mark' ? 'croix' : 'vide'}${mistakeCells.has(index) ? ', erreur' : ''}`} aria-invalid={mistakeCells.has(index) || undefined} aria-describedby={mistakeCells.has(index) ? 'miaoudoku-feedback' : undefined} aria-disabled={won} onClick={() => playCell(index)} onFocus={() => setFocusCell(index)} onKeyDown={event => navigateGrid(event, index)}
                        className={cn('relative flex aspect-square w-full touch-manipulation select-none items-center justify-center text-slate-800 transition-[filter] hover:brightness-105 focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-teal-800', mistakeCells.has(index) && 'z-[1] ring-[3px] ring-inset ring-rose-600', hintCell === index && 'z-[2] ring-4 ring-inset ring-teal-700')}
                        style={{ backgroundColor: COLORS[region], borderRight: col < level.size - 1 ? `${level.regions[index + 1] === region ? 1 : 3}px solid ${level.regions[index + 1] === region ? '#64748b55' : '#475569'}` : undefined, borderBottom: row < level.size - 1 ? `${level.regions[index + level.size] === region ? 1 : 3}px solid ${level.regions[index + level.size] === region ? '#64748b55' : '#475569'}` : undefined }}>
                        <span aria-hidden="true" className="absolute left-1 top-0.5 text-[10px] leading-none text-slate-600 sm:left-1.5 sm:top-1 sm:text-xs">{region + 1}</span>
                        {value === 'cat' && <Cat aria-hidden="true" className="h-[60%] w-[60%] fill-white stroke-[2.5]" />}
                        {value === 'mark' && <X aria-hidden="true" className="h-[38%] w-[38%] stroke-[3] text-slate-600" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <p id="miaoudoku-controls" className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
              <span>1 clic : <strong>×</strong></span><span aria-hidden="true">→</span><span>2 clics : <Cat className="inline h-4 w-4" aria-label="chat" /></span><span aria-hidden="true">→</span><span>3 clics : vide</span>
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button variant="outline" disabled={!game.history.length} onClick={() => { updateGame(undoMove); setHintCell(null); setMessage('Le dernier coup a été annulé.'); }} className="h-auto min-h-12 flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2"><Undo2 className="h-4 w-4" /> Annuler</Button>
              <Button variant="outline" disabled={won} onClick={hint} className="h-auto min-h-12 flex-col gap-1 border-teal-300 bg-teal-50 px-1 py-2 text-teal-900 hover:bg-teal-100 sm:flex-row sm:gap-2"><Lightbulb className="h-4 w-4" /> Indice</Button>
              <Button variant="outline" disabled={!game.board.some(value => value !== 'empty')} onClick={() => { updateGame(previous => ({ board: createBoard(level), history: [...previous.history, previous.board] })); setHintCell(null); setMessage('La grille est prête. Tu peux repartir à zéro !'); }} className="h-auto min-h-12 flex-col gap-1 px-1 py-2 sm:flex-row sm:gap-2"><RotateCcw className="h-4 w-4" /> Recommencer</Button>
            </div>

            {won && <Button onClick={advance} className="mt-3 h-12 w-full gap-2 bg-teal-700 text-base hover:bg-teal-800">{levelIndex < levels.length - 1 ? 'Niveau suivant' : difficulty !== 'hard' ? 'Essayer la difficulté suivante' : 'Retour aux récompenses'}<ArrowRight className="h-4 w-4" /></Button>}
          </div>
        </section>

        <aside className="rounded-2xl border border-teal-100 bg-white p-5">
          <h2 className="font-headline text-2xl font-bold text-teal-800">Le coin des règles</h2>
          <ul className="mt-4 space-y-4 text-sm leading-relaxed">
            <li className="flex gap-2"><Check className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" /><span>Un seul chat dans chaque <strong>zone colorée</strong>.</span></li>
            <li className="flex gap-2"><Check className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" /><span>Un seul chat par <strong>ligne</strong> et par <strong>colonne</strong>.</span></li>
            <li className="flex gap-2"><Check className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" /><span>Les chats ne se touchent pas, même <strong>en diagonale</strong>.</span></li>
          </ul>
          <Button variant="ghost" aria-expanded={showRules} aria-controls="miaoudoku-help" onClick={() => setShowRules(previous => !previous)} className="mt-4 w-full gap-2 text-teal-800"><CircleHelp className="h-4 w-4" /> Comment jouer ?</Button>
          {showRules && <div id="miaoudoku-help" className="mt-3 space-y-3 border-t border-teal-100 pt-4 text-sm leading-relaxed"><p>Clique une fois pour barrer une case impossible, une deuxième fois pour poser un chat, puis une troisième fois pour effacer.</p><p>Une croix ou un chat mal placé est entouré en rouge. Le message au-dessus de la grille t’aide à corriger.</p><p>Les numéros indiquent les zones : deux cases du même numéro ont la même couleur.</p><p>Au clavier : déplace-toi avec les flèches et joue avec Entrée ou Espace.</p><p>Un indice retire un chat mal placé ou place un chat pour t’aider. Tu peux annuler ce coup.</p></div>}
          <div className="mt-5 border-t border-teal-100 pt-4 text-xs leading-relaxed text-slate-500"><p>Pas de chrono. Tu peux réfléchir tranquillement.</p><p className="mt-2">Les 24 grilles sont incluses dans cette session. Les réussites sont gardées sur cet appareil.</p></div>
        </aside>
      </div>
    </main>
  );
}
