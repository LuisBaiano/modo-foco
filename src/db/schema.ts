import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  frequency: text('frequency', { enum: ['daily', 'weekly'] }).notNull(),
  targetTime: text('target_time'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habit_id')
    .notNull()
    .references(() => habits.id),
  date: text('date').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull(),
});

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull(),
  dueDate: text('due_date'),
  projectId: integer('project_id').references(() => projects.id),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const studySessions = sqliteTable('study_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subject: text('subject').notNull(),
  mode: text('mode', { enum: ['pomodoro', 'free'] }).notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  cycles: integer('cycles').notNull().default(0),
  notes: text('notes'),
  productivityRating: text('productivity_rating', { enum: ['low', 'medium', 'high'] }),
});

export const workoutLogs = sqliteTable('workout_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', {
    enum: ['walk', 'strength', 'cycling', 'yoga', 'other'],
  }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  notes: text('notes'),
  date: text('date').notNull(),
});

export const mealLogs = sqliteTable('meal_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', {
    enum: ['breakfast', 'lunch', 'snack', 'dinner'],
  }).notNull(),
  notes: text('notes'),
  date: text('date').notNull(),
});

export const waterLogs = sqliteTable('water_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  glasses: integer('glasses').notNull(),
  date: text('date').notNull(),
});

export const moodLogs = sqliteTable('mood_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  level: integer('level').notNull(),
  date: text('date').notNull(),
});

export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  unlockedAt: integer('unlocked_at', { mode: 'timestamp' }).notNull(),
});

export const userXp = sqliteTable('user_xp', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  totalXp: integer('total_xp').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActiveDate: text('last_active_date'),
});
