'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // Initial state doesn't matter much as we fix it on mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Read from storage
    const stored = window.localStorage.getItem('theme');
    // 2. Read from system
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 3. Set correct theme without overriding storage
    const initialTheme = stored ? stored : (systemDark ? 'dark' : 'light');
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Only save to localStorage after user explicitly changes it (or mount finalizes)
    window.localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
