import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, type Palette } from '../../app/ThemeContext';
import type { HabitsStackParamList } from './HabitsNavigator';
import {
  type HabitHistoryDay,
  deleteHabit,
  getHabit,
  getHabitHistory,
} from './habitsRepository';

type Props = NativeStackScreenProps<HabitsStackParamList, 'HabitDetail'>;

/** Detalhe do hábito: grade de consistência dos últimos 30 dias + editar/excluir. */
function HabitDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HabitsStackParamList>>();
  const route = useRoute<Props['route']>();
  const { habitId } = route.params;
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [history, setHistory] = useState<HabitHistoryDay[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHabit(habitId).then(habit => habit && setName(habit.name));
      getHabitHistory(habitId, 30).then(setHistory);
    }, [habitId]),
  );

  const handleDelete = () => {
    Alert.alert('Excluir hábito', `Excluir "${name}"? Isso remove todo o histórico também.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteHabit(habitId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <Text style={[styles.sectionLabel, { color: accent }]}>Últimos 30 dias</Text>
      <View style={styles.grid}>
        {history.map(day => (
          <View
            key={day.date}
            style={[styles.dot, { backgroundColor: accent + '22' }, day.completed && styles.dotDone]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={() => navigation.navigate('HabitForm', { habitId })}>
          <Text style={[styles.actionButtonText, { color: accent }]}>Editar</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
        </Pressable>
      </View>
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
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      marginTop: 28,
      marginBottom: 14,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 20,
      elevation: 1,
    },
    dot: {
      width: 22,
      height: 22,
      borderRadius: 7,
    },
    dotDone: {
      backgroundColor: colors.success,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 32,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: colors.surface,
      alignItems: 'center',
      elevation: 1,
    },
    actionButtonText: {
      fontWeight: '700',
    },
    deleteButton: {
      backgroundColor: colors.dangerBg,
    },
    deleteButtonText: {
      color: colors.danger,
    },
  });
}

export default HabitDetailScreen;
