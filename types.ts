export type Priority = 'High' | 'Medium' | 'Low';

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  categoryId: string;
  isCompleted: boolean;
  dueDate?: string; // ISO string
  createdAt: string; // ISO string
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
