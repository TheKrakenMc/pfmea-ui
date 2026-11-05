import {getMeasurementUnits} from '../../services/measurementUnits';
import {userService} from '../../api/userService';
import {TraceabilityMatrix} from '../../components/control-plan/TraceabilityMatrix';
import {listPlants} from '../../services/plantService';
import {isAxiosError} from 'axios';
import { ControlPlanGrid } from '../../components/control-plan/ControlPlanGrid';
import {useAuth} from '../../hooks/useAuth';
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pfmeaService } from '../../api/pfmeaService';
import { controlPlanService, controlPlanPhaseLabels, type ControlPlanPhase } from '../../api/controlPlanService';
import { DataLayout } from '../../components/layout/DataLayout';
import { ControlPlanCard } from '../../components/control-plan/ControlPlanCard';
import { ControlPlanTable } from '../../components/control-plan/ControlPlanTable';
import { Pagination } from '../../components/ui/Pagination';
import { FilterBar } from '../../components/ui/FilterBar';
import { MultiSelectFilter } from '../../components/ui/MultiSelectFilter';
import { SortDropdown } from '../../components/ui/SortDropdown';
import { toast } from 'sonner';
import { Plus, Settings, Users, ShieldCheck, ArrowLeft, X, AlertCircle, FileSignature, Loader2, ShieldAlert, GitBranch, Layers, Building2, FileText, Calendar, Download, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/dateUtils';

export const ControlPlanPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const {data:plants=[]}=useQuery({queryKey:['plants','authorized'],queryFn:listPlants});
  const activePlant=plants.find(plant=>plant.id===user?.plant_id);
  const [exporting,setExporting]=useState(false);
  const [selectedPfmeaId, setSelectedPfmeaId] = useState<number | null>(null);
  const [selectedControlPlanId, setSelectedControlPlanId] = useState<number | null>(null);
  const [dirtyControlIds, setDirtyControlIds] = useState<Set<number>>(() => new Set());
  const hasDirtyControls = dirtyControlIds.size > 0;
  const handleDirtyChange = (id: number, dirty: boolean) => setDirtyControlIds(previous => {
    const next = new Set(previous);
    if (dirty) next.add(id); else next.delete(id);
    return next;
  });
  const discardPendingChanges = () => {
    if (hasDirtyControls && !window.confirm('Hay controles sin guardar. ¿Descartar los cambios y cambiar de vista?')) return false;
    setDirtyControlIds(new Set());
    return true;
  };
  useEffect(() => {
    if (!hasDirtyControls) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasDirtyControls]);

  // Layout states
  const [search, rawSetSearch] = useState('');
  const setSearch = (value: Parameters<typeof rawSetSearch>[0]) => { rawSetSearch(value); setCurrentPage(1); };
  const [selectedStatuses, rawSetSelectedStatuses] = useState<string[]>([]);
  const setSelectedStatuses = (value: Parameters<typeof rawSetSelectedStatuses>[0]) => { rawSetSelectedStatuses(value); setCurrentPage(1); };
  const [selectedCustomers, rawSetSelectedCustomers] = useState<string[]>([]);
  const setSelectedCustomers = (value: Parameters<typeof rawSetSelectedCustomers>[0]) => { rawSetSelectedCustomers(value); setCurrentPage(1); };
  const [sortOrder, rawSetSortOrder] = useState<string>('date-desc');
  const setSortOrder = (value: Parameters<typeof rawSetSortOrder>[0]) => { rawSetSortOrder(value); setCurrentPage(1); };
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const handleExportPdf = async () => {
    if (!cpDetail) return;
    setExporting(true);
    try {
      const [{ generateControlPlanPdf }, saved, units, people] = await Promise.all([
        import('../../services/controlPlanPdf'),
        controlPlanService.getById(cpDetail.id),
        getMeasurementUnits(),
        userService.lookup(),
      ]);
      const blob = await generateControlPlanPdf(saved, {
        plant: activePlant?.name || '',
        customer: selectedProject?.customer || '',
        part: selectedProject?.part_number || '',
        responsible: Object.fromEntries(
          people.map((person) => [Number(person.id), person.full_name || person.email || String(person.id)])
        ),
        units: Object.fromEntries(units.map((unit) => [unit.id, unit.symbology])),
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${saved.control_plan_code}_Rev${saved.version}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('PDF exportado exitosamente');
    } catch {
      toast.error('No se pudo exportar el plan guardado');
    } finally {
      setExporting(false);
    }
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSelectedPfmeaId, setModalSelectedPfmeaId] = useState<string>('');
  const [modalPhase, setModalPhase] = useState<ControlPlanPhase>('Production');
  const [modalError, setModalError] = useState<string | null>(null);

  // Reset pagination on filter change


  // Queries
  const { data: analyses, isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['pfmea', 'analyses'],
    queryFn: async () => {
      const items = [];
      let skip = 0;
      while (true) {
        const page = await pfmeaService.listAnalyses({ skip, limit: 200 });
        items.push(...page); skip += page.length;
        if (page.length < 200) return items;
      }
    },
  });

  // Filter only PFMEAs with status "released" or "approved" (to prevent editing live documentation)
  const releasedAnalyses = useMemo(() => {
    if (!analyses) return [];
    return analyses.filter((a) => {
      const status = (a.moc_status || a.status || '').toLowerCase();
      return status === 'approved';
    });
  }, [analyses]);

  const { data: cpDetail, isLoading: isLoadingCP, error:cpError } = useQuery({
    queryKey: ['controlPlan', selectedPfmeaId, selectedControlPlanId],
    queryFn: () => selectedControlPlanId ? controlPlanService.getById(selectedControlPlanId) : controlPlanService.getControlPlanByPfmea(selectedPfmeaId!),
    enabled: !!selectedPfmeaId,
    retry: false,
  });

  const {data: revisions = []} = useQuery({
    queryKey: ['controlPlanRevisions', cpDetail?.id],
    queryFn: () => controlPlanService.revisions(cpDetail!.id),
    enabled: !!cpDetail,
  });

  const {data:sourcePfmea}=useQuery({queryKey:['pfmea',selectedPfmeaId],queryFn:()=>pfmeaService.getAnalysis(selectedPfmeaId!),enabled:!!selectedPfmeaId});

  // Query all Control Plans for list view when no single PFMEA is selected
  const {data:cpPage,isLoading:isLoadingAllCPs,error:listError}=useQuery({queryKey:['controlPlans',currentPage,itemsPerPage,search,selectedStatuses,selectedCustomers,sortOrder],queryFn:()=>controlPlanService.list({skip:(currentPage-1)*itemsPerPage,limit:itemsPerPage,search,status:selectedStatuses.join(','),customers:selectedCustomers.join(','),sort:sortOrder}),enabled:!selectedPfmeaId});
  const allControlPlans=cpPage?.items;

  // Project lookup map
  const projectNameMap = useMemo(() => {
    const map: Record<number, { title: string; customer: string }> = {};
    analyses?.forEach((a) => {
      map[a.id] = { title: a.project_name, customer: a.customer };
    });
    return map;
  }, [analyses]);

  const filterOptions=useMemo(()=>({statuses:['Draft','In Review','Approved','Archived'].map(status=>({value:status,label:status})),customers:[...new Set(analyses?.map(project=>project.customer).filter(Boolean) || [])].map(customer=>({value:customer,label:customer}))}),[analyses]);

  const filteredControlPlans=allControlPlans ?? [];
  const paginatedControlPlans=filteredControlPlans;
  const selectedProject=analyses?.find(p=>p.id===selectedPfmeaId);
  const isAdmin = user?.role_name?.toLowerCase() === 'administrator' || user?.role_name?.toLowerCase() === 'admin';
  const ownProject = isAdmin || (user?.role_name === 'PFMEA Owner' && (selectedProject?.owner_id === Number(user.id) || selectedProject?.team_members?.some(m => m.user_id === Number(user.id) && m.role_in_team === 'PFMEA Owner')));
  const readOnly = (!isAdmin && (!['PFMEA Owner', 'Team Member'].includes(user?.role_name || '') || !!selectedProject?.team_members?.some(m => m.user_id === Number(user?.id) && m.role_in_team === 'Viewer') || (!!cpDetail && ['Approved', 'Archived'].includes(cpDetail.status))));


  // Mutations
  const createCPMutation = useMutation({
    mutationFn: (pfmeaId: number) =>
      controlPlanService.createControlPlan(pfmeaId, {
        title: 'Control Plan - ' + (analyses?.find((a) => a.id === pfmeaId)?.project_name || ''),
        status: 'Draft',
        phase: modalPhase,
      }),
    onSuccess: (newCp) => {
      queryClient.invalidateQueries({ queryKey: ['controlPlan'] });
      queryClient.invalidateQueries({ queryKey: ['controlPlans'] });
      toast.success(t('controlPlan.success.created', 'Plan de Control creado exitosamente'));
      setIsModalOpen(false);
      setModalSelectedPfmeaId('');
      setModalError(null);
      setSelectedPfmeaId(newCp.pfmea_project_id);
      setSelectedControlPlanId(newCp.id);
    },
    onError: () => toast.error(t('controlPlan.errors.createFailed', 'Error al crear el Plan de Control')),
  });

  const syncCPMutation = useMutation({
    mutationFn: (cpId: number) => controlPlanService.syncFromPfmea(cpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controlPlan', selectedPfmeaId] });
      queryClient.invalidateQueries({ queryKey: ['controlPlans'] });
      toast.success(t('controlPlan.success.synced', 'Características críticas sincronizadas'));
    },
    onError: () => toast.error(t('controlPlan.errors.syncFailed', 'Error al sincronizar características críticas')),
  });

  const handleOpenCreateModal = () => {
    setModalError(null);
    if (releasedAnalyses.length > 0) {
      setModalSelectedPfmeaId(String(releasedAnalyses[0].id));
    } else {
      setModalSelectedPfmeaId('');
    }
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSelectedPfmeaId) {
      setModalError(t('controlPlan.errors.pfmeaRequired', 'Debes seleccionar un PFMEA liberado.'));
      return;
    }
    createCPMutation.mutate(Number(modalSelectedPfmeaId));
  };

  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setSelectedCustomers([]);
    setSortOrder('date-desc');
    setSearch('');
  };

  const hasActiveFilters = selectedStatuses.length > 0 || selectedCustomers.length > 0 || sortOrder !== 'date-desc';

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
        onChange={setSelectedStatuses}
      />
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

  const actionButton = ['Administrator','PFMEA Owner','Team Member'].includes(user?.role_name || '') ? (
    <button
      onClick={handleOpenCreateModal}
      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-indigo-900/20 cursor-pointer"
    >
      <Plus size={16} />
      {t('controlPlan.dashboard.newButton', 'Nuevo Plan de Control')}
    </button>
  ) : null;

  if (listError && selectedPfmeaId===null) return <main className="p-8"><p role="alert">No se pudo cargar el listado de planes. Comprueba la conexión y tus permisos.</p><button onClick={()=>queryClient.invalidateQueries({queryKey:['controlPlans']})} className="underline mt-4">Reintentar</button></main>;

  // If a specific PFMEA ID is selected, show detail view
  if (selectedPfmeaId !== null) {
    const isCPNotFound = !isLoadingCP && isAxiosError(cpError) && cpError.response?.status===404;
    const currentPfmea = analyses?.find((a) => a.id === selectedPfmeaId);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-steel-950"
      >
        <div className="flex-1 flex flex-col p-6 pt-4 gap-5">
          {/* Unified Document Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-steel-900/90 border border-slate-200 dark:border-steel-700/60 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-md">
            {/* Left: Document Metadata & Back Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { if (discardPendingChanges()) { setSelectedPfmeaId(null); setSelectedControlPlanId(null); } }}
                className="p-1.5 text-slate-500 dark:text-steel-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-steel-800 rounded-lg transition-colors group cursor-pointer"
                title={t('controlPlan.backToInventory', 'Volver al inventario de Planes de Control')}
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-steel-700/60" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 dark:text-steel-400 uppercase font-semibold tracking-wider leading-none">
                  {t('pfmea.editor.docId', 'DOCUMENT ID')}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-steel-100 leading-tight mt-0.5">
                  {cpDetail?.control_plan_code || `CP-PFMEA-${selectedPfmeaId}`}
                </span>
              </div>

              {currentPfmea && (
                <>
                  <div className="h-5 w-px bg-slate-200 dark:bg-steel-700/60" />
                  <span className="text-xs font-medium text-slate-700 dark:text-steel-300 truncate max-w-[180px] lg:max-w-xs" title={currentPfmea.project_name}>
                    {currentPfmea.project_name} ({currentPfmea.customer})
                  </span>
                </>
              )}
            </div>

            {/* Center: Module Navigation */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-steel-300 mr-1.5 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-emerald-600 dark:text-emerald-400" />
                {t('pfmea.layout.view', 'Vista:')}
              </span>

              {/* Quick Nav: Process Flow */}
              <button
                type="button"
                onClick={() => {
                  if (currentPfmea?.flowchart_id) {
                    window.location.href = `/flowcharts/${currentPfmea.flowchart_id}`;
                  } else {
                    window.location.href = '/flowcharts';
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-steel-800/50 text-sky-800 dark:text-steel-300 hover:bg-sky-100 dark:hover:bg-sky-950/40 hover:text-sky-900 dark:hover:text-sky-300 border border-sky-200 dark:border-steel-700/40 transition-all cursor-pointer"
                title={t('pfmea.layout.processFlowTooltip', 'Ir a Diagrama de Flujo')}
              >
                <GitBranch size={13} className="text-sky-600 dark:text-sky-400" />
                <span>{t('pfmea.layout.processFlow', '[PF] Process Flow')}</span>
              </button>

              {/* Quick Nav: PFMEA Analysis */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/pfmea/${selectedPfmeaId}`;
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-steel-800/80 text-slate-700 dark:text-steel-300 hover:bg-slate-200 dark:hover:bg-steel-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-steel-700/40 transition-all cursor-pointer"
                title={t('pfmea.layout.pfmeaTooltip', 'Ir a Análisis PFMEA')}
              >
                <Layers size={13} className="text-forge-600 dark:text-forge-400" />
                <span>{t('pfmea.layout.pfmea', '[PFMEA] PFMEA Analysis')}</span>
              </button>

              {/* Active Control Plan Button */}
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-md shadow-emerald-600/30 cursor-default"
              >
                <ShieldAlert size={13} className="text-white" />
                <span>{t('pfmea.layout.controlPlan', '[CP] Control Plan')}</span>
              </button>
            </div>

            {/* Right: Actions & Status */}
            <div className="flex items-center gap-2.5">
              {cpDetail && (
                <>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={exporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-steel-850 border border-slate-200 dark:border-steel-700 text-slate-700 dark:text-steel-200 hover:bg-slate-50 dark:hover:bg-steel-800 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                    title={t('controlPlan.exportPdfTooltip', 'Exportar Plan de Control a PDF')}
                  >
                    <Download size={13} className={exporting ? 'animate-bounce text-blue-600' : 'text-blue-600 dark:text-blue-400'} />
                    <span>{exporting ? 'Generando PDF…' : 'Exportar PDF'}</span>
                  </button>

                  <button
                    type="button"
                    style={{display:readOnly?'none':undefined}}
                    onClick={() => syncCPMutation.mutate(cpDetail.id)}
                    disabled={syncCPMutation.isPending || readOnly || hasDirtyControls}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    <RefreshCw size={13} className={syncCPMutation.isPending ? 'animate-spin text-emerald-600' : 'text-emerald-600 dark:text-emerald-400'} />
                    <span>{t('controlPlan.syncButton', 'Sincronizar Críticos')}</span>
                  </button>
                </>
              )}

              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500 text-emerald-950 border-emerald-600 shadow-xs">
                {cpDetail?.status || 'Draft'}
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative pb-28">
            {isLoadingCP && (
              <div className="flex items-center justify-center h-64 text-slate-500 dark:text-steel-400">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <span className="text-xs font-medium">{t('common.loading', 'Cargando Plan de Control...')}</span>
                </div>
              </div>
            )}

            {isCPNotFound && (
              <div className="bg-white dark:bg-steel-950/90 border border-slate-200 dark:border-steel-800 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-lg backdrop-blur-md">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700/50 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
                  {t('controlPlan.noCPTitle', 'No existe un Plan de Control generado')}
                </h3>
                <p className="text-slate-500 dark:text-steel-400 text-xs max-w-md mb-6">
                  {t('controlPlan.noCPDesc', 'Este proyecto PFMEA no tiene un Plan de Control vinculado. Puedes generarlo para mapear y sincronizar las características críticas (H/S≥9).')}
                </p>
                <button
                  onClick={() => createCPMutation.mutate(selectedPfmeaId)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-semibold text-xs shadow-lg shadow-indigo-600/25 cursor-pointer"
                  disabled={createCPMutation.isPending}
                >
                  <Plus size={16} />
                  {t('controlPlan.createNowButton', 'Crear Plan de Control Ahora')}
                </button>
              </div>
            )}

            {cpDetail && (
              <div className="flex flex-col gap-5 animate-fade-in">
                {/* Header Info Master Card */}
                <div className="bg-white dark:bg-steel-950/90 border border-slate-200 dark:border-steel-800 rounded-xl shadow-lg overflow-hidden backdrop-blur-md transition-all">
                  {/* Top Action & Identity Bar */}
                  <div className="bg-slate-50 dark:bg-steel-900/90 border-b border-slate-200 dark:border-steel-800/80 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 px-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-700/60 rounded-lg flex items-center justify-center shadow-xs">
                          <span className="font-extrabold tracking-wider text-blue-700 dark:text-blue-400 text-sm font-sans">
                            Adler Pelzer Group
                          </span>
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
                            {t('controlPlan.header.masterTitle', 'CONTROL PLAN (CP) / PLAN DE CONTROL DE PROCESO')}
                          </h2>
                          <span className="text-[11px] text-slate-500 dark:text-steel-400 font-medium">
                            {t('controlPlan.header.masterSubtitle', 'Control operativo, aprobación documental y trazabilidad')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg shadow-xs text-xs font-bold">
                          <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                          <span>{cpDetail.items?.length || 0} {t('controlPlan.header.criticalCount', 'Características Críticas')}</span>
                        </div>
                        <span className="px-3 py-1.5 rounded-lg border text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60">
                          {cpDetail.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ribbon Highlight */}
                  <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-slate-100/50 dark:from-emerald-950/40 dark:via-indigo-950/30 dark:to-steel-900/40 border-b border-emerald-200/80 dark:border-emerald-800/50 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                        PFMEA → CP
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        {t('controlPlan.header.specification', 'CONTROL PLAN MATRIX SPECIFICATION')}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-steel-300 font-medium">
                        — {t('controlPlan.header.specificationDesc', 'Mapeo y control de características especiales de diseño y proceso.')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-steel-400 font-mono">
                      {cpDetail.control_plan_code} — v{cpDetail.version || '1'}
                    </div>
                  </div>

                  {/* 4 Metadata Matrix Cards */}
                  <div className="p-3 bg-slate-50/50 dark:bg-steel-950/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {/* Card 1: Title & Customer */}
                      <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs">
                        <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                          <Building2 size={13} className="text-blue-600 dark:text-blue-400" />
                          {t('pfmea.corporate.itemDescription', 'Título CP & Cliente')}
                        </span>
                        <input
                          type="text"
                          readOnly
                          value={cpDetail.title}
                          className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5 outline-none truncate"
                        />
                        <span className="text-[11px] text-slate-600 dark:text-steel-300 font-medium truncate">
                          {currentPfmea?.customer || t('common.noCustomer', 'Cliente no especificado')}
                        </span>
                      </div>

                      {/* Card 2: Part Number & Plant */}
                      <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs">
                        <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                          <FileText size={13} className="text-indigo-600 dark:text-indigo-400" />
                          {t('pfmea.header.partNumberPlant', 'No. Parte & Planta')}
                        </span>
                        <input
                          type="text"
                          readOnly
                          value={currentPfmea?.part_number || 'N/A'}
                          className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5 outline-none truncate"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-steel-300">
                          <span>{activePlant?.name || ''}</span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-steel-800 text-slate-700 dark:text-steel-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-steel-700">
                            {activePlant?.code || ''}
                          </span>
                        </div>
                      </div>

                      {/* Card 3: Dates & Standard */}
                      <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs">
                        <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                          <Calendar size={13} className="text-amber-600 dark:text-amber-400" />
                          {t('controlPlan.header.datesStandard', 'Fechas & Estándar')}
                        </span>
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5 text-[11px] font-semibold text-slate-800 dark:text-steel-200">
                          <span>Inicio: {cpDetail.start_date || formatDate(cpDetail.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-steel-400 uppercase">Referencia:</span>
                          <span className="font-semibold text-slate-700 dark:text-steel-300">Reglas internas</span>
                        </div>
                      </div>

                      {/* Card 4: Code & Items Count */}
                      <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs">
                        <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                          <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                          {t('controlPlan.header.codeItems', 'Código CP & Críticos')}
                        </span>
                        <input
                          type="text"
                          readOnly
                          value={cpDetail.control_plan_code}
                          className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5 outline-none truncate"
                        />
                        <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <span>Registradas:</span>
                          <span className="bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 font-mono font-bold">
                            {cpDetail.items?.length || 0} items
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Streamlined Document Management Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-steel-900/90 border border-slate-200 dark:border-steel-800 rounded-xl px-5 py-3 shadow-md">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                      Fase: {cpDetail.phase ? controlPlanPhaseLabels[cpDetail.phase] : 'Producción'}
                    </span>

                    <div className="h-4 w-px bg-slate-200 dark:bg-steel-700" />

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-steel-300">
                      <span>Revisión:</span>
                      <select
                        aria-label="Revisión documental"
                        value={cpDetail.id}
                        onChange={(event) => {
                          if (discardPendingChanges()) setSelectedControlPlanId(Number(event.target.value));
                        }}
                        className="rounded-lg bg-slate-50 dark:bg-steel-950 border border-slate-200 dark:border-steel-700 py-1 px-2.5 text-xs font-mono font-bold text-slate-900 dark:text-steel-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {(revisions.length ? revisions : [cpDetail]).map((revision) => (
                          <option key={revision.id} value={revision.id}>
                            Rev. {revision.version} — {revision.status}
                          </option>
                        ))}
                      </select>
                    </label>

                    {cpDetail.revision_reason && (
                      <span className="text-xs text-slate-500 dark:text-steel-400 italic">
                        ({cpDetail.revision_reason})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {ownProject && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-steel-400">
                          Estado:
                        </span>
                        <select
                          aria-label="Estado del plan de control"
                          disabled={hasDirtyControls}
                          value={cpDetail.status}
                          onChange={async (e) => {
                            try {
                              await controlPlanService.transition(cpDetail.id, e.target.value, cpDetail.lock_version);
                              queryClient.invalidateQueries({ queryKey: ['controlPlan', selectedPfmeaId] });
                              toast.success(`Estado actualizado a ${e.target.value}`);
                            } catch {
                              toast.error('Transición rechazada. Revisa los datos y permisos del plan.');
                            }
                          }}
                          className="rounded-lg bg-slate-50 dark:bg-steel-950 border border-slate-200 dark:border-steel-700 py-1 px-2.5 text-xs font-bold text-slate-900 dark:text-steel-100 cursor-pointer"
                        >
                          <option value="Draft">Draft</option>
                          <option value="In Review">In Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                    )}

                    {ownProject && ['Approved', 'Archived'].includes(cpDetail.status) && (
                      <button
                        type="button"
                        onClick={async () => {
                          const reason = window.prompt('Motivo de la nueva revisión (mínimo 5 caracteres):');
                          if (!reason) return;
                          try {
                            const nextRevision = await controlPlanService.reopen(cpDetail.id, reason, cpDetail.lock_version);
                            setSelectedControlPlanId(nextRevision.id);
                            queryClient.invalidateQueries({ queryKey: ['controlPlanRevisions'] });
                            queryClient.invalidateQueries({ queryKey: ['controlPlans'] });
                            queryClient.invalidateQueries({ queryKey: ['controlPlan', selectedPfmeaId] });
                            toast.success('Nueva revisión creada');
                          } catch {
                            toast.error('No se pudo reabrir el plan');
                          }
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                      >
                        Crear revisión editable
                      </button>
                    )}
                  </div>
                </div>

                {cpDetail.needs_review && (
                  <div role="status" className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>La fuente PFMEA cambió; el plan conserva su historial pero requiere revisión de origen en los controles señalados.</span>
                  </div>
                )}

                {/* Hero Editable Grid */}
                <ControlPlanGrid
                  plan={cpDetail}
                  rows={sourcePfmea?.worksheet_rows || []}
                  readOnly={readOnly}
                  canReview={!!ownProject}
                  onDirtyChange={handleDirtyChange}
                  onSaved={() => {
                    queryClient.invalidateQueries({ queryKey: ['controlPlan', selectedPfmeaId] });
                  }}
                />

                {/* Digital Traceability Section */}
                <TraceabilityMatrix
                  plan={cpDetail}
                  rows={sourcePfmea?.worksheet_rows || []}
                />
              </div>
            )}
          </div>
        </div>

        {cpError && !isCPNotFound && (
          <p role="alert" className="p-4 text-center text-xs text-rose-500">
            No se pudo cargar el plan. Comprueba tu conexión y permisos.
          </p>
        )}

        {/* Floating Action Buttons */}
        {cpDetail && (
          <motion.div
            className="fixed right-8 bottom-8 z-50 flex flex-col items-end gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              type="button"
              onClick={() => syncCPMutation.mutate(cpDetail.id)}
              disabled={syncCPMutation.isPending || readOnly || hasDirtyControls}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-40"
            >
              <Settings size={18} className={syncCPMutation.isPending ? 'animate-spin' : ''} />
              <span>
                {syncCPMutation.isPending
                  ? t('common.syncing', 'Sincronizando...')
                  : t('controlPlan.syncButton', 'Sincronizar Críticos')}
              </span>
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Dashboard / Inventory View using DataLayout
  return (
    <>
      <DataLayout
        title={t('controlPlan.dashboard.title', 'Planes de Control (CP)')}
        isLoading={isLoadingAnalyses || isLoadingAllCPs}
        actionButton={actionButton}
        searchPlaceholder={t('controlPlan.searchPlaceholder', 'Buscar por título, código o cliente...')}
        searchValue={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEmpty={filteredControlPlans.length === 0}
        extraFilters={filterSelect}
        gridContent={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedControlPlans.map((cp) => {
              const projInfo = projectNameMap[cp.pfmea_project_id];
              return (
                <ControlPlanCard
                  key={cp.id}
                  controlPlan={cp}
                  projectName={projInfo?.title}
                  customerName={projInfo?.customer}
                  onSelect={(pfmeaId, planId) => { setSelectedPfmeaId(pfmeaId); setSelectedControlPlanId(planId); }}
                  onSync={(cpId) => syncCPMutation.mutate(cpId)}
                />
              );
            })}
          </div>
        }
        tableContent={
          <div className="glass-card rounded-2xl border border-steel-800 w-full flex-1 flex flex-col overflow-hidden bg-steel-900/40 backdrop-blur-md shadow-2xl">
            <ControlPlanTable
              controlPlans={paginatedControlPlans}
              projectNameMap={projectNameMap}
              onSelect={(pfmeaId, planId) => { setSelectedPfmeaId(pfmeaId); setSelectedControlPlanId(planId); }}
              onSync={(cpId) => syncCPMutation.mutate(cpId)}
            />
          </div>
        }
        pagination={
          <Pagination
            currentPage={currentPage}
            totalItems={cpPage?.total || 0}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        }
      />

      {/* ─── Create Control Plan Modal ───────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-steel-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-steel-900 border border-steel-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <FileSignature size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t('controlPlan.modal.title', 'Nuevo Plan de Control')}</h3>
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
              <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                <label className="block text-sm">Fase documental
                  <select aria-label="Fase documental" value={modalPhase}
                    onChange={event => setModalPhase(event.target.value as ControlPlanPhase)}
                    className="block w-full rounded-lg bg-steel-950 border border-steel-700 p-2">
                    {Object.entries(controlPlanPhaseLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                {modalError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 animate-shake">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* PFMEA Select */}
                <div className="space-y-1.5">
                  <label htmlFor="control-plan-pfmea" className="text-xs font-semibold text-steel-300 uppercase tracking-wider block flex items-center gap-1">
                    <ShieldCheck size={14} className="text-indigo-400" />
                    {t('controlPlan.modal.selectPfmea', 'Seleccionar PFMEA Liberado (Released)')} <span className="text-red-500">*</span>
                  </label>

                  {isLoadingAnalyses ? (
                    <div className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm text-steel-500 flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-indigo-400" />
                      {t('common.loading', 'Cargando...')}
                    </div>
                  ) : releasedAnalyses.length > 0 ? (
                    <select
                      id="control-plan-pfmea"
                      required
                      value={modalSelectedPfmeaId}
                      onChange={(e) => setModalSelectedPfmeaId(e.target.value)}
                      className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm text-steel-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium cursor-pointer"
                    >
                      <option value="" disabled>
                        {t('controlPlan.modal.selectPlaceholder', 'Selecciona un PFMEA...')}
                      </option>
                      {releasedAnalyses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.project_name} ({a.customer}) — {a.pfmea_id_number || `ID: ${a.id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg p-3 text-xs leading-relaxed">
                      {t(
                        'controlPlan.modal.noReleasedPfmeas',
                        'No hay proyectos PFMEA liberados (Released) disponibles. Libera un PFMEA primero para generar su Plan de Control.'
                      )}
                    </div>
                  )}
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-steel-800/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={createCPMutation.isPending}
                    className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer"
                  >
                    {t('controlPlan.modal.cancel', 'Cancelar')}
                  </button>
                  <button
                    type="submit"
                    disabled={createCPMutation.isPending || releasedAnalyses.length === 0}
                    className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer"
                  >
                    {createCPMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                    {t('controlPlan.modal.createBtn', 'Crear Plan de Control')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ControlPlanPage;
