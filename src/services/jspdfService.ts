// ─────────────────────────────────────────────────────────────
//  jsPDF Service — Shared Utilities for PDF Generation
//  Handles document setup, shared headers/footers, and Base64 images.
// ─────────────────────────────────────────────────────────────

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ImageRegistry } from './imageRegistry';

export const COLORS = {
  headerBg: [26, 58, 92], // #1a3a5c
  headerText: [255, 255, 255],
  border: [0, 0, 0],
  lightBg: [245, 245, 245], // #f5f5f5
  columnHeaderBg: [44, 95, 138], // #2c5f8a
  rowAltBg: [250, 250, 250],
};

export interface PdfOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'tabloid' | 'ledger';
}

/**
 * Initialize a standard APG jsPDF document.
 */
export function createDocument(options: PdfOptions = { orientation: 'landscape' }): jsPDF {
  return new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: options.format || 'a4',
  });
}

/**
 * Draws the standard APG document header grid.
 */
export function drawHeader(
  doc: jsPDF,
  title: string,
  docNumber: string,
  pageWidth: number,
  data: {
    partNumber: string;
    description: string;
    engineeringLevel: string;
    customer: string;
    safetyCharacteristic?: string;
    date: string;
    revision: string;
  },
  startY: number = 10,
  skipGrid: boolean = false
): number {
  const margin = 10;
  let currentY = startY;

  // Title Row (Top)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(margin, currentY, pageWidth - margin * 2, 12);
  
  // Left: APG Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 153); // APG Blue
  doc.text('Adler Pelzer Group', margin + 2, currentY + 8);
  
  // Center: Title
  doc.setTextColor(0, 0, 0);
  doc.text(title, pageWidth / 2, currentY + 8, { align: 'center' });
  
  // Right: Customer Logo/Text Space (width 30)
  doc.line(pageWidth - margin - 50, currentY, pageWidth - margin - 50, currentY + 12);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  const customerLines = doc.splitTextToSize(data.customer, 28);
  doc.text(customerLines.slice(0, 2), pageWidth - margin - 35, currentY + 5, { align: 'center', baseline: 'top' });

  // Far Right: Classification (width 20)
  doc.line(pageWidth - margin - 20, currentY, pageWidth - margin - 20, currentY + 12);
  const safeChar = data.safetyCharacteristic || 'D';
  const centerX = pageWidth - margin - 10;
  
  if (safeChar === '▽') {
    doc.setDrawColor(200, 0, 0);
    doc.setLineWidth(0.5);
    const size = 4.5;
    const topY = currentY + 2.5;
    const bottomY = currentY + 9.5;
    
    doc.triangle(
      centerX - size, topY,
      centerX + size, topY,
      centerX, bottomY,
      'S'
    );
    
    doc.setTextColor(200, 0, 0);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('R', centerX, topY + 3.2, { align: 'center', baseline: 'middle' });
  } else {
    doc.setTextColor(200, 0, 0);
    doc.setFontSize(18);
    doc.text(safeChar.replace(/<|>/g, ''), centerX, currentY + 9, { align: 'center' });
  }
  
  currentY += 12;

  if (skipGrid) {
    return currentY;
  }

  // Metadata Grid using autoTable for dynamic height and text wrapping
  (doc as any).autoTable({
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      cellPadding: 1.5,
      valign: 'middle'
    },
    body: [
      [
        { content: 'Número de parte:', styles: { fontStyle: 'bold' } },
        { content: data.partNumber },
        { content: 'Cliente:', styles: { fontStyle: 'bold' } },
        { content: data.customer },
        { content: docNumber.replace('_FLOWCHART_', '_FLOWCHART_\n'), rowSpan: 3, styles: { halign: 'center', fontSize: 8, fontStyle: 'bold' } }
      ],
      [
        { content: 'Descripción:', styles: { fontStyle: 'bold' } },
        { content: data.description },
        { content: 'Fecha:', styles: { fontStyle: 'bold' } },
        { content: data.date }
      ],
      [
        { content: 'Nivel de Ingeniería:', styles: { fontStyle: 'bold' } },
        { content: data.engineeringLevel },
        { content: 'Revisión:', styles: { fontStyle: 'bold' } },
        { content: data.revision }
      ]
    ],
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 58 },
      2: { cellWidth: 17 }, // Increased to fit 'Revisión:'
      3: { cellWidth: 38 }, // Compensate
      4: { cellWidth: 45 }
    }
  });

  return (doc as any).lastAutoTable.finalY + 5; // +5 padding before table
}

/**
 * Draws the standard APG document footer.
 */
export function drawFooter(
  doc: jsPDF,
  revision: string,
  printDate: string,
  revisionDate: string,
  pageWidth: number,
  pageHeight: number,
  documentCode: string = 'FIN - 05',
  printDateLabel: string = 'Fecha de impresión:',
  revisionDateLabel: string = 'Fecha de Rev.:'
) {
  const margin = 10;
  const footerY = pageHeight - 12;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);

  doc.text(`Rev.: ${revision.padStart(2, '0')}`, margin, footerY + 8);
  doc.text(`${printDateLabel} ${printDate}`, pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text(`${revisionDateLabel} ${revisionDate}`, pageWidth / 2, footerY + 9, { align: 'center' });
  doc.text(documentCode, pageWidth - margin, footerY + 8, { align: 'right' });
}

/**
 * Helper to split text to fit within a width.
 */
export function splitTextToLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}
