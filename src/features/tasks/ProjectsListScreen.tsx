import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../app/ThemeContext';
import { useProjects } from './useProjects';
import type { TasksStackParamList } from './TasksNavigator';
import type { ProjectWithProgress } from './projectsRepository';

/** Lista de projetos com barra de progresso, acessada pelo botão de pasta na aba Tarefas. */
function ProjectsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TasksStackParamList>>();
  const { projects, loading } = useProjects();
  const { accent } = useTheme();

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[styles.listContent, projects.length === 0 && styles.emptyContainer]}
        renderItem={({ item }) => (
          <ProjectCard item={item} onOpen={() => navigation.navigate('ProjectForm', { projectId: item.id })} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum projeto ainda</Text>
            </View>
          ) : undefined
        }
      />
      <Pressable
        style={[styles.fab, { backgroundColor: accent, shadowColor: accent }]}
        onPress={() => navigation.navigate('ProjectForm', undefined)}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

function ProjectCard({ item, onOpen }: { item: ProjectWithProgress; onOpen: () => void }) {
  const progress = item.totalTasks === 0 ? 0 : item.completedTasks / item.totalTasks;
  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={styles.cardHeader}>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      {item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: item.color }]} />
      </View>
      <Text style={styles.progressText}>
        {item.completedTasks}/{item.totalTasks} tarefas concluídas
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#4c1d95',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabIcon: {
    color: 'white',
    fontSize: 30,
    lineHeight: 32,
  },
});

export default ProjectsListScreen;
