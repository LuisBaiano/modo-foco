import { useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme, type Palette } from '../../app/ThemeContext';
import type { RoutineStackParamList } from './RoutineNavigator';
import { createRoutineItem, deleteRoutineItem, getRoutineItem, updateRoutineItem } from './routineRepository';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function parseTime(value: string): { hour: string; minute: string } {
  const [hour, minute] = value.split(':');
  return { hour: hour ?? '', minute: minute ?? '' };
}

type Props = NativeStackScreenProps<RoutineStackParamList, 'RoutineForm'>;

/** Formulário de criar/editar bloco de rotina. Sem itemId na rota = criação. */
function RoutineFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RoutineStackParamList>>();
  const route = useRoute<Props['route']>();
  const itemId = route.params?.itemId;
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [trackKm, setTrackKm] = useState(false);

  useEffect(() => {
    if (itemId != null) {
      getRoutineItem(itemId).then(item => {
        if (item) {
          setName(item.name);
          const start = parseTime(item.startTime);
          const end = parseTime(item.endTime);
          setStartHour(start.hour);
          setStartMinute(start.minute);
          setEndHour(end.hour);
          setEndMinute(end.minute);
          setDaysOfWeek(item.daysOfWeek);
          setTrackKm(item.trackKm);
        }
      });
    }
  }, [itemId]);

  function toggleDay(day: number) {
    setDaysOfWeek(current =>
      current.includes(day) ? current.filter(value => value !== day) : [...current, day].sort(),
    );
  }

  function formatTime(hour: string, minute: string): string | null {
    const parsedHour = parseInt(hour, 10);
    const parsedMinute = parseInt(minute, 10);
    const valid =
      !Number.isNaN(parsedHour) &&
      !Number.isNaN(parsedMinute) &&
      parsedHour >= 0 &&
      parsedHour <= 23 &&
      parsedMinute >= 0 &&
      parsedMinute <= 59;
    return valid ? `${String(parsedHour).padStart(2, '0')}:${String(parsedMinute).padStart(2, '0')}` : null;
  }

  const startTime = formatTime(startHour, startMinute);
  const endTime = formatTime(endHour, endMinute);
  const canSave = name.trim().length > 0 && startTime != null && endTime != null && daysOfWeek.length > 0;

  const handleSave = async () => {
    if (!canSave || !startTime || !endTime) {
      return;
    }
    const input = { name: name.trim(), startTime, endTime, daysOfWeek, trackKm };
    if (itemId != null) {
      await updateRoutineItem(itemId, input);
    } else {
      await createRoutineItem(input);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (itemId == null) {
      return;
    }
    Alert.alert('Excluir bloco', `Excluir "${name}" da rotina?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteRoutineItem(itemId);
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
        placeholder="Ex: Trabalho, Caminhada, Estudar redes..."
        placeholderTextColor={colors.textSecondary}
        autoFocus
      />

      <Text style={[styles.label, { color: accent }]}>Início</Text>
      <TimeRow
        hour={startHour}
        minute={startMinute}
        onChangeHour={setStartHour}
        onChangeMinute={setStartMinute}
        styles={styles}
        placeholderColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: accent }]}>Fim</Text>
      <TimeRow
        hour={endHour}
        minute={endMinute}
        onChangeHour={setEndHour}
        onChangeMinute={setEndMinute}
        styles={styles}
        placeholderColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: accent }]}>Repete em</Text>
      <View style={styles.dayRow}>
        {DAY_LABELS.map((label, day) => (
          <Pressable
            key={label}
            style={[styles.dayChip, daysOfWeek.includes(day) && { backgroundColor: accent }]}
            onPress={() => toggleDay(day)}>
            <Text style={[styles.dayChipText, { color: daysOfWeek.includes(day) ? 'white' : accent }]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.kmToggleRow} onPress={() => setTrackKm(!trackKm)}>
        <View style={[styles.checkbox, trackKm && { backgroundColor: accent, borderColor: accent }]} />
        <Text style={styles.kmToggleText}>Registrar km percorridos (ex: caminhada)</Text>
      </Pressable>

      <Pressable
        style={[styles.saveButton, { backgroundColor: accent }, !canSave && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!canSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </Pressable>

      {itemId != null && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Excluir bloco</Text>
        </Pressable>
      )}
    </View>
  );
}

function TimeRow({
  hour,
  minute,
  onChangeHour,
  onChangeMinute,
  styles,
  placeholderColor,
}: {
  hour: string;
  minute: string;
  onChangeHour: (value: string) => void;
  onChangeMinute: (value: string) => void;
  styles: ReturnType<typeof createStyles>;
  placeholderColor: string;
}) {
  return (
    <View style={styles.timeRow}>
      <TextInput
        style={styles.timeInput}
        value={hour}
        onChangeText={onChangeHour}
        placeholder="HH"
        placeholderTextColor={placeholderColor}
        keyboardType="number-pad"
        maxLength={2}
      />
      <Text style={styles.timeSeparator}>:</Text>
      <TextInput
        style={styles.timeInput}
        value={minute}
        onChangeText={onChangeMinute}
        placeholder="MM"
        placeholderTextColor={placeholderColor}
        keyboardType="number-pad"
        maxLength={2}
      />
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
    dayRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dayChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    dayChipText: {
      fontWeight: '700',
      fontSize: 13,
    },
    kmToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 24,
      gap: 12,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
    },
    kmToggleText: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
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

export default RoutineFormScreen;
