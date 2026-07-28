import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteTechnology } from '../../hooks/useTechnology';
import { Zap, Edit, Trash2, Search, ChevronDown, ChevronRight, BarChart2, ShieldAlert, Cpu, Settings2 } from 'lucide-react';
import TechnologyForm from './TechnologyForm';
import DeleteConfirmation from './DeleteConfirmation';
import type { Technology } from '../../types/technology.types';
import { formatDate } from '../../utils/dateUtils';

const CATEGORIES = ['Inyección', 'Ensamble', 'Torque', 'Soldadura', 'Estampado', 'Pintura', 'Corte', 'Tratamiento Térmico'];

interface TechnologyTableProps {
  technologies: Technology[];
  onEdit: (tech: Technology) => void;
  onDelete: (tech: Technology) => void;
  onManageParams: (id: number) => void;
}

const TechnologyTable: React.FC<TechnologyTableProps> = ({ technologies, onEdit, onDelete, onManageParams }) => {
  const { t } = useTranslation();
  const [expandedTechIds, setExpandedTechIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedTechIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // KPIs
  const totalCC = useMemo(() => {
    return technologies.reduce((count, tech) => {
      return count + (tech.parameters?.filter((p) => p.is_critical).length ?? 0);
    }, 0);
  }, [technologies]);

  const activeCategoriesCount = useMemo(() => {
    const cats = new Set(technologies.map((t) => t.category).filter(Boolean));
    return cats.size;
  }, [technologies]);

  return (
    <div className="space-y-6">
      {/* ── KPI Widgets ──────────────────────────────────────────── */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border border-steel-700/60 bg-steel-900/10 flex items-center justify-between shadow-md hover:scale-[1.01] hover:border-forge-500/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-steel-400 font-medium uppercase tracking-wider">
              {t('technologies.table.statsTotalTechs')}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-steel-100">{technologies.length}</span>
              <span className="text-[10px] text-steel-400 font-normal">
                {t('technologies.table.statsSubTotal')}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-forge-500/10 text-forge-400">
            <Cpu size={20} />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-steel-700/60 bg-steel-900/10 flex items-center justify-between shadow-md hover:scale-[1.01] hover:border-amber-500/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-steel-400 font-medium uppercase tracking-wider">
              {t('technologies.table.statsCriticalParams')}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-amber-500">{totalCC}</span>
              <span className="text-[10px] text-steel-400 font-normal">
                {t('technologies.table.statsSubCritical')}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 animate-pulse">
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-steel-700/60 bg-steel-900/10 flex items-center justify-between shadow-md hover:scale-[1.01] hover:border-review-500/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-steel-400 font-medium uppercase tracking-wider">
              {t('technologies.table.statsActiveCategories')}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-review-500">{activeCategoriesCount}</span>
              <span className="text-[10px] text-steel-400 font-normal">
                {t('technologies.table.statsSubCategories')}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-review-500/10 text-review-500">
            <BarChart2 size={20} />
          </div>
        </div>
      </div> */}

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm text-steel-300">
          <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
            <tr>
              <th className="w-12 px-6 py-4"></th>
              <th className="px-6 py-4 font-medium">{t('technologies.table.name')}</th>
              <th className="px-6 py-4 font-medium">{t('technologies.table.category')}</th>
              <th className="px-6 py-4 font-medium">{t('technologies.table.parameters')}</th>
              <th className="px-6 py-4 font-medium">{t('technologies.table.createdBy')}</th>
              <th className="px-6 py-4 font-medium">{t('technologies.table.updatedAt')}</th>
              <th className="px-6 py-4 font-medium text-right w-24">{t('technologies.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-800">
            {technologies.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-steel-400 italic">
                  {t('technologies.table.empty')}
                </td>
              </tr>
            )}
            {technologies.map((tech) => (
              <React.Fragment key={tech.id}>
                <tr
                  className="hover:bg-steel-800/30 transition-colors cursor-pointer group"
                  onClick={() => toggleExpand(tech.id)}
                >
                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleExpand(tech.id)}
                      className="p-1 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                      title={t('technologies.table.expandTooltip')}
                    >
                      {expandedTechIds[tech.id] ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-steel-200 group-hover:text-forge-400 transition-colors">
                    {tech.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-steel-800/50 border border-steel-700 text-xs font-mono text-steel-300">
                      {tech.category || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-steel-300 text-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-steel-800/50 border border-steel-700 text-xs font-mono text-steel-300">
                      {tech.parameters?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-steel-400">{tech.created_by ?? '—'}</td>
                  <td className="px-6 py-4 text-steel-400 text-xs whitespace-nowrap">
                    {formatDate(tech.updated_at)}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors focus-ring"
                        onClick={() => onEdit(tech)}
                        aria-label={`${t('technologies.form.editTitle')}: ${tech.name}`}
                        title={t('technologies.actions.edit', 'Edit')}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1.5 text-steel-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors focus-ring"
                        onClick={() => onDelete(tech)}
                        aria-label={`${t('technologies.deleteModal.title')}: ${tech.name}`}
                        title={t('technologies.actions.delete', 'Delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Sub-fila expandible con suave revelación */}
                {expandedTechIds[tech.id] && (
                  <tr className="bg-steel-900/25">
                    <td colSpan={7} className="p-4 pl-12 bg-steel-950/20">
                      <div className="space-y-4 animate-fadeIn">
                        {/* Descripción de la Tecnología */}
                        {tech.description ? (
                          <div className="text-sm text-steel-300 bg-steel-900/40 p-4 rounded-xl border border-steel-800/50 max-w-3xl leading-relaxed shadow-sm">
                            <span className="font-semibold block text-[10px] text-steel-400 uppercase tracking-wider mb-2">
                              {t('technologies.form.description')}
                            </span>
                            {tech.description}
                          </div>
                        ) : (
                          <p className="text-xs text-steel-500 italic px-2">Sin descripción definida.</p>
                        )}

                        {/* Parámetros de Proceso Relacionados */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <h4 className="text-[10px] font-bold text-steel-400 uppercase tracking-wider">
                              {t('technologies.form.parameters')}
                            </h4>
                            <button
                              onClick={() => onManageParams(tech.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors text-[10px] font-semibold uppercase tracking-wider"
                              title={t('technologies.parameters.manageTooltip', 'Gestionar Parámetros Maestros')}
                            >
                              <Settings2 size={12} />
                              {t('technologies.parameters.manage', 'Gestionar Parámetros Maestros')}
                            </button>
                          </div>

                          {!tech.parameters || tech.parameters.length === 0 ? (
                            <p className="text-xs text-steel-500 italic pl-2">
                              {t('technologies.form.noParameters')}
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
                              {tech.parameters.map((param) => {
                                const hasRange = param.min_value !== null && param.max_value !== null;
                                let targetPct = 50;
                                if (hasRange && param.min_value !== undefined && param.max_value !== undefined && param.target_value !== undefined && param.target_value !== null) {
                                  const min = Number(param.min_value);
                                  const max = Number(param.max_value);
                                  const tgt = Number(param.target_value);
                                  if (max > min) {
                                    targetPct = Math.max(5, Math.min(95, ((tgt - min) / (max - min)) * 100));
                                  }
                                }

                                return (
                                  <div
                                    key={param.id}
                                    className="glass-card p-4 rounded-xl border border-steel-800/80 bg-steel-900/40 flex flex-col justify-between space-y-3 hover:border-steel-600/60 hover:scale-[1.01] hover:bg-steel-900/60 transition-all duration-200 shadow-sm"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                        <span className="font-semibold text-steel-100 text-sm tracking-wide">
                                          {param.name}
                                        </span>
                                        {param.measurement_unit?.symbology && (
                                          <span className="inline-block text-[10px] text-forge-400 font-semibold font-mono ml-2 bg-forge-500/10 px-1.5 py-0.5 rounded border border-forge-500/20">
                                            {param.measurement_unit.symbology}
                                          </span>
                                        )}
                                      </div>
                                      {param.is_critical && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse tracking-wider">
                                          CC
                                        </span>
                                      )}
                                    </div>

                                    {/* Rangos e Indicadores */}
                                    <div className="space-y-2 pt-1.5">
                                      <div className="flex justify-between text-[10px] text-steel-400 font-mono">
                                        <span>{param.min_value !== null ? `Mín: ${param.min_value}` : '—'}</span>
                                        <span className="text-steel-200 font-medium">
                                          {param.target_value !== null ? `Obj: ${param.target_value}` : '—'}
                                        </span>
                                        <span>{param.max_value !== null ? `Máx: ${param.max_value}` : '—'}</span>
                                      </div>

                                      {/* Barra de escala de ingeniería */}
                                      {hasRange ? (
                                        <div className="relative w-full h-2 bg-steel-800 rounded-full border border-steel-700/30">
                                          {/* Rango de Tolerancia */}
                                          <div className="absolute top-0 bottom-0 left-0 right-0 bg-forge-500/15 rounded-full"></div>
                                          {/* Indicador de Valor Objetivo */}
                                          <div
                                            className="absolute -top-1 w-3.5 h-3.5 rounded-full bg-forge-400 border border-steel-900 shadow-md transform -translate-x-1/2 cursor-default transition-all hover:scale-110"
                                            style={{ left: `${targetPct}%` }}
                                            title={`Objetivo: ${param.target_value} ${param.measurement_unit?.symbology || ''}`}
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-full h-1 bg-steel-800/40 rounded-full" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechnologyTable;
