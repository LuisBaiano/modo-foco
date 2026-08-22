import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useHabits } from './useHabits';
import type { HabitsStackParamList } from './HabitsNavigator';
import type { HabitWithTodayStatus } from './habitsRepository';

function HabitsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HabitsStackParamList>>();
  const { habits, loading, toggle } = useHabits();

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={habits.length === 0 && styles.emptyContainer}
        renderItem={({ item }) => (
          <HabitRow item={item} onToggle={() => toggle(item.id)} onOpen={() => navigation.navigate('HabitDetail', { habitId: item.id })} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum hábito ainda</Text>
            </View>
          ) : undefined
        }
      />
      <Pressable style={styles.fab} onPress={() => navigation.navigate('HabitForm', undefined)}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

function HabitRow({
  item,
  onToggle,
  onOpen,
}: {
  item: HabitWithTodayStatus;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={[styles.checkbox, item.completedToday && styles.checkboxDone]}>
        {item.completedToday && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>
      <Pressable style={styles.rowBody} onPress={onOpen}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowSubtitle}>{item.frequency === 'daily' ? 'Diário' : 'Semanal'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#00000022',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#00000044',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  checkmark: {
    color: 'white',
    fontWeight: '700',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1565c0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabIcon: {
    color: 'white',
    fontSize: 28,
    lineHeight: 30,
  },
});

export default HabitsListScreen;
