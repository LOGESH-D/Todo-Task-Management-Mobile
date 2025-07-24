import React, { useContext } from 'react';
import { Button, View, Text, TextInput, Modal, ScrollView, RefreshControl, Animated, PanResponder, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { useTasks } from '@/hooks/useTasks';
import { useState } from 'react';

import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { Task } from '@/hooks/useTasks';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

type Priority = 'low' | 'medium' | 'high';

type TaskItemProps = {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  removingId: string | null;
  setRemovingId: (id: string | null) => void;
  colorScheme: 'light' | 'dark';
  theme: {
    background: string;
    text: string;
    icon: string;
    tint: string;
    tabIconDefault: string;
  };
};

function TaskItem({ task, onComplete, onEdit, onDelete, removingId, setRemovingId, colorScheme, theme }: TaskItemProps) {
  const pan = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const bgColorAnim = React.useRef(new Animated.Value(task.status === 'complete' ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, []);

  React.useEffect(() => {
    Animated.timing(bgColorAnim, {
      toValue: task.status === 'complete' ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [task.status]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -100) {
          setRemovingId(task.id);
          Animated.timing(pan, {
            toValue: -500,
            duration: 200,
            useNativeDriver: Platform.OS !== 'web',
          }).start(() => {
            onDelete(task.id);
            setRemovingId(null);
            pan.setValue(0);
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        }
      },
    })
  ).current;

  const backgroundColor = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#e0ffe0'],
  });

  const cardBg = colorScheme === 'dark' ? (task.status === 'complete' ? '#26332a' : '#23272a') : (task.status === 'complete' ? '#e0ffe0' : '#fff');
  const textColor = colorScheme === 'dark' ? '#fff' : theme.text;
  return (
    <Animated.View
      style={{
        transform: [{ translateX: pan }],
        opacity: fadeAnim,
        backgroundColor: cardBg,
        marginBottom: Platform.OS === 'web' ? 32 : 16,
        borderRadius: 20,
        ...(Platform.OS === 'web'
          ? { boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }),
        padding: Platform.OS === 'web' ? 32 : 0,
      }}
      {...panResponder.panHandlers}
    >
      <View style={{ padding: Platform.OS === 'web' ? 24 : 16, borderRadius: 20, backgroundColor: 'transparent', minHeight: 120 }}>
        <Text style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, color: textColor }}>{task.title}</Text>
        <Text style={{ marginBottom: 6, color: textColor, fontSize: 16 }}>{task.description}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Ionicons name="calendar-outline" size={18} color={theme.icon} />
          <Text style={{ marginLeft: 6, color: textColor, fontSize: 15 }}>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <MaterialIcons name="flag" size={18} color={task.priority === 'high' ? '#e53935' : task.priority === 'medium' ? '#fb8c00' : '#43a047'} />
          <Text style={{ marginLeft: 6, color: textColor, fontSize: 15 }}>Priority: {task.priority}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Ionicons name={task.status === 'complete' ? 'checkmark-done-circle' : 'ellipse-outline'} size={18} color={task.status === 'complete' ? '#43a047' : theme.icon} />
          <Text style={{ marginLeft: 6, color: textColor, fontSize: 15 }}>{task.status === 'complete' ? 'Complete' : 'Not Complete'}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'flex-end', gap: Platform.OS === 'web' ? 16 : 8 }}>
          {task.status === 'open' && (
            <Ionicons.Button
              name="checkmark-done"
              backgroundColor="transparent"
              color="#43a047"
              size={Platform.OS === 'web' ? 32 : 24}
              onPress={() => onComplete(task.id)}
              iconStyle={{ marginRight: 0 }}
            />
          )}
          <Ionicons.Button
            name="create-outline"
            backgroundColor="transparent"
            color="#1976d2"
            size={Platform.OS === 'web' ? 32 : 24}
            onPress={() => onEdit(task)}
            iconStyle={{ marginRight: 0 }}
          />
          <Ionicons.Button
            name="trash-outline"
            backgroundColor="transparent"
            color="#e53935"
            size={Platform.OS === 'web' ? 32 : 24}
            onPress={() => onDelete(task.id)}
            iconStyle={{ marginRight: 0 }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  // All hooks at the top
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  const { user, signIn, signOut, error: authError } = useGoogleAuth();
  const { tasks, addTask, updateTask, deleteTask, markComplete } = useTasks();
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState<{ title: string; description: string; dueDate: string; priority: Priority }>({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<{ title: string; description: string; dueDate: string; priority: Priority }>({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'complete'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [modalAnim] = useState(new Animated.Value(0));

  // Animate modal in/out
  React.useEffect(() => {
    if (showAdd) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showAdd]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800); // Simulate refresh
  };

  // Wrap addTask to set recentlyAddedId
  const handleAddTask = (task: { title: string; description: string; dueDate: string; priority: Priority }) => {
    const id = Math.random().toString(36).slice(2);
    addTask({ ...task });
    setRecentlyAddedId(id);
    setTimeout(() => setRecentlyAddedId(null), 1000);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'open' && b.status === 'complete') return -1;
    if (a.status === 'complete' && b.status === 'open') return 1;
    return 0;
  });
  const filteredTasks = sortedTasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'open' && task.status === 'open') ||
      (filter === 'complete' && task.status === 'complete');
    return matchesSearch && matchesFilter;
  });

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: theme.text }}>Sign in to manage your tasks</Text>
        <TouchableOpacity
          onPress={signIn}
          style={{ backgroundColor: theme.tint, borderRadius: 8, paddingHorizontal: 32, paddingVertical: 14, marginBottom: 12 }}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-google" size={24} color={theme.background} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.background, fontWeight: 'bold', fontSize: 18 }}>Sign in with Google</Text>
        </TouchableOpacity>
        {authError ? <Text style={{ color: 'red', marginTop: 8 }}>{authError}</Text> : null}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: theme.text }}>Your Tasks</Text>
      <View style={{ marginBottom: 10, paddingHorizontal: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#23272a' : '#f2f2f2', borderRadius: 24, paddingHorizontal: 12 }}>
          <Ionicons name="search" size={20} color={theme.icon} style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor={theme.icon}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: theme.text, fontSize: 16, paddingVertical: 8, backgroundColor: 'transparent' }}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}>
        <MaterialIcons.Button
          name="filter-list"
          backgroundColor={filter === 'all' ? theme.tint : 'transparent'}
          color={filter === 'all' ? theme.background : theme.icon}
          size={22}
          borderRadius={16}
          onPress={() => setFilter('all')}
          iconStyle={{ marginRight: 0 }}
          style={{ paddingHorizontal: 10, height: 36, marginRight: 4 }}
        >All</MaterialIcons.Button>
        <MaterialIcons.Button
          name="hourglass-empty"
          backgroundColor={filter === 'open' ? '#fb8c00' : 'transparent'}
          color={filter === 'open' ? theme.background : theme.icon}
          size={22}
          borderRadius={16}
          onPress={() => setFilter('open')}
          iconStyle={{ marginRight: 0 }}
          style={{ paddingHorizontal: 10, height: 36, marginRight: 4 }}
        >Not Complete</MaterialIcons.Button>
        <MaterialIcons.Button
          name="check-circle"
          backgroundColor={filter === 'complete' ? '#43a047' : 'transparent'}
          color={filter === 'complete' ? theme.background : theme.icon}
          size={22}
          borderRadius={16}
          onPress={() => setFilter('complete')}
          iconStyle={{ marginRight: 0 }}
          style={{ paddingHorizontal: 10, height: 36 }}
        >Complete</MaterialIcons.Button>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredTasks.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 48 }}>
            <Ionicons name="cloud-offline-outline" size={48} color={theme.tabIconDefault} />
            <Text style={{ color: theme.tabIconDefault, fontSize: 18, marginTop: 12 }}>No tasks found.</Text>
            <Text style={{ color: theme.tabIconDefault, fontSize: 14, marginTop: 4 }}>Tap the + button to add your first task!</Text>
          </View>
        )}
        {filteredTasks.length > 0 && (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={markComplete}
              onEdit={(t: Task) => {
                setEditTaskId(t.id);
                setEditTask({ title: t.title, description: t.description, dueDate: t.dueDate, priority: t.priority });
              }}
              onDelete={deleteTask}
              removingId={removingId}
              setRemovingId={setRemovingId}
              colorScheme={colorScheme ?? 'light'}
              theme={theme}
            />
          ))
        )}
      </ScrollView>
      {/* Edit Task Modal */}
      <Modal visible={!!editTaskId} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ width: '90%', backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Edit Task</Text>
            <TextInput placeholder="Title" value={editTask.title} onChangeText={t => setEditTask(et => ({ ...et, title: t }))} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }} />
            <TextInput placeholder="Description" value={editTask.description} onChangeText={t => setEditTask(et => ({ ...et, description: t }))} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }} />
            <TextInput placeholder="Due Date (YYYY-MM-DD)" value={editTask.dueDate} onChangeText={t => setEditTask(et => ({ ...et, dueDate: t }))} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 8 }} />
            {editTaskId && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                {(['low', 'medium', 'high'] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setEditTask(et => ({ ...et, priority: p }))}
                    style={{
                      flex: 1,
                      marginHorizontal: 4,
                      backgroundColor: editTask.priority === p ? (p === 'high' ? '#e53935' : p === 'medium' ? '#fb8c00' : '#43a047') : 'transparent',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: editTask.priority === p ? 'transparent' : theme.tabIconDefault,
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: editTask.priority === p ? '#fff' : theme.text, fontWeight: 'bold', fontSize: 15 }}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button title="Cancel" onPress={() => setEditTaskId(null)} />
              <View style={{ width: 8 }} />
              <Button title="Save" onPress={() => {
                if (!editTaskId) return;
                updateTask(editTaskId, editTask);
                setEditTaskId(null);
              }} />
            </View>
          </View>
        </View>
      </Modal>
      {showAdd && (
        <Modal
          visible={showAdd}
          animationType="none"
          transparent
          onRequestClose={() => setShowAdd(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
            <Animated.View
              style={{
                width: '92%',
                maxWidth: 420,
                backgroundColor: theme.background,
                padding: 28,
                borderRadius: 28,
                elevation: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                alignItems: 'stretch',
                opacity: modalAnim,
                transform: [{ translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }],
              }}
            >
              <TouchableOpacity
                onPress={() => setShowAdd(false)}
                style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={28} color={theme.icon} />
              </TouchableOpacity>
              <Text style={{ fontWeight: 'bold', marginBottom: 18, fontSize: 22, color: theme.text, alignSelf: 'center' }}>Add Task</Text>
              <TextInput placeholder="Title" value={newTask.title} onChangeText={t => setNewTask(nt => ({ ...nt, title: t }))} style={{ borderWidth: 1, borderColor: theme.tabIconDefault, borderRadius: 12, marginBottom: 14, padding: 14, color: theme.text, backgroundColor: colorScheme === 'dark' ? '#23272a' : '#fafbfc', fontSize: 17 }} placeholderTextColor={theme.icon} />
              <TextInput placeholder="Description" value={newTask.description} onChangeText={t => setNewTask(nt => ({ ...nt, description: t }))} style={{ borderWidth: 1, borderColor: theme.tabIconDefault, borderRadius: 12, marginBottom: 14, padding: 14, color: theme.text, backgroundColor: colorScheme === 'dark' ? '#23272a' : '#fafbfc', fontSize: 17 }} placeholderTextColor={theme.icon} />
              <TextInput placeholder="Due Date (YYYY-MM-DD)" value={newTask.dueDate} onChangeText={t => setNewTask(nt => ({ ...nt, dueDate: t }))} style={{ borderWidth: 1, borderColor: theme.tabIconDefault, borderRadius: 12, marginBottom: 14, padding: 14, color: theme.text, backgroundColor: colorScheme === 'dark' ? '#23272a' : '#fafbfc', fontSize: 17 }} placeholderTextColor={theme.icon} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                {(['low', 'medium', 'high'] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setNewTask(nt => ({ ...nt, priority: p }))}
                    style={{
                      flex: 1,
                      marginHorizontal: 4,
                      backgroundColor: newTask.priority === p ? (p === 'high' ? '#e53935' : p === 'medium' ? '#fb8c00' : '#43a047') : 'transparent',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: newTask.priority === p ? 'transparent' : theme.tabIconDefault,
                      paddingVertical: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: newTask.priority === p ? '#fff' : theme.text, fontWeight: 'bold', fontSize: 15 }}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button title="Cancel" onPress={() => setShowAdd(false)} />
                <View style={{ width: 12 }} />
                <Button title="Add" onPress={() => {
                  if (!newTask.title) return;
                  handleAddTask({ ...newTask });
                  setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' });
                  setShowAdd(false);
                }} />
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      )}
      {/* Remove the floating FAB from the bottom right. */}
      {/* Add a new 'Create New' button to the right side of the Home button, in the same line as the bottom navigation bar: */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center', zIndex: 100 }}>
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          style={{
            backgroundColor: theme.tint,
            borderRadius: 28,
            width: 56,
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 6,
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color={theme.background} />
        </TouchableOpacity>
      </View>
      {/* In the main UI (after if (!user) ...), add a Log Out button at the top right: */}
      <View style={{ position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
        <TouchableOpacity
          onPress={signOut}
          style={{ backgroundColor: theme.tint, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 8 }}
          activeOpacity={0.85}
        >
          <Text style={{ color: theme.background, fontWeight: 'bold', fontSize: 16 }}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
