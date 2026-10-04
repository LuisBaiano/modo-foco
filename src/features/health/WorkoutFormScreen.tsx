import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme, type Palette } from '../../app/ThemeContext';
import type { HealthStackParamList } from './HealthNavigator';
import { type WorkoutType, logWorkout } from './healthRepository';
import { emitCelebration } from '../gamification/celebrationBus';

const WORKOUT_TYPES: { value: WorkoutType; label: string }[] = [
  { value: 'walk', label: 'Caminhada' },
  { value: 'strength', label: 'Musculação' },
  { value: 'cycling', label: 'Ciclismo' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'other', label: 'Outro' },
];

/** Formulário de registro de treino do dia. */
function WorkoutFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HealthStackParamList>>();
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [type, setType] = useState<WorkoutType>('walk');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const durationMinutes = parseInt(duration, 10);
  const isValid = !Number.isNaN(durationMinutes) && durationMinutes > 0;

  const handleSave = async () => {
    if (!isValid) {
      return;
    }
    const reward = await logWorkout({ type, durationMinutes, notes: notes.trim() || null });
    emitCelebration(reward);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: accent }]}>Tipo</Text>
      <View style={styles.chipWrap}>
        {WORKOUT_TYPES.map(option => (
          <Pressable
            key={option.value}
            style={[styles.chip, type === option.value && { backgroundColor: accent }]}
            onPress={() => setType(option.value)}>
            <Text style={[styles.chipText, { color: type === option.value ? 'white' : accent }]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: accent }]}>Duração (minutos)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        placeholder="Ex: 30"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
      />

      <Text style={[styles.label, { color: accent }]}>Anotação (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Como foi o treino..."
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <Pressable
        style={[styles.saveButton, { backgroundColor: accent }, !isValid && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!isValid}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </Pressable>
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
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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

export default WorkoutFormScreen;
