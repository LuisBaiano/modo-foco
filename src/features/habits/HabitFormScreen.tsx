import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { HabitsStackParamList } from './HabitsNavigator';
import { type Frequency, createHabit, getHabit, updateHabit } from './habitsRepository';

type Props = NativeStackScreenProps<HabitsStackParamList, 'HabitForm'>;

function HabitFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HabitsStackParamList>>();
  const route = useRoute<Props['route']>();
  const habitId = route.params?.habitId;

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
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Beber água, Ler 10 páginas..."
        autoFocus
      />

      <Text style={styles.label}>Frequência</Text>
      <View style={styles.segmented}>
        <FrequencyOption
          label="Diário"
          selected={frequency === 'daily'}
          onPress={() => setFrequency('daily')}
        />
        <FrequencyOption
          label="Semanal"
          selected={frequency === 'weekly'}
          onPress={() => setFrequency('weekly')}
        />
      </View>

      <Pressable style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]} onPress={handleSave} disabled={!name.trim()}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </Pressable>
    </View>
  );
}

function FrequencyOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segmentedOption, selected && styles.segmentedOptionSelected]} onPress={onPress}>
      <Text style={[styles.segmentedOptionText, selected && styles.segmentedOptionTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const ACCENT = '#7c3aed';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f3ff',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6d28d9',
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
  segmentedOptionSelected: {
    backgroundColor: ACCENT,
  },
  segmentedOptionText: {
    fontWeight: '700',
    color: '#6d28d9',
  },
  segmentedOptionTextSelected: {
    color: 'white',
  },
  saveButton: {
    marginTop: 40,
    backgroundColor: ACCENT,
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
