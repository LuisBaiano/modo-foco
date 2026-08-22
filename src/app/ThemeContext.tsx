import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getAccentColor, setAccentColor } from '../features/settings/settingsRepository';

/** Paleta de cores de destaque pré-definidas, oferecidas na tela de Perfil. */
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
  /** Cor de destaque atual, em hex. */
  accent: string;
  /** Atualiza a cor de destaque; persiste no banco com debounce. */
  setAccent: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Provedor de tema do app. Carrega a cor salva do banco e a disponibiliza via useTheme(). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<string>(DEFAULT_ACCENT);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getAccentColor().then(color => {
      if (color) {
        setAccentState(color);
      }
    });
  }, []);

  /**
   * Atualiza o estado imediatamente (pro preview ao vivo do seletor de cor)
   * mas grava no banco com debounce de 300ms — arrastar o seletor dispara
   * essa função a cada pixel de movimento, e sem o debounce cada chamada
   * viraria uma escrita no SQLite.
   */
  const setAccent = useCallback((color: string) => {
    setAccentState(color);
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      setAccentColor(color);
    }, 300);
  }, []);

  return <ThemeContext.Provider value={{ accent, setAccent }}>{children}</ThemeContext.Provider>;
}

/** Hook de acesso ao tema atual. Precisa estar dentro de um ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
