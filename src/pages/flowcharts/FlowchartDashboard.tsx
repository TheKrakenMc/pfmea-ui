import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Search, FileEdit, Copy, Archive, FileText, ChevronDown, AlertCircle } from 'lucide-react';
import { getDocumentHeaders, type FlowchartRead } from '../../services/flowchartService';

// ─── Status badge styles ─────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  archived: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.draft;
}

// ─── Skeleton Loader ─────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4"><div className="h-4 w-12 bg-steel-700 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-40 bg-steel-700 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-16 bg-steel-700 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-14 bg-steel-700 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-28 bg-steel-700 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-24 bg-steel-700 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-20 bg-steel-700 rounded" /></td>
        </tr>
      ))}
    </>
  );
}

// ─── Date Formatter ──────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ═════════════════════════════════════════════════════════════
//  FlowchartDashboard
// ═════════════════════════════════════════════════════════════

export const FlowchartDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ─── State ─────────────────────────────────────────────────
  const [flowcharts, setFlowcharts] = useState<FlowchartRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // ─── Fetch data from backend ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDocumentHeaders();
        if (!cancelled) {
          setFlowcharts(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch flowcharts:', err);
          setError('No se pudieron cargar los diagramas de flujo. Verifica tu conexión.');
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ─── Filters ───────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    return flowcharts.filter((fc) => {
      const matchesSearch =
        fc.title.toLowerCase().includes(search.toLowerCase()) ||
        String(fc.id).includes(search);
      const matchesStatus =
        selectedStatus === 'all' || fc.status.toLowerCase() === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [flowcharts, search, selectedStatus]);

  const handleEdit = (id: number) => navigate(`/flowcharts/${id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-400" />
            {t('dashboard.title')}
          </h1>
          <p className="text-steel-400 text-sm mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20">
          <Plus className="w-5 h-5" />
          {t('dashboard.actions.create')}
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-steel-900/50 border border-steel-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400" />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-steel-950 border border-steel-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-steel-950 border border-steel-700 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all min-w-[150px]"
            >
              <option value="all">{t('dashboard.filters.allStatuses')}</option>
              <option value="draft">{t('status.draft')}</option>
              <option value="approved">{t('status.approved')}</option>
              <option value="archived">{t('status.archived', 'Archived')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
          >
            Reintentar
          </button>
        </motion.div>
      )}

      {/* Data Table */}
      <div className="bg-steel-900 border border-steel-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-steel-950/50 text-steel-400 text-xs uppercase tracking-wider border-b border-steel-800">
                <th className="px-6 py-4 font-semibold">{t('dashboard.table.id')}</th>
                <th className="px-6 py-4 font-semibold">{t('dashboard.table.description', 'Título')}</th>
                <th className="px-6 py-4 font-semibold">{t('dashboard.table.status')}</th>
                <th className="px-6 py-4 font-semibold">{t('dashboard.table.version')}</th>
                <th className="px-6 py-4 font-semibold">{t('dashboard.table.createdAt', 'Creado')}</th>
                <th className="px-6 py-4 font-semibold">{t('dashboard.table.updatedAt', 'Modificado')}</th>
                <th className="px-6 py-4 font-semibold text-center">{t('dashboard.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-800/50 text-sm">
              {loading ? (
                <TableSkeleton />
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((fc) => (
                  <tr
                    key={fc.id}
                    className="hover:bg-steel-800/50 transition-colors group cursor-pointer"
                    onClick={() => handleEdit(fc.id)}
                  >
                    <td className="px-6 py-4 text-white font-mono font-medium whitespace-nowrap">
                      #{fc.id}
                    </td>
                    <td className="px-6 py-4 text-steel-200 font-medium">
                      {fc.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(fc.status)}`}>
                        {t(`status.${fc.status.toLowerCase()}`, fc.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-steel-400 font-mono text-xs">
                      v{fc.version}
                    </td>
                    <td className="px-6 py-4 text-steel-400 text-xs whitespace-nowrap">
                      {formatDate(fc.created_at)}
                    </td>
                    <td className="px-6 py-4 text-steel-400 text-xs whitespace-nowrap">
                      {formatDate(fc.updated_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(fc.id); }}
                          className="p-1.5 text-slate-500 hover:text-indigo-400 bg-white dark:bg-steel-950 hover:bg-gray-100 dark:hover:bg-steel-800 rounded-md transition-colors"
                          title={t('dashboard.actions.edit')}
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-500 hover:text-amber-400 bg-white dark:bg-steel-950 hover:bg-gray-100 dark:hover:bg-steel-800 rounded-md transition-colors"
                          title={t('dashboard.actions.duplicate')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-500 hover:text-red-400 bg-white dark:bg-steel-950 hover:bg-gray-100 dark:hover:bg-steel-800 rounded-md transition-colors"
                          title={t('dashboard.actions.archive')}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-steel-500">
                    {t('dashboard.table.emptyState')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
