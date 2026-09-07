import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { type StudySession, type WeeklyStats, getWeeklyStats, listRecentSessions } from './studyRepository';

const EMPTY_STATS: WeeklyStats = { totalMinutes: 0, bySubject: [] };

/** Estatísticas da semana + sessões recentes da tela inicial de Estudos. */
export function useStudyHome() {
  const [stats, setStats] = useState<WeeklyStats>(EMPTY_STATS);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [weeklyStats, sessions] = await Promise.all([getWeeklyStats(), listRecentSessions()]);
      setStats(weeklyStats);
      setRecentSessions(sessions);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { stats, recentSessions, loading, refresh };
}
