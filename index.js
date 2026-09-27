/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundNotificationEvents } from './src/features/notifications/notificationEvents';

registerBackgroundNotificationEvents();
AppRegistry.registerComponent(appName, () => App);
