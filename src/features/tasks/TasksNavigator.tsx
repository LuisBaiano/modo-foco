import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import ProfileHeaderButton from '../../app/ProfileHeaderButton';
import type { RootStackParamList } from '../../app/RootNavigator';
import TasksListScreen from './TasksListScreen';
import TaskFormScreen from './TaskFormScreen';

export type TasksStackParamList = {
  TasksList: undefined;
  TaskForm: { taskId?: number } | undefined;
};

const Stack = createNativeStackNavigator<TasksStackParamList>();

/** Stack aninhado da aba Tarefas: lista → formulário. */
function TasksNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TasksList"
        component={TasksListScreen}
        options={({ navigation }) => ({
          title: 'Tarefas',
          headerRight: () => (
            <ProfileHeaderButton
              navigation={navigation.getParent()?.getParent() as NavigationProp<RootStackParamList>}
            />
          ),
        })}
      />
      <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: 'Tarefa' }} />
    </Stack.Navigator>
  );
}

export default TasksNavigator;
