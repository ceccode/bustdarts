import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check } from 'lucide-react';
import type { PlayerProfile } from '../../lib/types';
import { Avatar } from '../../components/Avatar';
import { PrimaryBtn } from '../../components/ui/Buttons';
import { colorFromName } from '../../lib/stats';

interface Props {
  players: PlayerProfile[];
  selected: string[];
  onToggle: (id: string) => void;
  onAddPlayer: (name: string) => void;
}

export function StepPlayers({ players, selected, onToggle, onAddPlayer }: Props) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    onAddPlayer(name);
    setNewName('');
    setShowForm(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: 'rgb(var(--text-secondary))' }}>
          {selected.length} {t('selectedCount')}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: 'rgb(var(--bg-input))',
            border: '1px solid rgb(var(--border-default))',
            borderRadius: 8,
            padding: '6px 12px',
            color: 'rgb(var(--text-primary))',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Plus size={14} />
          {t('addPlayer')}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={t('addPlayer')}
            style={{
              flex: 1,
              background: 'rgb(var(--bg-input))',
              border: '1px solid rgb(var(--border-default))',
              borderRadius: 8,
              padding: '10px 12px',
              color: 'rgb(var(--text-primary))',
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              outline: 'none',
            }}
          />
          <PrimaryBtn onClick={handleAdd} disabled={!newName.trim()}>
            OK
          </PrimaryBtn>
        </div>
      )}

      {players.length === 0 ? (
        <div style={{ color: 'rgb(var(--text-muted))', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
          {t('noPlayers')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.map(p => {
            const sel = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: sel ? 'rgba(57,255,20,0.08)' : 'rgb(var(--bg-elevated))',
                  border: sel
                    ? '1px solid rgba(57,255,20,0.4)'
                    : '1px solid rgb(var(--border-default))',
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all .15s',
                }}
              >
                <Avatar name={p.name} color={p.avatarColor || colorFromName(p.name)} active={sel} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: 'rgb(var(--text-primary))' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>
                    {p.stats.matchesPlayed} {p.stats.matchesPlayed === 1 ? 'match' : 'matches'}
                  </div>
                </div>
                {sel && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgb(var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="#0A0A0B" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
