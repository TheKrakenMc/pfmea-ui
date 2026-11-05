import {listPlants} from '../../services/plantService';
import {useAuth} from '../../hooks/useAuth';
import { draftKey, loadDraft, discardDraft, type Draft } from '../../services/drafts';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Loader2, Copy, ArrowDownCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FlowchartWorkspace } from '../../components/flowchart/FlowchartWorkspace';
import { ArchivedBanner } from '../../components/flowchart/ArchivedBanner';
import { DraftRecoveryBanner } from '../../components/flowchart/DraftRecoveryBanner';
import { ObsoleteWatermark } from '../../components/flowchart/ObsoleteWatermark';
import { DocumentHistoryDrawer } from '../../components/flowchart/DocumentHistoryDrawer';
import { ExportFlowchartButton } from '../../components/flowcharts/ExportFlowchartButton';
import { CloneFlowchartModal } from '../../components/flowchart/CloneFlowchartModal';
import { CopyStepsModal } from '../../components/flowchart/CopyStepsModal';
import { useFlowchart } from '../../hooks/useFlowchart';
import { getFlowchartById, type FlowchartRead } from '../../services/flowchartService';
import { listTechnologies } from '../../services/technologyService';
import type { FlowchartState, CriticalFlag, SymbolType } from '../../types/flowchart.types';

export const FlowchartEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { state, dispatch } = useFlowchart();
  const { user } = useAuth();
  const [pendingDraft, setPendingDraft] = useState<Draft<FlowchartState> | null>(null);
  const serverLockVersionRef = useRef<number>(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [docStatus, setDocStatus] = useState<string>('');
  const [docData, setDocData] = useState<FlowchartRead | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isCopyStepsModalOpen, setIsCopyStepsModalOpen] = useState(false);
  const techMapRef = useRef<Map<string, string>>(new Map());

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
        setDocData(data);
        serverLockVersionRef.current = data.lock_version;

        // Build a map of technology ID string -> name
        const techMap = new Map<string, string>();
        for (const t of techs) {
          techMap.set(String(t.id), t.name);
        }
        techMapRef.current = techMap;

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

  const handleStepsCopied = (updatedDoc: FlowchartRead) => {
    if (user && id) {
      discardDraft(draftKey(user.id, user.plant_id, 'flowchart', Number(id)));
    }
    serverLockVersionRef.current = updatedDoc.lock_version;
    setDocData(updatedDoc);
    const mappedSteps = updatedDoc.steps.map((step) => {
      const opId = step.technology_id ? String(step.technology_id) : '';
      return {
        id: String(step.id),
        sequence: step.step_number,
        subStep: step.sub_step || 0,
        operationId: opId,
        operationName: opId ? (techMapRef.current.get(opId) || '') : '',
        machineryId: step.machinery_id ?? null,
        criticalFlag: (step.critical_flag as CriticalFlag) || 'none',
        symbolType: (step.symbol_type as SymbolType) || 'operation',
        responsibleDepartment: step.responsible_department || 'Producción',
        description: step.custom_description || undefined,
        productCharacteristics: step.product_characteristics || '',
        processCharacteristics: step.process_characteristics || '',
        target: step.target || '',
      };
    });
    dispatch({
      type: 'LOAD_STATE',
      payload: {
        ...state,
        lockVersion: updatedDoc.lock_version,
        steps: mappedSteps,
        isDirty: false,
        lastSaved: updatedDoc.updated_at,
      },
    });
  };

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

  const isAdmin = user?.role_name?.toLowerCase() === 'administrator' || user?.role_name?.toLowerCase() === 'admin';
  const isArchived = docStatus?.toLowerCase() === 'archived';
  const isApproved = docStatus?.toLowerCase() === 'approved';
  const isReadOnly = (!isAdmin && (isArchived || isApproved)) || user?.role_name === 'Viewer';

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50 dark:bg-steel-950">
      {/* Local Draft Recovery Banner */}
      <AnimatePresence>
        {pendingDraft && user && id && (
          <DraftRecoveryBanner
            savedAt={pendingDraft.savedAt}
            onRestore={() => {
              dispatch({
                type: 'LOAD_STATE',
                payload: {
                  ...pendingDraft.data,
                  flowchartId: Number(id),
                  lockVersion: serverLockVersionRef.current || pendingDraft.data.lockVersion || state.lockVersion || 1,
                },
              });
              dispatch({ type: 'MARK_DIRTY' });
              setPendingDraft(null);
            }}
            onDiscard={() => {
              discardDraft(draftKey(user.id, user.plant_id, 'flowchart', Number(id)));
              setPendingDraft(null);
            }}
          />
        )}
      </AnimatePresence>
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

      {/* Clone Flowchart Modal */}
      {docData && (
        <CloneFlowchartModal
          sourceFlowchart={docData}
          isOpen={isCloneModalOpen}
          onClose={() => setIsCloneModalOpen(false)}
          onSuccess={(cloned) => {
            navigate(`/flowcharts/${cloned.id}`);
          }}
        />
      )}

      {/* Copy Steps Modal */}
      {id && (
        <CopyStepsModal
          targetFlowchartId={Number(id)}
          targetFlowchartTitle={title}
          isOpen={isCopyStepsModalOpen}
          onClose={() => setIsCopyStepsModalOpen(false)}
          onSuccess={handleStepsCopied}
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

          {/* Right: Export PDF Action, Clone / Copy Steps & Status Badges */}
          <div className="flex items-center gap-2.5">
            {/* Copy Steps from another product */}
            <button
              type="button"
              onClick={() => setIsCopyStepsModalOpen(true)}
              disabled={isReadOnly}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('flowchart.copyStepsTooltip', 'Copiar pasos desde otro producto o diagrama')}
            >
              <ArrowDownCircle size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>{t('flowchart.copySteps', 'Copiar Pasos')}</span>
            </button>

            {/* Clone this diagram to another product */}
            {docData && (
              <button
                type="button"
                onClick={() => setIsCloneModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-steel-800 text-slate-700 dark:text-steel-200 hover:bg-slate-50 dark:hover:bg-steel-750 border border-slate-200 dark:border-steel-700/60 shadow-2xs transition-all cursor-pointer"
                title={t('flowchart.cloneTooltip', 'Clonar este diagrama para otro producto')}
              >
                <Copy size={14} className="text-blue-600 dark:text-blue-400" />
                <span>{t('flowchart.clone', 'Clonar')}</span>
              </button>
            )}

            <ExportFlowchartButton
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-steel-800 text-slate-800 dark:text-steel-100 hover:bg-slate-200 dark:hover:bg-steel-700 border border-slate-200 dark:border-steel-700/60 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {isArchived ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-xs flex items-center gap-1.5">
                {t('archive.status.archived', 'ARCHIVADO')}
              </span>
            ) : isApproved ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-xs">
                {t('common.approved', 'Aprobado')}
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
    </div>
  );
};
