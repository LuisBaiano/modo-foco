import { eq, inArray } from 'drizzle-orm';
import { db } from '../../db/client';
import { tasks } from '../../db/schema';
import { onTaskCompleted, type RewardResult } from '../gamification/gamificationRepository';

export type Priority = 'low' | 'medium' | 'high';

export type TaskWithTags = {
  id: number;
  title: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  tags: string[];
};

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function parseTags(value: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

function serializeTags(tags: string[]): string | null {
  return tags.length > 0 ? tags.join(',') : null;
}

/**
 * Lista todas as tarefas. Ordenação feita em JS (não em SQL) por:
 * não-concluída primeiro, depois prioridade, depois prazo — mais simples e
 * barato pro volume de dados de um app pessoal.
 */
export async function listTasks(): Promise<TaskWithTags[]> {
  const rows = await db.select().from(tasks);

  return rows
    .map(row => ({
      id: row.id,
      title: row.title,
      priority: row.priority as Priority,
      dueDate: row.dueDate,
      completed: row.completed,
      tags: parseTags(row.tags),
    }))
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (a.dueDate) {
        return -1;
      }
      if (b.dueDate) {
        return 1;
      }
      return 0;
    });
}

export async function getTask(taskId: number) {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!task) {
    return undefined;
  }
  return { ...task, tags: parseTags(task.tags) };
}

export async function createTask(input: {
  title: string;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
}) {
  await db.insert(tasks).values({
    title: input.title,
    priority: input.priority,
    dueDate: input.dueDate,
    tags: serializeTags(input.tags),
    completed: false,
  });
}

export async function updateTask(
  taskId: number,
  input: { title: string; priority: Priority; dueDate: string | null; tags: string[] },
) {
  await db
    .update(tasks)
    .set({
      title: input.title,
      priority: input.priority,
      dueDate: input.dueDate,
      tags: serializeTags(input.tags),
    })
    .where(eq(tasks.id, taskId));
}

/** Alterna concluída/pendente e atualiza completedAt de acordo; XP só ao concluir, nunca ao reabrir. */
export async function toggleTaskCompleted(taskId: number): Promise<RewardResult | null> {
  const task = await getTask(taskId);
  if (!task) {
    return null;
  }
  const completed = !task.completed;
  await db
    .update(tasks)
    .set({ completed, completedAt: completed ? new Date() : null })
    .where(eq(tasks.id, taskId));

  return completed ? onTaskCompleted(task.priority as Priority) : null;
}

export async function deleteTask(taskId: number) {
  await db.delete(tasks).where(eq(tasks.id, taskId));
}

/** Exclui várias tarefas de uma vez (seleção múltipla na lista). */
export async function deleteTasks(taskIds: number[]) {
  if (taskIds.length === 0) {
    return;
  }
  await db.delete(tasks).where(inArray(tasks.id, taskIds));
}
