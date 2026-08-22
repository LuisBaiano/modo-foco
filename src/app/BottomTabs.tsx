import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigationProp } from '@react-navigation/native';
import { StyleSheet, Text } from 'react-native';
import DashboardScreen from '../features/dashboard/DashboardScreen';
import HabitsNavigator from '../features/habits/HabitsNavigator';
import StudyScreen from '../features/study/StudyScreen';
import TasksScreen from '../features/tasks/TasksScreen';
import HealthScreen from '../features/health/HealthScreen';
import ProfileHeaderButton from './ProfileHeaderButton';
import type { RootStackParamList } from './RootNavigator';

export type BottomTabParamList = {
  Home: undefined;
  Habitos: undefined;
  Estudos: undefined;
  Tarefas: undefined;
  Saude: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_ICONS: Record<keyof BottomTabParamList, string> = {
  Home: '🏠',
  Habitos: '✅',
  Estudos: '📚',
  Tarefas: '📝',
  Saude: '💪',
};

function TabIcon({ route }: { route: keyof BottomTabParamList }) {
  return <Text style={styles.tabIcon}>{TAB_ICONS[route]}</Text>;
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        headerRight: () => (
          <ProfileHeaderButton navigation={navigation.getParent() as NavigationProp<RootStackParamList>} />
        ),
        tabBarIcon: () => <TabIcon route={route.name} />,
      })}>
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen
        name="Habitos"
        component={HabitsNavigator}
        options={{ headerShown: false, title: 'Hábitos' }}
      />
      <Tab.Screen name="Estudos" component={StudyScreen} />
      <Tab.Screen name="Tarefas" component={TasksScreen} />
      <Tab.Screen name="Saude" component={HealthScreen} options={{ title: 'Saúde' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
});

export default BottomTabs;
