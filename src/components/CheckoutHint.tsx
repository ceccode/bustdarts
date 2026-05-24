import { checkoutFor } from '../lib/checkouts';

interface Props {
  remaining: number;
  doubleOut: boolean;
}

export function CheckoutHint({ remaining, doubleOut }: Props) {
  const hint = checkoutFor(remaining, doubleOut);
  if (!hint) return null;

  return (
    <div
      style={{
        marginTop: 10,
        background: 'rgba(255,184,0,0.10)',
        border: '1px solid rgba(255,184,0,0.30)',
        borderRadius: 10,
        padding: '8px 14px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: 'rgb(var(--warning))',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        Checkout
      </div>
      <div
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: 14,
          color: 'rgb(var(--text-primary))',
        }}
      >
        {hint}
      </div>
    </div>
  );
}
