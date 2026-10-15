// ─────────────────────────────────────────────────────────────
//  PFMEA PDF Export — Type Definitions
// ─────────────────────────────────────────────────────────────

export interface PfmeaPdfHeader {
  processResponsible?: string;
  pfmeaNumber: string;
  partNumber: string;
  description: string;
  project: string;
  customer: string;
  team: string;
  responsible: string;
  stage: 'prototype' | 'pre_launch' | 'production';
  manufacturing: string;
  preparedBy: string;
  originalDate: string;
  revisionDate: string;
  revision: string;
  safetyCharacteristic?: string;
}

export interface PfmeaPdfRow {
  process: string;
  stationOperation: string;
  workElement: string;
  functionItem: string;
  functionStep: string;
  productCharacteristic: string;
  functionWorkElement: string;
  processCharacteristic: string;
  failureMode: string;
  failureEffect: string;
  severity: number | '';
  failureCause: string;
  occurrence: number | '';
  preventionControl: string;
  detectionControl: string;
  detection: number | '';
  actionPriority: string;
  specialCharacteristic: string;
  preventionAction: string;
  detectionAction: string;
  responsible: string;
  targetDate: string;
  status: string;
  actionsTaken: string;
  completionDate: string;
  newSeverity: number | '';
  newOccurrence: number | '';
  newDetection: number | '';
  newSpecialCharacteristic: string;
  newAP: string;
  observations: string;
}

export interface PfmeaPdfData {
  header: PfmeaPdfHeader;
  rows: PfmeaPdfRow[];
  footerRevision: string;
  printDate: string;
  revisionDate: string;
}

export interface CorporateApgHeader {
  item: string;
  processResponsibility: string;
  pfmeaNumber: string;
  modelYear: string;
  keyDate: string;
  preparedBy: string;
  customerPartNumber: string;
  supplierPartNumber: string;
  coreTeam: string;
  fmeaDateOrig: string;
  fmeaDateRev: string;
  specialDocumentControl: string;
}

export interface CorporateApgRow {
  isBanner?: boolean;
  operationBanner?: string;
  processRequirements: string;
  potentialFailureMode: string;
  potentialEffects: string;
  severity: number | '';
  classification: string;
  potentialCauses: string;
  occurrence: number | '';
  currentPreventionControls: string;
  currentDetectionControls: string;
  detection: number | '';
  actionPriority: string; // HIGH, MEDIUM, LOW
  rpn: number | '';
  recommendedActions: string;
  responsibleAndTargetDate: string;
  actionsTaken: string;
  newSeverity: number | '';
  newOccurrence: number | '';
  newDetection: number | '';
  newRpn?: number | '';
  newActionPriority: string;
  originalRowId?: number;
}

export interface CorporateApgPdfData {
  header: CorporateApgHeader;
  rows: CorporateApgRow[];
  formCode: string;
}
