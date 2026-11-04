import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  Save,
  Trash2,
  Loader2,
  Package,
  Tag,
  Clock,
  Maximize2,
  Scale,
  Timer,
  Zap,
  History,
  Send,
  CheckCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  getProduct,
  updateProduct,
  deleteProduct,
  listTechnologies,
  uploadImage,
} from '../../services/productService';
import { listCustomers } from '../../services/customerService';
import { useRBAC } from '../../hooks/useRBAC';
import type { Product, Technology } from '../../types/product.types';
import type { Customer } from '../../types/customer.types';
import { DocumentStatus } from '../../components/ui/DocumentStatus';
import { TechnologyBadge } from '../../components/products/TechnologyBadge';
import { TechnologyMultiSelect } from '../../components/products/TechnologyMultiSelect';
import { ProductParameterManager } from '../../components/products/ProductParameterManager';
import { ProductHistoryModal } from '../../components/products/ProductHistoryModal';
import { CreateRevisionModal } from '../../components/products/CreateRevisionModal';
import {
  EASING,
  SPRING,
  backdropVariants,
  modalCardVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from '../../utils/motion';
import axiosClient from '../../api/axiosClient';

type TabType = 'master' | 'specs' | 'parameters' | 'traceability';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role, canEditProduct, canDeleteProduct, isLoading: rbacLoading } = useRBAC();

  const [product, setProduct] = useState<Product | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('master');

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  const isReleased = ['Released', 'Archived'].includes(product?.status || '');
  const canManageProduct = role === 'Administrator' || role === 'PFMEA Owner';
  const effectiveCanEdit = canEditProduct && !isReleased;

  // Form State
  const [formData, setFormData] = useState({
    part_number: '',
    customer_part_number: '',
    description: '',
    engineering_level: '',
    drawing: '',
    stage: '',
    image_url: '',
    dimensions: '',
    weight: null as number | null,
    cycle_time: null as number | null,
    rate_per_hour: null as number | null,
    customer_id: null as number | null,
    status: 'active',
    technology_ids: [] as number[],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [prodData, techData, custData] = await Promise.all([
          getProduct(Number(id)),
          listTechnologies(),
          listCustomers(),
        ]);

        setProduct(prodData);
        setTechnologies(techData);
        setCustomers(custData);

        setFormData({
          part_number: prodData.part_number || '',
          customer_part_number: prodData.customer_part_number || '',
          description: prodData.description || '',
          engineering_level: prodData.engineering_level || '',
          drawing: prodData.drawing || '',
          stage: prodData.stage || '',
          image_url: prodData.image_url || '',
          dimensions: prodData.dimensions || '',
          weight: prodData.weight || null,
          cycle_time: prodData.cycle_time || null,
          rate_per_hour: prodData.rate_per_hour || null,
          customer_id: prodData.customer?.id || null,
          status: prodData.status || 'active',
          technology_ids: prodData.technologies.map(tech => tech.id),
        });
        setSelectedFile(null);
      } catch (error) {
        console.error(error);
        toast.error('Error loading product details');
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!effectiveCanEdit) return;
    if (!formData.part_number) {
      toast.error('Part number is required');
      return;
    }

    try {
      setIsSaving(true);

      let finalImageUrl = formData.image_url;
      if (selectedFile) {
        const uploadRes = await uploadImage(selectedFile);
        finalImageUrl = uploadRes.filename;
      }

      const payload = {
        ...formData,
        image_url: finalImageUrl,
      };

      const updatedProduct = await updateProduct(Number(id), payload);
      setProduct(updatedProduct);
      setFormData(prev => ({ ...prev, image_url: finalImageUrl }));
      setSelectedFile(null);
      toast.success(t('products.toast.updateSuccess'));
    } catch (error) {
      console.error(error);
      toast.error('Error updating product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDeleteProduct || isReleased) return;
    try {
      setIsDeleting(true);
      await deleteProduct(Number(id));
      toast.success(t('products.toast.deleteSuccess'));
      navigate('/products');
    } catch (error) {
      console.error(error);
      toast.error('Error deleting product');
      setIsDeleting(false);
    }
  };

  if (isLoading || rbacLoading) {
    return (
      <section className="workspace-page" aria-busy="true">
        <div className="workspace-grid" aria-hidden="true">
          {[0, 1].map(item => (
            <div key={item} className="workspace-skeleton">
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!product) return null;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'master', label: t('products.detail.masterData') },
    { id: 'specs', label: t('products.detail.specs', 'Dimensiones & Specs') },
    { id: 'parameters', label: t('products.detail.parameters', 'Parámetros') },
    { id: 'traceability', label: t('products.detail.traceability') },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: EASING.out } }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.15, ease: EASING.in } }}
      className="workspace-page"
      aria-label={product.part_number ?? undefined}
    >
      {/* ─── Header & Action Bar ─── */}
      <header className="detail-header">
        <div className="detail-identity">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="ui-icon-button"
            aria-label={t('common.back', 'Volver')}
          >
            <ArrowLeft size={19} />
          </button>
          <div className="detail-title-group">
            <h1 className="detail-title">
              <Package size={22} aria-hidden="true" />
              <span>{product.part_number}</span>
            </h1>
            <p className="detail-subtitle">
              #{product.id} · V{product.version ?? 1}
              {product.customer?.company_name ? ` · ${product.customer.company_name}` : ''}
            </p>
          </div>
        </div>

        <div className="detail-actions">
          <div className="flex items-center gap-2">
            <DocumentStatus status={product.status} />
            <span className="document-card-id">V{product.version}</span>
          </div>

          <div className="detail-divider" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            title={t('productVersioning.historyTitle')}
            aria-label={t('productVersioning.historyTitle')}
            className="ui-icon-button"
          >
            <History size={18} />
          </button>

          {['Draft', 'active'].includes(product.status || '') && canManageProduct && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await axiosClient.put(`/products/${id}/status`, { status: 'In Review' });
                  window.location.reload();
                } catch {
                  toast.error('Error updating status');
                }
              }}
              title={t('productVersioning.sendToReview')}
              aria-label={t('productVersioning.sendToReview')}
              className="ui-icon-button ui-button-warning"
            >
              <Send size={17} />
            </button>
          )}

          {product.status === 'In Review' && canManageProduct && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await axiosClient.put(`/products/${id}/status`, { status: 'Released' });
                  window.location.reload();
                } catch {
                  toast.error('Error updating status');
                }
              }}
              title={t('productVersioning.release')}
              className="ui-button ui-button-success"
            >
              <CheckCircle size={16} />
              <span>{t('productVersioning.release')}</span>
            </button>
          )}

          {isReleased && canManageProduct && (
            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(true)}
              className="ui-button"
              data-active="true"
            >
              <FileText size={16} />
              <span>{t('productVersioning.createRevisionBtn')}</span>
            </button>
          )}

          {effectiveCanEdit && (
            <div className="workspace-primary">
              <button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{t('products.actions.save')}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── Contextual Status Banners ─── */}
      {product.needs_review && (
        <div role="status" className="detail-banner" data-tone="warning">
          <AlertTriangle size={18} />
          <p>
            Documento histórico señalado para revisión. Conserva su aprobación; inicia una nueva
            revisión para modificarlo.
          </p>
        </div>
      )}

      {!effectiveCanEdit && (
        <div className="detail-banner" data-tone="info">
          <ShieldCheck size={20} />
          <p>{t('rbac.readOnlyMode')}</p>
        </div>
      )}

      {/* ─── Origin-Aware Animated Tab Navigation ─── */}
      <nav className="detail-tabs" role="tablist" aria-label={product.part_number ?? undefined}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-active={isActive || undefined}
              onClick={() => setActiveTab(tab.id)}
              className="detail-tab"
            >
              <span>{tab.label}</span>
              {isActive && (
                <motion.span
                  layoutId="product-detail-tab-indicator"
                  className="detail-tab-indicator"
                  transition={SPRING.snappy}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* ─── Tab Panels ─── */}
      <AnimatePresence mode="wait">
        {activeTab === 'master' && (
          <motion.div
            key="master"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: EASING.out } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.14, ease: EASING.in } }}
            className="detail-panel detail-form-grid"
          >
            <div className="detail-field">
              <label htmlFor="part_number" className="detail-label">
                {t('products.form.partNumber')}
              </label>
              <input
                id="part_number"
                type="text"
                value={formData.part_number}
                onChange={e => setFormData({ ...formData, part_number: e.target.value })}
                disabled={!effectiveCanEdit}
                className="ui-input ui-input-mono"
              />
            </div>

            <div className="detail-field">
              <label htmlFor="customer_part_number" className="detail-label">
                {t('products.form.customerPartNumber')}
              </label>
              <input
                id="customer_part_number"
                type="text"
                value={formData.customer_part_number}
                onChange={e => setFormData({ ...formData, customer_part_number: e.target.value })}
                disabled={!effectiveCanEdit}
                className="ui-input ui-input-mono"
              />
            </div>

            <div className="detail-field">
              <label htmlFor="engineering_level" className="detail-label">
                {t('product.engineeringLevel', 'Nivel de Ingeniería')}
              </label>
              <input
                id="engineering_level"
                type="text"
                value={formData.engineering_level || ''}
                onChange={e => setFormData({ ...formData, engineering_level: e.target.value })}
                disabled={!effectiveCanEdit}
                className="ui-input"
              />
            </div>

            <div className="detail-field">
              <label htmlFor="drawing" className="detail-label">
                {t('product.drawing', 'Dibujo')}
              </label>
              <input
                id="drawing"
                type="text"
                value={formData.drawing || ''}
                onChange={e => setFormData({ ...formData, drawing: e.target.value })}
                disabled={!effectiveCanEdit}
                className="ui-input"
              />
            </div>

            <div className="detail-field">
              <label htmlFor="stage" className="detail-label">
                {t('product.stage', 'Etapa')}
              </label>
              <select
                id="stage"
                value={formData.stage || ''}
                onChange={e => setFormData({ ...formData, stage: e.target.value })}
                disabled={!effectiveCanEdit}
                className="ui-select"
              >
                <option value="">{t('product.selectStage', 'Seleccionar etapa...')}</option>
                <option value="Prototipo">{t('product.stagePrototype', 'Prototipo')}</option>
                <option value="Pre series">{t('product.stagePreseries', 'Pre series')}</option>
                <option value="Producción">{t('product.stageProduction', 'Producción')}</option>
              </select>
            </div>

            <div className="detail-field">
              <label htmlFor="product_image" className="detail-label">
                {t('product.image', 'Imagen')}
              </label>
              <input
                id="product_image"
                type="file"
                accept="image/*"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                disabled={!effectiveCanEdit}
                className="ui-input ui-file-input"
              />
              {formData.image_url && !selectedFile && (
                <p className="detail-subtitle">Archivo actual: {formData.image_url}</p>
              )}
            </div>

            <div className="detail-field">
              <label htmlFor="customer_id" className="detail-label">
                {t('products.form.customer')}
              </label>
              <select
                id="customer_id"
                value={formData.customer_id || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    customer_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                disabled={!effectiveCanEdit}
                className="ui-select"
              >
                <option value="">Ninguno</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="detail-field">
              <label htmlFor="product_status" className="detail-label">
                {t('products.form.status')}
              </label>
              <input
                id="product_status"
                value={formData.status}
                readOnly
                aria-label={t('products.form.status')}
                className="ui-input"
              />
            </div>

            <div className="detail-field detail-field-span">
              <label htmlFor="description" className="detail-label">
                {t('products.form.description')}
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                disabled={!effectiveCanEdit}
                className="ui-textarea resize-none"
              />
            </div>

            <div className="detail-section-divider">
              <h3 className="detail-section-title">
                <Tag size={17} />
                <span>{t('products.detail.technologies', 'Tecnologías')}</span>
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {effectiveCanEdit ? (
                  <TechnologyMultiSelect
                    technologies={technologies}
                    selectedIds={formData.technology_ids}
                    onChange={ids => {
                      setFormData({ ...formData, technology_ids: ids });
                      toast.info('Tecnologías actualizadas. No olvides guardar.');
                    }}
                  />
                ) : formData.technology_ids.length === 0 ? (
                  <p className="detail-subtitle">No hay tecnologías asignadas.</p>
                ) : (
                  technologies
                    .filter(tech => formData.technology_ids.includes(tech.id))
                    .map(tech => <TechnologyBadge key={tech.id} technology={tech} />)
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'specs' && (
          <motion.div
            key="specs"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -4, transition: { duration: 0.14, ease: EASING.in } }}
            className="detail-specs-grid"
          >
            {/* Dimensions Card */}
            <motion.div variants={staggerItemVariants} className="detail-spec-card">
              <div className="detail-spec-icon">
                <Maximize2 size={20} />
              </div>
              <h4 className="detail-spec-label">
                {t('products.detail.specsCards.dimensions', 'DIMENSIONES')}
              </h4>
              {effectiveCanEdit ? (
                <input
                  type="text"
                  placeholder="Ej. 1540 x 280 x 62 mm"
                  value={formData.dimensions || ''}
                  onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                  className="ui-input ui-input-mono"
                />
              ) : (
                <p className="detail-spec-value">{formData.dimensions || '-'}</p>
              )}
            </motion.div>

            {/* Weight Card */}
            <motion.div variants={staggerItemVariants} className="detail-spec-card">
              <div className="detail-spec-icon" data-tone="success">
                <Scale size={20} />
              </div>
              <h4 className="detail-spec-label">
                {t('products.detail.specsCards.weight', 'PESO (KG)')}
              </h4>
              {effectiveCanEdit ? (
                <div className="relative w-full">
                  <input
                    type="number"
                    step="any"
                    placeholder="Ej. 2.65"
                    value={formData.weight ?? ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        weight: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="ui-input ui-input-mono pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none text-[var(--ui-muted)]">
                    kg
                  </span>
                </div>
              ) : (
                <p className="detail-spec-value">
                  {formData.weight ? `${formData.weight} kg` : '-'}
                </p>
              )}
            </motion.div>

            {/* Cycle Time Card */}
            <motion.div variants={staggerItemVariants} className="detail-spec-card">
              <div className="detail-spec-icon" data-tone="warning">
                <Timer size={20} />
              </div>
              <h4 className="detail-spec-label">
                {t('products.detail.specsCards.cycleTime', 'TIEMPO CICLO')}
              </h4>
              {effectiveCanEdit ? (
                <div className="relative w-full">
                  <input
                    type="number"
                    step="any"
                    placeholder="Ej. 88"
                    value={formData.cycle_time ?? ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        cycle_time: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="ui-input ui-input-mono pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none text-[var(--ui-muted)]">
                    s
                  </span>
                </div>
              ) : (
                <p className="detail-spec-value">
                  {formData.cycle_time ? `${formData.cycle_time}s` : '-'}
                </p>
              )}
            </motion.div>

            {/* Rate / Hour Card */}
            <motion.div variants={staggerItemVariants} className="detail-spec-card">
              <div className="detail-spec-icon" data-tone="danger">
                <Zap size={20} />
              </div>
              <h4 className="detail-spec-label">
                {t('products.detail.specsCards.ratePerHour', 'RATE / HORA')}
              </h4>
              {effectiveCanEdit ? (
                <div className="relative w-full">
                  <input
                    type="number"
                    step="any"
                    placeholder="Ej. 40"
                    value={formData.rate_per_hour ?? ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        rate_per_hour: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="ui-input ui-input-mono pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none text-[var(--ui-muted)]">
                    pz/hr
                  </span>
                </div>
              ) : (
                <p className="detail-spec-value">
                  {formData.rate_per_hour ? `${formData.rate_per_hour} pz/hr` : '-'}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'parameters' && (
          <motion.div
            key="parameters"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: EASING.out } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.14, ease: EASING.in } }}
            className="detail-panel"
          >
            <ProductParameterManager
              readOnly={!effectiveCanEdit}
              productId={Number(id)}
              technologies={technologies.filter(tech => formData.technology_ids.includes(tech.id))}
            />
          </motion.div>
        )}

        {activeTab === 'traceability' && (
          <motion.div
            key="traceability"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: EASING.out } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.14, ease: EASING.in } }}
            className="detail-panel"
          >
            <div className="flex items-start gap-3.5 mb-6">
              <div className="detail-spec-icon">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="detail-section-title mb-1">Historial de Registro</h3>
                <p className="detail-subtitle">
                  Información de creación y última actualización.
                </p>
              </div>
            </div>

            <div className="detail-trace-grid">
              <div>
                <p className="detail-label mb-1">Fecha de Creación</p>
                <p className="font-medium text-[var(--ui-ink)]">
                  {new Date(product.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="detail-label mb-1">Última Actualización</p>
                <p className="font-medium text-[var(--ui-ink)]">
                  {new Date(product.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Destructive Action Footer ─── */}
      {canDeleteProduct && effectiveCanEdit && (
        <div className="detail-footer-danger">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="ui-button ui-button-danger"
          >
            <Trash2 size={16} />
            <span>{t('products.actions.delete')}</span>
          </button>
        </div>
      )}

      {/* ─── Delete Confirmation Modal (Emil Kowalski Physics) ─── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              variants={backdropVariants}
              className="absolute inset-0 bg-steel-950/75 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              variants={modalCardVariants}
              className="detail-panel relative z-10 max-w-md w-full text-center shadow-2xl"
            >
              <div
                className="detail-spec-icon mx-auto mb-4"
                data-tone="danger"
                style={{ width: 52, height: 52, borderRadius: 999 }}
              >
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--ui-ink)] mb-2">
                {t('products.deleteModal.title')}
              </h3>
              <p className="detail-subtitle mb-6">
                {t('products.deleteModal.message').replace(
                  '{{partNumber}}',
                  product.part_number || '',
                )}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="ui-button"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="ui-button ui-button-danger"
                >
                  {isDeleting && <Loader2 size={16} className="animate-spin" />}
                  <span>Confirmar Eliminación</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isHistoryModalOpen && (
        <ProductHistoryModal
          productId={Number(id)}
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {isRevisionModalOpen && (
        <CreateRevisionModal
          productId={Number(id)}
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          currentEngineeringLevel={product.engineering_level}
          onSuccess={() => {
            setIsRevisionModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </motion.section>
  );
};

export default ProductDetailPage;
