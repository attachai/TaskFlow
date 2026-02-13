import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useSearchParams } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Task, Priority } from '../types';
import { Filter, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown, Calendar, Clock, Type, List, Folder } from 'lucide-react';

type SortOption = 'priority' | 'dueDate' | 'alphabetical' | 'created';
type SortDirection = 'asc' | 'desc';

const Dashboard: React.FC = () => {
  const { tasks, searchQuery, addTask, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters state
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [showCompleted, setShowCompleted] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const categoryFilter = searchParams.get('cat');

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'priority', label: 'Priority', icon: <List size={14} /> },
    { value: 'dueDate', label: 'Due Date', icon: <Calendar size={14} /> },
    { value: 'alphabetical', label: 'Alphabetical', icon: <Type size={14} /> },
    { value: 'created', label: 'Date Created', icon: <Clock size={14} /> },
  ];

  // Derived state
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category
      const matchesCategory = categoryFilter ? task.categoryId === categoryFilter : true;
      
      // Priority
      const matchesPriority = priorityFilter === 'All' ? true : task.priority === priorityFilter;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [tasks, searchQuery, categoryFilter, priorityFilter]);

  const activeTasks = filteredTasks.filter(t => !t.isCompleted);
  const completedTasks = filteredTasks.filter(t => t.isCompleted);

  const sortTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
        let res = 0;
        switch (sortBy) {
            case 'priority':
                // High (3) > Medium (2) > Low (1)
                const pVal = { High: 3, Medium: 2, Low: 1 };
                res = pVal[a.priority] - pVal[b.priority];
                break;
            case 'dueDate':
                // Asc: Earliest date first. No date = Infinity (end)
                // Desc: Latest date first. No date = -Infinity (end)
                const tA = a.dueDate ? new Date(a.dueDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
                const tB = b.dueDate ? new Date(b.dueDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
                res = tA - tB;
                break;
            case 'alphabetical':
                res = a.title.localeCompare(b.title);
                break;
            case 'created':
                res = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;
        }
        // If Ascending, return res. If Descending, flip it.
        return sortDirection === 'asc' ? res : -res;
    });
  };

  const sortedActiveTasks = sortTasks(activeTasks);
  const sortedCompletedTasks = sortTasks(completedTasks);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleQuickAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickAddTitle.trim()) {
        addTask({
            title: quickAddTitle,
            priority: 'Medium',
            categoryId: categoryFilter || 'cat_1', // Default to first cat or current filter
        });
        setQuickAddTitle('');
    }
  };

  const toggleDirection = () => {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const setCategoryFilter = (catId: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (catId) {
        newParams.set('cat', catId);
    } else {
        newParams.delete('cat');
    }
    setSearchParams(newParams);
  };

  const currentCategoryName = useMemo(() => {
      if (!categoryFilter) return 'All';
      const cat = categories.find(c => c.id === categoryFilter);
      return cat ? cat.name : 'All';
  }, [categoryFilter, categories]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Welcome & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">
                {categoryFilter ? 'Category Tasks' : 'My Tasks'}
            </h1>
            <p className="text-slate-500 mt-1">
                You have {activeTasks.length} active tasks
            </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
             
             {/* Sort Dropdown */}
             <div className="relative group z-20">
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap">
                    <ArrowUpDown size={14} />
                    <span className="hidden sm:inline">Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
                    <span className="sm:hidden">Sort</span>
                 </button>
                 <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-100 hidden group-hover:block p-1">
                    {sortOptions.map((opt) => (
                        <button 
                            key={opt.value} 
                            onClick={() => setSortBy(opt.value)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 ${sortBy === opt.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            {opt.icon}
                            {opt.label}
                        </button>
                    ))}
                 </div>
             </div>

             {/* Sort Direction */}
             <button 
                onClick={toggleDirection}
                className="flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
             >
                {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
             </button>

             <div className="w-px h-6 bg-slate-300 mx-1"></div>

             {/* Category Filter */}
             <div className="relative group z-10">
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap">
                    <Folder size={14} />
                    {currentCategoryName === 'All' ? 'Category: All' : currentCategoryName}
                 </button>
                 <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 hidden group-hover:block p-1 max-h-64 overflow-y-auto">
                    <button 
                        onClick={() => setCategoryFilter(null)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50 ${!categoryFilter ? 'text-blue-600 font-medium' : 'text-slate-600'}`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button 
                            key={cat.id} 
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50 flex items-center gap-2 ${categoryFilter === cat.id ? 'text-blue-600 font-medium' : 'text-slate-600'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                            {cat.name}
                        </button>
                    ))}
                 </div>
             </div>

             {/* Priority Filter */}
             <div className="relative group z-10">
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap">
                    <Filter size={14} />
                    {priorityFilter === 'All' ? 'Priority: All' : priorityFilter}
                 </button>
                 <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 hidden group-hover:block p-1">
                    {['All', 'High', 'Medium', 'Low'].map((p) => (
                        <button 
                            key={p} 
                            onClick={() => setPriorityFilter(p as any)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50 ${priorityFilter === p ? 'text-blue-600 font-medium' : 'text-slate-600'}`}
                        >
                            {p}
                        </button>
                    ))}
                 </div>
             </div>
             
             {/* Completed Toggle */}
             <button 
                onClick={() => setShowCompleted(!showCompleted)}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${showCompleted ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
             >
                <CheckCircle2 size={14} />
                <span className="hidden sm:inline">Completed</span>
             </button>
        </div>
      </div>

      {/* Quick Add */}
      <div className="relative">
        <input 
            type="text"
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            onKeyDown={handleQuickAdd}
            placeholder="+ Add a task quickly (Press Enter)"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 text-slate-700"
        />
      </div>

      {/* Task List - Active */}
      <div className="space-y-3">
        {sortedActiveTasks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500">No active tasks found.</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-2 text-blue-600 font-medium hover:underline">Create one?</button>
            </div>
        )}
        {sortedActiveTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} />
        ))}
      </div>

      {/* Task List - Completed */}
      {showCompleted && sortedCompletedTasks.length > 0 && (
          <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  Completed 
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{sortedCompletedTasks.length}</span>
              </h3>
              <div className="space-y-3 opacity-75">
                {sortedCompletedTasks.map(task => (
                    <TaskCard key={task.id} task={task} onEdit={handleEdit} />
                ))}
              </div>
          </div>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        taskToEdit={editingTask} 
      />
    </div>
  );
};

export default Dashboard;