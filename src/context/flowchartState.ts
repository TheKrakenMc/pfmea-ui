import {createContext,type Dispatch} from 'react';
import type {FlowchartState,FlowchartAction,FlowchartStep} from '../types/flowchart.types';
interface FlowchartContextValue {
  state: FlowchartState;
  dispatch: Dispatch<FlowchartAction>;
  flowchartId: number | null;
  addStep: () => void;
  addSubStep: (parentStepId: string) => void;
  deleteStep: (id: string) => void;
  duplicateStep: (id: string) => void;
  reorderSteps: (sourceIndex: number, destinationIndex: number) => void;
  updateStep: (id: string, field: keyof FlowchartStep, value: FlowchartStep[keyof FlowchartStep]) => void;
  saveLocally: () => void;
}

export const FlowchartContext = createContext<FlowchartContextValue | null>(null);
