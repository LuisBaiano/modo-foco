import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import FocusBlock from '../../native/FocusBlock';

function ProfileScreen() {
  const [pingResult, setPingResult] = useState<string | null>(null);

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
  testSection: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
  },
  pingResult: {
    marginTop: 8,
    fontSize: 14,
  },
});

export default ProfileScreen;
