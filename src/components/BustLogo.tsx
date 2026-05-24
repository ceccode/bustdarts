import type { CSSProperties } from 'react';
import { useAppStore } from '../stores/app-store';

interface LogoProps {
  size?: number;
  withTagline?: boolean;
}

export function BustLogo({ size = 40, withTagline }: LogoProps) {
  const theme = useAppStore(s => s.theme);
  const variant = theme === 'light' ? 'light' : 'dark';
  const src = withTagline
    ? `/logo/bust-lockup-${variant}.svg`
    : `/logo/bust-wordmark-${variant}.svg`;

  return (
    <img
      src={src}
      alt="Bust!"
      style={{ display: 'block', height: size, width: 'auto', flexShrink: 0 }}
      draggable={false}
    />
  );
}

export function BustBadge({ size = 36 }: { size?: number }) {
  const inner = size * 0.62;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: '#0A0A0B',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 60 60" width={inner} height={inner}>
        <text
          x="11"
          y="44"
          style={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial',
            fontWeight: 900,
            fontSize: 42,
            fill: '#FAFAFA',
          } as CSSProperties}
        >
          b
        </text>
        <rect x="40" y="18" width="6" height="20" fill="rgb(var(--accent))" />
        <circle cx="43" cy="45" r="3.5" fill="rgb(var(--accent))" />
      </svg>
    </div>
  );
}
