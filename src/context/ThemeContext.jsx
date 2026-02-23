import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { applyTheme } from '../styles/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('budget-theme') || 'dark';
  });

  useEffect(() => {
    applyTheme(theme);
    document.body.style.background = theme === 'light' ? '#FAFAFA' : '#000000';
    document.body.style.color = theme === 'light' ? '#111111' : '#FFFFFF';
    document.body.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('budget-theme', next);
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
