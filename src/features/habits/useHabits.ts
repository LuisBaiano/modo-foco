import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { type HabitWithTodayStatus, listHabitsWithTodayStatus, toggleHabitToday } from './habitsRepository';

/** Lista de hábitos do dia; refaz a busca sempre que a tela ganha foco. */
export function useHabits() {
  const [habits, setHabits] = useState<HabitWithTodayStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setHabits(await listHabitsWithTodayStatus());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const toggle = useCallback(
    async (habitId: number) => {
      await toggleHabitToday(habitId);
      await refresh();
    },
    [refresh],
  );

  return { habits, loading, refresh, toggle };
}
