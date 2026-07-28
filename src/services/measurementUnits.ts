import api from '../api/axiosClient';
import type { MeasurementUnit } from '../types/product.types';

export const getMeasurementUnits = async (): Promise<MeasurementUnit[]> => {
  const { data } = await api.get('/measurement-units/');
  return data;
};

export const getMeasurementUnit = async (id: number): Promise<MeasurementUnit> => {
  const { data } = await api.get(`/measurement-units/${id}`);
  return data;
};

export const createMeasurementUnit = async (payload: Omit<MeasurementUnit, 'id'>): Promise<MeasurementUnit> => {
  const { data } = await api.post('/measurement-units/', payload);
  return data;
};

export const updateMeasurementUnit = async (
  id: number,
  payload: Partial<Omit<MeasurementUnit, 'id'>>
): Promise<MeasurementUnit> => {
  const { data } = await api.put(`/measurement-units/${id}`, payload);
  return data;
};

export const deleteMeasurementUnit = async (id: number): Promise<void> => {
  await api.delete(`/measurement-units/${id}`);
};
