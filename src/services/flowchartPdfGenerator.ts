// ─────────────────────────────────────────────────────────────
//  Flowchart PDF Generator - Faithful IMS Corporate Standard
//  Optimized Spacing, Empty Control Number & Clean Characteristics
// ─────────────────────────────────────────────────────────────

import jsPDF from 'jspdf';
import { createDocument } from './jspdfService';
import type { FlowchartPdfData, FlowchartPdfRow } from '../types/flowchartExport.types';
import type { SymbolType } from '../types/flowchart.types';

const MARGIN = 10;
const TABLE_MARGIN_TOP = 42;
const TABLE_MARGIN_BOTTOM = 25;

interface PageLayoutContext {
  data: FlowchartPdfData;
  t: (key: string) => string;
  pageWidth: number;
  pageHeight: number;
}

function cleanPartNumber(val?: string): string {
  if (!val) return '';
  return val
    .replace(/\*\s*SEE COVER PAGE\s*"?/gi, '')
    .replace(/"?\s*\*\*/gi, '')
    .replace(/"/g, '')
    .trim();
}

// ─────────────────────────────────────────────────────────────
//  drawCorporateHeader
// ─────────────────────────────────────────────────────────────
function drawCorporateHeader(doc: jsPDF, ctx: PageLayoutContext, startY: number = 10): number {
  const { data, pageWidth } = ctx;
  const width = pageWidth - MARGIN * 2;
  const rowHeight = 6;
  const currentY = startY;

  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);

  // Outer border box
  doc.rect(MARGIN, currentY, width, rowHeight * 5);

  // Top Title Row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 51, 153);
  doc.text('Adler Pelzer Group', MARGIN + 2, currentY + 4.5);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('PROCESS FLOW DIAGRAM', MARGIN + 52, currentY + 4.5);

  const colSpecialX = MARGIN + 125;
  doc.line(colSpecialX, currentY, colSpecialX, currentY + rowHeight * 5);

  // Special Document Control box background
  doc.setFillColor(200, 200, 200);
  doc.rect(colSpecialX, currentY, width - 125, rowHeight, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Special document\ncontrol (IF REQ\'D):', colSpecialX + 2, currentY + 2.5);

  doc.line(MARGIN, currentY + rowHeight, MARGIN + width, currentY + rowHeight);

  const drawLabelBox = (x: number, y: number, w: number, text: string) => {
    doc.setFillColor(220, 220, 220);
    doc.rect(x, y, w, rowHeight, 'F');
    doc.rect(x, y, w, rowHeight, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text(text, x + 2, y + 4.2);
  };

  // Row 1: PART DESCRIPTION & CONTROL NUMBER (En blanco por requerimiento)
  drawLabelBox(MARGIN, currentY + rowHeight, 35, 'PART DESCRIPTION:');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 153);
  doc.text(data.header.description || '', MARGIN + 37, currentY + rowHeight + 4.2);

  drawLabelBox(colSpecialX, currentY + rowHeight, 32, 'CONTROL NUMBER:');
  // Se deja explícitamente en blanco para futura edición desde el IDE
  doc.text(data.header.documentNumber || '', colSpecialX + 34, currentY + rowHeight + 4.2);

  doc.line(MARGIN, currentY + rowHeight * 2, MARGIN + width, currentY + rowHeight * 2);

  // Row 2: HP PART# & REVISION LEVEL
  const rawHp = (data.header as any).hpPartNumber || data.header.partNumber;
  drawLabelBox(MARGIN, currentY + rowHeight * 2, 35, 'HP PART#:');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 153);
  doc.text(cleanPartNumber(rawHp), MARGIN + 37, currentY + rowHeight * 2 + 4.2);

  drawLabelBox(colSpecialX, currentY + rowHeight * 2, 32, 'REVISION LEVEL:');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 153);
  doc.text(data.header.revision || '1', colSpecialX + 34, currentY + rowHeight * 2 + 4.2);

  doc.line(MARGIN, currentY + rowHeight * 3, MARGIN + width, currentY + rowHeight * 3);

  // Row 3: CUSTOMER PART# & PREPARED BY
  const rawCust = (data.header as any).customerPartNumber || data.header.partNumber;
  drawLabelBox(MARGIN, currentY + rowHeight * 3, 35, 'CUSTOMER PART#:');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 153);
  doc.text(cleanPartNumber(rawCust), MARGIN + 37, currentY + rowHeight * 3 + 4.2);

  drawLabelBox(colSpecialX, currentY + rowHeight * 3, 32, 'PREPARED BY:');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 153);
  doc.text('Teresa Gonzalez', colSpecialX + 34, currentY + rowHeight * 3 + 4.2);

  doc.line(MARGIN, currentY + rowHeight * 4, MARGIN + width, currentY + rowHeight * 4);

  return currentY + rowHeight * 5;
}

