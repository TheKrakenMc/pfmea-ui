// ─────────────────────────────────────────────────────────────
//  Technology Service — Centralized API calls via axiosClient
// ─────────────────────────────────────────────────────────────

import axiosClient from '../api/axiosClient';
import type {
  Technology,
  TechnologyCreatePayload,
  TechnologyUpdatePayload,
  TechnologyImpact,
  TechnologyCategory,
} from '../types/technology.types';

export type { TechnologyCategory };

// ── Technology CRUD ────────────────────────────────────────────────────────

export async function listTechnologies(params?: {
  skip?: number;
  limit?: number;
  q?: string;
  category?: string;
}): Promise<Technology[]> {
  const { data } = await axiosClient.get<Technology[]>('/technologies', { params });
  return data;
}

export async function getTechnology(id: number): Promise<Technology> {
  const { data } = await axiosClient.get<Technology>(`/technologies/${id}`);
  return data;
}

export async function createTechnology(payload: TechnologyCreatePayload): Promise<Technology> {
  const { data } = await axiosClient.post<Technology>('/technologies', payload);
  return data;
}

export async function updateTechnology(id: number, payload: TechnologyUpdatePayload): Promise<Technology> {
  const { data } = await axiosClient.put<Technology>(`/technologies/${id}`, payload);
  return data;
}

export async function deleteTechnology(id: number): Promise<void> {
  await axiosClient.delete(`/technologies/${id}`);
}

export async function getTechnologyImpact(id: number): Promise<TechnologyImpact> {
  const { data } = await axiosClient.get<TechnologyImpact>(`/technologies/${id}/impact`);
  return data;
}


// ── Technology Categories CRUD ─────────────────────────────────────────────

export interface TechnologyCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export async function listTechnologyCategories(): Promise<TechnologyCategory[]> {
  const { data } = await axiosClient.get<TechnologyCategory[]>('/technology-categories');
  return data;
}

export async function createTechnologyCategory(payload: { name: string; description?: string }): Promise<TechnologyCategory> {
  const { data } = await axiosClient.post<TechnologyCategory>('/technology-categories', payload);
  return data;
}

export async function updateTechnologyCategory(id: number, payload: { name?: string; description?: string }): Promise<TechnologyCategory> {
  const { data } = await axiosClient.put<TechnologyCategory>(`/technology-categories/${id}`, payload);
  return data;
}

export async function deleteTechnologyCategory(id: number): Promise<void> {
  await axiosClient.delete(`/technology-categories/${id}`);
}

// ── Technology Parameters CRUD ─────────────────────────────────────────────

export interface TechnologyParameter {
  id: number;
  technology_id: number;
  name: string;
  measurement_unit_id?: number | null;
  target_value?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  is_critical: boolean;
  is_active: boolean;
  measurement_unit?: {
    id: number;
    symbology: string;
    description: string;
  } | null;
}

export type TechnologyParameterCreatePayload = Omit<TechnologyParameter, 'id' | 'technology_id' | 'is_active' | 'measurement_unit'>;

export async function listTechnologyParameters(techId: number): Promise<TechnologyParameter[]> {
  const { data } = await axiosClient.get<TechnologyParameter[]>(`/technologies/${techId}/parameters`);
  return data;
}

export async function createTechnologyParameter(techId: number, payload: TechnologyParameterCreatePayload): Promise<TechnologyParameter> {
  const { data } = await axiosClient.post<TechnologyParameter>(`/technologies/${techId}/parameters`, payload);
  return data;
}

export async function updateTechnologyParameter(id: number, payload: Partial<TechnologyParameterCreatePayload>): Promise<TechnologyParameter> {
  const { data } = await axiosClient.put<TechnologyParameter>(`/technologies/parameters/${id}`, payload);
  return data;
}

export async function deleteTechnologyParameter(id: number): Promise<void> {
  await axiosClient.delete(`/technologies/parameters/${id}`);
}
