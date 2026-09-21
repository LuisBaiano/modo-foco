import { count, eq, gte, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { habitLogs, habits, studySessions, tasks, userXp, waterLogs, workoutLogs } from '../../db/schema';

export type AchievementDef = {
  key: string;
  title: string;
  description: string;
  check: () => Promise<boolean>;
};

async function getXpRow() {
  const [row] = await db.select().from(userXp).limit(1);
  return row ?? null;
}

/** Catálogo de conquistas desbloqueáveis. Cada `check` roda contra o estado atual do banco. */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: 'primeiro_habito',
    title: 'Primeiro passo',
    description: 'Criou seu primeiro hábito.',
    check: async () => {
      const [row] = await db.select({ value: count() }).from(habits);
      return row.value >= 1;
    },
  },
  {
    key: 'primeira_tarefa',
    title: 'Produtivo',
    description: 'Concluiu sua primeira tarefa.',
    check: async () => {
      const [row] = await db.select({ value: count() }).from(tasks).where(eq(tasks.completed, true));
      return row.value >= 1;
    },
  },
  {
    key: 'primeira_sessao_estudo',
    title: 'Mãos à obra',
    description: 'Completou sua primeira sessão de estudo.',
    check: async () => {
      const [row] = await db.select({ value: count() }).from(studySessions).where(sql`${studySessions.endedAt} is not null`);
      return row.value >= 1;
    },
  },
  {
    key: 'primeiro_treino',
    title: 'Em movimento',
    description: 'Registrou seu primeiro treino.',
    check: async () => {
      const [row] = await db.select({ value: count() }).from(workoutLogs);
      return row.value >= 1;
    },
  },
  {
    key: 'streak_7',
    title: 'Uma semana de fogo',
    description: 'Manteve uma sequência de 7 dias.',
    check: async () => {
      const row = await getXpRow();
      return (row?.longestStreak ?? 0) >= 7;
    },
  },
  {
    key: 'streak_30',
    title: 'Inabalável',
    description: 'Manteve uma sequência de 30 dias.',
    check: async () => {
      const row = await getXpRow();
      return (row?.longestStreak ?? 0) >= 30;
    },
  },
  {
    key: 'treino_streak_7',
    title: 'Constância física',
    description: 'Treinou 7 dias seguidos.',
    check: async () => {
      const row = await getXpRow();
      return (row?.longestWorkoutStreak ?? 0) >= 7;
    },
  },
  {
    key: 'dez_habitos_concluidos',
    title: 'Rotina em dia',
    description: 'Concluiu hábitos 10 vezes.',
    check: async () => {
      const [row] = await db.select({ value: count() }).from(habitLogs).where(eq(habitLogs.completed, true));
      return row.value >= 10;
    },
  },
  {
    key: 'dez_tarefas_concluidas',
    title: 'Lista zerada',
    description: 'Concluiu 10 tarefas.',
    check: async () => {
      const [row] = await db.select({ value: count() }).from(tasks).where(eq(tasks.completed, true));
      return row.value >= 10;
    },
  },
  {
    key: 'dez_horas_estudadas',
    title: 'Estudioso',
    description: 'Acumulou 10 horas de estudo.',
    check: async () => {
      const sessions = await db.select().from(studySessions).where(sql`${studySessions.endedAt} is not null`);
      const totalMinutes = sessions.reduce((total, session) => {
        if (!session.endedAt) {
          return total;
        }
        return total + Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000);
      }, 0);
      return totalMinutes >= 600;
    },
  },
  {
    key: 'hidratacao_perfeita',
    title: 'Bem hidratado',
    description: 'Bateu a meta de água em um dia.',
    check: async () => {
      const [row] = await db.select({ value: count() }).from(waterLogs).where(gte(waterLogs.glasses, 8));
      return row.value >= 1;
    },
  },
  {
    key: 'cem_xp',
    title: 'Aquecendo',
    description: 'Acumulou 100 XP.',
    check: async () => {
      const row = await getXpRow();
      return (row?.totalXp ?? 0) >= 100;
    },
  },
  {
    key: 'mil_xp',
    title: 'Mestre do foco',
    description: 'Acumulou 1000 XP.',
    check: async () => {
      const row = await getXpRow();
      return (row?.totalXp ?? 0) >= 1000;
    },
  },
];
