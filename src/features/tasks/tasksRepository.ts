import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { projects, tasks } from '../../db/schema';
import { onTaskCompleted, type RewardResult } from '../gamification/gamificationRepository';

export type Priority = 'low' | 'medium' | 'high';

export type TaskWithProject = {
  id: number;
  title: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  projectId: number | null;
  projectName: string | null;
  projectColor: string | null;
};

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Lista todas as tarefas com o nome/cor do projeto vinculado (se houver).
 * Ordenação feita em JS (não em SQL) por: não-concluída primeiro, depois
 * prioridade, depois prazo — mais simples e barato pro volume de dados
 * de um app pessoal.
 */
export async function listTasks(): Promise<TaskWithProject[]> {
  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      completed: tasks.completed,
      projectId: tasks.projectId,
      projectName: projects.name,
      projectColor: projects.color,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id));

  return (rows as TaskWithProject[]).sort((a, b) => {
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
  return task;
}

export async function createTask(input: {
  title: string;
  priority: Priority;
  dueDate: string | null;
  projectId: number | null;
}) {
  await db.insert(tasks).values({
    title: input.title,
    priority: input.priority,
    dueDate: input.dueDate,
    projectId: input.projectId,
    completed: false,
  });
}

export async function updateTask(
  taskId: number,
  input: { title: string; priority: Priority; dueDate: string | null; projectId: number | null },
) {
  await db
    .update(tasks)
    .set({
      title: input.title,
      priority: input.priority,
      dueDate: input.dueDate,
      projectId: input.projectId,
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
