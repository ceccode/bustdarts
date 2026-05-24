import type { ActiveMatch, ActiveLeg, ActiveTurn, MatchConfig } from './types';
import { IMPOSSIBLE_TOTALS } from './checkouts';

export function newMatch(config: MatchConfig): ActiveMatch {
  const startScore = config.variant;
  const players = config.players.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    setsWon: 0,
    legsWon: 0,
  }));

  const currentLeg: ActiveLeg = {
    setNumber: 1,
    legNumber: 1,
    starterIdx: 0,
    activeIdx: 0,
    remaining: players.map(() => startScore),
    turns: [],
    finished: false,
    winnerId: null,
  };

  return {
    id: crypto.randomUUID(),
    variant: config.variant,
    startScore,
    setsToWin: config.setsToWin,
    legsToWin: config.legsToWin,
    doubleOut: config.doubleOut,
    inputMode: config.inputMode,
    players,
    currentLeg,
    history: [],
    finished: false,
    winnerId: null,
  };
}

export function validateTotal(
  remaining: number,
  total: number,
  doubleOut: boolean
): { ok: boolean; bust?: boolean; checkout?: boolean; reason?: string } {
  if (total < 0 || total > 180) {
    return { ok: false, reason: 'out of range' };
  }
  if (IMPOSSIBLE_TOTALS.has(total)) {
    return { ok: false, reason: 'impossible total' };
  }

  const remainder = remaining - total;

  if (remainder < 0) {
    return { ok: true, bust: true };
  }
  if (doubleOut && remainder === 1) {
    return { ok: true, bust: true };
  }
  if (remainder === 0) {
    return { ok: true, checkout: true };
  }

  return { ok: true };
}

export function applyTurn(match: ActiveMatch, total: number): ActiveMatch | null {
  const leg = match.currentLeg;
  const pid = match.players[leg.activeIdx].id;
  const remaining = leg.remaining[leg.activeIdx];

  const validation = validateTotal(remaining, total, match.doubleOut);
  if (!validation.ok) return null;

  const isBust = validation.bust === true;
  const isCheckout = validation.checkout === true;
  const remainingAfter = isBust ? remaining : remaining - total;

  const turn: ActiveTurn = {
    pid,
    total: isBust ? 0 : total,
    raw: total,
    bust: isBust,
    remainingAfter,
    isCheckout,
  };

  const newRemaining = [...leg.remaining];
  newRemaining[leg.activeIdx] = remainingAfter;

  const newTurns = [...leg.turns, turn];

  const nextIdx = (leg.activeIdx + 1) % match.players.length;

  let newPlayers = match.players.map(p => ({ ...p }));
  let newFinished = match.finished;
  let newWinnerId = match.winnerId;
  let legFinished = leg.finished;
  let legWinnerId = leg.winnerId;

  if (isCheckout) {
    legFinished = true;
    legWinnerId = pid;

    const winnerIdx = match.players.findIndex(p => p.id === pid);
    newPlayers[winnerIdx].legsWon += 1;

    if (newPlayers[winnerIdx].legsWon >= match.legsToWin) {
      newPlayers[winnerIdx].setsWon += 1;
      newPlayers[winnerIdx].legsWon = 0;

      if (newPlayers[winnerIdx].setsWon >= match.setsToWin) {
        newFinished = true;
        newWinnerId = pid;
      }
    }
  }

  const newLeg: ActiveLeg = {
    ...leg,
    remaining: newRemaining,
    turns: newTurns,
    activeIdx: legFinished ? leg.activeIdx : nextIdx,
    finished: legFinished,
    winnerId: legWinnerId,
  };

  return {
    ...match,
    players: newPlayers,
    currentLeg: newLeg,
    finished: newFinished,
    winnerId: newWinnerId,
  };
}

