import { createContext, useState, useEffect, useContext } from 'react';
import { changeLanguage } from '../i18n/i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('farmFinance_language') || 'en'
  );

  const handleChangeLanguage = (language) => {
    changeLanguage(language);
    setCurrentLanguage(language);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage: handleChangeLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;