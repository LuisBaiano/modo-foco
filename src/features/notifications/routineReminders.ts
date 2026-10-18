import notifee, { TriggerType } from '@notifee/react-native';
import { CHANNEL_ROUTINE } from './notificationSetup';

type ReminderRoutineItem = { id: number; name: string; startTime: string; daysOfWeek: number[] };

function notificationIdFor(itemId: number): string {
  return `routine-${itemId}`;
}

/**
 * Próximo horário (dentro dos próximos 7 dias) em que algum dos dias da
 * semana informados bate com `hour:minute`. `daysOfWeek` usa a mesma
 * convenção do `Date.getDay()` (0 = domingo ... 6 = sábado).
 */
function nextTriggerTimestamp(daysOfWeek: number[], hour: number, minute: number): number | null {
  if (daysOfWeek.length === 0) {
    return null;
  }
  const now = new Date();
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date();
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(hour, minute, 0, 0);
    if (daysOfWeek.includes(candidate.getDay()) && candidate.getTime() > now.getTime()) {
      return candidate.getTime();
    }
  }
  return null;
}

/**
 * Reagenda o lembrete "você deveria estar: [atividade]" de cada bloco de
 * rotina, pro próximo horário em que ele estiver marcado pra acontecer.
 * Chamado sempre que a lista de rotina é buscada (ver `useRoutine`), mesmo
 * padrão usado pelos lembretes de hábito.
 */
export async function rescheduleRoutineReminders(items: ReminderRoutineItem[]) {
  try {
    for (const item of items) {
      const id = notificationIdFor(item.id);
      await notifee.cancelTriggerNotification(id);

      const [hourStr, minuteStr] = item.startTime.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (Number.isNaN(hour) || Number.isNaN(minute)) {
        continue;
      }
      const timestamp = nextTriggerTimestamp(item.daysOfWeek, hour, minute);
      if (timestamp == null) {
        continue;
      }
      await notifee.createTriggerNotification(
        {
          id,
          title: 'Hora da rotina ⏰',
          body: `Você deveria estar: ${item.name}`,
          android: { channelId: CHANNEL_ROUTINE, pressAction: { id: 'default' } },
        },
        { type: TriggerType.TIMESTAMP, timestamp },
      );
    }
  } catch (error) {
    console.warn('Falha ao reagendar lembretes de rotina', error);
  }
}
