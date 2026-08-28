import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import ProfileHeaderButton from '../../app/ProfileHeaderButton';
import type { RootStackParamList } from '../../app/RootNavigator';
import HealthHomeScreen from './HealthHomeScreen';
import WorkoutFormScreen from './WorkoutFormScreen';
import MealFormScreen from './MealFormScreen';

export type HealthStackParamList = {
  HealthHome: undefined;
  WorkoutForm: undefined;
  MealForm: undefined;
};

const Stack = createNativeStackNavigator<HealthStackParamList>();

/** Stack aninhado da aba Saúde: início (água, resumo) e os formulários de registro. */
function HealthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HealthHome"
        component={HealthHomeScreen}
        options={({ navigation }) => ({
          title: 'Saúde',
          headerRight: () => (
            <ProfileHeaderButton
              navigation={navigation.getParent()?.getParent() as NavigationProp<RootStackParamList>}
            />
          ),
        })}
      />
      <Stack.Screen name="WorkoutForm" component={WorkoutFormScreen} options={{ title: 'Treino' }} />
      <Stack.Screen name="MealForm" component={MealFormScreen} options={{ title: 'Refeição' }} />
    </Stack.Navigator>
  );
}

export default HealthNavigator;
