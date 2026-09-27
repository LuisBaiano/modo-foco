import notifee, { TriggerType } from '@notifee/react-native';
import { CHANNEL_HABITS } from './notificationSetup';

type ReminderHabit = { id: number; name: string; targetTime: string | null; completedToday: boolean };

function notificationIdFor(habitId: number): string {
  return `habit-${habitId}`;
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
 * Reagenda os lembretes de todos os hábitos com horário definido — cancela
 * o de quem já foi concluído hoje ou não tem horário configurado. Chamado
 * sempre que a lista de hábitos é buscada (ver `useHabits`), então fica
 * sempre consistente com o estado atual sem precisar de wiring extra.
 *
 * Envolvida num try/catch porque toca notificação do sistema — uma falha
 * aqui nunca deve impedir a lista de hábitos de carregar.
 */
export async function rescheduleHabitReminders(habits: ReminderHabit[]) {
  try {
    for (const habit of habits) {
      const id = notificationIdFor(habit.id);
      await notifee.cancelTriggerNotification(id);
      if (!habit.targetTime || habit.completedToday) {
        continue;
      }
      const [hourStr, minuteStr] = habit.targetTime.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (Number.isNaN(hour) || Number.isNaN(minute)) {
        continue;
      }
      await notifee.createTriggerNotification(
        {
          id,
          title: `Hora de: ${habit.name}`,
          body: 'Não deixa esse hábito escapar hoje.',
          android: { channelId: CHANNEL_HABITS, pressAction: { id: 'default' } },
        },
        { type: TriggerType.TIMESTAMP, timestamp: nextTriggerTimestamp(hour, minute) },
      );
    }
  } catch (error) {
    console.warn('Falha ao reagendar lembretes de hábitos', error);
  }
}
