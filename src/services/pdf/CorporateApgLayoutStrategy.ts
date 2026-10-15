import type { RowInput } from 'jspdf-autotable';
import { autoTable, type CellHookData } from 'jspdf-autotable';
import jsPDF from 'jspdf';

import type { FMEAPdfStrategy } from './fmeaExportStrategies';
import type { CorporateApgPdfData } from '../../types/pfmeaExport.types';

export class CorporateApgLayoutStrategy implements FMEAPdfStrategy<CorporateApgPdfData> {
  name = 'AIAG 4ta Edición (APG Corporate)';

  async generate(data: CorporateApgPdfData): Promise<Blob> {
    // Letter Landscape: 279.4 x 215.9 mm
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // ~279.4 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // ~215.9 mm
    const margin = 8;
    const contentWidth = pageWidth - margin * 2; // ~263.4 mm

    const drawHeader = (): number => {
      let y = margin;

      // 1. Top Bar: Adler Pelzer Group (Left) | PFMEA (Center) | Special Document Control (Right)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 51, 153); // APG Blue #003399
      doc.text('Adler Pelzer Group', margin, y + 4.5);

      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text('PFMEA', pageWidth / 2, y + 4.5, { align: 'center' });

      // Special Document Control Box (Right)
      const sdcWidth = 65;
      const sdcHeight = 6.5;
      const sdcX = pageWidth - margin - sdcWidth;

      doc.setDrawColor(180, 180, 180);
      doc.setFillColor(235, 235, 235); // Light gray box background
      doc.rect(sdcX, y, sdcWidth, sdcHeight, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text("Special document control (IF REQ'D):", sdcX + 2, y + 4.3);

      doc.setFillColor(255, 255, 255);
      doc.rect(sdcX + sdcWidth - 14, y + 0.8, 12, 4.9, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 0, 0); // Red bold text '0'
      doc.text(data.header.specialDocumentControl || '0', sdcX + sdcWidth - 8, y + 4.5, { align: 'center' });

      y += 7.5;

      // 2. Metadata Grid (4 rows)
      const rowHeight = 4.4;
      const col1W = contentWidth * 0.35; // ~92.19 mm
      const col2W = contentWidth * 0.35; // ~92.19 mm
      const col3W = contentWidth * 0.30; // ~79.02 mm

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.2);

      const renderCell = (
        x: number,
        curY: number,
        w: number,
        h: number,
        label: string,
        val: string,
        valColor: [number, number, number] = [0, 0, 180]
      ) => {
        doc.rect(x, curY, w, h);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(0, 0, 0);
        doc.text(label, x + 1, curY + 3.1);

        const labelWidth = doc.getTextWidth(label) + 2;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(valColor[0], valColor[1], valColor[2]);
        const maxValWidth = Math.max(10, w - labelWidth - 1);
        const valText = doc.splitTextToSize(val || '-', maxValWidth)[0] || '';
        doc.text(valText, x + labelWidth, curY + 3.1);
      };

      // Row 1
      renderCell(margin, y, col1W, rowHeight, 'Item:', data.header.item);
      renderCell(margin + col1W, y, col2W, rowHeight, 'Process Responsibility:', data.header.processResponsibility);
      renderCell(margin + col1W + col2W, y, col3W, rowHeight, 'FMEA Number:', data.header.pfmeaNumber);
      y += rowHeight;

      // Row 2
      renderCell(margin, y, col1W, rowHeight, 'Model Year(s)/Vehicle(s):', data.header.modelYear);
      renderCell(margin + col1W, y, col2W, rowHeight, 'Key Date:', data.header.keyDate);
      renderCell(margin + col1W + col2W, y, col3W, rowHeight, 'Prepared By:', data.header.preparedBy);
      y += rowHeight;

      // Row 3
      renderCell(margin, y, col1W, rowHeight, 'Customer Part #:', data.header.customerPartNumber);
      // Core Team spans Row 3 & 4
      doc.rect(margin + col1W, y, col2W, rowHeight * 2);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0);
      doc.text('Core Team:', margin + col1W + 1, y + 3.1);
      const teamLabelW = doc.getTextWidth('Core Team:') + 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 180);
      const teamLines = doc.splitTextToSize(data.header.coreTeam || '-', col2W - teamLabelW - 1);
      doc.text(teamLines.slice(0, 2), margin + col1W + teamLabelW, y + 3.1);

