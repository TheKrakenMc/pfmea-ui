// ─────────────────────────────────────────────────────────────
//  Shared Document Header — Unified metadata for PDF exports
//  Ensures consistency between Flowchart and PFMEA documents
//  during audits.
// ─────────────────────────────────────────────────────────────

import type { FlowchartHeader } from '../types/flowchart.types';
import type { PfmeaHeader } from '../api/pfmeaService';

export interface SharedDocumentHeader {
  partNumber: string;
  productDescription: string;
  customer: string;
  plantName: string;
  revision: string;
  revisionDate: string;
  originalDate: string;
  coverPage: string;
  documentNumber: string;
  team: string;
  responsible: string;
  pfmeaIdNumber: string;
  confidentiality: string;
  safetyCharacteristic?: string;
}

/**
 * Builds a consistent header object from the Flowchart context.
 */
export function buildHeaderFromFlowchart(
  header: FlowchartHeader,
  productData?: { customer_name?: string | null; part_number?: string | null; description?: string | null; customer?: { safety_characteristic?: string | null } | null }
): SharedDocumentHeader {
  return {
    partNumber: productData?.part_number || header.partNumber || 'N/A',
    productDescription: productData?.description || header.partName || 'N/A',
    customer: productData?.customer_name || header.customer || 'AUDI de México, S.A. de C.V.',
    plantName: header.plantName || 'Puebla',
    revision: header.revision || '1',
    revisionDate: header.revisionDate || header.lastModified || new Date().toISOString(),
    originalDate: header.creationDate || header.lastModified || new Date().toISOString(),
    coverPage: header.coverPage || '',
    documentNumber: `DF ${header.partNumber?.replace(/[^0-9]/g, '') || '1674201002'}`,
    team: 'Core Team',
    responsible: header.modifiedBy || 'Procesos',
    pfmeaIdNumber: 'N/A', // Flowchart context might not have the PFMEA ID
    confidentiality: 'Público',
    safetyCharacteristic: productData?.customer?.safety_characteristic || header.safetyCharacteristic || 'D',
  };
}

/**
 * Builds a consistent header object from the PFMEA context.
 */
export function buildHeaderFromPfmea(
  pfmea: PfmeaHeader,
  productData?: { description?: string | null }
): SharedDocumentHeader {
  const teamList = pfmea.team_members
    ?.map((m) => {
      const name = m.user_full_name || `Usuario #${m.user_id}`;
      return m.role_in_team ? `${name} (${m.role_in_team})` : name;
    })
    .filter(Boolean)
    .join(', ') || 'Core Team';

  const primaryOwner =
    pfmea.team_members?.find(m => m.user_id === pfmea.owner_id || m.role_in_team?.toLowerCase().includes('owner'))?.user_full_name ||
    pfmea.team_members?.[0]?.user_full_name ||
    'Procesos';

  return {
    partNumber: pfmea.part_number || 'N/A',
    productDescription: productData?.description || pfmea.product_description || pfmea.project_name || 'N/A',
    customer: pfmea.customer || 'AUDI de México, S.A. de C.V.',
    plantName: 'Puebla', // Can be mapped from plant_id if needed
    revision: (pfmea.version || 1).toString(),
    revisionDate: pfmea.revision_date || pfmea.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    originalDate: pfmea.original_launch_date || pfmea.start_date || pfmea.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    coverPage: '',
    documentNumber: pfmea.pfmea_id_number || `PFMEA-${pfmea.id}`,
    team: teamList,
    responsible: primaryOwner,
    pfmeaIdNumber: pfmea.pfmea_id_number || `PFMEA-${pfmea.id}`,
    confidentiality: pfmea.confidentiality_level || 'Público',
  };
}
