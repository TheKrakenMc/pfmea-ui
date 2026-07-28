// ─────────────────────────────────────────────────────────────
//  PFMEA Flowchart Module — Core Type Definitions
//  These types are the canonical source for the Flowchart
//  workspace and are designed to be consumed by the sibling
//  PFMEA analysis module.
// ─────────────────────────────────────────────────────────────

/** Status lifecycle of a flowchart diagram */
export type DiagramStatus = 'draft' | 'in_review' | 'approved' | 'archived';

/** Critical characteristic classification per AIAG/VDA */
export type CriticalFlag = 'none' | 'CC' | 'SC';

/** ISO process symbol types for flowchart visualization (Industrial Standard) */
export type SymbolType =
  | 'operation'
  | 'inspection'
  | 'transport'
  | 'storage'
  | 'delay'
  | 'auto_control'
  | 'pokayoke';

export interface Department {
  id: number;
  name: string; // ej. Producción, Calidad, Logística, Mantenimiento
  code: string; // ej. PROD, QA, LOG, MNT
  isActive: boolean;
}

export interface Machinery {
  id: number;
  machineryName: string; // ej. Inyectora 500T, Horno de Curado, Celda Robotizada
  machineryCode: string; // Número de activo interno ej. INJ-04
  plantId: number;       // Vinculación geográfica
  isActive: boolean;
}
// ─── Project-Level Metadata ──────────────────────────────────

/**
 * FlowchartHeader contains the project-level metadata that is
 * shared across the Flowchart and PFMEA modules. Changes here
 * propagate to the PFMEA analysis context.
 */
export interface FlowchartHeader {
  projectId: string;
  plantCode: string;
  plantName: string;
  region: string;
  customer: string;
  partNumber: string;
  partName: string;
  diagramStatus: DiagramStatus;
  lastModified: string;   // ISO 8601
  modifiedBy: string;
  creationDate?: string;
  revisionDate?: string;
  revision?: string;
  coverPage?: string;
  safetyCharacteristic?: string;
  confidentialityLevel?: string;
}

// ─── Process Step Row ────────────────────────────────────────

/**
 * FlowchartStep represents a single row in the process flow
 * diagram. Each step maps 1:1 to a PFMEA analysis row.
 */
export interface FlowchartStep {
  id: string;
  sequence: number;           // Multiples of 10 (10, 20, 30…)
  operationId: string;        // FK → PlantOperation.id
  operationName: string;      // Denormalized for display
  criticalFlag: CriticalFlag;
  symbolType: SymbolType;
  departmentId?: number;      // FK → Department.id
  machineryId?: number | null; // FK → Machinery.id
  isCritical?: boolean;
  responsibleDepartment: string;
  description?: string;
}

// ─── Catalog / Reference Data ────────────────────────────────

/** Standardized plant operation from the master catalog */
export interface PlantOperation {
  id: string;
  code: string;
  name: string;
  category: string;
}

/** Category grouping for the operation select dropdown */
export interface OperationCategory {
  category: string;
  operations: PlantOperation[];
}

// ─── Workspace State ─────────────────────────────────────────

/** Complete workspace state managed by FlowchartContext */
export interface FlowchartState {
  flowchartId: number | null; // Backend flowchart ID (null for new/unsaved)
  header: FlowchartHeader;
  steps: FlowchartStep[];
  isDirty: boolean;
  lastSaved: string | null;   // ISO 8601 or null if never saved
  isSaving: boolean;
}

// ─── Reducer Actions ─────────────────────────────────────────

export type FlowchartAction =
  | { type: 'ADD_STEP'; payload?: FlowchartStep }
  | { type: 'UPDATE_STEP'; payload: { id: string; field: keyof FlowchartStep; value: any } }
  | { type: 'DELETE_STEP'; payload: { id: string } }
  | { type: 'REORDER_STEPS'; payload: { sourceIndex: number; destinationIndex: number } }
  | { type: 'DUPLICATE_STEP'; payload: { id: string } }
  | { type: 'UPDATE_HEADER'; payload: Partial<FlowchartHeader> }
  | { type: 'SET_STATUS'; payload: { status: DiagramStatus } }
  | { type: 'MARK_SAVED'; payload: { timestamp: string } }
  | { type: 'MARK_DIRTY' }
  | { type: 'SET_SAVING'; payload: { isSaving: boolean } }
  | { type: 'LOAD_STATE'; payload: FlowchartState };
