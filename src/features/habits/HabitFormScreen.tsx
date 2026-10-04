import { useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme, type Palette } from '../../app/ThemeContext';
import type { HabitsStackParamList } from './HabitsNavigator';
import { type Frequency, createHabit, getHabit, updateHabit } from './habitsRepository';

function parseTargetTime(value: string | null): { hour: string; minute: string } {
  if (!value) {
    return { hour: '', minute: '' };
  }
  const [hour, minute] = value.split(':');
  return { hour: hour ?? '', minute: minute ?? '' };
}

type Props = NativeStackScreenProps<HabitsStackParamList, 'HabitForm'>;

/** Formulário de criar/editar hábito. Sem habitId na rota = criação. */
function HabitFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HabitsStackParamList>>();
  const route = useRoute<Props['route']>();
  const habitId = route.params?.habitId;
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  useEffect(() => {
    if (habitId != null) {
      getHabit(habitId).then(habit => {
        if (habit) {
          setName(habit.name);
          setFrequency(habit.frequency as Frequency);
          const parsed = parseTargetTime(habit.targetTime);
          setHour(parsed.hour);
          setMinute(parsed.minute);
        }
      });
    }
  }, [habitId]);

  const parsedHour = parseInt(hour, 10);
  const parsedMinute = parseInt(minute, 10);
  const hasValidTime = !Number.isNaN(parsedHour) && !Number.isNaN(parsedMinute) && parsedHour >= 0 && parsedHour <= 23 && parsedMinute >= 0 && parsedMinute <= 59;
  const targetTime = hasValidTime
    ? `${String(parsedHour).padStart(2, '0')}:${String(parsedMinute).padStart(2, '0')}`
    : null;

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }
    if (habitId != null) {
      await updateHabit(habitId, { name: name.trim(), frequency, targetTime });
    } else {
      await createHabit({ name: name.trim(), frequency, targetTime });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: accent }]}>Nome</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Beber água, Ler 10 páginas..."
        placeholderTextColor={colors.textSecondary}
        autoFocus
      />

      <Text style={[styles.label, { color: accent }]}>Frequência</Text>
      <View style={styles.segmented}>
        <FrequencyOption
          label="Diário"
          selected={frequency === 'daily'}
          accent={accent}
          styles={styles}
          onPress={() => setFrequency('daily')}
        />
        <FrequencyOption
          label="Semanal"
          selected={frequency === 'weekly'}
          accent={accent}
          styles={styles}
          onPress={() => setFrequency('weekly')}
        />
      </View>

      <Text style={[styles.label, { color: accent }]}>Lembrete (opcional)</Text>
      <View style={styles.timeRow}>
        <TextInput
          style={styles.timeInput}
          value={hour}
          onChangeText={setHour}
          placeholder="HH"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text style={styles.timeSeparator}>:</Text>
        <TextInput
          style={styles.timeInput}
          value={minute}
          onChangeText={setMinute}
          placeholder="MM"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: accent }, !name.trim() && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!name.trim()}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </Pressable>
    </View>
  );
}

function FrequencyOption({
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
    <Pressable
      style={[styles.segmentedOption, selected && { backgroundColor: accent }]}
      onPress={onPress}>
      <Text style={[styles.segmentedOptionText, { color: selected ? 'white' : accent }]}>{label}</Text>
    </Pressable>
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
    segmented: {
      flexDirection: 'row',
      gap: 10,
    },
    segmentedOption: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    segmentedOptionText: {
      fontWeight: '700',
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timeInput: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      elevation: 1,
      width: 70,
      textAlign: 'center',
      color: colors.text,
    },
    timeSeparator: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
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

export default HabitFormScreen;
