import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Factory,
  Users,
  Hash,
  Clock,
  User,
  Shield,
  Globe2,
  Settings2,
  Box,
  LayoutTemplate
} from 'lucide-react';
import type { PfmeaHeader, PfmeaHeaderUpdate } from '../../api/pfmeaService';
import { ProductFamilyCatalogModal } from './ProductFamilyCatalogModal';
import { productFamilyService, type ProductFamily } from '../../api/productFamilyService';
import { ProductionLineCatalogModal } from './ProductionLineCatalogModal';
import { productionLineService, type ProductionLine } from '../../api/productionLineService';
import { TeamMemberModal } from './TeamMemberModal';
import { useAuth } from '../../context/AuthContext';

interface GlobalHeaderProps {
  header: PfmeaHeader;
  onUpdate?: (data: PfmeaHeaderUpdate) => void;
  onLocalChange?: (data: PfmeaHeaderUpdate, isDirty: boolean) => void;
  isLoading: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Draft: { bg: 'bg-alert-amber/15 border-alert-amber/30', text: 'text-alert-amber', dot: 'bg-alert-amber' },
  'In Review': { bg: 'bg-review-500/15 border-review-500/30', text: 'text-review-500', dot: 'bg-review-500' },
  Approved: { bg: 'bg-success-500/15 border-success-500/30', text: 'text-success-500', dot: 'bg-success-500' },
  Archived: { bg: 'bg-steel-500/15 border-steel-500/30', text: 'text-steel-400', dot: 'bg-steel-500' },
};

const DEPT_COLORS: Record<string, string> = {
  'Ingeniería': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Calidad': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Producción': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Logística': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Mantenimiento': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Dirección': 'bg-steel-500/10 text-steel-400 border-steel-500/20',
  'Otro': 'bg-steel-500/10 text-steel-400 border-steel-500/20'
};

const getDeptColor = (dept?: string) => DEPT_COLORS[dept || 'Otro'] || DEPT_COLORS['Otro'];

