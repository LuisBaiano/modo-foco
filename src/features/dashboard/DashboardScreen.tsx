import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { db, runMigrations } from '../../db/client';
import { userXp } from '../../db/schema';

type DbStatus = { state: 'loading' } | { state: 'ready'; rows: number } | { state: 'error'; message: string };

function DashboardScreen() {
  const [dbStatus, setDbStatus] = useState<DbStatus>({ state: 'loading' });

  useEffect(() => {
    runMigrations()
      .then(() => db.select().from(userXp))
      .then(rows => setDbStatus({ state: 'ready', rows: rows.length }))
      .catch(error => {
        console.error('[ModoFoco] db init failed', error);
        setDbStatus({ state: 'error', message: `${error}\n${error?.stack ?? ''}` });
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Em construção</Text>
      <Text style={styles.dbStatus}>{describeDbStatus(dbStatus)}</Text>
    </View>
  );
}

function describeDbStatus(status: DbStatus) {
  switch (status.state) {
    case 'loading':
      return 'Banco de dados: verificando...';
    case 'ready':
      return `Banco de dados: OK (${status.rows} linhas em user_xp)`;
    case 'error':
      return `Banco de dados: erro — ${status.message}`;
  }
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
  dbStatus: {
    marginTop: 24,
    fontSize: 12,
    opacity: 0.5,
  },
});

export default DashboardScreen;
