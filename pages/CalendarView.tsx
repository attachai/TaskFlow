import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, Priority } from '../types';
import TaskModal from '../components/TaskModal';

const CalendarView: React.FC = () => {
  const { tasks } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialDate, setInitialDate] = useState('');

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  
  // Helper to get day of week for first day (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        // Format ISO string to YYYY-MM-DD for easier comparison
        const dateKey = task.dueDate.split('T')[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const handleDayClick = (dateString: string) => {
    setInitialDate(dateString);
    setSelectedTask(undefined);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setInitialDate('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(undefined);
    setInitialDate('');
  };

  const getPriorityStyles = (p: Priority) => {
      switch(p) {
          case 'High': 
            return 'bg-red-50 text-red-700 border-red-200 border-l-red-500 hover:bg-red-100';
          case 'Medium': 
            return 'bg-amber-50 text-amber-700 border-amber-200 border-l-amber-500 hover:bg-amber-100';
          case 'Low': 
            return 'bg-blue-50 text-blue-700 border-blue-200 border-l-blue-500 hover:bg-blue-100';
          default: 
            return 'bg-slate-50 text-slate-700 border-slate-200 border-l-slate-400 hover:bg-slate-100';
      }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] md:min-h-[120px] bg-slate-50/30 border-b border-r border-slate-200"></div>);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = tasksByDate[dateString] || [];
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div 
            key={day} 
            onClick={() => handleDayClick(dateString)}
            className={`min-h-[100px] md:min-h-[120px] border-b border-r border-slate-200 p-1 md:p-2 hover:bg-slate-50 transition-colors cursor-pointer group ${isToday ? 'bg-blue-50/20' : 'bg-white'}`}
        >
          <div className="flex justify-between items-start mb-1">
             <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 group-hover:bg-slate-200 group-hover:text-slate-800 transition-colors'}`}>
                 {day}
             </span>
             {dayTasks.length > 0 && <span className="text-xs text-slate-400 font-medium md:hidden">{dayTasks.length}•</span>}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin scrollbar-thumb-slate-200">
            {dayTasks.map(task => (
                <button 
                    key={task.id}
                    onClick={(e) => handleTaskClick(task, e)}
                    className={`w-full text-left text-xs px-2 py-1 rounded-r-md border-y border-r border-l-[3px] truncate shadow-sm transition-all mb-0.5 ${getPriorityStyles(task.priority)} ${task.isCompleted ? 'opacity-60 line-through grayscale' : ''}`}
                    title={task.title}
                >
                    {task.title}
                </button>
            ))}
          </div>
        </div>
      );
    }
    
    // Fill remaining cells to complete the last row
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
        for (let i = 0; i < remainingCells; i++) {
             days.push(<div key={`empty-end-${i}`} className="min-h-[100px] md:min-h-[120px] bg-slate-50/30 border-b border-r border-slate-200"></div>);
        }
    }

    return days;
  };

  return (
    <div className="h-full flex flex-col space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
            <p className="text-slate-500 mt-1">View your tasks by due date.</p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Legend */}
             <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 mr-2">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>High</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Medium</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Low</div>
             </div>

             <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"><ChevronLeft size={20} /></button>
                <span className="px-4 font-semibold text-slate-700 min-w-[160px] text-center select-none">{monthName} {year}</span>
                <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"><ChevronRight size={20} /></button>
             </div>
          </div>
       </div>

       {/* Calendar Grid */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
           {/* Weekday Headers */}
           <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                   <div key={d} className="py-3 text-center text-xs md:text-sm font-semibold text-slate-500 border-r border-slate-200 last:border-r-0 uppercase tracking-wider">
                       {d}
                   </div>
               ))}
           </div>
           
           {/* Days */}
           <div className="grid grid-cols-7">
               {renderCalendarDays()}
           </div>
       </div>

       <TaskModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        taskToEdit={selectedTask} 
        initialDate={initialDate}
       />
    </div>
  );
};

export default CalendarView;