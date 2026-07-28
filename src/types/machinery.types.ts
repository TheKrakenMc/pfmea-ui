export interface Machinery {
  id: number;
  machinery_name: string;
  machinery_code: string;
  plant_id: number;
  location_id?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MachineryCreatePayload {
  machinery_name: string;
  machinery_code: string;
  plant_id: number;
  location_id?: number;
  is_active?: boolean;
}

export interface MachineryUpdatePayload {
  machinery_name?: string;
  machinery_code?: string;
  plant_id?: number;
  location_id?: number;
  is_active?: boolean;
}
