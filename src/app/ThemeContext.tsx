import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  type ColorSchemePreference,
  getAccentColor,
  getColorScheme,
  setAccentColor,
  setColorScheme as persistColorScheme,
} from '../features/settings/settingsRepository';

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

export type ResolvedScheme = 'light' | 'dark';

/** Paleta semântica consumida pelas telas — troca inteira conforme o tema resolvido. */
export type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  icon: string;
  border: string;
  danger: string;
  dangerBg: string;
  success: string;
  successBg: string;
};

const LIGHT_PALETTE: Palette = {
  background: '#f7f7fb',
  surface: '#ffffff',
  surfaceAlt: '#f3f4f6',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  icon: '#374151',
  border: '#d1d5db',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  success: '#10b981',
  successBg: '#ecfdf5',
};

/** Preto puro no fundo — em telas AMOLED os pixels pretos ficam desligados, economiza bateria de verdade. */
const DARK_PALETTE: Palette = {
  background: '#000000',
  surface: '#121212',
  surfaceAlt: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  icon: '#e5e7eb',
  border: '#3f3f46',
  danger: '#f87171',
  dangerBg: '#450a0a',
  success: '#34d399',
  successBg: '#064e3b',
};

type ThemeContextValue = {
  /** Cor de destaque atual, em hex. */
  accent: string;
  /** Atualiza a cor de destaque; persiste no banco com debounce. */
  setAccent: (color: string) => void;
  /** Preferência salva: 'light' | 'dark' | segue o sistema. */
  colorScheme: ColorSchemePreference;
  /** Atualiza a preferência de tema; persiste no banco. */
  setColorScheme: (scheme: ColorSchemePreference) => void;
  /** Tema efetivamente em uso — já resolve 'system' pro claro/escuro real do aparelho. */
  resolvedScheme: ResolvedScheme;
  /** Paleta semântica do tema resolvido. Use sempre isso em vez de hex fixo nas telas. */
  colors: Palette;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Provedor de tema do app. Carrega cor e preferência salvas do banco e as disponibiliza via useTheme(). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<string>(DEFAULT_ACCENT);
  const [colorScheme, setColorSchemeState] = useState<ColorSchemePreference>('system');
  const saveAccentTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const systemScheme = useColorScheme();

  useEffect(() => {
    getAccentColor().then(color => {
      if (color) {
        setAccentState(color);
      }
    });
    getColorScheme().then(scheme => {
      if (scheme) {
        setColorSchemeState(scheme);
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
    if (saveAccentTimeout.current) {
      clearTimeout(saveAccentTimeout.current);
    }
    saveAccentTimeout.current = setTimeout(() => {
      setAccentColor(color);
    }, 300);
  }, []);

  const setColorScheme = useCallback((scheme: ColorSchemePreference) => {
    setColorSchemeState(scheme);
    persistColorScheme(scheme);
  }, []);

  const resolvedScheme: ResolvedScheme =
    colorScheme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : colorScheme;
  const colors = resolvedScheme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;

  const value = useMemo(
    () => ({ accent, setAccent, colorScheme, setColorScheme, resolvedScheme, colors }),
    [accent, setAccent, colorScheme, setColorScheme, resolvedScheme, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Hook de acesso ao tema atual. Precisa estar dentro de um ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
