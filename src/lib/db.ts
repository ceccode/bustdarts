import Dexie, { type EntityTable } from 'dexie';
import type { PlayerProfile, Match, AppSettings } from './types';

class BustDb extends Dexie {
  players!: EntityTable<PlayerProfile, 'id'>;
  matches!: EntityTable<Match, 'id'>;
  settings!: EntityTable<AppSettings & { id: string }, 'id'>;

  constructor() {
    super('bust-db');
    this.version(1).stores({
      players: 'id, name, createdAt',
      matches: 'id, endedAt',
      settings: 'id',
    });
  }
}

export const db = new BustDb();

export async function getSettings(): Promise<AppSettings> {
  const s = await db.settings.get('app-settings');
  return s ?? {
    language: 'it',
    theme: 'dark',
    inputMode: 'total',
    soundEnabled: false,
    hapticEnabled: true,
    showCheckoutHints: true,
  };
}

export async function saveSettings(s: AppSettings) {
  await db.settings.put({ ...s, id: 'app-settings' });
}
