import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Loader2, Users, Hash, Factory } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createProduct, listTechnologies, uploadImage } from '../../services/productService';
import { listCustomers } from '../../services/customerService';
import type { Technology, ProductCreatePayload } from '../../types/product.types';
import type { Customer } from '../../types/customer.types';
import { TechnologyMultiSelect } from './TechnologyMultiSelect';
import { toast } from 'sonner';
import axiosClient from '../../api/axiosClient';
import { productFamilyService, type ProductFamily } from '../../api/productFamilyService';
import { productionLineService, type ProductionLine } from '../../api/productionLineService';
import { ProductFamilyCatalogModal } from '../pfmea/ProductFamilyCatalogModal';
import { ProductionLineCatalogModal } from '../pfmea/ProductionLineCatalogModal';

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductCreateModal: React.FC<ProductCreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [formData, setFormData] = useState<ProductCreatePayload>({
    part_number: '',
    customer_part_number: '',
    description: '',
    engineering_level: '',
    drawing: '',
    stage: '',
    image_url: '',
    customer_id: null,
    technology_ids: [],
    dimensions: '',
    weight: null,
    cycle_time: null,
    rate_per_hour: null,
  });
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [productFamilies, setProductFamilies] = useState<ProductFamily[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [isFamilyCatalogOpen, setIsFamilyCatalogOpen] = useState(false);
  const [isLineCatalogOpen, setIsLineCatalogOpen] = useState(false);

  const loadCatalogs = async () => {
    try {
      const [families, lines] = await Promise.all([
        productFamilyService.list(true),
        productionLineService.list(true)
      ]);
      setProductFamilies(families);
      setProductionLines(lines);
    } catch (error) {
      console.error("Failed to load catalogs", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCatalogs();
      listTechnologies().then(setTechnologies).catch(console.error);
      listCustomers().then(setCustomers).catch(console.error);
      setFormData({
        part_number: '',
        customer_part_number: '',
        description: '',
        engineering_level: '',
        drawing: '',
        stage: '',
        image_url: '',
        customer_id: null,
        product_family_id: null,
        production_line_id: null,
        technology_ids: [],
        dimensions: '',
        weight: null,
        cycle_time: null,
        rate_per_hour: null,
      });
      setSelectedFile(null);
      setStep(1);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (!formData.part_number) {
      toast.error(t('products.form.partNumberRequired', 'El número de parte es obligatorio'));
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.part_number) {
      toast.error(t('products.form.partNumberRequired', 'El número de parte es obligatorio'));
      return;
    }

    if (formData.technology_ids.length === 0) {
      toast.error(t('products.form.technologiesRequired', 'Debe seleccionar al menos una tecnología para el producto.'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image_url;
      if (selectedFile) {
        const uploadRes = await uploadImage(selectedFile);
        finalImageUrl = uploadRes.filename;
      }
      
      const payload = {
        ...formData,
        image_url: finalImageUrl,
      };
      
      await createProduct(payload);
      toast.success(t('products.toast.createSuccess'));
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t('products.toast.createError', 'Error al crear el producto'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-steel-950/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-steel-900 border border-steel-800 rounded-2xl w-full max-w-2xl pointer-events-auto overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-steel-800/80 flex items-center justify-between bg-steel-950/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t('products.actions.create')}</h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-steel-400 hover:bg-steel-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2 px-6 pt-4">
                <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-500' : 'bg-steel-800'}`} />
                <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-500' : 'bg-steel-800'}`} />
              </div>

              <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
                <form id="create-product-form" onSubmit={(e) => { e.preventDefault(); if (step === 1) { handleNext(); } else { handleSubmit(e); } }} className="flex flex-col gap-5">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
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
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5 block mb-1.5">
                              <Hash size={12} /> {t('products.form.partNumber')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.part_number}
                              onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-medium text-steel-100"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5 block mb-1.5">
                              <Hash size={12} /> {t('products.form.customerPartNumber')}
                            </label>
                            <input
                              type="text"
                              value={formData.customer_part_number || ''}
                              onChange={(e) => setFormData({ ...formData, customer_part_number: e.target.value })}
                              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-medium text-steel-100"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5 block mb-1.5">
                              <Users size={12} /> {t('products.form.customer')}
                            </label>
                            <select
                              value={formData.customer_id || ''}
                              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value ? Number(e.target.value) : null })}
                              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                            >
                              <option value="">{t('product.selectCustomer', 'Seleccionar cliente...')}</option>
                              {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.company_name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                              {t('product.stage', 'Etapa')}
                            </label>
                            <select
                              value={formData.stage || ''}
                              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                            >
                              <option value="">{t('product.selectStage', 'Seleccionar etapa...')}</option>
                              <option value="Prototipo">{t('product.stagePrototype', 'Prototipo')}</option>
                              <option value="Pre series">{t('product.stagePreseries', 'Pre series')}</option>
                              <option value="Producción">{t('product.stageProduction', 'Producción')}</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                              {t('products.form.productFamily', 'Familia de Producto')}
                              <button type="button" onClick={() => setIsFamilyCatalogOpen(true)} className="text-indigo-400 hover:text-indigo-300">{t('pfmea.header.editCatalog', 'Editar Catálogo')}</button>
                            </label>
                            <select
                              value={formData.product_family_id || ''}
                              onChange={(e) => setFormData({ ...formData, product_family_id: e.target.value ? Number(e.target.value) : null })}
                              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                            >
                              <option value="">{t('common.select', 'Seleccionar...')}</option>
                              {productFamilies.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                              {t('products.form.productionLine', 'Línea de Producción')}
                              <button type="button" onClick={() => setIsLineCatalogOpen(true)} className="text-indigo-400 hover:text-indigo-300">{t('pfmea.header.editCatalog', 'Editar Catálogo')}</button>
                            </label>
                            <select
                              value={formData.production_line_id || ''}
                              onChange={(e) => setFormData({ ...formData, production_line_id: e.target.value ? Number(e.target.value) : null })}
                              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                            >
                              <option value="">{t('common.select', 'Seleccionar...')}</option>
                              {productionLines.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                              {t('product.engineeringLevel', 'Nivel de Ingeniería')}
                            </label>
                            <input
                              type="text"
                              value={formData.engineering_level || ''}
                              onChange={(e) => setFormData({ ...formData, engineering_level: e.target.value })}
                              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                              {t('product.drawing', 'Dibujo')}
                            </label>
                            <input
                              type="text"
                              value={formData.drawing || ''}
                              onChange={(e) => setFormData({ ...formData, drawing: e.target.value })}
                              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 block mb-1.5">
                            {t('product.image', 'Imagen')}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer file:font-semibold"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5 block mb-1.5">
                            <Factory size={12} /> {t('products.form.description')}
                          </label>
                          <textarea
                            rows={2}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-steel-100 resize-none"
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
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
                              value={formData.dimensions || ''}
                              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
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
                              value={formData.weight ?? ''}
                              onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : null })}
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
                              value={formData.cycle_time ?? ''}
                              onChange={(e) => setFormData({ ...formData, cycle_time: e.target.value ? parseFloat(e.target.value) : null })}
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
                              value={formData.rate_per_hour ?? ''}
                              onChange={(e) => setFormData({ ...formData, rate_per_hour: e.target.value ? parseFloat(e.target.value) : null })}
                              className="w-full bg-steel-950 border border-steel-700 rounded-lg px-3.5 py-2.5 text-sm placeholder-steel-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-medium text-steel-100"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-steel-400 flex items-center gap-1.5 block mb-1.5">
                            {t('products.form.technologies', 'Tecnologías')}
                          </label>
                          <div className="bg-steel-950/40 p-4 rounded-xl border border-steel-800/80 min-h-[120px]">
                            <TechnologyMultiSelect
                              technologies={technologies}
                              selectedIds={formData.technology_ids}
                              onChange={(ids) => setFormData({ ...formData, technology_ids: ids })}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-steel-800/80 bg-steel-950/50">
                {step === 1 ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer"
                  >
                    {t('products.form.cancel', 'Cancelar')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2.5 rounded-lg text-sm text-steel-400 hover:bg-steel-850 transition-colors font-medium cursor-pointer"
                  >
                    {t('products.form.back', 'Atrás')}
                  </button>
                )}

                {step === 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer focus-ring"
                  >
                    {t('products.form.next', 'Siguiente')}
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="create-product-form"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-indigo-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/20 cursor-pointer focus-ring"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t('products.form.saving', 'Guardando...')}
                      </>
                    ) : (
                      t('products.form.save', 'Guardar')
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
          
          <ProductFamilyCatalogModal 
            isOpen={isFamilyCatalogOpen} 
            onClose={() => {
              setIsFamilyCatalogOpen(false);
              loadCatalogs();
            }} 
          />
          <ProductionLineCatalogModal 
            isOpen={isLineCatalogOpen} 
            onClose={() => {
              setIsLineCatalogOpen(false);
              loadCatalogs();
            }} 
          />
        </>
      )}
    </AnimatePresence>
  );
};
