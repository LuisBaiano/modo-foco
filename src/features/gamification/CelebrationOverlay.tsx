import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { subscribeToCelebrations } from './celebrationBus';
import type { RewardResult } from './gamificationRepository';
import { randomCelebrationPhrase, randomStreakBrokenPhrase } from './motivationalPhrases';
import celebrationAnimation from '../../assets/lottie/celebration.json';

const VISIBLE_MS = 3200;

/**
 * Overlay global montado uma vez na raiz do app (ver App.tsx). Escuta o
 * `celebrationBus` e reage a qualquer ganho de XP, conquista desbloqueada
 * ou streak quebrada, com uma frase aleatória do banco de `motivationalPhrases`.
 */
function CelebrationOverlay() {
  const [reward, setReward] = useState<RewardResult | null>(null);
  const [phrase, setPhrase] = useState('');
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeToCelebrations(incoming => {
      setReward(incoming);
      setPhrase(incoming.streakBroken ? randomStreakBrokenPhrase() : randomCelebrationPhrase());

      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }

      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      dismissTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 120, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => setReward(null));
      }, VISIBLE_MS);
    });
  }, [opacity, translateY]);

  if (!reward) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.card, reward.streakBroken && styles.cardBroken, { opacity, transform: [{ translateY }] }]}>
        {!reward.streakBroken && (
          <LottieView source={celebrationAnimation} autoPlay loop={false} style={styles.lottie} />
        )}
        <View style={styles.textColumn}>
          <Text style={[styles.phrase, reward.streakBroken && styles.phraseBroken]}>{phrase}</Text>
          {reward.xpGained > 0 && <Text style={styles.xp}>+{reward.xpGained} XP</Text>}
          {reward.achievements.map(achievement => (
            <Text key={achievement.key} style={styles.achievement}>
              🏆 {achievement.title}
            </Text>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardBroken: {
    backgroundColor: '#7f1d1d',
  },
  lottie: {
    width: 48,
    height: 48,
    marginRight: 10,
  },
  textColumn: {
    flexShrink: 1,
  },
  phrase: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  phraseBroken: {
    color: '#fecaca',
  },
  xp: {
    color: '#facc15',
    fontWeight: '800',
    fontSize: 13,
    marginTop: 2,
  },
  achievement: {
    color: '#a7f3d0',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 2,
  },
});

export default CelebrationOverlay;
