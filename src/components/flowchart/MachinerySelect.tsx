import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, X } from 'lucide-react';
import { useFlowchartLookups } from '../../hooks/useFlowchartLookups';

interface MachinerySelectProps {
  value: number | null | undefined;
  onChange: (machineryId: number | null) => void;
}

export function MachinerySelect({ value, onChange }: MachinerySelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { machineries, locations } = useFlowchartLookups();
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

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateCoords = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 320; // 16rem list + search bar + padding

        const positionCoords: { top?: number; bottom?: number; left: number; width: number } = {
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

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return machineries.filter((m) => {
      const name = (m.machinery_name || '').toLowerCase();
      const code = (m.machinery_code || '').toLowerCase();
      return name.includes(lowerSearch) || code.includes(lowerSearch);
    });
  }, [search, machineries]);

  const groupedMachinery = useMemo(() => {
    const groups: Record<string, typeof machineries> = {};
    const unassigned: typeof machineries = [];

    filtered.forEach((m) => {
      const locId = m.location_id;
      if (locId) {
        const loc = locations?.find((l) => l.id === locId);
        const locName = loc ? loc.location_name : t('machinery.otherLocations', 'Otras Ubicaciones');
        if (!groups[locName]) groups[locName] = [];
        groups[locName].push(m);
      } else {
        unassigned.push(m);
      }
    });

    const sortedGroups = Object.keys(groups).sort().map(key => ({
      location: key,
      machineries: groups[key]
    }));

    if (unassigned.length > 0) {
      sortedGroups.push({
        location: t('machinery.unassigned', 'Sin Ubicación'),
        machineries: unassigned
      });
    }

    return sortedGroups;
  }, [filtered, locations,t]);

  const handleSelect = (mId: number | null) => {
    onChange(mId);
    setIsOpen(false);
    setSearch('');
  };

  const selectedMachinery = machineries.find((m) => m.id === value);
  const displayValue = selectedMachinery
    ? `${selectedMachinery.machinery_name || ''} (${selectedMachinery.machinery_code || ''})`
    : '';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-steel-700/60 bg-slate-50 dark:bg-steel-900/80 px-3 py-2 text-left text-xs font-semibold transition-colors hover:border-slate-300 dark:hover:border-steel-600 cursor-pointer shadow-2xs"
      >
        <span className={`flex-1 truncate min-w-0 ${value ? 'text-slate-900 dark:text-steel-100 font-medium' : 'text-slate-400 dark:text-steel-400'}`}>
          {value ? displayValue : t('machinery.selectPlaceholder', 'Seleccionar Maquinaria...')}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 dark:text-steel-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
              className="z-50 overflow-hidden rounded-xl border border-slate-200 dark:border-steel-700 bg-white dark:bg-steel-900 shadow-2xl mt-1"
              style={{
                position: 'fixed',
                ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
                ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
                left: `${coords.left}px`,
                width: `${coords.width}px`,
              }}
            >
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-steel-800 px-3 py-2 bg-slate-50 dark:bg-steel-900/80">
                <Search size={14} className="text-slate-400 dark:text-steel-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('machinery.searchPlaceholder', 'Buscar maquinaria...')}
                  className="flex-1 bg-transparent text-xs font-medium text-slate-900 dark:text-steel-100 placeholder:text-slate-400 dark:placeholder:text-steel-500 outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-steel-200 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-100 dark:hover:bg-steel-800 cursor-pointer text-slate-400 dark:text-steel-400"
                >
                  <span className="italic font-medium">{t('machinery.none', 'Sin maquinaria')}</span>
                </button>
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-steel-500">
                    {t('machinery.noResults', 'No se encontró maquinaria coincidente.')}
                  </div>
                ) : (
                  groupedMachinery.map((group) => (
                    <div key={group.location}>
                      <div className="px-3 py-1.5 mt-1 text-[10px] font-bold text-slate-400 dark:text-steel-400 uppercase tracking-wider bg-slate-50/50 dark:bg-steel-900/50">
                        {group.location}
                      </div>
                      {group.machineries.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelect(m.id)}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                            m.id === value
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold'
                              : 'text-slate-800 dark:text-steel-200 hover:bg-slate-100 dark:hover:bg-steel-800'
                          }`}
                        >
                          <span className="w-16 shrink-0 rounded bg-slate-100 dark:bg-steel-800 px-1.5 py-0.5 text-center text-[10px] font-mono font-bold text-slate-700 dark:text-steel-300">
                            {m.machinery_code}
                          </span>
                          <span>{m.machinery_name}</span>
                        </button>
                      ))}
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
