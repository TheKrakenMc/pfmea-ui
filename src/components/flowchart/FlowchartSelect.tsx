import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FlowchartRead } from '../../services/flowchartService';

interface FlowchartSelectProps {
  flowcharts: FlowchartRead[];
  value: string;
  onChange: (flowchartId: string) => void;
}

export function FlowchartSelect({ flowcharts, value, onChange }: FlowchartSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);

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
        const dropdownHeight = 320; 

        let positionCoords: any = {
          left: rect.left,
          width: Math.max(rect.width, 288),
        };

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          positionCoords.bottom = window.innerHeight - rect.top + 4;
        } else {
          positionCoords.top = rect.bottom + 4;
        }

        setCoords(positionCoords);
      }
    };

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

  useEffect(() => {
    if (isOpen && coords && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, coords]);

  const filteredAndGrouped = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = flowcharts.filter((fc) => {
      const fcCode = (fc.flowchart_code || `#${fc.id}`).toLowerCase();
      const title = (fc.title || '').toLowerCase();
      const customer = (fc.product?.customer_name || '').toLowerCase();
      const partNumber = (fc.product?.part_number || '').toLowerCase();
      return fcCode.includes(lowerSearch) || title.includes(lowerSearch) || customer.includes(lowerSearch) || partNumber.includes(lowerSearch);
    });

    const groups: Record<string, FlowchartRead[]> = {};
    filtered.forEach(fc => {
      const customer = fc.product?.customer_name || t('pfmea.dashboard.noCustomer', 'Sin Cliente');
      if (!groups[customer]) groups[customer] = [];
      groups[customer].push(fc);
    });

    return groups;
  }, [search, flowcharts, t]);

  const handleSelect = (fcId: string) => {
    onChange(fcId);
    setIsOpen(false);
    setSearch('');
  };

  const selectedFlowchart = flowcharts.find((fc) => String(fc.id) === value);
  const displayValue = selectedFlowchart
    ? `${selectedFlowchart.flowchart_code || `#${selectedFlowchart.id}`} - ${selectedFlowchart.title} ${selectedFlowchart.product ? `(${selectedFlowchart.product.part_number})` : ''}`
    : '';

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-3.5 py-2.5 text-left text-sm transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-steel-700 hover:border-indigo-500/50'}`}
      >
        <span className={`flex-1 truncate min-w-0 font-medium ${value ? 'text-steel-100' : 'text-steel-500'}`}>
          {value ? displayValue : t('pfmea.dashboard.modal.selectFlowchart', 'Seleccionar Diagrama de Flujo...')}
        </span>
        <ChevronDown
          size={14}
          className={`text-steel-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && coords && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="z-50 overflow-hidden rounded-xl border border-indigo-500/30 bg-white shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] mt-1 flex flex-col"
              style={{
                position: 'fixed',
                ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
                ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                maxHeight: '320px',
              }}
            >
              {/* Search Bar */}
              <div className="flex shrink-0 items-center gap-2 border-b border-steel-700/50 bg-transparent px-3 py-2">
                <Search size={14} className="text-steel-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t('pfmea.dashboard.modal.searchFlowchartPlaceholder', 'Buscar por nombre, código o cliente...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-steel-100 placeholder-steel-500 focus:outline-none"
                />
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
                {Object.keys(filteredAndGrouped).length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-steel-500 italic">
                    {t('pfmea.dashboard.modal.noFlowchartsFound', 'No se encontraron resultados')}
                  </div>
                ) : (
                  Object.entries(filteredAndGrouped).map(([customer, fcs]) => (
                    <div key={customer} className="mb-2 last:mb-0">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 bg-transparent sticky top-0 backdrop-blur-sm z-10 border-y border-steel-800/30 first:border-t-0">
                        {customer}
                      </div>
                      {fcs.map((fc) => {
                        const isSelected = String(fc.id) === value;
                        return (
                          <button
                            key={fc.id}
                            type="button"
                            onClick={() => handleSelect(String(fc.id))}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-indigo-500/10 cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'text-steel-200'
                            }`}
                          >
                            <span className="flex-1 truncate font-medium">
                              {fc.flowchart_code || `#${fc.id}`} - {fc.title} <span className="opacity-60 text-xs font-normal">({fc.product?.part_number})</span>
                            </span>
                            {isSelected && <Check size={14} className="text-indigo-400 shrink-0" />}
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
