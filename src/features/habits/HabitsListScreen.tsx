import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import HeroIcon from '../../app/HeroIcon';
import { useTheme, type Palette } from '../../app/ThemeContext';
import { useHabits } from './useHabits';
import type { HabitsStackParamList } from './HabitsNavigator';
import type { HabitWithTodayStatus } from './habitsRepository';

/** Tela principal da aba Hábitos: lista com toggle do dia + botão de criar. */
function HabitsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HabitsStackParamList>>();
  const { habits, loading, toggle } = useHabits();
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[styles.listContent, habits.length === 0 && styles.emptyContainer]}
        renderItem={({ item }) => (
          <HabitRow
            item={item}
            accent={accent}
            styles={styles}
            onToggle={() => toggle(item.id)}
            onOpen={() => navigation.navigate('HabitDetail', { habitId: item.id })}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum hábito ainda</Text>
            </View>
          ) : undefined
        }
      />
      <Pressable
        style={[styles.fab, { backgroundColor: accent, shadowColor: accent }]}
        onPress={() => navigation.navigate('HabitForm', undefined)}>
        <HeroIcon name="plus" size={26} color="white" />
      </Pressable>
    </View>
  );
}

function HabitRow({
  item,
  accent,
  styles,
  onToggle,
  onOpen,
}: {
  item: HabitWithTodayStatus;
  accent: string;
  styles: ReturnType<typeof createStyles>;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <View style={[styles.card, item.completedToday && styles.cardDone]}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={[styles.checkbox, item.completedToday && styles.checkboxDone]}>
        {item.completedToday && <HeroIcon name="check" size={16} color="white" />}
      </Pressable>
      <Pressable style={styles.rowBody} onPress={onOpen}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={[styles.rowSubtitle, { color: accent }]}>
          {item.frequency === 'daily' ? 'Diário' : 'Semanal'}
        </Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.textSecondary,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
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
      backgroundColor: colors.successBg,
    },
    checkbox: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    checkboxDone: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    rowBody: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    rowSubtitle: {
      fontSize: 13,
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
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowOpacity: 0.4,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
  });
}

export default HabitsListScreen;
