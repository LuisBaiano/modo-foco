import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../app/ThemeContext';
import { useTasks } from './useTasks';
import type { TasksStackParamList } from './TasksNavigator';
import type { Priority, TaskWithProject } from './tasksRepository';

const PRIORITY_COLOR: Record<Priority, string> = {
  high: '#dc2626',
  medium: '#ea580c',
  low: '#6b7280',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Converte a data crua (YYYY-MM-DD) no badge exibido: Atrasada, Hoje, Amanhã ou dd/mm. */
function formatDueDate(dueDate: string | null): { label: string; overdue: boolean } | null {
  if (!dueDate) {
    return null;
  }
  const today = todayISODate();
  if (dueDate < today) {
    return { label: 'Atrasada', overdue: true };
  }
  if (dueDate === today) {
    return { label: 'Hoje', overdue: false };
  }
  if (dueDate === tomorrowISODate()) {
    return { label: 'Amanhã', overdue: false };
  }
  const [, month, day] = dueDate.split('-');
  return { label: `${day}/${month}`, overdue: false };
}

/** Tela principal da aba Tarefas: lista com toggle de concluída + botão de criar. */
function TasksListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TasksStackParamList>>();
  const { tasks, loading, toggle } = useTasks();
  const { accent } = useTheme();

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[styles.listContent, tasks.length === 0 && styles.emptyContainer]}
        renderItem={({ item }) => (
          <TaskRow
            item={item}
            onToggle={() => toggle(item.id)}
            onOpen={() => navigation.navigate('TaskForm', { taskId: item.id })}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma tarefa ainda</Text>
            </View>
          ) : undefined
        }
      />
      <Pressable
        style={[styles.fab, { backgroundColor: accent, shadowColor: accent }]}
        onPress={() => navigation.navigate('TaskForm', undefined)}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

function TaskRow({ item, onToggle, onOpen }: { item: TaskWithProject; onToggle: () => void; onOpen: () => void }) {
  const due = formatDueDate(item.dueDate);
  return (
    <View style={[styles.card, item.completed && styles.cardDone]}>
      <Pressable onPress={onToggle} hitSlop={8} style={[styles.checkbox, item.completed && styles.checkboxDone]}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>
      <Pressable style={styles.rowBody} onPress={onOpen}>
        <Text style={[styles.rowTitle, item.completed && styles.rowTitleDone]}>{item.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: PRIORITY_COLOR[item.priority] + '22' }]}>
            <Text style={[styles.badgeText, { color: PRIORITY_COLOR[item.priority] }]}>
              {PRIORITY_LABEL[item.priority]}
            </Text>
          </View>
          {item.projectName && (
            <View style={[styles.badge, { backgroundColor: (item.projectColor ?? '#999') + '22' }]}>
              <Text style={[styles.badgeText, { color: item.projectColor ?? '#666' }]}>{item.projectName}</Text>
            </View>
          )}
          {due && (
            <View style={[styles.badge, due.overdue && styles.badgeOverdue]}>
              <Text style={[styles.badgeText, due.overdue && styles.badgeOverdueText]}>{due.label}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    opacity: 0.6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#4c1d95',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardDone: {
    backgroundColor: '#ecfdf5',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: 'white',
    fontWeight: '700',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  rowTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
  },
  badgeOverdue: {
    backgroundColor: '#fef2f2',
  },
  badgeOverdueText: {
    color: '#dc2626',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabIcon: {
    color: 'white',
    fontSize: 30,
    lineHeight: 32,
  },
});

export default TasksListScreen;
