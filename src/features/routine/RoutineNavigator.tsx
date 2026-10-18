import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import ProfileHeaderButton from '../../app/ProfileHeaderButton';
import type { RootStackParamList } from '../../app/RootNavigator';
import RoutineListScreen from './RoutineListScreen';
import RoutineFormScreen from './RoutineFormScreen';

export type RoutineStackParamList = {
  RoutineList: undefined;
  RoutineForm: { itemId?: number } | undefined;
};

const Stack = createNativeStackNavigator<RoutineStackParamList>();

/** Stack aninhado da aba Rotina (lista → formulário), mesmo padrão da aba Hábitos. */
function RoutineNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RoutineList"
        component={RoutineListScreen}
        options={({ navigation }) => ({
          title: 'Rotina',
          headerRight: () => (
            <ProfileHeaderButton
              navigation={navigation.getParent()?.getParent() as NavigationProp<RootStackParamList>}
            />
          ),
        })}
      />
      <Stack.Screen name="RoutineForm" component={RoutineFormScreen} options={{ title: 'Bloco de rotina' }} />
    </Stack.Navigator>
  );
}

export default RoutineNavigator;
