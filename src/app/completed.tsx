import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from './_layout';

export default function Completed() {
  const { tasks, toggleTask, deleteTask, theme } = useTasks();
  const router = useRouter();

  const completedTasks = tasks.filter(t => t.done);
  const s = makeStyles(theme);

  return (
    <View style={s.container}>

      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backBtn}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.heading}>Completed</Text>
      <Text style={s.subtext}>{completedTasks.length} tasks done</Text>

      <FlatList
        data={completedTasks}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={theme.primary} />
            <Text style={s.emptyText}>No completed tasks yet!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.taskItem}>
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
              <Ionicons name="checkmark-circle" size={26} color={theme.primary} />
            </TouchableOpacity>
            <Text style={s.taskTextDone}>{item.text}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Ionicons name="trash-outline" size={20} color={theme.subtext} />
            </TouchableOpacity>
          </View>
        )}
      />

    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 24,
    paddingTop: 64,
  },
  headerRow: {
    marginBottom: 24,
  },
  backBtn: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '600',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: theme.subtext,
    marginBottom: 32,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  taskTextDone: {
    flex: 1,
    fontSize: 15,
    color: theme.subtext,
    textDecorationLine: 'line-through',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: theme.subtext,
  },
});