interface Props {
  on: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ on, onChange }: Props) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        border: 0,
        background: on ? 'rgb(var(--accent))' : 'rgb(var(--bg-input))',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background .15s',
        flexShrink: 0,
        padding: 0,
      }}
      aria-checked={on}
      role="switch"
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: on ? 'rgb(var(--accent-text))' : 'rgb(var(--text-secondary))',
          transition: 'left .15s ease',
        }}
      />
    </button>
  );
}
