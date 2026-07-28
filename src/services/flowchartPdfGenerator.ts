// ─────────────────────────────────────────────────────────────
//  Flowchart PDF Generator
//  Generates the FIN-05 process flow diagram using jsPDF + AutoTable
// ─────────────────────────────────────────────────────────────

import { createDocument, drawHeader, drawFooter, COLORS } from './jspdfService';
import { ImageRegistry } from './imageRegistry';
import type { FlowchartPdfData, FlowchartPdfRow } from '../types/flowchartExport.types';
import type { SymbolType } from '../types/flowchart.types';
// We need to import i18n directly or pass t function. We'll pass t function for flexibility.

export async function generateFlowchartPdf(data: FlowchartPdfData, t: (key: string) => string): Promise<Blob> {
  const doc = createDocument({ orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let currentY = 10;

  // Clean part number if it has "* VER PORTADA"
  const extractNP = (str: string) => {
    const match = str.match(/["']([^"']+)["']/);
    return match ? match[1] : str.replace(/\*\s*VER PORTADA\s*/g, '').replace(/\*/g, '').trim();
  };
  const cleanPartNumber = extractNP(data.header.partNumber);

  // Format Document Number
  const baseDoc = data.header.documentNumber.replace('DF ', '').trim();
  const currentYear = new Date().getFullYear();
  const docNumber = `APG_PUE_FLOWCHART_${baseDoc}_${currentYear}_${data.header.revision}`;

  // Header
  currentY = drawHeader(doc, t('export.flowchart.title') || 'DIAGRAMA DE PROCESO DE FLUJO', docNumber, pageWidth, {
    partNumber: cleanPartNumber,
    description: data.header.partName || data.header.description || '',
    engineeringLevel: data.header.revision, // Placeholder mapping if needed
    customer: data.header.customer,
    safetyCharacteristic: data.header.safetyCharacteristic,
    date: data.printDate,
    revision: data.header.revision
  }, currentY);

  // Main Table
  const tableHeaders = [
    t('export.flowchart.columns.no') || 'No.',
    t('export.flowchart.columns.description') || 'Descripción',
    t('export.flowchart.columns.location') || 'Ubicaciones',
    t('export.flowchart.columns.hic') || 'HIC',
    t('export.flowchart.columns.quality') || 'Calidad',
    t('export.flowchart.columns.production') || 'Producción',
    t('export.flowchart.columns.logistics') || 'Logística',
    t('export.flowchart.columns.materials') || 'Materiales',
    t('export.flowchart.columns.others') || 'Otros',
    t('export.flowchart.columns.norm') || 'Norma',
    t('export.flowchart.columns.machinery') || 'Maquinaria'
  ];

  const tableData = data.rows.map((row) => [
    row.stepNumber.toString(),
    row.description,
    row.location,
    row.hic === '▽' ? '' : (row.hic || ''),
    row.symbols.calidad ? '' : '', // Placeholder for image
    row.symbols.produccion ? '' : '',
    row.symbols.logistica ? '' : '',
    row.symbols.materiales ? '' : '',
    row.symbols.otros ? '' : '',
    row.norma,
    row.maquinaria
  ]);

  (doc as any).autoTable({
    startY: currentY,
    tableWidth: pageWidth - margin * 2, // Force exact width matching header
    margin: { left: margin, right: margin },
    head: [tableHeaders],
    body: tableData,
    theme: 'grid', // Plain grid, no background colors
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: COLORS.border,
      lineWidth: 0.2,
      halign: 'center',
      valign: 'middle',
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [240, 240, 240], // Light gray background
      textColor: [0, 0, 0],
      fontStyle: 'bold', 
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9, fillColor: [240, 240, 240] },
      1: { halign: 'center' }, // Let Description stretch to fill remaining space
      2: { halign: 'center', cellWidth: 19 }, // Locations
      3: { halign: 'center', textColor: [255, 0, 0], fontStyle: 'bold', cellWidth: 10 }, // HIC
      4: { halign: 'center', cellWidth: 15 }, // Calidad/Quality
      5: { halign: 'center', cellWidth: 20 }, // Produccion/Production
      6: { halign: 'center', cellWidth: 17 }, // Logistica/Logistics
      7: { halign: 'center', cellWidth: 18 }, // Materiales/Materials
      8: { halign: 'center', cellWidth: 14 }, // Otros
      9: { halign: 'center', cellWidth: 17, fillColor: [240, 240, 240] }, // Norma
      10: { halign: 'center', cellWidth: 25, fillColor: [240, 240, 240] }, // Maquinaria
    },
    didDrawCell: (dataHook: any) => {
      // Inject Symbol Images
      if (dataHook.section === 'body' && dataHook.column.index >= 4 && dataHook.column.index <= 8) {
        const rowIndex = dataHook.row.index;
        const row = data.rows[rowIndex];
        
        const colMap: Record<number, SymbolType | null> = {
          4: row.symbols.calidad,
          5: row.symbols.produccion,
          6: row.symbols.logistica,
          7: row.symbols.materiales,
          8: row.symbols.otros,
        };

        const symbolType = colMap[dataHook.column.index];
        if (symbolType) {
          const base64Img = ImageRegistry.symbols[symbolType];
          if (base64Img) {
            const dim = 7.5;
            const x = dataHook.cell.x + (dataHook.cell.width - dim) / 2;
            const y = dataHook.cell.y + (dataHook.cell.height - dim) / 2;
            doc.addImage(base64Img, 'PNG', x, y, dim, dim);
          }
        }
      }
      
      // Draw manual triangle if required for HIC
      if (dataHook.section === 'body' && dataHook.column.index === 3) {
        const rowIndex = dataHook.row.index;
        if (data.rows[rowIndex] && data.rows[rowIndex].hic === '▽') {
            const size = 2.5;
            const topY = dataHook.cell.y + dataHook.cell.height / 2 - 1.5;
            const bottomY = dataHook.cell.y + dataHook.cell.height / 2 + 2;
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
            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'bold');
            doc.text('R', centerX, topY + 1.2, { align: 'center', baseline: 'middle' });
        }
      }
    },
  });

  // Fixed bottom section: Summary, Quality Seal, Notes and Signatures
  let bottomAreaY = pageHeight - 80;

  // Ensure we don't overlap the fixed bottom area
  if ((doc as any).lastAutoTable.finalY > bottomAreaY - 5) {
    doc.addPage();
  }

  // Summary Table (Left)
  const summaryWidth = 60;
  const summaryData = [
    ['', t('export.flowchart.summary.storage') || 'Almacenamiento', data.summary.almacenamiento.toString()],
    ['', t('export.flowchart.summary.autoControl') || 'Auto Control', data.summary.autoControl.toString()],
    ['', t('export.flowchart.summary.delay') || 'Demora', data.summary.demora.toString()],
    ['', t('export.flowchart.summary.inspection') || 'Inspección', data.summary.inspeccion.toString()],
    ['', t('export.flowchart.summary.operation') || 'Operación', data.summary.operacion.toString()],
    ['', t('export.flowchart.summary.pokayoke') || 'Pokayoke', data.summary.pokayoke.toString()],
    ['', t('export.flowchart.summary.transport') || 'Transporte', data.summary.transporte.toString()],
  ];

  (doc as any).autoTable({
    startY: bottomAreaY,
    margin: { left: margin },
    tableWidth: summaryWidth,
    head: [[{ content: 'Resumen de Flujo de Proceso', colSpan: 3, styles: { halign: 'center' } }]],
    body: summaryData,
    foot: [[{ content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } }, { content: data.summary.total.toString(), styles: { fontStyle: 'bold', halign: 'center' } }]],
    theme: 'grid',
    styles: { fontSize: 8, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
    headStyles: { fillColor: [255, 255, 255] },
    footStyles: { fillColor: [255, 255, 255] },
    columnStyles: { 0: { cellWidth: 10 }, 1: { halign: 'center' }, 2: { halign: 'center', cellWidth: 10 } },
    didDrawCell: (dataHook: any) => {
      if (dataHook.section === 'body' && dataHook.column.index === 0) {
        const rowKeys: SymbolType[] = ['storage', 'auto_control', 'delay', 'inspection', 'operation', 'pokayoke', 'transport'];
        const sym = rowKeys[dataHook.row.index];
        const base64Img = ImageRegistry.symbols[sym];
        if (base64Img) {
          const dim = 7.5;
          const x = dataHook.cell.x + (dataHook.cell.width - dim) / 2;
          const y = dataHook.cell.y + (dataHook.cell.height - dim) / 2;
          doc.addImage(base64Img, 'PNG', x, y, dim, dim);
        }
      }
    }
  });

  // Quality Seal Placeholder
  const sealRadius = 7.5;
  const sealX = 90 + sealRadius; 
  const sealY = bottomAreaY + sealRadius; 
  doc.setFillColor(150, 180, 255); // Light blue
  doc.setDrawColor(0, 51, 153);
  doc.circle(sealX, sealY, sealRadius, 'DF');
  doc.setTextColor(0, 51, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.text('100%', sealX, sealY - 1, { align: 'center', angle: -25 });
  doc.text('Calidad', sealX, sealY + 3, { align: 'center', angle: -25 });

  // Notes (Right top)
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bolditalic');
  doc.text('Nota: Si existe una desviación al flujo de proceso deberá solicitar', 155, bottomAreaY + 4, { align: 'center' });
  doc.line(115, bottomAreaY + 5, 195, bottomAreaY + 5);
  doc.text('desviación al departamento de ingeniería, para su aprobación y/o evaluación.', 155, bottomAreaY + 9, { align: 'center' });
  doc.line(115, bottomAreaY + 10, 195, bottomAreaY + 10);
  
  doc.setFont('helvetica', 'italic');
  doc.text('Nota: Para utilizar simbología especial, ver procedimiento PAC-06', 142, bottomAreaY + 18, { align: 'center' });

  // Signatures Area
  const sigY = bottomAreaY + 20;
  const sigTotalW = 108; // Match original width
  const sigStartX = 88; // Match original X coordinate
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  // Box for signatures
  doc.rect(sigStartX, sigY, sigTotalW, 25);
  // Column dividers
  doc.line(sigStartX + 36, sigY, sigStartX + 36, sigY + 25);
  doc.line(sigStartX + 72, sigY, sigStartX + 72, sigY + 25);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  
  // Headers
  doc.text('Elaboró', sigStartX + 18, sigY + 5, { align: 'center' });
  doc.text('Aprobó', sigStartX + 54, sigY + 5, { align: 'center' });
  doc.text('Revisó', sigStartX + 90, sigY + 5, { align: 'center' });

  // Signature lines and text
  const elaboroName = data.signatures[0]?.name || 'Ingeniero de procesos';
  const aproboName = data.signatures[1]?.name || 'Coordinador de Ingeniería';
  const revisoName = data.signatures[2]?.name || 'Coordinador de Ingeniería';

  doc.setFont('helvetica', 'normal');
  doc.text(elaboroName, sigStartX + 18, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Ingeniero de procesos', sigStartX + 18, sigY + 21, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text(aproboName, sigStartX + 54, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Coordinador de Ingeniería', sigStartX + 54, sigY + 21, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text(revisoName, sigStartX + 90, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Coordinador de Ingeniería', sigStartX + 90, sigY + 21, { align: 'center' });

  // Footer and Watermark
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Draw Watermark if archived
    if (data.isArchived) {
      doc.saveGraphicsState();
      try {
        doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
      } catch (e) {
        // Fallback if GState is not available
        doc.setTextColor(253, 230, 138); 
      }
      doc.setTextColor(245, 158, 11); // amber-500
      doc.setFontSize(60);
      doc.setFont('helvetica', 'bold');
      
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      
      doc.text(t('archive.status.archived') || 'ARCHIVADO', centerX, centerY, {
        align: 'center',
        angle: 45,
      });
      doc.restoreGraphicsState();
    }

    drawFooter(doc, data.header.revision, data.printDate, data.revisionDate, pageWidth, pageHeight, 'FIN - 05');
  }

  return doc.output('blob');
}
