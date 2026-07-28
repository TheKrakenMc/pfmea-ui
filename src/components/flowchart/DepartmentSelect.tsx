import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DepartmentSelectProps {
  value: string;
  onChange: (dept: string) => void;
}

const DEPARTMENTS = ['Calidad', 'Producción', 'Logística', 'Materiales'];

export function DepartmentSelect({ value, onChange }: DepartmentSelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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
        const dropdownHeight = 160; // Approximate height for 4 items + padding

        let positionCoords: any = {
          left: rect.left,
          width: Math.max(rect.width, 180),
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

  const handleSelect = (dept: string) => {
    onChange(dept);
    setIsOpen(false);
  };

  const rawValue = value || 'Producción';
  const displayValue = t(`departments.${rawValue}`, rawValue);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="focus-ring flex w-full items-center justify-between gap-2 rounded-lg border border-steel-600 bg-steel-800 px-3 py-2 text-left text-sm transition-industrial hover:border-forge-500/50 cursor-pointer"
      >
        <span className="flex-1 truncate min-w-0 text-steel-100">{displayValue}</span>
        <ChevronDown
          size={14}
          className={`text-steel-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
              className="z-50 overflow-hidden rounded-xl border border-steel-600 bg-steel-850 shadow-2xl mt-1"
              style={{
                position: 'fixed',
                ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
                ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
                left: `${coords.left}px`,
                width: `${coords.width}px`,
              }}
            >
              <div className="py-1">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleSelect(dept)}
                    className={`flex w-full items-center px-3 py-2 text-left text-sm transition-industrial hover:bg-forge-500/10 cursor-pointer ${
                      dept === rawValue
                        ? 'bg-forge-500/10 text-forge-400'
                        : 'text-steel-200'
                    }`}
                  >
                    {t(`departments.${dept}`, dept)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
