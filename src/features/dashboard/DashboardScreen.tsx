import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { db, runMigrations } from '../../db/client';
import { userXp } from '../../db/schema';
import { useTheme, type Palette } from '../../app/ThemeContext';

type DbStatus = { state: 'loading' } | { state: 'ready'; rows: number } | { state: 'error'; message: string };

function DashboardScreen() {
  const [dbStatus, setDbStatus] = useState<DbStatus>({ state: 'loading' });
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 14,
      opacity: 0.6,
      color: colors.text,
    },
    dbStatus: {
      marginTop: 24,
      fontSize: 12,
      opacity: 0.5,
      color: colors.text,
    },
  });
}

export default DashboardScreen;
