export interface Customer {
  id: number;
  plant_id: number;
  customer_code: string;
  company_name: string;
  tax_registry: string | null;
  status: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  contact_email: string | null;
  logo_url: string | null;
  brand_logo_url: string | null;
  provider_code: string | null;
  observations: string | null;
  safety_characteristic: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreatePayload {
  plant_id: number;
  customer_code: string;
  company_name: string;
  tax_registry?: string | null;
  status?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  contact_email?: string | null;
  logo_url?: string | null;
  brand_logo_url?: string | null;
  provider_code?: string | null;
  observations?: string | null;
  safety_characteristic?: string | null;
}

export interface CustomerUpdatePayload {
  customer_code?: string;
  company_name?: string;
  tax_registry?: string | null;
  status?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  contact_email?: string | null;
  logo_url?: string | null;
  brand_logo_url?: string | null;
  provider_code?: string | null;
  observations?: string | null;
  safety_characteristic?: string | null;
  is_active?: boolean;
}
