import notifee, { AndroidImportance } from '@notifee/react-native';

export const CHANNEL_STREAK = 'streak';
export const CHANNEL_HABITS = 'habits';
export const CHANNEL_WATER = 'water';

let ready = false;

/** Pede permissão de notificação e cria os canais Android. Idempotente. */
export async function ensureNotificationsReady() {
  if (ready) {
    return;
  }
  await notifee.requestPermission();
  await notifee.createChannel({ id: CHANNEL_STREAK, name: 'Sequência', importance: AndroidImportance.HIGH });
  await notifee.createChannel({ id: CHANNEL_HABITS, name: 'Hábitos', importance: AndroidImportance.DEFAULT });
  await notifee.createChannel({ id: CHANNEL_WATER, name: 'Água', importance: AndroidImportance.DEFAULT });
  ready = true;
}
