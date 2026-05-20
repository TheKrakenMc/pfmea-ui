// ─────────────────────────────────────────────────────────────
//  OperationSelect — Searchable catalog dropdown
//  Groups operations by category with filter support.
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, X } from 'lucide-react';
import { PLANT_OPERATIONS } from '../../data/mockData';
import type { PlantOperation, OperationCategory } from '../../types/flowchart.types';

interface OperationSelectProps {
  value: string;            // operationId
  displayValue: string;     // operationName for display
  onChange: (op: PlantOperation) => void;
}

export function OperationSelect({ value, displayValue, onChange }: OperationSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Group operations by category and filter
  const grouped = useMemo<OperationCategory[]>(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = PLANT_OPERATIONS.filter(
      (op) =>
        op.name.toLowerCase().includes(lowerSearch) ||
        op.code.toLowerCase().includes(lowerSearch)
    );

    const categoryMap = new Map<string, PlantOperation[]>();
    for (const op of filtered) {
      const list = categoryMap.get(op.category) || [];
      list.push(op);
      categoryMap.set(op.category, list);
    }

    return Array.from(categoryMap.entries()).map(([category, operations]) => ({
      category,
      operations,
    }));
  }, [search]);

  const handleSelect = (op: PlantOperation) => {
    onChange(op);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="focus-ring flex w-full items-center justify-between gap-2 rounded-lg border border-steel-600 bg-steel-800 px-3 py-2 text-left text-sm transition-industrial hover:border-forge-500/50 cursor-pointer"
      >
        <span className={value ? 'text-steel-100' : 'text-steel-400'}>
          {value ? displayValue : t('operations.searchPlaceholder')}
        </span>
        <ChevronDown
          size={14}
          className={`text-steel-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 z-50 mt-1 w-72 overflow-hidden rounded-xl border border-steel-600 bg-steel-850 shadow-2xl"
          >
            {/* Search Bar */}
            <div className="flex items-center gap-2 border-b border-steel-700 px-3 py-2">
              <Search size={14} className="text-steel-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('operations.searchPlaceholder')}
                className="flex-1 bg-transparent text-sm text-steel-100 placeholder-steel-500 outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-steel-400 hover:text-steel-200 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto py-1">
              {grouped.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-steel-500">
                  {t('operations.noResults')}
                </div>
              ) : (
                grouped.map(({ category, operations }) => (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-steel-400">
                      {t(`operations.categories.${category}`)}
                    </div>

                    {/* Items */}
                    {operations.map((op) => (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => handleSelect(op)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-industrial hover:bg-forge-500/10 cursor-pointer ${
                          op.id === value
                            ? 'bg-forge-500/10 text-forge-400'
                            : 'text-steel-200'
                        }`}
                      >
                        <span className="w-16 shrink-0 rounded bg-steel-700/50 px-1.5 py-0.5 text-center text-[10px] font-mono text-steel-400">
                          {op.code}
                        </span>
                        <span>{op.name}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