const schema = yup.object().shape({
  project_name: yup.string().required('Requerido'),
  customer: yup.string().required('Requerido'),
  original_launch_date: yup.string().nullable(),
  part_number: yup.string().nullable(),
  product_description: yup.string().nullable(),
  product_family_id: yup.number().nullable(),
  production_line_id: yup.number().nullable(),
  confidentiality_level: yup.string().nullable(),
  revision_date: yup.string().nullable(),
  version: yup.number().nullable(),
  pfmea_id_number: yup.string().nullable(),
  moc_status: yup.string().nullable(),
});

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ header, onUpdate, onLocalChange, isLoading }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAuxiliary, setShowAuxiliary] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [productFamilies, setProductFamilies] = useState<ProductFamily[]>([]);
  const [isProductionLineCatalogModalOpen, setIsProductionLineCatalogModalOpen] = useState(false);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const { user } = useAuth();
  const role = user?.role_name || '';

  const getAvailableStatuses = (): string[] => {
    const current = header.moc_status;
    const statuses: string[] = [current];

    if (current === 'Draft') {
      if (role === 'PFMEA Owner' || role === 'Administrator') {
        statuses.push('In Review');
      }
      if (role === 'Administrator') {
        statuses.push('Approved');
      }
    } else if (current === 'In Review') {
      if (role === 'Administrator') {
        statuses.push('Approved');
      }
    } else if (current === 'Approved') {
      if (role === 'Administrator') {
        statuses.push('Archived');
      }
    }

    return Array.from(new Set(statuses));
  };
  const availableStatuses = getAvailableStatuses();

  const loadProductFamilies = async () => {
    try {
      const data = await productFamilyService.list(true);
      setProductFamilies(data);
    } catch (error) {
      console.error("Failed to load product families", error);
    }
  };

  const loadProductionLines = async () => {
    try {
      const data = await productionLineService.list(true);
      setProductionLines(data);
    } catch (error) {
      console.error("Failed to load production lines", error);
    }
  };

  React.useEffect(() => {
    loadProductFamilies();
    loadProductionLines();
  }, []);

  const isReadOnly = header.moc_status === 'Approved' || header.moc_status === 'Archived';
  const statusStyle = STATUS_STYLES[header.moc_status] || STATUS_STYLES.Draft;

  const { register, watch, handleSubmit, formState: { errors, isDirty } } = useForm<PfmeaHeaderUpdate>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      project_name: header.project_name,
      customer: header.customer,
      original_launch_date: header.original_launch_date,
      part_number: header.part_number,
      product_description: header.product_description,
      product_family_id: header.product_family_id,
      production_line_id: header.production_line_id,
      confidentiality_level: header.confidentiality_level,
      revision_date: header.revision_date || header.created_at?.split('T')[0],
      version: header.version,
      pfmea_id_number: header.pfmea_id_number,
      moc_status: header.moc_status,
    },
  });

  const formData = watch();
  const formDataString = JSON.stringify(formData);
  React.useEffect(() => {
    if (onLocalChange) {
      onLocalChange(JSON.parse(formDataString) as PfmeaHeaderUpdate, isDirty);
    }
  }, [formDataString, isDirty, onLocalChange]);

  const onSubmit = (data: PfmeaHeaderUpdate) => {
    if (!isReadOnly && onUpdate) {
      onUpdate(data);
    }
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl mb-6">
      {/* Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-industrial hover:bg-steel-800/50 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forge-glow">
            <Factory size={18} className="text-forge-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-steel-100">
              {t('pfmea.header.title')}
            </h2>
            <p className="text-xs text-steel-400">
              {header.pfmea_id_number || 'Borrador'} — Versión {header.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isDirty && !isReadOnly && (
            <span className="text-[10px] text-forge-400 animate-pulse uppercase tracking-widest font-bold">
              {t('pfmea.header.unsavedChanges')}
            </span>
          )}
          {/* Status Badge */}
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            {header.moc_status}
          </span>

          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-steel-400" />
          </motion.div>
        </div>
      </button>

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
            <div className="border-t border-steel-700/50 px-6 pt-5 pb-6">
              {/* Paso 1 Highlight Header */}
              <div className="mb-6 px-4 py-3 bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                <div className="text-sm font-bold tracking-widest text-slate-700 dark:text-slate-400 uppercase">
                  {t('pfmea.worksheet.steps.step1')}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                  {t('pfmea.worksheet.steps.step1Desc')}
                </div>
              </div>

              <form id="header-form" className="space-y-5">
                {/* Row 1: Nombre de Parte & Número de Parte */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 flex flex-col gap-1.5 group">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-forge-400">
                      <Factory size={12} className="text-forge-400" />
                      {t('pfmea.header.description')}
                    </label>
                    <input
                      type="text"
                      {...register('project_name')}
                      disabled={isReadOnly || isLoading}
                      placeholder="Ej. Alfombras Audi LHD AU436"
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-100 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.project_name && <span className="text-xs text-red-400">{errors.project_name.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5 group">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-indigo-400">
                      <Hash size={12} className="text-indigo-400" />
                      {t('pfmea.header.partNumber')}
                    </label>
                    <input
                      type="text"
                      {...register('part_number')}
                      disabled
                      placeholder="Ej. PP1674201002"
                      className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 transition-all font-mono font-medium focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Row 2: Cliente & Planta */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 flex flex-col gap-1.5 group">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-sky-400">
                      <Users size={12} className="text-sky-400" />
                      {t('pfmea.header.customer')}
                    </label>
                    <input
                      type="text"
                      {...register('customer')}
                      disabled
                      placeholder="Ej. AUDI México"
                      className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 transition-all font-medium focus:outline-none cursor-not-allowed"
                    />
                    {errors.customer && <span className="text-xs text-red-400">{errors.customer.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Factory size={12} className="text-amber-400" />
                      {t('pfmea.header.plantRegion')}
                    </label>
                    <div className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-medium select-none flex items-center justify-between">
                      <span>Puebla Plant</span>
                      <span className="text-[10px] bg-steel-700/30 px-1.5 py-0.5 rounded font-mono text-steel-300">PUEBLA</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Fechas, Revisión y Estado */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <Clock size={12} className="text-emerald-400" />
                      {t('pfmea.header.creationDate')}
                    </label>
                    <input
                      type="date"
                      value={header.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]}
                      disabled
                      className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 font-medium cursor-not-allowed focus:outline-none [&::-webkit-calendar-picker-indicator]:invert-[0.8] [&::-webkit-calendar-picker-indicator]:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 group">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-purple-400">
                      <Clock size={12} className="text-purple-400" />
                      {t('pfmea.header.revisionDate')}
                    </label>
                    <input
                      type="date"
                      {...register('revision_date')}
                      disabled={isReadOnly || isLoading}
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-100 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 group">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-indigo-400">
                      <Hash size={12} className="text-indigo-400" />
                      {t('pfmea.header.revision')}
                    </label>
                    <input
                      type="number"
                      {...register('version')}
                      disabled
                      className="w-full bg-steel-950/20 dark:bg-steel-950/10 border border-steel-700/30 rounded-xl px-4 py-2.5 text-sm text-steel-400 transition-all font-mono font-medium focus:outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400">
                      <User size={12} className="text-forge-400" />
                      {t('pfmea.header.status')}
                    </label>
                    <select
                      {...register('moc_status')}
                      disabled={availableStatuses.length <= 1}
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-200 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {availableStatuses.includes('Draft') && <option value="Draft">Draft</option>}
                      {availableStatuses.includes('In Review') && <option value="In Review">In Review</option>}
                      {availableStatuses.includes('Approved') && <option value="Approved">Approved</option>}
                      {availableStatuses.includes('Archived') && <option value="Archived">Archived (Obsolete)</option>}
                    </select>
                  </div>
                </div>

                {/* Row 4: Portada & Confidencialidad */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-1 flex flex-col gap-1.5 group">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-sky-400">
                      <Globe2 size={12} className="text-sky-400" />
                      {t('pfmea.header.docCode')}
                    </label>
                    <input
                      type="text"
                      {...register('pfmea_id_number')}
                      disabled={isReadOnly || isLoading}
                      placeholder="Ej. FT-PFMEA-PUEBLA-001"
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-100 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-1 flex flex-col gap-1.5 group">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-steel-400 transition-colors group-focus-within:text-forge-400">
                      <Shield size={12} className="text-forge-400" />
                      {t('pfmea.header.confidentiality')}
                    </label>
                    <select
                      {...register('confidentiality_level')}
                      disabled={isReadOnly || isLoading}
                      className="w-full bg-steel-950/40 dark:bg-steel-950/30 border border-steel-700/50 hover:border-steel-600 focus:border-forge-500 rounded-xl px-4 py-2.5 text-sm text-steel-200 transition-all font-medium focus:outline-none focus:ring-1 focus:ring-forge-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Public">{t('pfmea.header.public')}</option>
                      <option value="Internal">{t('pfmea.header.internal')}</option>
                      <option value="Confidential">{t('pfmea.header.confidential')}</option>
                      <option value="Strictly Confidential">{t('pfmea.header.strictlyConfidential')}</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Core Team Section */}
              <div className="mt-6 border-t border-steel-700/30 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-steel-400 flex items-center gap-2">
                    <User size={14} className="text-forge-400" />
                    {t('pfmea.header.coreTeam')}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {header.team_members.map((member) => (
                    <div key={member.id} className="flex flex-col bg-steel-900/50 border border-steel-700/50 rounded-lg px-3 py-2 gap-1 min-w-[140px]">
                      <span className="text-sm text-steel-100 font-medium">{member.user_full_name || `Usuario #${member.user_id}`}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-steel-400 uppercase font-bold tracking-wider">{member.role_in_team}</span>
                        {member.department && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border ${getDeptColor(member.department)}`}>
                            {member.department}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {!isReadOnly && (
                    <button type="button" onClick={() => setIsTeamMemberModalOpen(true)} className="flex items-center justify-center bg-steel-800/30 border border-dashed border-steel-600/50 hover:bg-steel-800 hover:border-forge-500 text-steel-400 hover:text-forge-400 rounded-lg px-3 py-1.5 text-xs font-medium transition-all">
                      + {t('pfmea.header.addMember')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
        onSuccess={() => {
          // Trigger a re-fetch of the PFMEA by simulating an update or just letting the parent handle it
          // Wait, we need to refresh the team members. We can call onUpdate with nothing to trigger reload, or maybe reload via a prop?
          // Since onUpdate might send full data, if we just want a reload we can trigger a parent refresh.
          // For now, reloading the page or relying on the parent's polling/refetch might be needed.
          if (onLocalChange) {
            // A dirty hack to force re-render/fetch if the parent listens to it, or we could just reload.
            window.location.reload();
          } else {
            window.location.reload();
          }
        }}
      />
    </div>
  );
};
