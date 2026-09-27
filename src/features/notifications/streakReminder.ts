import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import { CHANNEL_STREAK } from './notificationSetup';
import { randomStreakWarningPhrase } from '../gamification/motivationalPhrases';

const NOTIFICATION_ID = 'streak-warning';
const DANGER_HOUR = 20;

function nextTriggerTimestamp(): number {
  const now = new Date();
  const target = new Date();
  target.setHours(DANGER_HOUR, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setTime(now.getTime() + 2 * 60 * 1000);
  }
  return target.getTime();
}

/**
 * Agenda (ou cancela) o aviso de streak em risco pras 20h. Chamado no boot
 * do app e depois de qualquer ação que conceda XP — `isActiveToday` reflete
 * se o usuário já fez algo hoje, então o aviso nunca dispara à toa depois
 * que a sequência já está garantida.
 *
 * Envolvida num try/catch porque é chamada de dentro do fluxo de XP
 * (`recordDailyActivity`) — uma falha de notificação nunca pode impedir o
 * usuário de ganhar XP.
 */
export async function rescheduleStreakReminder(isActiveToday: boolean) {
  try {
    await notifee.cancelTriggerNotification(NOTIFICATION_ID);
    if (isActiveToday) {
      return;
    }
    await notifee.createTriggerNotification(
      {
        id: NOTIFICATION_ID,
        title: randomStreakWarningPhrase(),
        body: 'Volte pro Modo Foco antes que a sequência quebre.',
        android: { channelId: CHANNEL_STREAK, pressAction: { id: 'default' }, importance: AndroidImportance.HIGH },
      },
      { type: TriggerType.TIMESTAMP, timestamp: nextTriggerTimestamp() },
    );
  } catch (error) {
    console.warn('Falha ao reagendar aviso de streak', error);
  }
}
