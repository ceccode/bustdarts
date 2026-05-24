import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Trophy } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Screen } from '../components/ui/Layout';
import { TopBar } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { GhostBtn } from '../components/ui/Buttons';
import { db } from '../lib/db';
import type { Match } from '../lib/types';

export default function History() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const matches = useLiveQuery<Match[]>(
    () => db.matches.orderBy('endedAt').reverse().toArray(),
    []
  );

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <Screen>
      <TopBar
        title={t('history')}
        left={
          <GhostBtn onClick={() => navigate('/')} style={{ padding: '4px 0' }}>
            <ChevronLeft size={20} /> {t('back')}
          </GhostBtn>
        }
      />

      {!matches || matches.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: 'rgb(var(--text-muted))',
            fontSize: 15,
            padding: '60px 0',
          }}
        >
          {t('noHistory')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {matches.map(m => {
            const winner = m.players.find(p => p.profileId === m.winnerId);
            const legs = m.legs.length;
            return (
              <Card key={m.id} style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        background: 'rgb(var(--bg-input))',
                        borderRadius: 6,
                        padding: '3px 10px',
                        fontFamily: 'Bebas Neue, sans-serif',
                        fontSize: 20,
                        color: 'rgb(var(--accent))',
                      }}
                    >
                      {m.variant}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15 }}>
                        {m.players.map(p => p.name).join(' vs ')}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>
                        {formatDate(m.endedAt)} · {formatTime(m.endedAt)}
                      </div>
                    </div>
                  </div>
                  {winner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <Trophy size={14} color="rgb(var(--warning))" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'rgb(var(--text-primary))' }}>
                        {winner.name}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Legs</div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20 }}>{legs}</div>
                  </div>
                  {m.players.map(p => (
                    <div key={p.profileId}>
                      <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.name}</div>
                      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20 }}>
                        {p.setsWon}S·{p.legsWon}L
                      </div>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mode</div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20 }}>
                      {m.doubleOut ? 'DO' : 'SO'}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
