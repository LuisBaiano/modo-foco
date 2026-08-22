import { NativeModules } from 'react-native';

/**
 * Módulo nativo Kotlin de bloqueio de apps. Por enquanto só tem ping(), pra
 * provar que a ponte RN<->Kotlin funciona — a lógica real (AccessibilityService
 * ou UsageStatsManager) ainda não foi implementada.
 */
type FocusBlockModule = {
  ping(): Promise<string>;
};

const { FocusBlock } = NativeModules as { FocusBlock: FocusBlockModule };

export default FocusBlock;
