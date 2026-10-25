import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import HeroIcon from '../../app/HeroIcon';
import SelectionActionBar from '../../app/SelectionActionBar';
import { useSelection } from '../../app/useSelection';
import { useTheme, type Palette } from '../../app/ThemeContext';
import { useTasks } from './useTasks';
import type { TasksStackParamList } from './TasksNavigator';
import type { Priority, TaskWithTags } from './tasksRepository';

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
  const { tasks, loading, toggle, remove } = useTasks();
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selected, isSelecting, start, toggle: toggleSelected, clear } = useSelection();

  const handleDelete = () => {
    const ids = Array.from(selected);
    Alert.alert('Excluir tarefas', `Excluir ${ids.length} tarefa${ids.length === 1 ? '' : 's'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await remove(ids);
          clear();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.emptyContainer,
          isSelecting && styles.listContentSelecting,
        ]}
        renderItem={({ item }) => (
          <TaskRow
            item={item}
            styles={styles}
            accent={accent}
            isSelecting={isSelecting}
            isSelected={selected.has(item.id)}
            onToggle={() => toggle(item.id)}
            onOpen={() =>
              isSelecting
                ? toggleSelected(item.id)
                : navigation.navigate('TaskForm', { taskId: item.id })
            }
            onLongPress={() => start(item.id)}
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
      {!isSelecting && (
        <Pressable
          style={[styles.fab, { backgroundColor: accent, shadowColor: accent }]}
          onPress={() => navigation.navigate('TaskForm', undefined)}>
          <HeroIcon name="plus" size={26} color="white" />
        </Pressable>
      )}
      {isSelecting && (
        <SelectionActionBar count={selected.size} colors={colors} onCancel={clear} onDelete={handleDelete} />
      )}
    </View>
  );
}

function TaskRow({
  item,
  styles,
  accent,
  isSelecting,
  isSelected,
  onToggle,
  onOpen,
  onLongPress,
}: {
  item: TaskWithTags;
  styles: ReturnType<typeof createStyles>;
  accent: string;
  isSelecting: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onLongPress: () => void;
}) {
  const due = formatDueDate(item.dueDate);
  return (
    <View style={[styles.card, item.completed && styles.cardDone, isSelected && { borderWidth: 2, borderColor: accent }]}>
      {isSelecting ? (
        <View style={[styles.checkbox, isSelected && { backgroundColor: accent, borderColor: accent }]}>
          {isSelected && <HeroIcon name="check" size={14} color="white" />}
        </View>
      ) : (
        <Pressable onPress={onToggle} hitSlop={8} style={[styles.checkbox, item.completed && styles.checkboxDone]}>
          {item.completed && <HeroIcon name="check" size={14} color="white" />}
        </Pressable>
      )}
      <Pressable style={styles.rowBody} onPress={onOpen} onLongPress={onLongPress}>
        <Text style={[styles.rowTitle, item.completed && styles.rowTitleDone]}>{item.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: PRIORITY_COLOR[item.priority] + '22' }]}>
            <Text style={[styles.badgeText, { color: PRIORITY_COLOR[item.priority] }]}>
              {PRIORITY_LABEL[item.priority]}
            </Text>
          </View>
          {item.tags.map(tag => (
            <View key={tag} style={styles.badge}>
              <Text style={styles.badgeText}>#{tag}</Text>
            </View>
          ))}
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

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 100,
    },
    emptyContainer: {
      flexGrow: 1,
    },
    listContentSelecting: {
      paddingBottom: 90,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: colors.textSecondary,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
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
      backgroundColor: colors.successBg,
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      marginTop: 2,
    },
    checkboxDone: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    rowBody: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
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
      backgroundColor: colors.surfaceAlt,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    badgeOverdue: {
      backgroundColor: colors.dangerBg,
    },
    badgeOverdueText: {
      color: colors.danger,
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
  });
}

export default TasksListScreen;
