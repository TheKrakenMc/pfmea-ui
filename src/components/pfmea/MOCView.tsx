import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AuditLog } from '../../api/pfmeaService';
import { History, ArrowRight, User, Calendar } from 'lucide-react';

interface MOCViewProps {
  logs: AuditLog[];
}

export const MOCView: React.FC<MOCViewProps> = ({ logs }) => {
  const { t } = useTranslation();

  if (logs.length === 0) {
    return (
      <div className="glass-card p-12 rounded-xl text-center flex flex-col items-center justify-center border border-steel-700/50">
        <History size={48} className="text-steel-600 mb-4" />
        <h3 className="text-lg font-bold text-steel-200">Sin historial de cambios</h3>
        <p className="text-sm text-steel-400">No se han registrado modificaciones para este PFMEA.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-steel-700/50 overflow-hidden">
      <div className="bg-steel-900/80 px-6 py-4 border-b border-steel-700/50 flex items-center gap-3">
        <History className="text-indigo-400" size={20} />
        <h2 className="text-sm font-bold text-steel-100 uppercase tracking-widest">{t('pfmea.moc.title')}</h2>
      </div>
      
      <div className="divide-y divide-steel-800/50">
        {logs.map((log) => (
          <div key={log.id} className="p-6 hover:bg-steel-800/20 transition-colors">
            {/* Header info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wide">
                  {log.action}
                </span>
                <span className="text-steel-300 bg-steel-800/50 px-2 py-1 rounded border border-steel-700/50 flex items-center gap-1.5">
                  <User size={12} className="text-steel-400" />
                  {log.performed_by}
                </span>
                <span className="text-steel-400 flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date(log.performed_at).toLocaleString()}
                </span>
              </div>
              <div className="text-[10px] text-steel-500 uppercase font-mono bg-steel-900/50 px-2 py-1 rounded">
                Entidad: {log.entity_type} (ID: {log.entity_id})
              </div>
            </div>

            {/* Split Screen Diff view */}
            <div className="grid grid-cols-2 gap-6 bg-steel-950/30 rounded-xl p-4 border border-steel-800/50">
              {/* Old Value Side */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400/80">
                  <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                  {t('pfmea.moc.oldValue')}
                </div>
                <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3 text-sm text-steel-300 min-h-[60px] font-mono break-all whitespace-pre-wrap">
                  {log.old_value || log.previous_values ? (
                    log.old_value || JSON.stringify(log.previous_values, null, 2)
                  ) : (
                    <span className="text-steel-600 italic">No disponible</span>
                  )}
                </div>
              </div>

              {/* New Value Side */}
              <div className="flex flex-col gap-2 relative">
                <div className="absolute -left-[19px] top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-steel-900 rounded-full border border-steel-700/50 shadow-xl z-10">
                  <ArrowRight size={14} className="text-steel-400" />
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500/50"></span>
                  {t('pfmea.moc.newValue')}
                </div>
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3 text-sm text-emerald-100/90 min-h-[60px] font-mono break-all whitespace-pre-wrap">
                  {log.new_value || log.new_values ? (
                    log.new_value || JSON.stringify(log.new_values, null, 2)
                  ) : (
                    <span className="text-steel-600 italic">Eliminado / No disponible</span>
                  )}
                </div>
              </div>
            </div>

            {/* Field context if single field change */}
            {log.field_name && (
              <div className="mt-3 text-[10px] font-medium text-steel-400 flex items-center gap-1">
                Campo modificado: <span className="text-forge-400 bg-forge-900/20 px-1.5 py-0.5 rounded border border-forge-500/20">{log.field_name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
