import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Category, User, Priority } from '../types';
import { generateId } from '../utils/helpers';

interface StoreContextType {
  user: User | null;
  tasks: Task[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  login: (email: string, name: string) => void;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addCategory: (name: string, color: string) => void;
  deleteCategory: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Work', color: 'bg-blue-500', isDefault: true },
  { id: 'cat_2', name: 'Personal', color: 'bg-green-500', isDefault: true },
  { id: 'cat_3', name: 'Shopping', color: 'bg-purple-500', isDefault: true },
  { id: 'cat_4', name: 'Health', color: 'bg-red-500', isDefault: true },
];

const MOCK_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Review Q3 Financials',
    description: 'Go through the spreadsheets and prepare the summary for the board meeting.',
    priority: 'High',
    categoryId: 'cat_1',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000).toISOString()
  },
  {
    id: 'task_2',
    title: 'Buy Groceries',
    priority: 'Low',
    categoryId: 'cat_3',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');

  // Load from local storage on mount (simulated)
  useEffect(() => {
    const storedUser = localStorage.getItem('taskflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, name: string) => {
    const newUser = { id: generateId(), email, displayName: name };
    setUser(newUser);
    localStorage.setItem('taskflow_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskflow_user');
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: generateId(),
      name,
      color,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        tasks,
        categories,
        searchQuery,
        setSearchQuery,
        login,
        logout,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
