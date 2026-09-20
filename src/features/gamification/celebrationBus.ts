import type { RewardResult } from './gamificationRepository';

type Listener = (reward: RewardResult) => void;

let listener: Listener | null = null;

/** Registra o único ouvinte ativo — a `CelebrationOverlay` montada na raiz do app. */
export function subscribeToCelebrations(callback: Listener): () => void {
  listener = callback;
  return () => {
    if (listener === callback) {
      listener = null;
    }
  };
}

/**
 * Emite um resultado de recompensa pra `CelebrationOverlay` exibir. Ignorado
 * se não houver nada a comemorar (sem XP, sem conquista, sem streak quebrada).
 */
export function emitCelebration(reward: RewardResult | null) {
  if (!reward) {
    return;
  }
  if (reward.xpGained <= 0 && reward.achievements.length === 0 && !reward.streakBroken) {
    return;
  }
  listener?.(reward);
}
