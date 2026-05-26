import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeModeContext = createContext({
  mode: 'light',
  setMode: () => {},
  toggleMode: () => {},
});

const getSystemMode = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialMode = () => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('themeMode');
  if (saved === 'light' || saved === 'dark') return saved;
  return getSystemMode();
};

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'themeMode' && (event.newValue === 'light' || event.newValue === 'dark')) {
        setMode(event.newValue);
      }
    };

    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handleSystemChange = (event) => {
      if (!localStorage.getItem('themeMode')) {
        setMode(event.matches ? 'dark' : 'light');
      }
    };

    window.addEventListener('storage', handleStorage);
    mediaQuery?.addEventListener?.('change', handleSystemChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      mediaQuery?.removeEventListener?.('change', handleSystemChange);
    };
  }, []);

  const value = useMemo(() => ({
    mode,
    setMode,
    toggleMode: () => setMode((current) => (current === 'light' ? 'dark' : 'light')),
  }), [mode]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
