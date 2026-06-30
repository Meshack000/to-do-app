import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeInDown, FadeOutLeft } from "react-native-reanimated";
import { useTasks } from "./_layout";

export default function Home() {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    deletedTask,
    undoDelete,
    isDark,
    toggleTheme,
    theme,
  } = useTasks();

  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [showWebPicker, setShowWebPicker] = useState(false);
  const router = useRouter();

  const activeTasks = tasks.filter((t) => !t.done);
  const completedCount = tasks.filter((t) => t.done).length;

  const handleAdd = () => {
    if (inputValue.trim() === "") return;
    addTask(inputValue, dueDate ? dueDate.toISOString() : null);
    setInputValue("");
    setDueDate(null);
  };

  const handleToggle = (id) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTask(id);
  };

  const handleDelete = (id) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    deleteTask(id);
  };

  const formatDate = (iso) => {
    if (!iso) return null;
    const date = new Date(iso);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (iso) => {
    if (!iso) return false;
    return new Date(iso) < new Date();
  };

  // Central handle for invoking the date picker logic depending on platform
  const handleDatePickerPress = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: dueDate || new Date(),
        mode: "date",
        minimumDate: new Date(),
        onChange: (event, selectedDate) => {
          if (event.type === "dismissed" || !selectedDate) return;
          
          // Cascades into Android's native time picker right after date selection
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            onChange: (timeEvent, selectedTime) => {
              if (timeEvent.type === "dismissed" || !selectedTime) return;
              const finalDate = new Date(selectedDate);
              finalDate.setHours(selectedTime.getHours());
              finalDate.setMinutes(selectedTime.getMinutes());
              setDueDate(finalDate);
            },
          });
        },
      });
    } else if (Platform.OS === "ios") {
      setShowIosPicker(true);
    } else if (Platform.OS === "web") {
      setShowWebPicker(true);
    }
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
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.completedBtn}
            onPress={() => router.push("/completed")}
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
        <TouchableOpacity
          style={[s.iconBtn, s.dateBtn, dueDate && s.dateBtnActive]}
          onPress={handleDatePickerPress}
        >
          <Ionicons
            name="calendar-outline"
            size={22}
            color={dueDate ? "#fff" : theme.text}
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
          <Text style={s.datePreviewText}>
            Due: {formatDate(dueDate.toISOString())}
          </Text>
          <TouchableOpacity onPress={() => setDueDate(null)}>
            <Ionicons name="close-circle" size={16} color={theme.subtext} />
          </TouchableOpacity>
        </View>
      )}

      {/* iOS Inline Spinner Date Picker */}
      {showIosPicker && Platform.OS === "ios" && (
        <View style={{ marginBottom: 12 }}>
          <DateTimePicker
            value={dueDate || new Date()}
            mode="datetime"
            display="spinner"
            minimumDate={new Date()}
            textColor={theme.text}
            onChange={(event, selectedDate) => {
              if (selectedDate) setDueDate(selectedDate);
            }}
          />
          <TouchableOpacity 
            style={[s.webPickerButton, { marginTop: 8 }]} 
            onPress={() => setShowIosPicker(false)}
          >
            <Text style={s.webPickerButtonText}>Confirm Date</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Web Fallback Alert */}
      {showWebPicker && Platform.OS === "web" && (
        <View style={s.webPickerFallback}>
          <Text style={s.webPickerText}>
            Date picker is not supported in web preview.
          </Text>
          <TouchableOpacity
            style={s.webPickerButton}
            onPress={() => setShowWebPicker(false)}
          >
            <Text style={s.webPickerButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={activeTasks}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color={theme.primary}
            />
            <Text style={s.emptyText}>All done! Nothing remaining</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <TouchableOpacity
                style={s.swipeDelete}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash" size={22} color="#fff" />
              </TouchableOpacity>
            )}
            overshootRight={false}
            rightThreshold={40}
          >
            <Animated.View
              entering={FadeInDown.springify()}
              exiting={FadeOutLeft.springify()}
              style={s.taskItem}
            >
              <TouchableOpacity
                onPress={() => handleToggle(item.id)}
                style={s.checkbox}
              >
                <Ionicons
                  name="ellipse-outline"
                  size={24}
                  color={theme.primary}
                />
              </TouchableOpacity>

              <View style={s.taskContent}>
                <Text style={s.taskText}>{item.text}</Text>
                {item.dueDate && (
                  <View style={s.dueDateRow}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={
                        isOverdue(item.dueDate) ? "#FF3B30" : theme.subtext
                      }
                    />
                    <Text
                      style={[
                        s.dueDateText,
                        isOverdue(item.dueDate) && s.overdue,
                      ]}
                    >
                      {formatDate(item.dueDate)}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.subtext}
                />
              </TouchableOpacity>
            </Animated.View>
          </Swipeable>
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

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
      paddingTop: 64,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 32,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconBtn: {
      padding: 6,
    },
    heading: {
      fontSize: 32,
      fontWeight: "bold",
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
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    completedBtnText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 32,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.subtext,
      marginTop: 4,
    },
    inputRow: {
      flexDirection: "row",
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
      alignItems: "center",
      justifyContent: "center",
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
      alignItems: "center",
      justifyContent: "center",
    },
    datePreview: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    datePreviewText: {
      fontSize: 13,
      color: theme.primary,
      flex: 1,
    },
    webPickerFallback: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 16,
    },
    webPickerText: {
      color: theme.text,
      marginBottom: 12,
    },
    webPickerButton: {
      backgroundColor: theme.primary,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: "center",
    },
    webPickerButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    taskItem: {
      flexDirection: "row",
      alignItems: "center",
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
      alignItems: "center",
      justifyContent: "center",
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
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    dueDateText: {
      fontSize: 12,
      color: theme.subtext,
    },
    overdue: {
      color: "#FF3B30",
    },
    swipeDelete: {
      backgroundColor: "#FF3B30",
      justifyContent: "center",
      alignItems: "center",
      width: 80,
      borderRadius: 12,
      marginBottom: 12,
      marginLeft: 8,
    },
    emptyState: {
      alignItems: "center",
      marginTop: 60,
      gap: 12,
    },
    emptyText: {
      fontSize: 15,
      color: theme.subtext,
    },
    toast: {
      position: "absolute",
      bottom: 32,
      left: 24,
      right: 24,
      backgroundColor: theme.toast,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    toastText: {
      color: "#fff",
      fontSize: 15,
    },
    toastUndo: {
      color: theme.primary,
      fontWeight: "bold",
      fontSize: 15,
    },
  });