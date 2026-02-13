import React, { useState, ReactNode } from 'react';
import { Menu, Search, Bell, User as UserIcon, LogOut, X, Plus, Calendar, LayoutDashboard } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import TaskModal from '../components/TaskModal';

const DashboardLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, categories, tasks, logout, searchQuery, setSearchQuery } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const location = useLocation();

  const uncompletedCount = (catId?: string) => {
      if (catId) {
          return tasks.filter(t => t.categoryId === catId && !t.isCompleted).length;
      }
      return tasks.filter(t => !t.isCompleted).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <span className="p-1 bg-blue-600 rounded text-white"><Plus size={16} /></span>
                TaskFlow
            </h1>
            <button className="ml-auto md:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <Link to="/dashboard" className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${location.pathname === '/dashboard' && !location.search ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
               <span className="flex items-center gap-3">
                   <LayoutDashboard size={18} />
                   Dashboard
               </span>
               <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{uncompletedCount()}</span>
            </Link>

            <Link to="/calendar" className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${location.pathname === '/calendar' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
               <span className="flex items-center gap-3">
                   <Calendar size={18} />
                   Calendar
               </span>
            </Link>

            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Categories
            </div>
            
            {categories.map(cat => (
                <Link key={cat.id} to={`/dashboard?cat=${cat.id}`} className="flex items-center justify-between px-3 py-2 rounded-md text-slate-600 hover:bg-slate-50 transition-colors group">
                    <span className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${cat.color.replace('bg-', 'bg-')}`}></div>
                        {cat.name}
                    </span>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-400 group-hover:text-slate-600 px-2 py-0.5 rounded-full transition-colors">
                        {uncompletedCount(cat.id)}
                    </span>
                </Link>
            ))}
            
            <Link to="/categories" className="flex items-center gap-3 px-3 py-2 mt-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                <Plus size={16} />
                <span>New Category</span>
            </Link>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Link to="/profile" className="flex items-center gap-3 mb-4 px-2 py-2 rounded-md hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-200 transition-colors">
                    {user?.displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{user?.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 w-full px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors">
                <LogOut size={16} />
                Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-30">
          <button className="md:hidden text-slate-500 p-2 -ml-2" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="flex-1 max-w-xl mx-4 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 rounded-md text-sm transition-all focus:ring-2 focus:ring-blue-100 outline-none"
             />
          </div>

          <div className="flex items-center gap-4">
             <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <Button size="sm" onClick={() => setIsTaskModalOpen(true)} className="hidden md:flex">
                <Plus size={16} className="mr-1" />
                New Task
             </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {children}
        </main>

        {/* FAB for Mobile */}
        <button 
           onClick={() => setIsTaskModalOpen(true)}
           className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 z-40 transition-transform active:scale-95"
        >
            <Plus size={28} />
        </button>

        <TaskModal 
            isOpen={isTaskModalOpen} 
            onClose={() => setIsTaskModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default DashboardLayout;