import { useAuth } from '../../hooks/useAuth';
import { useDocumentView } from '../../hooks/useDocumentView';
import { loadCatalog } from '../../utils/loadCatalog';
import { getErrorMessage } from '../../utils/errors';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalCardVariants } from '../../utils/motion';
import { Plus, AlertCircle, X, Loader2, Users, FileSignature, GitBranch } from 'lucide-react';
import { pfmeaService, type PfmeaHeader } from '../../api/pfmeaService';
import { getDocumentHeaders, type FlowchartRead } from '../../services/flowchartService';
import { PFMEAProjectCard } from '../../components/pfmea/PFMEAProjectCard';
import { PFMEAProjectTable } from '../../components/pfmea/PFMEAProjectTable';
import { PfmeaArchiveConfirmModal } from '../../components/pfmea/PfmeaArchiveConfirmModal';
import { DataLayout } from '../../components/layout/DataLayout';
import { Pagination } from '../../components/ui/Pagination';
import { FilterBar } from '../../components/ui/FilterBar';
import { MultiSelectFilter } from '../../components/ui/MultiSelectFilter';
import { SortDropdown } from '../../components/ui/SortDropdown';
import { FlowchartSelect } from '../../components/flowchart/FlowchartSelect';
import { toast } from 'sonner';

// ─── Status badge styles ─────────────────────────────────────






// ═════════════════════════════════════════════════════════════
//  PFMEADashboard
// ═════════════════════════════════════════════════════════════

