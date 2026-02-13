import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useSearchParams } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Task, Priority } from '../types';
import { Filter, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown, Calendar, Clock, Type, List, Folder, LayoutGrid, Kanban, Sparkles } from 'lucide-react';

type SortOption = 'priority' | 'dueDate' | 'alphabetical' | 'created';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'list' | 'board';

const Dashboard: React.FC = () => {
  const { tasks, searchQuery, addTask, categories, updateTask } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Filters state
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [showCompleted, setShowCompleted] = useState(true); // Default to true for better DnD visibility
  const [quickAddTitle, setQuickAddTitle] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // DnD State
  const [dragOverColumn, setDragOverColumn] = useState<Priority | null>(null);
  const [dragOverList, setDragOverList] = useState<'active' | 'completed' | null>(null);

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
      
      // Priority (Only applies in List View usually, but kept for consistency)
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
                const pVal = { High: 3, Medium: 2, Low: 1 };
                res = pVal[a.priority] - pVal[b.priority];
                break;
            case 'dueDate':
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

  // --- DnD Handlers ---
  const handleDragStart = (e: React.DragEvent, task: Task) => {
      e.dataTransfer.setData('taskId', task.id);
      e.dataTransfer.effectAllowed = 'move';
  };

  // Board View DnD
  const handleDragOver = (e: React.DragEvent, priority: Priority) => {
      e.preventDefault();
      setDragOverColumn(priority);
  };

  const handleDrop = (e: React.DragEvent, newPriority: Priority) => {
      e.preventDefault();
      setDragOverColumn(null);
      const taskId = e.dataTransfer.getData('taskId');
      if (taskId) {
          updateTask(taskId, { priority: newPriority });
      }
  };

  // List View DnD (Status Change)
  const handleListDragOver = (e: React.DragEvent, status: 'active' | 'completed') => {
      e.preventDefault();
      setDragOverList(status);
  };

  const handleListDrop = (e: React.DragEvent, status: 'active' | 'completed') => {
      e.preventDefault();
      setDragOverList(null);
      const taskId = e.dataTransfer.getData('taskId');
      if (taskId) {
          const targetIsCompleted = status === 'completed';
          const task = tasks.find(t => t.id === taskId);
          // Only update if state is different to prevent unnecessary updates
          if (task && task.isCompleted !== targetIsCompleted) {
             updateTask(taskId, { isCompleted: targetIsCompleted });
          }
      }
  };

  // --- Render Helpers ---

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300 animate-fade-in">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Sparkles size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No tasks found</h3>
        <p className="text-slate-500 text-center max-w-xs mt-1 mb-6">
            You're all caught up! Add a new task to get started on your next goal.
        </p>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow flex items-center gap-2"
        >
            Create New Task
        </button>
    </div>
  );

  const renderBoardColumn = (priority: Priority, label: string, colorClass: string, bgClass: string) => {
      const columnTasks = activeTasks.filter(t => t.priority === priority);

      return (
          <div 
            className={`flex-1 min-w-[280px] bg-slate-50/50 rounded-xl p-3 flex flex-col h-full border transition-colors duration-200 ${dragOverColumn === priority ? 'border-blue-400 bg-blue-50/30' : 'border-transparent'}`}
            onDragOver={(e) => handleDragOver(e, priority)}
            onDrop={(e) => handleDrop(e, priority)}
            onDragLeave={() => setDragOverColumn(null)}
          >
              <div className={`flex items-center justify-between mb-3 px-1`}>
                 <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 rounded-full ${bgClass}`}></div>
                     <h3 className="font-semibold text-slate-700">{label}</h3>
                     <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{columnTasks.length}</span>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                  {columnTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEdit={handleEdit} 
                        isDraggable={true}
                        onDragStart={handleDragStart}
                      />
                  ))}
                  {columnTasks.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm italic">
                          Drop {label} priority tasks here
                      </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 flex-shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                {categoryFilter ? 'Category Tasks' : 'My Tasks'}
            </h1>
            <p className="text-slate-500 mt-1">
                You have {activeTasks.length} active tasks
            </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
             
             {/* View Toggle */}
             <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    title="List View"
                 >
                     <LayoutGrid size={18} />
                 </button>
                 <button 
                    onClick={() => setViewMode('board')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    title="Board View (Drag & Drop)"
                 >
                     <Kanban size={18} />
                 </button>
             </div>

             <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block"></div>

             {/* Sort Dropdown (List View Only) */}
             {viewMode === 'list' && (
                 <>
                    <div className="relative group z-20">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap shadow-sm">
                            <ArrowUpDown size={14} />
                            <span className="hidden sm:inline">Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
                        </button>
                        <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-100 hidden group-hover:block p-1 animate-in fade-in zoom-in-95 duration-100">
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
                    <button 
                        onClick={toggleDirection}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm"
                        title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        {sortDirection === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                    </button>
                 </>
             )}

             {/* Category Filter */}
             <div className="relative group z-10">
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap shadow-sm">
                    <Folder size={14} />
                    {currentCategoryName === 'All' ? 'Category: All' : currentCategoryName}
                 </button>
                 <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 hidden group-hover:block p-1 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
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

             {/* Priority Filter (List View Only) */}
             {viewMode === 'list' && (
                <div className="relative group z-10">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap shadow-sm">
                        <Filter size={14} />
                        {priorityFilter === 'All' ? 'Priority: All' : priorityFilter}
                    </button>
                    <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 hidden group-hover:block p-1 animate-in fade-in zoom-in-95 duration-100">
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
             )}
        </div>
      </div>

      {/* Quick Add (Visible only in List Mode or if filtered) */}
      <div className="relative flex-shrink-0">
        <input 
            type="text"
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            onKeyDown={handleQuickAdd}
            placeholder={viewMode === 'board' ? "+ Quick Add Task (Default: Medium Priority)" : "+ Add a task quickly (Press Enter)"}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 text-slate-700 transition-shadow"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-4">
        
        {viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-8 pb-10">
                {/* Active Tasks Group */}
                <div 
                    className={`rounded-xl transition-all duration-200 ${dragOverList === 'active' ? 'bg-blue-50/50 ring-2 ring-blue-400 ring-offset-2 p-2 -m-2' : ''}`}
                    onDragOver={(e) => handleListDragOver(e, 'active')}
                    onDragLeave={() => setDragOverList(null)}
                    onDrop={(e) => handleListDrop(e, 'active')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            Active Tasks
                            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full">{sortedActiveTasks.length}</span>
                        </h2>
                    </div>

                    <div className="space-y-3 min-h-[50px]">
                        {sortedActiveTasks.length === 0 && !dragOverList && renderEmptyState()}
                        {sortedActiveTasks.map(task => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                onEdit={handleEdit}
                                isDraggable={true}
                                onDragStart={handleDragStart}
                            />
                        ))}
                        {dragOverList === 'active' && (
                             <div className="h-16 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 font-medium animate-pulse">
                                Mark as Active
                             </div>
                        )}
                    </div>
                </div>

                {/* Completed Tasks Group */}
                <div 
                    className={`rounded-xl transition-all duration-200 ${dragOverList === 'completed' ? 'bg-green-50/50 ring-2 ring-green-400 ring-offset-2 p-2 -m-2' : ''}`}
                    onDragOver={(e) => handleListDragOver(e, 'completed')}
                    onDragLeave={() => setDragOverList(null)}
                    onDrop={(e) => handleListDrop(e, 'completed')}
                >
                    <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-200">
                        <h2 className="text-lg font-bold text-slate-600 flex items-center gap-2">
                            Completed
                            <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full">{sortedCompletedTasks.length}</span>
                        </h2>
                        {sortedCompletedTasks.length > 0 && (
                            <button 
                                onClick={() => setShowCompleted(!showCompleted)} 
                                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                {showCompleted ? 'Hide' : 'Show'}
                            </button>
                        )}
                    </div>

                    {(showCompleted || dragOverList === 'completed') && (
                        <div className="space-y-3 min-h-[50px]">
                            {sortedCompletedTasks.map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    onEdit={handleEdit} 
                                    isDraggable={true}
                                    onDragStart={handleDragStart}
                                />
                            ))}
                            {sortedCompletedTasks.length === 0 && !dragOverList && (
                                <div className="text-center py-6 text-slate-400 italic bg-slate-50 rounded-lg border border-slate-100">
                                    No completed tasks yet
                                </div>
                            )}
                            {dragOverList === 'completed' && (
                                <div className="h-16 border-2 border-dashed border-green-300 bg-green-50 rounded-lg flex items-center justify-center text-green-600 font-medium animate-pulse">
                                    Drop to Complete
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        ) : (
            /* BOARD VIEW (KANBAN) */
            <div className="h-full overflow-x-auto">
                <div className="flex flex-col md:flex-row gap-4 h-full min-w-full md:min-w-[800px]">
                    {renderBoardColumn('High', 'High Priority', 'text-red-600', 'bg-red-500')}
                    {renderBoardColumn('Medium', 'Medium Priority', 'text-amber-600', 'bg-amber-500')}
                    {renderBoardColumn('Low', 'Low Priority', 'text-blue-600', 'bg-blue-500')}
                </div>
            </div>
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        taskToEdit={editingTask} 
      />
    </div>
  );
};

export default Dashboard;