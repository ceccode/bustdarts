import type { ActiveMatch, ActiveTurn } from './types';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD166', '#A78BFA',
  '#FB923C', '#22D3EE', '#F472B6', '#84CC16',
];

export function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface PlayerMatchStats {
  avg: number;
  first9: number;
  hiOut: number;
  c100: number;
  c140: number;
  c180: number;
  busts: number;
  legsWon: number;
  dartsThrown: number;
}

export function calcMatchStats(match: ActiveMatch): Record<string, PlayerMatchStats> {
  const result: Record<string, PlayerMatchStats> = {};

  for (const player of match.players) {
    result[player.id] = {
      avg: 0,
      first9: 0,
      hiOut: 0,
      c100: 0,
      c140: 0,
      c180: 0,
      busts: 0,
      legsWon: player.setsWon * match.legsToWin + player.legsWon,
      dartsThrown: 0,
    };
  }

  const allLegs = [...match.history, match.currentLeg];

  for (const leg of allLegs) {
    // Group turns by player
    const turnsByPlayer: Record<string, ActiveTurn[]> = {};
    for (const t of leg.turns) {
      if (!turnsByPlayer[t.pid]) turnsByPlayer[t.pid] = [];
      turnsByPlayer[t.pid].push(t);
    }

    for (const [pid, turns] of Object.entries(turnsByPlayer)) {
      const stats = result[pid];
      if (!stats) continue;

      const validTurns = turns.filter(t => !t.bust);
      const busts = turns.filter(t => t.bust).length;
      stats.busts += busts;
      stats.dartsThrown += turns.length * 3;

      for (const t of validTurns) {
        if (t.total >= 180) stats.c180++;
        else if (t.total >= 140) stats.c140++;
        else if (t.total >= 100) stats.c100++;
        if (t.isCheckout && t.total > stats.hiOut) {
          stats.hiOut = t.total;
        }
      }

      // First 9 darts average (first 3 turns)
      const first3 = validTurns.slice(0, 3);
      if (first3.length > 0) {
        const f9sum = first3.reduce((s, t) => s + t.total, 0);
        stats.first9 = Math.max(stats.first9, f9sum / first3.length);
      }
    }
  }

  // Calculate overall avg across all legs
  for (const player of match.players) {
    const pid = player.id;
    const allTurns = allLegs.flatMap(l => l.turns.filter(t => t.pid === pid && !t.bust));
    if (allTurns.length > 0) {
      result[pid].avg = allTurns.reduce((s, t) => s + t.total, 0) / allTurns.length;
    }
  }

  return result;
}
