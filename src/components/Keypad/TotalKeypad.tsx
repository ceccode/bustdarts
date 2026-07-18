import { useState } from 'react';
import { CornerDownLeft, RotateCcw } from 'lucide-react';
import { validateTotal } from '../../lib/game-engine';
import { IMPOSSIBLE_TOTALS } from '../../lib/checkouts';
import { playTap } from '../../lib/sound';

interface Props {
  remaining: number;
  doubleOut: boolean;
  onConfirm: (total: number) => void;
  onUndo: () => void;
  hapticEnabled?: boolean;
  soundEnabled?: boolean;
}

const QUICK_SCORES = [26, 41, 45, 60, 81, 100, 140, 180];

function haptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

export function TotalKeypad({ remaining, doubleOut, onConfirm, onUndo, hapticEnabled, soundEnabled }: Props) {
  const [input, setInput] = useState('');

  const total = input === '' ? 0 : parseInt(input, 10);
  const hasInput = input.length > 0;

  const validation = hasInput ? validateTotal(remaining, total, doubleOut) : null;
  const isImpossible = hasInput && IMPOSSIBLE_TOTALS.has(total);
  const isBust = validation?.bust === true;
  const isCheckout = validation?.checkout === true;
  const isValid = validation?.ok === true && !isBust;

  const inputColor = !hasInput
    ? 'rgb(var(--text-primary))'
    : isImpossible || isBust
    ? 'rgb(var(--bust))'
    : isCheckout
    ? 'rgb(var(--accent))'
    : 'rgb(var(--text-primary))';

  function pressDigit(d: string) {
    if (hapticEnabled) haptic();
    if (soundEnabled) playTap();
    setInput(prev => {
      const next = prev + d;
      const val = parseInt(next, 10);
      if (val > 180) return prev;
      return next;
    });
  }

  function pressDelete() {
    if (hapticEnabled) haptic();
    if (soundEnabled) playTap();
    setInput(prev => prev.slice(0, -1));
  }

  function pressConfirm() {
    if (!hasInput) return;
    if (!isValid && !isBust) return;
    if (hapticEnabled) haptic();
    if (soundEnabled) playTap();
    onConfirm(total);
    setInput('');
  }

  function pressQuick(score: number) {
    if (hapticEnabled) haptic();
    if (soundEnabled) playTap();
    onConfirm(score);
    setInput('');
  }

  function pressUndo() {
    if (hapticEnabled) haptic();
    if (soundEnabled) playTap();
    onUndo();
    setInput('');
  }

  const keyStyle = {
    height: 56,
    borderRadius: 10,
    border: '1px solid rgb(var(--border-default))',
    background: 'rgb(var(--bg-input))',
    color: 'rgb(var(--text-primary))',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 700,
    fontSize: 24,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    touchAction: 'manipulation' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Quick scores */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {QUICK_SCORES.map(s => {
          const v = validateTotal(remaining, s, doubleOut);
          const qBust = v.bust;
          const qCheckout = v.checkout;
          const qOk = v.ok && !qBust;
          return (
            <button
              key={s}
              onClick={() => pressQuick(s)}
              style={{
                ...keyStyle,
                height: 36,
                fontSize: 13,
                fontWeight: 700,
                padding: '0 10px',
                flexShrink: 0,
                background: qCheckout
                  ? 'rgba(57,255,20,0.15)'
                  : qBust
                  ? 'rgba(255,59,48,0.10)'
                  : 'rgb(var(--bg-input))',
                border: qCheckout
                  ? '1px solid rgba(57,255,20,0.4)'
                  : qBust
                  ? '1px solid rgba(255,59,48,0.3)'
                  : '1px solid rgb(var(--border-default))',
                color: qCheckout
                  ? 'rgb(var(--accent))'
                  : qBust
                  ? 'rgb(var(--bust))'
                  : qOk
                  ? 'rgb(var(--text-primary))'
                  : 'rgb(var(--text-muted))',
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Score display */}
      <div
        style={{
          height: 56,
          background: 'rgb(var(--bg-input))',
          borderRadius: 10,
          border: `1px solid ${
            isBust || isImpossible
              ? 'rgba(255,59,48,0.4)'
              : isCheckout
              ? 'rgba(57,255,20,0.4)'
              : 'rgb(var(--border-default))'
          }`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 36,
          color: inputColor,
          letterSpacing: '0.04em',
          transition: 'border-color .15s, color .15s',
        }}
      >
        {hasInput ? total : '—'}
        {isBust && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              color: 'rgb(var(--bust))',
              marginLeft: 8,
              letterSpacing: '0.08em',
            }}
          >
            BUST
          </span>
        )}
      </div>

      {/* Numpad 1-9 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} onClick={() => pressDigit(String(n))} style={keyStyle}>
            {n}
          </button>
        ))}
      </div>

      {/* Bottom row: undo, 0, confirm */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <button
          onClick={pressDelete}
          onContextMenu={e => { e.preventDefault(); pressUndo(); }}
          aria-label="Delete"
          style={{
            ...keyStyle,
            fontSize: 14,
            color: 'rgb(var(--text-secondary))',
          }}
        >
          <RotateCcw size={20} />
        </button>
        <button onClick={() => pressDigit('0')} style={keyStyle}>
          0
        </button>
        <button
          onClick={pressConfirm}
          aria-label="Confirm"
          style={{
            ...keyStyle,
            background:
              hasInput && isValid
                ? 'rgb(var(--accent))'
                : hasInput && isBust
                ? 'rgba(255,59,48,0.20)'
                : 'rgb(var(--bg-input))',
            color:
              hasInput && isValid
                ? 'rgb(var(--accent-text))'
                : hasInput && isBust
                ? 'rgb(var(--bust))'
                : 'rgb(var(--text-muted))',
            border:
              hasInput && isBust
                ? '1px solid rgba(255,59,48,0.4)'
                : '1px solid rgb(var(--border-default))',
            transition: 'background .15s, color .15s',
          }}
        >
          {isBust ? (
            <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 700 }}>BUST</span>
          ) : (
            <CornerDownLeft size={22} />
          )}
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
