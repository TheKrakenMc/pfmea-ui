// ─────────────────────────────────────────────────────────────
//  ExportFlowchartButton — Silent PDF Download Trigger
//  Generates a FIN-05 process flow diagram PDF using html2pdf.js
//  without opening the browser print dialog.
//
//  Flow:
//  1. Fetch dynamic data from API (machinery, locations, users)
//  2. Build FlowchartPdfData from FlowchartContext state + API data
//  3. Mount ProcessFlowchartTemplate in a hidden container
//  4. Invoke html2pdf.js with high-quality settings (scale: 2)
//  5. Auto-download the PDF file
import React, { useState, useCallback } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFlowchart } from '../../hooks/useFlowchart';
import { useAuth } from '../../context/AuthContext';
import { listMachinery } from '../../services/machineryService';
import { listLocations } from '../../services/locationService';
import axiosClient from '../../api/axiosClient';
import { generateFlowchartPdf } from '../../services/flowchartPdfGenerator';
import type { FlowchartPdfData, FlowchartPdfRow, FlowchartPdfSummary, FlowchartPdfSignature } from '../../types/flowchartExport.types';
import type { SymbolType, FlowchartStep } from '../../types/flowchart.types';
import type { Machinery } from '../../types/machinery.types';
import type { ManufacturingLocation } from '../../services/locationService';

// ─── User read shape from /users endpoint ────────────────────

interface UserRead {
  id: string;
  full_name: string | null;
  email: string | null;
  role_id: string | null;
  role_name: string | null;
  is_active: boolean;
}

// ─── Symbol → Department Mapping ─────────────────────────────
// Maps the responsibleDepartment field to the correct column
// in the FIN-05 symbol grid.

type DepartmentColumn = 'calidad' | 'produccion' | 'logistica' | 'materiales' | 'otros';

function getDepartmentColumn(department: string): DepartmentColumn {
  const normalized = department.toLowerCase().trim();
  if (normalized.includes('calidad') || normalized.includes('quality')) return 'calidad';
  if (normalized.includes('producci') || normalized.includes('production')) return 'produccion';
  if (normalized.includes('log')) return 'logistica';
  if (normalized.includes('material')) return 'materiales';
  return 'otros';
}

// ─── Resolve location label for a step ───────────────────────

function resolveLocation(
  step: FlowchartStep,
  machineryMap: Map<number, Machinery>,
  locationMap: Map<number, ManufacturingLocation>,
): string {
  // If the step has an assigned machinery with a location_id, resolve from locationMap
  if (step.machineryId) {
    const machine = machineryMap.get(step.machineryId);
    if (machine?.location_id) {
      const loc = locationMap.get(machine.location_id);
      if (loc) return loc.location_name;
    }
  }
  // Fallback based on symbol type
  switch (step.symbolType) {
    case 'storage':
      return 'Almacén de Materia Prima';
    case 'transport':
      return 'Área de Traslado';
    case 'operation':
      return 'NAVE 1';
    case 'inspection':
      return 'Área de Inspección';
    default:
      return '';
  }
}

// ─── Resolve machinery label for a step ──────────────────────

function resolveMachinery(
  step: FlowchartStep,
  machineryMap: Map<number, Machinery>,
): string {
  if (step.machineryId) {
    const machine = machineryMap.get(step.machineryId);
    if (machine) {
      return `${machine.machinery_name} (${machine.machinery_code})`;
    }
  }
  return 'NO APLICA';
}

// ─── Build signatures from real users ────────────────────────

