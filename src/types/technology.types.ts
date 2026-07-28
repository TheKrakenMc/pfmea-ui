// ─────────────────────────────────────────────────────────────
//  Technology & Parameter type definitions
//  Mirrors the backend Pydantic schemas from app/schemas/technology.py
// ─────────────────────────────────────────────────────────────



export interface Technology {
  id: number;
  code: string;
  name: string;
  category?: string;
  description?: string;
  is_active: boolean;
  suggested_parameters?: Record<string, any>;
  plant_ids?: number[];
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at?: string | null;
  parameters?: any[];
}

export interface TechnologyCreatePayload {
  code: string;
  name: string;
  category?: string;
  description?: string;
  suggested_parameters?: Record<string, any>;
  plant_ids?: number[];
  is_active?: boolean;
  is_active?: boolean;
}

export interface TechnologyUpdatePayload {
  code?: string;
  name?: string;
  category?: string;
  description?: string;
  suggested_parameters?: Record<string, any>;
  is_active?: boolean;
}

export interface TechnologyImpact {
  flowcharts_count: number;
  products_count: number;
}

export interface TechnologyCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}
