import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { ACCENT_PRESETS, useTheme } from '../../app/ThemeContext';
import FocusBlock from '../../native/FocusBlock';

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
    <View style={styles.container}>
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
              {accent === preset.value && <Text style={styles.swatchCheck}>✓</Text>}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.testSection}>
        <Button title="Testar módulo nativo FocusBlock" onPress={handlePing} />
        {pingResult != null && <Text style={styles.pingResult}>{pingResult}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  swatchCheck: {
    color: 'white',
    fontWeight: '700',
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
