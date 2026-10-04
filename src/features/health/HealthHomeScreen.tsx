import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import HeroIcon from '../../app/HeroIcon';
import { useTheme, type Palette } from '../../app/ThemeContext';
import { useHealth } from './useHealth';
import type { HealthStackParamList } from './HealthNavigator';
import type { MealType, WorkoutType } from './healthRepository';

const WATER_GOAL_GLASSES = 8;

const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];

const WORKOUT_LABEL: Record<WorkoutType, string> = {
  walk: 'Caminhada',
  strength: 'Musculação',
  cycling: 'Ciclismo',
  yoga: 'Yoga',
  other: 'Outro',
};

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
};

function formatDate(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

/** Tela principal da aba Saúde: água, humor, resumo semanal e atalhos de registro. */
function HealthHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HealthStackParamList>>();
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { loading, waterGlasses, mood, weekSummary, recentWorkouts, recentMeals, addWater, selectMood } =
    useHealth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: accent }]}>Água hoje</Text>
      <View style={styles.waterCard}>
        <Text style={styles.waterCount}>
          {waterGlasses}
          <Text style={styles.waterGoal}> / {WATER_GOAL_GLASSES} copos</Text>
        </Text>
        <Pressable style={[styles.waterButton, { backgroundColor: accent }]} onPress={addWater}>
          <HeroIcon name="plus" size={22} color="white" />
        </Pressable>
      </View>

      <Text style={[styles.label, { color: accent }]}>Como você está hoje?</Text>
      <View style={styles.moodRow}>
        {MOOD_EMOJIS.map((emoji, index) => {
          const level = index + 1;
          return (
            <Pressable
              key={level}
              style={[styles.moodOption, mood === level && { borderColor: accent, borderWidth: 3 }]}
              onPress={() => selectMood(level)}>
              <Text style={styles.moodEmoji}>{emoji}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: accent }]}>Esta semana</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>{weekSummary.workoutCount}</Text>
          <Text style={styles.summaryCaption}>treinos</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>{weekSummary.workoutMinutes}min</Text>
          <Text style={styles.summaryCaption}>ativos</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>{weekSummary.waterGlasses}</Text>
          <Text style={styles.summaryCaption}>copos de água</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>
            {weekSummary.averageMood != null ? weekSummary.averageMood.toFixed(1) : '—'}
          </Text>
          <Text style={styles.summaryCaption}>humor médio</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: accent }]}
          onPress={() => navigation.navigate('WorkoutForm')}>
          <Text style={styles.actionButtonText}>Registrar treino</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: accent }]}
          onPress={() => navigation.navigate('MealForm')}>
          <Text style={styles.actionButtonText}>Registrar refeição</Text>
        </Pressable>
      </View>

      {!loading && recentWorkouts.length > 0 && (
        <>
          <Text style={[styles.label, styles.recentLabel, { color: accent }]}>Treinos recentes</Text>
          {recentWorkouts.map(workout => (
            <View key={workout.id} style={styles.recentRow}>
              <Text style={styles.recentTitle}>{WORKOUT_LABEL[workout.type as WorkoutType]}</Text>
              <Text style={styles.recentMeta}>
                {formatDate(workout.date)} · {workout.durationMinutes}min
              </Text>
            </View>
          ))}
        </>
      )}

      {!loading && recentMeals.length > 0 && (
        <>
          <Text style={[styles.label, styles.recentLabel, { color: accent }]}>Refeições recentes</Text>
          {recentMeals.map(meal => (
            <View key={meal.id} style={styles.recentRow}>
              <Text style={styles.recentTitle}>{MEAL_LABEL[meal.type as MealType]}</Text>
              <Text style={styles.recentMeta}>{formatDate(meal.date)}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 10,
    },
    recentLabel: {
      marginTop: 32,
    },
    waterCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      elevation: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    waterCount: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
    },
    waterGoal: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    waterButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
    },
    moodRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
    },
    moodOption: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 1,
    },
    moodEmoji: {
      fontSize: 24,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      elevation: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    summaryRow: {
      width: '45%',
    },
    summaryValue: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    summaryCaption: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 24,
    },
    actionButton: {
      flex: 1,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      elevation: 3,
    },
    actionButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 13,
    },
    recentRow: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 1,
    },
    recentTitle: {
      fontWeight: '700',
      color: colors.text,
    },
    recentMeta: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
}

export default HealthHomeScreen;
