// ─────────────────────────────────────────────────────────────
//  PFMEA PDF Generator
//  Generates the PFMEA document using jsPDF + AutoTable
//  Follows VDA AIAG 1st Edition layout and corporative format.
// ─────────────────────────────────────────────────────────────

import { createDocument, drawHeader, drawFooter, COLORS } from './jspdfService';
import type { PfmeaPdfData } from '../types/pfmeaExport.types';

export async function generatePfmeaPdf(data: PfmeaPdfData, t: (key: string) => string): Promise<Blob> {
  const doc = createDocument({ orientation: 'landscape', format: 'a2' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // ──────────────────────────────────────────────────────────
  // Reusable Step 1 Header drawing function (called on every page)
  // Returns the Y position after the header block.
  // ──────────────────────────────────────────────────────────
  const drawStep1Header = (): number => {
    let hY = 10;

    // Title bar (APG + doc title + customer logo)
    hY = drawHeader(doc, t('export.pfmea.title') || 'PROCESS FAILURE MODE AND EFFECTS ANALYSIS (PFMEA)', data.header.pfmeaNumber, pageWidth, {
      partNumber: data.header.partNumber,
      description: data.header.description,
      engineeringLevel: data.header.revision,
      customer: data.header.customer,
      safetyCharacteristic: data.header.customer.toLowerCase().includes('toyota') ? '▽' : (data.header.safetyCharacteristic || 'D'),
      date: data.printDate,
      revision: data.header.revision
    }, hY, true);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    const mY = hY;

    // Left Section Data
    const leftCol1Fields = [
      { label: t('export.pfmea.header.partNumber'), value: data.header.partNumber || '' },
      { label: t('export.pfmea.header.description'), value: data.header.description || '' },
    ];
    const leftCol2Fields = [
      { label: t('export.pfmea.header.project'), value: data.header.project || '' },
      { label: t('export.pfmea.header.customer'), value: data.header.customer || '' },
    ];
    const teamField = { label: t('export.pfmea.header.team'), value: data.header.team || '' };

    doc.setFont('helvetica', 'bold');
    let c1W = 25;
    for (const field of leftCol1Fields) {
      const w = doc.getTextWidth(field.label);
      if (w + 5 > c1W) c1W = w + 5;
    }
    let c2W = 25;
    for (const field of leftCol2Fields) {
      const w = doc.getTextWidth(field.label);
      if (w + 5 > c2W) c2W = w + 5;
    }
    const tLabelW = doc.getTextWidth(teamField.label) + 5;

    // Right Section Data
    const rStartX = pageWidth - margin - 120;
    const rightFields = [
      { label: t('export.pfmea.header.pfmeaNumber'), value: data.header.pfmeaNumber || '' },
      { label: t('export.pfmea.header.manufacturing'), value: data.header.manufacturing || 'Pelzer de México, S.A. de C.V.' },
      { label: t('export.pfmea.header.preparedBy'), value: data.header.preparedBy || '' },
      { label: t('export.pfmea.header.originalDate'), value: data.header.originalDate || '' },
      { label: t('export.pfmea.header.revisionDate'), value: data.header.revisionDate || '' },
    ];
    let rLabelW = 25;
    for (const field of rightFields) {
      const w = doc.getTextWidth(field.label);
      if (w + 5 > rLabelW) rLabelW = w + 5;
    }

    // Calculate Heights
    let leftY = mY + 14;
    const c1R: Array<{ label: string; lines: string[]; y: number }> = [];
    let ly1 = leftY;
    for (const field of leftCol1Fields) {
      const lines = doc.splitTextToSize(field.value, 90 - c1W);
      c1R.push({ label: field.label, lines, y: ly1 });
      ly1 += (lines.length * 5) + 2;
    }
    const c2R: Array<{ label: string; lines: string[]; y: number }> = [];
    let ly2 = leftY;
    for (const field of leftCol2Fields) {
      const lines = doc.splitTextToSize(field.value, 90 - c2W);
      c2R.push({ label: field.label, lines, y: ly2 });
      ly2 += (lines.length * 5) + 2;
    }
    const mColY = Math.max(ly1, ly2);
    const tLines = doc.splitTextToSize(teamField.value, 195 - tLabelW);
    const tRender = { label: teamField.label, lines: tLines, y: mColY };
    leftY = mColY + (tLines.length * 5) + 2;

    let rightY = mY + 14;
    const rR: Array<{ label: string; lines: string[]; y: number }> = [];
    for (const field of rightFields) {
      const lines = doc.splitTextToSize(field.value, 114 - rLabelW);
      rR.push({ label: field.label, lines, y: rightY });
      rightY += (lines.length * 5) + 2;
    }

    const mHeight = Math.max(leftY - mY, rightY - mY, 32);

    // Box border
    doc.rect(margin, mY, pageWidth - margin * 2, mHeight);
    doc.line(pageWidth - margin - 120, mY, pageWidth - margin - 120, mY + mHeight);

    // Step 1 Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(t('pfmea.worksheet.steps.step1') || 'Step 1: Planning and Preparation', margin + 2, mY + 5);

    // Draw Left Col 1
    for (const item of c1R) {
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, margin + 2, item.y);
      doc.setFont('helvetica', 'normal');
      doc.text(item.lines, margin + c1W, item.y);
    }
    // Draw Left Col 2
    for (const item of c2R) {
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, margin + 105, item.y);
      doc.setFont('helvetica', 'normal');
      doc.text(item.lines, margin + 105 + c2W, item.y);
    }
    // Draw Team
    doc.setFont('helvetica', 'bold');
    doc.text(tRender.label, margin + 2, tRender.y);
    doc.setFont('helvetica', 'normal');
    doc.text(tRender.lines, margin + Math.max(c1W, tLabelW), tRender.y);

    // Middle Section Checkboxes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const protoText = t('export.pfmea.header.stages.prototype');
    const preLaunchText = t('export.pfmea.header.stages.preLaunch');
    const prodText = t('export.pfmea.header.stages.production');
    const protoW = doc.getTextWidth(protoText);
    const preLaunchW = doc.getTextWidth(preLaunchText);
    const prodW = doc.getTextWidth(prodText);
    const cbTotalW = protoW + preLaunchW + prodW + 40;
    const cbStartX = pageWidth - margin - 120 - cbTotalW - 5;

    let cx = cbStartX;
    doc.text(protoText, cx, mY + 14);
    cx += protoW + 2;
    doc.rect(cx, mY + 11, 6, 4);
    cx += 12;
    doc.text(preLaunchText, cx, mY + 14);
    cx += preLaunchW + 2;
    doc.rect(cx, mY + 11, 6, 4);
    cx += 12;
    doc.text(prodText, cx, mY + 14);
    cx += prodW + 2;
    doc.rect(cx, mY + 11, 6, 4);
    doc.setFillColor(0, 0, 0);
    doc.rect(cx, mY + 11, 6, 4, 'F');

    const respLabel = t('export.pfmea.header.responsible');
    const respLW = doc.getTextWidth(respLabel);
    doc.text(respLabel, cbStartX, mY + 20);
    doc.setFont('helvetica', 'normal');
    const respVal = data.header.processResponsible || prodText;
    const respLns = doc.splitTextToSize(respVal, Math.max(20, cbTotalW - respLW - 2));
    doc.text(respLns, cbStartX + respLW + 2, mY + 20);

    // Draw Right Section
    for (const item of rR) {
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, rStartX + 4, item.y);
      doc.setFont('helvetica', 'normal');
      doc.text(item.lines, rStartX + 4 + rLabelW, item.y);
    }

    return mY + mHeight + 5;
  };

  // ──────────────────────────────────────────────────────────
  // Draw header on the first page
  // ──────────────────────────────────────────────────────────
  let currentY = drawStep1Header();

  // Calculate the header height so we know top margin for subsequent pages
  const headerHeight = currentY - margin;

  // Main Table Headers (VDA AIAG Grouped)
  const groupHeaders = [
    { content: t('pfmea.worksheet.steps.step2') + '\n(' + t('pfmea.worksheet.steps.step2Desc') + ')', colSpan: 3, styles: { fillColor: [222, 237, 248], textColor: 0, halign: 'center' as const, fontSize: 12, fontStyle: 'bold' } },
    { content: t('pfmea.worksheet.steps.step3') + '\n(' + t('pfmea.worksheet.steps.step3Desc') + ')', colSpan: 5, styles: { fillColor: [222, 247, 232], textColor: 0, halign: 'center' as const, fontSize: 12, fontStyle: 'bold' } },
    { content: t('pfmea.worksheet.steps.step4') + '\n(' + t('pfmea.worksheet.steps.step4Desc') + ')', colSpan: 4, styles: { fillColor: [248, 222, 222], textColor: 0, halign: 'center' as const, fontSize: 12, fontStyle: 'bold' } },
    { content: t('pfmea.worksheet.steps.step5') + '\n(' + t('pfmea.worksheet.steps.step5Desc') + ')', colSpan: 6, styles: { fillColor: [255, 247, 222], textColor: 0, halign: 'center' as const, fontSize: 12, fontStyle: 'bold' } }, 
    { content: t('pfmea.worksheet.steps.step6') + '\n(' + t('pfmea.worksheet.steps.step6Desc') + ')', colSpan: 13, styles: { fillColor: [222, 245, 253], textColor: 0, halign: 'center' as const, fontSize: 12, fontStyle: 'bold' } }
  ];

  const colHeaders: any[] = [
    '', // 0
    '', // 1
    '', // 2
    t('pfmea.worksheet.columns.functionItemPlant'),
    t('pfmea.worksheet.columns.functionStepProduct'),
    t('pfmea.worksheet.columns.productCharacteristic'),
    t('pfmea.worksheet.columns.functionWorkElementChar'),
    t('pfmea.worksheet.columns.processCharacteristic'),
    t('pfmea.worksheet.columns.failureEffectCol'),
    '', // 9
    t('pfmea.worksheet.columns.failureModeCol'),
    t('pfmea.worksheet.columns.failureCauseCol'),
    t('pfmea.worksheet.columns.prevention'),
    '', // 13
    t('pfmea.worksheet.columns.detectionCtrl'),
    '', // 15
    '', // 16
    '', // 17
    t('pfmea.worksheet.abbr.optPrevention'),
    t('pfmea.worksheet.abbr.optDetection'),
    t('pfmea.worksheet.abbr.optResponsible'),
    t('pfmea.worksheet.abbr.optTargetDate'),
    t('pfmea.worksheet.abbr.optStatus'),
    t('pfmea.worksheet.abbr.optActionsTaken'),
    t('pfmea.worksheet.abbr.optCompletionDate'),
    '', // 25
    '', // 26
    '', // 27
    '', // 28
    '', // 29
    '' // 30
  ];

  const rawData = data.rows.map((row) => [
    row.process || '',
    row.stationOperation || '',
    row.workElement || '',
    row.functionItem || '',
    row.functionStep || '',
    row.productCharacteristic || '',
    row.functionWorkElement || '',
    row.processCharacteristic || '',
    row.failureEffect || '',
    row.severity || '',
    row.failureMode || '',
    row.failureCause || '',
    row.preventionControl || '',
    row.occurrence || '',
    row.detectionControl || '',
    row.detection || '',
    row.actionPriority || '',
    row.specialCharacteristic || '',
    row.preventionAction || '',
    row.detectionAction || '',
    row.responsible || '',
    row.targetDate || '',
    row.status || '',
    row.actionsTaken || '',
    row.completionDate || '',
    row.newSeverity || '',
    row.newOccurrence || '',
    row.newDetection || '',
    row.newSpecialCharacteristic || '',
    row.newAP || '',
    row.observations || ''
  ]);

  const spannedData: any[][] = rawData.map(r => [...r]);

  // Combine rows for columns of Step 2 (cols 0, 1, 2) using Virtual RowSpan
  for (let col = 0; col <= 2; col++) {
    let spanStartRow = 0;
    for (let i = 1; i <= rawData.length; i++) {
      let isSame = false;
      if (i < rawData.length) {
        isSame = rawData[i][col] === rawData[i - 1][col] && rawData[i][col] !== '';
        if (col > 0 && isSame) {
          for (let p = 0; p < col; p++) {
            if (rawData[i][p] !== rawData[i - 1][p]) {
              isSame = false;
              break;
            }
          }
        }
      }

      if (!isSame) {
        const spanCount = i - spanStartRow;
        if (spanCount >= 1) { // Always create object to support vertical text
          spannedData[spanStartRow][col] = { 
            content: rawData[spanStartRow][col], 
            _isGroupStart: true,
            _originalContent: rawData[spanStartRow][col],
            _isLastInGroup: spanCount === 1
          };
          for (let j = spanStartRow + 1; j < i; j++) {
            spannedData[j][col] = { 
              content: rawData[spanStartRow][col], 
              _isMerged: true, 
              _originalContent: rawData[spanStartRow][col], 
              _isLastInGroup: (j === i - 1) 
            };
          }
        }
        spanStartRow = i;
      }
    }
  }

  // Do NOT filter out nulls since we need all cells for Virtual RowSpan
  const finalTableData = spannedData;
  let lastPageForCol: { [key: number]: number } = { 0: -1, 1: -1, 2: -1 };

  (doc as any).autoTable({
    startY: currentY,
    margin: { left: margin, right: margin, top: headerHeight + margin, bottom: 20 },
    head: [groupHeaders, colHeaders],
    body: finalTableData,
    showHead: 'everyPage',
    rowPageBreak: 'avoid', // Prevents rows from being split across pages
    theme: 'grid',
    styles: {
      fontSize: 12,
      cellPadding: 1,
      lineColor: COLORS.border,
      lineWidth: 0.2,
      halign: 'left',
      valign: 'top',
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 12,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'center', cellWidth: 15 },
      3: { cellWidth: 45 },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center' },
      8: { cellWidth: 45 },
      9: { halign: 'center', cellWidth: 8 },
      10: { halign: 'center', cellWidth: 25 },
      11: { halign: 'center', cellWidth: 25 },
      12: { cellWidth: 25 },
      13: { halign: 'center', cellWidth: 8 },
      14: { cellWidth: 25 },
      15: { halign: 'center', cellWidth: 8 },
      16: { halign: 'center', fontStyle: 'bold', cellWidth: 8 },
      17: { halign: 'center', cellWidth: 8 },
      18: { halign: 'center', cellWidth: 25 },
      19: { halign: 'center', cellWidth: 25 },
      20: { halign: 'center', cellWidth: 8 },
      21: { halign: 'center', cellWidth: 8 },
      22: { halign: 'center', cellWidth: 8 },
      23: { cellWidth: 25 },
      24: { halign: 'center', cellWidth: 8 },
      25: { halign: 'center', cellWidth: 8 },
      26: { halign: 'center', cellWidth: 8 },
      27: { halign: 'center', cellWidth: 8 },
      28: { halign: 'center', cellWidth: 8 },
      29: { halign: 'center', fontStyle: 'bold', cellWidth: 8 },
      30: { halign: 'center', cellWidth: 15 },
    },
      didParseCell: (dataHook: any) => {
        // Force height for the second header row to fit rotated text by injecting dummy lines
        if (dataHook.section === 'head' && dataHook.row.index === 1) {
          const rotatedCols = [0, 1, 2, 9, 13, 15, 16, 17, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30];
          if (rotatedCols.includes(dataHook.column.index)) {
             // 14 lines is roughly ~45mm, precisely fitting the 2-line wraps
             if (dataHook.cell.text.length < 14) {
               dataHook.cell.text = Array(14).fill('');
             }
          }
        }

        // Force height for body cells with rotated text
        const bodyRotatedCols = [0, 1, 2, 20, 21, 22, 24];
        if (dataHook.section === 'body') {
          const colIdx = dataHook.column.index;
          
          if (bodyRotatedCols.includes(colIdx)) {
            const raw = dataHook.cell.raw;
            let textToRotate = '';
            
            if ([0, 1, 2].includes(colIdx) && raw && typeof raw === 'object') {
               // Virtual RowSpan logic
               const pageNum = dataHook.pageNumber;
               const isFirstOnPage = (pageNum !== lastPageForCol[colIdx]);
               if (isFirstOnPage) lastPageForCol[colIdx] = pageNum;
               
               const showText = raw._isGroupStart || (raw._isMerged && isFirstOnPage);
               raw._restoredOnPage = showText;
               
               if (showText) textToRotate = raw._originalContent || '';
            } else if (typeof raw === 'string') {
               textToRotate = raw;
            } else if (raw && raw.content) {
               textToRotate = raw.content;
            }
            
            if (textToRotate) {
               dataHook.doc.setFontSize(12);
               const textWidth = dataHook.doc.getTextWidth(textToRotate);
               // 1 line is ~4.8mm. +8mm for padding
               const requiredLines = Math.ceil((textWidth + 8) / 4.8);
               dataHook.cell.text = Array(requiredLines).fill('');
               dataHook.cell._rotatedText = textToRotate; // Store for didDrawCell
            } else {
               dataHook.cell.text = [''];
               dataHook.cell._rotatedText = '';
            }
          }
        }

        // Column colors for Step 2, 3, 4, 5, 6 headers
        if (dataHook.section === 'head' && dataHook.row.index === 1) {
          const colIdx = dataHook.column.index;
          if (colIdx === 0 || colIdx === 3 || colIdx === 8) dataHook.cell.styles.fillColor = [243, 243, 243]; // Gray
          else if (colIdx === 1 || colIdx === 4 || colIdx === 10) dataHook.cell.styles.fillColor = [232, 244, 255]; // Blue
          else if (colIdx === 2 || colIdx === 6 || colIdx === 11) dataHook.cell.styles.fillColor = [242, 232, 255]; // Purple
          else if (colIdx === 5) dataHook.cell.styles.fillColor = [215, 234, 255]; // Light blue for product char
          else if (colIdx === 7) dataHook.cell.styles.fillColor = [227, 215, 255]; // Light purple for process char
          else if (colIdx === 9 || (colIdx >= 12 && colIdx <= 16) || [18, 19, 25, 26, 27, 29, 30].includes(colIdx)) dataHook.cell.styles.fillColor = [216, 251, 228]; // Light Green
          else if (colIdx === 17 || colIdx === 28) dataHook.cell.styles.fillColor = [199, 229, 255]; // Light Blue
          else if (colIdx >= 20 && colIdx <= 24) dataHook.cell.styles.fillColor = [255, 255, 255]; // White
        }

        // Column colors for body (pastel tones to distinguish from header)
        if (dataHook.section === 'body') {
          const colIdx = dataHook.column.index;
          if (colIdx === 0 || colIdx === 3 || colIdx === 8) dataHook.cell.styles.fillColor = [250, 250, 250]; // Pastel Gray
          else if (colIdx === 1 || colIdx === 4 || colIdx === 10) dataHook.cell.styles.fillColor = [246, 251, 255]; // Pastel Blue
          else if (colIdx === 2 || colIdx === 6 || colIdx === 11) dataHook.cell.styles.fillColor = [250, 246, 255]; // Pastel Purple
          else if (colIdx === 5) dataHook.cell.styles.fillColor = [234, 246, 255]; // Pastel blue for product char
          else if (colIdx === 7) dataHook.cell.styles.fillColor = [242, 236, 255]; // Pastel purple for process char
          else if (colIdx === 9 || (colIdx >= 12 && colIdx <= 16) || [18, 19, 25, 26, 27, 29, 30].includes(colIdx)) dataHook.cell.styles.fillColor = [242, 253, 246]; // Pastel Green
          else if (colIdx === 17 || colIdx === 28) dataHook.cell.styles.fillColor = [233, 245, 255]; // Pastel Light Blue
          else if (colIdx >= 20 && colIdx <= 24) dataHook.cell.styles.fillColor = [255, 255, 255]; // White
        }
        
      // Emphasize risk cells (S, O, D, AP) with bold text but keep column background colors
      if (dataHook.section === 'body') {
        const colIdx = dataHook.column.index;
        if ([9, 13, 15, 16, 25, 26, 27, 29].includes(colIdx)) {
          if (dataHook.cell.raw) {
            dataHook.cell.styles.fontStyle = 'bold';
          }
        }
        // Handle inverted triangle symbol which is not supported by jsPDF helvetica
        if (colIdx === 17 || colIdx === 28) {
          if (dataHook.cell.raw === '▽' || (dataHook.cell.raw && dataHook.cell.raw.content === '▽')) {
            dataHook.cell.text = [''];
            dataHook.cell._isTriangle = true;
          }
        }
      }

    },
    didDrawCell: (dataHook: any) => {
      // Draw rotated text for rotated headers
      const rotatedCols = [0, 1, 2, 9, 13, 15, 16, 17, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30];
      if (dataHook.section === 'head' && dataHook.row.index === 1 && rotatedCols.includes(dataHook.column.index)) {
        const doc = dataHook.doc;
        let text = '';
        
        if (dataHook.column.index === 0) text = t('pfmea.worksheet.columns.processItem');
        if (dataHook.column.index === 1) text = t('pfmea.worksheet.columns.station');
        if (dataHook.column.index === 2) text = t('pfmea.worksheet.columns.workElement');
        if (dataHook.column.index === 9 || dataHook.column.index === 25) text = t('pfmea.worksheet.columns.severity');
        if (dataHook.column.index === 13 || dataHook.column.index === 26) text = t('pfmea.worksheet.columns.occurrence');
        if (dataHook.column.index === 15 || dataHook.column.index === 27) text = t('pfmea.worksheet.columns.detection');
        if (dataHook.column.index === 16 || dataHook.column.index === 29) text = t('pfmea.worksheet.columns.ap');
        if (dataHook.column.index === 17 || dataHook.column.index === 28) text = t('pfmea.worksheet.abbr.specialCharacteristics');
        if (dataHook.column.index === 20) text = t('pfmea.worksheet.columns.responsible');
        if (dataHook.column.index === 21) text = t('pfmea.worksheet.columns.targetDate');
        if (dataHook.column.index === 22) text = t('pfmea.worksheet.columns.status');
        if (dataHook.column.index === 24) text = t('pfmea.worksheet.columns.optCompletionDate');
        if (dataHook.column.index === 30) text = t('pfmea.worksheet.abbr.optObservations');
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        
        const availableHeight = dataHook.cell.height - 4; // 2px padding top/bottom
        const textLines = doc.splitTextToSize(text, availableHeight);
        
        const lineHeight = 4.8; // Approx line height for font size 12
        const totalTextBlockWidth = textLines.length * lineHeight;
        
        let startX = dataHook.cell.x + dataHook.cell.width / 2 - totalTextBlockWidth / 2 + (lineHeight / 2);
        
        textLines.forEach((line: string) => {
           const lineW = doc.getTextWidth(line);
           const y = dataHook.cell.y + dataHook.cell.height / 2 + lineW / 2;
           doc.text(line, startX, y, { angle: 90 });
           startX += lineHeight;
        });
      }

      // Virtual RowSpan: Erase top border of merged cells to look like rowSpan
      if (dataHook.section === 'body' && (dataHook.column.index === 0 || dataHook.column.index === 1 || dataHook.column.index === 2)) {
        const raw = dataHook.cell.raw;
        if (raw && raw._isMerged) {
            // Erase top border if this is NOT the first cell shown on the page
            if (!raw._restoredOnPage) {
                const fillColor = dataHook.cell.styles.fillColor;
                if (Array.isArray(fillColor)) {
                    doc.setDrawColor(fillColor[0], fillColor[1], fillColor[2]);
                } else {
                    doc.setDrawColor(255, 255, 255);
                }
                doc.setLineWidth(0.4);
                doc.line(dataHook.cell.x + 0.1, dataHook.cell.y, dataHook.cell.x + dataHook.cell.width - 0.1, dataHook.cell.y);
            }
            // Erase bottom border if this is NOT the last in group
            // (If it's the last on the page, erasing it leaves an open bottom, which correctly indicates continuation!)
            if (!raw._isLastInGroup) {
                const fillColor = dataHook.cell.styles.fillColor;
                if (Array.isArray(fillColor)) {
                    doc.setDrawColor(fillColor[0], fillColor[1], fillColor[2]);
                } else {
                    doc.setDrawColor(255, 255, 255);
                }
                doc.setLineWidth(0.4);
                doc.line(dataHook.cell.x + 0.1, dataHook.cell.y + dataHook.cell.height, dataHook.cell.x + dataHook.cell.width - 0.1, dataHook.cell.y + dataHook.cell.height);
            }
            doc.setDrawColor(0, 0, 0); // reset
            doc.setLineWidth(0.2);
        } else if (raw && raw._isGroupStart && !raw._isLastInGroup) {
            // For the VERY first cell of a group, we also need to erase its bottom border!
            const fillColor = dataHook.cell.styles.fillColor;
            if (Array.isArray(fillColor)) {
                doc.setDrawColor(fillColor[0], fillColor[1], fillColor[2]);
            } else {
                doc.setDrawColor(255, 255, 255);
            }
            doc.setLineWidth(0.4);
            doc.line(dataHook.cell.x + 0.1, dataHook.cell.y + dataHook.cell.height, dataHook.cell.x + dataHook.cell.width - 0.1, dataHook.cell.y + dataHook.cell.height);
            doc.setDrawColor(0, 0, 0); // reset
            doc.setLineWidth(0.2);
        }
        
        // Render the rotated body text manually
        const bodyRotatedCols = [0, 1, 2, 20, 21, 22, 24];
        if (dataHook.section === 'body' && bodyRotatedCols.includes(dataHook.column.index)) {
           const textToDraw = dataHook.cell._rotatedText;
           if (textToDraw) {
               const doc = dataHook.doc;
               doc.setFontSize(12); // match body fontSize
               doc.setTextColor(0, 0, 0);
               doc.setFont('helvetica', 'normal');
               
               const padding = 2;
               // Limit vertical text length to remaining page height so it doesn't overflow the page
               const remainingSpace = doc.internal.pageSize.height - dataHook.cell.y - 20; 
               const textLines = doc.splitTextToSize(textToDraw, remainingSpace);
               
               const lineHeight = 4.8; // match body line height for size 12
               const totalBlockWidth = textLines.length * lineHeight;
               
               let startX = dataHook.cell.x + dataHook.cell.width / 2 - totalBlockWidth / 2 + (lineHeight / 2);
               
               textLines.forEach((line: string) => {
                   const lineW = doc.getTextWidth(line);
                   // Because angle 90 draws bottom-to-top, the starting Y must be at the BOTTOM of the text line
                   const y = dataHook.cell.y + padding + lineW; 
                   
                   doc.text(line, startX, y, { angle: 90 });
                   startX += lineHeight;
               });
           }
        }
        
        // Render manual triangle if required
        if (dataHook.section === 'body' && (dataHook.column.index === 17 || dataHook.column.index === 28)) {
          if (dataHook.cell._isTriangle) {
            const doc = dataHook.doc;
            const size = 3;
            const topY = dataHook.cell.y + dataHook.cell.height / 2 - 2;
            const bottomY = dataHook.cell.y + dataHook.cell.height / 2 + 2.5;
            const centerX = dataHook.cell.x + dataHook.cell.width / 2;
            
            doc.setDrawColor(200, 0, 0);
            doc.setLineWidth(0.3);
            doc.triangle(
              centerX - size, topY,
              centerX + size, topY,
              centerX, bottomY,
              'S'
            );
            
            doc.setTextColor(200, 0, 0);
            doc.setFontSize(5);
            doc.setFont('helvetica', 'bold');
            doc.text('R', centerX, topY + 1.5, { align: 'center', baseline: 'middle' });
          }
        }
      }
    },
    didDrawPage: (hookData: any) => {
      // Redraw Step 1 header on every page after the first
      if (hookData.pageNumber > 1) {
        drawStep1Header();
      }
    }
  });

  // ──────────────────────────────────────────────────────────
  // Footer with page numbering on ALL pages
  // ──────────────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageLabel = t('export.pfmea.footer.page') || 'Página';
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, data.header.revision, data.printDate, data.revisionDate, pageWidth, pageHeight, 'FIN-07', t('export.pfmea.footer.printDate') || 'Fecha de impresión:', t('export.pfmea.footer.revisionDate') || 'Fecha de Rev.:');

    // Page numbering: "Página n/m" placed slightly above the FIN code
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(`${pageLabel} ${i}/${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  return doc.output('blob');
}
