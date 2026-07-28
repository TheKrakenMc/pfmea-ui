// ─────────────────────────────────────────────────────────────
//  ExportPfmeaButton — PDF Download Trigger for PFMEA
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { generatePfmeaPdf } from '../../services/pfmeaPdfGenerator';
import type { PfmeaHeader, WorksheetRow } from '../../api/pfmeaService';
import type { PfmeaPdfData, PfmeaPdfRow } from '../../types/pfmeaExport.types';
import { buildHeaderFromPfmea } from '../../services/sharedDocumentHeader';

interface ExportPfmeaButtonProps {
  header: PfmeaHeader;
  rows: WorksheetRow[];
  productData?: { description?: string | null };
  className?: string;
}

export const ExportPfmeaButton: React.FC<ExportPfmeaButtonProps> = ({
  header,
  rows,
  productData,
  className,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (isExporting || !header) return;
    setIsExporting(true);

    try {
      const sharedHeader = buildHeaderFromPfmea(header, productData);
      
      const mapCharacteristic = (val: string | null | undefined) => {
        if (!val) return '';
        const upper = val.toUpperCase().trim();
        if (upper === 'CC') return sharedHeader.safetyCharacteristic || 'CC';
        if (upper === 'SC') return '@';
        return val;
      };
      
      const pdfRows: PfmeaPdfRow[] = rows.map(r => ({
        process: r.process_item_name || '',
        stationOperation: r.station_operation || '',
        workElement: r.work_element_process || '',
        functionItem: [
          r.function_process_item_plant ? `${t('pfmea.worksheet.labels.plantInternal', 'Planta (Interno)')}:\n${r.function_process_item_plant}` : '',
          r.function_process_item_customer ? `${t('pfmea.worksheet.labels.customerPlant', 'Planta de cliente')}:\n${r.function_process_item_customer}` : '',
          r.function_process_item_end_user ? `${t('pfmea.worksheet.labels.endUser', 'Usuario final')}:\n${r.function_process_item_end_user}` : ''
        ].filter(Boolean).join('\n\n'),
        functionStep: r.function_process_step || '',
        productCharacteristic: r.product_characteristic || '',
        functionWorkElement: r.function_work_element || '',
        processCharacteristic: r.process_characteristic || '',
        failureMode: r.failure_mode || '',
        failureEffect: [
          r.failure_effect_plant ? `${t('pfmea.worksheet.labels.plantInternal', 'Planta (Interno)')}:\n${r.failure_effect_plant}` : '',
          r.failure_effect_customer ? `${t('pfmea.worksheet.labels.customerPlant', 'Planta de cliente')}:\n${r.failure_effect_customer}` : '',
          r.failure_effect_end_user ? `${t('pfmea.worksheet.labels.endUser', 'Usuario final')}:\n${r.failure_effect_end_user}` : ''
        ].filter(Boolean).join('\n\n'),
        severity: r.severity || '',
        failureCause: r.failure_cause || '',
        occurrence: r.occurrence || '',
        preventionControl: r.prevention_controls || '',
        detectionControl: r.detection_controls || '',
        detection: r.detection || '',
        actionPriority: r.action_priority || '',
        specialCharacteristic: mapCharacteristic(r.special_characteristics),
        preventionAction: r.optimization_prevention_action || '',
        detectionAction: r.optimization_detection_action || '',
        responsible: r.responsible_person_name || '',
        targetDate: r.target_completion_date || '',
        status: r.action_status || '',
        actionsTaken: r.actions_taken || '',
        completionDate: r.completion_date || '',
        newSeverity: r.new_severity || '',
        newOccurrence: r.new_occurrence || '',
        newDetection: r.new_detection || '',
        newSpecialCharacteristic: mapCharacteristic(r.new_special_characteristics),
        newAP: r.new_action_priority || '',
        observations: r.observations || ''
      }));

      const now = new Date();
      const formatDate = (d: Date) =>
        `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

      const safeFormatDate = (val: string | undefined | null) => {
        if (!val) return '';
        // If it's a short string like YYYY-MM-DD, parse manually to avoid timezone shift
        if (val.length === 10 && val.includes('-')) {
          const [y, m, d] = val.split('-');
          return `${d}-${m}-${y}`;
        }
        try {
          const d = new Date(val);
          if (isNaN(d.getTime())) return val;
          return formatDate(d);
        } catch {
          return val;
        }
      };

      const pdfData: PfmeaPdfData = {
        header: {
          pfmeaNumber: sharedHeader.pfmeaIdNumber,
          partNumber: sharedHeader.partNumber,
          description: sharedHeader.productDescription,
          project: header.project_name,
          customer: sharedHeader.customer,
          team: sharedHeader.team,
          responsible: sharedHeader.responsible,
          stage: 'production',
          manufacturing: sharedHeader.plantName,
          preparedBy: user?.full_name || 'Ingeniero de Procesos',
          originalDate: safeFormatDate(sharedHeader.originalDate),
          revisionDate: safeFormatDate(sharedHeader.revisionDate),
          revision: sharedHeader.revision,
          safetyCharacteristic: sharedHeader.safetyCharacteristic,
        },
        rows: pdfRows,
        footerRevision: `Rev.: ${sharedHeader.revision.padStart(2, '0')}`,
        printDate: formatDate(now),
        revisionDate: safeFormatDate(sharedHeader.revisionDate)
      };

      const blob = await generatePfmeaPdf(pdfData, t);

      const resolvedFilename = `PFMEA_${sharedHeader.pfmeaIdNumber}_Rev${sharedHeader.revision}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resolvedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[ExportPfmeaButton] PDF generation failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, header, rows, user, t]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || rows.length === 0}
      className={
        className ||
        'group flex items-center gap-2.5 rounded-2xl border border-steel-600 bg-steel-800/90 px-5 py-3 text-sm font-medium text-steel-200 shadow-xl backdrop-blur-md transition-industrial hover:border-forge-500/40 hover:text-forge-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forge-500 disabled:cursor-not-allowed disabled:opacity-40'
      }
      title="Exportar PFMEA como PDF"
    >
      {isExporting ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <FileDown size={18} />
      )}
      <span>{isExporting ? t('export.pfmea.generating') || 'Generando PFMEA...' : t('export.pfmea.button') || 'Exportar PFMEA'}</span>
    </button>
  );
};
