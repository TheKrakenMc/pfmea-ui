import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProductParameters,
  createProductParameter,
  updateProductParameter,
  deleteProductParameter,
} from '../services/productService';
import type {
  ProductParameter,
  ProductParameterCreatePayload,
  ProductParameterUpdatePayload,
} from '../types/product.types';

const PRODUCT_PARAMS_KEY = (productId: number) => ['products', productId, 'parameters'] as const;
const PRODUCTS_KEY = ['products'] as const;

export function useProductParameters(productId: number) {
  return useQuery<ProductParameter[]>({
    queryKey: PRODUCT_PARAMS_KEY(productId),
    queryFn: () => listProductParameters(productId),
    enabled: !!productId,
  });
}

export function useCreateProductParameter(productId: number) {
  const qc = useQueryClient();
  return useMutation<ProductParameter, Error, ProductParameterCreatePayload>({
    mutationFn: (payload) => createProductParameter(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCT_PARAMS_KEY(productId) });
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

export function useUpdateProductParameter(productId: number) {
  const qc = useQueryClient();
  return useMutation<ProductParameter, Error, { paramId: number } & ProductParameterUpdatePayload>({
    mutationFn: ({ paramId, ...payload }) => updateProductParameter(paramId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCT_PARAMS_KEY(productId) });
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

export function useDeleteProductParameter(productId: number) {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (paramId) => deleteProductParameter(paramId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCT_PARAMS_KEY(productId) });
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}
