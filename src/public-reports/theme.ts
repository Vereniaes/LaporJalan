/* Todo:
-> dark mode for the map page (owner, 11 Nov): follows the device at first; the header button sets light or dark and is remembered
    -> scoped to /peta: the page root gets .lj-theme-dark, so the landing and /akun keep their light design
    -> maps read the theme from ThemeContext (light by default, so the landing map and /akun stay light)
*/
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'lj-theme';
const QUERY = '(prefers-color-scheme: dark)';

// storage can be blocked (private mode, previews): the page still works, the choice is just not remembered
function readChoice(): Theme | null {
  try { const value = localStorage.getItem(KEY); return value === 'light' || value === 'dark' ? value : null; } catch { return null; }
}
function writeChoice(value: Theme) {
  try { localStorage.setItem(KEY, value); } catch { /* not remembered */ }
}
const systemDark = () => typeof matchMedia === 'function' && matchMedia(QUERY).matches;
function subscribeSystem(callback: () => void) {
  if (typeof matchMedia !== 'function') return () => undefined;
  const media = matchMedia(QUERY);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

// input param : none
// output      : the theme in use, and a toggle that sets the opposite explicitly
export function useThemeChoice() {
  const [choice, setChoice] = useState<Theme | null>(readChoice);
  const dark = useSyncExternalStore(subscribeSystem, systemDark, () => false);
  const theme: Theme = choice ?? (dark ? 'dark' : 'light');
  // another tab changed it
  useEffect(() => {
    const onStorage = (event: StorageEvent) => { if (event.key === KEY) setChoice(readChoice()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const toggle = () => { const next: Theme = theme === 'dark' ? 'light' : 'dark'; writeChoice(next); setChoice(next); };
  return { theme, toggle };
}

export const ThemeContext = createContext<Theme>('light');
export const useTheme = () => useContext(ThemeContext);
