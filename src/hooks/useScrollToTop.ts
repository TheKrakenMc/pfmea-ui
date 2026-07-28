import { useEffect, RefObject } from 'react';

/**
 * Hook to scroll to the top of the window or a specific container when a condition is met.
 * Useful for modals that appear offset when the page is scrolled down.
 * 
 * @param trigger The condition that triggers the scroll (e.g., isOpen boolean).
 * @param ref Optional ref to a scrollable container. If not provided, scrolls the window.
 */
export const useScrollToTop = (trigger: boolean, ref?: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (trigger) {
      // Small timeout to ensure DOM is ready and modal is fully rendered
      setTimeout(() => {
        if (ref && ref.current) {
          ref.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 10);
    }
  }, [trigger, ref]);
};
