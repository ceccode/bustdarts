import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './locales/it.json';
import en from './locales/en.json';

const savedLang = localStorage.getItem('bust-lang');
const browserLang = navigator.language?.slice(0, 2);
const defaultLng = (savedLang || browserLang || 'it') as 'it' | 'en';
const lng = ['it', 'en'].includes(defaultLng) ? defaultLng : 'it';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
      en: { translation: en },
    },
    lng,
    fallbackLng: 'it',
    interpolation: { escapeValue: false },
  });

export default i18next;
