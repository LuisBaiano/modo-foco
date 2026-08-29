import { ensureNotificationsReady } from './notificationSetup';
import { registerForegroundNotificationEvents } from './notificationEvents';
import { scheduleWaterReminders } from './waterReminders';
import { rescheduleStreakReminder } from './streakReminder';
import { getUserXpSummary, isActiveToday } from '../gamification/gamificationRepository';

/**
 * Roda no boot do app e sempre que ele volta pro primeiro plano: garante
 * permissão/canais, religa o listener de ações da notificação e recalcula
 * os lembretes fixos (água) e o aviso de streak pro dia atual. Lembretes de
 * hábito com horário próprio são recalculados à parte (ver `useHabits`).
 *
 * Envolvida num try/catch porque toca permissão/notificação do sistema —
 * uma falha aqui (permissão negada, aparelho sem suporte etc.) nunca deve
 * derrubar o app.
 */
export async function refreshNotificationsState() {
  try {
    await ensureNotificationsReady();
    await scheduleWaterReminders();
    const [active, { currentStreak }] = await Promise.all([isActiveToday(), getUserXpSummary()]);
    await rescheduleStreakReminder(active, currentStreak);
  } catch (error) {
    console.warn('Falha ao configurar notificações', error);
  }
}

export { registerForegroundNotificationEvents };
