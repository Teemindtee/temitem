import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import en from '../locales/en.json';
import pidgin from '../locales/pidgin.json';
import yo from '../locales/yo.json';
import ha from '../locales/ha.json';
import ig from '../locales/ig.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import es from '../locales/es.json';
import pt from '../locales/pt.json';
import ar from '../locales/ar.json';

const resources = {
  en: { translation: en },
  pidgin: { translation: pidgin },
  yo: { translation: yo },
  ha: { translation: ha },
  ig: { translation: ig },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
  pt: { translation: pt },
  ar: { translation: ar },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;