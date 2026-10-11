import { desc, eq, gte } from 'drizzle-orm';
import { db } from '../../db/client';
import { mealLogs, moodLogs, waterLogs, workoutLogs } from '../../db/schema';
import { onHealthLogWithoutXp, onWorkoutLogged, type RewardResult } from '../gamification/gamificationRepository';

export type WorkoutType = 'walk' | 'strength' | 'cycling' | 'yoga' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type WeekSummary = {
  workoutMinutes: number;
  workoutCount: number;
  waterGlasses: number;
  averageMood: number | null;
};

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISODate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function logWorkout(
  input: { type: WorkoutType; durationMinutes: number; notes: string | null },
): Promise<RewardResult> {
  await db.insert(workoutLogs).values({
    type: input.type,
    durationMinutes: input.durationMinutes,
    notes: input.notes,
    date: todayISODate(),
  });
  return onWorkoutLogged();
}

export async function logMeal(input: { type: MealType; notes: string | null }) {
  await db.insert(mealLogs).values({ type: input.type, notes: input.notes, date: todayISODate() });
}

/**
 * Soma +1 copo na água de hoje, criando o registro do dia se ainda não
 * existir. O tamanho do copo em ml é configurável (ver settingsRepository) —
 * aqui só conta unidades. Não concede XP (água não é pontuada, só
 * acompanhada), mas ainda dispara o check de conquistas — é o que destrava
 * "hidratação perfeita" (baseada em copos, não em ml).
 */
export async function addWaterGlass(): Promise<RewardResult> {
  const today = todayISODate();
  const [existing] = await db.select().from(waterLogs).where(eq(waterLogs.date, today));
  if (existing) {
    await db.update(waterLogs).set({ glasses: existing.glasses + 1 }).where(eq(waterLogs.id, existing.id));
  } else {
    await db.insert(waterLogs).values({ date: today, glasses: 1 });
  }
  return onHealthLogWithoutXp();
}

export async function getTodayWaterGlasses(): Promise<number> {
  const [existing] = await db.select().from(waterLogs).where(eq(waterLogs.date, todayISODate()));
  return existing?.glasses ?? 0;
}

/** Define o humor de hoje — atualiza o registro do dia se já existir, senão cria. */
export async function setTodayMood(level: number) {
  const today = todayISODate();
  const [existing] = await db.select().from(moodLogs).where(eq(moodLogs.date, today));
  if (existing) {
    await db.update(moodLogs).set({ level }).where(eq(moodLogs.id, existing.id));
  } else {
    await db.insert(moodLogs).values({ date: today, level });
  }
}

export async function getTodayMood(): Promise<number | null> {
  const [existing] = await db.select().from(moodLogs).where(eq(moodLogs.date, todayISODate()));
  return existing?.level ?? null;
}

export async function getRecentWorkouts(limit = 5) {
  return db.select().from(workoutLogs).orderBy(desc(workoutLogs.id)).limit(limit);
}

export async function getRecentMeals(limit = 5) {
  return db.select().from(mealLogs).orderBy(desc(mealLogs.id)).limit(limit);
}

/** Resumo dos últimos 7 dias (hoje incluso) pro card de estatísticas semanais. */
export async function getWeekSummary(): Promise<WeekSummary> {
  const weekStart = daysAgoISODate(6);

  const workouts = await db.select().from(workoutLogs).where(gte(workoutLogs.date, weekStart));
  const water = await db.select().from(waterLogs).where(gte(waterLogs.date, weekStart));
  const moods = await db.select().from(moodLogs).where(gte(moodLogs.date, weekStart));

  const workoutMinutes = workouts.reduce((total, w) => total + w.durationMinutes, 0);
  const waterGlasses = water.reduce((total, w) => total + w.glasses, 0);
  const averageMood = moods.length > 0 ? moods.reduce((total, m) => total + m.level, 0) / moods.length : null;

  return { workoutMinutes, workoutCount: workouts.length, waterGlasses, averageMood };
}
