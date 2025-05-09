import { FaTractor } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white py-6 mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FaTractor className="h-6 w-6 text-primary-400" />
            <span className="ml-2 font-semibold text-lg">FarmFinance</span>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>&copy; {currentYear} {t('footer.copyright')}</p>
            <p className="mt-1">{t('footer.tagline')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 