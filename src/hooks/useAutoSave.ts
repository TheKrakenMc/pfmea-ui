// ─────────────────────────────────────────────────────────────
//  useAutoSave — Debounced local + remote persistence hook
//  Automatically saves state to localStorage after 2s idle,
//  and to the backend via the flowchartService (debounced 2s).
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { useFlowchart } from './useFlowchart';
import {
  saveFlowchartSteps,
  cancelPendingSave,
  type FlowchartStepPayload,
} from '../services/flowchartService';

const AUTOSAVE_DELAY_MS = 2000;

export function useAutoSave() {
  const { state, dispatch, saveLocally, flowchartId } = useFlowchart();
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

  // ─── Remote save (backend API) ─────────────────────────────
  useEffect(() => {
    if (!state.isDirty || flowchartId === null) return;

    // Map local steps to the backend payload format
    const stepsPayload: FlowchartStepPayload[] = state.steps.map((step, index) => ({
      step_number: (index + 1) * 10,
      custom_description: step.description || step.operationName || null,
      technology_id: null, // Will be mapped when technology catalog is wired
    }));

    dispatch({ type: 'SET_SAVING', payload: { isSaving: true } });

    saveFlowchartSteps(flowchartId, stepsPayload)
      .then(() => {
        dispatch({
          type: 'MARK_SAVED',
          payload: { timestamp: new Date().toISOString() },
        });
      })
      .catch((err) => {
        // 429 handled by interceptor toast — just reset saving state
        console.error('Remote save failed:', err);
        dispatch({ type: 'SET_SAVING', payload: { isSaving: false } });
      });

    return () => {
      cancelPendingSave();
    };
  }, [state.isDirty, state.steps, flowchartId, dispatch]);

  return {
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
  };
}
