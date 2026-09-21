import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { type TaskWithProject, listTasks, toggleTaskCompleted } from './tasksRepository';
import { emitCelebration } from '../gamification/celebrationBus';

/** Lista de tarefas; refaz a busca sempre que a tela ganha foco. */
export function useTasks() {
  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await listTasks());
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
    async (taskId: number) => {
      const reward = await toggleTaskCompleted(taskId);
      emitCelebration(reward);
      await refresh();
    },
    [refresh],
  );

  return { tasks, loading, refresh, toggle };
}
