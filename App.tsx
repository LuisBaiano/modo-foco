/** Componente raiz: providers globais (safe area, tema) + navegação. */
import { useEffect } from 'react';
import { AppState, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/app/ThemeContext';
import RootNavigator from './src/app/RootNavigator';
import CelebrationOverlay from './src/features/gamification/CelebrationOverlay';
import { refreshNotificationsState, registerForegroundNotificationEvents } from './src/features/notifications/initNotifications';

/** Conteúdo do app — precisa estar dentro do ThemeProvider pra ler o tema resolvido. */
function AppContent() {
  const { resolvedScheme } = useTheme();

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
    <>
      <StatusBar barStyle={resolvedScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <RootNavigator />
      <CelebrationOverlay />
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
