import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { MeasurementUnit } from '../../types/product.types';
import { popoverVariants } from '../../utils/motion';

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
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  } | null>(null);

  // Group by magnitude and filter by search term
  const groupedUnits = useMemo(() => {
    const filtered = units.filter(
      u =>
        u.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.symbology.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.magnitude || '').toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const groups: Record<string, MeasurementUnit[]> = {};
    filtered.forEach(u => {
      const mag = u.magnitude || 'Otras';
      if (!groups[mag]) groups[mag] = [];
      groups[mag].push(u);
    });

    // Sort groups alphabetically
    const sortedGroups: Record<string, MeasurementUnit[]> = {};
    Object.keys(groups)
      .sort()
      .forEach(key => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  }, [units, searchTerm]);

  const selectedUnit = units.find(u => u.id === value);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updateCoords = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 320;

        const positionCoords: {
          top?: number;
          bottom?: number;
          left: number;
          width: number;
        } = {
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
        aria-expanded={isOpen}
        onClick={() => !disabled && (setSearchTerm(''), setIsOpen(!isOpen))}
        className={`ui-input param-input-compact text-left flex items-center justify-between cursor-pointer ${
          isOpen
            ? 'border-[var(--ui-focus)] bg-[var(--ui-surface)] shadow-[0_0_0_3px_var(--ui-focus-ring)]'
            : ''
        }`}
      >
        <span
          className={`truncate mr-2 ${
            selectedUnit ? 'text-[var(--ui-ink)]' : 'text-[var(--ui-muted)]'
          }`}
        >
          {selectedUnit
            ? `${selectedUnit.description} (${selectedUnit.symbology})`
            : t('common.select', 'Seleccionar...')}
        </span>
        <ChevronDown
          size={14}
          className="ui-chevron text-[var(--ui-muted)]"
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && coords && (
            <motion.div
              ref={dropdownRef}
              variants={popoverVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'fixed',
                transformOrigin: coords.bottom !== undefined ? 'bottom left' : 'top left',
                top: coords.top,
                bottom: coords.bottom,
                left: coords.left,
                width: coords.width,
                zIndex: 9999,
              }}
              className="bg-[var(--ui-surface)] border border-[var(--ui-line)] rounded-[var(--ui-panel-radius)] shadow-[var(--ui-shadow-popover)] overflow-hidden flex flex-col max-h-[320px]"
            >
              <div className="p-2 border-b border-[var(--ui-line)] shrink-0 relative bg-[var(--ui-surface-subtle)]">
                <Search
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ui-muted)]"
                />
                <input
                  type="text"
                  autoFocus
                  placeholder={t('common.search', 'Buscar...')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--ui-surface)] border border-[var(--ui-line)] rounded-[var(--ui-radius-sm)] py-1.5 pl-8 pr-3 text-sm text-[var(--ui-ink)] focus:outline-none focus:border-[var(--ui-focus)] transition-colors"
                />
              </div>

              <div className="overflow-y-auto flex-1 p-1.5 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--ui-muted)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-ink)] rounded-[var(--ui-radius-sm)] transition-colors cursor-pointer"
                >
                  Ninguno
                </button>

                {Object.keys(groupedUnits).length === 0 ? (
                  <div className="py-4 text-center text-sm text-[var(--ui-muted)]">
                    {t('common.noResults', 'No se encontraron resultados')}
                  </div>
                ) : (
                  Object.entries(groupedUnits).map(([magnitude, groupUnits]) => (
                    <div key={magnitude} className="mb-2 last:mb-0">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--ui-muted)] uppercase tracking-wider bg-[var(--ui-surface-subtle)] sticky top-0 backdrop-blur-sm z-10 rounded-[var(--ui-radius-sm)]">
                        {magnitude}
                      </div>
                      {groupUnits.map(unit => {
                        const isSelected = value === unit.id;
                        return (
                          <button
                            key={unit.id}
                            type="button"
                            onClick={() => handleSelect(unit.id)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-[var(--ui-radius-sm)] transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-[var(--ui-tint)] text-[var(--ui-accent)] font-medium'
                                : 'text-[var(--ui-ink)] hover:bg-[var(--ui-surface-hover)]'
                            }`}
                          >
                            <span className="truncate pr-2">
                              {unit.description}{' '}
                              <span className="text-[var(--ui-muted)] text-xs ml-1 whitespace-nowrap font-mono">
                                ({unit.symbology})
                              </span>
                            </span>
                            {isSelected && (
                              <Check size={14} className="text-[var(--ui-accent)] shrink-0" />
                            )}
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
        document.body,
      )}
    </div>
  );
};
