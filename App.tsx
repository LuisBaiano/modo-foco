/** Componente raiz: providers globais (safe area, tema) + navegação. */
import { useEffect } from 'react';
import { AppState, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/app/ThemeContext';
import RootNavigator from './src/app/RootNavigator';
import CelebrationOverlay from './src/features/gamification/CelebrationOverlay';
import { refreshNotificationsState, registerForegroundNotificationEvents } from './src/features/notifications/initNotifications';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    refreshNotificationsState();
    const unsubscribeEvents = registerForegroundNotificationEvents();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refreshNotificationsState();
      }
    });
    return () => {
      unsubscribeEvents();
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
        <CelebrationOverlay />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
