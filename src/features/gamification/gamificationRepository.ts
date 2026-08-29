import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { achievements, userXp } from '../../db/schema';
import { ACHIEVEMENTS } from './achievementsCatalog';
import type { Priority } from '../tasks/tasksRepository';
import { rescheduleStreakReminder } from '../notifications/streakReminder';

export type UnlockedAchievement = { key: string; title: string; description: string };
export type RewardResult = { xpGained: number; achievements: UnlockedAchievement[]; streakBroken: boolean };

const XP_HABIT = 10;
const XP_MINUTE_STUDIED = 1;
const XP_TASK_HIGH_PRIORITY = 30;
const XP_WORKOUT = 20;

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISODate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

async function getOrCreateXpRow() {
  const [existing] = await db.select().from(userXp).limit(1);
  if (existing) {
    return existing;
  }
  await db.insert(userXp).values({});
  const [created] = await db.select().from(userXp).limit(1);
  return created;
}

async function addXp(amount: number): Promise<number> {
  if (amount <= 0) {
    return 0;
  }
  const row = await getOrCreateXpRow();
  await db.update(userXp).set({ totalXp: row.totalXp + amount }).where(eq(userXp.id, row.id));
  return amount;
}

/**
 * Atualiza a streak geral de engajamento diário. Se um dia foi pulado, a
 * sequência anterior é perdida e uma penalidade de XP é cobrada — proporcional
 * ao tamanho da streak perdida, limitada ao XP total disponível (nunca fica negativo).
 */
async function recordDailyActivity(): Promise<{ streakBroken: boolean }> {
  const row = await getOrCreateXpRow();
  const today = todayISODate();
  if (row.lastActiveDate === today) {
    return { streakBroken: false };
  }

  const yesterday = daysAgoISODate(1);
  let newStreak: number;
  let xpAfterPenalty = row.totalXp;
  let streakBroken = false;

  if (row.lastActiveDate === yesterday || row.lastActiveDate == null) {
    newStreak = row.currentStreak + 1;
  } else {
    const penalty = Math.min(row.currentStreak * 5, row.totalXp);
    xpAfterPenalty = row.totalXp - penalty;
    newStreak = 1;
    streakBroken = row.currentStreak > 0;
  }

  const longestStreak = Math.max(row.longestStreak, newStreak);
  await db
    .update(userXp)
    .set({ currentStreak: newStreak, longestStreak, lastActiveDate: today, totalXp: xpAfterPenalty })
    .where(eq(userXp.id, row.id));

  await rescheduleStreakReminder(true, newStreak);

  return { streakBroken };
}

/** Mesma lógica de `recordDailyActivity`, mas pra streak de treino — separada da geral. */
async function recordWorkoutActivity(): Promise<{ streakBroken: boolean }> {
  const row = await getOrCreateXpRow();
  const today = todayISODate();
  if (row.lastWorkoutDate === today) {
    return { streakBroken: false };
  }

  const yesterday = daysAgoISODate(1);
  let newStreak: number;
  let xpAfterPenalty = row.totalXp;
  let streakBroken = false;

  if (row.lastWorkoutDate === yesterday || row.lastWorkoutDate == null) {
    newStreak = row.workoutStreak + 1;
  } else {
    const penalty = Math.min(row.workoutStreak * 5, row.totalXp);
    xpAfterPenalty = row.totalXp - penalty;
    newStreak = 1;
    streakBroken = row.workoutStreak > 0;
  }

  const longestWorkoutStreak = Math.max(row.longestWorkoutStreak, newStreak);
  await db
    .update(userXp)
    .set({
      workoutStreak: newStreak,
      longestWorkoutStreak,
      lastWorkoutDate: today,
      totalXp: xpAfterPenalty,
    })
    .where(eq(userXp.id, row.id));

  return { streakBroken };
}

/** Roda os checks de todas as conquistas ainda não desbloqueadas e grava as que bateram a condição. */
export async function checkAndUnlockAchievements(): Promise<UnlockedAchievement[]> {
  const unlockedRows = await db.select({ key: achievements.key }).from(achievements);
  const unlockedKeys = unlockedRows.map(row => row.key);
  const pending = unlockedKeys.length > 0 ? ACHIEVEMENTS.filter(a => !unlockedKeys.includes(a.key)) : ACHIEVEMENTS;

  const newlyUnlocked: UnlockedAchievement[] = [];
  for (const achievement of pending) {
    if (await achievement.check()) {
      await db.insert(achievements).values({ key: achievement.key, unlockedAt: new Date() });
      newlyUnlocked.push({ key: achievement.key, title: achievement.title, description: achievement.description });
    }
  }
  return newlyUnlocked;
}

export async function onHabitCompleted(): Promise<RewardResult> {
  const xpGained = await addXp(XP_HABIT);
  const { streakBroken } = await recordDailyActivity();
  return { xpGained, streakBroken, achievements: await checkAndUnlockAchievements() };
}

export async function onStudySessionEnded(durationMinutes: number): Promise<RewardResult> {
  const xpGained = await addXp(durationMinutes * XP_MINUTE_STUDIED);
  const { streakBroken } = await recordDailyActivity();
  return { xpGained, streakBroken, achievements: await checkAndUnlockAchievements() };
}

/** Só tarefa de prioridade alta rende XP — é o empurrão pra priorizar o que importa. */
export async function onTaskCompleted(priority: Priority): Promise<RewardResult> {
  const xpGained = priority === 'high' ? await addXp(XP_TASK_HIGH_PRIORITY) : 0;
  const { streakBroken } = await recordDailyActivity();
  return { xpGained, streakBroken, achievements: await checkAndUnlockAchievements() };
}

export async function onWorkoutLogged(): Promise<RewardResult> {
  const xpGained = await addXp(XP_WORKOUT);
  const { streakBroken } = await recordWorkoutActivity();
  return { xpGained, streakBroken, achievements: await checkAndUnlockAchievements() };
}

export async function onHealthLogWithoutXp(): Promise<RewardResult> {
  return { xpGained: 0, streakBroken: false, achievements: await checkAndUnlockAchievements() };
}

export type UserXpSummary = {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  workoutStreak: number;
  longestWorkoutStreak: number;
};

/** Se o usuário já fez alguma ação que conta pra streak geral hoje — usado pra decidir o aviso de streak. */
export async function isActiveToday(): Promise<boolean> {
  const row = await getOrCreateXpRow();
  return row.lastActiveDate === todayISODate();
}

export async function getUserXpSummary(): Promise<UserXpSummary> {
  const row = await getOrCreateXpRow();
  return {
    totalXp: row.totalXp,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    workoutStreak: row.workoutStreak,
    longestWorkoutStreak: row.longestWorkoutStreak,
  };
}

export type UnlockedAchievementRow = { key: string; title: string; description: string; unlockedAt: Date };

export async function getUnlockedAchievements(): Promise<UnlockedAchievementRow[]> {
  const rows = await db.select().from(achievements);
  const byKey = new Map(ACHIEVEMENTS.map(a => [a.key, a]));
  return rows
    .map(row => {
      const def = byKey.get(row.key);
      return def ? { key: row.key, title: def.title, description: def.description, unlockedAt: row.unlockedAt } : null;
    })
    .filter((row): row is UnlockedAchievementRow => row != null)
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
}

export function totalAchievementsCount(): number {
  return ACHIEVEMENTS.length;
}
