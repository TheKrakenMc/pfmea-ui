import {useAuth} from '../../hooks/useAuth';
import { draftKey, discardDraft } from '../../services/drafts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Save, Check, Loader2, AlertCircle } from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import { useAutoSave } from '../../hooks/useAutoSave';
import { saveFlowchartDocument, type FlowchartStepPayload } from '../../services/flowchartService';
import { toast } from 'sonner';

export function FloatingActions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { state, saveLocally, dispatch, flowchartId } = useFlowchart();
  const { isDirty } = useAutoSave();

  const handleSaveRemotely = async (forcedStatus?: string) => {
    if (flowchartId === null) return;

    // Validation: Check master operations with '@' flag that require at least one CC/SC in sub-steps
    const invalidMasters = state.steps.filter((master) => {
      const isMaster = !master.subStep || master.subStep === 0;
      if (!isMaster) return false;

      const hasSubSteps = state.steps.some(
        (s) => s.sequence === master.sequence && s.subStep > 0
      );
      if (!hasSubSteps) return false;

      const isFlaggedAt =
        master.criticalFlag === '@' ||
        master.criticalFlag === 'CC' ||
        master.criticalFlag === 'SC';
      if (!isFlaggedAt) return false;

      const hasSubCritical = state.steps.some(
        (s) =>
          s.sequence === master.sequence &&
          s.subStep > 0 &&
          (s.criticalFlag === 'CC' || s.criticalFlag === 'SC')
      );

      return !hasSubCritical;
    });

    if (invalidMasters.length > 0) {
      const seqs = invalidMasters.map((m) => `Paso ${m.sequence}`).join(', ');
      toast.error(
        t(
          'validation.missingSubCritical',
          `Atención: ${seqs} tiene la bandera @ activa pero requiere indicar al menos una característica SC o CC en alguna operación intermedia.`
        )
      );
      return;
    }

    // Auto-save local draft before pushing
    saveLocally();

    // Map local steps to the backend payload format
    const stepsPayload: FlowchartStepPayload[] = state.steps.map((step) => ({
      id: Number.isInteger(Number(step.id)) && Number(step.id)>0 ? Number(step.id) : undefined,
      step_number: step.sequence,
      sub_step: step.subStep || 0,
      custom_description: step.description || step.operationName || null,
      technology_id: step.operationId ? Number(step.operationId) : null,
      machinery_id: step.machineryId ?? null,
      responsible_department: step.responsibleDepartment || 'Producción',
      symbol_type: step.symbolType || 'operation',
      critical_flag: step.criticalFlag || 'none',
      product_characteristics: step.productCharacteristics || null,
      process_characteristics: step.processCharacteristics || null,
      target: step.target || null,
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
      flowchart_code: state.header.projectId || '',
    };

    dispatch({ type: 'SET_SAVING', payload: { isSaving: true } });

    try {
      const saved = await saveFlowchartDocument(flowchartId, state.lockVersion || 1, headerPayload, stepsPayload);
      const steps = state.steps.map((step,index)=>({...step,id:String(saved.steps[index]?.id || step.id)}));
      dispatch({ type:'LOAD_STATE',payload:{...state,steps,lockVersion:saved.lock_version,isDirty:false,isSaving:false,lastSaved:saved.updated_at} });
      if(user) discardDraft(draftKey(user.id,user.plant_id,'flowchart',flowchartId));
      toast.success(t('actions.successSave', 'Cambios guardados exitosamente'));
    } catch (err) {
      console.error('Remote save failed:', err);
      dispatch({ type: 'SET_SAVING', payload: { isSaving: false } });
      toast.error(t('actions.errorSave', 'Error al guardar los cambios en la base de datos'));
    }
  };

  return (
    <motion.div
      className="fixed right-8 bottom-8 z-50 flex flex-col items-end gap-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {/* Unsaved Changes Indicator */}
      {isDirty && (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          className="flex items-center gap-2 rounded-full border border-amber-300 dark:border-amber-600/40 bg-amber-100/95 dark:bg-amber-950/90 px-4 py-1.5 text-xs backdrop-blur-md shadow-lg"
        >
          <AlertCircle size={14} className="text-amber-700 dark:text-amber-400" />
          <span className="text-amber-800 dark:text-amber-300 font-semibold">
            {t('actions.unsavedChanges', 'Cambios sin guardar en base de datos')}
          </span>
        </motion.div>
      )}

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
        disabled={state.isSaving || !isDirty || user?.role_name === 'Viewer' || ['approved','archived'].includes(state.header.diagramStatus)}
        className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/25 transition-all disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
            ? t('actions.saving', 'Guardando...')
            : !isDirty && state.lastSaved
              ? t('actions.saved', 'Guardado')
              : t('actions.save', 'Guardar Cambios')}
        </span>
      </motion.button>
    </motion.div>
  );
}
