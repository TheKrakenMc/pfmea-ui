import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FlowchartWorkspace } from '../../components/flowchart/FlowchartWorkspace';
import { useFlowchart } from '../../hooks/useFlowchart';
import { getFlowchartById } from '../../services/flowchartService';
import type { FlowchartState } from '../../types/flowchart.types';

export const FlowchartEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dispatch } = useFlowchart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');

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
        const data = await getFlowchartById(flowchartId);
        if (cancelled) return;

        setTitle(data.title);

        // Map backend data to FlowchartState and hydrate context
        const hydratedState: FlowchartState = {
          flowchartId: data.id,
          header: {
            projectId: String(data.id),
            plantCode: '',
            plantName: '',
            region: '',
            customer: '',
            partNumber: '',
            partName: data.title,
            diagramStatus: (data.status?.toLowerCase() as 'draft' | 'in_review' | 'approved') || 'draft',
            lastModified: data.updated_at,
            modifiedBy: '',
          },
          steps: data.steps.map((step) => ({
            id: String(step.id),
            sequence: step.step_number,
            operationId: step.technology_id ? String(step.technology_id) : '',
            operationName: '',
            description: step.custom_description || '',
            criticalFlag: 'none' as const,
            symbolType: 'operation' as const,
            notes: '',
          })),
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen"
    >
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
            <span className="text-xs text-steel-400 uppercase font-semibold tracking-wider">ID Documento</span>
            <span className="text-white font-mono font-medium">{id}</span>
          </div>
          {title && (
            <>
              <div className="h-6 w-px bg-steel-800"></div>
              <span className="text-steel-300 text-sm font-medium truncate max-w-xs">{title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
           <span className="px-3 py-1 rounded-full text-xs font-medium border bg-amber-500/20 text-amber-300 border-amber-500/50">
             En Edición
           </span>
        </div>
      </div>

      {/* The Workspace */}
      <div className="flex-1 overflow-hidden relative">
        <FlowchartWorkspace />
      </div>
    </motion.div>
  );
};
