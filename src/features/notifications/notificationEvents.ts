import notifee, { EventType } from '@notifee/react-native';
import { WATER_ADD_ACTION_ID } from './waterReminders';
import { addWaterGlass } from '../health/healthRepository';

/**
 * Trata o toque no botão "+1 copo" da notificação de água, registrando
 * direto no banco sem precisar abrir o app. Registrado tanto pro app em
 * primeiro plano quanto em segundo plano/fechado (ver `index.js`).
 */
async function handleNotificationEvent(type: EventType, detail: { pressAction?: { id: string } }) {
  if (type === EventType.ACTION_PRESS && detail.pressAction?.id === WATER_ADD_ACTION_ID) {
    await addWaterGlass();
  }
}

export function registerForegroundNotificationEvents() {
  return notifee.onForegroundEvent(({ type, detail }) => handleNotificationEvent(type, detail));
}

export function registerBackgroundNotificationEvents() {
  notifee.onBackgroundEvent(({ type, detail }) => handleNotificationEvent(type, detail));
}
