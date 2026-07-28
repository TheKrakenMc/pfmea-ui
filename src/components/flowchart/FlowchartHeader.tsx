// ─────────────────────────────────────────────────────────────
//  FlowchartHeader — Collapsible project metadata panel
//  Displays and allows editing plant, customer, part number,
//  revision date, cover page, and status.
//  These fields feed directly into the PFMEA analysis module.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Factory,
  Globe2,
  Users,
  Hash,
  Clock,
  User,
  Shield,
} from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import type { FlowchartHeader as IFlowchartHeader, DiagramStatus } from '../../types/flowchart.types';
import { ProcessSymbol } from '../flowcharts/ProcessSymbols';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES: Record<DiagramStatus, { bg: string; text: string; dot: string }> = {
  draft: {
    bg: 'bg-alert-amber/15 border-alert-amber/30',
    text: 'text-alert-amber',
    dot: 'bg-alert-amber',
  },
  in_review: {
    bg: 'bg-review-500/15 border-review-500/30',
    text: 'text-review-500',
    dot: 'bg-review-500',
  },
  approved: {
    bg: 'bg-success-500/15 border-success-500/30',
    text: 'text-success-500',
    dot: 'bg-success-500',
  },
  archived: {
    bg: 'bg-steel-500/15 border-steel-500/30',
    text: 'text-steel-400',
    dot: 'bg-steel-500',
  }
};

