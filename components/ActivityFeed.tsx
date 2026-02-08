
import React from 'react';
import { Activity } from '../types';

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Live Event Stream</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {activities.length === 0 && (
          <div className="text-[10px] text-slate-400 italic px-2">Waiting for events...</div>
        )}
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-2 bg-slate-50/50 rounded-lg p-2 border border-slate-100 animate-in slide-in-from-left-2 duration-300">
            <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
              activity.type === 'CREATED' ? 'bg-emerald-500' :
              activity.type === 'COMPLETED' ? 'bg-indigo-500' :
              activity.type === 'DELETED' ? 'bg-rose-500' : 'bg-amber-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-600 font-medium truncate">
                <span className="font-bold uppercase opacity-70">{activity.type}</span>: {activity.taskTitle}
              </p>
              <p className="text-[9px] text-slate-400">
                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
