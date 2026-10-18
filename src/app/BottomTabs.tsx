import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigationProp } from '@react-navigation/native';
import DashboardScreen from '../features/dashboard/DashboardScreen';
import HabitsNavigator from '../features/habits/HabitsNavigator';
import StudyNavigator from '../features/study/StudyNavigator';
import TasksNavigator from '../features/tasks/TasksNavigator';
import HealthNavigator from '../features/health/HealthNavigator';
import RoutineNavigator from '../features/routine/RoutineNavigator';
import HeroIcon, { type IconName } from './HeroIcon';
import ProfileHeaderButton from './ProfileHeaderButton';
import { useTheme } from './ThemeContext';
import type { RootStackParamList } from './RootNavigator';

export type BottomTabParamList = {
  Home: undefined;
  Habitos: undefined;
  Estudos: undefined;
  Tarefas: undefined;
  Rotina: undefined;
  Saude: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_ICON_NAMES: Record<keyof BottomTabParamList, IconName> = {
  Home: 'home',
  Habitos: 'checkCircle',
  Estudos: 'bookOpen',
  Tarefas: 'clipboardDocumentList',
  Rotina: 'clock',
  Saude: 'heart',
};

/** Navegação de abas do app. Abas com fluxo próprio (Hábitos, Tarefas) usam um stack aninhado. */
function BottomTabs() {
  const { accent, colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        headerRight: () => (
          <ProfileHeaderButton navigation={navigation.getParent() as NavigationProp<RootStackParamList>} />
        ),
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: colors.text,
        tabBarIcon: ({ color }) => (
          <HeroIcon name={TAB_ICON_NAMES[route.name as keyof BottomTabParamList]} size={22} color={color} />
        ),
      })}>
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen
        name="Habitos"
        component={HabitsNavigator}
        options={{ headerShown: false, title: 'Hábitos' }}
      />
      <Tab.Screen
        name="Estudos"
        component={StudyNavigator}
        options={{ headerShown: false, title: 'Estudos' }}
      />
      <Tab.Screen
        name="Tarefas"
        component={TasksNavigator}
        options={{ headerShown: false, title: 'Tarefas' }}
      />
      <Tab.Screen
        name="Rotina"
        component={RoutineNavigator}
        options={{ headerShown: false, title: 'Rotina' }}
      />
      <Tab.Screen
        name="Saude"
        component={HealthNavigator}
        options={{ headerShown: false, title: 'Saúde' }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;
