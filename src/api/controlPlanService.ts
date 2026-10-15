import axiosClient from './axiosClient';

export interface ControlPlanItem {
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

export interface ControlPlanCreate {
  title: string;
  status?: string;
  observations?: string;
}

export const controlPlanService = {
  reopen:async(id:number,reason:string,version:number):Promise<ControlPlan> => (await axiosClient.post(`/control-plans/${id}/restore`,{reason},{headers:{"If-Match":String(version)}})).data,
  reviewSource: async (id:number,keep:boolean,reason:string,version:number):Promise<ControlPlanItem> => {
    return (await axiosClient.post('/control-plans/items/'+id+'/review-source',{keep,reason},{headers:{'If-Match':String(version)}})).data;
  },
  list: async (params: { skip?: number; limit?: number; search?: string; status?: string; customers?: string; sort?: string } = {}): Promise<{ items: ControlPlan[]; total: number }> => {
    return (await axiosClient.get('/control-plans/', { params })).data;
  },
  transition: async (id: number, newStatus: string, version: number): Promise<ControlPlan> => {
    return (await axiosClient.patch('/control-plans/' + id + '/status', { new_status: newStatus }, { headers: { 'If-Match': String(version) } })).data;
  },
  getControlPlanByPfmea: async (pfmeaId: number): Promise<ControlPlan> => {
    const response = await axiosClient.get(`/control-plans/project/${pfmeaId}`);
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
  }
};