// ─────────────────────────────────────────────────────────────
//  drawSymbolShape
// ─────────────────────────────────────────────────────────────
function drawSymbolShape(doc: jsPDF, type: SymbolType, x: number, y: number): void {
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);

  switch (type) {
    case 'operation':
      doc.setFillColor(235, 30, 30);
      doc.circle(x, y, 2.3, 'FD');
      break;

    case 'transport': {
      doc.setFillColor(245, 140, 30);
      const arrowLines: [number, number][] = [
        [2, 0],
        [0, -1.2],
        [2.2, 2.2],
        [-2.2, 2.2],
        [0, -1.2],
        [-2, 0],
        [0, -2],
      ];
      doc.lines(arrowLines, x - 2, y - 1, [1, 1], 'FD', true);
      break;
    }

    case 'auto_control':
    case 'pokayoke': {
      doc.setFillColor(120, 185, 40);
      const diamondLines: [number, number][] = [
        [2.4, 2.4],
        [-2.4, 2.4],
        [-2.4, -2.4],
        [2.4, -2.4],
      ];
      doc.lines(diamondLines, x, y - 2.4, [1, 1], 'FD', true);
      break;
    }

    case 'inspection':
      doc.setFillColor(60, 180, 115);
      doc.rect(x - 2, y - 2, 4, 4, 'FD');
      break;

    case 'delay': {
      doc.setFillColor(70, 200, 220);
      const canvas = doc.canvas;
      if (canvas && (doc as any).context2d) {
        const ctx2d = (doc as any).context2d;
        ctx2d.beginPath();
        ctx2d.fillStyle = 'rgb(70, 200, 220)';
        ctx2d.strokeStyle = 'rgb(0, 0, 0)';
        ctx2d.lineWidth = 0.3;
        ctx2d.moveTo(x - 2, y - 2);
        ctx2d.lineTo(x, y - 2);
        ctx2d.arc(x, y, 2, -Math.PI / 2, Math.PI / 2, false);
        ctx2d.lineTo(x - 2, y + 2);
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.stroke();
      } else {
        doc.rect(x - 2, y - 2, 4, 4, 'FD');
      }
      break;
    }

    case 'storage': {
      doc.setFillColor(60, 130, 220);
      const triangleLines: [number, number][] = [
        [2.2, 4.2],
        [-4.4, 0],
        [2.2, -4.2],
      ];
      doc.lines(triangleLines, x, y - 2.2, [1, 1], 'FD', true);
      break;
    }
  }
}

