import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Technology } from '../../types/product.types';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { TechnologyBadge } from './TechnologyBadge';

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

  useEffect(() => {
    if (!isOpen) {
      setCoords(null);
      setSearchTerm('');
      return;
    }

    const updateCoords = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 240; // max-h-60 is 240px

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

  const removeTechnology = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onChange(selectedIds.filter((tId) => tId !== id));
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
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center border border-dashed border-steel-600 text-steel-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 px-3 py-1 rounded-full text-xs font-medium transition-colors h-6"
      >
        <Plus size={14} className="mr-1" />
        {t('products.detail.addTechnology', 'Añadir Tecnología')}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && coords && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="z-50 bg-steel-900 border border-steel-700 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[320px]"
              style={{
                position: 'fixed',
                ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
                ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
                left: `${coords.left}px`,
                width: `${coords.width}px`,
              }}
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
                {filteredTechnologies.length === 0 ? (
                  <div className="py-4 text-center text-sm text-steel-500">
                    {t('common.noResults', 'No se encontraron resultados')}
                  </div>
                ) : (
                  filteredTechnologies.map((tech) => {
                    const isSelected = selectedIds.includes(tech.id);
                    return (
                      <div
                        key={tech.id}
                        onClick={() => toggleTechnology(tech.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-500/10' : 'hover:bg-steel-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'border-steel-600 bg-steel-950/50'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-indigo-400 font-medium' : 'text-steel-200'}`}>
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
