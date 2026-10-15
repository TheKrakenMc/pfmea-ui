import {useAuth} from '../hooks/useAuth';
import { draftKey, saveDraft } from '../services/drafts';
// ─────────────────────────────────────────────────────────────
//  Flowchart Context — Global State Management
//  Uses useReducer for predictable state transitions.
//  Designed for future TanStack Query integration.
// ─────────────────────────────────────────────────────────────

import {
  useReducer,
  useCallback,
  type ReactNode,
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
        subStep: 0,
        operationId: '',
        operationName: '',
        machineryId: null,
        description: '',
        criticalFlag: 'none',
        symbolType: 'operation',
        responsibleDepartment: 'Producción',
        productCharacteristics: '',
        processCharacteristics: '',
        target: '',
      };
      return {
        ...state,
        steps: recalculateSequences([...state.steps, newStep]),
        isDirty: true,
      };
    }

    case 'ADD_SUB_STEP': {
      const { parentStepId } = action.payload;
      const parentIndex = state.steps.findIndex((s) => s.id === parentStepId);
      if (parentIndex === -1) return state;

      const parent = state.steps[parentIndex];
      // Find the end of this parent's sub-steps
      let insertIndex = parentIndex + 1;
      while (insertIndex < state.steps.length && state.steps[insertIndex].subStep > 0) {
        insertIndex++;
      }

      const newSubStep: FlowchartStep = {
        id: generateId(),
        sequence: parent.sequence,
        subStep: 1, // Will be computed by recalculateSequences
        operationId: parent.operationId,
        operationName: parent.operationName,
        machineryId: parent.machineryId,
        departmentId: parent.departmentId,
        responsibleDepartment: parent.responsibleDepartment || 'Producción',
        symbolType: parent.symbolType || 'operation',
        criticalFlag: 'none',
        description: '',
        productCharacteristics: '',
        processCharacteristics: '',
        target: '',
      };

      const updated = [...state.steps];
      updated.splice(insertIndex, 0, newSubStep);

      return {
        ...state,
        steps: recalculateSequences(updated),
        isDirty: true,
      };
    }

    case 'UPDATE_STEP': {
      const { id, field, value } = action.payload;
      const targetStep = state.steps.find((s) => s.id === id);
      if (!targetStep) return state;

      const isMaster = !targetStep.subStep || targetStep.subStep === 0;

      // Fields to sync from master down to intermediate child operations
      const syncFields = [
        'operationId',
        'operationName',
        'machineryId',
        'departmentId',
        'responsibleDepartment',
        'symbolType',
      ];

      let updatedSteps = state.steps.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: value };
        }
        // If master updated a synchronized field, propagate down to its intermediate operations
        if (
          isMaster &&
          syncFields.includes(field) &&
          s.sequence === targetStep.sequence &&
          s.subStep > 0
        ) {
          return { ...s, [field]: value };
        }
        return s;
      });

      // Handle criticalFlag bidirectional sync between master and intermediate sub-steps
      if (field === 'criticalFlag') {
        if (isMaster) {
          // If master toggled to 'none', clear CC/SC on all its sub-steps
          if (value === 'none') {
            updatedSteps = updatedSteps.map((s) =>
              s.sequence === targetStep.sequence && s.subStep > 0
                ? { ...s, criticalFlag: 'none' }
                : s
            );
          }
        } else {
          // An intermediate sub-step changed its criticalFlag
          const hasAnyCriticalSub = updatedSteps.some(
            (s) =>
              s.sequence === targetStep.sequence &&
              s.subStep > 0 &&
              (s.criticalFlag === 'CC' || s.criticalFlag === 'SC')
          );
          // If any sub-step has CC or SC, master automatically gets '@'
          updatedSteps = updatedSteps.map((s) => {
            if (s.sequence === targetStep.sequence && (!s.subStep || s.subStep === 0)) {
              if (hasAnyCriticalSub) {
                return { ...s, criticalFlag: '@' };
              } else if (s.criticalFlag === '@') {
                return { ...s, criticalFlag: 'none' };
              }
            }
            return s;
          });
        }
      }

      return {
        ...state,
        steps: updatedSteps,
        isDirty: true,
      };
    }

    case 'DELETE_STEP': {
      const stepToDelete = state.steps.find((s) => s.id === action.payload.id);
      if (!stepToDelete) return state;

      let filtered: FlowchartStep[];
      if (!stepToDelete.subStep || stepToDelete.subStep === 0) {
        // Master step deleted: delete this master step and all its derived sub-steps
        const masterIdx = state.steps.findIndex((s) => s.id === stepToDelete.id);
        const idsToDelete = new Set<string>([stepToDelete.id]);
        for (let i = masterIdx + 1; i < state.steps.length; i++) {
          if (state.steps[i].subStep > 0) {
            idsToDelete.add(state.steps[i].id);
          } else {
            break;
          }
        }
        filtered = state.steps.filter((s) => !idsToDelete.has(s.id));
      } else {
        // Derived sub-step deleted: delete only this sub-step
        filtered = state.steps.filter((s) => s.id !== stepToDelete.id);
      }

      return {
        ...state,
        steps: recalculateSequences(filtered),
        isDirty: true,
      };
    }

    case 'REORDER_STEPS': {
      const { sourceIndex, destinationIndex } = action.payload;
      if (sourceIndex === destinationIndex) return state;
      if (
        sourceIndex < 0 ||
        sourceIndex >= state.steps.length ||
        destinationIndex < 0 ||
        destinationIndex >= state.steps.length
      ) {
        return state;
      }

      const movedStep = state.steps[sourceIndex];
      const isMovedSubStep = Boolean(movedStep.subStep && movedStep.subStep > 0);
      const groups = groupStepsByMaster(state.steps);

      if (!isMovedSubStep) {
        // ── 1. MASTER OPERATION DRAGGED ──
        // Reordering is grouped based on master operations:
        // Moving a master operation moves the ENTIRE group (master + all its derived sub-steps) as a unit.
        const sourceGroupIdx = groups.findIndex((g) => g.master.id === movedStep.id);
        if (sourceGroupIdx === -1) return state;

        const targetStep = state.steps[destinationIndex];
        const destGroupIdx = groups.findIndex(
          (g) => g.master.id === targetStep.id || g.subSteps.some((s) => s.id === targetStep.id)
        );
        if (destGroupIdx === -1 || sourceGroupIdx === destGroupIdx) {
          // Dropped within its own group or invalid: no change
          return state;
        }

        const reorderedGroups = Array.from(groups);
        const [movedGroup] = reorderedGroups.splice(sourceGroupIdx, 1);
        reorderedGroups.splice(destGroupIdx, 0, movedGroup);

        return {
          ...state,
          steps: flattenMasterGroups(reorderedGroups),
          isDirty: true,
        };
      } else {
        // ── 2. INTERMEDIATE / DERIVED OPERATION DRAGGED ──
        // Sub-steps can be organized among themselves WITHOUT leaving the parent master operation.
        const parentGroupIdx = groups.findIndex((g) =>
          g.subSteps.some((s) => s.id === movedStep.id)
        );
        if (parentGroupIdx === -1) return state;

        const parentGroup = groups[parentGroupIdx];
        const sourceSubIdx = parentGroup.subSteps.findIndex((s) => s.id === movedStep.id);
        if (sourceSubIdx === -1) return state;

        // Calculate flat index range for this parent's sub-steps
        let masterFlatIdx = 0;
        for (let i = 0; i < parentGroupIdx; i++) {
          masterFlatIdx += 1 + groups[i].subSteps.length;
        }
        const minSubFlatIdx = masterFlatIdx + 1;
        const maxSubFlatIdx = masterFlatIdx + parentGroup.subSteps.length;

        // Clamp destination to remain strictly within parent's sub-steps
        const clampedDestFlatIdx = Math.max(
          minSubFlatIdx,
          Math.min(maxSubFlatIdx, destinationIndex)
        );
        const destSubIdx = clampedDestFlatIdx - minSubFlatIdx;

        if (sourceSubIdx === destSubIdx) {
          return state;
        }

        const updatedSubSteps = Array.from(parentGroup.subSteps);
        const [movedSub] = updatedSubSteps.splice(sourceSubIdx, 1);
        updatedSubSteps.splice(destSubIdx, 0, movedSub);

        groups[parentGroupIdx] = {
          ...parentGroup,
          subSteps: updatedSubSteps,
        };

        return {
          ...state,
          steps: flattenMasterGroups(groups),
          isDirty: true,
        };
      }
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

import {FlowchartContext} from './flowchartState';
import {groupStepsByMaster,recalculateSequences,flattenMasterGroups} from './flowchartGroups';
// ─── Provider ────────────────────────────────────────────────

export function FlowchartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer((current,action)=>{
    const readOnly=!user || user.role_name==='Viewer' || ['approved','archived'].includes(current.header.diagramStatus);
    if(readOnly && !['LOAD_STATE','SET_SAVING','MARK_SAVED'].includes(action.type))return current;
    return flowchartReducer(current,action);
  }, INITIAL_STATE);

  const addStep = useCallback(() => dispatch({ type: 'ADD_STEP' }), []);
  const addSubStep = useCallback(
    (parentStepId: string) => dispatch({ type: 'ADD_SUB_STEP', payload: { parentStepId } }),
    []
  );
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
      dispatch({ type: 'UPDATE_STEP', payload: { id, field, value: value as unknown } }),
    []
  );

  const saveLocally = useCallback(() => {
    try {
      if (user && state.flowchartId) saveDraft(draftKey(user.id,user.plant_id,"flowchart",state.flowchartId), state.lockVersion || 1, state);
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [state, user]);

  return (
    <FlowchartContext.Provider
      value={{
        state,
        dispatch,
        flowchartId: state.flowchartId,
        addStep,
        addSubStep,
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
