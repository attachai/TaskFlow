import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Flag } from 'lucide-react';
import { Task, Priority } from '../types';
import { useStore } from '../context/StoreContext';
import Button from './Button';
import Input from './Input';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
  initialDate?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit, initialDate }) => {
  const { categories, addTask, updateTask } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setCategoryId(taskToEdit.categoryId);
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
    } else {
      // Defaults for new task
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategoryId(categories[0]?.id || '');
      setDueDate(initialDate || '');
    }
  }, [taskToEdit, categories, isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title,
      description,
      priority,
      categoryId: categoryId || categories[0].id,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {taskToEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border-none shadow-none focus:ring-0 px-0 placeholder:text-slate-400"
            autoFocus
          />

          <textarea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-slate-600 placeholder:text-slate-400 border-none resize-none focus:ring-0 px-0 h-24"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Priority</label>
              <div className="relative">
                <Flag className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
             <div className="flex flex-wrap gap-2">
               {categories.map((cat) => (
                 <button
                   key={cat.id}
                   type="button"
                   onClick={() => setCategoryId(cat.id)}
                   className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                     categoryId === cat.id
                       ? 'bg-slate-800 text-white border-slate-800'
                       : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                   }`}
                 >
                   {cat.name}
                 </button>
               ))}
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!title.trim()}>
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;