export function undoLast(match: ActiveMatch): ActiveMatch {
  const leg = match.currentLeg;
  if (leg.turns.length === 0) return match;

  const lastTurn = leg.turns[leg.turns.length - 1];
  const newTurns = leg.turns.slice(0, -1);

  const winnerIdx = leg.finished
    ? match.players.findIndex(p => p.id === leg.winnerId)
    : -1;

  let newPlayers = match.players.map(p => ({ ...p }));

  if (leg.finished && winnerIdx >= 0) {
    // Reverse the leg win
    if (newPlayers[winnerIdx].legsWon === 0) {
      // The set was awarded — reverse set win too
      newPlayers[winnerIdx].setsWon = Math.max(0, newPlayers[winnerIdx].setsWon - 1);
      newPlayers[winnerIdx].legsWon = match.legsToWin - 1;
    } else {
      newPlayers[winnerIdx].legsWon = Math.max(0, newPlayers[winnerIdx].legsWon - 1);
    }
  }

  const newRemaining = [...leg.remaining];
  const pidIdx = match.players.findIndex(p => p.id === lastTurn.pid);
  if (pidIdx >= 0) {
    newRemaining[pidIdx] = lastTurn.bust
      ? newRemaining[pidIdx]  // bust: remaining was not changed
      : lastTurn.remainingAfter + lastTurn.total;
  }

  // Recalculate remaining from scratch for accuracy
  const recalcRemaining = match.players.map(() => match.startScore);
  for (const t of newTurns) {
    const idx = match.players.findIndex(p => p.id === t.pid);
    if (idx >= 0 && !t.bust) {
      recalcRemaining[idx] -= t.total;
    }
  }

  const prevIdx = leg.finished
    ? match.players.findIndex(p => p.id === lastTurn.pid)
    : ((leg.activeIdx - 1) + match.players.length) % match.players.length;

  const newLeg: ActiveLeg = {
    ...leg,
    remaining: recalcRemaining,
    turns: newTurns,
    activeIdx: prevIdx,
    finished: false,
    winnerId: null,
  };

  return {
    ...match,
    players: newPlayers,
    currentLeg: newLeg,
    finished: false,
    winnerId: null,
  };
}

export function nextLeg(match: ActiveMatch): ActiveMatch {
  const finishedLeg = match.currentLeg;
  const newHistory = [...match.history, finishedLeg];

  const currentSetNumber = finishedLeg.setNumber;
  const currentLegNumber = finishedLeg.legNumber;

  // Did any player just win a set in the last applyTurn call?
  // We need to determine if we're starting a new set or continuing the same set
  // The set win is reflected in setsWon; find current leg number in current set
  // Count legs in current set from history
  const legsInCurrentSet = newHistory.filter(l => l.setNumber === currentSetNumber).length;
  const setWon = legsInCurrentSet > 0 && match.players.some(p => {
    const setLegsWon = newHistory
      .filter(l => l.setNumber === currentSetNumber && l.winnerId === p.id)
      .length;
    return setLegsWon >= match.legsToWin;
  });

  const newSetNumber = setWon ? currentSetNumber + 1 : currentSetNumber;
  const newLegNumber = setWon ? 1 : currentLegNumber + 1;
  const nextStarterIdx = (finishedLeg.starterIdx + 1) % match.players.length;

  const newLeg: ActiveLeg = {
    setNumber: newSetNumber,
    legNumber: newLegNumber,
    starterIdx: nextStarterIdx,
    activeIdx: nextStarterIdx,
    remaining: match.players.map(() => match.startScore),
    turns: [],
    finished: false,
    winnerId: null,
  };

  return {
    ...match,
    currentLeg: newLeg,
    history: newHistory,
  };
}

export function calcAvg(turns: ActiveTurn[], pid: string): number {
  const playerTurns = turns.filter(t => t.pid === pid && !t.bust);
  if (playerTurns.length === 0) return 0;
  const total = playerTurns.reduce((sum, t) => sum + t.total, 0);
  return total / playerTurns.length;
}
