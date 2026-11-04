import type { Transition, Variants } from 'framer-motion';

/**
 * Emil Kowalski + Taste + Impeccable Motion System
 *
 * Principles:
 * 1. Micro-interactions: 120ms - 200ms
 * 2. Asymmetric exits: ~20-25% faster than entrances
 * 3. Custom cubic-bezier curves (never linear or generic ease-in-out)
 * 4. Higher initial scale (>= 0.95, never 0)
 * 5. Tight stagger (25ms - 40ms)
 */

export const EASING = {
  /** Fast start, smooth deceleration — ideal for entrances */
  out: [0.16, 1, 0.3, 1] as const,
  /** Responsive deceleration for micro-elements and popovers */
  outSwift: [0.23, 1, 0.32, 1] as const,
  /** Fast acceleration — ideal for exits */
  in: [0.7, 0, 0.84, 0] as const,
};

export const DURATION = {
  micro: 0.15,
  enter: 0.22,
  exit: 0.16,
  modalEnter: 0.26,
  modalExit: 0.18,
};

export const SPRING = {
  /** Snappy, grounded spring with zero overshoot for UI controls */
  snappy: {
    type: 'spring',
    stiffness: 480,
    damping: 34,
    mass: 0.8,
  } satisfies Transition,
  /** Smooth spring for modals and drawers */
  modal: {
    type: 'spring',
    stiffness: 400,
    damping: 32,
    mass: 0.9,
  } satisfies Transition,
  /** Gentle spring for layout indicators and cards */
  gentle: {
    type: 'spring',
    stiffness: 320,
    damping: 28,
    mass: 0.9,
  } satisfies Transition,
};

/**
 * Origin-aware popover / disclosure transition.
 * Starts at scale 0.96 (never 0) and exits 25% faster.
 */
export const popoverVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATION.enter,
      ease: EASING.outSwift,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -3,
    transition: {
      duration: DURATION.exit,
      ease: EASING.in,
    },
  },
};

/**
 * Modal backdrop variants with asymmetric exit.
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: EASING.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: EASING.in },
  },
};

/**
 * Modal dialog card variants (scale 0.95 -> 1, subtle y lift).
 */
export const modalCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING.modal,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 6,
    transition: {
      duration: DURATION.modalExit,
      ease: EASING.in,
    },
  },
};

/**
 * Staggered grid container and item variants for workspace cards.
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.032,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: EASING.out,
    },
  },
};

/**
 * Subtle badge / counter pop transition.
 */
export const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: 0.12, ease: EASING.in },
  },
};

