import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import ProfileHeaderButton from '../../app/ProfileHeaderButton';
import type { RootStackParamList } from '../../app/RootNavigator';
import StudyHomeScreen from './StudyHomeScreen';
import StudySessionScreen from './StudySessionScreen';
import type { StudyMode } from './studyRepository';

export type StudyStackParamList = {
  StudyHome: undefined;
  StudySession: { sessionId: number; mode: StudyMode; subject: string };
};

const Stack = createNativeStackNavigator<StudyStackParamList>();

/** Stack aninhado da aba Estudos: início (form + estatísticas) e a sessão ativa. */
function StudyNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StudyHome"
        component={StudyHomeScreen}
        options={({ navigation }) => ({
          title: 'Estudos',
          headerRight: () => (
            <ProfileHeaderButton
              navigation={navigation.getParent()?.getParent() as NavigationProp<RootStackParamList>}
            />
          ),
        })}
      />
      <Stack.Screen
        name="StudySession"
        component={StudySessionScreen}
        options={{ title: 'Sessão de estudo', headerBackVisible: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

export default StudyNavigator;
