import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { MeasurementUnit } from '../../types/product.types';

interface MeasurementUnitSelectProps {
  units: MeasurementUnit[];
  value: number | null;
  onChange: (id: number | null) => void;
  disabled?: boolean;
}

export const MeasurementUnitSelect: React.FC<MeasurementUnitSelectProps> = ({
  units,
  value,
  onChange,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);

  // Group by magnitude and filter by search term
  const groupedUnits = useMemo(() => {
    const filtered = units.filter(
      u => u.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
           u.symbology.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (u.magnitude || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const groups: Record<string, MeasurementUnit[]> = {};
    filtered.forEach(u => {
      const mag = u.magnitude || 'Otras';
      if (!groups[mag]) groups[mag] = [];
      groups[mag].push(u);
    });
    
    // Sort groups alphabetically
    const sortedGroups: Record<string, MeasurementUnit[]> = {};
    Object.keys(groups).sort().forEach(key => {
      sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
  }, [units, searchTerm]);

  const selectedUnit = units.find(u => u.id === value);

  useEffect(() => {
    if (!isOpen) {
      setCoords(null);
      setSearchTerm(''); // reset search when closed
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
          width: rect.width,
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

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = (e: Event) => {
      if (
        e.type === 'scroll' &&
        dropdownRef.current &&
        dropdownRef.current.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, { capture: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleSelect = (id: number | null) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-steel-900 border ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-steel-700'} rounded-lg px-2.5 py-1.5 text-sm text-left flex items-center justify-between transition-colors disabled:opacity-70 disabled:cursor-not-allowed h-9`}
      >
        <span className={`truncate mr-2 ${selectedUnit ? 'text-steel-100' : 'text-steel-400'}`}>
          {selectedUnit ? `${selectedUnit.description} (${selectedUnit.symbology})` : t('common.select', 'Seleccionar...')}
        </span>
        <ChevronDown size={14} className={`text-steel-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {coords && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="bg-steel-900 border border-steel-700 rounded-lg shadow-xl shadow-black/50 overflow-hidden flex flex-col max-h-[320px]"
          >
            <div className="p-2 border-b border-steel-800 shrink-0 relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-500" />
              <input
                type="text"
                autoFocus
                placeholder={t('common.search', 'Buscar...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-steel-950 border border-steel-800 rounded-md py-1.5 pl-8 pr-3 text-sm text-steel-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="w-full text-left px-3 py-2 text-sm text-steel-400 hover:bg-steel-800 hover:text-steel-200 rounded-md transition-colors"
              >
                Ninguno
              </button>
              
              {Object.keys(groupedUnits).length === 0 ? (
                <div className="py-4 text-center text-sm text-steel-500">
                  {t('common.noResults', 'No se encontraron resultados')}
                </div>
              ) : (
                Object.entries(groupedUnits).map(([magnitude, groupUnits]) => (
                  <div key={magnitude} className="mb-2 last:mb-0">
                    <div className="px-3 py-1.5 text-xs font-semibold text-steel-500 uppercase tracking-wider bg-steel-900/90 sticky top-0 backdrop-blur-sm z-10">
                      {magnitude}
                    </div>
                    {groupUnits.map(unit => {
                      const isSelected = value === unit.id;
                      return (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => handleSelect(unit.id)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                            isSelected 
                              ? 'bg-indigo-500/10 text-indigo-400' 
                              : 'text-steel-200 hover:bg-steel-800'
                          }`}
                        >
                          <span className="truncate pr-2">{unit.description} <span className="text-steel-500 text-xs ml-1 whitespace-nowrap">({unit.symbology})</span></span>
                          {isSelected && <Check size={14} className="text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
