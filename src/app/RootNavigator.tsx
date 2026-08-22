import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import ProfileScreen from '../features/profile/ProfileScreen';

export type RootStackParamList = {
  Tabs: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Stack raiz: as abas (Tabs) e o Perfil, empurrado por cima via ícone no header. */
function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
