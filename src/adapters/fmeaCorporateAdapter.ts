import type { PfmeaHeader, WorksheetRow } from '../api/pfmeaService';
import type { CorporateApgPdfData, CorporateApgHeader, CorporateApgRow } from '../types/pfmeaExport.types';

export function calculateRpn(
  s?: number | string | null,
  o?: number | string | null,
  d?: number | string | null
): number | '' {
  const numS = Number(s);
  const numO = Number(o);
  const numD = Number(d);
  if (!isNaN(numS) && !isNaN(numO) && !isNaN(numD) && numS > 0 && numO > 0 && numD > 0) {
    return numS * numO * numD;
  }
  return '';
}

export function normalizeAp(ap?: string | null): string {
  if (!ap) return '';
  const upper = ap.trim().toUpperCase();
  if (upper === 'H' || upper === 'HIGH') return 'HIGH';
  if (upper === 'M' || upper === 'MEDIUM' || upper === 'MED') return 'MEDIUM';
  if (upper === 'L' || upper === 'LOW') return 'LOW';
  return upper;
}

export function getApBadgeColor(ap?: string | null): { bg: string; text: string; border: string; hex: string } {
  const normalized = normalizeAp(ap);
  switch (normalized) {
    case 'HIGH':
      return {
        bg: 'bg-red-100 dark:bg-red-500/20',
        text: 'text-red-700 dark:text-red-300 font-extrabold',
        border: 'border-red-300 dark:border-red-500/40',
        hex: '#dc3545',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-100 dark:bg-amber-500/20',
        text: 'text-amber-800 dark:text-amber-300 font-extrabold',
        border: 'border-amber-300 dark:border-amber-500/40',
        hex: '#d97706',
      };
    case 'LOW':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-500/20',
        text: 'text-emerald-800 dark:text-emerald-300 font-extrabold',
        border: 'border-emerald-300 dark:border-emerald-500/40',
        hex: '#16a34a',
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-steel-700/20',
        text: 'text-slate-600 dark:text-steel-400 font-medium',
        border: 'border-slate-300 dark:border-steel-600/30',
        hex: '#64748b',
      };
  }
}