function buildSignatures(
  users: UserRead[],
  currentUserName: string | null,
): FlowchartPdfSignature[] {
  // "Elaboró" → current logged-in user (the one exporting)
  const elaboroName = currentUserName || 'N/A';

  // Find users with elevated roles for Aprobó / Revisó
  const approvers = users.filter(
    (u) =>
      u.is_active &&
      u.role_name &&
      ['pfmea owner', 'administrator', 'admin'].includes(u.role_name.toLowerCase())
  );

  // Find the user's employment position from the user list
  const currentInList = users.find(
    (u) => u.full_name === currentUserName
  );
  const elaboroTitle = currentInList?.role_name
    ? mapRoleToTitle(currentInList.role_name)
    : 'Ingeniero de Procesos';

  const aproboUser = approvers[0];
  const revisoUser = approvers.length > 1 ? approvers[1] : approvers[0];

  return [
    {
      role: 'Elaboró',
      name: elaboroName,
      title: elaboroTitle,
    },
    {
      role: 'Aprobó',
      name: aproboUser?.full_name || 'N/A',
      title: aproboUser ? mapRoleToTitle(aproboUser.role_name || '') : 'Coordinador de Ingeniería',
    },
    {
      role: 'Revisó',
      name: revisoUser?.full_name || 'N/A',
      title: revisoUser ? mapRoleToTitle(revisoUser.role_name || '') : 'Coordinador de Ingeniería',
    },
  ];
}

/** Maps a system role_name to a human-readable job title for the PDF */
function mapRoleToTitle(roleName: string): string {
  switch (roleName.toLowerCase()) {
    case 'administrator':
    case 'admin':
      return 'Coordinador de Ingeniería';
    case 'pfmea owner':
      return 'Ingeniero de Procesos';
    case 'team member':
      return 'Ingeniero de Procesos';
    case 'viewer':
      return 'Analista de Calidad';
    default:
      return 'Ingeniero de Procesos';
  }
}

// ─── Build PDF Data from Context State + API Data ────────────

function buildPdfData(
  header: {
    projectId?: string | number;
    partNumber: string;
    customer: string;
    partName: string;
    lastModified: string;
    revision?: string;
    coverPage?: string;
    plantCode: string;
    diagramStatus?: string;
  },
  steps: FlowchartStep[],
  machineryMap: Map<number, Machinery>,
  locationMap: Map<number, ManufacturingLocation>,
  signatures: FlowchartPdfSignature[],
): FlowchartPdfData {
  // Pad the ID to 3 digits
  const rawId = header.projectId ? String(header.projectId) : '1';
  const paddedId = rawId.padStart(3, '0');

  // Header
  const pdfHeader = {
    partNumber: header.coverPage ? `* VER PORTADA "${header.partNumber}" **` : header.partNumber,
    customer: header.customer || 'AUDI de México, S.A. de C.V.',
    description: header.partName || '',
    date: header.lastModified
      ? new Date(header.lastModified).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    documentNumber: paddedId,
    engineeringLevel: header.coverPage
      ? `* VER PORTADA "${header.partNumber}" **`
      : header.partNumber,
    revision: header.revision || '1',
    safetyCharacteristic: header.safetyCharacteristic,
  };

  // Rows — enriched with real machinery and location data
  const pdfRows: FlowchartPdfRow[] = steps.map((step) => {
    const deptCol = getDepartmentColumn(step.responsibleDepartment || '');
    const symbols: FlowchartPdfRow['symbols'] = {
      calidad: null,
      produccion: null,
      logistica: null,
      materiales: null,
      otros: null,
    };
    symbols[deptCol] = step.symbolType;

    return {
      stepNumber: step.sequence,
      description: step.operationName || `Paso ${step.sequence}`,
      location: resolveLocation(step, machineryMap, locationMap),
      hic: (step.criticalFlag === 'CC' || (step.criticalFlag === '' && step.isCritical))
        ? (header.safetyCharacteristic || 'CC')
        : (step.criticalFlag === 'SC' ? '@' : ''),
      symbols,
      norma: 'No Aplica',
      maquinaria: resolveMachinery(step, machineryMap),
    };
  });

  // Summary — count symbol types across all steps
  const summaryCounts: Record<SymbolType, number> = {
    storage: 0,
    auto_control: 0,
    delay: 0,
    inspection: 0,
    operation: 0,
    pokayoke: 0,
    transport: 0,
  };

  for (const step of steps) {
    if (step.symbolType in summaryCounts) {
      summaryCounts[step.symbolType]++;
    }
  }

  const pdfSummary: FlowchartPdfSummary = {
    almacenamiento: summaryCounts.storage,
    autoControl: summaryCounts.auto_control,
    demora: summaryCounts.delay,
    inspeccion: summaryCounts.inspection,
    operacion: summaryCounts.operation,
    pokayoke: summaryCounts.pokayoke,
    transporte: summaryCounts.transport,
    total: steps.length,
  };

  const now = new Date();
  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

  return {
    header: pdfHeader,
    rows: pdfRows,
    summary: pdfSummary,
    signatures,
    footerRevision: `Rev.: ${pdfHeader.revision.padStart(2, '0')}`,
    printDate: formatDate(now),
    revisionDate: header.lastModified
      ? formatDate(new Date(header.lastModified))
      : formatDate(now),
    isArchived: header.diagramStatus === 'archived',
  };
}

