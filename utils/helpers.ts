import { Priority } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'High': return 'text-danger border-danger';
    case 'Medium': return 'text-warning border-warning';
    case 'Low': return 'text-primary border-primary';
    default: return 'text-slate-500 border-slate-500';
  }
};

export const getPriorityBg = (priority: Priority): string => {
  switch (priority) {
    case 'High': return 'bg-red-50 text-red-700';
    case 'Medium': return 'bg-amber-50 text-amber-700';
    case 'Low': return 'bg-blue-50 text-blue-700';
    default: return 'bg-slate-50 text-slate-700';
  }
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export const isOverdue = (dateString?: string): boolean => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  return due < today;
};
