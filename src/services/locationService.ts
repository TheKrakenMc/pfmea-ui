import api from '../api/axiosClient';

export interface ManufacturingLocation {
  id: number;
  plant_id: number;
  location_code: string;
  location_name: string;
  location_type?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export const listLocations = async (): Promise<ManufacturingLocation[]> => {
  // Using plant_id=1 as default for now based on typical seed data, but could be dynamic
  const response = await api.get('/manufacturing_locations', { params: { plant_id: 1 } });
  return response.data;
};

export const createLocation = async (data: Partial<ManufacturingLocation>): Promise<ManufacturingLocation> => {
  const payload = { ...data, plant_id: 1 };
  const response = await api.post('/manufacturing_locations', payload);
  return response.data;
};

export const updateLocation = async (id: number, data: Partial<ManufacturingLocation>): Promise<ManufacturingLocation> => {
  const response = await api.put(`/manufacturing_locations/${id}`, data);
  return response.data;
};

export const deleteLocation = async (id: number): Promise<void> => {
  await api.delete(`/manufacturing_locations/${id}`);
};
