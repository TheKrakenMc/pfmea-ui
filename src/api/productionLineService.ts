import axiosClient from './axiosClient';

export interface ProductionLine {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductionLineCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface ProductionLineUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export const productionLineService = {
  list: async (activeOnly: boolean = false): Promise<ProductionLine[]> => {
    const response = await axiosClient.get('/production-lines/', {
      params: { active_only: activeOnly, limit: 500 }
    });
    return response.data;
  },

  get: async (id: number): Promise<ProductionLine> => {
    const response = await axiosClient.get(`/production-lines/${id}`);
    return response.data;
  },

  create: async (data: ProductionLineCreate): Promise<ProductionLine> => {
    const response = await axiosClient.post('/production-lines/', data);
    return response.data;
  },

  update: async (id: number, data: ProductionLineUpdate): Promise<ProductionLine> => {
    const response = await axiosClient.put(`/production-lines/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/production-lines/${id}`);
  }
};
