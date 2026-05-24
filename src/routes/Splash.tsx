import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Splash() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding', { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0A0A0B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      {/* Logo */}
      <img
        src="/logo/bust-lockup-dark.svg"
        alt="Bust!"
        style={{
          height: 120,
          animation: 'flashIn 0.5s ease-out forwards',
        }}
        draggable={false}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: '#52525B',
          letterSpacing: '0.05em',
        }}
      >
        {t('version')}
      </div>
    </div>
  );
}
