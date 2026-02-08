
import React from 'react';
import { Task, Priority, RecurrenceRule } from '../types';
import { ICONS, PRIORITY_COLORS } from '../constants';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onDelete, onDuplicate, onEdit }) => {
  const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const isOverdue = new Date(task.dueDate) < new Date() && !task.isCompleted;

  return (
    <div className={`group relative bg-white border-2 rounded-[2rem] p-5 sm:p-6 transition-all duration-300 ${
      task.isCompleted ? 'opacity-40 grayscale bg-slate-50 border-transparent scale-[0.98]' : 'border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5'
    }`}>
      <div className="flex items-start gap-5">
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`shrink-0 w-8 h-8 rounded-[0.75rem] border-2 flex items-center justify-center transition-all duration-300 ${
            task.isCompleted 
              ? 'bg-emerald-500 border-emerald-500 text-white scale-110' 
              : 'border-slate-200 hover:border-indigo-600 bg-white hover:scale-105'
          }`}
        >
          {task.isCompleted && <ICONS.Check />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className={`text-base sm:text-lg font-black tracking-tight truncate ${
              task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
            }`}>
              {task.title}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-sm font-bold text-slate-400 line-clamp-2 mb-4">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
              <ICONS.Calendar />
              {formattedDate}
            </div>
            
            {task.tags.length > 0 && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex gap-2">
                  {task.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-1">
          <button 
            onClick={() => onEdit(task)}
            className="p-2.5 hover:bg-indigo-50 rounded-2xl text-slate-300 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
            title="Edit Task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-2.5 hover:bg-rose-50 rounded-2xl text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            <ICONS.Trash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
