import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { HabitsStackParamList } from './HabitsNavigator';
import {
  type HabitHistoryDay,
  deleteHabit,
  getHabit,
  getHabitHistory,
} from './habitsRepository';

type Props = NativeStackScreenProps<HabitsStackParamList, 'HabitDetail'>;

function HabitDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HabitsStackParamList>>();
  const route = useRoute<Props['route']>();
  const { habitId } = route.params;

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

      <Text style={styles.sectionLabel}>Últimos 30 dias</Text>
      <View style={styles.grid}>
        {history.map(day => (
          <View key={day.date} style={[styles.dot, day.completed && styles.dotDone]} />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={() => navigation.navigate('HabitForm', { habitId })}>
          <Text style={styles.actionButtonText}>Editar</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    marginTop: 24,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#00000022',
  },
  dotDone: {
    backgroundColor: '#2e7d32',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#00000044',
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '600',
  },
  deleteButton: {
    borderColor: '#c62828',
  },
  deleteButtonText: {
    color: '#c62828',
  },
});

export default HabitDetailScreen;
