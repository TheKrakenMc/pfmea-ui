import {listPlants} from '../../services/plantService';
import {useAuth} from '../../hooks/useAuth';
import { draftKey, loadDraft, discardDraft, type Draft } from '../../services/drafts';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FlowchartWorkspace } from '../../components/flowchart/FlowchartWorkspace';
import { ArchivedBanner } from '../../components/flowchart/ArchivedBanner';
import { ObsoleteWatermark } from '../../components/flowchart/ObsoleteWatermark';
import { DocumentHistoryDrawer } from '../../components/flowchart/DocumentHistoryDrawer';
import { ExportFlowchartButton } from '../../components/flowcharts/ExportFlowchartButton';
import { useFlowchart } from '../../hooks/useFlowchart';
import { getFlowchartById } from '../../services/flowchartService';
import { listTechnologies } from '../../services/technologyService';
import type { FlowchartState, CriticalFlag, SymbolType } from '../../types/flowchart.types';

export const FlowchartEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { state, dispatch } = useFlowchart();
  const { user } = useAuth();
  const [pendingDraft, setPendingDraft] = useState<Draft<FlowchartState> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [docStatus, setDocStatus] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const flowchartId = Number(id);
    let cancelled = false;

    async function fetchFlowchart() {
      try {
        if (!id || !Number.isInteger(flowchartId) || flowchartId<=0) throw new Error("ID inválido");
        const [data, techs, plants] = await Promise.all([
          getFlowchartById(flowchartId),
          listTechnologies({ limit: 100 }).catch((err) => {
            console.error('Failed to prefetch technologies', err);
            return [];
          }),
          listPlants(),
        ]);
        if (cancelled) return;

        setTitle(data.title);
        setDocStatus(data.status || '');

        // Build a map of technology ID string -> name
        const techMap = new Map<string, string>();
        for (const t of techs) {
          techMap.set(String(t.id), t.name);
        }

        // Map backend data to FlowchartState and hydrate context
        const hydratedState: FlowchartState = {
          flowchartId: data.id,
          lockVersion: data.lock_version,
          header: {
            projectId: data.flowchart_code || String(data.id),
            plantCode: plants.find(p=>p.id===data.plant_id)?.code || '',
            plantName: plants.find(p=>p.id===data.plant_id)?.name || '',
            region: 'NAFTA',
            customer: data.product?.customer_name || '',
            partNumber: data.product?.part_number || '',
            partName: data.title || data.product?.description || '',
            diagramStatus: data.status ? (data.status.toLowerCase().replace(' ', '_') as 'draft' | 'in_review' | 'approved') : 'draft',
            lastModified: data.updated_at,
            modifiedBy: user?.full_name || '',
            creationDate: data.created_at ? data.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            revisionDate: data.updated_at ? data.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            revision: String(data.version || 1),
            coverPage: data.flowchart_code || '',
            safetyCharacteristic: data.product?.customer?.safety_characteristic || 'D',
          },
          steps: data.steps.map((step) => {
            const opId = step.technology_id ? String(step.technology_id) : '';
            return {
              id: String(step.id),
              sequence: step.step_number,
              subStep: step.sub_step || 0,
              operationId: opId,
              operationName: opId ? (techMap.get(opId) || '') : '',
              machineryId: step.machinery_id ?? null,
              criticalFlag: (step.critical_flag as CriticalFlag) || 'none',
              symbolType: (step.symbol_type as SymbolType) || 'operation',
              responsibleDepartment: step.responsible_department || 'Producción',
              description: step.custom_description || undefined,
              productCharacteristics: step.product_characteristics || '',
              processCharacteristics: step.process_characteristics || '',
              target: step.target || '',
            };
          }),
          isDirty: false,
          lastSaved: data.updated_at,
          isSaving: false,
        };

        dispatch({ type: 'LOAD_STATE', payload: hydratedState });
        if (user) setPendingDraft(loadDraft<FlowchartState>(draftKey(user.id,user.plant_id,"flowchart",data.id)));
        setLoading(false);
      } catch (err: unknown) {
        if (cancelled) return;
        // 401/403 handled by interceptor — only handle 404 and others
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setError(`Diagrama de flujo con ID ${id} no encontrado.`);
        } else {
          setError('Error al cargar el diagrama de flujo. Intenta de nuevo.');
        }
        setLoading(false);
      }
    }

    fetchFlowchart();
    return () => { cancelled = true; };
  }, [id, dispatch, user]);

  // ─── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-steel-400 text-sm">{t('common.loading', 'Cargando diagrama de flujo...')}</p>
      </motion.div>
    );
  }

  // ─── Error State ───────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Documento no encontrado</h2>
        <p className="text-steel-400 max-w-md mb-8">{error}</p>
        <button
          onClick={() => navigate('/flowcharts')}
          className="flex items-center gap-2 bg-steel-800 hover:bg-steel-700 text-white px-6 py-2.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Dashboard
        </button>
      </motion.div>
    );
  }

  const isArchived = docStatus?.toLowerCase() === 'archived';
  const isReadOnly=isArchived || docStatus?.toLowerCase()==='approved' || user?.role_name==='Viewer';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-steel-950"
    >
      {pendingDraft && user && id && <div className="p-4 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-100" role="status">
        Existe un borrador local sin guardar en el servidor.
        <button className="mx-3 underline" onClick={() => { dispatch({type:'LOAD_STATE',payload:pendingDraft.data}); dispatch({type:'MARK_DIRTY'}); setPendingDraft(null); }}>Recuperar borrador</button>
        <button className="underline" onClick={() => { discardDraft(draftKey(user.id,user.plant_id,'flowchart',Number(id))); setPendingDraft(null); }}>Descartar borrador</button>
      </div>}
      {/* Archived Document Banner */}
      {isArchived && (
        <ArchivedBanner
          onViewHistory={() => setIsHistoryOpen(true)}
        />
      )}

      {/* History Drawer */}
      {id && (
        <DocumentHistoryDrawer
          flowchartId={Number(id)}
          flowchartTitle={title || `Flowchart #${id}`}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {/* The Workspace Container */}
      <div className="flex-1 flex flex-col p-6 pt-4 gap-5">
        {/* Unified Document Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-steel-900/90 border border-slate-200 dark:border-steel-700/60 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-md">
          {/* Left: Document Metadata & Back Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/flowcharts')}
              className="p-1.5 text-slate-500 dark:text-steel-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-steel-800 rounded-lg transition-colors group cursor-pointer"
              title={t('common.back', 'Volver')}
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-steel-700/60" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 dark:text-steel-400 uppercase font-semibold tracking-wider leading-none">
                {t('pfmea.editor.docId', 'DOCUMENT ID')}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-steel-100 leading-tight mt-0.5">
                {state.header?.projectId || id}
              </span>
            </div>

            {title && (
              <>
                <div className="h-5 w-px bg-slate-200 dark:bg-steel-700/60" />
                <span className="text-xs font-medium text-slate-700 dark:text-steel-300 truncate max-w-[180px] lg:max-w-xs" title={title}>
                  {title}
                </span>
              </>
            )}
          </div>

          {/* Right: Export PDF Action & Status Badges */}
          <div className="flex items-center gap-2.5">
            <ExportFlowchartButton
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-steel-800 text-slate-800 dark:text-steel-100 hover:bg-slate-200 dark:hover:bg-steel-700 border border-slate-200 dark:border-steel-700/60 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {isArchived ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-xs flex items-center gap-1.5">
                {t('archive.status.archived', 'ARCHIVADO')}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-500 text-amber-950 border-amber-600 shadow-xs">
                {isReadOnly ? t('common.readOnly','Sólo lectura') : t('pfmea.editor.inEdition', 'En Edición')}
              </span>
            )}
          </div>
        </div>

        {/* The Workspace Area */}
        <div className="flex-1 relative">
          {/* Obsolete Watermark overlay */}
          {isArchived && <ObsoleteWatermark />}
          {/* Disable all interactions when archived */}
          <fieldset disabled={isReadOnly} className={isReadOnly ? 'pointer-events-none min-w-0' : 'min-w-0'}>
            <FlowchartWorkspace />
          </fieldset>
        </div>
      </div>
    </motion.div>
  );
};
