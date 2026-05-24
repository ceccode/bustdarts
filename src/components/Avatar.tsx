import { colorFromName } from '../lib/stats';

interface Props {
  name: string;
  size?: number;
  color?: string;
  active?: boolean;
}

export function Avatar({ name, size = 36, color, active = false }: Props) {
  const bg = color || colorFromName(name);
  const initials = name
    .split(' ')
    .map(s => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#0A0A0B',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: size * 0.42,
        flexShrink: 0,
        boxShadow: active ? '0 0 0 3px rgb(var(--accent))' : 'none',
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
}
