// ─────────────────────────────────────────────────────────────
//  FloatingActions — FAB cluster for persistence controls
//  Bottom-right positioned with stagger entrance animation.
// ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Save, Upload, Check, Loader2 } from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import { useAutoSave } from '../../hooks/useAutoSave';

export function FloatingActions() {
  const { t } = useTranslation();
  const { state, saveLocally, dispatch } = useFlowchart();
  const { isDirty, lastSaved } = useAutoSave();

  const handlePublish = () => {
    dispatch({ type: 'SET_STATUS', payload: { status: 'approved' } });
    saveLocally();
  };

  const formatLastSaved = (iso: string | null): string => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
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
      {/* Sync Status Indicator */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        className="flex items-center gap-2 rounded-full border border-steel-700 bg-steel-850/90 px-4 py-1.5 text-xs backdrop-blur-md"
      >
        {isDirty ? (
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-alert-amber animate-pulse-glow" />
            <span className="text-alert-amber">{t('actions.pending')}</span>
          </>
        ) : (
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-success-500" />
            <span className="text-success-400">
              {t('actions.synced')}
              {lastSaved && (
                <span className="ml-1 text-steel-400">
                  {formatLastSaved(lastSaved)}
                </span>
              )}
            </span>
          </>
        )}
      </motion.div>

      {/* Publish / Approve Button */}
      <motion.button
        type="button"
        onClick={handlePublish}
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.9 },
          visible: { opacity: 1, y: 0, scale: 1 },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={state.header.diagramStatus === 'approved'}
        className="group flex items-center gap-2.5 rounded-2xl border border-steel-600 bg-steel-800/90 px-5 py-3 text-sm font-medium text-steel-200 shadow-xl backdrop-blur-md transition-industrial hover:border-forge-500/40 hover:text-forge-400 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <Upload size={18} />
        <span>{t('actions.publish')}</span>
      </motion.button>

      {/* Save Locally Button */}
      <motion.button
        type="button"
        onClick={saveLocally}
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
