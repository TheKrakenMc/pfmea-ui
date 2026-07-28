import axiosClient from './axiosClient';

export interface Department {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentCreate {
  name: string;
}

export interface DepartmentUpdate {
  name?: string;
  is_active?: boolean;
}

export const departmentService = {
  list: async (): Promise<Department[]> => {
    const response = await axiosClient.get('/departments/');
    return response.data;
  },

  create: async (data: DepartmentCreate): Promise<Department> => {
    const response = await axiosClient.post('/departments/', data);
    return response.data;
  },

  update: async (id: number, data: DepartmentUpdate): Promise<Department> => {
    const response = await axiosClient.put(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/departments/${id}`);
  }
};
