// ─────────────────────────────────────────────────────────────
//  Mock Data & Plant Operation Catalog
//  Seed data for development. Will be replaced by API calls.
// ─────────────────────────────────────────────────────────────

import type {
  FlowchartHeader,
  FlowchartStep,
  PlantOperation,
  FlowchartState,
} from '../types/flowchart.types';

// ─── Plant Operation Catalog ─────────────────────────────────

export const PLANT_OPERATIONS: PlantOperation[] = [
  // Assembly
  { id: 'op-001', code: 'ASM-01', name: 'Assembly',           category: 'assembly' },
  { id: 'op-002', code: 'ASM-02', name: 'Sub-Assembly',       category: 'assembly' },
  { id: 'op-003', code: 'ASM-03', name: 'Riveting',           category: 'assembly' },
  { id: 'op-004', code: 'ASM-04', name: 'Welding (MIG)',      category: 'assembly' },
  { id: 'op-005', code: 'ASM-05', name: 'Welding (Spot)',     category: 'assembly' },
  { id: 'op-006', code: 'ASM-06', name: 'Adhesive Bonding',   category: 'assembly' },

  // Forming
  { id: 'op-010', code: 'FRM-01', name: 'Stamping',           category: 'forming' },
  { id: 'op-011', code: 'FRM-02', name: 'Deep Drawing',       category: 'forming' },
  { id: 'op-012', code: 'FRM-03', name: 'Bending',            category: 'forming' },
  { id: 'op-013', code: 'FRM-04', name: 'Roll Forming',       category: 'forming' },
  { id: 'op-014', code: 'FRM-05', name: 'PU Foaming',         category: 'forming' },
  { id: 'op-015', code: 'FRM-06', name: 'Injection Molding',  category: 'forming' },
  { id: 'op-016', code: 'FRM-07', name: 'AirLay',             category: 'forming' },

  // Inspection & Testing
  { id: 'op-020', code: 'INS-01', name: 'Visual Inspection',    category: 'inspection' },
  { id: 'op-021', code: 'INS-02', name: 'CMM Measurement',      category: 'inspection' },
  { id: 'op-022', code: 'INS-03', name: 'Functional Test',      category: 'inspection' },
  { id: 'op-023', code: 'INS-04', name: 'Leak Test',            category: 'inspection' },
  { id: 'op-024', code: 'INS-05', name: 'Torque Verification',  category: 'inspection' },

  // Finishing
  { id: 'op-030', code: 'FIN-01', name: 'E-Coat',              category: 'finishing' },
  { id: 'op-031', code: 'FIN-02', name: 'Painting',            category: 'finishing' },
  { id: 'op-032', code: 'FIN-03', name: 'Deburring',           category: 'finishing' },
  { id: 'op-033', code: 'FIN-04', name: 'Polishing',           category: 'finishing' },
  { id: 'op-034', code: 'FIN-05', name: 'Heat Treatment',      category: 'finishing' },

  // Material Handling
  { id: 'op-040', code: 'MAT-01', name: 'Receiving',           category: 'material' },
  { id: 'op-041', code: 'MAT-02', name: 'Storage (WIP)',       category: 'material' },
  { id: 'op-042', code: 'MAT-03', name: 'Packaging',           category: 'material' },
  { id: 'op-043', code: 'MAT-04', name: 'Shipping',            category: 'material' },

  // Chemical Processes
  { id: 'op-050', code: 'CHM-01', name: 'Cleaning / Washing',  category: 'chemical' },
  { id: 'op-051', code: 'CHM-02', name: 'Phosphating',         category: 'chemical' },
  { id: 'op-052', code: 'CHM-03', name: 'Anodizing',           category: 'chemical' },
];

// ─── Default Header ──────────────────────────────────────────

export const DEFAULT_HEADER: FlowchartHeader = {
  projectId: 'PRJ-2026-0042',
  plantCode: 'MX-SLP-01',
  plantName: 'San Luis Potosí Plant',
  region: 'North America',
  customer: 'BMW Group',
  partNumber: '51-12-7-489-301',
  partName: 'Front Bumper Carrier',
  diagramStatus: 'draft',
  lastModified: new Date().toISOString(),
  modifiedBy: 'Ing. Carlos Méndez',
};

// ─── Seed Steps ──────────────────────────────────────────────

export const SEED_STEPS: FlowchartStep[] = [
  {
    id: 'step-001',
    sequence: 10,
    operationId: 'op-040',
    operationName: 'Receiving',
    description: 'Recepción de materia prima e inspección de ingreso',
    criticalFlag: 'none',
    symbolType: 'operation',
    notes: 'Verificar certificados de calidad del proveedor',
    responsibleDepartment: 'Logística',
  },
  {
    id: 'step-002',
    sequence: 20,
    operationId: 'op-015',
    operationName: 'Injection Molding',
    description: 'Inyección de componente principal PP-GF30',
    criticalFlag: 'CC',
    symbolType: 'operation',
    notes: 'Temperatura de molde: 80±5°C',
    responsibleDepartment: 'Producción',
  },
  {
    id: 'step-003',
    sequence: 30,
    operationId: 'op-020',
    operationName: 'Visual Inspection',
    description: 'Inspección visual post-inyección — superficie y rebabas',
    criticalFlag: 'none',
    symbolType: 'inspection',
    notes: '',
    responsibleDepartment: 'Calidad',
  },
  {
    id: 'step-004',
    sequence: 40,
    operationId: 'op-004',
    operationName: 'Welding (MIG)',
    description: 'Soldadura de insertos metálicos al carrier',
    criticalFlag: 'SC',
    symbolType: 'operation',
    notes: 'Parámetros por WPS-2026-014',
    responsibleDepartment: 'Producción',
  },
  {
    id: 'step-005',
    sequence: 50,
    operationId: 'op-021',
    operationName: 'CMM Measurement',
    description: 'Medición dimensional en CMM — puntos críticos de montaje',
    criticalFlag: 'CC',
    symbolType: 'inspection',
    notes: 'Frecuencia: cada 50 piezas',
    responsibleDepartment: 'Calidad',
  },
  {
    id: 'step-006',
    sequence: 60,
    operationId: 'op-031',
    operationName: 'Painting',
    description: 'Pintura base + clear coat — color según especificación cliente',
    criticalFlag: 'none',
    symbolType: 'operation',
    notes: 'Cabina 3, lote mínimo 200 piezas',
    responsibleDepartment: 'Producción',
  },
  {
    id: 'step-007',
    sequence: 70,
    operationId: 'op-022',
    operationName: 'Functional Test',
    description: 'Prueba funcional de ensamble — puntos de anclaje y clips',
    criticalFlag: 'SC',
    symbolType: 'inspection',
    notes: 'Torque de clips: 2.5 ± 0.3 Nm',
    responsibleDepartment: 'Calidad',
  },
  {
    id: 'step-008',
    sequence: 80,
    operationId: 'op-042',
    operationName: 'Packaging',
    description: 'Empaque en rack especializado con protección anti-rayaduras',
    criticalFlag: 'none',
    symbolType: 'operation',
    notes: 'Rack BMW tipo KLT-6429',
    responsibleDepartment: 'Materiales',
  },
];

// ─── Initial State ───────────────────────────────────────────

export const INITIAL_STATE: FlowchartState = {
  flowchartId: null,
  header: DEFAULT_HEADER,
  steps: SEED_STEPS,
  isDirty: false,
  lastSaved: null,
  isSaving: false,
};
