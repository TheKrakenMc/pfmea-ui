import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Building2,
  Calendar,
  FileText,
  Globe2,
} from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import type { FlowchartHeader as IFlowchartHeader, DiagramStatus } from '../../types/flowchart.types';
import { ProcessSymbol } from '../flowcharts/ProcessSymbols';
import {useAuth} from '../../hooks/useAuth';

const STATUS_MAP: Record<DiagramStatus, { labelKey: string; style: { bg: string; text: string; dot: string } }> = {
  draft: {
    labelKey: 'Draft',
    style: { bg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60', text: 'text-amber-800 dark:text-amber-300', dot: 'bg-amber-500' }
  },
  in_review: {
    labelKey: 'In Review',
    style: { bg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700/60', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500' }
  },
  approved: {
    labelKey: 'Approved',
    style: { bg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/60', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' }
  },
  archived: {
    labelKey: 'Archived',
    style: { bg: 'bg-slate-200 dark:bg-steel-800/80 border-slate-300 dark:border-steel-700/60', text: 'text-slate-700 dark:text-steel-400', dot: 'bg-slate-500' }
  }
};

export function FlowchartHeader() {
  const { t } = useTranslation();
  const { state, dispatch } = useFlowchart();
  const { header } = state;
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const role = user?.role_name || '';

  const currentStatusObj = STATUS_MAP[header.diagramStatus] || STATUS_MAP.draft;
  const statusStyle = currentStatusObj.style;

  const handleFieldChange = (field: keyof IFlowchartHeader, value: string) => {
    dispatch({
      type: 'UPDATE_HEADER',
      payload: { [field]: value },
    });
  };

  const getAvailableStatuses = (): DiagramStatus[] => {
    const current = header.diagramStatus;
    const statuses: DiagramStatus[] = [current];

    if (current === 'draft') {
      if (role === 'PFMEA Owner' || role === 'Administrator') {
        statuses.push('in_review');
      }
      if (role === 'PFMEA Owner' || role === 'Administrator') {
        statuses.push('approved');
      }
    } else if (current === 'in_review') {
      if (role === 'PFMEA Owner' || role === 'Administrator') {
        statuses.push('approved');
      }
    } else if (current === 'approved') {
      if (role === 'PFMEA Owner' || role === 'Administrator') {
        statuses.push('archived');
      }
    }

    return Array.from(new Set(statuses));
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <div className="bg-white dark:bg-steel-950/90 border border-slate-200 dark:border-steel-800 rounded-xl shadow-lg overflow-hidden backdrop-blur-md transition-all">
      {/* Top Action & Identity Bar */}
      <div className="bg-slate-50 dark:bg-steel-900/90 border-b border-slate-200 dark:border-steel-800/80 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Document Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 px-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-700/60 rounded-lg flex items-center justify-center shadow-xs">
              <span className="font-extrabold tracking-wider text-blue-700 dark:text-blue-400 text-sm font-sans">
                Adler Pelzer Group
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
                  {t('header.title', 'PROCESS FLOW DIAGRAM (PFD) / DIAGRAMA DE FLUJO')}
                </h2>
                {state.isDirty && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/50 animate-pulse">
                    {t('pfmea.header.unsavedChanges', 'Cambios pendientes')}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-steel-400 font-medium">
                {t('header.subtitle', 'AIAG & VDA Harmonized Process Flow (G-C1001 APQP Compliant)')}
              </span>
            </div>
          </div>

          {/* Right Action Block: Step Counter, Status, Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Diagram Status Select */}
            <div className="relative">
              <select
                value={header.diagramStatus}
                onChange={(e) => handleFieldChange('diagramStatus', e.target.value)}
                disabled={availableStatuses.length <= 1}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed ${statusStyle.bg} ${statusStyle.text}`}
              >
                {availableStatuses.map((st) => (
                  <option key={st} value={st} className="bg-white dark:bg-steel-900 text-slate-900 dark:text-white">
                    {t(STATUS_MAP[st]?.labelKey || st)}
                  </option>
                ))}
              </select>
            </div>

            {/* Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-500 dark:text-steel-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-steel-800 rounded-lg transition-colors cursor-pointer"
              title={isExpanded ? t('common.collapse', 'Contraer') : t('common.expand', 'Expandir')}
            >
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={18} />
              </motion.div>
            </button>
          </div>
        </div>
      </div>



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
            {/* 4 Metadata Matrix Cards with Clean Inline Inputs */}
            <div className="p-3 bg-slate-50/50 dark:bg-steel-950/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Card 1: Item / Descripción & Cliente */}
                <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs group focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/40 transition-all">
                  <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                    <Building2 size={13} className="text-blue-600 dark:text-blue-400" />
                    {t('pfmea.corporate.itemDescription', 'Item / Descripción & Cliente')}
                  </span>
                  <input
                    type="text"
                    value={header.partName || ''}
                    onChange={(e) => handleFieldChange('partName', e.target.value)}
                    placeholder={t('pfmea.corporate.placeholders.projectDesc', 'Descripción / Proyecto')}
                    className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-steel-700/60 focus:border-blue-500 focus:outline-none pb-1 mb-1.5 placeholder:text-slate-400"
                  />
                  <input
                    type="text"
                    value={header.customer || ''}
                    readOnly
                    disabled
                    placeholder={t('pfmea.corporate.placeholders.customer', 'Cliente')}
                    className="text-[11px] text-slate-600 dark:text-steel-300 bg-transparent border-none focus:outline-none cursor-not-allowed opacity-75 placeholder:text-slate-400"
                  />
                </div>

                {/* Card 2: Part Numbers & Plant Region */}
                <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs group focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all">
                  <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                    <FileText size={13} className="text-indigo-600 dark:text-indigo-400" />
                    {t('pfmea.header.partNumberPlant', 'No. Parte & Planta')}
                  </span>
                  <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5">
                    <input
                      type="text"
                      value={header.partNumber || 'N/A'}
                      readOnly
                      disabled
                      placeholder={t('pfmea.corporate.placeholders.partNumber', 'No. Parte')}
                      className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none w-full cursor-not-allowed opacity-75 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-steel-300">
                    <span className="truncate">{header.plantName || 'Puebla Plant'}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-steel-800 text-slate-700 dark:text-steel-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-steel-700">
                      {header.plantCode || 'PUEBLA'}
                    </span>
                  </div>
                </div>

                {/* Card 3: Dates & Revision */}
                <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs group focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/40 transition-all">
                  <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                    <Calendar size={13} className="text-amber-600 dark:text-amber-400" />
                    {t('pfmea.corporate.datesDoc', 'Fechas (Creación / Rev) & Rev #')}
                  </span>
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5">
                    <input
                      type="date"
                      readOnly
                      disabled
                      value={header.creationDate || (header.lastModified ? header.lastModified.split('T')[0] : new Date().toISOString().split('T')[0])}
                      title={t('pfmea.corporate.origLaunchDate', 'Fecha Creación')}
                      className="text-[11px] font-semibold text-slate-800 dark:text-steel-200 bg-transparent border-none focus:outline-none w-1/2 cursor-not-allowed opacity-60 [&::-webkit-calendar-picker-indicator]:opacity-40"
                    />
                    <span className="text-slate-400 dark:text-steel-600 font-bold">/</span>
                    <input
                      type="date"
                      value={header.revisionDate || (header.lastModified ? header.lastModified.split('T')[0] : new Date().toISOString().split('T')[0])}
                      onChange={(e) => handleFieldChange('revisionDate', e.target.value)}
                      title={t('pfmea.corporate.revDate', 'Fecha Revisión')}
                      className="text-[11px] font-semibold text-slate-800 dark:text-steel-200 bg-transparent border-none focus:outline-none w-1/2 [&::-webkit-calendar-picker-indicator]:opacity-60 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-steel-400 uppercase">{t('pfmea.corporate.revision', 'Revisión:')}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-steel-100 bg-slate-100 dark:bg-steel-800 px-2 py-0.5 rounded border border-slate-200 dark:border-steel-700">
                      Rev. {header.revision || '1'}
                    </span>
                  </div>
                </div>

                {/* Card 4: Code, Confidentiality & Symbol Config */}
                <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs group focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
                  <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                    <Globe2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                    {t('pfmea.header.docCodeConf', 'Código Portada & Confidencialidad')}
                  </span>
                  <div className="flex items-center justify-between gap-1 border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5">
                    <input
                      type="text"
                      value={header.projectId || ''}
                      onChange={(e) => handleFieldChange('projectId', e.target.value)}
                      placeholder={t('pfmea.header.coverCode', 'Código Portada')}
                      className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none truncate w-full placeholder:text-slate-400"
                    />
                    <select
                      value={header.confidentialityLevel || 'Public'}
                      onChange={(e) => handleFieldChange('confidentialityLevel', e.target.value)}
                      className="text-[10px] font-bold text-slate-700 dark:text-steel-300 bg-slate-100 dark:bg-steel-800 rounded px-1.5 py-0.5 border border-slate-200 dark:border-steel-700 focus:outline-none cursor-pointer"
                    >
                      <option value="Public">Public</option>
                      <option value="Internal">Internal</option>
                      <option value="Confidential">Confidential</option>
                      <option value="Strictly Confidential">Restricted</option>
                    </select>
                  </div>
                  {/* Process Symbols Quick Ribbon */}
                  <div className="flex items-center justify-around gap-1 text-[9px] text-slate-500 dark:text-steel-400">
                    <div className="flex items-center gap-1" title={t('symbols.operation', 'Operación')}>
                      <ProcessSymbol symbolType="operation" size={10} className="text-forge-600 dark:text-forge-400" />
                      <span className="font-semibold">OP</span>
                    </div>
                    <div className="flex items-center gap-1" title={t('symbols.inspection', 'Inspección')}>
                      <ProcessSymbol symbolType="inspection" size={10} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold">INS</span>
                    </div>
                    <div className="flex items-center gap-1" title={t('symbols.transport', 'Transporte')}>
                      <ProcessSymbol symbolType="transport" size={10} className="text-sky-600 dark:text-sky-400" />
                      <span className="font-semibold">TRA</span>
                    </div>
                    <div className="flex items-center gap-1" title={t('symbols.auto_control', 'Autocontrol')}>
                      <ProcessSymbol symbolType="auto_control" size={10} className="text-teal-600 dark:text-teal-400" />
                      <span className="font-semibold">AUTO</span>
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
