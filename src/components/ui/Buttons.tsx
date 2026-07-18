import type { ReactNode, CSSProperties } from 'react';

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  full?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  ariaLabel?: string;
}

export function PrimaryBtn({ children, onClick, full, disabled, style, ariaLabel }: BtnProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        background: disabled ? 'rgb(var(--bg-input))' : 'rgb(var(--accent))',
        color: disabled ? 'rgb(var(--text-muted))' : 'rgb(var(--accent-text))',
        border: 0,
        borderRadius: 10,
        padding: '14px 24px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: 15,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: full ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'background .15s',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, onClick, full, style, ariaLabel }: BtnProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        background: 'rgb(var(--bg-input))',
        color: 'rgb(var(--text-primary))',
        border: '1px solid rgb(var(--border-default))',
        borderRadius: 10,
        padding: '14px 24px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 15,
        cursor: 'pointer',
        width: full ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, style, ariaLabel }: BtnProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        background: 'transparent',
        color: 'rgb(var(--text-secondary))',
        border: 0,
        padding: '8px 12px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

interface IconBtnProps {
  icon: ReactNode;
  onClick?: () => void;
  size?: number;
  style?: CSSProperties;
  ariaLabel?: string;
}

export function IconBtn({ icon, onClick, size = 40, style, ariaLabel }: IconBtnProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        border: '1px solid rgb(var(--border-default))',
        background: 'rgb(var(--bg-elevated))',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        padding: 0,
        ...style,
      }}
    >
      {icon}
    </button>
  );
}
