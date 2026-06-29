import { useState } from 'react';
import {
  View, Text, TextInput,
  TouchableOpacity, FlatList,
  StyleSheet, Platform
} from 'react-native';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTasks } from './_layout';

export default function Home() {
  const {
    tasks, addTask, toggleTask, deleteTask,
    deletedTask, undoDelete,
    isDark, toggleTheme, theme
  } = useTasks();

  const [inputValue, setInputValue] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const router = useRouter();

  const activeTasks = tasks.filter(t => !t.done);
  const completedCount = tasks.filter(t => t.done).length;

  const handleAdd = () => {
    if (inputValue.trim() === '') return;
    addTask(inputValue, dueDate ? dueDate.toISOString() : null);
    setInputValue('');
    setDueDate(null);
  };

  const handleToggle = (id) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTask(id);
  };

  const handleDelete = (id) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    deleteTask(id);
  };

  const formatDate = (iso) => {
    if (!iso) return null;
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const isOverdue = (iso) => {
    if (!iso) return false;
    return new Date(iso) < new Date();
  };

  const s = makeStyles(theme);

  return (
    <View style={s.container}>

      {/* Header */}
      <View style={s.headerRow}>
        <View>
          <Text style={s.heading}>My Tasks</Text>
          <Text style={s.subtext}>Monday, 29 June</Text>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={s.iconBtn}>
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.completedBtn}
            onPress={() => router.push('/completed')}
          >
            <Ionicons name="checkmark-done" size={16} color="#fff" />
            <Text style={s.completedBtnText}>{completedCount}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statNumber}>{tasks.length}</Text>
          <Text style={s.statLabel}>Total</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statNumber}>{activeTasks.length}</Text>
          <Text style={s.statLabel}>Remaining</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statNumber}>{completedCount}</Text>
          <Text style={s.statLabel}>Done</Text>
        </View>
      </View>

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Add a new task..."
          placeholderTextColor={theme.subtext}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAdd}
        />
        {/* Date picker trigger */}
        <TouchableOpacity
          style={[s.iconBtn, s.dateBtn, dueDate && s.dateBtnActive]}
          onPress={() => setShowPicker(true)}
        >
          <Ionicons
            name="calendar-outline"
            size={22}
            color={dueDate ? '#fff' : theme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity style={s.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Selected date preview */}
      {dueDate && (
        <View style={s.datePreview}>
          <Ionicons name="calendar" size={14} color={theme.primary} />
          <Text style={s.datePreviewText}>Due: {formatDate(dueDate.toISOString())}</Text>
          <TouchableOpacity onPress={() => setDueDate(null)}>
            <Ionicons name="close-circle" size={16} color={theme.subtext} />
          </TouchableOpacity>
        </View>
      )}

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) setDueDate(selectedDate);
            if (Platform.OS === 'android') setShowPicker(false);
          }}
        />
      )}

      {/* Task List */}
      <FlatList
        data={activeTasks}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={theme.primary} />
            <Text style={s.emptyText}>All done! Nothing remaining</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Animated.View
            entering={FadeInDown.springify()}
            exiting={FadeOutLeft.springify()}
            style={s.taskItem}
          >
            <TouchableOpacity
              onPress={() => handleToggle(item.id)}
              style={s.checkbox}
            >
              <Ionicons name="ellipse-outline" size={24} color={theme.primary} />
            </TouchableOpacity>

            <View style={s.taskContent}>
              <Text style={s.taskText}>{item.text}</Text>
              {item.dueDate && (
                <View style={s.dueDateRow}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={isOverdue(item.dueDate) ? '#FF3B30' : theme.subtext}
                  />
                  <Text style={[
                    s.dueDateText,
                    isOverdue(item.dueDate) && s.overdue
                  ]}>
                    {formatDate(item.dueDate)}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={20} color={theme.subtext} />
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      {/* Undo Toast */}
      {deletedTask && (
        <Animated.View
          entering={FadeInDown.springify()}
          exiting={FadeOutLeft.springify()}
          style={s.toast}
        >
          <Text style={s.toastText}>Task deleted</Text>
          <TouchableOpacity onPress={undoDelete}>
            <Text style={s.toastUndo}>Undo</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 6,
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
  },
  completedBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.subtext,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dateBtn: {
    backgroundColor: theme.card,
    borderRadius: 12,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  dateBtnActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  addButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  datePreviewText: {
    fontSize: 13,
    color: theme.primary,
    flex: 1,
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
  checkbox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskText: {
    fontSize: 15,
    color: theme.text,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: theme.subtext,
  },
  overdue: {
    color: '#FF3B30',
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
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: theme.toast,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
  },
  toastUndo: {
    color: theme.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
});