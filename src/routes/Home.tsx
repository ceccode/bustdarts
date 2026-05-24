import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings, PlayCircle, ChevronRight, Trophy, Clock } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BustBadge, BustLogo } from '../components/BustLogo';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/ui/Card';
import { IconBtn, GhostBtn } from '../components/ui/Buttons';
import { SectionLabel } from '../components/ui/Layout';
import { db } from '../lib/db';
import { Screen } from '../components/ui/Layout';
import type { PlayerProfile, Match } from '../lib/types';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const players = useLiveQuery<PlayerProfile[]>(() => db.players.orderBy('createdAt').toArray(), []);
  const recentMatches = useLiveQuery<Match[]>(
    () => db.matches.orderBy('endedAt').reverse().limit(3).toArray(),
    []
  );

  const lastMatch = recentMatches?.[0];

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return (
    <Screen style={{ padding: '20px 16px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BustBadge size={36} />
          <BustLogo size={36} />
        </div>
        <IconBtn
          icon={<Settings size={18} color="rgb(var(--text-secondary))" />}
          onClick={() => navigate('/settings')}
        />
      </div>

      {/* Main CTA */}
      <button
        onClick={() => navigate('/setup')}
        style={{
          width: '100%',
          background: 'rgb(var(--accent))',
          border: 0,
          borderRadius: 16,
          padding: '20px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 8,
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(10,10,11,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            501 · best of 3
          </div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 22, color: '#0A0A0B', letterSpacing: '-0.01em' }}>
            {t('newMatch')}
          </div>
        </div>
        <PlayCircle size={40} color="#0A0A0B" strokeWidth={1.5} />
      </button>

      {/* Quick rematch */}
      {lastMatch && (
        <GhostBtn
          onClick={() => navigate('/setup')}
          style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
        >
          <Clock size={14} />
          {t('quickStart')}
        </GhostBtn>
      )}

      {/* Players */}
      <SectionLabel
        right={
          <GhostBtn onClick={() => navigate('/setup')} style={{ padding: '0 0 0 8px', fontSize: 12 }}>
            {t('addPlayer')} +
          </GhostBtn>
        }
      >
        {t('players')}
      </SectionLabel>

      {!players || players.length === 0 ? (
        <div style={{ color: 'rgb(var(--text-muted))', fontSize: 14, padding: '12px 0' }}>
          {t('noPlayers')}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {players.map(p => (
            <Card
              key={p.id}
              onClick={() => navigate(`/player/${p.id}`)}
              style={{ padding: 14 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Avatar name={p.name} color={p.avatarColor} size={32} />
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('avg')}</div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'rgb(var(--accent))' }}>
                    {p.stats.avgThreeDart.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('winRate')}</div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'rgb(var(--text-primary))' }}>
                    {p.stats.matchesPlayed > 0
                      ? Math.round((p.stats.matchesWon / p.stats.matchesPlayed) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* History */}
      <SectionLabel
        right={
          <GhostBtn onClick={() => navigate('/history')} style={{ padding: '0 0 0 8px', fontSize: 12 }}>
            {t('allMatches')} <ChevronRight size={12} />
          </GhostBtn>
        }
      >
        {t('history')}
      </SectionLabel>

      {!recentMatches || recentMatches.length === 0 ? (
        <div style={{ color: 'rgb(var(--text-muted))', fontSize: 14, padding: '12px 0' }}>
          {t('noHistory')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentMatches.map(m => {
            const winner = m.players.find(p => p.profileId === m.winnerId);
            return (
              <Card key={m.id} style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: 'rgb(var(--bg-input))', borderRadius: 6, padding: '2px 8px', fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, color: 'rgb(var(--accent))' }}>
                      {m.variant}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14 }}>
                        {m.players.map(p => p.name).join(' vs ')}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>{formatDate(m.endedAt)}</div>
                    </div>
                  </div>
                  {winner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Trophy size={14} color="rgb(var(--warning))" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'rgb(var(--text-secondary))' }}>
                        {winner.name}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
