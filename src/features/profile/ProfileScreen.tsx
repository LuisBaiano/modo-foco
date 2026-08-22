import { useState } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ColorPicker from '../../app/ColorPicker';
import HeroIcon from '../../app/HeroIcon';
import { ACCENT_PRESETS, useTheme } from '../../app/ThemeContext';
import FocusBlock from '../../native/FocusBlock';

/** Tela de Perfil: seleção de cor de destaque + teste do módulo nativo. Ainda sem XP/conquistas de verdade. */
function ProfileScreen() {
  const [pingResult, setPingResult] = useState<string | null>(null);
  const { accent, setAccent } = useTheme();

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
      <Text style={styles.subtitle}>Em construção</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Cor de destaque</Text>
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

        <Text style={[styles.sectionLabel, styles.customLabel]}>Cor personalizada</Text>
        <ColorPicker value={accent} onChange={setAccent} />
      </View>

      <View style={styles.testSection}>
        <Button title="Testar módulo nativo FocusBlock" onPress={handlePing} />
        {pingResult != null && <Text style={styles.pingResult}>{pingResult}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    marginTop: 32,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 12,
  },
  customLabel: {
    marginTop: 28,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 14,
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
  },
});

export default ProfileScreen;