// ─────────────────────────────────────────────────────────────
//  generateFlowchartPdf  — Public Entry Point
// ─────────────────────────────────────────────────────────────
export async function generateFlowchartPdf(
  data: FlowchartPdfData,
  t: (key: string) => string,
): Promise<Blob> {
  const doc = createDocument({ orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm

  const ctx: PageLayoutContext = { data, t, pageWidth, pageHeight };

  const headerEndY = drawCorporateHeader(doc, ctx, MARGIN);

  const tableHeaders = [
    'STEP #',
    'OPERATION DESCRIPTION',
    '', '', '', '', '', '', '', // Celdas reservadas para dibujo a 90°
    'PRODUCT\nCHARACTERISTICS',
    'PROCESS\nCHARACTERISTICS',
    'TARGET',
  ];

  // Se dejan vacíos los campos de características
  const tableData = data.rows.map((row: FlowchartPdfRow) => [
    row.stepNumber.toString(),
    row.description,
    '', '', '', '', '', '', '', // Columnas de símbolos + Char ID
    '', // PRODUCT CHARACTERISTICS (vacío)
    '', // PROCESS CHARACTERISTICS (vacío)
    '', // TARGET (vacío)
  ]);

  (doc as any).autoTable({
    startY: headerEndY + 2,
    margin: {
      top: TABLE_MARGIN_TOP,
      bottom: TABLE_MARGIN_BOTTOM,
      left: MARGIN,
      right: MARGIN,
    },
    tableWidth: pageWidth - MARGIN * 2,
    head: [tableHeaders],
    body: tableData,
    showHead: 'everyPage',
    pageBreak: 'auto',
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }, // Respiro vertical amplio para cada fila
      minCellHeight: 9,                                     // Altura uniforme para mayor legibilidad
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      halign: 'center',
      valign: 'middle',
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [120, 120, 120],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 6.5,
      minCellHeight: 28, // Mantiene la proporción en cabecera
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { halign: 'left' },
      2: { cellWidth: 7, halign: 'center' },  // OP
      3: { cellWidth: 7, halign: 'center' },  // TR
      4: { cellWidth: 7, halign: 'center' },  // SP
      5: { cellWidth: 7, halign: 'center' },  // IN
      6: { cellWidth: 7, halign: 'center' },  // DE
      7: { cellWidth: 7, halign: 'center' },  // ST
      8: { cellWidth: 14, halign: 'center' }, // CHARACTERISTIC ID
      9: { cellWidth: 30, halign: 'left' },   // PRODUCT CHARACTERISTICS
      10: { cellWidth: 30, halign: 'left' },  // PROCESS CHARACTERISTICS
      11: { cellWidth: 20, halign: 'left' },  // TARGET
    },

    didDrawCell: (hook: any) => {
      // Cabeceras verticales a 90°
      if (hook.section === 'head') {
        const headerLabels: Record<number, { text: string; symbol?: SymbolType }> = {
          2: { text: 'OPERATION', symbol: 'operation' },
          3: { text: 'TRANSPORTATION', symbol: 'transport' },
          4: { text: 'SPLIT / DECISION', symbol: 'auto_control' },
          5: { text: 'INSPECTION', symbol: 'inspection' },
          6: { text: 'DELAY', symbol: 'delay' },
          7: { text: 'STORAGE', symbol: 'storage' },
          8: { text: 'CHARACTERISTIC ID' },
        };

        const config = headerLabels[hook.column.index];
        if (config) {
          const cell = hook.cell;
          doc.saveGraphicsState();

          doc.setFillColor(120, 120, 120);
          doc.rect(cell.x, cell.y, cell.width, cell.height, 'F');
          doc.rect(cell.x, cell.y, cell.width, cell.height, 'S');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5.5);
          doc.setTextColor(0, 0, 0);

          const centerX = cell.x + cell.width / 2 + 1;
          const startTextY = cell.y + cell.height - (config.symbol ? 9 : 3);

          doc.text(config.text, centerX, startTextY, {
            angle: 90,
            align: 'left',
          });

          if (config.symbol) {
            drawSymbolShape(doc, config.symbol, cell.x + cell.width / 2, cell.y + cell.height - 4);
          }

          doc.restoreGraphicsState();
        }
      }

      // Símbolos activos en las filas
      if (hook.section === 'body' && hook.column.index >= 2 && hook.column.index <= 7) {
        const row = data.rows[hook.row.index];
        if (!row) return;

        const activeSymbols = Object.values(row.symbols);
        const columnIndexToSymbolMap: Record<number, SymbolType[]> = {
          2: ['operation'],
          3: ['transport'],
          4: ['auto_control', 'pokayoke'],
          5: ['inspection'],
          6: ['delay'],
          7: ['storage'],
        };

        const targetSymbols = columnIndexToSymbolMap[hook.column.index];
        const matchedSymbol = activeSymbols.find((s) => s && targetSymbols.includes(s));

        if (matchedSymbol) {
          const centerX = hook.cell.x + hook.cell.width / 2;
          const centerY = hook.cell.y + hook.cell.height / 2;
          drawSymbolShape(doc, matchedSymbol, centerX, centerY);
        }
      }
    },
  });

  // Footer & Pagination
  const totalPages = (doc as any).internal.getNumberOfPages() as number;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);

    doc.text('G-C3.0 01 F-APQP work book - Rev. 5', MARGIN, footerY);
    doc.text('FLOW', MARGIN, footerY + 4);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - MARGIN, footerY + 4, { align: 'right' });
  }

  return doc.output('blob');
}