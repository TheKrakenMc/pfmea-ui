import axiosClient from '../api/axiosClient';
import type { Machinery, MachineryCreatePayload, MachineryUpdatePayload } from '../types/machinery.types';

export async function listMachinery(params?: {
  skip?: number;
  limit?: number;
  q?: string;
  is_active?: boolean;
  plant_id?: number;
}): Promise<Machinery[]> {
  const { data } = await axiosClient.get<Machinery[]>('/machinery', { params });
  return data;
}

export async function getMachinery(id: number): Promise<Machinery> {
  const { data } = await axiosClient.get<Machinery>(`/machinery/${id}`);
  return data;
}

export async function createMachinery(payload: MachineryCreatePayload): Promise<Machinery> {
  const { data } = await axiosClient.post<Machinery>('/machinery', payload);
  return data;
}

export async function updateMachinery(id: number, payload: MachineryUpdatePayload): Promise<Machinery> {
  const { data } = await axiosClient.put<Machinery>(`/machinery/${id}`, payload);
  return data;
}

export async function deleteMachinery(id: number): Promise<void> {
  await axiosClient.delete(`/machinery/${id}`);
}
