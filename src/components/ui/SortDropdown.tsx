import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ options, value, onChange }) => {
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

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-steel-950 border-steel-700 text-steel-300 hover:bg-steel-900 hover:text-steel-100 text-sm transition-colors cursor-pointer"
        title={t('common.sortBy', 'Ordenar por')}
      >
        <ArrowUpDown size={14} className="text-steel-400" />
        <span className="font-medium whitespace-nowrap hidden sm:inline-block">
          {selectedOption?.label}
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
            className="absolute top-full right-0 mt-2 w-48 bg-steel-900 border border-steel-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="py-1.5">
              {options.map(option => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-steel-800 transition-colors cursor-pointer group"
                  >
                    <span className={`${isSelected ? 'text-indigo-400 font-medium' : 'text-steel-200 group-hover:text-white'}`}>
                      {option.label}
                    </span>
                    {isSelected && <Check size={14} className="text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
