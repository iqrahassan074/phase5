
import React from 'react';
import { ViewType, Activity } from '../types';
import { ICONS } from '../constants';
import ActivityFeed from './ActivityFeed';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  taskCounts: Record<ViewType, number>;
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, taskCounts, activities, isOpen, onClose }) => {
  const navItems = [
    { type: ViewType.TODAY, label: 'Today', icon: <ICONS.Calendar /> },
    { type: ViewType.UPCOMING, label: 'Upcoming', icon: <ICONS.Calendar /> },
    { type: ViewType.OVERDUE, label: 'Overdue', icon: <ICONS.Clock /> },
    { type: ViewType.COMPLETED, label: 'Completed', icon: <ICONS.Check /> },
    { type: ViewType.ALL, label: 'All Tasks', icon: <ICONS.Calendar /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 border-r border-slate-100 h-full flex flex-col bg-white shrink-0 shadow-2xl lg:shadow-none z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8">
          <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">Tasks</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Workspace v5</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.type}
              onClick={() => {
                onViewChange(item.type);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-sm font-bold ${
                currentView === item.type
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors ${currentView === item.type ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                {item.label}
              </div>
              <span className={`text-[10px] px-2 py-0.5 font-bold rounded-lg ${
                currentView === item.type ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {taskCounts[item.type]}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-6 border-t border-slate-50 bg-slate-50/30">
          <ActivityFeed activities={activities} />
          
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Node Status
            </div>
            <div className="text-[9px] text-slate-400 flex flex-col gap-2 font-bold">
              <div className="flex justify-between"><span>Cluster</span> <span className="text-slate-900">Live</span></div>
              <div className="flex justify-between"><span>Sync</span> <span className="text-slate-900">100%</span></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
