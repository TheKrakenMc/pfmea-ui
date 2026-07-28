// ─────────────────────────────────────────────────────────────
//  Flowchart Context — Global State Management
//  Uses useReducer for predictable state transitions.
//  Designed for future TanStack Query integration.
// ─────────────────────────────────────────────────────────────

import {
  createContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import type {
  FlowchartState,
  FlowchartAction,
  FlowchartStep,
} from '../types/flowchart.types';
import { INITIAL_STATE } from '../data/mockData';

// ─── Helpers ─────────────────────────────────────────────────

function generateId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function recalculateSequences(steps: FlowchartStep[]): FlowchartStep[] {
  return steps.map((step, index) => ({
    ...step,
    sequence: (index + 1) * 10,
  }));
}

// ─── Reducer ─────────────────────────────────────────────────

function flowchartReducer(
  state: FlowchartState,
  action: FlowchartAction
): FlowchartState {
  switch (action.type) {
    case 'ADD_STEP': {
      const newStep: FlowchartStep = {
        id: generateId(),
        sequence: (state.steps.length + 1) * 10,
        operationId: '',
        operationName: '',
        machineryId: null,
        description: '',
        criticalFlag: 'none',
        symbolType: 'operation',
        notes: '',
        responsibleDepartment: 'Producción',
      };
      return {
        ...state,
        steps: [...state.steps, newStep],
        isDirty: true,
      };
    }

    case 'UPDATE_STEP': {
      const { id, field, value } = action.payload;
      return {
        ...state,
        steps: state.steps.map((step) =>
          step.id === id ? { ...step, [field]: value } : step
        ),
        isDirty: true,
      };
    }

    case 'DELETE_STEP': {
      const filtered = state.steps.filter((s) => s.id !== action.payload.id);
      return {
        ...state,
        steps: recalculateSequences(filtered),
        isDirty: true,
      };
    }

    case 'REORDER_STEPS': {
      const { sourceIndex, destinationIndex } = action.payload;
      const reordered = Array.from(state.steps);
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(destinationIndex, 0, moved);
      return {
        ...state,
        steps: recalculateSequences(reordered),
        isDirty: true,
      };
    }

    case 'DUPLICATE_STEP': {
      const original = state.steps.find((s) => s.id === action.payload.id);
      if (!original) return state;

      const duplicate: FlowchartStep = {
        ...original,
        id: generateId(),
        description: `${original.description} (copia)`,
      };

      const idx = state.steps.findIndex((s) => s.id === action.payload.id);
      const withDuplicate = [...state.steps];
      withDuplicate.splice(idx + 1, 0, duplicate);

      return {
        ...state,
        steps: recalculateSequences(withDuplicate),
        isDirty: true,
      };
    }

    case 'UPDATE_HEADER':
      return {
        ...state,
        header: { ...state.header, ...action.payload },
        isDirty: true,
      };

    case 'SET_STATUS':
      return {
        ...state,
        header: {
          ...state.header,
          diagramStatus: action.payload.status,
          lastModified: new Date().toISOString(),
        },
        isDirty: true,
      };

    case 'MARK_SAVED':
      return {
        ...state,
        isDirty: false,
        isSaving: false,
        lastSaved: action.payload.timestamp,
      };

    case 'MARK_DIRTY':
      return { ...state, isDirty: true };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload.isSaving };

    case 'LOAD_STATE':
      return { ...action.payload, isDirty: false, isSaving: false };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────

interface FlowchartContextValue {
  state: FlowchartState;
  dispatch: Dispatch<FlowchartAction>;
  flowchartId: number | null;
  addStep: () => void;
  deleteStep: (id: string) => void;
  duplicateStep: (id: string) => void;
  reorderSteps: (sourceIndex: number, destinationIndex: number) => void;
  updateStep: (id: string, field: keyof FlowchartStep, value: FlowchartStep[keyof FlowchartStep]) => void;
  saveLocally: () => void;
}

export const FlowchartContext = createContext<FlowchartContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────

const STORAGE_KEY = 'pfmea-flowchart-state';

function loadPersistedState(): FlowchartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FlowchartState;
      return { ...parsed, isDirty: false, isSaving: false };
    }
  } catch {
    // Corrupted data — fall back to seed
  }
  return INITIAL_STATE;
}

export function FlowchartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(flowchartReducer, null, loadPersistedState);

  const addStep = useCallback(() => dispatch({ type: 'ADD_STEP' }), []);
  const deleteStep = useCallback(
    (id: string) => dispatch({ type: 'DELETE_STEP', payload: { id } }),
    []
  );
  const duplicateStep = useCallback(
    (id: string) => dispatch({ type: 'DUPLICATE_STEP', payload: { id } }),
    []
  );
  const reorderSteps = useCallback(
    (sourceIndex: number, destinationIndex: number) =>
      dispatch({ type: 'REORDER_STEPS', payload: { sourceIndex, destinationIndex } }),
    []
  );
  const updateStep = useCallback(
    (id: string, field: keyof FlowchartStep, value: FlowchartStep[keyof FlowchartStep]) =>
      dispatch({ type: 'UPDATE_STEP', payload: { id, field, value: value as string } }),
    []
  );

  const saveLocally = useCallback(() => {
    try {
      localStorage.setItem(`flowchart_${state.flowchartId}`, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [state]);

  return (
    <FlowchartContext.Provider
      value={{
        state,
        dispatch,
        flowchartId: state.flowchartId,
        addStep,
        deleteStep,
        duplicateStep,
        reorderSteps,
        updateStep,
        saveLocally,
      }}
    >
      {children}
    </FlowchartContext.Provider>
  );
}