export const PFMEADashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = ["Administrator","PFMEA Owner"].includes(user?.role_name || '');
  const canArchive = ['Administrator', 'PFMEA Owner'].includes(user?.role_name || '');

  // ─── State ─────────────────────────────────────────────────
  const [pfmeas, setPfmeas] = useState<PfmeaHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [search, rawSetSearch] = useState('');
  const setSearch = (value: Parameters<typeof rawSetSearch>[0]) => { rawSetSearch(value); setCurrentPage(1); };
  const [selectedStatuses, rawSetSelectedStatuses] = useState<string[]>([]);
  const setSelectedStatuses = (value: Parameters<typeof rawSetSelectedStatuses>[0]) => { rawSetSelectedStatuses(value); setCurrentPage(1); };
  const [selectedCustomers, rawSetSelectedCustomers] = useState<string[]>([]);
  const setSelectedCustomers = (value: Parameters<typeof rawSetSelectedCustomers>[0]) => { rawSetSelectedCustomers(value); setCurrentPage(1); };
  const [sortOrder, rawSetSortOrder] = useState<string>('date-desc');
  const setSortOrder = (value: Parameters<typeof rawSetSortOrder>[0]) => { rawSetSortOrder(value); setCurrentPage(1); };
  const [viewMode, setViewMode] = useDocumentView();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Reset pagination on filter change


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flowcharts, setFlowcharts] = useState<FlowchartRead[]>([]);
  const [loadingFlowcharts, setLoadingFlowcharts] = useState(false);

  // Form fields
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedFlowchartId, setSelectedFlowchartId] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // ─── Archive State ─────────────────────────────────────────
  const [archiveTargetId, setArchiveTargetId] = useState<number | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // ─── Fetch data from backend ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await loadCatalog((skip, limit) => pfmeaService.listAnalyses({ skip, limit }), () => cancelled);
        if (!cancelled) {
          setPfmeas(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch PFMEAs:', err);
          setError(t('pfmea.dashboard.errors.loadFailed'));
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [t, loadAttempt]);

  // ─── Fetch flowcharts when modal opens ──────────────────────
  useEffect(() => {
    if (isModalOpen) {

      getDocumentHeaders()
        .then((fcData) => {
          const approvedFcData = fcData.filter(fc => fc.status?.toLowerCase() === 'approved');
          setFlowcharts(approvedFcData);
          if (approvedFcData.length > 0) {
            setSelectedFlowchartId(String(approvedFcData[0].id));
          }
          setLoadingFlowcharts(false);
        })
        .catch((err) => {
          console.error('Error fetching modal data:', err);
          toast.error(t('pfmea.dashboard.errors.loadFlowchartsFailed'));
          setLoadingFlowcharts(false);
        });
    }
  }, [isModalOpen,t]);

  // Extract unique options for filters
  const filterOptions = useMemo(() => {
    const statuses = new Set<string>();
    const customers = new Set<string>();

    pfmeas.forEach(fc => {
      const status = fc.moc_status || fc.status;
      if (status) statuses.add(status);
      if (fc.customer) customers.add(fc.customer);
    });

    return {
      statuses: Array.from(statuses).map(s => ({ value: s, label: t(`status.${s.toLowerCase()}`, s) })),
      customers: Array.from(customers).map(c => ({ value: c, label: c }))
    };
  }, [pfmeas, t]);

  // ─── Filters & Sort ───────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    const filtered = pfmeas.filter((fc) => {
      const matchesSearch =
        fc.project_name.toLowerCase().includes(search.toLowerCase()) ||
        String(fc.id).includes(search) ||
        (fc.part_number && fc.part_number.toLowerCase().includes(search.toLowerCase())) ||
        (fc.customer || '').toLowerCase().includes(search.toLowerCase());

      const currentStatus = fc.moc_status || fc.status || '';
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(currentStatus);
      const matchesCustomer = selectedCustomers.length === 0 || selectedCustomers.includes(fc.customer);

      const isArchived = currentStatus.toLowerCase() === 'archived';

      const matchesArchived = showArchived || !isArchived;

      return matchesSearch && matchesStatus && matchesCustomer && matchesArchived;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title-asc':
          return a.project_name.localeCompare(b.project_name);
        case 'title-desc':
          return b.project_name.localeCompare(a.project_name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [pfmeas, search, selectedStatuses, selectedCustomers, sortOrder, showArchived]);

  const safeCurrentPage = Math.min(currentPage, Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage)));

  const paginatedProjects = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, safeCurrentPage, itemsPerPage]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setModalError(t('pfmea.dashboard.errors.projectNameRequired'));
      return;
    }
    if (!selectedFlowchartId) {
      setModalError(t('pfmea.dashboard.errors.flowchartRequired'));
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const selectedFlowchart = flowcharts.find(fc => fc.id === Number(selectedFlowchartId));
      const customerName = selectedFlowchart?.product?.customer_name || t('pfmea.dashboard.noCustomer');

      // Create PFMEA
      const newPfmea = await pfmeaService.createAnalysis({
        flowchart_id: Number(selectedFlowchartId),
        project_name: projectTitle.trim(),
        customer: customerName,
        part_number: selectedFlowchart?.product?.part_number || undefined,
        product_description: selectedFlowchart?.product?.description || undefined,
      });

      toast.success(t('pfmea.dashboard.success.created'));
      setIsModalOpen(false);

      // Reset fields
      setProjectTitle('');
      setSelectedFlowchartId('');

      // Redirect to Editor
      navigate(`/pfmea/${newPfmea.id}`);
    } catch (err: unknown) {
      console.error('Error creating PFMEA:', err);
      const detail = getErrorMessage(err) || t('pfmea.dashboard.errors.createFailed');
      setModalError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id: number) => navigate(`/pfmea/${id}`);

  // ─── Archive Handlers ──────────────────────────────────────
  const handleArchiveClick = (id: number) => {
    setArchiveTargetId(id);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!archiveTargetId) return;
    const updated = await pfmeaService.transitionStatus(archiveTargetId, 'Archived');
    // Optimistic update
    setPfmeas(prev =>
      prev.map(fc => fc.id === archiveTargetId ? updated : fc)
    );
    setIsArchiveModalOpen(false);
    setArchiveTargetId(null);
    toast.success(t('archive.success.archived', 'Documento archivado con éxito.'));
  };

  const actionButton = (
    <button
      onClick={() => {
        setModalError(null);
        setIsModalOpen(true);
      }}
      className="workspace-create"
    >
      <Plus size={16} /> {t('pfmea.dashboard.newButton')}
    </button>
  );

  const hasActiveFilters = showArchived || search.trim().length > 0 || selectedStatuses.length > 0 || selectedCustomers.length > 0 || sortOrder !== 'date-desc';
  const handleResetFilters = () => {
    setShowArchived(false);
    setSelectedStatuses([]);
    setSelectedCustomers([]);
    setSortOrder('date-desc');
    setSearch('');
  };

  const filterSelect = (
    <FilterBar onReset={handleResetFilters} hasActiveFilters={hasActiveFilters}>
      <MultiSelectFilter
        label={t('common.customer', 'Cliente')}
        icon={Users}
        options={filterOptions.customers}
        selectedValues={selectedCustomers}
        onChange={setSelectedCustomers}
      />
      <MultiSelectFilter
        label={t('common.status', 'Estado')}
        options={filterOptions.statuses}
        selectedValues={selectedStatuses}
        onChange={values => { setSelectedStatuses(values); if (values.some(value => value.toLowerCase() === 'archived')) setShowArchived(true); }}
      />
      <label className="workspace-archive"><input type="checkbox" checked={showArchived}
        onChange={event => { setShowArchived(event.target.checked); setCurrentPage(1); }} />{t('workspace:includeArchived')}</label>
      <SortDropdown
        options={[
          { value: 'date-desc', label: t('sort.newest', 'Más recientes') },
          { value: 'date-asc', label: t('sort.oldest', 'Más antiguos') },
          { value: 'title-asc', label: t('sort.aToZ', 'Nombre (A-Z)') },
          { value: 'title-desc', label: t('sort.zToA', 'Nombre (Z-A)') },
        ]}
        value={sortOrder}
        onChange={setSortOrder}
      />
    </FilterBar>
  );

  return (
    <>
      {/* Archive Confirm Modal */}
      <AnimatePresence>
        {isArchiveModalOpen && archiveTargetId !== null && (() => {
          const fc = pfmeas.find(f => f.id === archiveTargetId);
          return fc ? (
            <PfmeaArchiveConfirmModal
              pfmea={fc}
              onConfirm={handleConfirmArchive}
              onCancel={() => { setIsArchiveModalOpen(false); setArchiveTargetId(null); }}
            />
          ) : null;
        })()}
      </AnimatePresence>

      <DataLayout
        resultCount={filteredProjects.length}
        error={error}
        onRetry={() => setLoadAttempt(value => value + 1)}
        hasActiveFilters={hasActiveFilters}
        onReset={handleResetFilters}
        title={t('pfmea.dashboard.title')}
        subtitle={t('pfmea.dashboard.subtitle')}
        isLoading={loading}
        actionButton={canCreate ? actionButton : undefined}
        searchValue={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEmpty={filteredProjects.length === 0}
        extraFilters={filterSelect}
        gridContent={
          <>
            <div className="workspace-grid">
              {paginatedProjects.map(project => (
                <PFMEAProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onArchive={canArchive ? handleArchiveClick : undefined}
                />
              ))}
            </div>
          </>
        }
        tableContent={
          <div className="workspace-table-content">
            <PFMEAProjectTable
              pfmeas={paginatedProjects}
              onEdit={handleEdit}
              onArchive={canArchive ? handleArchiveClick : undefined}
            />
          </div>
        }
        pagination={
          <Pagination
            currentPage={safeCurrentPage}
            totalItems={filteredProjects.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        }
      />

      {/* ─── Create Project Modal ───────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-steel-950/80 backdrop-blur-sm"
          >
            <motion.div
              variants={modalCardVariants}
              className="bg-steel-900 border border-steel-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <FileSignature size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t('pfmea.dashboard.modal.title')}</h3>
                    <p className="text-xs text-steel-400">{t('pfmea.dashboard.modal.subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-steel-400 hover:bg-steel-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateProject} className="flex-1 overflow-y-auto p-6 space-y-5">
                {modalError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 animate-shake">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Project Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block">
                    {t('pfmea.dashboard.modal.projectName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('pfmea.dashboard.modal.projectPlaceholder')}
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>

                {/* Flowchart Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block flex items-center gap-1">
                    <GitBranch size={12} /> {t('pfmea.dashboard.modal.flowchartBase')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {loadingFlowcharts ? (
                      <div className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm text-steel-500 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-indigo-400" />
                        {t('pfmea.dashboard.modal.loadingFlowcharts')}
                      </div>
                    ) : flowcharts.length > 0 ? (
                      <FlowchartSelect
                        flowcharts={flowcharts}
                        value={selectedFlowchartId}
                        onChange={setSelectedFlowchartId}
                      />
                    ) : (
                      <div className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm text-steel-500">
                        {t('pfmea.dashboard.modal.noFlowcharts')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-steel-800/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer"
                  >
                    {t('pfmea.dashboard.modal.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || flowcharts.length === 0}
                    className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {t('pfmea.dashboard.modal.createProject')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
