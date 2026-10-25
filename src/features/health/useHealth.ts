import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  addWaterGlass,
  type WeekSummary,
  deleteMeals,
  deleteWorkouts,
  getRecentMeals,
  getRecentWorkouts,
  getTodayMood,
  getTodayWaterGlasses,
  getWeekSummary,
  setTodayMood,
} from './healthRepository';
import {
  getWaterGlassMl,
  getWaterReminderIntervalHours,
  setWaterGlassMl,
  setWaterReminderIntervalHours,
} from '../settings/settingsRepository';
import { scheduleWaterReminders } from '../notifications/waterReminders';
import type { mealLogs, workoutLogs } from '../../db/schema';
import { emitCelebration } from '../gamification/celebrationBus';

type WorkoutLog = typeof workoutLogs.$inferSelect;
type MealLog = typeof mealLogs.$inferSelect;

/** Dados da tela inicial de Saúde; refaz a busca sempre que a tela ganha foco. */
export function useHealth() {
  const [loading, setLoading] = useState(true);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterGlassMl, setWaterGlassMlState] = useState(250);
  const [waterReminderIntervalHours, setWaterReminderIntervalHoursState] = useState(3);
  const [mood, setMood] = useState<number | null>(null);
  const [weekSummary, setWeekSummary] = useState<WeekSummary>({
    workoutMinutes: 0,
    workoutCount: 0,
    waterGlasses: 0,
    averageMood: null,
  });
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [recentMeals, setRecentMeals] = useState<MealLog[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [water, glassMl, intervalHours, todayMood, summary, workouts, meals] = await Promise.all([
        getTodayWaterGlasses(),
        getWaterGlassMl(),
        getWaterReminderIntervalHours(),
        getTodayMood(),
        getWeekSummary(),
        getRecentWorkouts(),
        getRecentMeals(),
      ]);
      setWaterGlasses(water);
      setWaterGlassMlState(glassMl);
      setWaterReminderIntervalHoursState(intervalHours);
      setMood(todayMood);
      setWeekSummary(summary);
      setRecentWorkouts(workouts);
      setRecentMeals(meals);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const addWater = useCallback(async () => {
    const reward = await addWaterGlass();
    emitCelebration(reward);
    await refresh();
  }, [refresh]);

  const selectMood = useCallback(
    async (level: number) => {
      await setTodayMood(level);
      await refresh();
    },
    [refresh],
  );

  const updateWaterGlassMl = useCallback(
    async (ml: number) => {
      await setWaterGlassMl(ml);
      await refresh();
    },
    [refresh],
  );

  const updateWaterReminderIntervalHours = useCallback(
    async (hours: number) => {
      await setWaterReminderIntervalHours(hours);
      await scheduleWaterReminders();
      await refresh();
    },
    [refresh],
  );

  const removeWorkouts = useCallback(
    async (workoutIds: number[]) => {
      await deleteWorkouts(workoutIds);
      await refresh();
    },
    [refresh],
  );

  const removeMeals = useCallback(
    async (mealIds: number[]) => {
      await deleteMeals(mealIds);
      await refresh();
    },
    [refresh],
  );

  return {
    loading,
    waterGlasses,
    waterGlassMl,
    waterReminderIntervalHours,
    mood,
    weekSummary,
    recentWorkouts,
    recentMeals,
    refresh,
    addWater,
    selectMood,
    updateWaterGlassMl,
    updateWaterReminderIntervalHours,
    removeWorkouts,
    removeMeals,
  };
}
