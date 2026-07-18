import { useState } from 'react';
import { CornerDownLeft, RotateCcw } from 'lucide-react';
import { validateTotal } from '../../lib/game-engine';
import { playTap } from '../../lib/sound';

interface Props {
  remaining: number;
  doubleOut: boolean;
  onConfirm: (total: number) => void;
  onUndo: () => void;
  hapticEnabled?: boolean;
  soundEnabled?: boolean;
}

type Multiplier = 1 | 2 | 3;

interface Dart {
  value: number;    // 0 = miss, 25 = bull, 50 = bullseye, 1-20 = number
  multiplier: Multiplier;
  display: string;
}

function haptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

function dartScore(d: Dart): number {
  return d.value * d.multiplier;
}

function dartLabel(d: Dart): string {
  if (d.value === 0) return 'Miss';
  if (d.value === 25) return d.multiplier === 2 ? 'Bull' : 'Bull·25';
  if (d.multiplier === 1) return `${d.value}`;
  if (d.multiplier === 2) return `D${d.value}`;
  return `T${d.value}`;
}

export function DetailedKeypad({ remaining, doubleOut, onConfirm, onUndo, hapticEnabled, soundEnabled }: Props) {
  const [darts, setDarts] = useState<Dart[]>([]);
  const [multiplier, setMultiplier] = useState<Multiplier>(1);

  const total = darts.reduce((s, d) => s + dartScore(d), 0);
  const dartsLeft = 3 - darts.length;
  const validation = darts.length > 0 ? validateTotal(remaining, total, doubleOut) : null;
  const isBust = validation?.bust === true;
  const isCheckout = validation?.checkout === true;

  function addDart(value: number) {
    if (hapticEnabled) haptic();
    if (soundEnabled) playTap();
    if (darts.length >= 3) return;
    const d: Dart = { value, multiplier, display: '' };
    d.display = dartLabel(d);
    const newDarts = [...darts, d];
    setDarts(newDarts);
    setMultiplier(1);

    // Auto confirm if 3 darts or checkout
    const newTotal = newDarts.reduce((s, x) => s + dartScore(x), 0);
    const v = validateTotal(remaining, newTotal, doubleOut);
    if (newDarts.length === 3 || v.checkout) {
      setTimeout(() => {
        onConfirm(newTotal);
        setDarts([]);
        setMultiplier(1);
      }, 150);
    }
  }

  function removeLast() {
    if (hapticEnabled) haptic();
    if (soundEnabled) playTap();
    setDarts(prev => prev.slice(0, -1));
  }

  function confirmManual() {
    if (hapticEnabled) haptic();
    if (soundEnabled) playTap();
    onConfirm(total);
    setDarts([]);
    setMultiplier(1);
  }

  function pressUndo() {
    if (hapticEnabled) haptic();
    if (soundEnabled) playTap();
    setDarts([]);
    setMultiplier(1);
    onUndo();
  }

  const keyStyle = {
    height: 44,
    borderRadius: 8,
    border: '1px solid rgb(var(--border-default))',
    background: 'rgb(var(--bg-input))',
    color: 'rgb(var(--text-primary))',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    touchAction: 'manipulation' as const,
  };

  const multActive = (m: Multiplier) => ({
    ...keyStyle,
    background: multiplier === m ? 'rgb(var(--accent))' : 'rgb(var(--bg-input))',
    color: multiplier === m ? 'rgb(var(--accent-text))' : 'rgb(var(--text-secondary))',
    border: multiplier === m
      ? '1px solid rgb(var(--accent))'
      : '1px solid rgb(var(--border-default))',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Dart strip */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => {
          const d = darts[i];
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                background: d ? 'rgb(var(--bg-elevated))' : 'rgb(var(--bg-input))',
                border: d
                  ? '1px solid rgb(var(--border-default))'
                  : '1px dashed rgb(var(--border-default))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                color: d
                  ? dartScore(d) === 0
                    ? 'rgb(var(--text-muted))'
                    : 'rgb(var(--text-primary))'
                  : 'rgb(var(--text-muted))',
              }}
            >
              {d ? dartLabel(d) : `D${i + 1}`}
            </div>
          );
        })}
      </div>

      {/* Total display */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 32,
          color: isBust
            ? 'rgb(var(--bust))'
            : isCheckout
            ? 'rgb(var(--accent))'
            : 'rgb(var(--text-primary))',
          letterSpacing: '0.04em',
        }}
      >
        {darts.length > 0 ? total : '—'}
        {isBust && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              marginLeft: 8,
            }}
          >
            BUST
          </span>
        )}
        {dartsLeft > 0 && darts.length > 0 && !isBust && !isCheckout && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: 'rgb(var(--text-muted))',
              marginLeft: 8,
            }}
          >
            {dartsLeft} left
          </span>
        )}
      </div>

      {/* Multiplier row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {([1, 2, 3] as Multiplier[]).map(m => (
          <button
            key={m}
            onClick={() => { if (hapticEnabled) haptic(); if (soundEnabled) playTap(); setMultiplier(m); }}
            style={multActive(m)}
          >
            {m === 1 ? 'Single' : m === 2 ? 'Double' : 'Triple'}
          </button>
        ))}
      </div>

      {/* Number grid 1-20 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
        {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => addDart(n)}
            disabled={darts.length >= 3}
            style={{
              ...keyStyle,
              height: 40,
              fontSize: 15,
              opacity: darts.length >= 3 ? 0.4 : 1,
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Special row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
        <button
          onClick={() => addDart(25)}
          disabled={darts.length >= 3}
          style={{
            ...keyStyle,
            height: 40,
            fontSize: 12,
            opacity: darts.length >= 3 ? 0.4 : 1,
          }}
        >
          Bull
        </button>
        <button
          onClick={() => { if (hapticEnabled) haptic(); if (soundEnabled) playTap(); if (darts.length < 3) { const prev = multiplier; setMultiplier(2); addDart(25); setMultiplier(prev); } }}
          disabled={darts.length >= 3}
          style={{
            ...keyStyle,
            height: 40,
            fontSize: 12,
            opacity: darts.length >= 3 ? 0.4 : 1,
          }}
        >
          Bulls
        </button>
        <button
          onClick={() => addDart(0)}
          disabled={darts.length >= 3}
          style={{
            ...keyStyle,
            height: 40,
            fontSize: 12,
            color: 'rgb(var(--text-muted))',
            opacity: darts.length >= 3 ? 0.4 : 1,
          }}
        >
          Miss
        </button>
        <button
          onClick={removeLast}
          aria-label="Delete"
          style={{
            ...keyStyle,
            height: 40,
            color: 'rgb(var(--text-secondary))',
          }}
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={confirmManual}
          disabled={darts.length === 0}
          aria-label="Confirm"
          style={{
            ...keyStyle,
            height: 40,
            background: darts.length > 0 && !isBust ? 'rgb(var(--accent))' : 'rgb(var(--bg-input))',
            color: darts.length > 0 && !isBust ? 'rgb(var(--accent-text))' : 'rgb(var(--text-muted))',
            opacity: darts.length === 0 ? 0.4 : 1,
          }}
        >
          <CornerDownLeft size={16} />
        </button>
      </div>

      {/* Undo last turn */}
      <button
        onClick={pressUndo}
        style={{
          background: 'transparent',
          border: '1px solid rgb(var(--border-default))',
          borderRadius: 10,
          padding: '10px',
          color: 'rgb(var(--text-secondary))',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <RotateCcw size={14} /> Undo turn
      </button>
    </div>
  );
}
