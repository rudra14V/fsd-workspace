import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'playerTheme'; // 'dark' | 'light'

// Hook returns [isDark, toggleTheme]
export default function usePlayerTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v) return v === 'dark';
    } catch (e) {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    try {
      if (isDark) document.body.classList.add('player-dark');
      else document.body.classList.remove('player-dark');
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch (e) {
      // ignore (e.g., SSR)
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark(s => !s), []);

  return [isDark, toggleTheme];
}
