
import React, { useState, useEffect, useMemo } from 'react';
import { Task, ViewType, Priority, SortField, SortOrder, Activity } from './types';
import { taskService } from './services/api';
import Sidebar from './components/Sidebar';
import TaskCard from './components/TaskCard';
import TaskChatInput from './components/TaskChatInput';
import TaskModal from './components/TaskModal';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.TODAY);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Responsive states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const logActivity = (type: Activity['type'], taskTitle: string) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substring(7),
      type,
      taskTitle,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 8));
  };

  const fetchTasks = async () => {
    const data = await taskService.getTasks();
    setTasks(data);
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newTask = await taskService.createTask(taskData);
    setTasks(prev => [newTask, ...prev]);
    logActivity('CREATED', newTask.title);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await taskService.updateTask(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    if ('isCompleted' in updates) {
      logActivity(updates.isCompleted ? 'COMPLETED' : 'UPDATED', updated.title);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await taskService.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    logActivity('DELETED', task.title);
  };

  const handleDuplicateTask = async (id: string) => {
    const duplicate = await taskService.duplicateTask(id);
    setTasks(prev => [duplicate, ...prev]);
    logActivity('CREATED', duplicate.title);
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    handleUpdateTask(id, { isCompleted: !task.isCompleted });
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tasks]);

  const taskCounts = useMemo(() => {
    const counts: Record<ViewType, number> = {
      [ViewType.TODAY]: 0, [ViewType.UPCOMING]: 0, [ViewType.OVERDUE]: 0, [ViewType.COMPLETED]: 0, [ViewType.ALL]: tasks.length,
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    tasks.forEach(task => {
      const taskDate = new Date(task.dueDate);
      if (task.isCompleted) counts[ViewType.COMPLETED]++;
      if (!task.isCompleted) {
        if (taskDate < now) counts[ViewType.OVERDUE]++;
        if (taskDate >= today && taskDate < tomorrow) counts[ViewType.TODAY]++;
        if (taskDate >= tomorrow) counts[ViewType.UPCOMING]++;
      }
    });
    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filtered = tasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = !selectedTag || t.tags.includes(selectedTag);
      if (!matchesSearch || !matchesTag) return false;

      switch (currentView) {
        case ViewType.TODAY: return !t.isCompleted && taskDate >= today && taskDate < tomorrow;
        case ViewType.UPCOMING: return !t.isCompleted && taskDate >= tomorrow;
        case ViewType.OVERDUE: return !t.isCompleted && taskDate < now;
        case ViewType.COMPLETED: return t.isCompleted;
        default: return true;
      }
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'dueDate') comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      else if (sortField === 'priority') {
        const priorityOrder = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
      } else comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, currentView, searchQuery, selectedTag, sortField, sortOrder]);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-slate-900">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        taskCounts={taskCounts}
        activities={activities}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Responsive Header */}
        <header className="h-20 border-b border-slate-100 bg-white flex items-center justify-between px-4 sm:px-8 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <div className="relative flex-1 max-w-md hidden sm:block">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <ICONS.Search />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="lg:hidden p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
            >
              <ICONS.Sparkles />
            </button>
            <button 
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              <ICONS.Plus />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tag Bar */}
        <div className="px-4 sm:px-8 py-4 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-50">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                selectedTag === tag ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Task List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter capitalize">{currentView.toLowerCase()}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Inventory Status:</span>
                  <span className="text-xs font-black text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-lg">{filteredTasks.length} Active</span>
                </div>
              </div>
            </div>

            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 pb-24">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    onDuplicate={handleDuplicateTask}
                    onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Queue Empty</h3>
                <p className="text-sm text-slate-400 max-w-xs mt-3 font-bold">Your workspace is synchronized and up to date.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <TaskChatInput 
        onTaskCreated={handleCreateTask} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={(data) => { if (editingTask) handleUpdateTask(editingTask.id, data); else handleCreateTask(data); }}
        initialTask={editingTask}
      />
    </div>
  );
};

export default App;
