import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { badgeVariants } from '../../utils/motion';

export function FilterBar({
  children,
  onReset,
  hasActiveFilters,
}: {
  children: ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}) {
  const { t } = useTranslation('workspace');
  return (
    <div className="workspace-filter-bar">
      {children}
      <AnimatePresence>
        {onReset && hasActiveFilters && (
          <motion.button
            type="button"
            className="ui-button ui-button-quiet"
            onClick={onReset}
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <RotateCcw size={15} />
            <span>{t('reset')}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