export function adaptToCorporateApg(
  header: PfmeaHeader,
  rows: WorksheetRow[],
  userFullName?: string,
  productData?: {description?: string | null}
): CorporateApgPdfData {
  const formatDate = (val?: string | null): string => {
    if (!val) return '';
    const clean = val.includes('T') ? val.split('T')[0] : val;
    if (clean.length === 10 && clean.includes('-')) {
      const [y, m, d] = clean.split('-');
      // Format as MM/DD/YYYY to match AIAG Detroit corporate standard and UI display
      return `${m}/${d}/${y}`;
    }
    return clean;
  };

  const teamMembersStr = (header.team_members || [])
    .map(m => {
      const name = m.user_full_name || `Usuario #${m.user_id}`;
      const role = m.role_in_team || m.department || '';
      return role ? `${name}: ${role}` : name;
    })
    .join(', ');

  const eligibleOwners = (header.team_members || []).filter(
    m => m.role_in_team?.toLowerCase().includes('owner') ||
         m.role_in_team?.toLowerCase().includes('admin') ||
         m.role_in_team?.toLowerCase().includes('administrador')
  );

  const primaryOwner =
    userFullName ||
    eligibleOwners[0]?.user_full_name ||
    (header.team_members || []).find(m => m.user_id === header.owner_id || m.role_in_team?.toLowerCase().includes('owner'))?.user_full_name ||
    (header.team_members || [])[0]?.user_full_name ||
    'Ingeniero de Procesos';

  const isMemberInTeam = (header.team_members || []).some(
    m => m.user_full_name === header.process_responsibility
  );

  const resolvedProcessResp =
    (isMemberInTeam ? header.process_responsibility : null) ||
    (header.process_responsibility && header.process_responsibility !== 'A. Carranza' ? header.process_responsibility : null) ||
    primaryOwner ||
    '';

  const origDateRaw = header.original_launch_date || header.start_date || header.created_at?.split('T')[0];
  const origDateFormatted = formatDate(origDateRaw);

  const revVersion = header.version ?? 1;
  const revDateFormatted = formatDate(header.revision_date || header.updated_at?.split('T')[0]);
  const fmeaDateRev = revDateFormatted ? `${revVersion} / ${revDateFormatted}` : `${revVersion}`;

  const corporateHeader: CorporateApgHeader = {
    item: header.project_name || productData?.description || header.product_description || header.part_number || '',
    processResponsibility: resolvedProcessResp,
    pfmeaNumber: header.pfmea_id_number || `#${header.id}`,
    modelYear: header.model_year || header.project_name || '',
    keyDate: origDateFormatted || formatDate(header.key_date) || 'NA',
    preparedBy: primaryOwner,
    customerPartNumber: header.part_number || '',
    supplierPartNumber: header.supplier_part_number || '',
    coreTeam: teamMembersStr,
    fmeaDateOrig: origDateFormatted || 'NA',
    fmeaDateRev,
    specialDocumentControl: header.special_document_control || '0',
  };

  const formatListWithPrefix = (items: (string | null | undefined)[], prefix = '>'): string => {
    return items
      .filter(Boolean)
      .map(item => item!.trim())
      .filter(Boolean)
      .map(item => {
        return item
          .split('\n')
          .map(line => {
            const l = line.trim();
            if (!l) return '';
            if (l.startsWith('>') || l.startsWith('-')) return l;
            return `${prefix}${l}`;
          })
          .filter(Boolean)
          .join('\n');
      })
      .join('\n');
  };

  // Build rows grouped by Operation Banner
  const corporateRows: CorporateApgRow[] = [];
  let currentOperation = '';

  for (const r of rows) {
    const rawOpName = (r.station_operation || r.process_item_name || 'Operación General').trim();
    // Clean OP: [OP 10] prefix if present to match "10 Receiving" format in APG PDF
    const operationName = rawOpName.replace(/^OP:\s*\[?([^\]]+)\]?\s*/i, '$1').trim();

    // Add banner row if station operation changes
    if (operationName !== currentOperation) {
      currentOperation = operationName;
      corporateRows.push({
        isBanner: true,
        operationBanner: currentOperation,
        processRequirements: '',
        potentialFailureMode: '',
        potentialEffects: '',
        severity: '',
        classification: '',
        potentialCauses: '',
        occurrence: '',
        currentPreventionControls: '',
        currentDetectionControls: '',
        detection: '',
        actionPriority: '',
        rpn: '',
        recommendedActions: '',
        responsibleAndTargetDate: '',
        actionsTaken: '',
        newSeverity: '',
        newOccurrence: '',
        newDetection: '',
        newRpn: '',
        newActionPriority: '',
      });
    }

    const effects = formatListWithPrefix([
      r.failure_effect_plant,
      r.failure_effect_customer,
      r.failure_effect_end_user,
    ], '>');

    const requirements = formatListWithPrefix([
      r.function_process_step,
      r.product_characteristic,
      r.process_characteristic,
      r.work_element_process,
    ], '- ');

    const failureMode = formatListWithPrefix([r.failure_mode], '>');
    const failureCauses = formatListWithPrefix([r.failure_cause], '>');
    const preventionControls = formatListWithPrefix([r.prevention_controls], '>');
    const detectionControls = formatListWithPrefix([r.detection_controls], '>');

    const recommendedActions = formatListWithPrefix([
      r.optimization_prevention_action,
      r.optimization_detection_action,
    ], '');

    const respDate = [
      r.responsible_person_name || '',
      formatDate(r.target_completion_date) || '',
    ].filter(Boolean).join('\n');

    corporateRows.push({
      isBanner: false,
      operationBanner: currentOperation,
      processRequirements: requirements || (r.function_process_step ? `- ${r.function_process_step}` : ''),
      potentialFailureMode: failureMode,
      potentialEffects: effects,
      severity: r.severity || '',
      classification: (r.special_characteristics === 'SC' || r.special_characteristics === 'CC' || r.special_characteristics === '@') ? '@' : '',
      potentialCauses: failureCauses,
      occurrence: r.occurrence || '',
      currentPreventionControls: preventionControls,
      currentDetectionControls: detectionControls,
      detection: r.detection || '',
      actionPriority: normalizeAp(r.action_priority),
      rpn: calculateRpn(r.severity, r.occurrence, r.detection),
      recommendedActions: recommendedActions,
      responsibleAndTargetDate: respDate,
      actionsTaken: r.actions_taken || '',
      newSeverity: r.new_severity || '',
      newOccurrence: r.new_occurrence || '',
      newDetection: r.new_detection || '',
      newRpn: calculateRpn(r.new_severity, r.new_occurrence, r.new_detection),
      newActionPriority: normalizeAp(r.new_action_priority),
      originalRowId: r.id,
    });
  }

  return {
    header: corporateHeader,
    rows: corporateRows,
    formCode: 'G-C3.0 01 F - APQP work book - Rev. 5',
  };
}
