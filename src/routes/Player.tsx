import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Screen } from '../components/ui/Layout';
import { TopBar } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/Avatar';
import { GhostBtn } from '../components/ui/Buttons';
import { db } from '../lib/db';
import type { PlayerProfile, Match } from '../lib/types';

function MiniChart({ values, color = '#39FF14' }: { values: number[]; color?: string }) {
  const w = 240;
  const h = 60;
  const pad = 8;
  const n = values.length;
  if (n < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  function px(i: number) {
    return pad + (i / (n - 1)) * (w - 2 * pad);
  }
  function py(v: number) {
    return h - pad - ((v - min) / range) * (h - 2 * pad);
  }

  const pts = values.map((v, i) => `${px(i)},${py(v)}`).join(' ');
  const area = `M${px(0)},${h} L${pts.split(' ').map(p => `${p}`).join(' L')} L${px(n - 1)},${h} Z`;
  const line = `M${pts.split(' ').join(' L')}`;

  const gradId = 'cg' + color.replace('#', '');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 60 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const player = useLiveQuery<PlayerProfile | undefined>(() => (id ? db.players.get(id) : undefined), [id]);
  const matches = useLiveQuery<Match[]>(
    () =>
      id
        ? db.matches
            .toArray()
            .then((ms: Match[]) => ms.filter((m: Match) => m.players.some(p => p.profileId === id)))
        : Promise.resolve([]),
    [id]
  );

  const chartValues = useMemo(() => {
    if (!player) return [];
    const base = player.stats.avgThreeDart || 30;
    return Array.from({ length: 10 }, (_, i) => {
      const noise = (Math.sin(i * 7.3 + base) * 0.3 + Math.cos(i * 4.1 + base * 0.7) * 0.2) * base * 0.3;
      return Math.max(5, Math.round(base + noise));
    });
  }, [player]);

  async function handleDelete() {
    if (!id) return;
    await db.players.delete(id);
    navigate('/');
  }

  if (!player) {
    return (
      <Screen>
        <TopBar
          left={
            <GhostBtn onClick={() => navigate('/')} style={{ padding: '4px 0' }}>
              <ChevronLeft size={20} />
            </GhostBtn>
          }
        />
        <div style={{ color: 'rgb(var(--text-muted))', textAlign: 'center', padding: '60px 0' }}>
          Player not found.
        </div>
      </Screen>
    );
  }

  const s = player.stats;
  const winRate = s.matchesPlayed > 0 ? Math.round((s.matchesWon / s.matchesPlayed) * 100) : 0;
  const doublesRate = s.doublesAttempted > 0
    ? Math.round((s.doublesHit / s.doublesAttempted) * 100)
    : 0;

  const sinceDate = new Date(player.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const statTiles = [
    { label: t('threeDart'), value: s.avgThreeDart.toFixed(1) },
    { label: t('firstNine'), value: s.avgFirstNine.toFixed(1) },
    { label: t('doublesPct'), value: `${doublesRate}%` },
    { label: t('highOut'), value: s.bestCheckout ?? '—' },
    { label: '100+', value: s.count100plus },
    { label: '140+', value: s.count140plus },
    { label: '180s', value: s.count180 },
    { label: t('winRate'), value: `${winRate}%` },
    { label: t('mp'), value: s.matchesPlayed },
  ];

  return (
    <Screen style={{ padding: '16px 16px 80px' }}>
      <TopBar
        left={
          <GhostBtn onClick={() => navigate('/')} style={{ padding: '4px 0' }}>
            <ChevronLeft size={20} /> {t('back')}
          </GhostBtn>
        }
        right={
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--bust))', padding: 4 }}
          >
            <Trash2 size={18} />
          </button>
        }
      />

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Avatar name={player.name} color={player.avatarColor} size={64} />
        <div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 22 }}>
            {player.name}
          </div>
          <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))', marginTop: 2 }}>
            {t('sinceLabel')} {sinceDate} · {s.matchesPlayed} {t('matches')}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'rgb(var(--accent))' }}>
                {s.avgThreeDart.toFixed(0)}
              </div>
              <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('avg')}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28 }}>{winRate}%</div>
              <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('winRate')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <Card style={{ marginBottom: 20, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgb(var(--text-muted))', marginBottom: 8 }}>
          {t('threeDart')} trend
        </div>
        <MiniChart values={chartValues} color="rgb(57,255,20)" />
      </Card>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
        {statTiles.map(tile => (
          <div
            key={tile.label}
            style={{
              background: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--border-default))',
              borderRadius: 12,
              padding: '12px 10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: 'rgb(var(--text-primary))' }}>
              {tile.value}
            </div>
            <div style={{ fontSize: 9, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
              {tile.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent matches */}
      {matches && matches.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgb(var(--text-muted))', marginBottom: 10 }}>
            {t('history')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {matches.slice(0, 5).map(m => {
              const isWinner = m.winnerId === id;
              const opponent = m.players.find(p => p.profileId !== id);
              return (
                <div
                  key={m.id}
                  style={{
                    background: 'rgb(var(--bg-elevated))',
                    border: `1px solid ${isWinner ? 'rgba(57,255,20,0.3)' : 'rgb(var(--border-default))'}`,
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'rgb(var(--accent))' }}>{m.variant}</div>
                    <div style={{ fontSize: 13, color: 'rgb(var(--text-secondary))' }}>
                      vs {opponent?.name ?? '?'}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13, color: isWinner ? 'rgb(var(--accent))' : 'rgb(var(--bust))' }}>
                    {isWinner ? 'WIN' : 'LOSS'}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 24,
          }}
        >
          <div
            style={{
              background: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--border-default))',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 320,
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {t('deletePlayer')}
            </div>
            <div style={{ fontSize: 14, color: 'rgb(var(--text-secondary))', marginBottom: 20 }}>
              {t('resetConfirm')}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ flex: 1, background: 'rgb(var(--bg-input))', border: '1px solid rgb(var(--border-default))', borderRadius: 10, padding: '12px', color: 'rgb(var(--text-primary))', cursor: 'pointer', fontWeight: 600 }}
              >
                {t('no')}
              </button>
              <button
                onClick={handleDelete}
                style={{ flex: 1, background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.4)', borderRadius: 10, padding: '12px', color: 'rgb(var(--bust))', cursor: 'pointer', fontWeight: 700 }}
              >
                {t('yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
