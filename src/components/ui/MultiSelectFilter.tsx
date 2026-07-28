import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FilterOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  label: string;
  icon?: React.ElementType;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  label,
  icon: Icon = Filter,
  options,
  selectedValues,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const hasSelection = selectedValues.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
          hasSelection 
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
            : 'bg-steel-950 border-steel-700 text-steel-300 hover:bg-steel-900 hover:text-steel-100'
        }`}
      >
        <Icon size={14} className={hasSelection ? 'text-indigo-400' : 'text-steel-400'} />
        <span className="font-medium whitespace-nowrap">
          {label} {hasSelection && `(${selectedValues.length})`}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-56 bg-steel-900 border border-steel-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-steel-500 text-center">
                  {t('common.noOptions', 'Sin opciones')}
                </div>
              ) : (
                options.map(option => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-lg hover:bg-steel-800 transition-colors cursor-pointer group"
                    >
                      <span className={`truncate mr-2 ${isSelected ? 'text-indigo-400 font-medium' : 'text-steel-200 group-hover:text-white'}`}>
                        {option.label}
                      </span>
                      {isSelected && <Check size={14} className="text-indigo-400 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
            {options.length > 0 && hasSelection && (
              <div className="px-1.5 pb-1.5 pt-1 border-t border-steel-800/80">
                <button
                  onClick={() => {
                    onChange([]);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-medium text-steel-400 hover:text-white hover:bg-steel-800 rounded-lg transition-colors cursor-pointer text-center mt-1"
                >
                  {t('common.clear', 'Limpiar')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
