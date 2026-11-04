import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Loader2, Users, Hash, Factory } from 'lucide-react';
import { backdropVariants, modalCardVariants, EASING } from '../../utils/motion';
import { useTranslation } from 'react-i18next';
import { createProduct, listTechnologies, uploadImage } from '../../services/productService';
import { listCustomers } from '../../services/customerService';
import type { Technology, ProductCreatePayload } from '../../types/product.types';
import type { Customer } from '../../types/customer.types';
import { TechnologyMultiSelect } from './TechnologyMultiSelect';
import { toast } from 'sonner';
import { productFamilyService, type ProductFamily } from '../../api/productFamilyService';
import { productionLineService, type ProductionLine } from '../../api/productionLineService';
import { ProductFamilyCatalogModal } from '../pfmea/ProductFamilyCatalogModal';
import { ProductionLineCatalogModal } from '../pfmea/ProductionLineCatalogModal';

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductCreateModal: React.FC<ProductCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
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
        productionLineService.list(true),
      ]);
      setProductFamilies(families);
      setProductionLines(lines);
    } catch (error) {
      console.error('Failed to load catalogs', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      productFamilyService.list(true).then(setProductFamilies).catch(console.error);
      productionLineService.list(true).then(setProductionLines).catch(console.error);
      listTechnologies().then(setTechnologies).catch(console.error);
      listCustomers().then(setCustomers).catch(console.error);
    }
  }, [isOpen]);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
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
  }

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
      toast.error(
        t(
          'products.form.technologiesRequired',
          'Debe seleccionar al menos una tecnología para el producto.',
        ),
      );
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
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-steel-950/75 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={modalCardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[var(--ui-surface)] text-[var(--ui-ink)] border border-[var(--ui-line)] rounded-[var(--ui-panel-radius)] w-full max-w-2xl pointer-events-auto overflow-hidden flex flex-col shadow-[var(--ui-shadow-popover)]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-[var(--ui-line)] flex items-center justify-between bg-[var(--ui-surface-subtle)]">
                <div className="flex items-center gap-2.5">
                  <div className="detail-spec-icon" style={{ width: 36, height: 36 }}>
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--ui-ink)]">
                      {t('products.actions.create')}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="ui-icon-button"
                  aria-label={t('common.close', 'Cerrar')}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Progress Bar (Calibrated Timing & Tokens) */}
              <div className="flex gap-2 px-6 pt-4 bg-[var(--ui-surface)]">
                <div
                  className={`flex-1 h-1 rounded-full transition-all duration-200 ${
                    step >= 1 ? 'bg-[var(--ui-accent)]' : 'bg-[var(--ui-line)]'
                  }`}
                />
                <div
                  className={`flex-1 h-1 rounded-full transition-all duration-200 ${
                    step >= 2 ? 'bg-[var(--ui-accent)]' : 'bg-[var(--ui-line)]'
                  }`}
                />
              </div>

              <div className="flex-1 overflow-y-auto p-6 min-h-[300px] bg-[var(--ui-surface)]">
                <form
                  id="create-product-form"
                  onSubmit={e => {
                    e.preventDefault();
                    if (step === 1) {
                      handleNext();
                    } else {
                      handleSubmit(e);
                    }
                  }}
                  className="flex flex-col gap-5"
                >
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.2, ease: EASING.out },
                        }}
                        exit={{
                          opacity: 0,
                          x: -6,
                          transition: { duration: 0.14, ease: EASING.in },
                        }}
                        className="space-y-4"
                      >
                        <h4 className="detail-section-title text-xs uppercase tracking-wider text-[var(--ui-muted)] mb-2">
                          <Package size={14} />
                          <span>{t('products.step1.title', 'Datos Generales')}</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="detail-field">
                            <label htmlFor="create_part_number" className="detail-label">
                              <span className="flex items-center gap-1.5">
                                <Hash size={12} />
                                {t('products.form.partNumber')}{' '}
                                <span className="text-[var(--ui-danger)]">*</span>
                              </span>
                            </label>
                            <input
                              id="create_part_number"
                              type="text"
                              required
                              value={formData.part_number}
                              onChange={e =>
                                setFormData({ ...formData, part_number: e.target.value })
                              }
                              className="ui-input ui-input-mono"
                            />
                          </div>

                          <div className="detail-field">
                            <label htmlFor="create_customer_part_number" className="detail-label">
                              <span className="flex items-center gap-1.5">
                                <Hash size={12} />
                                {t('products.form.customerPartNumber')}
                              </span>
                            </label>
                            <input
                              id="create_customer_part_number"
                              type="text"
                              value={formData.customer_part_number || ''}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  customer_part_number: e.target.value,
                                })
                              }
                              className="ui-input ui-input-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="detail-field">
                            <label htmlFor="create_customer_id" className="detail-label">
                              <span className="flex items-center gap-1.5">
                                <Users size={12} />
                                {t('products.form.customer')}
                              </span>
                            </label>
                            <select
                              id="create_customer_id"
                              value={formData.customer_id || ''}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  customer_id: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              className="ui-select"
                            >
                              <option value="">
                                {t('product.selectCustomer', 'Seleccionar cliente...')}
                              </option>
                              {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.company_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="detail-field">
                            <label htmlFor="create_stage" className="detail-label">
                              {t('product.stage', 'Etapa')}
                            </label>
                            <select
                              id="create_stage"
                              value={formData.stage || ''}
                              onChange={e =>
                                setFormData({ ...formData, stage: e.target.value })
                              }
                              className="ui-select"
                            >
                              <option value="">
                                {t('product.selectStage', 'Seleccionar etapa...')}
                              </option>
                              <option value="Prototipo">
                                {t('product.stagePrototype', 'Prototipo')}
                              </option>
                              <option value="Pre series">
                                {t('product.stagePreseries', 'Pre series')}
                              </option>
                              <option value="Producción">
                                {t('product.stageProduction', 'Producción')}
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="detail-field">
                            <label
                              htmlFor="create_product_family_id"
                              className="flex items-center justify-between detail-label"
                            >
                              <span>{t('products.form.productFamily', 'Familia de Producto')}</span>
                              <button
                                type="button"
                                onClick={() => setIsFamilyCatalogOpen(true)}
                                className="text-xs text-[var(--ui-accent)] hover:underline"
                              >
                                {t('pfmea.header.editCatalog', 'Editar Catálogo')}
                              </button>
                            </label>
                            <select
                              id="create_product_family_id"
                              value={formData.product_family_id || ''}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  product_family_id: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                              className="ui-select"
                            >
                              <option value="">{t('common.select', 'Seleccionar...')}</option>
                              {productFamilies.map(f => (
                                <option key={f.id} value={f.id}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="detail-field">
                            <label
                              htmlFor="create_production_line_id"
                              className="flex items-center justify-between detail-label"
                            >
                              <span>{t('products.form.productionLine', 'Línea de Producción')}</span>
                              <button
                                type="button"
                                onClick={() => setIsLineCatalogOpen(true)}
                                className="text-xs text-[var(--ui-accent)] hover:underline"
                              >
                                {t('pfmea.header.editCatalog', 'Editar Catálogo')}
                              </button>
                            </label>
                            <select
                              id="create_production_line_id"
                              value={formData.production_line_id || ''}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  production_line_id: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                              className="ui-select"
                            >
                              <option value="">{t('common.select', 'Seleccionar...')}</option>
                              {productionLines.map(l => (
                                <option key={l.id} value={l.id}>
                                  {l.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="detail-field">
                            <label htmlFor="create_eng_level" className="detail-label">
                              {t('product.engineeringLevel', 'Nivel de Ingeniería')}
                            </label>
                            <input
                              id="create_eng_level"
                              type="text"
                              value={formData.engineering_level || ''}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  engineering_level: e.target.value,
                                })
                              }
                              className="ui-input"
                            />
                          </div>

                          <div className="detail-field">
                            <label htmlFor="create_drawing" className="detail-label">
                              {t('product.drawing', 'Dibujo')}
                            </label>
                            <input
                              id="create_drawing"
                              type="text"
                              value={formData.drawing || ''}
                              onChange={e =>
                                setFormData({ ...formData, drawing: e.target.value })
                              }
                              className="ui-input"
                            />
                          </div>
                        </div>

                        <div className="detail-field">
                          <label htmlFor="create_image" className="detail-label">
                            {t('product.image', 'Imagen')}
                          </label>
                          <input
                            id="create_image"
                            type="file"
                            accept="image/*"
                            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                            className="ui-input ui-file-input"
                          />
                        </div>

                        <div className="detail-field">
                          <label htmlFor="create_description" className="detail-label">
                            <span className="flex items-center gap-1.5">
                              <Factory size={12} />
                              {t('products.form.description')}
                            </span>
                          </label>
                          <textarea
                            id="create_description"
                            rows={2}
                            value={formData.description || ''}
                            onChange={e =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            className="ui-textarea resize-none"
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.2, ease: EASING.out },
                        }}
                        exit={{
                          opacity: 0,
                          x: 6,
                          transition: { duration: 0.14, ease: EASING.in },
                        }}
                        className="space-y-4"
                      >
                        <h4 className="detail-section-title text-xs uppercase tracking-wider text-[var(--ui-muted)] mb-2">
                          <Factory size={14} />
                          <span>{t('products.step2.title', 'Especificaciones y Tecnologías')}</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="detail-field">
                            <label htmlFor="create_dimensions" className="detail-label">
                              {t('products.form.dimensions', 'Dimensiones')}
                            </label>
                            <input
                              id="create_dimensions"
                              type="text"
                              placeholder={t(
                                'products.form.dimensionsPlaceholder',
                                'Ej. 1540 x 280 x 62 mm',
                              )}
                              value={formData.dimensions || ''}
                              onChange={e =>
                                setFormData({ ...formData, dimensions: e.target.value })
                              }
                              className="ui-input ui-input-mono"
                            />
                          </div>

                          <div className="detail-field">
                            <label htmlFor="create_weight" className="detail-label">
                              {t('products.form.weight', 'Peso (kg)')}
                            </label>
                            <div className="relative w-full">
                              <input
                                id="create_weight"
                                type="number"
                                step="any"
                                placeholder={t('products.form.weightPlaceholder', 'Ej. 2.65')}
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
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="detail-field">
                            <label htmlFor="create_cycle_time" className="detail-label">
                              {t('products.form.cycleTime', 'Tiempo de Ciclo (s)')}
                            </label>
                            <div className="relative w-full">
                              <input
                                id="create_cycle_time"
                                type="number"
                                step="any"
                                placeholder={t('products.form.cycleTimePlaceholder', 'Ej. 88')}
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
                          </div>

                          <div className="detail-field">
                            <label htmlFor="create_rate_per_hour" className="detail-label">
                              {t('products.form.ratePerHour', 'Rate / Hora (pz/hr)')}
                            </label>
                            <div className="relative w-full">
                              <input
                                id="create_rate_per_hour"
                                type="number"
                                step="any"
                                placeholder={t('products.form.ratePerHourPlaceholder', 'Ej. 40')}
                                value={formData.rate_per_hour ?? ''}
                                onChange={e =>
                                  setFormData({
                                    ...formData,
                                    rate_per_hour: e.target.value
                                      ? parseFloat(e.target.value)
                                      : null,
                                  })
                                }
                                className="ui-input ui-input-mono pr-14"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none text-[var(--ui-muted)]">
                                pz/hr
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="detail-field pt-2">
                          <label className="detail-label">
                            {t('products.form.technologies', 'Tecnologías')}
                          </label>
                          <div className="p-4 rounded-[var(--ui-radius)] border border-[var(--ui-line)] bg-[var(--ui-surface-subtle)] min-h-[120px]">
                            <TechnologyMultiSelect
                              technologies={technologies}
                              selectedIds={formData.technology_ids}
                              onChange={ids =>
                                setFormData({ ...formData, technology_ids: ids })
                              }
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--ui-line)] bg-[var(--ui-surface-subtle)]">
                {step === 1 ? (
                  <button type="button" onClick={onClose} className="ui-button">
                    {t('products.form.cancel', 'Cancelar')}
                  </button>
                ) : (
                  <button type="button" onClick={handleBack} className="ui-button">
                    {t('products.form.back', 'Atrás')}
                  </button>
                )}

                {step === 1 ? (
                  <div className="workspace-primary">
                    <button type="button" onClick={handleNext}>
                      <span>{t('products.form.next', 'Siguiente')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="workspace-primary">
                    <button
                      type="submit"
                      form="create-product-form"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>{t('products.form.saving', 'Guardando...')}</span>
                        </>
                      ) : (
                        <span>{t('products.form.save', 'Guardar')}</span>
                      )}
                    </button>
                  </div>
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
