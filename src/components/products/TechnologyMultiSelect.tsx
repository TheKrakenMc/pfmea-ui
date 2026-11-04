import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Check, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Technology } from '../../types/product.types';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { TechnologyBadge } from './TechnologyBadge';
import { popoverVariants } from '../../utils/motion';

interface TechnologyMultiSelectProps {
  technologies: Technology[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
}

export const TechnologyMultiSelect: React.FC<TechnologyMultiSelectProps> = ({
  technologies,
  selectedIds,
  onChange,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);

  const filteredTechnologies = useMemo(() => {
    return technologies.filter(
      (tech) =>
        (tech.name || tech.operation_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tech.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [technologies, searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updateCoords = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 240; // max-h-60 is 240px

        const positionCoords: { top?: number; bottom?: number; left: number; width: number } = {
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

    window.addEventListener('scroll', handleScrollOrResize, { capture: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const toggleTechnology = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((tId) => tId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };


  const selectedTechs = technologies.filter((t) => selectedIds.includes(t.id));

  return (
    <div className="relative inline-flex flex-wrap items-center gap-2" ref={containerRef}>
      {selectedTechs.map((tech) => (
        <TechnologyBadge
          key={tech.id}
          technology={tech}
          onRemove={(id) => onChange(selectedIds.filter((tId) => tId !== id))}
        />
      ))}

      <button
        type="button"
        onClick={() => (setSearchTerm(''), setIsOpen(!isOpen))}
        className="inline-flex items-center justify-center border border-dashed border-[var(--ui-line-strong)] text-[var(--ui-muted)] hover:text-[var(--ui-accent)] hover:border-[var(--ui-accent)] hover:bg-[var(--ui-tint)] active:scale-[0.98] px-3 py-1 rounded-full text-xs font-medium transition-all h-7 cursor-pointer"
      >
        <Plus size={14} className="mr-1" />
        {t('products.detail.addTechnology', 'Añadir Tecnología')}
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
              className="z-50 bg-[var(--ui-surface)] border border-[var(--ui-line)] rounded-[var(--ui-panel-radius)] shadow-[var(--ui-shadow-popover)] overflow-hidden flex flex-col max-h-[320px]"
              style={{
                position: 'fixed',
                transformOrigin: coords.bottom !== undefined ? 'bottom left' : 'top left',
                ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
                ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
                left: `${coords.left}px`,
                width: `${coords.width}px`,
              }}
            >
              <div className="p-2 border-b border-[var(--ui-line)] shrink-0 relative bg-[var(--ui-surface-subtle)]">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ui-muted)]" />
                <input
                  type="text"
                  autoFocus
                  placeholder={t('common.search', 'Buscar...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--ui-surface)] border border-[var(--ui-line)] rounded-[var(--ui-radius-sm)] py-1.5 pl-8 pr-3 text-sm text-[var(--ui-ink)] focus:outline-none focus:border-[var(--ui-focus)] transition-colors"
                />
              </div>

              <div className="overflow-y-auto flex-1 p-1.5 custom-scrollbar">
                {filteredTechnologies.length === 0 ? (
                  <div className="py-4 text-center text-sm text-[var(--ui-muted)]">
                    {t('common.noResults', 'No se encontraron resultados')}
                  </div>
                ) : (
                  filteredTechnologies.map((tech) => {
                    const isSelected = selectedIds.includes(tech.id);
                    return (
                      <div
                        key={tech.id}
                        onClick={() => toggleTechnology(tech.id)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-[var(--ui-radius-sm)] cursor-pointer transition-colors ${
                          isSelected ? 'bg-[var(--ui-tint)]' : 'hover:bg-[var(--ui-surface-hover)]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[var(--ui-primary)] border-[var(--ui-primary)] text-white'
                              : 'border-[var(--ui-line-strong)] bg-[var(--ui-surface)]'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-[var(--ui-accent)] font-medium' : 'text-[var(--ui-ink)]'}`}>
                          {tech.name || tech.operation_name}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
