import { and, eq, gte, isNotNull } from 'drizzle-orm';
import { db } from '../../db/client';
import { studySessions } from '../../db/schema';
import { onStudySessionEnded, type RewardResult } from '../gamification/gamificationRepository';

export type StudyMode = 'pomodoro' | 'free';
export type ProductivityRating = 'low' | 'medium' | 'high';

export type StudySession = {
  id: number;
  subject: string;
  mode: StudyMode;
  startedAt: Date;
  endedAt: Date | null;
  cycles: number;
  notes: string | null;
  productivityRating: ProductivityRating | null;
};

export type SubjectMinutes = { subject: string; minutes: number };

export type WeeklyStats = {
  totalMinutes: number;
  bySubject: SubjectMinutes[];
};

/**
 * Inicia uma sessão e retorna o id dela. Insere e busca de volta pelo par
 * (subject, startedAt) em vez de confiar no insertId do driver — mais
 * previsível dado o histórico de incompatibilidades do op-sqlite com o
 * drizzle-orm (ver patches/drizzle-orm+0.45.2.patch).
 */
export async function startSession(input: { subject: string; mode: StudyMode }): Promise<number> {
  const startedAt = new Date();
  await db.insert(studySessions).values({
    subject: input.subject,
    mode: input.mode,
    startedAt,
    cycles: 0,
  });
  const [row] = await db
    .select({ id: studySessions.id })
    .from(studySessions)
    .where(and(eq(studySessions.subject, input.subject), eq(studySessions.startedAt, startedAt)));
  return row.id;
}

export async function getSession(sessionId: number) {
  const [session] = await db.select().from(studySessions).where(eq(studySessions.id, sessionId));
  return session;
}

/** Soma 1 ao contador de ciclos de foco completados (só faz sentido no modo Pomodoro). */
export async function incrementCycles(sessionId: number) {
  const session = await getSession(sessionId);
  if (!session) {
    return;
  }
  await db.update(studySessions).set({ cycles: session.cycles + 1 }).where(eq(studySessions.id, sessionId));
}

/**
 * Encerra a sessão: marca endedAt, salva a anotação/avaliação opcionais e
 * concede XP proporcional aos minutos estudados (1 XP/min, nos dois modos).
 */
export async function endSession(
  sessionId: number,
  input: { notes: string | null; productivityRating: ProductivityRating | null },
): Promise<RewardResult | null> {
  const session = await getSession(sessionId);
  const endedAt = new Date();
  await db
    .update(studySessions)
    .set({ endedAt, notes: input.notes, productivityRating: input.productivityRating })
    .where(eq(studySessions.id, sessionId));

  if (!session) {
    return null;
  }
  const durationMinutes = Math.round((endedAt.getTime() - session.startedAt.getTime()) / 60000);
  return onStudySessionEnded(durationMinutes);
}

/**
 * Estatísticas dos últimos 7 dias: total de minutos e minutos por matéria.
 * Sessões sem endedAt (em andamento ou abandonadas) não entram na conta.
 */
export async function getWeeklyStats(): Promise<WeeklyStats> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const sessions = await db
    .select({ subject: studySessions.subject, startedAt: studySessions.startedAt, endedAt: studySessions.endedAt })
    .from(studySessions)
    .where(and(gte(studySessions.startedAt, weekAgo), isNotNull(studySessions.endedAt)));

  const minutesBySubject = new Map<string, number>();
  let totalMinutes = 0;
  for (const session of sessions) {
    if (!session.endedAt) {
      continue;
    }
    const minutes = Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000);
    totalMinutes += minutes;
    minutesBySubject.set(session.subject, (minutesBySubject.get(session.subject) ?? 0) + minutes);
  }

  const bySubject = Array.from(minutesBySubject.entries())
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  return { totalMinutes, bySubject };
}

/** Sessões concluídas mais recentes, pra lista de histórico na tela inicial. */
export async function listRecentSessions(limit = 5): Promise<StudySession[]> {
  const sessions = await db.select().from(studySessions).where(isNotNull(studySessions.endedAt));
  return (sessions as StudySession[])
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .slice(0, limit);
}
