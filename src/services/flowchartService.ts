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
  machinery_id: number | null;
  step_number: number;
  custom_description: string | null;
  responsible_department: string;
  symbol_type: string;
  critical_flag: string;
  technology?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
  machinery?: {
    id: number;
    machinery_name: string;
    machinery_code?: string;
  } | null;
}

export interface ProductRead {
  id: number;
  plant_id: number | null;
  customer_name: string | null;
  part_number: string | null;
  customer_part_number: string | null;
  description: string | null;
}

export interface ProductCreatePayload {
  plant_id?: number | null;
  customer_name: string;
  part_number: string;
  description?: string | null;
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
  product?: ProductRead;
  flowchart_code?: string;
}

export interface FlowchartStepPayload {
  technology_id?: number | null;
  machinery_id?: number | null;
  step_number: number;
  custom_description?: string | null;
  responsible_department: string;
  symbol_type: string;
  critical_flag: string;
}

export interface FlowchartCreatePayload {
  product_id: number;
  owner_id?: number | null;
  title: string;
  status?: string;
  steps?: FlowchartStepPayload[];
}

export interface FlowchartUpdatePayload {
  title?: string;
  status?: string;
  customer_name?: string;
  part_number?: string;
  product_description?: string | null;
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

/**
 * Fetch all available products from the master list.
 * GET /flowcharts/products
 */
export async function listProducts(): Promise<ProductRead[]> {
  const { data } = await axiosClient.get<ProductRead[]>('/flowcharts/products');
  return data;
}

/**
 * Create a new product.
 * POST /flowcharts/products
 */
export async function createProduct(
  payload: ProductCreatePayload,
): Promise<ProductRead> {
  const { data } = await axiosClient.post<ProductRead>('/flowcharts/products', payload);
  return data;
}

/**
 * Update flowchart metadata and nested product properties.
 * PUT /flowcharts/:id
 */
export async function updateFlowchart(
  id: number,
  payload: FlowchartUpdatePayload,
): Promise<FlowchartRead> {
  const { data } = await axiosClient.put<FlowchartRead>(`/flowcharts/${id}`, payload);
  return data;
}

/**
 * Delete a flowchart document.
 * DELETE /flowcharts/:id
 */
export async function deleteFlowchart(id: number): Promise<void> {
  await axiosClient.delete(`/flowcharts/${id}`);
}


// ─── Archive Types ───────────────────────────────────────────

export interface ArchivePayload {
  change_reason: string;
  eco_number?: string;
}

export interface UserMinimalRead {
  id: number;
  full_name?: string | null;
  email?: string | null;
  employment_position?: string | null;
}

export interface DocumentVersionRead {
  id: number;
  document_type: string;
  document_id: number;
  revision_number: number;
  change_reason: string;
  created_by: number;
  created_at: string;
  original_creation_date: string;
  observations?: string | null;
  snapshot_data?: Record<string, any> | null;
  is_initial_revision: boolean;
  creator?: UserMinimalRead | null;
}

export interface AuditLogRead {
  id: number;
  action: string;
  performed_by: number;
  action_details?: string | null;
  previous_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  performed_at: string;
  performer?: UserMinimalRead | null;
}

export interface FlowchartHistoryRead {
  flowchart_id: number;
  versions: DocumentVersionRead[];
  audit_logs: AuditLogRead[];
}

// ─── Archive Service Functions ───────────────────────────────

/**
 * Archive a flowchart: updates status, creates DocumentVersion snapshot,
 * inserts AuditLog entry, and sends email notifications to the team.
 * PATCH /flowcharts/:id/archive
 */
export async function archiveFlowchart(
  id: number,
  payload: ArchivePayload,
): Promise<FlowchartRead> {
  const { data } = await axiosClient.patch<FlowchartRead>(
    `/flowcharts/${id}/archive`,
    payload,
  );
  return data;
}

/**
 * Retrieve the complete version history and audit trail for a flowchart.
 * GET /flowcharts/:id/history
 */
export async function getFlowchartHistory(
  id: number,
): Promise<FlowchartHistoryRead> {
  const { data } = await axiosClient.get<FlowchartHistoryRead>(
    `/flowcharts/${id}/history`,
  );
  return data;
}
