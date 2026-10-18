import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import HeroIcon from '../../app/HeroIcon';
import { useTheme, type Palette } from '../../app/ThemeContext';
import { useRoutine } from './useRoutine';
import type { RoutineStackParamList } from './RoutineNavigator';
import type { RoutineItem } from './routineRepository';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDays(daysOfWeek: number[]): string {
  if (daysOfWeek.length === 7) {
    return 'Todo dia';
  }
  return daysOfWeek.map(day => DAY_LABELS[day]).join(', ');
}

/** Tela principal da aba Rotina: lista dos blocos de horário + botão de criar. */
function RoutineListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RoutineStackParamList>>();
  const { items, loading, addKmToItem } = useRoutine();
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.listContent, items.length === 0 && styles.emptyContainer]}
        renderItem={({ item }) => (
          <RoutineRow
            item={item}
            accent={accent}
            colors={colors}
            styles={styles}
            onOpen={() => navigation.navigate('RoutineForm', { itemId: item.id })}
            onAddKm={km => addKmToItem(item.id, km)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum bloco de rotina ainda</Text>
            </View>
          ) : undefined
        }
      />
      <Pressable
        style={[styles.fab, { backgroundColor: accent, shadowColor: accent }]}
        onPress={() => navigation.navigate('RoutineForm', undefined)}>
        <HeroIcon name="plus" size={26} color="white" />
      </Pressable>
    </View>
  );
}

function RoutineRow({
  item,
  accent,
  colors,
  styles,
  onOpen,
  onAddKm,
}: {
  item: RoutineItem;
  accent: string;
  colors: Palette;
  styles: ReturnType<typeof createStyles>;
  onOpen: () => void;
  onAddKm: (km: number) => void;
}) {
  const [kmInput, setKmInput] = useState('');

  const handleAddKm = () => {
    const km = parseFloat(kmInput.replace(',', '.'));
    if (!Number.isNaN(km) && km > 0) {
      onAddKm(km);
      setKmInput('');
    }
  };

  return (
    <View style={styles.card}>
      <Pressable style={styles.rowBody} onPress={onOpen}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={[styles.rowSubtitle, { color: accent }]}>
          {item.startTime}–{item.endTime} · {formatDays(item.daysOfWeek)}
        </Text>
      </Pressable>

      {item.trackKm && (
        <View style={styles.kmRow}>
          <Text style={styles.kmToday}>{item.todayKm}km hoje</Text>
          <TextInput
            style={styles.kmInput}
            value={kmInput}
            onChangeText={setKmInput}
            placeholder="km"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
          <Pressable style={[styles.kmAddButton, { backgroundColor: accent }]} onPress={handleAddKm}>
            <HeroIcon name="plus" size={16} color="white" />
          </Pressable>
        </View>
      )}
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
    kmRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 14,
    },
    kmToday: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 13,
    },
    kmInput: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      width: 64,
      textAlign: 'center',
      color: colors.text,
      fontSize: 14,
    },
    kmAddButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
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

export default RoutineListScreen;
