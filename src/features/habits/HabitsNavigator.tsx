import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import ProfileHeaderButton from '../../app/ProfileHeaderButton';
import type { RootStackParamList } from '../../app/RootNavigator';
import HabitsListScreen from './HabitsListScreen';
import HabitFormScreen from './HabitFormScreen';
import HabitDetailScreen from './HabitDetailScreen';

export type HabitsStackParamList = {
  HabitsList: undefined;
  HabitForm: { habitId?: number } | undefined;
  HabitDetail: { habitId: number };
};

const Stack = createNativeStackNavigator<HabitsStackParamList>();

function HabitsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HabitsList"
        component={HabitsListScreen}
        options={({ navigation }) => ({
          title: 'Hábitos',
          headerRight: () => (
            <ProfileHeaderButton
              navigation={navigation.getParent()?.getParent() as NavigationProp<RootStackParamList>}
            />
          ),
        })}
      />
      <Stack.Screen name="HabitForm" component={HabitFormScreen} options={{ title: 'Hábito' }} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Detalhe do hábito' }} />
    </Stack.Navigator>
  );
}

export default HabitsNavigator;