export function FlowchartHeader() {
  const { t } = useTranslation();
  const { state, dispatch } = useFlowchart();
  const { header } = state;
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const role = user?.role_name || '';

  const statusStyle = STATUS_STYLES[header.diagramStatus] || STATUS_STYLES.draft;

  const handleFieldChange = (field: keyof IFlowchartHeader, value: string) => {
    dispatch({
      type: 'UPDATE_HEADER',
      payload: { [field]: value },
    });
  };

  // RBAC logic for status transitions
  const getAvailableStatuses = (): DiagramStatus[] => {
    const current = header.diagramStatus;
    const statuses: DiagramStatus[] = [current];

    if (current === 'draft') {
      if (role === 'PFMEA Owner' || role === 'Administrator') {
        statuses.push('in_review');
      }
      if (role === 'Administrator') {
        statuses.push('approved');
      }
    } else if (current === 'in_review') {
      if (role === 'Administrator') {
        statuses.push('approved');
      }
    } else if (current === 'approved') {
      if (role === 'Administrator') {
        statuses.push('archived');
      }
    }

    return Array.from(new Set(statuses));
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-industrial hover:bg-steel-800/50 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forge-glow">
            <Factory size={18} className="text-forge-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-steel-100">
              {t('header.title', 'Cabecera de Proyecto y Proceso')}
            </h2>
            <p className="text-xs text-steel-400">
              {header.plantCode || 'PUEBLA'} — {header.partNumber || 'Sin número de parte'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            {t(`status.${header.diagramStatus}`, header.diagramStatus)}
          </span>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={18} className="text-steel-400" />
          </motion.div>
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-steel-700/50 px-6 pt-5 pb-6">
              <div className="space-y-5">
                {/* Row 1: Descripción & Número de parte */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Factory size={12} className="text-forge-400" />
                      {t('pfmea.header.description', 'Descripción / Nombre del Proyecto')}
                    </label>
                    <input
                      type="text"
                      value={header.partName || ''}
                      onChange={(e) => handleFieldChange('partName', e.target.value)}
                      placeholder="Sin título"
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-100 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Hash size={12} className="text-indigo-400" />
                      {t('pfmea.header.partNumber', 'Número de Parte')}
                    </label>
                    <div className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-mono font-medium select-none cursor-not-allowed">
                      {header.partNumber || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Row 2: Cliente & Planta Info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Users size={12} className="text-sky-400" />
                      {t('pfmea.header.customer', 'Cliente')}
                    </label>
                    <div className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-medium select-none cursor-not-allowed">
                      {header.customer || 'N/A'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Factory size={12} className="text-amber-400" />
                      {t('pfmea.header.plantRegion', 'Planta / Región (Catálogo)')}
                    </label>
                    <div className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-medium select-none cursor-not-allowed flex items-center justify-between">
                      <span>{header.plantName || 'Puebla Plant'}</span>
                      <span className="text-[10px] bg-steel-700/30 px-1.5 py-0.5 rounded font-mono text-steel-300">{header.plantCode || 'PUEBLA'}</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Fecha de Creación, Fecha de Revisión, Revisión, Estado */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {/* Fecha de Creación */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Clock size={12} className="text-emerald-400" />
                      {t('pfmea.header.creationDate', 'Fecha de Creación')}
                    </label>
                    <input
                      type="date"
                      readOnly
                      disabled
                      value={header.creationDate || (header.lastModified ? header.lastModified.split('T')[0] : new Date().toISOString().split('T')[0])}
                      className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-medium cursor-not-allowed focus:outline-none"
                    />
                  </div>

                  {/* Fecha de Revisión */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Clock size={12} className="text-purple-400" />
                      {t('pfmea.header.revisionDate', 'Fecha de Revisión')}
                    </label>
                    <input
                      type="date"
                      value={header.revisionDate || (header.lastModified ? header.lastModified.split('T')[0] : new Date().toISOString().split('T')[0])}
                      onChange={(e) => handleFieldChange('revisionDate', e.target.value)}
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-100 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500"
                    />
                  </div>

                  {/* Revisión */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Hash size={12} className="text-indigo-400" />
                      {t('pfmea.header.revision', 'Revisión')}
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={header.revision || '1'}
                      className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-mono font-medium select-none cursor-not-allowed"
                    />
                  </div>

                  {/* Estado */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <User size={12} className="text-forge-400" />
                      {t('pfmea.header.status', 'Estado')}
                    </label>
                    <select
                      value={header.diagramStatus}
                      onChange={(e) => handleFieldChange('diagramStatus', e.target.value as any)}
                      disabled={availableStatuses.length <= 1}
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-200 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {availableStatuses.includes('draft') && (
                        <option value="draft" className="bg-steel-900 text-steel-200">{t('status.draft', 'Borrador (Draft)')}</option>
                      )}
                      {availableStatuses.includes('in_review') && (
                        <option value="in_review" className="bg-steel-900 text-steel-200">{t('status.in_review', 'En Revisión (In Review)')}</option>
                      )}
                      {availableStatuses.includes('approved') && (
                        <option value="approved" className="bg-steel-900 text-steel-200">{t('status.approved', 'Aprobado (Approved)')}</option>
                      )}
                      {availableStatuses.includes('archived') && (
                        <option value="archived" className="bg-steel-900 text-steel-200">{t('status.archived', 'Archivado (Archived)')}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Row 4: Portada, Confidencialidad, Simbología */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Portada */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Globe2 size={12} className="text-sky-400" />
                      {t('pfmea.header.docCode', 'Código de Portada / Doc')}
                    </label>
                    <div className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-medium select-none cursor-not-allowed">
                      {header.projectId || 'N/A'}
                    </div>
                  </div>

                  {/* Confidencialidad */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Shield size={12} className="text-forge-400" />
                      {t('pfmea.header.confidentiality', 'Confidencialidad')}
                    </label>
                    <select
                      value={header.confidentialityLevel || 'Public'}
                      onChange={(e) => handleFieldChange('confidentialityLevel', e.target.value)}
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-200 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500"
                    >
                      <option value="Public">{t('pfmea.header.public', 'Público')}</option>
                      <option value="Internal">{t('pfmea.header.internal', 'Uso Interno')}</option>
                      <option value="Confidential">{t('pfmea.header.confidential', 'Confidencial')}</option>
                      <option value="Strictly Confidential">{t('pfmea.header.strictlyConfidential', 'Estrictamente Confidencial')}</option>
                    </select>
                  </div>

                  {/* Simbología */}
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Globe2 size={12} className="text-indigo-400" />
                      {t('pfmea.header.processSymbolConfig', 'Simbología de Diagrama de Proceso')}
                    </span>
                    <div className="w-full h-full min-h-[44px] bg-steel-950/20 dark:bg-steel-950/15 border border-steel-700/40 rounded-xl px-3 py-2 flex items-center justify-around gap-1">
                      {/* Operation */}
                      <div className="flex flex-col items-center gap-0.5 group/sym" title="Operación: Actividad física o química que altera el producto.">
                        <div className="w-5 h-5 rounded-full bg-forge-glow flex items-center justify-center text-forge-400 transition-all border border-forge-500/20 hover:border-forge-500/40">
                          <ProcessSymbol symbolType="operation" size={10} />
                        </div>
                        <span className="text-[8px] font-semibold text-steel-400 group-hover/sym:text-steel-200 transition-colors">OP</span>
                      </div>
                      {/* Inspection */}
                      <div className="flex flex-col items-center gap-0.5 group/sym" title="Inspección: Verificación de calidad, dimensiones o conformidad.">
                        <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 transition-all border border-emerald-500/20 hover:border-emerald-500/40">
                          <ProcessSymbol symbolType="inspection" size={10} />
                        </div>
                        <span className="text-[8px] font-semibold text-steel-400 group-hover/sym:text-steel-200 transition-colors">INS</span>
                      </div>
                      {/* Transport */}
                      <div className="flex flex-col items-center gap-0.5 group/sym" title="Transporte: Movimiento de materiales entre estaciones.">
                        <div className="w-5 h-5 rounded bg-sky-500/10 flex items-center justify-center text-sky-400 transition-all border border-sky-500/20 hover:border-sky-500/40">
                          <ProcessSymbol symbolType="transport" size={10} />
                        </div>
                        <span className="text-[8px] font-semibold text-steel-400 group-hover/sym:text-steel-200 transition-colors">TRA</span>
                      </div>
                      {/* Storage */}
                      <div className="flex flex-col items-center gap-0.5 group/sym" title="Almacenamiento: Resguardo temporal o final en almacén/rack.">
                        <div className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-amber-400 transition-all border border-amber-500/20 hover:border-amber-500/40">
                          <ProcessSymbol symbolType="storage" size={10} />
                        </div>
                        <span className="text-[8px] font-semibold text-steel-400 group-hover/sym:text-steel-200 transition-colors">STO</span>
                      </div>
                      {/* Delay */}
                      <div className="flex flex-col items-center gap-0.5 group/sym" title="Demora: Espera temporal entre fases del proceso.">
                        <div className="w-5 h-5 rounded bg-purple-500/10 flex items-center justify-center text-purple-400 transition-all border border-purple-500/20 hover:border-purple-500/40">
                          <ProcessSymbol symbolType="delay" size={10} />
                        </div>
                        <span className="text-[8px] font-semibold text-steel-400 group-hover/sym:text-steel-200 transition-colors">DEL</span>
                      </div>
                      {/* Auto Control */}
                      <div className="flex flex-col items-center gap-0.5 group/sym" title="Autocontrol: Verificación realizada por el mismo operador.">
                        <div className="w-5 h-5 rounded bg-teal-500/10 flex items-center justify-center text-teal-400 transition-all border border-teal-500/20 hover:border-teal-500/40">
                          <ProcessSymbol symbolType="auto_control" size={10} />
                        </div>
                        <span className="text-[8px] font-semibold text-steel-400 group-hover/sym:text-steel-200 transition-colors">AUTO</span>
                      </div>
                      {/* Poka-Yoke */}
                      <div className="flex flex-col items-center gap-0.5 group/sym" title="Poka-Yoke: Sistema a prueba de errores.">
                        <div className="w-5 h-5 rounded bg-rose-500/10 flex items-center justify-center text-rose-400 transition-all border border-rose-500/20 hover:border-rose-500/40">
                          <ProcessSymbol symbolType="pokayoke" size={10} />
                        </div>
                        <span className="text-[8px] font-semibold text-steel-400 group-hover/sym:text-steel-200 transition-colors">PY</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
