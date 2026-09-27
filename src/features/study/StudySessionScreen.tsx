import { useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../app/ThemeContext';
import type { StudyStackParamList } from './StudyNavigator';
import { type ProductivityRating, endSession, incrementCycles } from './studyRepository';
import { emitCelebration } from '../gamification/celebrationBus';

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

type Phase = 'focus' | 'break';
type ScreenState = 'running' | 'summary';

type Props = NativeStackScreenProps<StudyStackParamList, 'StudySession'>;

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Timer da sessão ativa. Modo Pomodoro alterna foco/pausa automaticamente
 * (sem som/notificação — só a lib de gestos e a de svg estão instaladas
 * até agora); modo livre só conta o tempo corrido. O relógio é sempre
 * recalculado a partir de timestamps reais (não decrementado ingenuamente),
 * então não desanda se o JS travar um instante.
 */
function StudySessionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<StudyStackParamList>>();
  const route = useRoute<Props['route']>();
  const { sessionId, mode, subject } = route.params;
  const { accent } = useTheme();

  const [screenState, setScreenState] = useState<ScreenState>('running');
  const [phase, setPhase] = useState<Phase>('focus');
  const [cycles, setCycles] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_SECONDS);
  const [freeElapsedSeconds, setFreeElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<ProductivityRating | null>(null);
  const [questions, setQuestions] = useState('');

  // refs espelhando o estado pro tick do setInterval nunca ler uma closure velha
  const phaseRef = useRef<Phase>('focus');
  const cyclesRef = useRef(0);
  const phaseStartedAtRef = useRef(Date.now());
  const freeStartedAtRef = useRef(Date.now());

  useEffect(() => {
    if (screenState !== 'running') {
      return;
    }
    const interval = setInterval(() => {
      if (mode === 'pomodoro') {
        const phaseDuration = phaseRef.current === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
        const elapsed = Math.floor((Date.now() - phaseStartedAtRef.current) / 1000);
        const left = phaseDuration - elapsed;
        if (left <= 0) {
          if (phaseRef.current === 'focus') {
            cyclesRef.current += 1;
            setCycles(cyclesRef.current);
            incrementCycles(sessionId);
          }
          const nextPhase: Phase = phaseRef.current === 'focus' ? 'break' : 'focus';
          phaseRef.current = nextPhase;
          phaseStartedAtRef.current = Date.now();
          setPhase(nextPhase);
          setRemainingSeconds(nextPhase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
        } else {
          setRemainingSeconds(left);
        }
      } else {
        setFreeElapsedSeconds(Math.floor((Date.now() - freeStartedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [screenState, mode, sessionId]);

  const handleSaveSummary = async () => {
    const parsedQuestions = parseInt(questions, 10);
    const reward = await endSession(sessionId, {
      notes: notes.trim() || null,
      productivityRating: rating,
      questionsAnswered: Number.isNaN(parsedQuestions) ? null : parsedQuestions,
    });
    emitCelebration(reward);
    navigation.goBack();
  };

  if (screenState === 'summary') {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: accent }]}>O que você estudou?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anotação curta, opcional..."
          multiline
        />

        <Text style={[styles.label, { color: accent }]}>Quantas questões você respondeu? (opcional)</Text>
        <TextInput
          style={styles.input}
          value={questions}
          onChangeText={setQuestions}
          placeholder="Ex: 20"
          keyboardType="number-pad"
        />

        <Text style={[styles.label, { color: accent }]}>Como foi a produtividade?</Text>
        <View style={styles.ratingRow}>
          <RatingOption emoji="😐" selected={rating === 'low'} accent={accent} onPress={() => setRating('low')} />
          <RatingOption emoji="😊" selected={rating === 'medium'} accent={accent} onPress={() => setRating('medium')} />
          <RatingOption emoji="🔥" selected={rating === 'high'} accent={accent} onPress={() => setRating('high')} />
        </View>

        <Pressable style={[styles.saveButton, { backgroundColor: accent }]} onPress={handleSaveSummary}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subject}>{subject}</Text>
      {mode === 'pomodoro' ? (
        <>
          <Text style={[styles.phaseLabel, { color: accent }]}>{phase === 'focus' ? 'Foco' : 'Pausa'}</Text>
          <Text style={styles.clock}>{formatClock(remainingSeconds)}</Text>
          <Text style={styles.cyclesText}>{cycles} ciclo(s) completo(s)</Text>
        </>
      ) : (
        <Text style={styles.clock}>{formatClock(freeElapsedSeconds)}</Text>
      )}

      <Pressable style={[styles.endButton, { backgroundColor: accent }]} onPress={() => setScreenState('summary')}>
        <Text style={styles.endButtonText}>Encerrar sessão</Text>
      </Pressable>
    </View>
  );
}

function RatingOption({
  emoji,
  selected,
  accent,
  onPress,
}: {
  emoji: string;
  selected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.ratingOption, selected && { borderColor: accent, borderWidth: 3 }]}
      onPress={onPress}>
      <Text style={styles.ratingEmoji}>{emoji}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subject: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  phaseLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  clock: {
    fontSize: 64,
    fontWeight: '800',
    color: '#1f2937',
    fontVariant: ['tabular-nums'],
  },
  cyclesText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6b7280',
  },
  endButton: {
    marginTop: 48,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  endButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    elevation: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  ratingEmoji: {
    fontSize: 28,
  },
  saveButton: {
    marginTop: 40,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default StudySessionScreen;
