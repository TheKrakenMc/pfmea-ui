import axiosClient from './axiosClient';

// Models
export interface TeamMember {
  id?: number;
  user_id: number;
  role_in_team: string;
  department?: string;
  assigned_at?: string;
  user_full_name?: string;
  is_active?: boolean;
}

export interface TeamMemberCreate {
  user_id: number;
  role_in_team: string;
  department: string;
}

export interface PfmeaHeader {
  id: number;
  pfmea_id_number: string;
  flowchart_id?: number;
  project_name: string;
  customer: string;
  original_launch_date?: string;
  moc_status: string;
  status?: string;
  part_number?: string;
  product_description?: string;
  product_family_id?: number;
  production_line_id?: number;
  confidentiality_level?: string;
  plant_id?: number;
  owner_id?: number;
  version: number;
  start_date?: string;
  revision_date?: string;
  created_at: string;
  updated_at: string;
  team_members: TeamMember[];
  worksheet_row_count?: number;
  high_priority_count?: number;
}

export interface PfmeaHeaderCreate {
  flowchart_id: number;
  project_name: string;
  customer: string;
  original_launch_date?: string;
  part_number?: string;
  product_description?: string;
  product_family_id?: number;
  production_line_id?: number;
  confidentiality_level?: string;
  team_members?: Partial<TeamMember>[];
}

export interface PfmeaHeaderUpdate {
  project_name?: string;
  customer?: string;
  original_launch_date?: string;
  part_number?: string;
  product_description?: string;
  product_family_id?: number;
  production_line_id?: number;
  confidentiality_level?: string;
  revision_date?: string;
  version?: number;
  plant_id?: number;
  pfmea_id_number?: string;
  moc_status?: string;
}

export interface WorksheetRow {
  id: number;
  pfmea_id: number;
  flowchart_step_id?: number;
  process_item_name?: string;
  station_operation?: string;
  work_element_process?: string;
  operation_type?: string;
  function_process_item_plant?: string;
  function_process_item_customer?: string;
  function_process_item_end_user?: string;
  function_process_step?: string;
  product_characteristic?: string;
  function_work_element?: string;
  process_characteristic?: string;
  failure_mode?: string;
  failure_effect_plant?: string;
  failure_effect_customer?: string;
  failure_effect_end_user?: string;
  severity?: number;
  failure_cause?: string;
  occurrence?: number;
  prevention_controls?: string;
  detection_controls?: string;
  detection?: number;
  action_priority?: string;
  special_characteristics?: string;
  optimization_prevention_action?: string;
  optimization_detection_action?: string;
  responsible_person_id?: number;
  responsible_person_name?: string;
  target_completion_date?: string;
  action_status?: string;
  actions_taken?: string;
  completion_date?: string;
  new_severity?: number;
  new_occurrence?: number;
  new_detection?: number;
  new_action_priority?: string;
  new_special_characteristics?: string;
  observations?: string;
  sequence_order?: number;
}

export interface WorksheetRowCreate extends Partial<WorksheetRow> {}
export interface WorksheetRowUpdate extends Partial<WorksheetRow> {}

export interface PfmeaTask {
  row_id: int;
  pfmea_id: int;
  pfmea_id_number?: string;
  project_name?: string;
  failure_mode?: string;
  action_priority?: string;
  optimization_prevention_action?: string;
  optimization_detection_action?: string;
  target_completion_date?: string;
  action_status?: string;
}

export interface AuditLog {
  id: number;
  action: string;
  performed_by: string;
  action_details: string;
  entity_type: string;
  entity_id: number;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  previous_values?: Record<string, any>;
  new_values?: Record<string, any>;
  performed_at: string;
}

// API Service
export const pfmeaService = {
  // --- Header CRUD ---
  createAnalysis: async (data: PfmeaHeaderCreate): Promise<PfmeaHeader> => {
    const response = await axiosClient.post('/pfmea-project/', data);
    return response.data;
  },

  listAnalyses: async (params?: { skip?: number; limit?: number; status?: string }): Promise<PfmeaHeader[]> => {
    const response = await axiosClient.get('/pfmea-project/', { params });
    return response.data;
  },

  getAnalysis: async (id: number): Promise<PfmeaHeader & { worksheet_rows: WorksheetRow[] }> => {
    const response = await axiosClient.get(`/pfmea-project/${id}`);
    return response.data;
  },

  updateAnalysis: async (id: number, data: PfmeaHeaderUpdate): Promise<PfmeaHeader> => {
    const response = await axiosClient.put(`/pfmea-project/${id}`, data);
    return response.data;
  },

  addTeamMember: async (id: number, data: TeamMemberCreate): Promise<TeamMember> => {
    const response = await axiosClient.post(`/pfmea-project/${id}/team`, data);
    return response.data;
  },

  removeTeamMember: async (pfmeaId: number, memberId: number): Promise<void> => {
    await axiosClient.delete(`/pfmea-project/${pfmeaId}/team/${memberId}`);
  },

  // --- MOC Transitions ---
  transitionStatus: async (id: number, new_status: string): Promise<PfmeaHeader> => {
    const response = await axiosClient.patch(`/pfmea-project/${id}/status`, { new_status });
    return response.data;
  },

  // --- Flowchart Sync ---
  syncFlowchart: async (id: number): Promise<WorksheetRow[]> => {
    const response = await axiosClient.post(`/pfmea-project/${id}/sync-flowchart`);
    return response.data;
  },

  // --- Worksheet Rows ---
  getWorksheet: async (id: number): Promise<WorksheetRow[]> => {
    const response = await axiosClient.get(`/pfmea-project/${id}/worksheet`);
    return response.data;
  },

  createWorksheetRow: async (id: number, data: WorksheetRowCreate): Promise<WorksheetRow> => {
    const response = await axiosClient.post(`/pfmea-project/${id}/worksheet`, data);
    return response.data;
  },

  updateWorksheetRow: async (pfmeaId: number, rowId: number, data: WorksheetRowUpdate): Promise<WorksheetRow> => {
    const response = await axiosClient.patch(`/pfmea-project/${pfmeaId}/worksheet/${rowId}`, data);
    return response.data;
  },

  bulkUpdateWorksheet: async (pfmeaId: number, data: WorksheetRowUpdate[]): Promise<WorksheetRow[]> => {
    const response = await axiosClient.put(`/pfmea-project/${pfmeaId}/worksheet/bulk`, data);
    return response.data;
  },

  deleteWorksheetRow: async (pfmeaId: number, rowId: number): Promise<void> => {
    await axiosClient.delete(`/pfmea-project/${pfmeaId}/worksheet/${rowId}`);
  },

  // --- Tasks ---
  getMyTasks: async (params?: { skip?: number; limit?: number }): Promise<PfmeaTask[]> => {
    const response = await axiosClient.get('/pfmea-project/my-tasks', { params });
    return response.data;
  },

  // --- Audit Log ---
  getAuditLog: async (id: number, params?: { skip?: number; limit?: number }): Promise<AuditLog[]> => {
    const response = await axiosClient.get(`/pfmea-project/${id}/audit-log`, { params });
    return response.data;
  },
};
