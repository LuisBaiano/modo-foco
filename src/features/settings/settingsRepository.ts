import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { appSettings } from '../../db/schema';

export type ColorSchemePreference = 'light' | 'dark' | 'system';

/** app_settings é uma tabela de linha única — sempre id fixo, sem múltiplos usuários. */
const SETTINGS_ROW_ID = 1;

/** @returns a cor de destaque salva, ou null se nunca foi definida. */
export async function getAccentColor(): Promise<string | null> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ROW_ID));
  return row?.accentColor ?? null;
}

/** Salva a cor de destaque, criando a linha de configurações se ainda não existir. */
export async function setAccentColor(color: string): Promise<void> {
  const [existing] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ROW_ID));
  if (existing) {
    await db.update(appSettings).set({ accentColor: color }).where(eq(appSettings.id, SETTINGS_ROW_ID));
  } else {
    await db.insert(appSettings).values({ id: SETTINGS_ROW_ID, accentColor: color });
  }
}

/** @returns a preferência de tema salva, ou null se nunca foi definida (cai no padrão 'system'). */
export async function getColorScheme(): Promise<ColorSchemePreference | null> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ROW_ID));
  return (row?.colorScheme as ColorSchemePreference | null) ?? null;
}

/** Salva a preferência de tema, criando a linha de configurações se ainda não existir. */
export async function setColorScheme(scheme: ColorSchemePreference): Promise<void> {
  const [existing] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ROW_ID));
  if (existing) {
    await db.update(appSettings).set({ colorScheme: scheme }).where(eq(appSettings.id, SETTINGS_ROW_ID));
  } else {
    await db.insert(appSettings).values({ id: SETTINGS_ROW_ID, accentColor: '#7c3aed', colorScheme: scheme });
  }
}
