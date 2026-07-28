// ─────────────────────────────────────────────────────────────
//  useAutoSave — Local persistence hook
//  Automatically saves state to localStorage after 2s idle.
//  Remote persistence is now handled manually.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { useFlowchart } from './useFlowchart';

const AUTOSAVE_DELAY_MS = 2000;

export function useAutoSave() {
  const { state, saveLocally } = useFlowchart();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Local save (localStorage) ─────────────────────────────
  useEffect(() => {
    if (!state.isDirty) return;

    // Clear any existing debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Schedule a save after the debounce period
    timerRef.current = setTimeout(() => {
      saveLocally();
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.isDirty, state.steps, state.header, saveLocally]);

  return {
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
  };
}
