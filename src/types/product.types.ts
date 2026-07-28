export interface MeasurementUnit {
  id: number;
  description: string;
  symbology: string;
  magnitude: string;
}

export interface Technology {
  id: number;
  name: string;
  operation_name?: string;
  plant_id: number | null;
}

export interface ProductCustomer {
  id: number;
  company_name: string;
  customer_code: string;
}

export interface ProductParameter {
  id: number;
  product_id: number;
  technology_id?: number | null;
  name: string;
  measurement_unit_id?: number | null;
  measurement_unit?: MeasurementUnit | null;
  target_value?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  is_critical: boolean;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface ProductParameterCreatePayload {
  name: string;
  technology_id?: number | null;
  measurement_unit_id?: number | null;
  target_value?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  is_critical?: boolean;
  order_index?: number;
}

export interface ProductParameterUpdatePayload {
  name?: string;
  technology_id?: number | null;
  measurement_unit_id?: number | null;
  target_value?: number | null;
  min_value?: number | null;
  max_value?: number | null;
  is_critical?: boolean;
  is_active?: boolean;
  order_index?: number;
}

export interface Product {
  id: number;
  part_number: string | null;
  customer_part_number: string | null;
  description: string | null;
  engineering_level: string | null;
  drawing: string | null;
  stage: string | null;
  image_url: string | null;
  dimensions: string | null;
  weight: number | null;
  cycle_time: number | null;
  rate_per_hour: number | null;
  status: string | null;
  version: number;
  is_active: boolean;
  product_family_id?: number | null;
  production_line_id?: number | null;
  customer: ProductCustomer | null;
  technologies: Technology[];
  parameters: ProductParameter[];
  created_at: string;
  updated_at: string;
}

export interface ProductCreatePayload {
  plant_id?: number | null;
  customer_id?: number | null;
  part_number: string;
  customer_part_number?: string | null;
  description?: string | null;
  engineering_level?: string | null;
  drawing?: string | null;
  stage?: string | null;
  dimensions?: string | null;
  weight?: number | null;
  cycle_time?: number | null;
  rate_per_hour?: number | null;
  image_url?: string | null;
  product_family_id?: number | null;
  production_line_id?: number | null;
  technology_ids: number[];
}

export interface ProductUpdatePayload {
  part_number?: string;
  customer_part_number?: string | null;
  description?: string | null;
  engineering_level?: string | null;
  drawing?: string | null;
  stage?: string | null;
  dimensions?: string | null;
  weight?: number | null;
  cycle_time?: number | null;
  rate_per_hour?: number | null;
  image_url?: string | null;
  customer_id?: number | null;
  product_family_id?: number | null;
  production_line_id?: number | null;
  status?: string;
  technology_ids?: number[];
}

export interface DocumentVersion {
  id: number;
  document_type: string;
  document_id: number;
  revision_number: number;
  change_reason: string;
  observations?: string | null;
  snapshot_data?: any;
  is_initial_revision: boolean;
  created_by: number;
  created_at: string;
  original_creation_date: string;
}

export interface ProductRevisionCreatePayload {
  change_reason: string;
  engineering_level: string;
}

export interface ProductStatusUpdatePayload {
  status: 'Draft' | 'In Review' | 'Released' | 'Archived';
}
