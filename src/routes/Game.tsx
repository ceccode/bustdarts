import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, RotateCcw } from 'lucide-react';
import { useAppStore } from '../stores/app-store';
import { applyTurn, undoLast, nextLeg, validateTotal } from '../lib/game-engine';
import { TotalKeypad } from '../components/Keypad/TotalKeypad';
import { DetailedKeypad } from '../components/Keypad/DetailedKeypad';
import { CheckoutHint } from '../components/CheckoutHint';
import { Avatar } from '../components/Avatar';
import { PrimaryBtn, SecondaryBtn, GhostBtn } from '../components/ui/Buttons';
import { db } from '../lib/db';
import { playBust, play180, playCheckout } from '../lib/sound';
import type { Match, LegRecord, TurnRecord, MatchPlayer } from '../lib/types';

type Overlay = 'none' | 'bust' | '180' | 'legWon' | 'pause';

export default function Game() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeMatch, setActiveMatch, settings } = useAppStore();
  const [overlay, setOverlay] = useState<Overlay>('none');
  const [lastTotal, setLastTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!activeMatch) {
      navigate('/', { replace: true });
    }
  }, [activeMatch, navigate]);

  if (!activeMatch) return null;

  const leg = activeMatch.currentLeg;
  const activePlayer = activeMatch.players[leg.activeIdx];
  const activeRemaining = leg.remaining[leg.activeIdx] ?? 0;

  function handleTurn(total: number) {
    if (!activeMatch) return;
    const v = validateTotal(activeRemaining, total, activeMatch.doubleOut);

    setLastTotal(total);

    if (v.bust) {
      setOverlay('bust');
      if (settings.soundEnabled) playBust();
      const updated = applyTurn(activeMatch, total);
      if (updated) setActiveMatch(updated);
      setTimeout(() => setOverlay('none'), 1200);
      return;
    }

    if (total === 180) {
      setOverlay('180');
      if (settings.soundEnabled) play180();
      setTimeout(() => setOverlay('none'), 900);
    }

    const updated = applyTurn(activeMatch, total);
    if (!updated) return;
    setActiveMatch(updated);

    if (updated.currentLeg.finished) {
      setOverlay('legWon');
      if (settings.soundEnabled) playCheckout();
      if (updated.finished) {
        saveMatch(updated).catch(console.error).finally(() => navigate('/result'));
      }
    }
  }

  function handleUndo() {
    if (!activeMatch) return;
    const updated = undoLast(activeMatch);
    setActiveMatch(updated);
    setLastTotal(null);
  }

  function handleNextLeg() {
    if (!activeMatch || activeMatch.finished) return;
    const updated = nextLeg(activeMatch);
    setActiveMatch(updated);
    setOverlay('none');
    setLastTotal(null);
  }

  async function saveMatch(match: NonNullable<typeof activeMatch>) {
    const legs: LegRecord[] = [...match.history, match.currentLeg].map(l => ({
      setNumber: l.setNumber,
      legNumber: l.legNumber,
      winnerId: l.winnerId ?? '',
      turns: l.turns.map(t => ({
        playerId: t.pid,
        totalScored: t.total,
        bust: t.bust,
        remainingAfter: t.remainingAfter,
        isCheckout: t.isCheckout,
      } as TurnRecord)),
    }));

    const matchPlayers: MatchPlayer[] = match.players.map(p => ({
      profileId: p.id,
      name: p.name,
      setsWon: p.setsWon,
      legsWon: p.legsWon,
    }));

    const record: Match = {
      id: match.id,
      startedAt: Date.now() - 60000,
      endedAt: Date.now(),
      gameType: 'X01',
      variant: match.variant,
      setsToWin: match.setsToWin,
      legsToWin: match.legsToWin,
      doubleOut: match.doubleOut,
      inputMode: match.inputMode,
      players: matchPlayers,
      winnerId: match.winnerId ?? '',
      legs,
    };

    await db.matches.add(record);

    // Update player stats
    for (const p of match.players) {
      const profile = await db.players.get(p.id);
      if (!profile) continue;
      const allTurns = [...match.history, match.currentLeg]
        .flatMap(l => l.turns.filter(t => t.pid === p.id));
      const validTurns = allTurns.filter(t => !t.bust);
      const totalScored = validTurns.reduce((s, t) => s + t.total, 0);
      const newAvg = validTurns.length > 0
        ? (profile.stats.avgThreeDart * profile.stats.matchesPlayed + totalScored / Math.max(validTurns.length, 1)) / (profile.stats.matchesPlayed + 1)
        : profile.stats.avgThreeDart;

      const checkouts = validTurns.filter(t => t.isCheckout);
      const hiOut = checkouts.reduce((m, t) => Math.max(m, t.total), profile.stats.bestCheckout ?? 0);

      await db.players.update(p.id, {
        stats: {
          ...profile.stats,
          matchesPlayed: profile.stats.matchesPlayed + 1,
          matchesWon: match.winnerId === p.id ? profile.stats.matchesWon + 1 : profile.stats.matchesWon,
          avgThreeDart: Math.round(newAvg * 10) / 10,
          count180: profile.stats.count180 + validTurns.filter(t => t.total === 180).length,
          count140plus: profile.stats.count140plus + validTurns.filter(t => t.total >= 140 && t.total < 180).length,
          count100plus: profile.stats.count100plus + validTurns.filter(t => t.total >= 100 && t.total < 140).length,
          bestCheckout: hiOut > 0 ? hiOut : profile.stats.bestCheckout,
        },
      });
    }
  }

  const setLabel = `S${leg.setNumber} L${leg.legNumber}`;
  const hapticEnabled = settings.hapticEnabled;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'rgb(var(--bg-base))',
        color: 'rgb(var(--text-primary))',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px 16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* TopBar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button
          onClick={() => setOverlay('pause')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-secondary))', padding: 4 }}
        >
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgb(var(--bg-input))', borderRadius: 6, padding: '3px 10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13 }}>
            {setLabel}
          </div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'rgb(var(--accent))', letterSpacing: '0.04em' }}>
            {activeMatch.variant}
          </div>
        </div>
        <GhostBtn onClick={handleUndo} style={{ padding: '4px 0' }}>
          <RotateCcw size={16} />
        </GhostBtn>
      </div>

      {/* Player strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {activeMatch.players.map((p, i) => {
          const isActive = i === leg.activeIdx && !leg.finished;
          const rem = leg.remaining[i];
          return (
            <div
              key={p.id}
              style={{
                flex: 1,
                background: isActive ? 'rgba(57,255,20,0.08)' : 'rgb(var(--bg-elevated))',
                border: isActive ? '1px solid rgba(57,255,20,0.4)' : '1px solid rgb(var(--border-default))',
                borderRadius: 12,
                padding: '10px 12px',
                minWidth: 80,
                boxShadow: isActive ? '0 0 12px 2px rgba(57,255,20,0.15)' : 'none',
                transition: 'all .2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Avatar name={p.name} color={p.color} size={24} active={isActive} />
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {p.name}
                </div>
              </div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-primary))', lineHeight: 1 }}>
                {rem}
              </div>
              <div style={{ fontSize: 10, color: 'rgb(var(--text-muted))', marginTop: 2 }}>
                {p.setsWon}S · {p.legsWon}L
              </div>
            </div>
          );
        })}
      </div>

      {/* Active player center */}
      {activePlayer && !leg.finished && (
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            {t('turnOf')} {activePlayer.name}
          </div>
          <div
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 96,
              color: 'rgb(var(--accent))',
              lineHeight: 1,
              letterSpacing: '0.02em',
            }}
          >
            {activeRemaining}
          </div>
          <div style={{ fontSize: 11, color: 'rgb(var(--text-muted))', fontWeight: 500, marginTop: 2 }}>
            {t('remaining')}
          </div>
          {settings.showCheckoutHints && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CheckoutHint remaining={activeRemaining} doubleOut={activeMatch.doubleOut} />
            </div>
          )}
          {lastTotal !== null && !settings.showCheckoutHints && (
            <div style={{ marginTop: 8, fontSize: 13, color: 'rgb(var(--text-secondary))' }}>
              {t('last')}: <span style={{ fontWeight: 700 }}>{lastTotal}</span>
            </div>
          )}
        </div>
      )}

      {/* Keypad */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!leg.finished && (
          activeMatch.inputMode === 'detailed' ? (
            <DetailedKeypad
              remaining={activeRemaining}
              doubleOut={activeMatch.doubleOut}
              onConfirm={handleTurn}
              onUndo={handleUndo}
              hapticEnabled={hapticEnabled}
              soundEnabled={settings.soundEnabled}
            />
          ) : (
            <TotalKeypad
              remaining={activeRemaining}
              doubleOut={activeMatch.doubleOut}
              onConfirm={handleTurn}
              onUndo={handleUndo}
              hapticEnabled={hapticEnabled}
              soundEnabled={settings.soundEnabled}
            />
          )
        )}
      </div>

      {/* BUST overlay */}
      {overlay === 'bust' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 100,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            style={{
              fontFamily: '"Arial Black", sans-serif',
              fontWeight: 900,
              fontSize: 72,
              color: 'rgb(var(--bust))',
              animation: 'bustShake 0.5s ease-in-out, flashIn 0.3s ease-out',
            }}
          >
            BUST!
          </div>
          <div style={{ fontSize: 14, color: 'rgb(var(--text-secondary))', marginTop: 8 }}>
            {t('bustSub')}
          </div>
        </div>
      )}

      {/* 180 overlay */}
      {overlay === '180' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 100,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 100,
              color: 'rgb(var(--accent))',
              animation: 'flashIn 0.4s ease-out',
            }}
          >
            180
          </div>
          <div style={{ fontSize: 13, color: 'rgb(var(--text-muted))', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {t('oneEighty')}
          </div>
        </div>
      )}

      {/* Leg won overlay */}
      {overlay === 'legWon' && !activeMatch.finished && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 100,
            padding: '0 16px 32px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              background: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--border-default))',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              textAlign: 'center',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {activeMatch.players.find(p => p.id === leg.winnerId)?.name} {t('finishLeg')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
              {activeMatch.players.map(p => (
                <div key={p.id} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: 'rgb(var(--accent))' }}>{p.setsWon}–{p.legsWon}</div>
                </div>
              ))}
            </div>
            <PrimaryBtn full onClick={handleNextLeg}>{t('nextLeg')}</PrimaryBtn>
          </div>
        </div>
      )}

      {/* Pause menu */}
      {overlay === 'pause' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 100,
            padding: '0 16px 32px',
          }}
        >
          <div
            style={{
              background: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--border-default))',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18 }}>{t('paused')}</div>
              <button onClick={() => setOverlay('none')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-secondary))', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SecondaryBtn full onClick={() => setOverlay('none')}>
                {t('resume')}
              </SecondaryBtn>
              <GhostBtn
                onClick={() => {
                  setActiveMatch(null);
                  navigate('/');
                }}
                style={{ width: '100%', justifyContent: 'center', color: 'rgb(var(--bust))' }}
              >
                {t('abandon')}
              </GhostBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
