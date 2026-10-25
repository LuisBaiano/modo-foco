import { useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme, type Palette } from '../../app/ThemeContext';
import type { TasksStackParamList } from './TasksNavigator';
import { type Priority, createTask, getTask, updateTask } from './tasksRepository';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskForm'>;

type DueOption = 'none' | 'today' | 'tomorrow';

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function parseTagsInput(value: string): string[] {
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * Formulário de criar/editar tarefa. Prazo é por chips rápidos (sem
 * prazo/hoje/amanhã) em vez de date-picker — evita puxar uma lib nova,
 * mesma decisão tomada pro targetTime do hábito. Tags são texto livre
 * separado por vírgula, sem catálogo/gerenciamento próprio.
 */
function TaskFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TasksStackParamList>>();
  const route = useRoute<Props['route']>();
  const taskId = route.params?.taskId;
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueOption, setDueOption] = useState<DueOption>('none');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (taskId != null) {
      getTask(taskId).then(task => {
        if (!task) {
          return;
        }
        setTitle(task.title);
        setPriority(task.priority as Priority);
        setTagsInput(task.tags.join(', '));
        if (task.dueDate === todayISODate()) {
          setDueOption('today');
        } else if (task.dueDate === tomorrowISODate()) {
          setDueOption('tomorrow');
        } else {
          setDueOption('none');
        }
      });
    }
  }, [taskId]);

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }
    const dueDate = dueOption === 'today' ? todayISODate() : dueOption === 'tomorrow' ? tomorrowISODate() : null;
    const input = { title: title.trim(), priority, dueDate, tags: parseTagsInput(tagsInput) };
    if (taskId != null) {
      await updateTask(taskId, input);
    } else {
      await createTask(input);
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: accent }]}>Título</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Ex: Enviar relatório, Comprar ingredientes..."
        placeholderTextColor={colors.textSecondary}
        autoFocus
      />

      <Text style={[styles.label, { color: accent }]}>Prioridade</Text>
      <View style={styles.segmented}>
        <ChoiceChip label="Baixa" selected={priority === 'low'} accent={accent} styles={styles} onPress={() => setPriority('low')} />
        <ChoiceChip
          label="Média"
          selected={priority === 'medium'}
          accent={accent}
          styles={styles}
          onPress={() => setPriority('medium')}
        />
        <ChoiceChip
          label="Alta"
          selected={priority === 'high'}
          accent={accent}
          styles={styles}
          onPress={() => setPriority('high')}
        />
      </View>

      <Text style={[styles.label, { color: accent }]}>Prazo</Text>
      <View style={styles.segmented}>
        <ChoiceChip
          label="Sem prazo"
          selected={dueOption === 'none'}
          accent={accent}
          styles={styles}
          onPress={() => setDueOption('none')}
        />
        <ChoiceChip
          label="Hoje"
          selected={dueOption === 'today'}
          accent={accent}
          styles={styles}
          onPress={() => setDueOption('today')}
        />
        <ChoiceChip
          label="Amanhã"
          selected={dueOption === 'tomorrow'}
          accent={accent}
          styles={styles}
          onPress={() => setDueOption('tomorrow')}
        />
      </View>

      <Text style={[styles.label, { color: accent }]}>Tags (opcional)</Text>
      <TextInput
        style={styles.input}
        value={tagsInput}
        onChangeText={setTagsInput}
        placeholder="Ex: casa, urgente, faculdade..."
        placeholderTextColor={colors.textSecondary}
      />

      <Pressable
        style={[styles.saveButton, { backgroundColor: accent }, !title.trim() && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!title.trim()}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </Pressable>
    </ScrollView>
  );
}

function ChoiceChip({
  label,
  selected,
  accent,
  styles,
  onPress,
}: {
  label: string;
  selected: boolean;
  accent: string;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, selected && { backgroundColor: accent }]} onPress={onPress}>
      <Text style={[styles.chipText, { color: selected ? 'white' : accent }]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 10,
      marginTop: 20,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      elevation: 1,
      color: colors.text,
    },
    segmented: {
      flexDirection: 'row',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: colors.surface,
    },
    chipText: {
      fontWeight: '700',
      fontSize: 13,
    },
    saveButton: {
      marginTop: 40,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      elevation: 3,
    },
    saveButtonDisabled: {
      opacity: 0.4,
    },
    saveButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
  });
}

export default TaskFormScreen;
