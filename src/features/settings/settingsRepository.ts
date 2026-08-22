import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { appSettings } from '../../db/schema';

const SETTINGS_ROW_ID = 1;

export async function getAccentColor(): Promise<string | null> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ROW_ID));
  return row?.accentColor ?? null;
}

export async function setAccentColor(color: string): Promise<void> {
  const [existing] = await db.select().from(appSettings).where(eq(appSettings.id, SETTINGS_ROW_ID));
  if (existing) {
    await db.update(appSettings).set({ accentColor: color }).where(eq(appSettings.id, SETTINGS_ROW_ID));
  } else {
    await db.insert(appSettings).values({ id: SETTINGS_ROW_ID, accentColor: color });
  }
}
