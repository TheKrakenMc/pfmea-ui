import axiosClient from '../api/axiosClient';
import type { 
  Product, 
  ProductCreatePayload, 
  ProductUpdatePayload, 
  Technology,
  ProductParameter,
  ProductParameterCreatePayload,
  ProductParameterUpdatePayload
} from '../types/product.types';

export async function listProducts(params?: {
  skip?: number;
  limit?: number;
  q?: string;
  status?: string;
  customer_id?: number;
}): Promise<Product[]> {
  const { data } = await axiosClient.get<Product[]>('/products', { params });
  return data;
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await axiosClient.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(payload: ProductCreatePayload): Promise<Product> {
  const { data } = await axiosClient.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(id: number, payload: ProductUpdatePayload): Promise<Product> {
  const { data } = await axiosClient.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await axiosClient.delete(`/products/${id}`);
}

export async function listTechnologies(): Promise<Technology[]> {
  const { data } = await axiosClient.get<Technology[]>('/technologies');
  return data;
}

export async function uploadImage(file: File): Promise<{ filename: string, path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await axiosClient.post<{ filename: string, path: string }>('/products/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}

// ── Product Parameter CRUD ──────────────────────────────────────────────

export async function listProductParameters(productId: number): Promise<ProductParameter[]> {
  const { data } = await axiosClient.get<ProductParameter[]>(
    `/products/${productId}/parameters`
  );
  return data;
}

export async function createProductParameter(
  productId: number,
  payload: ProductParameterCreatePayload,
): Promise<ProductParameter> {
  const { data } = await axiosClient.post<ProductParameter>(
    `/products/${productId}/parameters`,
    payload,
  );
  return data;
}

export async function updateProductParameter(
  paramId: number,
  payload: ProductParameterUpdatePayload,
): Promise<ProductParameter> {
  const { data } = await axiosClient.put<ProductParameter>(
    `/products/parameters/${paramId}`,
    payload,
  );
  return data;
}

export async function deleteProductParameter(paramId: number): Promise<void> {
  await axiosClient.delete(`/products/parameters/${paramId}`);
}

// ── Product Versioning & History ────────────────────────────────────────

export async function createProductRevision(
  productId: number,
  payload: { change_reason: string; engineering_level: string }
): Promise<any> {
  const { data } = await axiosClient.post(`/products/${productId}/revisions`, payload);
  return data;
}

export async function updateProductStatus(
  productId: number,
  payload: { status: 'Draft' | 'In Review' | 'Released' | 'Archived' }
): Promise<Product> {
  const { data } = await axiosClient.put<Product>(`/products/${productId}/status`, payload);
  return data;
}

export async function getProductHistory(productId: number): Promise<any[]> {
  const { data } = await axiosClient.get<any[]>(`/products/${productId}/history`);
  return data;
}
