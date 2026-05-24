import type { ReactNode, CSSProperties } from 'react';

export function Screen({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'rgb(var(--bg-base))',
        color: 'rgb(var(--text-primary))',
        fontFamily: 'Inter, sans-serif',
        padding: '52px 16px 40px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface TopBarProps {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
}

export function TopBar({ title, left, right }: TopBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 16,
        minHeight: 36,
      }}
    >
      <div style={{ width: 64, display: 'flex' }}>{left}</div>
      {title && (
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
      )}
      <div style={{ width: 64, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        margin: '24px 0 10px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgb(var(--text-muted))',
        }}
      >
        {children}
      </div>
      {right}
    </div>
  );
}
