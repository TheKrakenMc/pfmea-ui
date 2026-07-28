import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileEdit, Copy, Archive, FileText, ChevronDown, AlertCircle, X, Loader2, Factory, Hash, Users, FileSignature, Eye, Package } from 'lucide-react';
import { getDocumentHeaders, createFlowchart, listProducts, archiveFlowchart, type FlowchartRead, type ProductRead, type ArchivePayload } from '../../services/flowchartService';
import { createProduct, listTechnologies, uploadImage } from '../../services/productService';
import { listCustomers } from '../../services/customerService';
import type { Technology } from '../../types/product.types';
import type { Customer } from '../../types/customer.types';
import { TechnologyMultiSelect } from '../../components/products/TechnologyMultiSelect';
import { ProductSelect } from '../../components/products/ProductSelect';
import { FlowchartProjectCard } from '../../components/flowchart/FlowchartProjectCard';
import { FlowchartProjectTable } from '../../components/flowchart/FlowchartProjectTable';
import { DataLayout } from '../../components/layout/DataLayout';
import { Pagination } from '../../components/ui/Pagination';
import { FilterBar } from '../../components/ui/FilterBar';
import { MultiSelectFilter } from '../../components/ui/MultiSelectFilter';
import { SortDropdown } from '../../components/ui/SortDropdown';
import { ArchiveConfirmModal } from '../../components/flowchart/ArchiveConfirmModal';
import { DocumentHistoryDrawer } from '../../components/flowchart/DocumentHistoryDrawer';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// ─── Status badge styles ─────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-500/20 border-slate-500/50',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  'in review': 'bg-review-500/20 text-review-500 border-review-500/50',
  in_review: 'bg-review-500/20 text-review-500 border-review-500/50',
  archived: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.draft;
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
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatuses, selectedCustomers, sortOrder]);

  // Modal & Project Creation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Form fields
  const [projectTitle, setProjectTitle] = useState('');
  const [productMode, setProductMode] = useState<'select' | 'create'>('select');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // New product fields
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerId, setNewCustomerId] = useState<number | null>(null);
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newEngineeringLevel, setNewEngineeringLevel] = useState('');
  const [newDrawing, setNewDrawing] = useState('');
  const [newStage, setNewStage] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newTechnologyIds, setNewTechnologyIds] = useState<number[]>([]);
  const [newDimensions, setNewDimensions] = useState('');
  const [newWeight, setNewWeight] = useState<number | null>(null);
  const [newCycleTime, setNewCycleTime] = useState<number | null>(null);
  const [newRatePerHour, setNewRatePerHour] = useState<number | null>(null);
  const [productCreateStep, setProductCreateStep] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // ─── Archive State ─────────────────────────────────────────
  const [archiveTargetId, setArchiveTargetId] = useState<number | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historyTargetId, setHistoryTargetId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);

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

  // ─── Fetch products when modal opens ────────────────────────
  useEffect(() => {
    if (isModalOpen) {
      setLoadingProducts(true);
      Promise.all([
        listProducts(),
        listTechnologies(),
        listCustomers()
      ])
        .then(([prodData, techData, custData]) => {
          setProducts(prodData);
          setTechnologies(techData);
          setCustomers(custData);
          setLoadingProducts(false);
        })
        .catch((err) => {
          console.error('Error fetching modal data:', err);
          toast.error('No se pudieron cargar los datos.');
          setLoadingProducts(false);
        });
    }
  }, [isModalOpen]);

  // Extract unique options for filters
  const filterOptions = useMemo(() => {
    const statuses = new Set<string>();
    const customers = new Set<string>();
    
    flowcharts.forEach(fc => {
      if (fc.status) statuses.add(fc.status);
      if (fc.product?.customer_name) customers.add(fc.product.customer_name);
    });
    
    return {
      statuses: Array.from(statuses).map(s => ({ value: s, label: t(`status.${s.toLowerCase()}`, s) })),
      customers: Array.from(customers).map(c => ({ value: c, label: c }))
    };
  }, [flowcharts, t]);

  // ─── Filters & Sort ────
  const filteredProjects = useMemo(() => {
    let filtered = flowcharts.filter((fc) => {
      const matchesSearch =
        fc.title.toLowerCase().includes(search.toLowerCase()) ||
        String(fc.id).includes(search) ||
        fc.product?.part_number?.toLowerCase().includes(search.toLowerCase()) ||
        fc.product?.customer_name?.toLowerCase().includes(search.toLowerCase());
        
      const matchesCustomer = selectedCustomers.length === 0 || (fc.product?.customer_name && selectedCustomers.includes(fc.product.customer_name));
        
      let matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(fc.status);
      const isArchived = fc.status?.toLowerCase() === 'archived';
      
      // If the toggle is active, force archived documents to pass the status check.
      if (showArchived && isArchived) {
        matchesStatus = true;
      }

      // By default, hide archived documents unless toggle is active
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
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [flowcharts, search, selectedStatuses, selectedCustomers, sortOrder, showArchived]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setModalError(t('dashboard.modal.errorNoProjectName', 'El nombre del proyecto es obligatorio.'));
      return;
    }

    if (productMode === 'create' && productCreateStep === 1) {
      if (!newPartNumber) {
        setModalError(t('products.form.partNumberRequired', 'El número de parte es obligatorio'));
        return;
      }
      if (!newCustomerId && !newCustomerName.trim()) {
        setModalError(t('dashboard.modal.errorNoCustomerPart', 'El cliente y el número de parte son obligatorios para crear un producto.'));
        return;
      }
      setModalError(null);
      setProductCreateStep(2);
      return; // Do not submit yet, just advance to step 2
    }

    if (productMode === 'create' && productCreateStep === 2) {
      if (newTechnologyIds.length === 0) {
        setModalError(t('products.form.technologiesRequired', 'Debe seleccionar al menos una tecnología para el producto.'));
        return;
      }
    }

    setSubmitting(true);
    setModalError(null);

    try {
      let productId: number;

      if (productMode === 'create') {
        if (!newCustomerId && !newCustomerName.trim()) {
          setModalError(t('dashboard.modal.errorNoCustomerPart', 'El cliente y el número de parte son obligatorios para crear un producto.'));
          setSubmitting(false);
          return;
        }

        let finalImageUrl = '';
        if (newImageFile) {
          const uploadRes = await uploadImage(newImageFile);
          finalImageUrl = uploadRes.filename;
        }

        const newProd = await createProduct({
          customer_id: newCustomerId,
          customer_part_number: '',
          part_number: newPartNumber.trim(),
          description: newDescription.trim(),
          engineering_level: newEngineeringLevel.trim() || undefined,
          drawing: newDrawing.trim() || undefined,
          stage: newStage || undefined,
          image_url: finalImageUrl || undefined,
          technology_ids: newTechnologyIds,
        });
        productId = newProd.id;
        toast.success(t('dashboard.modal.successProductCreated', 'Producto {{partNumber}} creado con éxito.', { partNumber: newProd.part_number }));
      } else {
        if (!selectedProductId) {
          setModalError(t('dashboard.modal.errorNoProductSelected', 'Debes seleccionar un producto.'));
          setSubmitting(false);
          return;
        }
        productId = Number(selectedProductId);
      }

      // Create Flowchart
      const newFlowchart = await createFlowchart({
        product_id: productId,
        title: projectTitle.trim(),
        owner_id: 1, // Default owner (John Owner)
        status: 'Draft',
        steps: [],
      });

      toast.success(t('dashboard.modal.successProjectCreated', 'Proyecto de diagrama de flujo creado correctamente.'));
      setIsModalOpen(false);

      // Reset fields
      setProjectTitle('');
      setNewCustomerName('');
      setNewCustomerId(null);
      setNewPartNumber('');
      setNewDescription('');
      setNewEngineeringLevel('');
      setNewDrawing('');
      setNewStage('');
      setNewImageFile(null);
      setNewTechnologyIds([]);
      setNewDimensions('');
      setNewWeight(null);
      setNewCycleTime(null);
      setNewRatePerHour(null);
      setProductCreateStep(1);

      // Redirect to Editor
      navigate(`/flowcharts/${newFlowchart.id}`);
    } catch (err: any) {
      console.error('Error creating flowchart:', err);
      const detail = err.response?.data?.detail || t('dashboard.modal.errorCreation', 'Error al crear el proyecto. Revisa los datos.');
      setModalError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id: number) => navigate(`/flowcharts/${id}`);

  // ─── Archive Handlers ──────────────────────────────────────
  const handleArchiveClick = (id: number) => {
    setArchiveTargetId(id);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async (payload: ArchivePayload) => {
    if (!archiveTargetId) return;
    const updated = await archiveFlowchart(archiveTargetId, payload);
    // Optimistic update
    setFlowcharts(prev =>
      prev.map(fc => fc.id === archiveTargetId ? updated : fc)
    );
    setIsArchiveModalOpen(false);
    setArchiveTargetId(null);
    toast.success(t('archive.success.archived'));
  };

  const handleViewHistory = (id: number) => {
    setHistoryTargetId(id);
    setIsHistoryDrawerOpen(true);
  };

  const actionButton = (
    <button
      onClick={() => setIsModalOpen(true)}
      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-indigo-900/20 cursor-pointer"
    >
      <Plus size={16} /> {t('dashboard.actions.create')}
    </button>
  );

  const hasActiveFilters = selectedStatuses.length > 0 || selectedCustomers.length > 0 || sortOrder !== 'date-desc';
  const handleResetFilters = () => {
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

  return (
    <>
      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 mb-6"
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

      {/* Archive Confirm Modal */}
      <AnimatePresence>
        {isArchiveModalOpen && archiveTargetId !== null && (() => {
          const fc = flowcharts.find(f => f.id === archiveTargetId);
          return fc ? (
            <ArchiveConfirmModal
              flowchart={fc}
              onConfirm={handleConfirmArchive}
              onCancel={() => { setIsArchiveModalOpen(false); setArchiveTargetId(null); }}
            />
          ) : null;
        })()}
      </AnimatePresence>

      {/* Document History Drawer */}
      {historyTargetId !== null && (() => {
        const fc = flowcharts.find(f => f.id === historyTargetId);
        return (
          <DocumentHistoryDrawer
            flowchartId={historyTargetId}
            flowchartTitle={fc?.title ?? `Flowchart #${historyTargetId}`}
            isOpen={isHistoryDrawerOpen}
            onClose={() => { setIsHistoryDrawerOpen(false); }}
          />
        );
      })()}

      <DataLayout
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        isLoading={loading}
        actionButton={actionButton}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('dashboard.searchPlaceholder', 'Buscar por Número de Parte o Cliente...')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isEmpty={filteredProjects.length === 0}
        extraFilters={filterSelect}
        gridContent={
          <>
            {/* Show Archived Toggle */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowArchived(v => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  showArchived
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-steel-800/50 border-steel-700 text-steel-400 hover:text-steel-300'
                }`}
              >
                <Archive size={12} />
                {showArchived ? t('archive.filter.hideArchived') : t('archive.filter.showArchived')}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map(project => (
                <FlowchartProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onArchive={handleArchiveClick}
                  onViewHistory={handleViewHistory}
                />
              ))}
            </div>
          </>
        }
        tableContent={
          <div className="glass-card rounded-2xl border border-steel-800 w-full flex-1 flex flex-col overflow-hidden bg-steel-900/40 backdrop-blur-md shadow-2xl">
            <FlowchartProjectTable
              flowcharts={paginatedProjects}
              onEdit={handleEdit}
              onArchive={handleArchiveClick}
              onViewHistory={handleViewHistory}
            />
          </div>
        }
        pagination={
          <Pagination
            currentPage={currentPage}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-steel-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-steel-900 border border-steel-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <FileSignature size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t('dashboard.modal.title', 'Nuevo Proyecto de Diagrama')}</h3>
                    <p className="text-xs text-steel-400">{t('dashboard.modal.subtitle', 'Introduce los metadatos para iniciar el flujo')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-steel-400 hover hover:bg-steel-800 rounded-lg transition-colors cursor-pointer"
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
                    {t('dashboard.modal.projectName', 'Nombre del Proyecto')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('dashboard.modal.projectNamePlaceholder', 'Ej. Alfombras Audi LHD AU436')}
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>

                {/* Product Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block">
                    {t('dashboard.modal.productInfo', 'Información del Producto')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-white bg-steel-950 p-1 rounded-lg border border-steel-800">
                    <button
                      type="button"
                      onClick={() => setProductMode('select')}
                      className={`py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        productMode === 'select'
                          ? 'bg-indigo-600 shadow-md shadow-indigo-900/10'
                          : 'text-steel-400 hover'
                      }`}
                    >
                      {t('dashboard.modal.selectExisting', 'Seleccionar Existente')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductMode('create')}
                      className={`py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        productMode === 'create'
                          ? 'bg-indigo-600 shadow-md shadow-indigo-900/10'
                          : 'text-steel-400 hover'
                      }`}
                    >
                      {t('dashboard.modal.createNew', 'Crear Nuevo Producto')}
                    </button>
                  </div>
                </div>

                {productMode === 'create' && (
                  <div className="flex justify-end">
                    <Link
                      to="/products"
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      → {t('dashboard.modal.advancedProductManagement', 'Ir a gestión avanzada de productos')}
                    </Link>
                  </div>
                )}

                {productMode === 'select' ? (
                  /* Select Existing Product */
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block">
                      {t('dashboard.modal.selectProduct', 'Selecciona un Producto')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {loadingProducts ? (
                        <div className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm text-steel-500 flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-indigo-400" />
                          {t('dashboard.modal.loadingProducts', 'Cargando productos...')}
                        </div>
                      ) : products.length > 0 ? (
                        <ProductSelect
                          products={products}
                          value={selectedProductId}
                          onChange={setSelectedProductId}
                        />
                      ) : (
                        <div className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm text-steel-500">
                          {t('dashboard.modal.noProducts', 'No hay productos en base de datos. Crea uno nuevo.')}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Create New Product Fields */
                  <div className="bg-steel-950/40 border border-steel-800/80 p-4 rounded-xl relative overflow-hidden min-h-[350px] flex flex-col">
                    {/* Visual Separator & Discreet Title for Create PT */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px bg-indigo-500/20 flex-1"></div>
                      <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                        <Plus size={10} /> {t('dashboard.modal.newProductTitle', 'Nuevo Producto Terminado (PT)')}
                      </span>
                      <div className="h-px bg-indigo-500/20 flex-1"></div>
                    </div>

                    {/* Progress Bar inside the box */}
                    <div className="flex gap-2 mb-4">
                      <div className={`flex-1 h-1 rounded-full transition-colors ${productCreateStep >= 1 ? 'bg-indigo-500' : 'bg-steel-800'}`} />
                      <div className={`flex-1 h-1 rounded-full transition-colors ${productCreateStep >= 2 ? 'bg-indigo-500' : 'bg-steel-800'}`} />
                    </div>

                    <div className="flex-1 relative">
                      <AnimatePresence mode="wait">
                        {productCreateStep === 1 && (
                          <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                          >
                            <h4 className="text-xs font-bold text-steel-300 uppercase tracking-wider flex items-center gap-2 mb-2">
                              <Package size={14} className="text-indigo-400" />
                              {t('products.step1.title', 'Datos Generales')}
                            </h4>

                            <div className="grid grid-cols-2 gap-5">
                              {/* Customer */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5 block mb-1.5">
                                  <Users size={12} /> {t('product.customer', 'Cliente')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={newCustomerId || ''}
                                  onChange={(e) => setNewCustomerId(e.target.value ? Number(e.target.value) : null)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                                >
                                  <option value="">{t('product.selectCustomer', 'Seleccionar cliente...')}</option>
                                  {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.company_name}</option>
                                  ))}
                                </select>
                              </div>
                              {/* Part Number */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5 block mb-1.5">
                                  <Hash size={12} /> {t('product.partNumber', 'Número de parte')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder={t('product.partNumberPlaceholder', 'Ej. PP1674201002')}
                                  value={newPartNumber}
                                  onChange={(e) => setNewPartNumber(e.target.value)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-medium text-steel-100"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                                  {t('product.engineeringLevel', 'Nivel de Ingeniería')}
                                </label>
                                <input
                                  type="text"
                                  value={newEngineeringLevel}
                                  onChange={(e) => setNewEngineeringLevel(e.target.value)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                                  {t('product.drawing', 'Dibujo')}
                                </label>
                                <input
                                  type="text"
                                  value={newDrawing}
                                  onChange={(e) => setNewDrawing(e.target.value)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                                  {t('product.stage', 'Etapa')}
                                </label>
                                <select
                                  value={newStage}
                                  onChange={(e) => setNewStage(e.target.value)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                                >
                                  <option value="">{t('product.selectStage', 'Seleccionar etapa...')}</option>
                                  <option value="Prototipo">{t('product.stagePrototype', 'Prototipo')}</option>
                                  <option value="Pre series">{t('product.stagePreseries', 'Pre series')}</option>
                                  <option value="Producción">{t('product.stageProduction', 'Producción')}</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                                  {t('product.image', 'Imagen')}
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer file:font-semibold"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5 block mb-1.5">
                                <Factory size={12} /> {t('product.description', 'Descripción del Producto')}
                              </label>
                              <textarea
                                rows={2}
                                placeholder={t('product.descriptionPlaceholder', 'Ej. Alfombras Delanteras LHD')}
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100 resize-none"
                              />
                            </div>
                          </motion.div>
                        )}

                        {productCreateStep === 2 && (
                          <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                          >
                            <h4 className="text-xs font-bold text-steel-300 uppercase tracking-wider flex items-center gap-2 mb-2">
                              <Factory size={14} className="text-indigo-400" />
                              {t('products.step2.title', 'Especificaciones y Tecnologías')}
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-5">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                                  {t('products.form.dimensions', 'Dimensiones')}
                                </label>
                                <input
                                  type="text"
                                  placeholder={t('products.form.dimensionsPlaceholder', 'Ej. 1540 x 280 x 62 mm')}
                                  value={newDimensions}
                                  onChange={(e) => setNewDimensions(e.target.value)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                                />
                              </div>
                              
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                                  {t('products.form.weight', 'Peso (kg)')}
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  placeholder={t('products.form.weightPlaceholder', 'Ej. 2.65')}
                                  value={newWeight ?? ''}
                                  onChange={(e) => setNewWeight(e.target.value ? parseFloat(e.target.value) : null)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-medium text-steel-100"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                                  {t('products.form.cycleTime', 'Tiempo de Ciclo (s)')}
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  placeholder={t('products.form.cycleTimePlaceholder', 'Ej. 88')}
                                  value={newCycleTime ?? ''}
                                  onChange={(e) => setNewCycleTime(e.target.value ? parseFloat(e.target.value) : null)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-medium text-steel-100"
                                />
                              </div>
                              
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                                  {t('products.form.ratePerHour', 'Rate / Hora (pz/hr)')}
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  placeholder={t('products.form.ratePerHourPlaceholder', 'Ej. 40')}
                                  value={newRatePerHour ?? ''}
                                  onChange={(e) => setNewRatePerHour(e.target.value ? parseFloat(e.target.value) : null)}
                                  className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-medium text-steel-100"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5 block mb-1.5">
                                {t('product.technologies', 'Tecnologías')}
                              </label>
                              <div className="bg-steel-950/40 p-4 rounded-xl border border-steel-800/80 min-h-[120px]">
                                <TechnologyMultiSelect
                                  technologies={technologies}
                                  selectedIds={newTechnologyIds}
                                  onChange={setNewTechnologyIds}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Submit and Cancel Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-steel-800/80 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (productMode === 'create' && productCreateStep === 2) {
                        setProductCreateStep(1);
                      } else {
                        setIsModalOpen(false);
                      }
                    }}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover hover:bg-steel-850 transition-colors font-medium cursor-pointer"
                  >
                    {productMode === 'create' && productCreateStep === 2 
                      ? t('products.form.back', 'Atrás') 
                      : t('common.cancel', 'Cancelar')}
                  </button>

                  {productMode === 'create' && productCreateStep === 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPartNumber) {
                          setModalError(t('products.form.partNumberRequired', 'El número de parte es obligatorio'));
                          return;
                        }
                        if (!newCustomerId) {
                          setModalError(t('dashboard.modal.errorNoCustomerPart', 'El cliente y el número de parte son obligatorios para crear un producto.'));
                          return;
                        }
                        setModalError(null);
                        setProductCreateStep(2);
                      }}
                      className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer focus-ring"
                    >
                      {t('products.form.next', 'Siguiente')}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer"
                    >
                      {submitting && <Loader2 size={16} className="animate-spin" />}
                      {t('dashboard.modal.createProjectBtn', 'Crear Proyecto')}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
