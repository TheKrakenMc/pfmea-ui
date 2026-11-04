import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { popoverVariants } from '../../utils/motion';

/**
 * Origin-aware non-modal disclosure following Emil Kowalski & Impeccable rules:
 * - Starts at scale 0.96 (never 0)
 * - Asymmetric exit (faster than entrance)
 * - Native tab order, Escape and outside-pointer dismissal
 */
export function Disclosure({ label, children, className = '', active = false }: {
  label: ReactNode; children: ReactNode; className?: string; active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  return (
    <div
      ref={root}
      className={`ui-disclosure ${className}`}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="ui-button"
        data-active={active || undefined}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(value => !value)}
      >
        {label}
        <ChevronDown size={15} className="ui-chevron" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            className="ui-popover"
            variants={popoverVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={event => {
              if ((event.target as HTMLElement).closest('a')) setOpen(false);
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
