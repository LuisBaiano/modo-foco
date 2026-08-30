import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import { Pressable, StyleSheet } from 'react-native';
import HeroIcon from '../../app/HeroIcon';
import ProfileHeaderButton from '../../app/ProfileHeaderButton';
import type { RootStackParamList } from '../../app/RootNavigator';
import TasksListScreen from './TasksListScreen';
import TaskFormScreen from './TaskFormScreen';
import ProjectsListScreen from './ProjectsListScreen';
import ProjectFormScreen from './ProjectFormScreen';

export type TasksStackParamList = {
  TasksList: undefined;
  TaskForm: { taskId?: number } | undefined;
  ProjectsList: undefined;
  ProjectForm: { projectId?: number } | undefined;
};

const Stack = createNativeStackNavigator<TasksStackParamList>();

function ProjectsHeaderButton({ navigation }: { navigation: NavigationProp<TasksStackParamList> }) {
  return (
    <Pressable onPress={() => navigation.navigate('ProjectsList')} hitSlop={8} style={styles.headerButton}>
      <HeroIcon name="folder" size={20} color="#374151" />
    </Pressable>
  );
}

/** Stack aninhado da aba Tarefas: tarefas e projetos são dois fluxos ligados pelo botão de pasta no header. */
function TasksNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TasksList"
        component={TasksListScreen}
        options={({ navigation }) => ({
          title: 'Tarefas',
          headerLeft: () => <ProjectsHeaderButton navigation={navigation} />,
          headerRight: () => (
            <ProfileHeaderButton
              navigation={navigation.getParent()?.getParent() as NavigationProp<RootStackParamList>}
            />
          ),
        })}
      />
      <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Tarefa' }} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} options={{ title: 'Projetos' }} />
      <Stack.Screen name="ProjectForm" component={ProjectFormScreen} options={{ title: 'Projeto' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginLeft: 16,
  },
});

export default TasksNavigator;
