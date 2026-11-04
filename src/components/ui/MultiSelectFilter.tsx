import type { ElementType } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Disclosure } from './Disclosure';
import { badgeVariants } from '../../utils/motion';

export interface FilterOption {
  value: string;
  label: string;
}

export function MultiSelectFilter({
  label,
  icon: Icon = Filter,
  options,
  selectedValues,
  onChange,
}: {
  label: string;
  icon?: ElementType;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) {
  const { t } = useTranslation('workspace');
  const count = selectedValues.length;

  return (
    <Disclosure
      active={count > 0}
      label={
        <>
          <Icon size={16} />
          <span>{label}</span>
          <AnimatePresence mode="popLayout">
            {count > 0 && (
              <motion.span
                key="count-badge"
                className="ui-count"
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </>
      }
    >
      <fieldset className="workspace-filter-options">
        <legend className="sr-only">{label}</legend>
        {!options.length && <p>{t('noOptions')}</p>}
        {options.map(option => {
          const isChecked = selectedValues.includes(option.value);
          return (
            <label key={option.value} data-checked={isChecked || undefined}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={event =>
                  onChange(
                    event.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(value => value !== option.value),
                  )
                }
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </fieldset>
    </Disclosure>
  );
}
