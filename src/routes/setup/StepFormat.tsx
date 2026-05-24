import { useTranslation } from 'react-i18next';
import { Segmented } from '../../components/ui/Segmented';
import { Toggle } from '../../components/ui/Toggle';

interface Props {
  variant: 301 | 501 | 701;
  setVariant: (v: 301 | 501 | 701) => void;
  setsToWin: number;
  setSetsToWin: (v: number) => void;
  legsToWin: number;
  setLegsToWin: (v: number) => void;
  doubleOut: boolean;
  setDoubleOut: (v: boolean) => void;
  inputMode: 'total' | 'detailed';
  setInputMode: (v: 'total' | 'detailed') => void;
}

export function StepFormat({
  variant, setVariant,
  setsToWin, setSetsToWin,
  legsToWin, setLegsToWin,
  doubleOut, setDoubleOut,
  inputMode, setInputMode,
}: Props) {
  const { t } = useTranslation();

  const labelStyle = {
    fontSize: 11,
    fontWeight: 600 as const,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'rgb(var(--text-muted))',
    marginBottom: 8,
    marginTop: 20,
    display: 'block',
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid rgb(var(--border-default))',
  };

  return (
    <div>
      <span style={labelStyle}>{t('variant')}</span>
      <Segmented
        options={[
          { value: 301, label: '301' },
          { value: 501, label: '501' },
          { value: 701, label: '701' },
        ]}
        value={variant}
        onChange={v => setVariant(v as 301 | 501 | 701)}
      />

      <span style={labelStyle}>{t('sets')}</span>
      <Segmented
        options={[
          { value: 1, label: '1' },
          { value: 2, label: '3' },
          { value: 3, label: '5' },
        ]}
        value={setsToWin}
        onChange={setSetsToWin}
      />

      <span style={labelStyle}>{t('legs')}</span>
      <Segmented
        options={[
          { value: 1, label: '1' },
          { value: 2, label: '3' },
          { value: 3, label: '5' },
        ]}
        value={legsToWin}
        onChange={setLegsToWin}
      />

      <div style={rowStyle}>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15 }}>{t('doubleOut')}</div>
          <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>Termina su un doppio</div>
        </div>
        <Toggle on={doubleOut} onChange={setDoubleOut} />
      </div>

      <div style={{ ...rowStyle, borderBottom: 'none' }}>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15 }}>{t('inputDetailed')}</div>
          <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>Singolo · Doppio · Triplo</div>
        </div>
        <Toggle on={inputMode === 'detailed'} onChange={v => setInputMode(v ? 'detailed' : 'total')} />
      </div>
    </div>
  );
}
