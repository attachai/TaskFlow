import React from 'react';
import { Trash2, Calendar, Edit2, Flag, GripVertical } from 'lucide-react';
import { Task } from '../types';
import { useStore } from '../context/StoreContext';
import { getPriorityColor, formatDate, isOverdue } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, isDraggable = false, onDragStart }) => {
  const { toggleTaskCompletion, deleteTask, categories } = useStore();
  
  const category = categories.find(c => c.id === task.categoryId);
  const overdue = task.dueDate && isOverdue(task.dueDate) && !task.isCompleted;

  return (
    <div 
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart && onDragStart(e, task)}
      className={`group relative flex items-start p-4 bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300 ${
        task.isCompleted ? 'bg-slate-50/50' : 'bg-white'
      } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {/* Priority Indicator Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
        task.priority === 'High' ? 'bg-red-500' : 
        task.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
      }`} />

      {/* Drag Handle (Visible on Hover in Board View) */}
      {isDraggable && (
        <div className="absolute top-1/2 -translate-y-1/2 left-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
           <GripVertical size={16} />
        </div>
      )}

      {/* Checkbox */}
      <div className={`flex-shrink-0 mt-0.5 ${isDraggable ? 'ml-6' : 'ml-3'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskCompletion(task.id);
          }}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
            task.isCompleted
              ? 'bg-green-500 border-green-500 text-white scale-110'
              : 'border-slate-300 hover:border-blue-500 text-transparent hover:scale-105'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 ml-3 mr-4 cursor-pointer select-none" onClick={() => onEdit(task)}>
        <h3 className={`text-base font-medium truncate transition-colors ${
          task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
        }`}>
          {task.title}
        </h3>
        
        {task.description && (
          <p className={`mt-1 text-sm truncate ${
            task.isCompleted ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-2">
          {category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
              {category.name}
            </span>
          )}

          {task.dueDate && (
            <div className={`flex items-center text-xs ${
              overdue ? 'text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded' : 'text-slate-500'
            }`}>
              <Calendar size={12} className="mr-1" />
              {formatDate(task.dueDate)}
            </div>
          )}

          {!isDraggable && (
            <div className={`flex items-center text-xs font-medium ${getPriorityColor(task.priority)}`}>
              <Flag size={12} className="mr-1 fill-current opacity-70" />
              {task.priority}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Delete this task?')) {
              deleteTask(task.id);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors ml-1"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;