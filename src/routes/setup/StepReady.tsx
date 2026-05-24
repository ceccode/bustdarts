import { useTranslation } from 'react-i18next';
import { Shuffle } from 'lucide-react';
import type { PlayerProfile } from '../../lib/types';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/ui/Card';
import { GhostBtn } from '../../components/ui/Buttons';
import { colorFromName } from '../../lib/stats';

interface Props {
  variant: 301 | 501 | 701;
  setsToWin: number;
  legsToWin: number;
  doubleOut: boolean;
  inputMode: 'total' | 'detailed';
  players: PlayerProfile[];
  order: string[];
  onShuffle: () => void;
}

export function StepReady({ variant, setsToWin, legsToWin, doubleOut, inputMode, players, order, onShuffle }: Props) {
  const { t } = useTranslation();

  const orderedPlayers = order
    .map(id => players.find(p => p.id === id))
    .filter(Boolean) as PlayerProfile[];

  return (
    <div>
      {/* Summary card */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{t('variant')}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'rgb(var(--accent))' }}>{variant}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{t('sets')}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28 }}>{setsToWin === 1 ? '1' : setsToWin === 2 ? 'Bo3' : 'Bo5'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{t('legs')}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28 }}>{legsToWin === 1 ? '1' : legsToWin === 2 ? 'Bo3' : 'Bo5'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Double Out</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28 }}>{doubleOut ? 'ON' : 'OFF'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Input</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28 }}>{inputMode === 'detailed' ? 'Detail' : 'Total'}</div>
          </div>
        </div>
      </Card>

      {/* Player order */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgb(var(--text-muted))' }}>
          {t('order')}
        </div>
        <GhostBtn onClick={onShuffle} style={{ padding: '4px 8px', fontSize: 13 }}>
          <Shuffle size={14} />
          {t('shuffle')}
        </GhostBtn>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {orderedPlayers.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--border-default))',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: i === 0 ? 'rgb(var(--accent))' : 'rgb(var(--bg-input))',
                color: i === 0 ? 'rgb(var(--accent-text))' : 'rgb(var(--text-muted))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <Avatar name={p.name} color={p.avatarColor || colorFromName(p.name)} size={32} />
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15 }}>
              {p.name}
            </div>
            {i === 0 && (
              <div
                style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgb(var(--accent))',
                }}
              >
                First throw
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