      renderCell(margin + col1W + col2W, y, col3W, rowHeight, 'PMEA Date (Orig.):', data.header.fmeaDateOrig || 'NA');
      y += rowHeight;

      // Row 4
      renderCell(margin, y, col1W, rowHeight, 'Supplier Part#:', data.header.supplierPartNumber);
      renderCell(margin + col1W + col2W, y, col3W, rowHeight, '(Rev.):', data.header.fmeaDateRev || 'J');
      y += rowHeight;

      return y + 1.5;
    };

    const headerHeight = 27; // Approx total header height

    // Multi-tier Table Headers matching PFMEA.pdf
    const superHeaders: RowInput = [
      { content: 'Process Function\nRequirements', colSpan: 1 },
      { content: 'Failure Mode', colSpan: 1 },
      { content: 'Potential Effect(s)\nof Failure\n(Severity Values are based off of\nthe End User Effect.)', colSpan: 1 },
      { content: 'Severity', colSpan: 1 },
      { content: 'Class', colSpan: 1 },
      { content: 'Potential\nCause(s)/Mechanism(s) of\nFailure', colSpan: 1 },
      { content: 'Occurrence', colSpan: 1 },
      { content: 'Current Process Controls Prevention', colSpan: 1 },
      { content: 'Current Process Controls Detection', colSpan: 1 },
      { content: 'Detection', colSpan: 1 },
      { content: 'Action Priority', colSpan: 1 },
      { content: 'RPN', colSpan: 1 },
      { content: 'Recommend\nActions', colSpan: 1 },
      { content: 'Respond &\nTarget\nComplete\nDate', colSpan: 1 },
      { content: 'Action Results', colSpan: 5, styles: { halign: 'center', fillColor: [180, 180, 180], textColor: [0, 0, 0], fontStyle: 'bold' } },
    ];

    const subHeaders: RowInput = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      'Action Taken', 'Sev', 'Occ', 'Det', 'AP'
    ];

    // Build Table Body
    const bodyRows: RowInput[] = data.rows.map((r): RowInput => {
      if (r.isBanner) {
        return [
          {
            content: r.operationBanner || '',
            colSpan: 19,
            styles: {
              fillColor: [30, 30, 30],
              fontStyle: 'bold',
              textColor: [255, 255, 255],
              fontSize: 6.5,
              halign: 'left',
              cellPadding: 0.8,
            },
          },
        ];
      }

      return [
        r.processRequirements || '',
        r.potentialFailureMode || '',
        r.potentialEffects || '',
        r.severity !== '' ? String(r.severity) : '',
        r.classification || '',
        r.potentialCauses || '',
        r.occurrence !== '' ? String(r.occurrence) : '',
        r.currentPreventionControls || '',
        r.currentDetectionControls || '',
        r.detection !== '' ? String(r.detection) : '',
        r.actionPriority || '',
        r.rpn !== '' ? String(r.rpn) : '',
        r.recommendedActions || '',
        r.responsibleAndTargetDate || '',
        r.actionsTaken || '',
        r.newSeverity !== '' ? String(r.newSeverity) : '',
        r.newOccurrence !== '' ? String(r.newOccurrence) : '',
        r.newDetection !== '' ? String(r.newDetection) : '',
        r.newActionPriority || '',
      ];
    });

    autoTable(doc, {
      startY: margin + headerHeight,
      margin: { left: margin, right: margin, top: margin + headerHeight, bottom: 10 },
      tableWidth: contentWidth,
      head: [superHeaders, subHeaders],
      body: bodyRows,
      theme: 'grid',
      styles: {
        fontSize: 5.5,
        cellPadding: 0.6,
        lineColor: [120, 120, 120],
        lineWidth: 0.15,
        valign: 'top',
        overflow: 'linebreak',
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [180, 180, 180],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 5,
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 26.5 },  // Requirements
        1: { cellWidth: 22.5 },  // Failure Mode
        2: { cellWidth: 26.5 },  // Effects
        3: { cellWidth: 7, halign: 'center', fontStyle: 'bold' },   // Severity
        4: { cellWidth: 6, halign: 'center', fontStyle: 'bold' },   // Class
        5: { cellWidth: 23.5 },  // Causes
        6: { cellWidth: 7, halign: 'center', fontStyle: 'bold' },   // Occurrence
        7: { cellWidth: 21.5 },  // Controls Prev
        8: { cellWidth: 21.5 },  // Controls Det
        9: { cellWidth: 7, halign: 'center', fontStyle: 'bold' },   // Detection
        10: { cellWidth: 10, halign: 'center', fontStyle: 'bold' }, // AP
        11: { cellWidth: 7, halign: 'center', fontStyle: 'bold' },  // RPN
        12: { cellWidth: 18.5 }, // Recommend Actions
        13: { cellWidth: 14 }, // Resp & Date
        14: { cellWidth: 18.5 }, // Action Taken
        15: { cellWidth: 6, halign: 'center' }, // New Sev
        16: { cellWidth: 6, halign: 'center' }, // New Occ
        17: { cellWidth: 6, halign: 'center' }, // New Det
        18: { cellWidth: 8.4, halign: 'center', fontStyle: 'bold' }, // New AP
      },

      didParseCell: (dataHook: CellHookData) => {
        // Highlight AP column cells with solid vivid colors matching PFMEA.pdf
        if (dataHook.section === 'body') {
          const colIdx = dataHook.column.index;
          // Special Characteristics / Class column (Col 4)
          if (colIdx === 4) {
            const rawVal = String(dataHook.cell.raw || '').trim().toUpperCase();
            if (rawVal === '@' || rawVal === 'CC' || rawVal === 'SC') {
              dataHook.cell.text = ['@'];
              dataHook.cell.styles.textColor = [220, 0, 0]; // Red text
              dataHook.cell.styles.fontStyle = 'bold';
              dataHook.cell.styles.fontSize = 7.5;
              dataHook.cell.styles.halign = 'center';
            }
          }

          if (colIdx === 10 || colIdx === 18) {
            const rawVal = String(dataHook.cell.raw || '').trim().toUpperCase();
            if (rawVal === 'HIGH' || rawVal === 'H') {
              dataHook.cell.styles.fillColor = [255, 0, 0];
              dataHook.cell.styles.textColor = [255, 255, 255];
              dataHook.cell.styles.fontStyle = 'bold';
              dataHook.cell.styles.halign = 'center';
            } else if (rawVal === 'MEDIUM' || rawVal === 'M' || rawVal === 'MED') {
              dataHook.cell.styles.fillColor = [255, 215, 0];
              dataHook.cell.styles.textColor = [0, 0, 0];
              dataHook.cell.styles.fontStyle = 'bold';
              dataHook.cell.styles.halign = 'center';
            } else if (rawVal === 'LOW' || rawVal === 'L') {
              dataHook.cell.styles.fillColor = [0, 176, 80];
              dataHook.cell.styles.textColor = [0, 0, 0];
              dataHook.cell.styles.fontStyle = 'bold';
              dataHook.cell.styles.halign = 'center';
            }
          }
        }
      },
      didDrawPage: () => {
        // Draw Header on every page
        drawHeader();
      },
    });

    // Draw Footer on all pages with total page count (Page X of Y)
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const footY = pageHeight - 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(60, 60, 60);

      // Left Form Code
      doc.text(data.formCode || 'G-C3.0 01 F - APQP work book - Rev. 5', margin, footY);

      // Center
      doc.text('FMEA', pageWidth / 2, footY, { align: 'center' });

      // Right Page Number: Page X of Y
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footY, { align: 'right' });
    }

    return doc.output('blob');
  }
}
