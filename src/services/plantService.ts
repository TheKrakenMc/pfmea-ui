import axiosClient from '../api/axiosClient';

export interface Plant {
  id: number;
  name: string | null;
  code: string | null;
  is_active: boolean;
}

export async function listPlants(): Promise<Plant[]> {
  const { data } = await axiosClient.get<Plant[]>('/plants');
  return data;
}
