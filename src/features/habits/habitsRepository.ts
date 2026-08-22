import { and, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { habitLogs, habits } from '../../db/schema';

export type Frequency = 'daily' | 'weekly';

export type HabitWithTodayStatus = {
  id: number;
  name: string;
  frequency: Frequency;
  completedToday: boolean;
};

export type HabitHistoryDay = { date: string; completed: boolean };

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listHabitsWithTodayStatus(): Promise<HabitWithTodayStatus[]> {
  const today = todayISODate();
  const rows = await db
    .select({
      id: habits.id,
      name: habits.name,
      frequency: habits.frequency,
      completed: habitLogs.completed,
    })
    .from(habits)
    .leftJoin(habitLogs, and(eq(habitLogs.habitId, habits.id), eq(habitLogs.date, today)))
    .orderBy(habits.createdAt);

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    frequency: row.frequency as Frequency,
    completedToday: row.completed === true,
  }));
}

export async function getHabit(habitId: number) {
  const [habit] = await db.select().from(habits).where(eq(habits.id, habitId));
  return habit;
}

export async function createHabit(input: { name: string; frequency: Frequency }) {
  await db.insert(habits).values({
    name: input.name,
    frequency: input.frequency,
    createdAt: new Date(),
  });
}

export async function updateHabit(habitId: number, input: { name: string; frequency: Frequency }) {
  await db.update(habits).set({ name: input.name, frequency: input.frequency }).where(eq(habits.id, habitId));
}

export async function deleteHabit(habitId: number) {
  await db.delete(habitLogs).where(eq(habitLogs.habitId, habitId));
  await db.delete(habits).where(eq(habits.id, habitId));
}

export async function toggleHabitToday(habitId: number) {
  const today = todayISODate();
  const [existing] = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));

  if (existing) {
    await db.update(habitLogs).set({ completed: !existing.completed }).where(eq(habitLogs.id, existing.id));
  } else {
    await db.insert(habitLogs).values({ habitId, date: today, completed: true });
  }
}

export async function getHabitHistory(habitId: number, days = 30): Promise<HabitHistoryDay[]> {
  const logs = await db.select().from(habitLogs).where(eq(habitLogs.habitId, habitId));
  const logsByDate = new Map(logs.map(log => [log.date, log.completed]));

  const result: HabitHistoryDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const iso = date.toISOString().slice(0, 10);
    result.push({ date: iso, completed: logsByDate.get(iso) ?? false });
  }
  return result;
}
