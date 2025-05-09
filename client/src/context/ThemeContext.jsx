import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  // Check if user has saved a theme preference or use system preference
  const getInitialTheme = () => {
    // Check for 'theme' key (new format)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // For backwards compatibility, also check for 'darkMode' key (old format)
    const oldDarkMode = localStorage.getItem('darkMode');
    if (oldDarkMode !== null) {
      return oldDarkMode === 'true';
    }
    
    // Check system preference as fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme());

  // Apply theme to document and save to localStorage when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      // Also set in old format for backwards compatibility
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      // Also set in old format for backwards compatibility
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;