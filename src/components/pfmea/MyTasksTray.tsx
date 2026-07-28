import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PfmeaTask } from '../../api/pfmeaService';
import { CheckSquare, Calendar, AlertTriangle, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MyTasksTrayProps {
  tasks: PfmeaTask[];
}

export const MyTasksTray: React.FC<MyTasksTrayProps> = ({ tasks }) => {
  const { t } = useTranslation();

  const getAPBadge = (ap?: string) => {
    if (!ap) return null;
    let colorClass = 'bg-steel-800 text-steel-400';
    let Icon = AlertCircle;
    
    if (ap === 'H') {
      colorClass = 'bg-alert-red/20 text-alert-red border border-alert-red/30';
      Icon = AlertTriangle;
    } else if (ap === 'M') {
      colorClass = 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30';
      Icon = AlertCircle;
    } else if (ap === 'L') {
      colorClass = 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30';
      Icon = CheckCircle2;
    }

    return (
      <div className={`flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${colorClass}`}>
        <Icon size={10} />
        {ap}
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="glass-card p-12 rounded-xl text-center flex flex-col items-center justify-center border border-steel-700/50">
        <CheckSquare size={48} className="text-steel-600 mb-4" />
        <h3 className="text-lg font-bold text-steel-200">¡Todo al día!</h3>
        <p className="text-sm text-steel-400">{t('pfmea.tasks.empty')}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-steel-700/50 overflow-hidden">
      <div className="bg-steel-900/80 px-6 py-4 border-b border-steel-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare className="text-forge-400" size={20} />
          <h2 className="text-sm font-bold text-steel-100 uppercase tracking-widest">{t('pfmea.tasks.title')}</h2>
        </div>
        <span className="bg-forge-500/20 text-forge-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-forge-500/30">
          {tasks.length} Tareas
        </span>
      </div>

      <div className="divide-y divide-steel-800/50">
        {tasks.map((task) => (
          <div key={task.row_id} className="p-4 hover:bg-steel-800/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
            {/* Task Info */}
            <div className="flex-1 flex items-start gap-4">
              <div className="mt-1">
                {getAPBadge(task.action_priority)}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                    {task.pfmea_id_number || `PFMEA-${task.pfmea_id}`}
                  </span>
                  <span className="text-xs text-steel-300 font-medium line-clamp-1">{task.project_name}</span>
                </div>
                <h4 className="text-sm font-semibold text-steel-100 mt-1">
                  Prev: {task.optimization_prevention_action || 'N/A'}
                </h4>
                <p className="text-xs text-steel-400">
                  Det: {task.optimization_detection_action || 'N/A'}
                </p>
                <div className="text-[10px] text-steel-500 flex items-center gap-1 mt-1">
                  Modo de falla: <span className="text-red-400 font-medium bg-red-500/10 px-1 rounded">{task.failure_mode}</span>
                </div>
              </div>
            </div>

            {/* Task Meta & Action */}
            <div className="flex items-center gap-6 self-start md:self-center">
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  task.action_status === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-steel-700/50 text-steel-300 border border-steel-600/50'
                }`}>
                  {task.action_status || 'Open'}
                </span>
                {task.target_completion_date && (
                  <span className="text-[10px] flex items-center gap-1 text-steel-400">
                    <Calendar size={10} />
                    {task.target_completion_date}
                  </span>
                )}
              </div>
              
              <Link 
                to={`/pfmea/${task.pfmea_id}`}
                className="w-8 h-8 rounded-full bg-steel-800/50 border border-steel-700/50 flex items-center justify-center text-steel-400 hover:text-forge-400 hover:bg-steel-700 hover:border-forge-500 transition-all group-hover:translate-x-1"
              >
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
