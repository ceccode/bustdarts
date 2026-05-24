import type { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, style, onClick, className }: Props) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'rgb(var(--bg-elevated))',
        border: '1px solid rgb(var(--border-default))',
        borderRadius: 14,
        padding: 16,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
