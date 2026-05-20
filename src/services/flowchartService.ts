// ─────────────────────────────────────────────────────────────
//  Flowchart Service — CRUD operations for flowchart documents
//  All calls use the axiosClient (withCredentials: true).
//  saveFlowchartSteps includes a built-in 2s debounce.
// ─────────────────────────────────────────────────────────────

import axiosClient from '../api/axiosClient';

// ─── Types (matching backend schemas) ────────────────────────

export interface FlowchartStepRead {
  id: number;
  flowchart_id: number;
  technology_id: number | null;
  step_number: number;
  custom_description: string | null;
}

export interface FlowchartRead {
  id: number;
  product_id: number;
  owner_id: number | null;
  title: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  steps: FlowchartStepRead[];
}

export interface FlowchartStepPayload {
  technology_id?: number | null;
  step_number: number;
  custom_description?: string | null;
}

export interface FlowchartCreatePayload {
  product_id: number;
  owner_id?: number | null;
  title: string;
  status?: string;
  steps?: FlowchartStepPayload[];
}

// ─── Service Functions ───────────────────────────────────────

/**
 * Fetch the paginated list of flowchart headers for the Dashboard.
 * GET /flowcharts?skip=0&limit=50
 */
export async function getDocumentHeaders(
  skip = 0,
  limit = 50,
): Promise<FlowchartRead[]> {
  const { data } = await axiosClient.get<FlowchartRead[]>('/flowcharts', {
    params: { skip, limit },
  });
  return data;
}

/**
 * Fetch a single flowchart with its steps (eager loaded).
 * GET /flowcharts/:id
 */
export async function getFlowchartById(id: number): Promise<FlowchartRead> {
  const { data } = await axiosClient.get<FlowchartRead>(`/flowcharts/${id}`);
  return data;
}

/**
 * Create a new flowchart document.
 * POST /flowcharts
 */
export async function createFlowchart(
  payload: FlowchartCreatePayload,
): Promise<FlowchartRead> {
  const { data } = await axiosClient.post<FlowchartRead>('/flowcharts', payload);
  return data;
}

// ─── Debounced Step Save ─────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY_MS = 2000;

/**
 * Send the reordered steps to the backend with a 2-second debounce.
 * Each successive call resets the timer so only the final state
 * is persisted, minimizing traffic and respecting the rate limit.
 *
 * PUT /flowcharts/:id/steps
 */
export function saveFlowchartSteps(
  id: number,
  steps: FlowchartStepPayload[],
): Promise<FlowchartRead> {
  // Cancel any pending save
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  return new Promise((resolve, reject) => {
    debounceTimer = setTimeout(async () => {
      try {
        const { data } = await axiosClient.put<FlowchartRead>(
          `/flowcharts/${id}/steps`,
          { steps },
        );
        resolve(data);
      } catch (error) {
        reject(error);
      }
    }, DEBOUNCE_DELAY_MS);
  });
}

/**
 * Cancel any pending debounced save.
 * Useful when unmounting the workspace component.
 */
export function cancelPendingSave(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
