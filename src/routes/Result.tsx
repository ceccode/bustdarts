import { useMemo, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Share2, Trophy } from 'lucide-react';
import { useAppStore } from '../stores/app-store';
import { calcMatchStats } from '../lib/stats';
import { pickRoast } from '../data/roasts';
import { Avatar } from '../components/Avatar';
import { RoastCard } from '../components/RoastCard';
import { PrimaryBtn, SecondaryBtn, IconBtn } from '../components/ui/Buttons';
import { Screen } from '../components/ui/Layout';
import { TopBar } from '../components/ui/Layout';
import { newMatch } from '../lib/game-engine';

export default function Result() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { activeMatch, setActiveMatch } = useAppStore();

  const stats = useMemo(() => (activeMatch ? calcMatchStats(activeMatch) : null), [activeMatch]);

  const roastText = useMemo(() => {
    if (!activeMatch) return '';
    const allLegs = [...activeMatch.history, activeMatch.currentLeg];
    const busts = allLegs.flatMap(l => l.turns).filter(t => t.bust).length;
    const oneEighties = allLegs.flatMap(l => l.turns).filter(t => t.total === 180).length;
    let key = 'closebuilt';
    if (oneEighties >= 2) key = 'domination';
    else if (busts >= 5) key = 'bustking';
    else if (oneEighties >= 1) key = 'onehundred';
    return pickRoast(i18n.language, key);
  }, [activeMatch, i18n.language]);

  useEffect(() => {
    if (!activeMatch) navigate('/', { replace: true });
  }, [activeMatch, navigate]);

  if (!activeMatch) return null;

  const winner = activeMatch.players.find(p => p.id === activeMatch.winnerId);

  function handleRematch() {
    const config = {
      variant: activeMatch!.variant,
      setsToWin: activeMatch!.setsToWin,
      legsToWin: activeMatch!.legsToWin,
      doubleOut: activeMatch!.doubleOut,
      inputMode: activeMatch!.inputMode,
      players: activeMatch!.players.map(p => ({ id: p.id, name: p.name, color: p.color })),
    };
    const m = newMatch(config);
    setActiveMatch(m);
    navigate('/game');
  }

  function handleHome() {
    setActiveMatch(null);
    navigate('/');
  }

  function handleShare() {
    if (!activeMatch || !winner) return;
    const text = `BUST! · ${activeMatch.variant} · ${activeMatch.players.map(p => p.name).join(' vs ')} · Winner: ${winner.name}`;
    if (navigator.share) {
      navigator.share({ title: 'Bust! Result', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  return (
    <Screen style={{ padding: '16px 16px 120px' }}>
      <TopBar
        left={
          <button onClick={handleHome} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-secondary))', padding: 4 }}>
            <X size={22} />
          </button>
        }
        title={t('finishMatch')}
        right={
          <IconBtn icon={<Share2 size={16} color="rgb(var(--text-secondary))" />} onClick={handleShare} />
        }
      />

      {/* Winner card */}
      {winner && (
        <div
          style={{
            background: 'rgba(57,255,20,0.08)',
            border: '2px solid rgba(57,255,20,0.4)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            textAlign: 'center',
            boxShadow: '0 0 24px 4px rgba(57,255,20,0.12)',
            animation: 'flashIn 0.4s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Trophy size={18} color="rgb(var(--warning))" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgb(var(--text-muted))' }}>
              {t('winner')}
            </span>
          </div>
          <Avatar name={winner.name} color={winner.color} size={56} />
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 24, marginTop: 10 }}>
            {winner.name}
          </div>

          {/* Score breakdown */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
            {activeMatch.players.map((p, i) => (
              <Fragment key={p.id}>
                {i > 0 && (
                  <div style={{ color: 'rgb(var(--text-muted))', fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, lineHeight: 1 }}>·</div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: 36,
                    lineHeight: 1,
                    color: p.id === winner.id ? 'rgb(var(--accent))' : 'rgb(var(--text-primary))',
                  }}>
                    {activeMatch.setsToWin > 1 ? p.setsWon : (stats?.[p.id]?.legsWon ?? 0)}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600 }}>{p.name}</div>
                </div>
              </Fragment>
            ))}
          </div>

          {stats?.[winner.id] && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('avg')}</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: 'rgb(var(--accent))' }}>
                  {stats[winner.id].avg.toFixed(0)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('highOut')}</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28 }}>
                  {stats[winner.id].hiOut || '—'}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>180s</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28 }}>
                  {stats[winner.id].c180}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Roast */}
      <div style={{ marginBottom: 16 }}>
        <RoastCard text={roastText} label={t('roastLabel')} />
      </div>

      {/* Stats table */}
      {stats && (
        <div style={{ background: 'rgb(var(--bg-elevated))', border: '1px solid rgb(var(--border-default))', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `1fr ${activeMatch.players.map(() => '1fr').join(' ')}`,
              borderBottom: '1px solid rgb(var(--border-default))',
              padding: '10px 14px',
              background: 'rgb(var(--bg-input))',
            }}
          >
            <div />
            {activeMatch.players.map(p => (
              <div key={p.id} style={{ textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </div>
            ))}
          </div>

          {[
            { label: t('threeDart'), key: (id: string) => stats[id]?.avg.toFixed(1) ?? '—' },
            { label: t('firstNine'), key: (id: string) => stats[id]?.first9.toFixed(1) ?? '—' },
            { label: t('highOut'), key: (id: string) => stats[id]?.hiOut || '—' },
            { label: '100+', key: (id: string) => stats[id]?.c100 ?? 0 },
            { label: '140+', key: (id: string) => stats[id]?.c140 ?? 0 },
            { label: '180', key: (id: string) => stats[id]?.c180 ?? 0 },
            { label: 'Busts', key: (id: string) => stats[id]?.busts ?? 0 },
          ].map((row, ri) => (
            <div
              key={ri}
              style={{
                display: 'grid',
                gridTemplateColumns: `1fr ${activeMatch.players.map(() => '1fr').join(' ')}`,
                padding: '10px 14px',
                borderBottom: ri < 6 ? '1px solid rgb(var(--border-default))' : 'none',
              }}
            >
              <div style={{ fontSize: 12, color: 'rgb(var(--text-secondary))', fontWeight: 500 }}>{row.label}</div>
              {activeMatch.players.map(p => (
                <div key={p.id} style={{ textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14 }}>
                  {row.key(p.id)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Bottom actions */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          background: 'rgb(var(--bg-base))',
          borderTop: '1px solid rgb(var(--border-default))',
          display: 'flex',
          gap: 10,
        }}
      >
        <SecondaryBtn onClick={handleHome} style={{ flex: 1 }}>
          {t('home')}
        </SecondaryBtn>
        <PrimaryBtn onClick={handleRematch} style={{ flex: 1 }}>
          {t('rematch')}
        </PrimaryBtn>
      </div>
    </Screen>
  );
}
