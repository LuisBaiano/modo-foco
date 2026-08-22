import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../app/ThemeContext';
import type { HabitsStackParamList } from './HabitsNavigator';
import { type Frequency, createHabit, getHabit, updateHabit } from './habitsRepository';

type Props = NativeStackScreenProps<HabitsStackParamList, 'HabitForm'>;

function HabitFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HabitsStackParamList>>();
  const route = useRoute<Props['route']>();
  const habitId = route.params?.habitId;
  const { accent } = useTheme();

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');

  useEffect(() => {
    if (habitId != null) {
      getHabit(habitId).then(habit => {
        if (habit) {
          setName(habit.name);
          setFrequency(habit.frequency as Frequency);
        }
      });
    }
  }, [habitId]);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }
    if (habitId != null) {
      await updateHabit(habitId, { name: name.trim(), frequency });
    } else {
      await createHabit({ name: name.trim(), frequency });
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
        autoFocus
      />

      <Text style={[styles.label, { color: accent }]}>Frequência</Text>
      <View style={styles.segmented}>
        <FrequencyOption
          label="Diário"
          selected={frequency === 'daily'}
          accent={accent}
          onPress={() => setFrequency('daily')}
        />
        <FrequencyOption
          label="Semanal"
          selected={frequency === 'weekly'}
          accent={accent}
          onPress={() => setFrequency('weekly')}
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
  onPress,
}: {
  label: string;
  selected: boolean;
  accent: string;
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7fb',
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
    gap: 10,
  },
  segmentedOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  segmentedOptionText: {
    fontWeight: '700',
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

export default HabitFormScreen;
