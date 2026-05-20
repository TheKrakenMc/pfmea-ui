// ─────────────────────────────────────────────────────────────
//  FlowchartWorkspace — Root orchestrator component
//  Composes Header, Table, FABs with language switcher.
// ─────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard } from 'lucide-react';
import { FlowchartHeader } from './FlowchartHeader';
import { FlowchartTable } from './FlowchartTable';
import { FloatingActions } from './FloatingActions';

export function FlowchartWorkspace() {
  const { t } = useTranslation();

  return (
    <div className="bg-grid-pattern relative flex min-h-screen flex-col">
      {/* ─── Main Content ───────────────────────────── */}
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-5 px-6 py-6 pb-28">
        
        {/* Discreet Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-steel-500 dark:text-steel-300">
          <LayoutDashboard size={14} className="text-steel-400 dark:text-steel-300" />
          <span className="font-medium text-steel-400 dark:text-steel-300">{t('app.title')}</span>
          <span className="text-steel-600 dark:text-steel-500">/</span>
          <span>{t('app.breadcrumb')}</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <FlowchartHeader />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
          <FlowchartTable />
        </motion.div>
      </main>

      {/* ─── Floating Action Buttons ────────────────── */}
      <FloatingActions />
    </div>
  );
}
