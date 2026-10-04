import { useMemo, useState } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ColorPicker from '../../app/ColorPicker';
import HeroIcon from '../../app/HeroIcon';
import { ACCENT_PRESETS, useTheme, type Palette } from '../../app/ThemeContext';
import type { ColorSchemePreference } from '../settings/settingsRepository';
import FocusBlock from '../../native/FocusBlock';
import { ACHIEVEMENTS } from '../gamification/achievementsCatalog';
import { useGamification } from '../gamification/useGamification';

const SCHEME_OPTIONS: { value: ColorSchemePreference; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

function formatUnlockedDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** Tela de Perfil: XP/streaks, conquistas, tema, cor de destaque e teste do módulo nativo. */
function ProfileScreen() {
  const [pingResult, setPingResult] = useState<string | null>(null);
  const { accent, setAccent, colorScheme, setColorScheme, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { summary, unlockedAchievements, totalAchievements } = useGamification();

  const unlockedKeys = new Set(unlockedAchievements.map(a => a.key));
  const unlockedByKey = new Map(unlockedAchievements.map(a => [a.key, a]));

  const handlePing = async () => {
    try {
      const result = await FocusBlock.ping();
      setPingResult(result);
    } catch (error) {
      setPingResult(`Erro: ${String(error)}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.xpCard}>
        <Text style={styles.xpValue}>{summary.totalXp} XP</Text>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>{summary.currentStreak}</Text>
            <Text style={styles.streakLabel}>sequência</Text>
          </View>
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>{summary.longestStreak}</Text>
            <Text style={styles.streakLabel}>recorde</Text>
          </View>
          <View style={styles.streakItem}>
            <Text style={styles.streakValue}>{summary.workoutStreak}</Text>
            <Text style={styles.streakLabel}>treino seguido</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={[styles.sectionLabel, { color: accent }]}>
          Conquistas ({unlockedAchievements.length}/{totalAchievements})
        </Text>
        {ACHIEVEMENTS.map(achievement => {
          const unlocked = unlockedKeys.has(achievement.key);
          const unlockedRow = unlockedByKey.get(achievement.key);
          return (
            <View key={achievement.key} style={[styles.achievementRow, !unlocked && styles.achievementRowLocked]}>
              <View style={styles.achievementTextColumn}>
                <Text style={[styles.achievementTitle, !unlocked && styles.achievementTitleLocked]}>
                  {unlocked ? achievement.title : '???'}
                </Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
              {unlocked && unlockedRow && (
                <Text style={styles.achievementDate}>{formatUnlockedDate(unlockedRow.unlockedAt)}</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: accent }]}>Tema</Text>
        <View style={styles.swatchRow}>
          {SCHEME_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              onPress={() => setColorScheme(option.value)}
              style={[
                styles.schemeOption,
                colorScheme === option.value && { backgroundColor: accent, borderColor: accent },
              ]}>
              <Text style={[styles.schemeOptionText, { color: colorScheme === option.value ? 'white' : accent }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, styles.customLabel, { color: accent }]}>Cor de destaque</Text>
        <View style={styles.swatchRow}>
          {ACCENT_PRESETS.map(preset => (
            <Pressable
              key={preset.value}
              onPress={() => setAccent(preset.value)}
              hitSlop={8}
              style={[
                styles.swatch,
                { backgroundColor: preset.value },
                accent === preset.value && styles.swatchSelected,
              ]}>
              {accent === preset.value && <HeroIcon name="check" size={18} color="white" />}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, styles.customLabel, { color: accent }]}>Cor personalizada</Text>
        <ColorPicker value={accent} onChange={setAccent} />
      </View>

      <View style={styles.testSection}>
        <Button title="Testar módulo nativo FocusBlock" onPress={handlePing} />
        {pingResult != null && <Text style={styles.pingResult}>{pingResult}</Text>}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    xpCard: {
      marginTop: 20,
      width: '100%',
      backgroundColor: '#1f2937',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      elevation: 2,
    },
    xpValue: {
      color: '#facc15',
      fontSize: 32,
      fontWeight: '800',
    },
    streakRow: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 24,
    },
    streakItem: {
      alignItems: 'center',
    },
    streakValue: {
      color: 'white',
      fontSize: 20,
      fontWeight: '700',
    },
    streakLabel: {
      color: '#9ca3af',
      fontSize: 11,
      marginTop: 2,
    },
    achievementsSection: {
      marginTop: 32,
      width: '100%',
    },
    achievementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      marginBottom: 8,
      elevation: 1,
    },
    achievementRowLocked: {
      opacity: 0.5,
    },
    achievementTextColumn: {
      flexShrink: 1,
    },
    achievementTitle: {
      fontWeight: '700',
      fontSize: 14,
      color: colors.text,
    },
    achievementTitleLocked: {
      color: colors.textSecondary,
    },
    achievementDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    achievementDate: {
      fontSize: 11,
      color: colors.textMuted,
      marginLeft: 8,
    },
    section: {
      marginTop: 32,
      alignItems: 'center',
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 12,
    },
    customLabel: {
      marginTop: 28,
    },
    swatchRow: {
      flexDirection: 'row',
      gap: 14,
    },
    schemeOption: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border,
    },
    schemeOptionText: {
      fontWeight: '700',
      fontSize: 13,
    },
    swatch: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchSelected: {
      borderWidth: 3,
      borderColor: '#00000055',
    },
    testSection: {
      marginTop: 40,
      alignItems: 'center',
      gap: 8,
    },
    pingResult: {
      marginTop: 8,
      fontSize: 14,
      color: colors.text,
    },
  });
}

export default ProfileScreen;
