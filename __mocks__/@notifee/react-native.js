const noopAsync = () => Promise.resolve();

const notifee = {
  requestPermission: noopAsync,
  createChannel: noopAsync,
  cancelTriggerNotification: noopAsync,
  createTriggerNotification: noopAsync,
  onForegroundEvent: () => () => {},
  onBackgroundEvent: () => {},
};

module.exports = {
  __esModule: true,
  default: notifee,
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
  TriggerType: { TIMESTAMP: 0 },
  EventType: { ACTION_PRESS: 5 },
};
