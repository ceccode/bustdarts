export interface PlayerStats {
  matchesPlayed: number;
  matchesWon: number;
  legsWon: number;
  legsPlayed: number;
  avgThreeDart: number;
  avgFirstNine: number;
  bestLeg: number | null;
  bestCheckout: number | null;
  count100plus: number;
  count140plus: number;
  count180: number;
  doublesHit: number;
  doublesAttempted: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: number;
  stats: PlayerStats;
}

export interface TurnRecord {
  playerId: string;
  totalScored: number;
  bust: boolean;
  remainingAfter: number;
  isCheckout: boolean;
}

export interface LegRecord {
  setNumber: number;
  legNumber: number;
  winnerId: string;
  turns: TurnRecord[];
}

export interface MatchPlayer {
  profileId: string;
  name: string;
  setsWon: number;
  legsWon: number;
}

export interface Match {
  id: string;
  startedAt: number;
  endedAt: number;
  gameType: 'X01';
  variant: 301 | 501 | 701;
  setsToWin: number;
  legsToWin: number;
  doubleOut: boolean;
  inputMode: 'total' | 'detailed';
  players: MatchPlayer[];
  winnerId: string;
  legs: LegRecord[];
}

export interface AppSettings {
  language: 'it' | 'en';
  theme: 'dark' | 'light';
  inputMode: 'total' | 'detailed';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  showCheckoutHints: boolean;
}

export interface ActiveTurn {
  pid: string;
  total: number;
  raw: number;
  bust: boolean;
  remainingAfter: number;
  isCheckout: boolean;
}

export interface ActiveLeg {
  setNumber: number;
  legNumber: number;
  starterIdx: number;
  activeIdx: number;
  remaining: number[];
  turns: ActiveTurn[];
  finished: boolean;
  winnerId: string | null;
}

export interface ActivePlayer {
  id: string;
  name: string;
  color: string;
  setsWon: number;
  legsWon: number;
}

export interface ActiveMatch {
  id: string;
  variant: 301 | 501 | 701;
  startScore: number;
  setsToWin: number;
  legsToWin: number;
  doubleOut: boolean;
  inputMode: 'total' | 'detailed';
  players: ActivePlayer[];
  currentLeg: ActiveLeg;
  history: ActiveLeg[];
  finished: boolean;
  winnerId: string | null;
}

export interface MatchConfig {
  variant: 301 | 501 | 701;
  setsToWin: number;
  legsToWin: number;
  doubleOut: boolean;
  inputMode: 'total' | 'detailed';
  players: { id: string; name: string; color: string }[];
}
