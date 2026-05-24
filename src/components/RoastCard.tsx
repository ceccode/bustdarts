import { Flame } from 'lucide-react';

interface Props {
  text: string;
  label?: string;
}

export function RoastCard({ text, label = 'Roast' }: Props) {
  return (
    <div
      style={{
        background: 'rgb(var(--bg-elevated))',
        borderLeft: '4px solid rgb(var(--accent))',
        borderRadius: 10,
        padding: '16px 18px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ marginTop: 2, color: 'rgb(var(--accent))' }}>
        <Flame size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            color: 'rgb(var(--text-muted))',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
