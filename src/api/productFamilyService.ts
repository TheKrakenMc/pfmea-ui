import axiosClient from './axiosClient';

export interface ProductFamily {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFamilyCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface ProductFamilyUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export const productFamilyService = {
  list: async (activeOnly: boolean = false): Promise<ProductFamily[]> => {
    const response = await axiosClient.get('/product-families/', {
      params: { active_only: activeOnly, limit: 500 }
    });
    return response.data;
  },

  get: async (id: number): Promise<ProductFamily> => {
    const response = await axiosClient.get(`/product-families/${id}`);
    return response.data;
  },

  create: async (data: ProductFamilyCreate): Promise<ProductFamily> => {
    const response = await axiosClient.post('/product-families/', data);
    return response.data;
  },

  update: async (id: number, data: ProductFamilyUpdate): Promise<ProductFamily> => {
    const response = await axiosClient.put(`/product-families/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/product-families/${id}`);
  }
};
