import type { Resolver } from 'react-hook-form';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Building2,
  Calendar,
  FileText,
  UserCheck,
  Users,
  Settings2,
  Box,
  ChevronDown,
} from 'lucide-react';
import type { PfmeaHeader, PfmeaHeaderUpdate, WorksheetRow } from '../../api/pfmeaService';
import type { FlowchartStepRead } from '../../services/flowchartService';
import type { FmeaLayoutType } from './FormatSelectorToolbar';
import { ProductFamilyCatalogModal } from './ProductFamilyCatalogModal';
import { productFamilyService, type ProductFamily } from '../../api/productFamilyService';
import { ProductionLineCatalogModal } from './ProductionLineCatalogModal';
import { productionLineService, type ProductionLine } from '../../api/productionLineService';
import { TeamMemberModal } from './TeamMemberModal';
import {useAuth} from '../../hooks/useAuth';
import { PFMEAProgressBar } from './PFMEAProgressBar';
import { usePFMEAValidation } from '../../hooks/usePFMEAValidation';
import { toast } from 'sonner';

interface PFMEAMasterHeaderProps {
  header: PfmeaHeader;
  currentLayout: FmeaLayoutType;
  onUpdate?: (data: PfmeaHeaderUpdate) => void;
  onLocalChange?: (data: PfmeaHeaderUpdate, isDirty: boolean) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  rows?: WorksheetRow[];
  flowchartSteps?: FlowchartStepRead[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Draft: { bg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60', text: 'text-amber-800 dark:text-amber-300', dot: 'bg-amber-500' },
  'In Review': { bg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700/60', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500' },
  Approved: { bg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/60', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Archived: { bg: 'bg-slate-200 dark:bg-steel-800/80 border-slate-300 dark:border-steel-700/60', text: 'text-slate-700 dark:text-steel-400', dot: 'bg-slate-500' },
};

const schema = yup.object().shape({
  project_name: yup.string().required('Requerido'),
  customer: yup.string().required('Requerido'),
  original_launch_date: yup.string().nullable(),
  part_number: yup.string().nullable(),
  product_description: yup.string().nullable(),
  product_family_id: yup.number().nullable().transform((curr, orig) => (!orig || Number(orig) <= 0 ? null : curr)),
  production_line_id: yup.number().nullable().transform((curr, orig) => (!orig || Number(orig) <= 0 ? null : curr)),
  confidentiality_level: yup.string().nullable(),
  revision_date: yup.string().nullable(),
  version: yup.number().nullable(),
  pfmea_id_number: yup.string().nullable(),
  moc_status: yup.string().nullable(),
  supplier_part_number: yup.string().nullable(),
  model_year: yup.string().nullable(),
  key_date: yup.string().nullable(),
  special_document_control: yup.string().nullable(),
  process_responsibility: yup.string().nullable(),
});

export const PFMEAMasterHeader: React.FC<PFMEAMasterHeaderProps> = ({
  header,
  currentLayout,
  onLocalChange,
  isLoading = false,
  readOnly = false,
  rows = [],
  flowchartSteps = [],
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role_name || '';
  const canManage=role==='Administrator' || role==='PFMEA Owner' && (header.owner_id===Number(user?.id) || !!header.team_members?.some(member=>member.user_id===Number(user?.id)&&member.role_in_team==='PFMEA Owner'));

  const validation = usePFMEAValidation(rows, flowchartSteps, currentLayout);

  const [isExpanded, setIsExpanded] = useState(true);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [productFamilies, setProductFamilies] = useState<ProductFamily[]>([]);
  const [isProductionLineCatalogModalOpen, setIsProductionLineCatalogModalOpen] = useState(false);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);

  const getAvailableStatuses = (): string[] => {
    const current=header.moc_status;
    if(!canManage)return [current];
    const next:Record<string,string[]>={Draft:['In Review'],'In Review':['Draft','Approved'],Approved:['Archived'],Archived:[]};
    return [current,...(next[current] || [])];
  };
  const availableStatuses = getAvailableStatuses();

  const loadProductFamilies = async () => {
    try {
      const data = await productFamilyService.list(true);
      setProductFamilies(data);
    } catch (error) {
      console.error('Failed to load product families', error);
    }
  };

  const loadProductionLines = async () => {
    try {
      const data = await productionLineService.list(true);
      setProductionLines(data);
    } catch (error) {
      console.error('Failed to load production lines', error);
    }
  };

  useEffect(() => {
    productFamilyService.list(true).then(setProductFamilies).catch(console.error);
    productionLineService.list(true).then(setProductionLines).catch(console.error);
  }, []);

  const isReadOnly = readOnly || header.moc_status === 'Approved' || header.moc_status === 'Archived';
  const statusStyle = STATUS_STYLES[header.moc_status] || STATUS_STYLES.Draft;

  const primaryOwner =
    header.team_members?.find(m => m.user_id === header.owner_id || m.role_in_team?.toLowerCase().includes('owner'))?.user_full_name ||
    header.team_members?.[0]?.user_full_name ||
    t('pfmea.corporate.placeholders.processEngineering', 'Ingeniería de Procesos');

  const eligibleOwners = (header.team_members || []).filter(
    (m) =>
      m.role_in_team?.toLowerCase().includes('owner') ||
      m.role_in_team?.toLowerCase().includes('admin') ||
      m.role_in_team?.toLowerCase().includes('administrador')
  );
  const ownerOptions = eligibleOwners.length > 0 ? eligibleOwners : (header.team_members || []);

  const initialResponsibility =
    (header.team_members || []).some(m => m.user_full_name === header.process_responsibility)
      ? header.process_responsibility
      : (header.process_responsibility && header.process_responsibility !== 'A. Carranza' ? header.process_responsibility : primaryOwner);

  const { register, control, reset, setValue, formState: { isDirty } } = useForm<PfmeaHeaderUpdate>({
    resolver: yupResolver(schema) as Resolver<PfmeaHeaderUpdate>,
    defaultValues: {
      project_name: header.project_name || '',
      customer: header.customer || '',
      original_launch_date: header.original_launch_date || header.start_date || header.created_at?.split('T')[0] || '',
      part_number: header.part_number || '',
      product_description: header.product_description || '',
      product_family_id: header.product_family_id && Number(header.product_family_id) > 0 ? Number(header.product_family_id) : null,
      production_line_id: header.production_line_id && Number(header.production_line_id) > 0 ? Number(header.production_line_id) : null,
      confidentiality_level: header.confidentiality_level || 'Internal',
      revision_date: header.revision_date || header.updated_at?.split('T')[0] || header.created_at?.split('T')[0] || '',
      version: header.version || 1,
      pfmea_id_number: header.pfmea_id_number || '',
      moc_status: header.moc_status || 'Draft',
      supplier_part_number: header.supplier_part_number || '',
      model_year: header.model_year || '',
      key_date: header.key_date || '',
      special_document_control: header.special_document_control || '0',
      process_responsibility: initialResponsibility,
    },
  });

  const headerVersionKey = `${header.id}-${header.version}-${header.updated_at || ''}`;
  const prevVersionKeyRef = useRef(headerVersionKey);
  const prevNotifiedRef = useRef<string>('');

  // Keep form in sync ONLY when header actually updates from server
  useEffect(() => {
    if (prevVersionKeyRef.current !== headerVersionKey) {
      prevVersionKeyRef.current = headerVersionKey;
      reset({
        project_name: header.project_name || '',
        customer: header.customer || '',
        original_launch_date: header.original_launch_date || header.start_date || header.created_at?.split('T')[0] || '',
        part_number: header.part_number || '',
        product_description: header.product_description || '',
        product_family_id: header.product_family_id && Number(header.product_family_id) > 0 ? Number(header.product_family_id) : null,
        production_line_id: header.production_line_id && Number(header.production_line_id) > 0 ? Number(header.production_line_id) : null,
        confidentiality_level: header.confidentiality_level || 'Internal',
        revision_date: header.revision_date || header.updated_at?.split('T')[0] || header.created_at?.split('T')[0] || '',
        version: header.version || 1,
        pfmea_id_number: header.pfmea_id_number || '',
        moc_status: header.moc_status || 'Draft',
        supplier_part_number: header.supplier_part_number || '',
        model_year: header.model_year || '',
        key_date: header.key_date || '',
        special_document_control: header.special_document_control || '0',
        process_responsibility: initialResponsibility,
      });
      prevNotifiedRef.current = '';
    }
  }, [headerVersionKey, header, reset, initialResponsibility]);

  const formData = useWatch({control});
  const formDataString = JSON.stringify(formData);

  useEffect(() => {
    if (onLocalChange && prevNotifiedRef.current !== formDataString) {
      prevNotifiedRef.current = formDataString;
      onLocalChange(JSON.parse(formDataString) as PfmeaHeaderUpdate, isDirty);
    }
  }, [formDataString, isDirty, onLocalChange]);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'Approved' && !validation.canRelease) {
      toast.error(validation.releaseBlockReason, {
        description: 'Complete todos los campos mandatorios y asegure la asignación de características críticas (SC/CC) a las operaciones requeridas desde el diagrama de flujo antes de liberar.',
        duration: 6000,
      });
      // Revert select back to current value
      setValue('moc_status', header.moc_status || 'Draft');
      return;
    }

    setValue('moc_status', newStatus, { shouldDirty: true });
  };

  return (
    <div className="bg-white dark:bg-steel-950/90 border border-slate-200 dark:border-steel-800 rounded-xl shadow-lg overflow-hidden backdrop-blur-md transition-all">
      {/* Top Identity & Action Bar */}
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
                  {currentLayout === 'AIAG_APG'
                    ? t('pfmea.corporate.title', 'PROCESS FAILURE MODE AND EFFECTS ANALYSIS (PFMEA)')
                    : t('pfmea.header.aiagVdaTitle', 'AIAG & VDA PROCESS FMEA (7-STEP HARMONIZED)')}
                </h2>
                {isDirty && !isReadOnly && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/50 animate-pulse">
                    {t('pfmea.header.unsavedChanges', 'Cambios pendientes')}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-steel-400 font-medium">
                {currentLayout === 'AIAG_APG'
                  ? t('pfmea.corporate.subtitle', 'AIAG 4th Edition Corporate Format (G-C1001 F-APQP)')
                  : t('pfmea.header.aiagVdaSubtitle', 'AP provisional; requiere revisión técnica')}
              </span>
            </div>
          </div>

          {/* Right Action Block: Progress Bar, Status, Collapse Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Global Document Progress Bar & Lock Indicator */}
            <PFMEAProgressBar metrics={validation} />

            {/* MOC Status Dropdown */}
            <div className="relative">
              <select
                {...register('moc_status')}
                disabled={isReadOnly || !canManage || availableStatuses.length <= 1 || isLoading}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-forge-500 cursor-pointer disabled:cursor-not-allowed ${statusStyle.bg} ${statusStyle.text}`}
              >
                {availableStatuses.map((st) => (
                  <option key={st} value={st} className="bg-white dark:bg-steel-900 text-slate-900 dark:text-white">
                    {st}
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
            {/* Step 1 Conditional Highlight Banner (Rendered only when currentLayout === 'AIAG_VDA') */}
            {currentLayout === 'AIAG_VDA' && (
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-slate-100/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-steel-900/40 border-b border-indigo-200/80 dark:border-indigo-800/50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    STEP 1
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {t('pfmea.worksheet.steps.step1', 'PLANNING AND PREPARATION')}
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-steel-300 font-medium">
                    — {t('pfmea.worksheet.steps.step1Desc', 'Project definition, core team and scope.')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-steel-400 font-mono">
                  {header.pfmea_id_number || 'PFMEA'} — Rev. {header.version}
                </div>
              </div>
            )}

            {/* 4 Metadata Matrix Cards with Clean Inline Inputs */}
            <div className="p-3 bg-slate-50/50 dark:bg-steel-950/60">
              <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Card 1: Item / Description & Customer */}
                <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs group focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/40 transition-all">
                  <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                    <Building2 size={13} className="text-blue-600 dark:text-blue-400" />
                    {t('pfmea.corporate.itemDescription', 'Item / Descripción & Cliente')}
                  </span>
                  <input
                    type="text"
                    {...register('project_name')}
                    disabled={isReadOnly || isLoading}
                    placeholder={t('pfmea.corporate.placeholders.projectDesc', 'Descripción / Proyecto')}
                    className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-steel-700/60 focus:border-blue-500 focus:outline-none pb-1 mb-1.5 disabled:opacity-60 placeholder:text-slate-400"
                  />
                  <input
                    type="text"
                    {...register('customer')}
                    disabled={isReadOnly || isLoading}
                    placeholder={t('pfmea.corporate.placeholders.customer', 'Cliente (ej. AUDI México)')}
                    className="text-[11px] text-slate-600 dark:text-steel-300 bg-transparent border-none focus:outline-none disabled:opacity-60 placeholder:text-slate-400"
                  />
                </div>

                {/* Card 2: Part Numbers, Line, Family & Model Year */}
                <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs group focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all">
                  <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                    <FileText size={13} className="text-indigo-600 dark:text-indigo-400" />
                    {t('pfmea.corporate.partNumbers', 'Customer / Supplier Part #')}
                  </span>
                  <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5">
                    <input
                      type="text"
                      {...register('part_number')}
                      disabled
                      placeholder={t('pfmea.corporate.placeholders.partNumber', 'No. Parte Cliente')}
                      className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none w-1/2 disabled:opacity-75 cursor-not-allowed placeholder:text-slate-400"
                    />
                    <span className="text-slate-400 dark:text-steel-600 font-bold">/</span>
                    <input
                      type="text"
                      {...register('supplier_part_number')}
                      disabled={isReadOnly || isLoading}
                      placeholder={t('pfmea.corporate.placeholders.supplierPart', 'No. Proveedor')}
                      className="text-xs font-mono font-semibold text-slate-800 dark:text-steel-200 bg-transparent border-none focus:outline-none w-1/2 disabled:opacity-60 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Lines & Families Inline Selectors */}
                  <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5 text-[11px]">
                    <div className="flex items-center gap-1 w-1/2">
                      <Settings2 size={11} className="text-slate-400 dark:text-steel-500 shrink-0" />
                      <select
                        {...register('production_line_id', {
                          setValueAs: (v) => (!v || Number(v) <= 0 ? null : Number(v)),
                        })}
                        disabled={isReadOnly || isLoading}
                        className="w-full font-semibold text-slate-800 dark:text-steel-200 bg-transparent border-none focus:outline-none disabled:opacity-60 truncate cursor-pointer"
                        title={t('pfmea.header.lines', 'Línea de Producción')}
                      >
                        <option value="">{t('pfmea.header.selectLine', 'Línea: N/A')}</option>
                        {productionLines.map((line) => (
                          <option key={line.id} value={line.id} className="bg-white dark:bg-steel-900 text-slate-900 dark:text-white">
                            {line.id || line.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsProductionLineCatalogModalOpen(true)}
                        className="text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold shrink-0 cursor-pointer px-0.5"
                        title={t('pfmea.header.productionLinesTitle', 'Gestionar Líneas')}
                      >
                        +
                      </button>
                    </div>

                    <span className="text-slate-400 dark:text-steel-600 font-bold">/</span>

                    <div className="flex items-center gap-1 w-1/2">
                      <Box size={11} className="text-slate-400 dark:text-steel-500 shrink-0" />
                      <select
                        {...register('product_family_id', {
                          setValueAs: (v) => (!v || Number(v) <= 0 ? null : Number(v)),
                        })}
                        disabled={isReadOnly || isLoading}
                        className="w-full font-semibold text-slate-800 dark:text-steel-200 bg-transparent border-none focus:outline-none disabled:opacity-60 truncate cursor-pointer"
                        title={t('pfmea.header.families', 'Familia de Producto')}
                      >
                        <option value="">{t('pfmea.header.selectFamily', 'Familia: N/A')}</option>
                        {productFamilies.map((fam) => (
                          <option key={fam.id} value={fam.id} className="bg-white dark:bg-steel-900 text-slate-900 dark:text-white">
                            {fam.id || fam.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsCatalogModalOpen(true)}
                        className="text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold shrink-0 cursor-pointer px-0.5"
                        title={t('pfmea.header.productFamiliesTitle', 'Gestionar Familias')}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    {...register('model_year')}
                    disabled={isReadOnly || isLoading}
                    placeholder={t('pfmea.corporate.placeholders.modelYear', 'Model Year / Vehículo (ej. 2026 AU436)')}
                    className="text-[11px] text-slate-600 dark:text-steel-300 bg-transparent border-none focus:outline-none disabled:opacity-60 placeholder:text-slate-400"
                  />
                </div>

                {/* Card 3: Process Responsibility & Prepared By */}
                <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs group focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
                  <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                    <UserCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                    {t('pfmea.corporate.respPrepared', 'Responsable del Proceso')}
                  </span>
                  <select
                    {...register('process_responsibility')}
                    disabled={isReadOnly || isLoading}
                    className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-steel-700/60 focus:border-emerald-500 focus:outline-none pb-1 mb-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    {ownerOptions.length > 0 ? (
                      ownerOptions.map((m) => {
                        const name = m.user_full_name || `Usuario #${m.user_id}`;
                        return (
                          <option key={m.id || m.user_id} value={name} className="bg-white dark:bg-steel-900 text-slate-900 dark:text-white font-medium">
                            {name} ({m.role_in_team || 'PFMEA Owner'})
                          </option>
                        );
                      })
                    ) : (
                      <option value={primaryOwner} className="bg-white dark:bg-steel-900 text-slate-900 dark:text-white">
                        {primaryOwner}
                      </option>
                    )}
                  </select>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-steel-300">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-steel-400 truncate">
                      {header.team_members?.find(m => m.user_full_name === (formData.process_responsibility || primaryOwner))?.department
                        ? `${header.team_members?.find(m => m.user_full_name === (formData.process_responsibility || primaryOwner))?.role_in_team || 'PFMEA Owner'} • ${header.team_members?.find(m => m.user_full_name === (formData.process_responsibility || primaryOwner))?.department}`
                        : (header.team_members?.find(m => m.user_full_name === (formData.process_responsibility || primaryOwner))?.role_in_team || t('pfmea.corporate.pfmeaOwner', 'PFMEA Owner'))}
                    </span>
                    <button
                      type="button"
                      disabled={!canManage || isReadOnly} onClick={() => setIsTeamMemberModalOpen(true)}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold ml-1 cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>+ {t('pfmea.header.team', 'Equipo')}</span>
                      {header.team_members && header.team_members.length > 0 && (
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                          {header.team_members.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card 4: Dates & Document Control */}
                <div className="flex flex-col bg-white dark:bg-steel-900/80 border border-slate-200 dark:border-steel-800 rounded-lg p-3 shadow-2xs group focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/40 transition-all">
                  <span className="text-[10px] text-slate-500 dark:text-steel-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                    <Calendar size={13} className="text-amber-600 dark:text-amber-400" />
                    {t('pfmea.corporate.datesDoc', 'Fechas (Orig / Rev) & Doc #')}
                  </span>
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-steel-700/60 pb-1 mb-1.5">
                    <input
                      type="date"
                      {...register('original_launch_date')}
                      disabled={isReadOnly || isLoading}
                      title={t('pfmea.corporate.origLaunchDate', 'Fecha Original / Lanzamiento')}
                      className="text-[11px] font-semibold text-slate-800 dark:text-steel-200 bg-transparent border-none focus:outline-none w-1/2 disabled:opacity-60 [&::-webkit-calendar-picker-indicator]:invert-[0.6] dark:[&::-webkit-calendar-picker-indicator]:invert-[0.9]"
                    />
                    <span className="text-slate-400 dark:text-steel-600 font-bold">/</span>
                    <input
                      type="date"
                      {...register('revision_date')}
                      disabled={isReadOnly || isLoading}
                      title={t('pfmea.corporate.revDate', 'Fecha de Revisión')}
                      className="text-[11px] font-semibold text-slate-800 dark:text-steel-200 bg-transparent border-none focus:outline-none w-1/2 disabled:opacity-60 [&::-webkit-calendar-picker-indicator]:invert-[0.6] dark:[&::-webkit-calendar-picker-indicator]:invert-[0.9]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <input
                      type="text"
                      {...register('pfmea_id_number')}
                      disabled={isReadOnly || isLoading}
                      placeholder={t('pfmea.corporate.placeholders.docIdPlaceholder', 'ID Documental')}
                      className="font-mono text-slate-700 dark:text-steel-300 bg-transparent border-none focus:outline-none truncate w-2/3 disabled:opacity-60 placeholder:text-slate-400"
                    />
                    <select
                      {...register('confidentiality_level')}
                      disabled={isReadOnly || isLoading}
                      className="text-[10px] font-bold text-slate-700 dark:text-steel-300 bg-slate-100 dark:bg-steel-800 rounded px-1.5 py-0.5 border border-slate-200 dark:border-steel-700 focus:outline-none disabled:opacity-60 cursor-pointer"
                    >
                      <option value="Internal">Internal</option>
                      <option value="Confidential">Confidential</option>
                      <option value="Public">Public</option>
                      <option value="Strictly Confidential">Restricted</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Multidisciplinary Team Members Quick Ribbon */}
              {header.team_members && header.team_members.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-steel-800/60 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-steel-400 flex items-center gap-1 shrink-0">
                      <Users size={12} className="text-emerald-500" />
                      {t('pfmea.header.coreTeam', 'Equipo Multidisciplinario')}:
                    </span>
                    {header.team_members.map((member) => (
                      <div
                        key={member.id || member.user_id}
                        className="inline-flex items-center gap-1.5 bg-white dark:bg-steel-900 border border-slate-200 dark:border-steel-700/80 rounded-md px-2 py-1 text-[11px] shadow-2xs shrink-0"
                      >
                        <span className="font-semibold text-slate-800 dark:text-steel-200">
                          {member.user_full_name || `Usuario #${member.user_id}`}
                        </span>
                        {member.role_in_team && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                            {member.role_in_team}
                          </span>
                        )}
                        {member.department && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                            {member.department}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTeamMemberModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline shrink-0 cursor-pointer"
                  >
                    {t('pfmea.header.manageTeam', 'Gestionar Equipo')} →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auxiliary Modals */}
      <ProductFamilyCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => {
          setIsCatalogModalOpen(false);
          loadProductFamilies();
        }}
      />
      <ProductionLineCatalogModal
        isOpen={isProductionLineCatalogModalOpen}
        onClose={() => {
          setIsProductionLineCatalogModalOpen(false);
          loadProductionLines();
        }}
      />
      <TeamMemberModal
        isOpen={isTeamMemberModalOpen}
        onClose={() => setIsTeamMemberModalOpen(false)}
        pfmeaId={header.id}
        teamMembers={header.team_members}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};
