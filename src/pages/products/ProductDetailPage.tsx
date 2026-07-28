import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Save, Trash2, Loader2, Package, Tag, Clock, Maximize2, Scale, Timer, Zap, History, Send, CheckCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { getProduct, updateProduct, deleteProduct, listTechnologies, uploadImage } from '../../services/productService';
import { listCustomers } from '../../services/customerService';
import { useRBAC } from '../../hooks/useRBAC';
import type { Product, Technology } from '../../types/product.types';
import type { Customer } from '../../types/customer.types';
import { TechnologyBadge } from '../../components/products/TechnologyBadge';
import { TechnologyMultiSelect } from '../../components/products/TechnologyMultiSelect';
import { ProductParameterManager } from '../../components/products/ProductParameterManager';
import { ProductHistoryModal } from '../../components/products/ProductHistoryModal';
import { CreateRevisionModal } from '../../components/products/CreateRevisionModal';
import axiosClient from '../../api/axiosClient';

type TabType = 'master' | 'specs' | 'parameters' | 'traceability';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canEditProduct, canDeleteProduct, isLoading: rbacLoading } = useRBAC();

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

  const isReleased = product?.status === 'Released';
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
          listCustomers()
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
          technology_ids: prodData.technologies.map(t => t.id),
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
      <div className="flex items-center justify-center h-screen bg-steel-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-8 w-full max-w-7xl mx-auto min-h-screen"
    >
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 rounded-lg bg-steel-900 border border-steel-800 text-steel-400 hover:text-steel-100 hover:bg-steel-800 transition-colors focus-ring"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-steel-100 flex items-center gap-3">
            <Package className="text-forge-400" />
            {product.part_number}
          </h1>
        </div>
        
        {effectiveCanEdit && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-indigo-900/20 cursor-pointer focus-ring disabled:bg-indigo-900/60 disabled:text-indigo-200"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {t('products.actions.save')}
          </button>
        )}
        
        {/* Status Badge & Actions */}
        <div className="flex items-center gap-2 border-l border-steel-800 pl-4 ml-2">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${
            product.status === 'Draft' ? 'bg-steel-800/50 text-steel-300 border-steel-700' :
            product.status === 'In Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            product.status === 'Released' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            'bg-gray-500/10 text-gray-400 border-gray-500/20'
          }`}>
            {product.status === 'Released' && <CheckCircle size={14} />}
            {t(`productVersioning.status${product.status?.replace(' ', '')}`, product.status || 'Draft')}
            <span className="ml-1 opacity-75">V{product.version}</span>
          </div>
          
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            title={t('productVersioning.historyTitle')}
            className="p-2 rounded-lg bg-steel-900 border border-steel-800 text-steel-400 hover:text-indigo-400 hover:bg-steel-800 transition-colors"
          >
            <History size={18} />
          </button>
          
          {product.status === 'Draft' && effectiveCanEdit && (
            <button
              onClick={async () => {
                try {
                  await axiosClient.put(`/products/${id}/status`, { status: 'In Review' });
                  window.location.reload();
                } catch (e) { toast.error("Error updating status"); }
              }}
              title={t('productVersioning.sendToReview')}
              className="p-2 rounded-lg bg-steel-900 border border-steel-800 text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <Send size={18} />
            </button>
          )}

          {product.status === 'In Review' && canEditProduct && (
            <button
              onClick={async () => {
                try {
                  await axiosClient.put(`/products/${id}/status`, { status: 'Released' });
                  window.location.reload();
                } catch (e) { toast.error("Error updating status"); }
              }}
              title={t('productVersioning.release')}
              className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle size={16} />
              {t('productVersioning.release')}
            </button>
          )}

          {isReleased && canEditProduct && (
            <button
              onClick={() => setIsRevisionModalOpen(true)}
              className="p-2 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <FileText size={16} />
              {t('productVersioning.createRevisionBtn')}
            </button>
          )}
        </div>
      </div>

      {!effectiveCanEdit && (
        <div className="mb-6 p-4 rounded-xl bg-review-500/10 border border-review-500/20 flex items-center gap-3">
          <ShieldCheck className="text-review-400" size={24} />
          <p className="text-review-200 text-sm">{t('rbac.readOnlyMode')}</p>
        </div>
      )}

      <div className="flex gap-4 border-b border-steel-800 mb-6">
        <button
          onClick={() => setActiveTab('master')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'master' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          {t('products.detail.masterData')}
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'specs' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          {t('products.detail.specs', 'Dimensiones & Specs')}
        </button>

        <button
          onClick={() => setActiveTab('parameters')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'parameters' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          {t('products.detail.parameters', 'Parámetros')}
        </button>
        <button
          onClick={() => setActiveTab('traceability')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'traceability' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          {t('products.detail.traceability')}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'master' && (
          <motion.div
            key="master"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-steel-400">{t('products.form.partNumber')}</label>
              <input
                type="text"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                disabled={!effectiveCanEdit}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-steel-100 font-mono disabled:opacity-60 disabled:cursor-not-allowed focus:border-indigo-500 focus:outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-steel-400">{t('products.form.customerPartNumber')}</label>
              <input
                type="text"
                value={formData.customer_part_number}
                onChange={(e) => setFormData({ ...formData, customer_part_number: e.target.value })}
                disabled={!effectiveCanEdit}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-steel-100 font-mono disabled:opacity-60 disabled:cursor-not-allowed focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-steel-400">{t('product.engineeringLevel', 'Nivel de Ingeniería')}</label>
              <input
                type="text"
                value={formData.engineering_level || ''}
                onChange={(e) => setFormData({ ...formData, engineering_level: e.target.value })}
                disabled={!effectiveCanEdit}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-steel-100 font-medium disabled:opacity-60 disabled:cursor-not-allowed focus:border-indigo-500 focus:outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-steel-400">{t('product.drawing', 'Dibujo')}</label>
              <input
                type="text"
                value={formData.drawing || ''}
                onChange={(e) => setFormData({ ...formData, drawing: e.target.value })}
                disabled={!effectiveCanEdit}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-steel-100 font-medium disabled:opacity-60 disabled:cursor-not-allowed focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-steel-400">{t('product.stage', 'Etapa')}</label>
              <select
                value={formData.stage || ''}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                disabled={!effectiveCanEdit}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-steel-100 disabled:opacity-60 disabled:cursor-not-allowed focus:border-indigo-500 focus:outline-none"
              >
                <option value="">{t('product.selectStage', 'Seleccionar etapa...')}</option>
                <option value="Prototipo">{t('product.stagePrototype', 'Prototipo')}</option>
                <option value="Pre series">{t('product.stagePreseries', 'Pre series')}</option>
                <option value="Producción">{t('product.stageProduction', 'Producción')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-steel-400">{t('product.image', 'Imagen')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                disabled={!effectiveCanEdit}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-1.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer file:font-semibold"
              />
              {formData.image_url && !selectedFile && (
                <p className="text-xs text-steel-500 mt-1">
                  Archivo actual: {formData.image_url}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-steel-400">{t('products.form.customer')}</label>
              <select
                value={formData.customer_id || ''}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value ? Number(e.target.value) : null })}
                disabled={!effectiveCanEdit}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-steel-100 disabled:opacity-60 disabled:cursor-not-allowed focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Ninguno</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-steel-400">{t('products.form.status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={!effectiveCanEdit}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-steel-100 disabled:opacity-60 disabled:cursor-not-allowed focus:border-indigo-500 focus:outline-none"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-steel-400">{t('products.form.description')}</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!effectiveCanEdit}
                className="w-full bg-steel-950 border border-steel-700 rounded-lg px-4 py-2.5 text-steel-100 resize-none disabled:opacity-60 disabled:cursor-not-allowed focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 pt-6 border-t border-steel-800">
              <h3 className="text-steel-100 font-medium mb-4 flex items-center gap-2">
                <Tag size={18} className="text-forge-400" />
                {t('products.detail.technologies', 'Tecnologías')}
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {canEditProduct ? (
                  <TechnologyMultiSelect
                    technologies={technologies}
                    selectedIds={formData.technology_ids}
                    onChange={(ids) => {
                      setFormData({ ...formData, technology_ids: ids });
                      toast.info('Tecnologías actualizadas. No olvides guardar.');
                    }}
                  />
                ) : (
                  formData.technology_ids.length === 0 ? (
                    <p className="text-steel-500 text-sm">No hay tecnologías asignadas.</p>
                  ) : (
                    technologies
                      .filter(t => formData.technology_ids.includes(t.id))
                      .map(tech => (
                        <TechnologyBadge key={tech.id} technology={tech} />
                      ))
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'specs' && (
          <motion.div
            key="specs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Dimensions Card */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                <Maximize2 size={24} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-steel-500">
                {t('products.detail.specsCards.dimensions', 'DIMENSIONES')}
              </h4>
              {canEditProduct ? (
                <input
                  type="text"
                  placeholder="Ej. 1540 x 280 x 62 mm"
                  value={formData.dimensions || ''}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full bg-steel-950/50 border border-transparent hover:border-steel-700 focus:border-indigo-500 focus:bg-steel-950 rounded-lg px-2 py-1.5 text-center text-lg font-mono font-medium text-steel-100 focus:outline-none transition-colors"
                />
              ) : (
                <p className="text-lg font-mono font-medium text-steel-100">
                  {formData.dimensions || '-'}
                </p>
              )}
            </div>

            {/* Weight Card */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                <Scale size={24} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-steel-500">
                {t('products.detail.specsCards.weight', 'PESO (KG)')}
              </h4>
              {canEditProduct ? (
                <div className="relative w-full max-w-[140px]">
                  <input
                    type="number"
                    step="any"
                    placeholder="Ej. 2.65"
                    value={formData.weight ?? ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full bg-steel-950/50 border border-transparent hover:border-steel-700 focus:border-indigo-500 focus:bg-steel-950 rounded-lg px-2 py-1.5 text-center text-lg font-mono font-medium text-steel-100 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-500 text-sm font-medium pointer-events-none">kg</span>
                </div>
              ) : (
                <p className="text-lg font-mono font-medium text-steel-100">
                  {formData.weight ? `${formData.weight} kg` : '-'}
                </p>
              )}
            </div>

            {/* Cycle Time Card */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2">
                <Timer size={24} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-steel-500">
                {t('products.detail.specsCards.cycleTime', 'TIEMPO CICLO')}
              </h4>
              {canEditProduct ? (
                <div className="relative w-full max-w-[140px]">
                  <input
                    type="number"
                    step="any"
                    placeholder="Ej. 88"
                    value={formData.cycle_time ?? ''}
                    onChange={(e) => setFormData({ ...formData, cycle_time: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full bg-steel-950/50 border border-transparent hover:border-steel-700 focus:border-indigo-500 focus:bg-steel-950 rounded-lg px-2 py-1.5 text-center text-lg font-mono font-medium text-steel-100 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-500 text-sm font-medium pointer-events-none">s</span>
                </div>
              ) : (
                <p className="text-lg font-mono font-medium text-steel-100">
                  {formData.cycle_time ? `${formData.cycle_time}s` : '-'}
                </p>
              )}
            </div>

            {/* Rate / Hour Card */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mb-2">
                <Zap size={24} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-steel-500">
                {t('products.detail.specsCards.ratePerHour', 'RATE / HORA')}
              </h4>
              {canEditProduct ? (
                <div className="relative w-full max-w-[160px]">
                  <input
                    type="number"
                    step="any"
                    placeholder="Ej. 40"
                    value={formData.rate_per_hour ?? ''}
                    onChange={(e) => setFormData({ ...formData, rate_per_hour: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full bg-steel-950/50 border border-transparent hover:border-steel-700 focus:border-indigo-500 focus:bg-steel-950 rounded-lg pl-2 pr-12 py-1.5 text-center text-lg font-mono font-medium text-steel-100 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-500 text-sm font-medium pointer-events-none">pz/hr</span>
                </div>
              ) : (
                <p className="text-lg font-mono font-medium text-steel-100">
                  {formData.rate_per_hour ? `${formData.rate_per_hour} pz/hr` : '-'}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'parameters' && (
          <motion.div
            key="parameters"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 w-full"
          >
            <ProductParameterManager 
              productId={Number(id)} 
              technologies={technologies.filter(t => formData.technology_ids.includes(t.id))}
            />
          </motion.div>
        )}

        {activeTab === 'traceability' && (
          <motion.div
            key="traceability"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-steel-800 flex items-center justify-center text-steel-400">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-steel-100 font-medium">Historial de Registro</h3>
                <p className="text-steel-400 text-sm mt-1">Información de creación y última actualización.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-steel-950 rounded-xl p-5 border border-steel-800">
              <div>
                <p className="text-steel-500 text-sm font-medium mb-1">Fecha de Creación</p>
                <p className="text-steel-200">{new Date(product.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-steel-500 text-sm font-medium mb-1">Última Actualización</p>
                <p className="text-steel-200">{new Date(product.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {canDeleteProduct && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-alert-400 hover:text-white hover:bg-alert-500 border border-alert-500/30 rounded-lg transition-colors focus-ring"
          >
            <Trash2 size={16} />
            {t('products.actions.delete')}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-steel-900 border border-steel-800 p-6 rounded-2xl shadow-2xl relative z-10 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-alert-500/10 text-alert-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('products.deleteModal.title')}</h3>
              <p className="text-steel-400 mb-6">
                {t('products.deleteModal.message').replace('{{partNumber}}', product.part_number || '')}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 bg-steel-800 text-steel-200 hover:bg-steel-700 rounded-xl font-medium transition-colors focus-ring"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-alert-500 hover:bg-alert-600 text-white rounded-xl font-medium transition-colors focus-ring flex items-center gap-2"
                >
                  {isDeleting && <Loader2 size={16} className="animate-spin" />}
                  Confirmar Eliminación
                </button>
              </div>
            </motion.div>
          </div>
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
    </motion.div>
  );
};

export default ProductDetailPage;
