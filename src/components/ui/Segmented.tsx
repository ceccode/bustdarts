interface Option<T> {
  value: T;
  label: string;
}

interface Props<T> {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string | number>({ options, value, onChange }: Props<T>) {
  return (
    <div
      style={{
        display: 'flex',
        background: 'rgb(var(--bg-input))',
        padding: 3,
        borderRadius: 10,
        gap: 2,
      }}
    >
      {options.map(o => {
        const sel = o.value === value;
        return (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              background: sel ? 'rgb(var(--bg-elevated))' : 'transparent',
              border: sel
                ? '1px solid rgb(var(--border-default))'
                : '1px solid transparent',
              color: sel ? 'rgb(var(--text-primary))' : 'rgb(var(--text-secondary))',
              borderRadius: 8,
              padding: '9px 8px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all .15s',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
