import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { type ProjectWithProgress, listProjectsWithProgress } from './projectsRepository';

/** Lista de projetos com progresso; refaz a busca sempre que a tela ganha foco. */
export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await listProjectsWithProgress());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { projects, loading, refresh };
}
