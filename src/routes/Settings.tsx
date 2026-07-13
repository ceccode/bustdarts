import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { Screen } from '../components/ui/Layout';
import { TopBar, SectionLabel } from '../components/ui/Layout';
import { Toggle } from '../components/ui/Toggle';
import { Segmented } from '../components/ui/Segmented';
import { GhostBtn } from '../components/ui/Buttons';
import { useAppStore } from '../stores/app-store';
import { saveSettings, db } from '../lib/db';
import i18n from '../i18n';

export default function Settings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings, setSettings } = useAppStore();
  const [confirmReset, setConfirmReset] = useState(false);

  async function update(patch: Partial<typeof settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveSettings(next);

    if (patch.language) {
      i18n.changeLanguage(patch.language);
      localStorage.setItem('bust-lang', patch.language);
    }
    if (patch.theme) {
      document.documentElement.classList.toggle('theme-light', patch.theme === 'light');
    }
  }

  async function handleReset() {
    await db.matches.clear();
    await db.players.clear();
    setConfirmReset(false);
  }

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid rgb(var(--border-default))',
  };

  return (
    <Screen>
      <TopBar
        title={t('settings')}
        left={
          <GhostBtn onClick={() => navigate('/')} style={{ padding: '4px 0' }}>
            <ChevronLeft size={20} /> {t('back')}
          </GhostBtn>
        }
      />

      <SectionLabel>{t('language')}</SectionLabel>
      <Segmented
        options={[
          { value: 'it', label: '🇮🇹 Italiano' },
          { value: 'en', label: '🇬🇧 English' },
        ]}
        value={settings.language}
        onChange={v => update({ language: v as 'it' | 'en' })}
      />

      <SectionLabel>{t('theme')}</SectionLabel>
      <Segmented
        options={[
          { value: 'dark', label: t('themeDark') },
          { value: 'light', label: t('themeLight') },
        ]}
        value={settings.theme}
        onChange={v => update({ theme: v as 'dark' | 'light' })}
      />

      <SectionLabel>Game</SectionLabel>

      <div style={rowStyle}>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15 }}>{t('hints')}</div>
          <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>Mostra il percorso di checkout</div>
        </div>
        <Toggle
          on={settings.showCheckoutHints}
          onChange={v => update({ showCheckoutHints: v })}
        />
      </div>

      <div style={rowStyle}>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15 }}>{t('haptic')}</div>
          <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>Vibrazione ai tasti</div>
        </div>
        <Toggle
          on={settings.hapticEnabled}
          onChange={v => update({ hapticEnabled: v })}
        />
      </div>

      <div style={{ ...rowStyle, borderBottom: 'none' }}>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15 }}>{t('sound')}</div>
          <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>Effetti sonori</div>
        </div>
        <Toggle
          on={settings.soundEnabled}
          onChange={v => update({ soundEnabled: v })}
        />
      </div>

      <SectionLabel>Danger zone</SectionLabel>
      <button
        onClick={() => setConfirmReset(true)}
        style={{
          width: '100%',
          background: 'rgba(255,59,48,0.08)',
          border: '1px solid rgba(255,59,48,0.3)',
          borderRadius: 10,
          padding: '14px',
          color: 'rgb(var(--bust))',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        {t('reset')}
      </button>

      {/* Version */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 40,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: 'rgb(var(--text-muted))',
          letterSpacing: '0.04em',
        }}
      >
        {t('version', { version: __APP_VERSION__ })}
      </div>

      {/* Reset confirm modal */}
      {confirmReset && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 24,
          }}
        >
          <div
            style={{
              background: 'rgb(var(--bg-elevated))',
              border: '1px solid rgb(var(--border-default))',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 320,
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {t('reset')}
            </div>
            <div style={{ fontSize: 14, color: 'rgb(var(--text-secondary))', marginBottom: 20 }}>
              {t('resetConfirm')}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{ flex: 1, background: 'rgb(var(--bg-input))', border: '1px solid rgb(var(--border-default))', borderRadius: 10, padding: '12px', color: 'rgb(var(--text-primary))', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
              >
                {t('no')}
              </button>
              <button
                onClick={handleReset}
                style={{ flex: 1, background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.4)', borderRadius: 10, padding: '12px', color: 'rgb(var(--bust))', cursor: 'pointer', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
              >
                {t('yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
