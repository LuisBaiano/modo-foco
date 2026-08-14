import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigationProp } from '@react-navigation/native';
import { Pressable, StyleSheet, Text } from 'react-native';
import DashboardScreen from '../features/dashboard/DashboardScreen';
import HabitsScreen from '../features/habits/HabitsScreen';
import StudyScreen from '../features/study/StudyScreen';
import TasksScreen from '../features/tasks/TasksScreen';
import HealthScreen from '../features/health/HealthScreen';
import type { RootStackParamList } from './RootNavigator';

export type BottomTabParamList = {
  Home: undefined;
  Habitos: undefined;
  Estudos: undefined;
  Tarefas: undefined;
  Saude: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

function ProfileHeaderButton({ navigation }: { navigation: NavigationProp<RootStackParamList> }) {
  return (
    <Pressable onPress={() => navigation.navigate('Profile')} hitSlop={8} style={styles.headerButton}>
      <Text style={styles.headerButtonIcon}>👤</Text>
    </Pressable>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerRight: () => (
          <ProfileHeaderButton navigation={navigation.getParent() as NavigationProp<RootStackParamList>} />
        ),
      })}>
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Habitos" component={HabitsScreen} options={{ title: 'Hábitos' }} />
      <Tab.Screen name="Estudos" component={StudyScreen} />
      <Tab.Screen name="Tarefas" component={TasksScreen} />
      <Tab.Screen name="Saude" component={HealthScreen} options={{ title: 'Saúde' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
  },
  headerButtonIcon: {
    fontSize: 20,
  },
});

export default BottomTabs;
