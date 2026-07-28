import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, X } from 'lucide-react';
import { useFlowchartLookups } from '../../hooks/useFlowchartLookups';
import type { Machinery } from '../../types/machinery.types';

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
      const name = (m.machinery_name || (m as any).machineryName || '').toLowerCase();
      const code = (m.machinery_code || (m as any).machineryCode || '').toLowerCase();
      return name.includes(lowerSearch) || code.includes(lowerSearch);
    });
  }, [search, machineries]);

  const groupedMachinery = useMemo(() => {
    const groups: Record<string, typeof machineries> = {};
    const unassigned: typeof machineries = [];

    filtered.forEach((m) => {
      const locId = (m as any).location_id;
      if (locId) {
        const loc = locations?.find((l: any) => l.id === locId);
        const locName = loc ? loc.location_name : 'Otras Ubicaciones';
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
        location: 'Sin Ubicación',
        machineries: unassigned
      });
    }

    return sortedGroups;
  }, [filtered, locations]);

  const handleSelect = (mId: number | null) => {
    onChange(mId);
    setIsOpen(false);
    setSearch('');
  };

  const selectedMachinery = machineries.find((m) => m.id === value);
  const displayValue = selectedMachinery
    ? `${selectedMachinery.machinery_name || (selectedMachinery as any).machineryName || ''} (${selectedMachinery.machinery_code || (selectedMachinery as any).machineryCode || ''})`
    : '';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="focus-ring flex w-full items-center justify-between gap-2 rounded-lg border border-steel-600 bg-steel-800 px-3 py-2 text-left text-sm transition-industrial hover:border-forge-500/50 cursor-pointer"
      >
        <span className={`flex-1 truncate min-w-0 ${value ? 'text-steel-100' : 'text-steel-400'}`}>
          {value ? displayValue : 'Select Machinery...'}
        </span>
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
              <div className="flex items-center gap-2 border-b border-steel-700 px-3 py-2">
                <Search size={14} className="text-steel-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search machinery..."
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

              <div className="max-h-64 overflow-y-auto py-1">
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-industrial hover:bg-forge-500/10 cursor-pointer text-steel-400`}
                >
                  <span className="italic">No machinery</span>
                </button>
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-steel-500">
                    No matching machinery found.
                  </div>
                ) : (
                  groupedMachinery.map((group) => (
                    <div key={group.location}>
                      <div className="px-3 py-1.5 mt-1 text-xs font-bold text-steel-500 uppercase tracking-wider bg-steel-900/50">
                        {group.location}
                      </div>
                      {group.machineries.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelect(m.id)}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-industrial hover:bg-forge-500/10 cursor-pointer ${
                            m.id === value
                              ? 'bg-forge-500/10 text-forge-400'
                              : 'text-steel-200'
                          }`}
                        >
                          <span className="w-16 shrink-0 rounded bg-steel-700/50 px-1.5 py-0.5 text-center text-[10px] font-mono text-steel-400">
                            {m.machinery_code || (m as any).machineryCode}
                          </span>
                          <span>{m.machinery_name || (m as any).machineryName}</span>
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
