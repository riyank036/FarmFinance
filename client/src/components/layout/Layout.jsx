import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const Layout = ({ children }) => {
  const { darkMode } = useTheme();
  const { currentLanguage } = useLanguage();
  
  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`} lang={currentLanguage}>
      <Navbar />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 