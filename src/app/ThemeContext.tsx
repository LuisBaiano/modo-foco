import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getAccentColor, setAccentColor } from '../features/settings/settingsRepository';

export const ACCENT_PRESETS = [
  { name: 'Violeta', value: '#7c3aed' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Esmeralda', value: '#059669' },
  { name: 'Laranja', value: '#ea580c' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Turquesa', value: '#0891b2' },
] as const;

const DEFAULT_ACCENT = ACCENT_PRESETS[0].value;

type ThemeContextValue = {
  accent: string;
  setAccent: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<string>(DEFAULT_ACCENT);

  useEffect(() => {
    getAccentColor().then(color => {
      if (color) {
        setAccentState(color);
      }
    });
  }, []);

  const setAccent = useCallback((color: string) => {
    setAccentState(color);
    setAccentColor(color);
  }, []);

  return <ThemeContext.Provider value={{ accent, setAccent }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
