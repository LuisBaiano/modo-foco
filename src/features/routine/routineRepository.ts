import { and, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { routineItems, routineKmLogs } from '../../db/schema';

export type RoutineItem = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  trackKm: boolean;
  /** Km já somados hoje, só relevante quando `trackKm` é true. */
  todayKm: number;
};

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseDaysOfWeek(value: string): number[] {
  return value
    .split(',')
    .map(part => parseInt(part, 10))
    .filter(day => !Number.isNaN(day));
}

/** Lista os blocos de rotina com o km de hoje, ordenados por horário de início. */
export async function listRoutineItems(): Promise<RoutineItem[]> {
  const today = todayISODate();
  const rows = await db
    .select({
      id: routineItems.id,
      name: routineItems.name,
      startTime: routineItems.startTime,
      endTime: routineItems.endTime,
      daysOfWeek: routineItems.daysOfWeek,
      trackKm: routineItems.trackKm,
      km: routineKmLogs.km,
    })
    .from(routineItems)
    .leftJoin(routineKmLogs, and(eq(routineKmLogs.routineItemId, routineItems.id), eq(routineKmLogs.date, today)))
    .orderBy(routineItems.startTime);

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    startTime: row.startTime,
    endTime: row.endTime,
    daysOfWeek: parseDaysOfWeek(row.daysOfWeek),
    trackKm: row.trackKm,
    todayKm: row.km ?? 0,
  }));
}

export async function getRoutineItem(id: number) {
  const [row] = await db.select().from(routineItems).where(eq(routineItems.id, id));
  if (!row) {
    return undefined;
  }
  return { ...row, daysOfWeek: parseDaysOfWeek(row.daysOfWeek) };
}

export async function createRoutineItem(input: {
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  trackKm: boolean;
}) {
  await db.insert(routineItems).values({
    name: input.name,
    startTime: input.startTime,
    endTime: input.endTime,
    daysOfWeek: input.daysOfWeek.join(','),
    trackKm: input.trackKm,
    createdAt: new Date(),
  });
}

export async function updateRoutineItem(
  id: number,
  input: { name: string; startTime: string; endTime: string; daysOfWeek: number[]; trackKm: boolean },
) {
  await db
    .update(routineItems)
    .set({
      name: input.name,
      startTime: input.startTime,
      endTime: input.endTime,
      daysOfWeek: input.daysOfWeek.join(','),
      trackKm: input.trackKm,
    })
    .where(eq(routineItems.id, id));
}

/** Apaga o bloco de rotina e todo o histórico de km ligado a ele. */
export async function deleteRoutineItem(id: number) {
  await db.delete(routineKmLogs).where(eq(routineKmLogs.routineItemId, id));
  await db.delete(routineItems).where(eq(routineItems.id, id));
}

/** @returns quantos km já foram somados hoje pra esse item. */
export async function getTodayKm(routineItemId: number): Promise<number> {
  const [existing] = await db
    .select()
    .from(routineKmLogs)
    .where(and(eq(routineKmLogs.routineItemId, routineItemId), eq(routineKmLogs.date, todayISODate())));
  return existing?.km ?? 0;
}

/** Soma km no registro de hoje desse item, criando a linha se ainda não existir. */
export async function addKm(routineItemId: number, km: number): Promise<void> {
  const today = todayISODate();
  const [existing] = await db
    .select()
    .from(routineKmLogs)
    .where(and(eq(routineKmLogs.routineItemId, routineItemId), eq(routineKmLogs.date, today)));

  if (existing) {
    await db.update(routineKmLogs).set({ km: existing.km + km }).where(eq(routineKmLogs.id, existing.id));
  } else {
    await db.insert(routineKmLogs).values({ routineItemId, date: today, km });
  }
}
