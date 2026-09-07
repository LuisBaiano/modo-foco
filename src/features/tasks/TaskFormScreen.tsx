import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../app/ThemeContext';
import type { TasksStackParamList } from './TasksNavigator';
import { type Priority, createTask, getTask, updateTask } from './tasksRepository';
import { listProjects } from './projectsRepository';

type ProjectOption = Awaited<ReturnType<typeof listProjects>>[number];

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

/**
 * Formulário de criar/editar tarefa. Prazo é por chips rápidos (sem
 * prazo/hoje/amanhã) em vez de date-picker — evita puxar uma lib nova,
 * mesma decisão tomada pro targetTime do hábito.
 */
function TaskFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TasksStackParamList>>();
  const route = useRoute<Props['route']>();
  const taskId = route.params?.taskId;
  const { accent } = useTheme();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueOption, setDueOption] = useState<DueOption>('none');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  useEffect(() => {
    listProjects().then(setProjects);
  }, []);

  useEffect(() => {
    if (taskId != null) {
      getTask(taskId).then(task => {
        if (!task) {
          return;
        }
        setTitle(task.title);
        setPriority(task.priority as Priority);
        setProjectId(task.projectId);
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
    const input = { title: title.trim(), priority, dueDate, projectId };
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
        autoFocus
      />

      <Text style={[styles.label, { color: accent }]}>Prioridade</Text>
      <View style={styles.segmented}>
        <ChoiceChip label="Baixa" selected={priority === 'low'} accent={accent} onPress={() => setPriority('low')} />
        <ChoiceChip
          label="Média"
          selected={priority === 'medium'}
          accent={accent}
          onPress={() => setPriority('medium')}
        />
        <ChoiceChip
          label="Alta"
          selected={priority === 'high'}
          accent={accent}
          onPress={() => setPriority('high')}
        />
      </View>

      <Text style={[styles.label, { color: accent }]}>Prazo</Text>
      <View style={styles.segmented}>
        <ChoiceChip
          label="Sem prazo"
          selected={dueOption === 'none'}
          accent={accent}
          onPress={() => setDueOption('none')}
        />
        <ChoiceChip
          label="Hoje"
          selected={dueOption === 'today'}
          accent={accent}
          onPress={() => setDueOption('today')}
        />
        <ChoiceChip
          label="Amanhã"
          selected={dueOption === 'tomorrow'}
          accent={accent}
          onPress={() => setDueOption('tomorrow')}
        />
      </View>

      {projects.length > 0 && (
        <>
          <Text style={[styles.label, { color: accent }]}>Projeto</Text>
          <View style={styles.chipWrap}>
            <ChoiceChip label="Nenhum" selected={projectId == null} accent={accent} onPress={() => setProjectId(null)} />
            {projects.map(project => (
              <ChoiceChip
                key={project.id}
                label={project.name}
                selected={projectId === project.id}
                accent={project.color}
                onPress={() => setProjectId(project.id)}
              />
            ))}
          </View>
        </>
      )}

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
  onPress,
}: {
  label: string;
  selected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, selected && { backgroundColor: accent }]} onPress={onPress}>
      <Text style={[styles.chipText, { color: selected ? 'white' : accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
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
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    elevation: 1,
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'white',
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

export default TaskFormScreen;
