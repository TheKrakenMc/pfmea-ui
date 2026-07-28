// ─────────────────────────────────────────────────────────────
//  OperationSelect — Searchable catalog dropdown
//  Groups operations by category with filter support.
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, X } from 'lucide-react';
import { useFlowchartLookups } from '../../hooks/useFlowchartLookups';
import type { PlantOperation, OperationCategory } from '../../types/flowchart.types';

interface OperationSelectProps {
  value: string;            // operationId
  displayValue: string;     // operationName for display
  onChange: (op: PlantOperation) => void;
  disabledIds?: string[];   // operations that are already selected
}

export function OperationSelect({ value, displayValue, onChange, disabledIds = [] }: OperationSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { technologies } = useFlowchartLookups();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);
  const operations: PlantOperation[] = useMemo(() => {
    return technologies.map(t => ({
      id: t.id.toString(),
      code: t.code || 'SYS',
      name: t.name,
      category: (t.category || 'other') as any,
    }));
  }, [technologies]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update coordinates and manage scroll/resize listeners
  useEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }

    const updateCoords = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 320; // 16rem list + search bar + padding

        let positionCoords: any = {
          left: rect.left,
          width: Math.max(rect.width, 288),
        };

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          // Open upwards
          positionCoords.bottom = window.innerHeight - rect.top + 4; // 4px gap
        } else {
          // Open downwards
          positionCoords.top = rect.bottom + 4; // 4px gap
        }

        setCoords(positionCoords);
      }
    }

    updateCoords();

    const handleScrollOrResize = (e: Event) => {
      if (
        e.type === 'scroll' &&
        dropdownRef.current &&
        dropdownRef.current.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
      setSearch('');
    };

    window.addEventListener('scroll', handleScrollOrResize, { capture: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && coords && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, coords]);

  // Group operations by category and filter
  const grouped = useMemo<OperationCategory[]>(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = operations.filter(
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

    return Array.from(categoryMap.entries()).map(([category, ops]) => ({
      category,
      operations: ops,
    }));
  }, [operations, search]);

  const displayedName = useMemo(() => {
    if (!value) return t('operations.searchPlaceholder');
    const found = operations.find((op) => op.id === value);
    return found ? found.name : (displayValue || t('operations.searchPlaceholder'));
  }, [value, operations, displayValue, t]);

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
        <span className={`flex-1 truncate min-w-0 ${value ? 'text-steel-100' : 'text-steel-400'}`}>
          {displayedName}
        </span>
        <ChevronDown
          size={14}
          className={`text-steel-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown portaled to document.body */}
      {createPortal(
        <AnimatePresence>
          {isOpen && coords && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="z-50 overflow-hidden rounded-xl border border-steel-600 bg-steel-850 shadow-2xl mt-1"
              style={{
                position: 'fixed',
                ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
                ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
                left: `${coords.left}px`,
                width: `${coords.width}px`,
              }}
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
                      {operations.map((op) => {
                        const isDisabled = disabledIds.includes(op.id) && op.id !== value;
                        return (
                          <button
                            key={op.id}
                            type="button"
                            onClick={() => !isDisabled && handleSelect(op)}
                            disabled={isDisabled}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-industrial ${
                              op.id === value
                                ? 'bg-forge-500/10 text-forge-400'
                                : isDisabled
                                ? 'text-steel-500 cursor-not-allowed opacity-60'
                                : 'text-steel-200 hover:bg-forge-500/10 cursor-pointer'
                            }`}
                          >
                            <span className={`w-16 shrink-0 rounded bg-steel-700/50 px-1.5 py-0.5 text-center text-[10px] font-mono ${isDisabled ? 'text-steel-600' : 'text-steel-400'}`}>
                              {op.code}
                            </span>
                            <span>{op.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
