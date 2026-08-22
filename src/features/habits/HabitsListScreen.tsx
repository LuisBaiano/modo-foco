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
        contentContainerStyle={[styles.listContent, habits.length === 0 && styles.emptyContainer]}
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
    <View style={[styles.card, item.completedToday && styles.cardDone]}>
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

const ACCENT = '#7c3aed';
const SUCCESS = '#10b981';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#4c1d95',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardDone: {
    backgroundColor: '#ecfdf5',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkboxDone: {
    backgroundColor: SUCCESS,
    borderColor: SUCCESS,
  },
  checkmark: {
    color: 'white',
    fontWeight: '700',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  rowSubtitle: {
    fontSize: 13,
    color: ACCENT,
    marginTop: 4,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: ACCENT,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabIcon: {
    color: 'white',
    fontSize: 30,
    lineHeight: 32,
  },
});

export default HabitsListScreen;
