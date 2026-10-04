import { useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import HeroIcon from '../../app/HeroIcon';
import { useTheme, type Palette } from '../../app/ThemeContext';
import type { TasksStackParamList } from './TasksNavigator';
import { createProject, deleteProject, getProject, updateProject } from './projectsRepository';

const PROJECT_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#059669',
  '#ea580c',
  '#db2777',
  '#0891b2',
  '#ca8a04',
  '#4b5563',
];

type Props = NativeStackScreenProps<TasksStackParamList, 'ProjectForm'>;

/** Formulário de criar/editar projeto. Botão de excluir só aparece no modo edição. */
function ProjectFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TasksStackParamList>>();
  const route = useRoute<Props['route']>();
  const projectId = route.params?.projectId;
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  useEffect(() => {
    if (projectId != null) {
      getProject(projectId).then(project => {
        if (project) {
          setName(project.name);
          setDescription(project.description ?? '');
          setColor(project.color);
        }
      });
    }
  }, [projectId]);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }
    const input = { name: name.trim(), color, description: description.trim() || null };
    if (projectId != null) {
      await updateProject(projectId, input);
    } else {
      await createProject(input);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (projectId == null) {
      return;
    }
    Alert.alert('Excluir projeto', `Excluir "${name}"? As tarefas continuam, só ficam sem projeto.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteProject(projectId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: accent }]}>Nome</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Reforma da casa, TCC..."
        placeholderTextColor={colors.textSecondary}
        autoFocus
      />

      <Text style={[styles.label, { color: accent }]}>Cor</Text>
      <View style={styles.swatchRow}>
        {PROJECT_COLORS.map(option => (
          <Pressable
            key={option}
            onPress={() => setColor(option)}
            style={[styles.swatch, { backgroundColor: option }, color === option && styles.swatchSelected]}>
            {color === option && <HeroIcon name="check" size={18} color="white" />}
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: accent }]}>Descrição (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Do que se trata esse projeto..."
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <Pressable
        style={[styles.saveButton, { backgroundColor: accent }, !name.trim() && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!name.trim()}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </Pressable>

      {projectId != null && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Excluir projeto</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
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
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    swatchRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    swatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchSelected: {
      borderWidth: 3,
      borderColor: '#00000055',
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
    deleteButton: {
      marginTop: 16,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: colors.dangerBg,
    },
    deleteButtonText: {
      color: colors.danger,
      fontWeight: '700',
    },
  });
}

export default ProjectFormScreen;
