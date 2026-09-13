import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../app/ThemeContext';
import type { HealthStackParamList } from './HealthNavigator';
import { type MealType, logMeal } from './healthRepository';

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Café da manhã' },
  { value: 'lunch', label: 'Almoço' },
  { value: 'snack', label: 'Lanche' },
  { value: 'dinner', label: 'Jantar' },
];

/** Formulário de registro de refeição — sem calorias, só o tipo e uma nota livre. */
function MealFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HealthStackParamList>>();
  const { accent } = useTheme();

  const [type, setType] = useState<MealType>('breakfast');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    await logMeal({ type, notes: notes.trim() || null });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: accent }]}>Tipo</Text>
      <View style={styles.chipWrap}>
        {MEAL_TYPES.map(option => (
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

      <Text style={[styles.label, { color: accent }]}>Anotação (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="O que você comeu..."
        multiline
      />

      <Pressable style={[styles.saveButton, { backgroundColor: accent }]} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </Pressable>
    </View>
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
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default MealFormScreen;
