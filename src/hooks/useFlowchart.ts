// ─────────────────────────────────────────────────────────────
//  useFlowchart — Convenience hook for FlowchartContext
// ─────────────────────────────────────────────────────────────

import { useContext } from 'react';
import { FlowchartContext } from '../context/FlowchartContext';

export function useFlowchart() {
  const context = useContext(FlowchartContext);
  if (!context) {
    throw new Error('useFlowchart must be used within a <FlowchartProvider>');
  }
  return context;
}
