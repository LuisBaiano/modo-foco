import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  addWaterGlass,
  type WeekSummary,
  getRecentMeals,
  getRecentWorkouts,
  getTodayMood,
  getTodayWaterGlasses,
  getWeekSummary,
  setTodayMood,
} from './healthRepository';
import type { mealLogs, workoutLogs } from '../../db/schema';

type WorkoutLog = typeof workoutLogs.$inferSelect;
type MealLog = typeof mealLogs.$inferSelect;

/** Dados da tela inicial de Saúde; refaz a busca sempre que a tela ganha foco. */
export function useHealth() {
  const [loading, setLoading] = useState(true);
  const [waterGlasses, setWaterGlasses] = useState(0);
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
      const [water, todayMood, summary, workouts, meals] = await Promise.all([
        getTodayWaterGlasses(),
        getTodayMood(),
        getWeekSummary(),
        getRecentWorkouts(),
        getRecentMeals(),
      ]);
      setWaterGlasses(water);
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
    await addWaterGlass();
    await refresh();
  }, [refresh]);

  const selectMood = useCallback(
    async (level: number) => {
      await setTodayMood(level);
      await refresh();
    },
    [refresh],
  );

  return { loading, waterGlasses, mood, weekSummary, recentWorkouts, recentMeals, refresh, addWater, selectMood };
}
