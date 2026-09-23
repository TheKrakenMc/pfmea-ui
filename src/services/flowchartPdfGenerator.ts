// ─────────────────────────────────────────────────────────────
//  Flowchart PDF Generator
//  Generates the FIN-05 process flow diagram using jsPDF + AutoTable
//
//  Layout contract (A4 portrait = 210 × 297 mm):
//  ┌────────────────────────────── 297 mm ──────────────────────┐
//  │  Header block  (drawHeader)           ≈ 10 → ~42 mm        │
//  │  ─────────────────────────────────────────────────────────  │
//  │  autoTable content area               margin.top  = 45 mm  │
//  │                                       margin.bottom= 88 mm  │
//  │  ─────────────────────────────────────────────────────────  │
//  │  Summary + Seal + Notes + Signatures  ~209 → ~285 mm       │
//  │  Footer bar                           ~285 → 297 mm        │
//  └────────────────────────────────────────────────────────────┘
//
//  The bottom block (summary … footer) is drawn by drawPageLayout()
//  which is called automatically on every page via the didDrawPage hook.
// ─────────────────────────────────────────────────────────────

import jsPDF from 'jspdf';
import { createDocument, drawHeader, COLORS } from './jspdfService';
import { ImageRegistry } from './imageRegistry';
import type { FlowchartPdfData, FlowchartPdfRow } from '../types/flowchartExport.types';
import type { SymbolType } from '../types/flowchart.types';

// ─── Layout constants (mm, A4 portrait 210 × 297) ────────────

/** Top of the bottom static block (summary / seal / notes / signatures) */
const BOTTOM_BLOCK_Y = 209;

/**
 * Height of the bottom block including the footer bar.
 * 297 - 209 = 88 mm total → leaves a 88 mm "safe" margin at the bottom
 * so autoTable never prints rows inside this block.
 */
const BOTTOM_BLOCK_HEIGHT = 88; // mm (297 - 209)

/** Vertical position where the signatures box begins (relative to page top) */
const SIGNATURES_Y = BOTTOM_BLOCK_Y + 22;

/** autoTable margin.top – must be BELOW the drawHeader output (~42 mm + 3 gap) */
const TABLE_MARGIN_TOP = 45;

/** autoTable margin.bottom – must be ABOVE the bottom block */
const TABLE_MARGIN_BOTTOM = BOTTOM_BLOCK_HEIGHT + 2; // 90 mm

// ─── Context passed to the per-page layout helper ────────────

interface PageLayoutContext {
  data: FlowchartPdfData;
  docNumber: string;
  t: (key: string) => string;
  pageWidth: number;
  pageHeight: number;
}

