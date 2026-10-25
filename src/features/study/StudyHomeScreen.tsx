import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import HeroIcon from '../../app/HeroIcon';
import SelectionActionBar from '../../app/SelectionActionBar';
import { useSelection } from '../../app/useSelection';
import { useTheme, type Palette } from '../../app/ThemeContext';
import { useStudyHome } from './useStudyHome';
import type { StudyStackParamList } from './StudyNavigator';
import { type StudyMode, type StudySession, startSession } from './studyRepository';

function formatHours(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes}min`;
  }
  return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
}

function formatSessionDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** Tela principal da aba Estudos: iniciar sessão + estatísticas da semana. */
function StudyHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<StudyStackParamList>>();
  const { accent, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { stats, recentSessions, loading, removeSessions } = useStudyHome();
  const { selected, isSelecting, start, toggle: toggleSelected, clear } = useSelection();

  const [subject, setSubject] = useState('');
  const [mode, setMode] = useState<StudyMode>('pomodoro');

  const handleDeleteSessions = () => {
    const ids = Array.from(selected);
    Alert.alert('Excluir sessões', `Excluir ${ids.length} sess${ids.length === 1 ? 'ão' : 'ões'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await removeSessions(ids);
          clear();
        },
      },
    ]);
  };

  const handleStart = async () => {
    if (!subject.trim()) {
      return;
    }
    const sessionId = await startSession({ subject: subject.trim(), mode });
    navigation.navigate('StudySession', { sessionId, mode, subject: subject.trim() });
  };

  const maxMinutes = Math.max(1, ...stats.bySubject.map(s => s.minutes));

  return (
    <View style={styles.screen}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: accent }]}>Estudar agora</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="Ex: Cálculo, Inglês, React Native..."
        placeholderTextColor={colors.textSecondary}
      />
      <View style={styles.segmented}>
        <ModeChip label="Pomodoro" selected={mode === 'pomodoro'} accent={accent} styles={styles} onPress={() => setMode('pomodoro')} />
        <ModeChip label="Livre" selected={mode === 'free'} accent={accent} styles={styles} onPress={() => setMode('free')} />
      </View>
      <Pressable
        style={[styles.startButton, { backgroundColor: accent }, !subject.trim() && styles.startButtonDisabled]}
        onPress={handleStart}
        disabled={!subject.trim()}>
        <Text style={styles.startButtonText}>Iniciar</Text>
      </Pressable>

      <Text style={[styles.label, styles.statsLabel, { color: accent }]}>Esta semana</Text>
      <View style={styles.statsCard}>
        <Text style={styles.totalHours}>{formatHours(stats.totalMinutes)}</Text>
        <Text style={styles.totalHoursCaption}>estudados</Text>

        {stats.bySubject.length > 0 && (
          <View style={styles.chart}>
            {stats.bySubject.map(item => (
              <View key={item.subject} style={styles.chartRow}>
                <Text style={styles.chartLabel} numberOfLines={1}>
                  {item.subject}
                </Text>
                <View style={styles.chartTrack}>
                  <View
                    style={[
                      styles.chartFill,
                      { width: `${(item.minutes / maxMinutes) * 100}%`, backgroundColor: accent },
                    ]}
                  />
                </View>
                <Text style={styles.chartMinutes}>{formatHours(item.minutes)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {!loading && recentSessions.length > 0 && (
        <>
          <Text style={[styles.label, styles.statsLabel, { color: accent }]}>Sessões recentes</Text>
          {recentSessions.map((session: StudySession) => {
            const isSelected = selected.has(session.id);
            return (
              <Pressable
                key={session.id}
                style={[styles.sessionRow, isSelected && { borderWidth: 2, borderColor: accent }]}
                onPress={() => (isSelecting ? toggleSelected(session.id) : undefined)}
                onLongPress={() => start(session.id)}>
                {isSelecting && (
                  <View style={[styles.sessionCheckbox, isSelected && { backgroundColor: accent, borderColor: accent }]}>
                    {isSelected && <HeroIcon name="check" size={12} color="white" />}
                  </View>
                )}
                <View style={styles.sessionBody}>
                  <Text style={styles.sessionSubject}>{session.subject}</Text>
                  <Text style={styles.sessionMeta}>
                    {formatSessionDate(session.startedAt)}
                    {session.mode === 'pomodoro' ? ` · ${session.cycles} ciclos` : ''}
                    {session.questionsAnswered != null ? ` · ${session.questionsAnswered} questões` : ''}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </>
      )}
      {isSelecting && <View style={styles.selectionBarSpacer} />}
    </ScrollView>
    {isSelecting && (
      <SelectionActionBar count={selected.size} colors={colors} onCancel={clear} onDelete={handleDeleteSessions} />
    )}
    </View>
  );
}

function ModeChip({
  label,
  selected,
  accent,
  styles,
  onPress,
}: {
  label: string;
  selected: boolean;
  accent: string;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, selected && { backgroundColor: accent }]} onPress={onPress}>
      <Text style={[styles.chipText, { color: selected ? 'white' : accent }]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
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
    statsLabel: {
      marginTop: 32,
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
    segmented: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    chip: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    chipText: {
      fontWeight: '700',
    },
    startButton: {
      marginTop: 20,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      elevation: 3,
    },
    startButtonDisabled: {
      opacity: 0.4,
    },
    startButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
    statsCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      elevation: 1,
      alignItems: 'center',
    },
    totalHours: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
    },
    totalHoursCaption: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    chart: {
      width: '100%',
      marginTop: 20,
      gap: 12,
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    chartLabel: {
      width: 70,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    chartTrack: {
      flex: 1,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.surfaceAlt,
      overflow: 'hidden',
    },
    chartFill: {
      height: '100%',
      borderRadius: 5,
    },
    chartMinutes: {
      width: 50,
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'right',
    },
    sessionRow: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 1,
    },
    sessionCheckbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    sessionBody: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectionBarSpacer: {
      height: 74,
    },
    sessionSubject: {
      fontWeight: '700',
      color: colors.text,
    },
    sessionMeta: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
}

export default StudyHomeScreen;
