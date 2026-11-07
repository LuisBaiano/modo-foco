import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import { CHANNEL_STREAK } from './notificationSetup';
import { randomStreakWarningPhrase } from '../gamification/motivationalPhrases';

const NOTIFICATION_ID_EARLY = 'streak-warning-early';
const NOTIFICATION_ID_FINAL = 'streak-warning-final';
const EARLY_HOUR = 20;
const FINAL_HOUR = 22;
const FINAL_MINUTE = 30;

function nextTriggerTimestamp(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setTime(now.getTime() + 2 * 60 * 1000);
  }
  return target.getTime();
}

/**
 * Agenda (ou cancela) os avisos de streak em risco, em duas ondas — 20h
 * (ainda dá tempo) e 22h30 (última chamada, com contagem regressiva real até
 * meia-noite). Chamado no boot do app e depois de qualquer ação que conceda
 * XP — `isActiveToday` reflete se o usuário já fez algo hoje, então o aviso
 * nunca dispara à toa depois que a sequência já está garantida. Só agenda de
 * fato se `currentStreak > 0` — sem sequência, não há o que "morrer".
 *
 * Envolvida num try/catch porque é chamada de dentro do fluxo de XP
 * (`recordDailyActivity`) — uma falha de notificação nunca pode impedir o
 * usuário de ganhar XP.
 */
export async function rescheduleStreakReminder(isActiveToday: boolean, currentStreak: number) {
  try {
    await notifee.cancelTriggerNotification(NOTIFICATION_ID_EARLY);
    await notifee.cancelTriggerNotification(NOTIFICATION_ID_FINAL);
    if (isActiveToday || currentStreak <= 0) {
      return;
    }

    await notifee.createTriggerNotification(
      {
        id: NOTIFICATION_ID_EARLY,
        title: randomStreakWarningPhrase(currentStreak),
        body: 'Faltam poucas horas pra virar o dia. Volte pro Modo Foco antes que a sequência quebre.',
        android: { channelId: CHANNEL_STREAK, pressAction: { id: 'default' }, importance: AndroidImportance.HIGH },
      },
      { type: TriggerType.TIMESTAMP, timestamp: nextTriggerTimestamp(EARLY_HOUR, 0) },
    );

    await notifee.createTriggerNotification(
      {
        id: NOTIFICATION_ID_FINAL,
        title: `Última chamada: ${currentStreak} dia${currentStreak === 1 ? '' : 's'} em jogo`,
        body: 'Menos de 2h até meia-noite. Depois disso, a sequência zera de vez.',
        android: { channelId: CHANNEL_STREAK, pressAction: { id: 'default' }, importance: AndroidImportance.HIGH },
      },
      { type: TriggerType.TIMESTAMP, timestamp: nextTriggerTimestamp(FINAL_HOUR, FINAL_MINUTE) },
    );
  } catch (error) {
    console.warn('Falha ao reagendar aviso de streak', error);
  }
}
