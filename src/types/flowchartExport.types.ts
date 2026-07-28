// ─────────────────────────────────────────────────────────────
//  Flowchart PDF Export — Type Definitions
//  Structured data model for the FIN-05 process flow diagram
//  export template (Adler Pelzer Group / AIAG-VDA format).
// ─────────────────────────────────────────────────────────────

import type { SymbolType } from './flowchart.types';

// ─── Header Metadata ─────────────────────────────────────────

export interface FlowchartPdfHeader {
  /** Part number — e.g. "* VER PORTADA "P1674201002" **" */
  partNumber: string;
  /** Client name — e.g. "AUDI de México, S.A. de C.V." */
  customer: string;
  /** Product description — e.g. "Alfombras Audi LHD AU436" */
  description: string;
  /** Creation / effective date (ISO or display format) */
  date: string;
  /** Document identifier — e.g. "DF 1674201002" */
  documentNumber: string;
  /** Engineering level — e.g. "* VER PORTADA "P1674201002" **" */
  engineeringLevel: string;
  /** Revision number — e.g. "4" */
  revision: string;
  /** Safety Characteristic from Customer */
  safetyCharacteristic?: string;
}

// ─── Process Row ─────────────────────────────────────────────

export interface FlowchartPdfRow {
  /** Step number (10, 20, 30…) */
  stepNumber: number;
  /** Operation description — e.g. "Recepción de materia prima" */
  description: string;
  /** Location/area — e.g. "Almacén de Materia Prima", "NAVE 1" */
  location: string;
  /** HIC / Critical characteristic flag — "@" symbol or empty */
  hic: string;
  /** Which symbol columns are active */
  symbols: {
    calidad: SymbolType | null;
    produccion: SymbolType | null;
    logistica: SymbolType | null;
    materiales: SymbolType | null;
    otros: SymbolType | null;
  };
  /** Standard reference — e.g. "No Aplica" */
  norma: string;
  /** Equipment/machine name — e.g. "MONTACARGAS Y/O PATIN" */
  maquinaria: string;
}

// ─── Summary (symbol counts) ────────────────────────────────

export interface FlowchartPdfSummary {
  almacenamiento: number;
  autoControl: number;
  demora: number;
  inspeccion: number;
  operacion: number;
  pokayoke: number;
  transporte: number;
  total: number;
}

// ─── Signature Block ─────────────────────────────────────────

export interface FlowchartPdfSignature {
  /** Role label — "Elaboró", "Aprobó", "Revisó" */
  role: string;
  /** Full name */
  name: string;
  /** Title / position */
  title: string;
}

// ─── Aggregate Data Object ───────────────────────────────────

export interface FlowchartPdfData {
  header: FlowchartPdfHeader;
  rows: FlowchartPdfRow[];
  summary: FlowchartPdfSummary;
  signatures: FlowchartPdfSignature[];
  /** Revision footer line — e.g. "Rev.: 07" */
  footerRevision: string;
  /** Print date for footer — auto-populated */
  printDate: string;
  /** Revision date for footer */
  revisionDate: string;
  /** Flag to indicate if the document is archived */
  isArchived?: boolean;
}
