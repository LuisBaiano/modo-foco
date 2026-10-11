import notifee, { TriggerType } from '@notifee/react-native';
import { CHANNEL_WATER } from './notificationSetup';
import { getWaterReminderIntervalHours } from '../settings/settingsRepository';

export const WATER_ADD_ACTION_ID = 'add-water';

/** Janela de horário acordado em que os lembretes podem disparar. */
const WINDOW_START_HOUR = 8;
const WINDOW_END_HOUR = 22;

/** Teto de notificações agendadas por vez — cobre até um intervalo de 1h na janela toda. */
const MAX_SLOTS = WINDOW_END_HOUR - WINDOW_START_HOUR + 1;

function notificationIdFor(index: number): string {
  return `water-${index}`;
}

function nextTriggerTimestamp(hour: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

/** Horários do dia em que o lembrete dispara, de `intervalHours` em `intervalHours`, dentro da janela acordada. */
function buildSchedule(intervalHours: number): number[] {
  const step = Math.max(1, Math.round(intervalHours));
  const hours: number[] = [];
  for (let hour = WINDOW_START_HOUR; hour <= WINDOW_END_HOUR; hour += step) {
    hours.push(hour);
  }
  return hours;
}

/**
 * Agenda os lembretes de água do dia, de X em X horas (configurável — ver
 * settingsRepository, padrão 3h) dentro da janela acordada (8h-22h). Sem
 * julgamento, sem meta condicionando o aviso — lembra igual independente de
 * quanto já foi bebido —, com um botão de ação "+1 copo" que registra direto
 * da notificação. Sempre cancela todos os slots possíveis antes de reagendar,
 * pra não deixar lembrete órfão quando o intervalo muda pra um valor maior.
 */
export async function scheduleWaterReminders() {
  for (let index = 0; index < MAX_SLOTS; index++) {
    await notifee.cancelTriggerNotification(notificationIdFor(index));
  }

  const intervalHours = await getWaterReminderIntervalHours();
  const hours = buildSchedule(intervalHours);

  for (let index = 0; index < hours.length; index++) {
    await notifee.createTriggerNotification(
      {
        id: notificationIdFor(index),
        title: 'Hora de beber água 💧',
        body: 'Um copo agora ajuda a bater a meta do dia.',
        android: {
          channelId: CHANNEL_WATER,
          pressAction: { id: 'default' },
          actions: [{ title: '+1 copo', pressAction: { id: WATER_ADD_ACTION_ID } }],
        },
      },
      { type: TriggerType.TIMESTAMP, timestamp: nextTriggerTimestamp(hours[index]) },
    );
  }
}
