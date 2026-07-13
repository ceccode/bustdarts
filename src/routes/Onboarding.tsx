import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BustBadge, BustLogo } from '../components/BustLogo';
import { Segmented } from '../components/ui/Segmented';
import { PrimaryBtn } from '../components/ui/Buttons';
import { useAppStore } from '../stores/app-store';
import { saveSettings } from '../lib/db';
import i18n from '../i18n';

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings, setSettings } = useAppStore();
  const [lang, setLangState] = useState<'it' | 'en'>(settings.language);

  async function handleStart() {
    const newSettings = { ...settings, language: lang };
    setSettings(newSettings);
    await saveSettings(newSettings);
    i18n.changeLanguage(lang);
    localStorage.setItem('bust-lang', lang);
    localStorage.setItem('bust-launched', '1');
    navigate('/', { replace: true });
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'rgb(var(--bg-base))',
        color: 'rgb(var(--text-primary))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        boxSizing: 'border-box',
        gap: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 340, width: '100%' }}>
        <BustBadge size={68} />
        <BustLogo size={56} withTagline />

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            color: 'rgb(var(--text-secondary))',
            textAlign: 'center',
            lineHeight: 1.6,
            margin: '8px 0 24px',
          }}
        >
          {t('onboardingText')}
        </p>

        <div style={{ width: '100%' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgb(var(--text-muted))',
              marginBottom: 8,
            }}
          >
            {t('language')}
          </div>
          <Segmented
            options={[
              { value: 'it', label: '🇮🇹 Italiano' },
              { value: 'en', label: '🇬🇧 English' },
            ]}
            value={lang}
            onChange={v => {
              setLangState(v);
              i18n.changeLanguage(v);
            }}
          />
        </div>

        <PrimaryBtn full onClick={handleStart} style={{ marginTop: 8 }}>
          {t('letUsStart')}
        </PrimaryBtn>

        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: 'rgb(var(--text-muted))',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          {t('version', { version: __APP_VERSION__ })}
        </div>
      </div>
    </div>
  );
}
