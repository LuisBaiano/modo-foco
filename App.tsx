/** Componente raiz: providers globais (safe area, tema) + navegação. */
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/app/ThemeContext';
import RootNavigator from './src/app/RootNavigator';
import CelebrationOverlay from './src/features/gamification/CelebrationOverlay';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

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
