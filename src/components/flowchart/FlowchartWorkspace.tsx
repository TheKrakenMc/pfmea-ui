import { motion } from 'framer-motion';
import { FlowchartHeader } from './FlowchartHeader';
import { FlowchartTable } from './FlowchartTable';
import { FloatingActions } from './FloatingActions';

export function FlowchartWorkspace() {
  return (
    <div className="flex flex-col w-full min-h-full pb-32 gap-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <FlowchartHeader />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.08 }}
      >
        <FlowchartTable />
      </motion.div>

      {/* Floating Actions */}
      <FloatingActions />
    </div>
  );
}
