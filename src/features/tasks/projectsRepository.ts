import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { projects, tasks } from '../../db/schema';

export type ProjectWithProgress = {
  id: number;
  name: string;
  color: string;
  description: string | null;
  totalTasks: number;
  completedTasks: number;
};

/** Progresso não é armazenado — é sempre recalculado a partir das tarefas vinculadas. */
export async function listProjectsWithProgress(): Promise<ProjectWithProgress[]> {
  const allProjects = await db.select().from(projects);
  const allTasks = await db.select({ projectId: tasks.projectId, completed: tasks.completed }).from(tasks);

  return allProjects.map(project => {
    const projectTasks = allTasks.filter(task => task.projectId === project.id);
    const completedTasks = projectTasks.filter(task => task.completed).length;
    return {
      id: project.id,
      name: project.name,
      color: project.color,
      description: project.description,
      totalTasks: projectTasks.length,
      completedTasks,
    };
  });
}

/** Lista simples, sem progresso — usada pelo seletor de projeto no formulário de tarefa. */
export async function listProjects() {
  return db.select().from(projects);
}

export async function getProject(projectId: number) {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  return project;
}

export async function createProject(input: { name: string; color: string; description: string | null }) {
  await db.insert(projects).values({
    name: input.name,
    color: input.color,
    description: input.description,
    createdAt: new Date(),
  });
}

export async function updateProject(
  projectId: number,
  input: { name: string; color: string; description: string | null },
) {
  await db
    .update(projects)
    .set({ name: input.name, color: input.color, description: input.description })
    .where(eq(projects.id, projectId));
}

/** Exclui o projeto sem apagar as tarefas — elas só perdem o vínculo (projectId vira null). */
export async function deleteProject(projectId: number) {
  await db.update(tasks).set({ projectId: null }).where(eq(tasks.projectId, projectId));
  await db.delete(projects).where(eq(projects.id, projectId));
}