// ─────────────────────────────────────────────────────────────
//  drawPageLayout
//  Draws the static bottom block (summary, seal, notes,
//  signatures) and the footer bar on the current page.
//  Called inside the autoTable `didDrawPage` hook AND after
//  the first-page header is rendered.
// ─────────────────────────────────────────────────────────────
function drawPageLayout(doc: jsPDF, ctx: PageLayoutContext): void {
  const { data, docNumber, t, pageWidth, pageHeight } = ctx;
  const margin = 10;
  const bottomAreaY = BOTTOM_BLOCK_Y;

  // ── Summary Table (Left) ──────────────────────────────────
  const summaryWidth = 60;
  const summaryData: any[][] = [
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
    head: [
      [{ content: t('export.flowchart.summary.title') || 'Resumen de Flujo de Proceso', colSpan: 3, styles: { halign: 'center' } }],
    ],
    body: summaryData,
    foot: [
      [
        { content: t('export.flowchart.summary.total') || 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } },
        { content: data.summary.total.toString(), styles: { fontStyle: 'bold', halign: 'center' } },
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 8, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
    headStyles: { fillColor: [255, 255, 255] },
    footStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { halign: 'center' },
      2: { halign: 'center', cellWidth: 10 },
    },
    didDrawCell: (hook: any) => {
      if (hook.section === 'body' && hook.column.index === 0) {
        const rowKeys: SymbolType[] = [
          'storage', 'auto_control', 'delay',
          'inspection', 'operation', 'pokayoke', 'transport',
        ];
        const sym = rowKeys[hook.row.index];
        const base64Img = ImageRegistry.symbols[sym];
        if (base64Img) {
          const dim = 7.5;
          const x = hook.cell.x + (hook.cell.width - dim) / 2;
          const y = hook.cell.y + (hook.cell.height - dim) / 2;
          doc.addImage(base64Img, 'PNG', x, y, dim, dim);
        }
      }
    },
  });

  // ── Quality Seal ─────────────────────────────────────────
  const sealRadius = 7.5;
  const sealX = 90 + sealRadius;
  const sealY = bottomAreaY + sealRadius;

  doc.setFillColor(150, 180, 255);
  doc.setDrawColor(0, 51, 153);
  doc.circle(sealX, sealY, sealRadius, 'DF');
  doc.setTextColor(0, 51, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.text('100%', sealX, sealY - 1, { align: 'center', angle: -25 });
  doc.text(t('export.flowchart.seal.quality') || 'Calidad', sealX, sealY + 3, { align: 'center', angle: -25 });

  // ── Notes ────────────────────────────────────────────────
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bolditalic');
  doc.text(
    t('export.flowchart.notes.deviationLine1') ||
      'Nota: Si existe una desviación al flujo de proceso deberá solicitar',
    155, bottomAreaY + 4, { align: 'center' },
  );
  doc.line(115, bottomAreaY + 5, 195, bottomAreaY + 5);
  doc.text(
    t('export.flowchart.notes.deviationLine2') ||
      'desviación al departamento de ingeniería, para su aprobación y/o evaluación.',
    155, bottomAreaY + 9, { align: 'center' },
  );
  doc.line(115, bottomAreaY + 10, 195, bottomAreaY + 10);

  doc.setFont('helvetica', 'italic');
  doc.text(
    t('export.flowchart.notes.symbology') || 'Nota: Para utilizar simbología especial, ver procedimiento PAC-06',
    142, bottomAreaY + 18, { align: 'center' },
  );

  // ── Signatures ───────────────────────────────────────────
  const sigY = SIGNATURES_Y;
  const sigTotalW = 108;
  const sigStartX = 88;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(sigStartX, sigY, sigTotalW, 25);
  doc.line(sigStartX + 36, sigY, sigStartX + 36, sigY + 25);
  doc.line(sigStartX + 72, sigY, sigStartX + 72, sigY + 25);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');

  const processEngineerText = t('export.flowchart.roles.processEngineer') || 'Ingeniero de procesos';
  const engineeringCoordText = t('export.flowchart.roles.engineeringCoord') || 'Coordinador de Ingeniería';

  const elaboroName = data.signatures[0]?.name || processEngineerText;
  const aproboName = data.signatures[1]?.name || engineeringCoordText;
  const revisoName = data.signatures[2]?.name || engineeringCoordText;

  // Column headers
  doc.text(t('export.flowchart.signatures.prepared') || 'Elaboró', sigStartX + 18, sigY + 5, { align: 'center' });
  doc.text(t('export.flowchart.signatures.approved') || 'Aprobó', sigStartX + 54, sigY + 5, { align: 'center' });
  doc.text(t('export.flowchart.signatures.reviewed') || 'Revisó', sigStartX + 90, sigY + 5, { align: 'center' });

  // Signature names + roles
  doc.setFont('helvetica', 'normal');
  doc.text(elaboroName, sigStartX + 18, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(processEngineerText, sigStartX + 18, sigY + 21, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text(aproboName, sigStartX + 54, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(engineeringCoordText, sigStartX + 54, sigY + 21, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text(revisoName, sigStartX + 90, sigY + 18, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(engineeringCoordText, sigStartX + 90, sigY + 21, { align: 'center' });

  // Footer is drawn exclusively in the post-processing loop
  // (after autoTable finishes) so the total page count is known
  // and the text is stamped only once per page.
}

// ─────────────────────────────────────────────────────────────
//  generateFlowchartPdf  — public entry point
// ─────────────────────────────────────────────────────────────
export async function generateFlowchartPdf(
  data: FlowchartPdfData,
  t: (key: string) => string,
): Promise<Blob> {
  const doc = createDocument({ orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 10;

  // ── Clean / format metadata ──────────────────────────────
  const extractNP = (str: string) => {
    const match = str.match(/["']([^"']+)["']/);
    return match ? match[1] : str.replace(/\*\s*VER PORTADA\s*/g, '').replace(/\*/g, '').trim();
  };
  const cleanPartNumber = extractNP(data.header.partNumber);

  // Use the Cover Code / Doc ID exactly as entered in the UI header form.
  // data.header.documentNumber is populated by buildPdfData() with header.coverPage
  // (see ExportFlowchartButton.tsx → buildPdfData → pdfHeader.documentNumber).
  const docNumber = data.header.documentNumber.trim();

  // ── Shared context object for the per-page layout ────────
  const ctx: PageLayoutContext = { data, docNumber, t, pageWidth, pageHeight };

  // ── Page 1: draw header ──────────────────────────────────
  const headerEndY = drawHeader(
    doc,
    t('export.flowchart.title') || 'DIAGRAMA DE PROCESO DE FLUJO',
    docNumber,
    pageWidth,
    {
      partNumber: cleanPartNumber,
      description: data.header.description || '',
      engineeringLevel: data.header.revision,
      customer: data.header.customer,
      safetyCharacteristic: data.header.safetyCharacteristic,
      date: data.printDate,
      revision: data.header.revision,
    },
    10,    // startY
    false, // skipGrid
    {
      partNumber: t('export.flowchart.header.partNumber') || 'Número de parte',
      customer: t('export.flowchart.header.customer') || 'Cliente',
      description: t('export.flowchart.header.description') || 'Descripción',
      date: t('export.flowchart.header.date') || 'Fecha',
      engineeringLevel: t('export.flowchart.header.engineeringLevel') || 'Nivel de Ingeniería',
      revision: t('export.flowchart.header.revision') || 'Revisión',
    },
  );

  // Draw the bottom block on page 1 immediately after the header
  // (so it exists before autoTable starts filling in rows).
  drawPageLayout(doc, ctx);

  // ── Column header labels ─────────────────────────────────
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
    t('export.flowchart.columns.machinery') || 'Maquinaria',
  ];

  // ── Map rows to table data ───────────────────────────────
  const tableData: string[][] = data.rows.map((row: FlowchartPdfRow) => [
    row.stepNumber.toString(),
    row.description,
    row.location,
    row.hic === '▽' ? '' : (row.hic || ''),
    '', // Calidad  — image injected via didDrawCell
    '', // Produccion
    '', // Logistica
    '', // Materiales
    '', // Otros
    row.norma,
    row.maquinaria,
  ]);

  // ── Main process-flow autoTable ──────────────────────────
  (doc as any).autoTable({
    startY: headerEndY,

    /**
     * margin.top  – ensures that on every NEW page a drawHeader is
     *               called first, then the table content starts below it.
     * margin.bottom – the usable table zone ends 90 mm above the page
     *               bottom, keeping rows entirely above the bottom block.
     */
    margin: {
      top: TABLE_MARGIN_TOP,
      bottom: TABLE_MARGIN_BOTTOM,
      left: margin,
      right: margin,
    },

    tableWidth: pageWidth - margin * 2,

    head: [tableHeaders],
    body: tableData,

    /** Repeat the column header row at the top of every new page. */
    showHead: 'everyPage',

    /** Let jspdf-autotable handle page breaks automatically. */
    pageBreak: 'auto',

    theme: 'grid',
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
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9, fillColor: [240, 240, 240] },
      1: { halign: 'center' },             // Description – flexible width
      2: { halign: 'center', cellWidth: 19 },
      3: { halign: 'center', textColor: [255, 0, 0], fontStyle: 'bold', cellWidth: 10 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 17 },
      7: { halign: 'center', cellWidth: 18 },
      8: { halign: 'center', cellWidth: 14 },
      9: { halign: 'center', cellWidth: 17, fillColor: [240, 240, 240] },
      10: { halign: 'center', cellWidth: 25, fillColor: [240, 240, 240] },
    },

    /**
     * didDrawPage — fires each time autoTable starts a new page
     * (including subsequent pages 2, 3, …).
     * We draw the full-page layout (header + bottom block) here so
     * that every page receives the same static template.
     */
    didDrawPage: (hookData: any) => {
      const pageNumber: number = hookData.pageNumber ?? doc.getCurrentPageInfo().pageNumber;

      // On page 2+ the document header must be redrawn so that the
      // table's margin.top space is visually occupied.
      if (pageNumber > 1) {
        drawHeader(
          doc,
          t('export.flowchart.title') || 'DIAGRAMA DE PROCESO DE FLUJO',
          docNumber,
          pageWidth,
          {
            partNumber: cleanPartNumber,
            description: data.header.description || '',
            engineeringLevel: data.header.revision,
            customer: data.header.customer,
            safetyCharacteristic: data.header.safetyCharacteristic,
            date: data.printDate,
            revision: data.header.revision,
          },
          10,   // startY
          false,
          {
            partNumber: t('export.flowchart.header.partNumber') || 'Número de parte',
            customer: t('export.flowchart.header.customer') || 'Cliente',
            description: t('export.flowchart.header.description') || 'Descripción',
            date: t('export.flowchart.header.date') || 'Fecha',
            engineeringLevel: t('export.flowchart.header.engineeringLevel') || 'Nivel de Ingeniería',
            revision: t('export.flowchart.header.revision') || 'Revisión',
          },
        );
      }

      // Always draw the bottom block (summary, seal, notes, sigs, footer).
      drawPageLayout(doc, ctx);
    },

    /** Inject symbols and the ▽ HIC triangle into body cells. */
    didDrawCell: (hook: any) => {
      // Symbol images (columns 4–8)
      if (hook.section === 'body' && hook.column.index >= 4 && hook.column.index <= 8) {
        const row = data.rows[hook.row.index];
        if (!row) return;

        const colMap: Record<number, SymbolType | null> = {
          4: row.symbols.calidad,
          5: row.symbols.produccion,
          6: row.symbols.logistica,
          7: row.symbols.materiales,
          8: row.symbols.otros,
        };

        const symbolType = colMap[hook.column.index];
        if (symbolType) {
          const base64Img = ImageRegistry.symbols[symbolType];
          if (base64Img) {
            const dim = 7.5;
            const x = hook.cell.x + (hook.cell.width - dim) / 2;
            const y = hook.cell.y + (hook.cell.height - dim) / 2;
            doc.addImage(base64Img, 'PNG', x, y, dim, dim);
          }
        }
      }

      // HIC column ▽ triangle (column 3)
      if (hook.section === 'body' && hook.column.index === 3) {
        const row = data.rows[hook.row.index];
        if (row?.hic === '▽') {
          const size = 2.5;
          const topY = hook.cell.y + hook.cell.height / 2 - 1.5;
          const bottomY = hook.cell.y + hook.cell.height / 2 + 2;
          const centerX = hook.cell.x + hook.cell.width / 2;

          doc.setDrawColor(200, 0, 0);
          doc.setLineWidth(0.3);
          doc.triangle(centerX - size, topY, centerX + size, topY, centerX, bottomY, 'S');

          doc.setTextColor(200, 0, 0);
          doc.setFontSize(5.5);
          doc.setFont('helvetica', 'bold');
          doc.text('R', centerX, topY + 1.2, { align: 'center', baseline: 'middle' });
        }
      }
    },
  });

  // ── Post-processing: inject pagination & watermark ───────
  const totalPages = (doc as any).internal.getNumberOfPages() as number;
  const nowLabel = t('export.flowchart.footer.printDate') || 'Fecha de impresión:';
  const revDateLabel = t('export.flowchart.footer.revDate') || 'Fecha de Rev.:';
  const revLabel = t('export.flowchart.footer.rev') || 'Rev.:';

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // ── ARCHIVED watermark ───────────────────────────────
    if (data.isArchived) {
      doc.saveGraphicsState();
      try {
        doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
      } catch {
        // Fallback when GState is unavailable
        doc.setTextColor(253, 230, 138);
      }
      doc.setTextColor(245, 158, 11);
      doc.setFontSize(60);
      doc.setFont('helvetica', 'bold');
      doc.text(
        t('archive.status.archived') || 'ARCHIVADO',
        pageWidth / 2,
        pageHeight / 2,
        { align: 'center', angle: 45 },
      );
      doc.restoreGraphicsState();
    }

    // ── Page X of Y ──────────────────────────────────────
    // Re-draw the footer to stamp the correct page number.
    // We place "Página X / Y" in the center of the footer area.
    const footerY = pageHeight - 12;
    const pageLabel =
      `${t('export.flowchart.footer.page') || 'Página'} ${i} / ${totalPages}`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);

    // Left: Rev.
    doc.text(`${revLabel} ${data.header.revision.padStart(2, '0')}`, margin, footerY + 8);

    // Center (two lines): print date / rev date
    doc.text(`${nowLabel} ${data.printDate}`, pageWidth / 2, footerY + 3, { align: 'center' });
    doc.text(`${revDateLabel} ${data.revisionDate}`, pageWidth / 2, footerY + 7, { align: 'center' });

    // Center bottom: page counter
    doc.text(pageLabel, pageWidth / 2, footerY + 11, { align: 'center' });

    // Right: document code
    doc.text('FIN - 05', pageWidth - margin, footerY + 8, { align: 'right' });
  }

  return doc.output('blob');
}