// ─── Export Button Component ─────────────────────────────────

interface ExportFlowchartButtonProps {
  /** Optional custom filename (without .pdf extension) */
  filename?: string;
  /** Optional className override for the button */
  className?: string;
}

export const ExportFlowchartButton: React.FC<ExportFlowchartButtonProps> = ({
  filename,
  className,
}) => {
  const { t } = useTranslation();
  const { state } = useFlowchart();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // ─── 1. Fetch dynamic data from API in parallel ────────
      const [machineryList, locationList, usersList] = await Promise.all([
        listMachinery().catch((err) => {
          console.warn('[ExportPDF] Failed to fetch machinery:', err);
          return [] as Machinery[];
        }),
        listLocations().catch((err) => {
          console.warn('[ExportPDF] Failed to fetch locations:', err);
          return [] as ManufacturingLocation[];
        }),
        axiosClient
          .get<UserRead[]>('/users')
          .then((res) => res.data)
          .catch((err) => {
            console.warn('[ExportPDF] Failed to fetch users:', err);
            return [] as UserRead[];
          }),
      ]);

      // Build lookup maps
      const machineryMap = new Map<number, Machinery>();
      for (const m of machineryList) {
        machineryMap.set(m.id, m);
      }

      const locationMap = new Map<number, ManufacturingLocation>();
      for (const loc of locationList) {
        locationMap.set(loc.id, loc);
      }

      // ─── 2. Build signatures from real users ───────────────
      const signatures = buildSignatures(usersList, user?.full_name || null);

      // ─── 3. Build the PDF data ─────────────────────────────
      const pdfData = buildPdfData(
        state.header,
        state.steps,
        machineryMap,
        locationMap,
        signatures,
      );

      // ─── 4. Invoke jsPDF Generator ─────────────────────────────
      const blob = await generateFlowchartPdf(pdfData, t);
      
      // Resolve filename
      const docNumber = state.header.partNumber?.replace(/[^0-9]/g, '') || '1674201002';
      const revision = state.header.revision || '1';
      const resolvedFilename = filename || `DF_${docNumber}_Rev${revision}.pdf`;

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resolvedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[ExportFlowchartButton] PDF generation failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, state.header, state.steps, filename, user, t]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || state.steps.length === 0}
      className={
        className ||
        'group flex items-center gap-2.5 rounded-2xl border border-steel-600 bg-steel-800/90 px-5 py-3 text-sm font-medium text-steel-200 shadow-xl backdrop-blur-md transition-all hover:border-indigo-500/40 hover:text-indigo-400 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer'
      }
      title="Exportar Diagrama de Flujo como PDF (FIN-05)"
    >
      {isExporting ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <FileDown size={18} />
      )}
      <span>{isExporting ? t('export.flowchart.generating') || 'Generando PDF...' : t('export.flowchart.button') || 'Exportar PDF'}</span>
    </button>
  );
};
