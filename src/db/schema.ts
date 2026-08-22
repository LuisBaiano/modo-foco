import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/** Hábito cadastrado pelo usuário (diário ou semanal). */
export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** Nome do hábito, ex: "Beber água". */
  name: text('name').notNull(),
  frequency: text('frequency', { enum: ['daily', 'weekly'] }).notNull(),
  /** Horário alvo (ainda não editável na UI — usado só quando as notificações existirem). */
  targetTime: text('target_time'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

/**
 * Registro de um hábito num dia específico. Único por (habitId, date) — é
 * essa constraint que permite fazer upsert seguro ao marcar/desmarcar o dia.
 */
export const habitLogs = sqliteTable(
  'habit_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    habitId: integer('habit_id')
      .notNull()
      .references(() => habits.id),
    /** Data no formato YYYY-MM-DD. */
    date: text('date').notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull(),
  },
  table => [uniqueIndex('habit_logs_habit_id_date_unique').on(table.habitId, table.date)],
);

/** Projeto que agrupa tarefas; progresso é sempre calculado, não armazenado. */
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  /** Cor em hex, usada nos badges e na barra de progresso. */
  color: text('color').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

/** Tarefa, opcionalmente ligada a um projeto. */
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull(),
  /** Data no formato YYYY-MM-DD, ou null pra "sem prazo". */
  dueDate: text('due_date'),
  /** Null quando a tarefa não pertence a nenhum projeto (ou o projeto foi excluído). */
  projectId: integer('project_id').references(() => projects.id),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

/** Sessão de estudo, livre ou em ciclos Pomodoro. */
export const studySessions = sqliteTable('study_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subject: text('subject').notNull(),
  mode: text('mode', { enum: ['pomodoro', 'free'] }).notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  /** Null enquanto a sessão está em andamento. */
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  /** Quantos ciclos de foco (25min) foram completados; sempre 0 no modo livre. */
  cycles: integer('cycles').notNull().default(0),
  /** Anotação curta e opcional preenchida ao final da sessão. */
  notes: text('notes'),
  productivityRating: text('productivity_rating', { enum: ['low', 'medium', 'high'] }),
});

/** Registro de treino/atividade física. */
export const workoutLogs = sqliteTable('workout_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', {
    enum: ['walk', 'strength', 'cycling', 'yoga', 'other'],
  }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  notes: text('notes'),
  date: text('date').notNull(),
});

/** Registro de refeição — sem calorias, só o tipo e uma nota livre opcional. */
export const mealLogs = sqliteTable('meal_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', {
    enum: ['breakfast', 'lunch', 'snack', 'dinner'],
  }).notNull(),
  notes: text('notes'),
  date: text('date').notNull(),
});

/** Ingestão de água do dia, em copos de 250ml (um registro por toque). */
export const waterLogs = sqliteTable('water_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  glasses: integer('glasses').notNull(),
  date: text('date').notNull(),
});

/** Check-in diário de humor/energia. */
export const moodLogs = sqliteTable('mood_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** Escala de 1 (pior) a 5 (melhor). */
  level: integer('level').notNull(),
  date: text('date').notNull(),
});

/** Conquista desbloqueada pelo usuário (fase de gamificação). */
export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** Identificador estável da conquista, ex: "streak_7_dias". */
  key: text('key').notNull().unique(),
  unlockedAt: integer('unlocked_at', { mode: 'timestamp' }).notNull(),
});

/** XP e streak geral do usuário. Linha única (fase de gamificação, ainda não populada). */
export const userXp = sqliteTable('user_xp', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  totalXp: integer('total_xp').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActiveDate: text('last_active_date'),
});

/** Preferências do app. Linha única de id fixo (ver settingsRepository). */
export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey(),
  accentColor: text('accent_color').notNull(),
});
