'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

// Apply theme to <html> without touching React state (used in callbacks)
function applyTheme(t) {
  if (t === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme]   = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored    = window.localStorage.getItem('theme');        // null if never set
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial   = stored ?? (systemDark ? 'dark' : 'light');

    // Apply & sync React state — but do NOT write to localStorage here.
    // We only write when the user explicitly clicks the toggle.
    applyTheme(initial);
    setTheme(initial);
    setMounted(true);

    // If the user has NO manual override stored, follow system preference changes
    // in real time (e.g. OS switches to dark at sunset).
    if (!stored) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onSystemChange = (e) => {
        // Only react if user still hasn't set a preference
        if (!window.localStorage.getItem('theme')) {
          const next = e.matches ? 'dark' : 'light';
          applyTheme(next);
          setTheme(next);
        }
      };
      mq.addEventListener('change', onSystemChange);
      return () => mq.removeEventListener('change', onSystemChange);
    }
  }, []);

  /**
   * toggleTheme — called by the button in Navbar.
   * Writes to localStorage so the choice persists across sessions
   * and overrides the system preference going forward.
   */
  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem('theme', next);
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
