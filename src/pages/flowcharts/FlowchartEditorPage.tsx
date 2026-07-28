import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FlowchartWorkspace } from '../../components/flowchart/FlowchartWorkspace';
import { ArchivedBanner } from '../../components/flowchart/ArchivedBanner';
import { ObsoleteWatermark } from '../../components/flowchart/ObsoleteWatermark';
import { DocumentHistoryDrawer } from '../../components/flowchart/DocumentHistoryDrawer';
import { useFlowchart } from '../../hooks/useFlowchart';
import { getFlowchartById } from '../../services/flowchartService';
import { listTechnologies } from '../../services/technologyService';
import type { FlowchartState } from '../../types/flowchart.types';

export const FlowchartEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { state, dispatch } = useFlowchart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [docStatus, setDocStatus] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No se proporcionó un ID de flowchart.');
      setLoading(false);
      return;
    }

    const flowchartId = Number(id);
    if (isNaN(flowchartId)) {
      setError(`ID "${id}" no es válido.`);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchFlowchart() {
      try {
        const [data, techs] = await Promise.all([
          getFlowchartById(flowchartId),
          listTechnologies({ limit: 100 }).catch((err) => {
            console.error('Failed to prefetch technologies', err);
            return [];
          }),
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
          header: {
            projectId: data.flowchart_code || String(data.id),
            plantCode: data.product?.plant_id === 1 ? 'PUEBLA' : 'PUEBLA',
            plantName: data.product?.plant_id === 1 ? 'Puebla Plant' : 'Puebla Plant',
            region: 'NAFTA',
            customer: data.product?.customer_name || '',
            partNumber: data.product?.part_number || '',
            partName: data.title || data.product?.description || '',
            diagramStatus: data.status ? (data.status.toLowerCase().replace(' ', '_') as 'draft' | 'in_review' | 'approved') : 'draft',
            lastModified: data.updated_at,
            modifiedBy: 'John Owner',
            creationDate: data.created_at ? data.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            revisionDate: data.updated_at ? data.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            revision: String(data.version || 1),
            coverPage: data.title,
            safetyCharacteristic: data.product?.customer?.safety_characteristic || 'D',
          },
          steps: data.steps.map((step) => {
            const opId = step.technology_id ? String(step.technology_id) : '';
            return {
              id: String(step.id),
              sequence: step.step_number,
              operationId: opId,
              operationName: opId ? (techMap.get(opId) || '') : '',
              machineryId: step.machinery_id ?? null,
              criticalFlag: (step.critical_flag as any) || 'none',
              symbolType: (step.symbol_type as any) || 'operation',
              responsibleDepartment: step.responsible_department || 'Producción',
              description: step.custom_description || undefined,
            };
          }),
          isDirty: false,
          lastSaved: data.updated_at,
          isSaving: false,
        };

        dispatch({ type: 'LOAD_STATE', payload: hydratedState });
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
  }, [id, dispatch]);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen"
    >
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

      {/* Top Bar Navigation */}
      <div className="bg-steel-950/80 backdrop-blur-md border-b border-steel-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/flowcharts')}
            className="p-2 text-steel-400 hover:text-white hover:bg-steel-800 rounded-lg transition-colors group"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-6 w-px bg-steel-800"></div>
          <div className="flex flex-col">
            <span className="text-xs text-steel-400 uppercase font-semibold tracking-wider">{t('pfmea.editor.docId', 'DOCUMENT ID')}</span>
            <span className="font-mono font-medium">{state.header?.projectId || id}</span>
          </div>
          {title && (
            <>
              <div className="h-6 w-px bg-steel-800"></div>
              <span className="text-steel-300 text-sm font-medium truncate max-w-xs">{title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isArchived ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm flex items-center gap-1.5">
              {t('archive.status.archived', 'ARCHIVADO')}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-500 text-amber-950 border-amber-600 shadow-sm">
              {t('pfmea.editor.inEdition', 'En Edición')}
            </span>
          )}
        </div>
      </div>

      {/* The Workspace */}
      <div className="flex-1 overflow-hidden relative">
        {/* Obsolete Watermark overlay */}
        {isArchived && <ObsoleteWatermark />}
        {/* Disable all interactions when archived */}
        <div className={isArchived ? 'pointer-events-none select-none' : ''}>
          <FlowchartWorkspace />
        </div>
      </div>
    </motion.div>
  );
};
