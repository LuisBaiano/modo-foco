import notifee, { TriggerType } from '@notifee/react-native';
import { CHANNEL_WATER } from './notificationSetup';

export const WATER_ADD_ACTION_ID = 'add-water';

const REMINDER_TIMES: Array<[number, number]> = [
  [10, 0],
  [13, 0],
  [16, 0],
  [19, 0],
];

function notificationIdFor(index: number): string {
  return `water-${index}`;
}

function nextTriggerTimestamp(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

/**
 * Agenda os lembretes fixos de água do dia (sem julgamento, sem meta
 * condicionando o aviso — lembra igual independente de quanto já foi
 * bebido), com um botão de ação "+1 copo" que registra direto da notificação.
 */
export async function scheduleWaterReminders() {
  for (let index = 0; index < REMINDER_TIMES.length; index++) {
    const [hour, minute] = REMINDER_TIMES[index];
    const id = notificationIdFor(index);
    await notifee.cancelTriggerNotification(id);
    await notifee.createTriggerNotification(
      {
        id,
        title: 'Hora de beber água 💧',
        body: 'Um copo agora ajuda a bater a meta do dia.',
        android: {
          channelId: CHANNEL_WATER,
          pressAction: { id: 'default' },
          actions: [{ title: '+1 copo', pressAction: { id: WATER_ADD_ACTION_ID } }],
        },
      },
      { type: TriggerType.TIMESTAMP, timestamp: nextTriggerTimestamp(hour, minute) },
    );
  }
}
