import axiosClient from '../api/axiosClient';
import type { Customer, CustomerCreatePayload, CustomerUpdatePayload } from '../types/customer.types';

export async function listCustomers(params?: {
  skip?: number;
  limit?: number;
  q?: string;
  status?: string;
  plant_id?: number;
}): Promise<Customer[]> {
  const { data } = await axiosClient.get<Customer[]>('/customers', { params });
  return data;
}

export async function getCustomer(id: number): Promise<Customer> {
  const { data } = await axiosClient.get<Customer>(`/customers/${id}`);
  return data;
}

export async function createCustomer(payload: CustomerCreatePayload): Promise<Customer> {
  const { data } = await axiosClient.post<Customer>('/customers', payload);
  return data;
}

export async function updateCustomer(id: number, payload: CustomerUpdatePayload): Promise<Customer> {
  const { data } = await axiosClient.put<Customer>(`/customers/${id}`, payload);
  return data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await axiosClient.delete(`/customers/${id}`);
}
