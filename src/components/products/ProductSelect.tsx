import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';
import type { ProductRead } from '../../services/flowchartService';

interface ProductSelectProps {
  products: ProductRead[];
  value: string;
  onChange: (productId: string) => void;
}

export function ProductSelect({ products, value, onChange }: ProductSelectProps) {
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
    const filtered = products.filter((p) => {
      const pn = (p.part_number || '').toLowerCase();
      const cpn = (p.customer_part_number || '').toLowerCase();
      const customer = (p.customer_name || '').toLowerCase();
      return pn.includes(lowerSearch) || cpn.includes(lowerSearch) || customer.includes(lowerSearch);
    });

    const groups: Record<string, ProductRead[]> = {};
    filtered.forEach(p => {
      const customer = p.customer_name || 'Sin Cliente';
      if (!groups[customer]) groups[customer] = [];
      groups[customer].push(p);
    });

    return groups;
  }, [search, products]);

  const handleSelect = (pId: string) => {
    onChange(pId);
    setIsOpen(false);
    setSearch('');
  };

  const selectedProduct = products.find((p) => String(p.id) === value);
  const displayValue = selectedProduct
    ? `${selectedProduct.part_number || 'Sin Número'} (${selectedProduct.customer_part_number || 'Sin GPN'})`
    : '';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="focus-ring flex w-full items-center justify-between gap-2 rounded-lg border border-steel-600 bg-transparent px-3 py-2 text-left text-sm transition-industrial hover:border-forge-500/50 cursor-pointer"
      >
        <span className={`flex-1 truncate min-w-0 ${value ? 'text-steel-100' : 'text-steel-400'}`}>
          {value ? displayValue : 'Seleccionar Producto...'}
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
              className="z-50 overflow-hidden rounded-xl border border-steel-600 bg-white shadow-2xl mt-1 flex flex-col"
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
              <div className="flex shrink-0 items-center gap-2 border-b border-steel-700 bg-transparent px-3 py-2">
                <Search size={14} className="text-steel-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar producto o cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-steel-100 placeholder-steel-500 focus:outline-none"
                />
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto py-1">
                {Object.keys(filteredAndGrouped).length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-steel-500 italic">
                    No se encontraron productos
                  </div>
                ) : (
                  Object.entries(filteredAndGrouped).map(([customer, prods]) => (
                    <div key={customer} className="mb-2 last:mb-0">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-forge-400/80 bg-transparent sticky top-0 backdrop-blur-sm z-10">
                        {customer}
                      </div>
                      {prods.map((p) => {
                        const isSelected = String(p.id) === value;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelect(String(p.id))}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-industrial hover:bg-forge-500/10 cursor-pointer ${
                              isSelected
                                ? 'bg-forge-500/10 text-forge-400'
                                : 'text-steel-200'
                            }`}
                          >
                            <span className="flex-1 truncate">
                              {p.part_number || 'Sin Número'} <span className="opacity-60 text-xs">({p.customer_part_number || 'Sin GPN'})</span>
                            </span>
                            {isSelected && <Check size={14} className="text-forge-400 shrink-0" />}
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
