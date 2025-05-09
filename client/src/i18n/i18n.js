import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './translations/en.json';
import translationHI from './translations/hi.json';
import translationGU from './translations/gu.json';

// Get stored language or default to 'en'
const storedLanguage = localStorage.getItem('farmFinance_language') || 'en';

// Resources for i18next
const resources = {
  en: {
    translation: translationEN
  },
  hi: {
    translation: translationHI
  },
  gu: {
    translation: translationGU
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    lng: storedLanguage, // Use stored language as initial language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // React already escapes values by default
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'farmFinance_language',
      caches: ['localStorage']
    }
  });

// Function to change language and update localStorage
export const changeLanguage = (language) => {
  localStorage.setItem('farmFinance_language', language);
  i18n.changeLanguage(language);
};

export default i18n; 