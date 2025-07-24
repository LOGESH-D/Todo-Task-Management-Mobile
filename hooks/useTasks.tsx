import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  status: 'open' | 'complete';
  priority: 'low' | 'medium' | 'high';
};

interface TasksContextProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  markComplete: (id: string) => void;
}

const TasksContext = createContext<TasksContextProps | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('tasks').then(data => {
      if (data) setTasks(JSON.parse(data));
    });
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id' | 'status'>) => {
    setTasks(prev => [
      ...prev,
      {
        ...task,
        id: Math.random().toString(36).slice(2),
        status: 'open',
      },
    ]);
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const markComplete = (id: string) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: 'complete' } : t)));
  };

  return (
    <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask, markComplete }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within a TasksProvider');
  return ctx;
}; 