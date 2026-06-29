import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TasksContext = createContext(null);
export const useTasks = () => useContext(TasksContext);

export const lightTheme = {
  background: '#F5F8FF',
  card: '#ffffff',
  border: '#E8F0FF',
  text: '#1A1A1A',
  subtext: '#6B6B6B',
  primary: '#0057FF',
  toast: '#1A1A1A',
};

export const darkTheme = {
  background: '#0D0D0D',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#F5F5F5',
  subtext: '#888888',
  primary: '#0057FF',
  toast: '#2A2A2A',
};

export default function RootLayout() {
  const [tasks, setTasks] = useState([]);
  const [deletedTask, setDeletedTask] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const timerRef = useRef(null);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem('tasks');
        const savedTheme = await AsyncStorage.getItem('isDark');
        if (saved) setTasks(JSON.parse(saved));
        else setTasks([
          { id: 1, text: 'Design the home screen', done: false },
          { id: 2, text: 'Build SureLink navbar', done: false },
          { id: 3, text: 'Set up Expo project', done: true },
        ]);
        if (savedTheme) setIsDark(JSON.parse(savedTheme));
      } catch (e) {
        setTasks([
  { id: 1, text: 'Design the home screen', done: false, dueDate: null },
  { id: 2, text: 'Build SureLink navbar', done: false, dueDate: null },
  { id: 3, text: 'Set up Expo project', done: true, dueDate: null },
]);
const addTask = (text, dueDate = null) => {
  setTasks(prev => [...prev, { id: Date.now(), text, done: false, dueDate }]);
};
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (e) {
        console.log('Failed to save tasks');
      }
    };
    saveTasks();
  }, [tasks]);

  const toggleTheme = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    await AsyncStorage.setItem('isDark', JSON.stringify(newVal));
  };

  const addTask = (text) => {
    setTasks(prev => [...prev, { id: Date.now(), text, done: false }]);
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const deleteTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    setDeletedTask(task);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDeletedTask(null);
    }, 3000);
  };

  const undoDelete = () => {
    if (!deletedTask) return;
    setTasks(prev => [...prev, deletedTask]);
    setDeletedTask(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TasksContext.Provider value={{
        tasks, addTask, toggleTask, deleteTask,
        deletedTask, undoDelete,
        isDark, toggleTheme, theme
      }}>
        <Stack screenOptions={{ headerShown: false }} />
      </TasksContext.Provider>
    </GestureHandlerRootView>
  );
}