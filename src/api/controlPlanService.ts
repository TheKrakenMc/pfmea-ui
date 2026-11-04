import axiosClient from './axiosClient';

export type ControlPlanPhase = 'Prototype' | 'Pre-launch' | 'Production';
export const controlPlanPhaseLabels: Record<ControlPlanPhase, string> = {
  Prototype: 'Prototipo', 'Pre-launch': 'Prelanzamiento', Production: 'Producción',
};

export interface ControlPlanItem {
  origin?: string | null;
  pfmea_worksheet_row_id?: number | null;
  source_row_id?: number | null;
  needs_review: boolean;
  is_active?: boolean;
  source_reviewed?: boolean;
  source_review_reason?: string;
  characteristic?: string | null;
  classification?: "CC" | "SC" | null;
  specification?: string | null;
  unit_id?: number | null;
  measurement_method?: string | null;
  sample_size?: number | null;
  sample_size_text?: string | null;
  control_method?: string | null;
  sample_frequency?: string | null;
  responsible_person_id?: number | null;
  reaction_plan?: string | null;
  id: number;
  control_plan_id: number;
  process_failure_mode_id?: number;
  process_parameter_control_id?: number;
  item_sequence: number;
  item_name: string;
}

export type ControlPlanItemUpdate = Partial<Omit<ControlPlanItem, "id" | "control_plan_id" | "pfmea_worksheet_row_id" | "source_row_id" | "needs_review">>;

export interface ControlPlan {
  phase?: ControlPlanPhase | null;
  root_plan_id?: number | null;
  previous_revision_id?: number | null;
  revision_reason?: string | null;
  id: number;
  pfmea_project_id: number;
  flowchart_id: number;
  control_plan_code: string;
  title: string;
  status: string;
  observations?: string;
  version: number;
  lock_version: number;
  needs_review: boolean;
  start_date: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  items: ControlPlanItem[];
}

export interface ControlPlanManualItemInput {
  item_name: string;
  item_sequence?: number;
  characteristic?: string;
  classification?: 'CC' | 'SC' | null;
  specification?: string;
  unit_id?: number | null;
  measurement_method?: string;
  sample_size_text?: string;
  control_method?: string;
  sample_frequency?: string;
  responsible_person_id?: number | null;
  reaction_plan?: string;
}

export interface ControlPlanCreate {
  phase?: ControlPlanPhase;
  title: string;
  status?: string;
  observations?: string;
}

export const controlPlanService = {
  getById: async (id: number): Promise<ControlPlan> => (await axiosClient.get(`/control-plans/${id}`)).data,
  revisions: async (id: number): Promise<ControlPlan[]> => {
    const revisions: ControlPlan[] = [];
    while (true) {
      const page: ControlPlan[] = (await axiosClient.get(`/control-plans/${id}/revisions`, {params: {skip: revisions.length, limit: 200}})).data;
      revisions.push(...page);
      if (page.length < 200) return revisions;
    }
  },
  reopen:async(id:number,reason:string,version:number):Promise<ControlPlan> => (await axiosClient.post(`/control-plans/${id}/revisions`,{reason},{headers:{"If-Match":String(version)}})).data,
  reviewSource: async (id:number,keep:boolean,reason:string,version:number):Promise<ControlPlanItem> => {
    return (await axiosClient.post('/control-plans/items/'+id+'/review-source',{keep,reason},{headers:{'If-Match':String(version)}})).data;
  },
  list: async (params: { skip?: number; limit?: number; search?: string; status?: string; customers?: string; sort?: string } = {}): Promise<{ items: ControlPlan[]; total: number }> => {
    return (await axiosClient.get('/control-plans/', { params })).data;
  },
  transition: async (id: number, newStatus: string, version: number): Promise<ControlPlan> => {
    return (await axiosClient.patch('/control-plans/' + id + '/status', { new_status: newStatus }, { headers: { 'If-Match': String(version) } })).data;
  },
  getControlPlanByPfmea: async (pfmeaId: number, phase?: ControlPlanPhase): Promise<ControlPlan> => {
    const response = await axiosClient.get(`/control-plans/project/${pfmeaId}`, {params: phase ? {phase} : undefined});
    return response.data;
  },

  createControlPlan: async (pfmeaId: number, data: ControlPlanCreate): Promise<ControlPlan> => {
    const response = await axiosClient.post(`/control-plans/project/${pfmeaId}`, data);
    return response.data;
  },

  syncFromPfmea: async (controlPlanId: number): Promise<ControlPlan> => {
    const response = await axiosClient.post(`/control-plans/${controlPlanId}/sync-from-pfmea`);
    return response.data;
  },

  updateItem: async (itemId: number, data: ControlPlanItemUpdate, version: number): Promise<ControlPlanItem> => {
    const response = await axiosClient.put(`/control-plans/items/${itemId}`, data, { headers: { 'If-Match': String(version) } });
    return response.data;
  },
  addManualItem: async (controlPlanId: number, data: ControlPlanManualItemInput): Promise<ControlPlanItem> => {
    const response = await axiosClient.post(`/control-plans/${controlPlanId}/items`, data);
    return response.data;
  },
  deleteItem: async (itemId: number): Promise<void> => {
    await axiosClient.delete(`/control-plans/items/${itemId}`);
  }
};
