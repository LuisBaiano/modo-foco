import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { type HabitWithTodayStatus, listHabitsWithTodayStatus, toggleHabitToday } from './habitsRepository';
import { emitCelebration } from '../gamification/celebrationBus';
import { rescheduleHabitReminders } from '../notifications/habitReminders';

/**
 * Lista de hábitos do dia; refaz a busca sempre que a tela ganha foco.
 * Também reagenda os lembretes de horário a cada busca — cobre criar/editar/
 * excluir/concluir hábito sem precisar de wiring extra nessas telas, já que
 * todas elas retornam pra essa lista e disparam o refetch por foco.
 */
export function useHabits() {
  const [habits, setHabits] = useState<HabitWithTodayStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listHabitsWithTodayStatus();
      setHabits(list);
      rescheduleHabitReminders(list);
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
      const reward = await toggleHabitToday(habitId);
      emitCelebration(reward);
      await refresh();
    },
    [refresh],
  );

  return { habits, loading, refresh, toggle };
}
