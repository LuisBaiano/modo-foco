import { and, eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { habitLogs, habits } from '../../db/schema';
import { onHabitCompleted, type RewardResult } from '../gamification/gamificationRepository';

export type Frequency = 'daily' | 'weekly';

export type HabitWithTodayStatus = {
  id: number;
  name: string;
  frequency: Frequency;
  /** Se já foi marcado como feito hoje. */
  completedToday: boolean;
};

export type HabitHistoryDay = { date: string; completed: boolean };

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Lista todos os hábitos com o status de hoje, ordenados por data de criação. */
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

/** Exclui o hábito e todo o seu histórico de logs. */
export async function deleteHabit(habitId: number) {
  await db.delete(habitLogs).where(eq(habitLogs.habitId, habitId));
  await db.delete(habits).where(eq(habits.id, habitId));
}

/**
 * Alterna feito/não-feito hoje — insere o log do dia se ainda não existir,
 * senão inverte. XP e streak só são concedidos ao marcar como feito, nunca
 * ao desmarcar (evita o truque de marcar/desmarcar repetido pra farmar XP).
 */
export async function toggleHabitToday(habitId: number): Promise<RewardResult | null> {
  const today = todayISODate();
  const [existing] = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));

  let completedNow: boolean;
  if (existing) {
    completedNow = !existing.completed;
    await db.update(habitLogs).set({ completed: completedNow }).where(eq(habitLogs.id, existing.id));
  } else {
    completedNow = true;
    await db.insert(habitLogs).values({ habitId, date: today, completed: true });
  }

  return completedNow ? onHabitCompleted() : null;
}

/**
 * Histórico de consistência dos últimos N dias, incluindo os dias sem log
 * (marcados como não-feito) — é o que alimenta a grade de quadradinhos da
 * tela de detalhe.
 */
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
