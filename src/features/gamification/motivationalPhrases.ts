/**
 * Banco de frases motivacionais. Tom Duolingo: caloroso quando o usuário
 * aparece, agressivo quando ele está prestes a falhar. `CELEBRATION` é usado
 * após ganhar XP; `STREAK_WARNING` alimenta o aviso de streak em risco
 * (`streakReminder.ts`); `STREAK_BROKEN` é usada aqui mesmo, quando uma
 * streak quebra no instante em que o usuário volta a agir.
 */

export const CELEBRATION_PHRASES = [
  'Mandou bem!',
  'Isso aí!',
  'Foco de verdade.',
  'Mais um passo.',
  'Você apareceu hoje.',
  'Consistência é isso.',
  'Sequência viva!',
  'Progresso real.',
  'Continua assim.',
  'Disciplina rendendo.',
  'Nada mau.',
  'Um a menos na lista.',
  'Hoje valeu.',
  'Isso é hábito virando rotina.',
  'Boa!',
  'Direto ao ponto.',
  'Você não parou.',
  'Ganhou o dia.',
  'Esforço registrado.',
  'De novo, e de novo.',
] as const;

function plural(days: number): string {
  return days === 1 ? 'dia' : 'dias';
}

/** Cada função recebe o streak atual (sempre > 0 quando chamada) pra deixar o aviso pessoal, não genérico. */
export const STREAK_WARNING_PHRASES = [
  (streak: number) => `Seu streak de ${streak} ${plural(streak)} está prestes a morrer 💀`,
  () => 'Faltam poucas horas pra virar o dia — e sua sequência.',
  () => 'Não deixa hoje escapar.',
  (streak: number) => `Sua sequência de ${streak} ${plural(streak)} está por um fio.`,
  (streak: number) => `${streak} ${plural(streak)} de esforço, e amanhã já era se você não agir agora.`,
  (streak: number) => `Você não vai deixar ${streak} ${plural(streak)} irem embora, vai?`,
  () => 'A meia-noite não espera ninguém.',
  () => 'Últimas horas pra manter a sequência viva.',
  () => 'Ainda dá tempo. Ainda.',
  () => 'Sua streak está pedindo socorro.',
  (streak: number) => `Um dia sem ação e seus ${streak} ${plural(streak)} zeram.`,
  (streak: number) => `Não foi fácil chegar a ${streak} ${plural(streak)} pra perder assim.`,
  () => 'O relógio está correndo contra sua sequência.',
  () => 'Ela sobrevive hoje se você aparecer.',
  () => 'Não vacila agora.',
] as const;

export const STREAK_BROKEN_PHRASES = [
  'Sua sequência morreu. De novo do zero.',
  'Foi. A streak acabou.',
  'Quebrou. Agora é recomeçar.',
  'O dia passou e a sequência foi junto.',
  'Zero de novo — mas você está aqui, então bora.',
  'Perdeu a sequência. Não perde o ritmo.',
  'Isso dói, mas some rápido se você continuar.',
  'A streak não resistiu. Você resiste?',
  'De volta ao dia 1.',
  'Sequência resetada. Sem desculpa pra próxima.',
  'Isso custou XP. Não deixa de novo.',
  'A ausência tem preço — você acabou de pagar.',
  'Recomeça agora, sem drama.',
  'Um dia perdido não define os próximos.',
  'Zero não é fracasso, é ponto de partida.',
] as const;

function randomFrom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomCelebrationPhrase(): string {
  return randomFrom(CELEBRATION_PHRASES);
}

export function randomStreakWarningPhrase(streakDays: number): string {
  return randomFrom(STREAK_WARNING_PHRASES)(streakDays);
}

export function randomStreakBrokenPhrase(): string {
  return randomFrom(STREAK_BROKEN_PHRASES);
}
