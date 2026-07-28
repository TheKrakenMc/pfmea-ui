// ─────────────────────────────────────────────────────────────
//  useTechnology — React Query hooks for Technology CRUD
//  Follows project conventions: axiosClient → service → hook
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  listTechnologies,
  createTechnology,
  updateTechnology,
  deleteTechnology,
  getTechnologyImpact,
  listTechnologyCategories,
  createTechnologyCategory,
  updateTechnologyCategory,
  deleteTechnologyCategory,
} from '../services/technologyService';
import type { TechnologyCategory } from '../types/technology.types';

const CATEGORIES_KEY = ['technologyCategories'] as const;

export function useTechnologyCategories() {
  return useQuery<TechnologyCategory[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: () => listTechnologyCategories(),
  });
}

export function useCreateTechnologyCategory() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation<TechnologyCategory, Error, { name: string; description?: string }>({
    mutationFn: (payload) => createTechnologyCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success(t('technologies.categories.createSuccess', 'Category created successfully'));
    },
    onError: (error) => {
      toast.error(t('technologies.categories.createError', 'Error creating category'));
      console.error(error);
    },
  });
}

export function useUpdateTechnologyCategory() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation<TechnologyCategory, Error, { id: number; name?: string; description?: string }>({
    mutationFn: ({ id, ...payload }) => updateTechnologyCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success(t('technologies.categories.updateSuccess', 'Category updated successfully'));
    },
    onError: (error) => {
      toast.error(t('technologies.categories.updateError', 'Error updating category'));
      console.error(error);
    },
  });
}

export function useDeleteTechnologyCategory() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteTechnologyCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success(t('technologies.categories.deleteSuccess', 'Category deleted successfully'));
    },
    onError: (error) => {
      toast.error(t('technologies.categories.deleteError', 'Error deleting category'));
      console.error(error);
    },
  });
}
import type {
  Technology,
  TechnologyCreatePayload,
  TechnologyUpdatePayload,
  TechnologyImpact,
} from '../types/technology.types';

const TECHNOLOGIES_KEY = ['technologies'] as const;

// ── Technology List ────────────────────────────────────────────────────────

/**
 * Fetch the list of active technologies.
 * `useTechnology` is the default export for the page-level query.
 */
export function useTechnology(params?: {
  skip?: number;
  limit?: number;
  q?: string;
  category?: string;
}) {
  return useQuery<Technology[]>({
    queryKey: [...TECHNOLOGIES_KEY, params],
    queryFn: () => listTechnologies(params),
  });
}

/** Alias kept for backward-compatibility with TechnologyTable import. */
export const useTechnologyList = useTechnology;

// ── Technology Mutations ───────────────────────────────────────────────────

export function useCreateTechnology() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation<Technology, Error, TechnologyCreatePayload>({
    mutationFn: (payload) => createTechnology(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TECHNOLOGIES_KEY });
      toast.success(t('technologies.toast.createSuccess'));
    },
    onError: (error) => {
      toast.error(t('technologies.toast.createError'));
      console.error(error);
    },
  });
}

export function useUpdateTechnology() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation<Technology, Error, { id: number } & TechnologyUpdatePayload>({
    mutationFn: ({ id, ...payload }) => updateTechnology(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TECHNOLOGIES_KEY });
      toast.success(t('technologies.toast.updateSuccess'));
    },
    onError: (error) => {
      toast.error(t('technologies.toast.updateError'));
      console.error(error);
    },
  });
}

export function useDeleteTechnology() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteTechnology(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TECHNOLOGIES_KEY });
      toast.success(t('technologies.toast.deleteSuccess'));
    },
    onError: (error) => {
      toast.error(t('technologies.toast.deleteError'));
      console.error(error);
    },
  });
}

// ── Technology Impact ──────────────────────────────────────────────────────

export function useTechnologyImpact(techId: number) {
  return useQuery<TechnologyImpact>({
    queryKey: [...TECHNOLOGIES_KEY, techId, 'impact'],
    queryFn: () => getTechnologyImpact(techId),
    enabled: !!techId,
  });
}

// ── Technology Categories ────────────────────────────────────────────────────
// Moved to the top

// ── Technology Parameters ──────────────────────────────────────────────────

import {
  listTechnologyParameters,
  createTechnologyParameter,
  updateTechnologyParameter,
  deleteTechnologyParameter,
  type TechnologyParameter,
  type TechnologyParameterCreatePayload,
} from '../services/technologyService';

export function useTechnologyParameters(techId: number) {
  return useQuery<TechnologyParameter[]>({
    queryKey: [...TECHNOLOGIES_KEY, techId, 'parameters'],
    queryFn: () => listTechnologyParameters(techId),
    enabled: !!techId,
  });
}

export function useCreateTechnologyParameter(techId: number) {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation<TechnologyParameter, Error, TechnologyParameterCreatePayload>({
    mutationFn: (payload) => createTechnologyParameter(techId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...TECHNOLOGIES_KEY, techId, 'parameters'] });
      // We don't always need toast here if we save them in bulk, but for safety:
      // toast.success(t('technologies.parameters.createSuccess', 'Parameter created successfully'));
    },
    onError: (error) => {
      toast.error(t('technologies.parameters.createError', 'Error creating parameter'));
      console.error(error);
    },
  });
}

export function useUpdateTechnologyParameter(techId: number) {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation<TechnologyParameter, Error, { paramId: number } & Partial<TechnologyParameterCreatePayload>>({
    mutationFn: ({ paramId, ...payload }) => updateTechnologyParameter(paramId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...TECHNOLOGIES_KEY, techId, 'parameters'] });
    },
    onError: (error) => {
      toast.error(t('technologies.parameters.updateError', 'Error updating parameter'));
      console.error(error);
    },
  });
}

export function useDeleteTechnologyParameter(techId: number) {
  const qc = useQueryClient();
  const { t } = useTranslation();
  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteTechnologyParameter(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...TECHNOLOGIES_KEY, techId, 'parameters'] });
    },
    onError: (error) => {
      toast.error(t('technologies.parameters.deleteError', 'Error deleting parameter'));
      console.error(error);
    },
  });
}
