import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../app/ThemeContext';
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
  const { accent } = useTheme();
  const { stats, recentSessions, loading } = useStudyHome();

  const [subject, setSubject] = useState('');
  const [mode, setMode] = useState<StudyMode>('pomodoro');

  const handleStart = async () => {
    if (!subject.trim()) {
      return;
    }
    const sessionId = await startSession({ subject: subject.trim(), mode });
    navigation.navigate('StudySession', { sessionId, mode, subject: subject.trim() });
  };

  const maxMinutes = Math.max(1, ...stats.bySubject.map(s => s.minutes));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: accent }]}>Estudar agora</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="Ex: Cálculo, Inglês, React Native..."
      />
      <View style={styles.segmented}>
        <ModeChip label="Pomodoro" selected={mode === 'pomodoro'} accent={accent} onPress={() => setMode('pomodoro')} />
        <ModeChip label="Livre" selected={mode === 'free'} accent={accent} onPress={() => setMode('free')} />
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
          {recentSessions.map((session: StudySession) => (
            <View key={session.id} style={styles.sessionRow}>
              <Text style={styles.sessionSubject}>{session.subject}</Text>
              <Text style={styles.sessionMeta}>
                {formatSessionDate(session.startedAt)}
                {session.mode === 'pomodoro' ? ` · ${session.cycles} ciclos` : ''}
                {session.questionsAnswered != null ? ` · ${session.questionsAnswered} questões` : ''}
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function ModeChip({
  label,
  selected,
  accent,
  onPress,
}: {
  label: string;
  selected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, selected && { backgroundColor: accent }]} onPress={onPress}>
      <Text style={[styles.chipText, { color: selected ? 'white' : accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
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
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    elevation: 1,
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
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 1,
    alignItems: 'center',
  },
  totalHours: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
  },
  totalHoursCaption: {
    fontSize: 13,
    color: '#6b7280',
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
    color: '#4b5563',
  },
  chartTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    borderRadius: 5,
  },
  chartMinutes: {
    width: 50,
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'right',
  },
  sessionRow: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  sessionSubject: {
    fontWeight: '700',
    color: '#1f2937',
  },
  sessionMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default StudyHomeScreen;
