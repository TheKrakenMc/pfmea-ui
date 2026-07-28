// ─────────────────────────────────────────────────────────────
//  FloatingActions — FAB cluster for persistence controls
//  Bottom-right positioned with stagger entrance animation.
// ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Save, Check, Loader2, AlertCircle } from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import { useAutoSave } from '../../hooks/useAutoSave';
import { ExportFlowchartButton } from '../flowcharts/ExportFlowchartButton';
import { saveFlowchartSteps, updateFlowchart, type FlowchartStepPayload } from '../../services/flowchartService';
import { toast } from 'sonner';

export function FloatingActions() {
  const { t } = useTranslation();
  const { state, saveLocally, dispatch, flowchartId } = useFlowchart();
  const { isDirty } = useAutoSave();



  const handleSaveRemotely = async (forcedStatus?: string) => {
    if (flowchartId === null) return;
    
    // Auto-save local draft before pushing
    saveLocally();

    // Map local steps to the backend payload format
    const stepsPayload: FlowchartStepPayload[] = state.steps.map((step, index) => ({
      step_number: (index + 1) * 10,
      custom_description: step.description || step.operationName || null,
      technology_id: step.operationId ? Number(step.operationId) : null,
      machinery_id: step.machineryId ?? null,
      responsible_department: step.responsibleDepartment || 'Producción',
      symbol_type: step.symbolType || 'operation',
      critical_flag: step.criticalFlag || 'none',
    }));

    // Map local header to the backend update payload format
    let headerStatus = forcedStatus;
    if (!headerStatus) {
      if (state.header.diagramStatus === 'approved') headerStatus = 'Approved';
      else if (state.header.diagramStatus === 'in_review') headerStatus = 'In Review';
      else headerStatus = 'Draft';
    }
    const headerPayload = {
      title: state.header.partName || 'Sin título',
      status: headerStatus,
      customer_name: state.header.customer || '',
      part_number: state.header.partNumber || '',
      product_description: state.header.partName || '',
    };

    dispatch({ type: 'SET_SAVING', payload: { isSaving: true } });

    try {
      await Promise.all([
        saveFlowchartSteps(flowchartId, stepsPayload),
        updateFlowchart(flowchartId, headerPayload)
      ]);
      
      dispatch({
        type: 'MARK_SAVED',
        payload: { timestamp: new Date().toISOString() },
      });
      toast.success(t('actions.successSave', 'Cambios guardados exitosamente'));
    } catch (err) {
      console.error('Remote save failed:', err);
      dispatch({ type: 'SET_SAVING', payload: { isSaving: false } });
      toast.error(t('actions.errorSave', 'Error al guardar los cambios en la base de datos'));
    }
  };

  return (
    <motion.div
      className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {/* Unsaved Changes Indicator */}
      {isDirty && (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="flex items-center gap-2 rounded-full border border-alert-amber/30 bg-alert-amber/10 px-4 py-1.5 text-xs backdrop-blur-md shadow-lg"
        >
          <AlertCircle size={14} className="text-alert-amber" />
          <span className="text-alert-amber font-medium">{t('actions.unsavedChanges', 'Cambios sin guardar en base de datos')}</span>
        </motion.div>
      )}

      {/* Export PDF Button */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.9 },
          visible: { opacity: 1, y: 0, scale: 1 },
        }}
      >
        <ExportFlowchartButton />
      </motion.div>



      {/* Save Button */}
      <motion.button
        type="button"
        onClick={() => handleSaveRemotely()}
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.9 },
          visible: { opacity: 1, y: 0, scale: 1 },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!isDirty && !state.isSaving}
        className="group flex items-center gap-2.5 rounded-2xl bg-forge-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-forge-600/25 transition-industrial hover:bg-forge-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        {state.isSaving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : !isDirty && state.lastSaved ? (
          <Check size={18} />
        ) : (
          <Save size={18} />
        )}
        <span>
          {state.isSaving
            ? t('actions.saving')
            : !isDirty && state.lastSaved
              ? t('actions.saved')
              : t('actions.save')}
        </span>
      </motion.button>
    </motion.div>
  );
}
