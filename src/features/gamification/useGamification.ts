import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  getUnlockedAchievements,
  getUserXpSummary,
  totalAchievementsCount,
  type UnlockedAchievementRow,
  type UserXpSummary,
} from './gamificationRepository';

const EMPTY_SUMMARY: UserXpSummary = {
  totalXp: 0,
  currentStreak: 0,
  longestStreak: 0,
  workoutStreak: 0,
  longestWorkoutStreak: 0,
};

/** XP, streaks e conquistas pra tela de Perfil; refaz a busca sempre que a tela ganha foco. */
export function useGamification() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<UserXpSummary>(EMPTY_SUMMARY);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievementRow[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [xpSummary, achievements] = await Promise.all([getUserXpSummary(), getUnlockedAchievements()]);
      setSummary(xpSummary);
      setUnlockedAchievements(achievements);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { loading, summary, unlockedAchievements, totalAchievements: totalAchievementsCount(), refresh };
}
