import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { addKm, deleteRoutineItem, listRoutineItems, type RoutineItem } from './routineRepository';
import { rescheduleRoutineReminders } from '../notifications/routineReminders';

/**
 * Lista dos blocos de rotina; refaz a busca sempre que a tela ganha foco.
 * Também reagenda os lembretes de horário a cada busca, mesmo padrão do
 * `useHabits`.
 */
export function useRoutine() {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listRoutineItems();
      setItems(list);
      rescheduleRoutineReminders(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const remove = useCallback(
    async (itemId: number) => {
      await deleteRoutineItem(itemId);
      await refresh();
    },
    [refresh],
  );

  const addKmToItem = useCallback(
    async (itemId: number, km: number) => {
      await addKm(itemId, km);
      await refresh();
    },
    [refresh],
  );

  return { items, loading, refresh, remove, addKmToItem };
}
