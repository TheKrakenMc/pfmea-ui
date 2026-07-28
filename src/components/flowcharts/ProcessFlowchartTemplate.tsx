// ─────────────────────────────────────────────────────────────
//  ProcessFlowchartTemplate — A4 PDF Maquetation Component
//  Renders the FIN-05 "Diagrama de Proceso de Flujo" layout
//  matching the Adler Pelzer Group corporate standard.
//
//  This component is mounted OFF-SCREEN in a temporary container
//  and captured by html2pdf.js. All styling is inline CSS to
//  guarantee fidelity independent of Tailwind or external sheets.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import type { FlowchartPdfData, FlowchartPdfRow } from '../../types/flowchartExport.types';
import type { SymbolType } from '../../types/flowchart.types';
import { ProcessSymbol } from './ProcessSymbols';

// ─── Style Constants ─────────────────────────────────────────

const FONT_FAMILY = 'Arial, Helvetica, sans-serif';
const BORDER = '1px solid #000';
const HEADER_BG = '#1a3a5c';
const HEADER_TEXT = '#ffffff';
const COLUMN_HEADER_BG = '#2c5f8a';
const LIGHT_BG = '#f5f5f5';

// ─── Inline Style Helpers ────────────────────────────────────

const pageStyle: React.CSSProperties = {
  width: '210mm',
  margin: '0 auto',
  padding: '6mm 8mm',
  fontFamily: FONT_FAMILY,
  fontSize: '8px',
  color: '#000',
  backgroundColor: '#fff',
  boxSizing: 'border-box',
  position: 'relative',
};

const outerBorder: React.CSSProperties = {
  border: '2px solid #000',
  width: '100%',
  boxSizing: 'border-box',
};

const headerRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: HEADER_BG,
  color: HEADER_TEXT,
  padding: '4px 10px',
  borderBottom: BORDER,
  minHeight: '38px',
};

const metaCell: React.CSSProperties = {
  border: BORDER,
  padding: '3px 6px',
  fontSize: '7.5px',
  verticalAlign: 'middle',
};

const metaLabel: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '7px',
  color: '#333',
};

const colHeaderCell: React.CSSProperties = {
  border: BORDER,
  padding: '5px 2px',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '7.5px',
  backgroundColor: COLUMN_HEADER_BG,
  color: HEADER_TEXT,
  verticalAlign: 'middle',
};

const dataCell: React.CSSProperties = {
  border: BORDER,
  padding: '5px 4px',
  fontSize: '8px',
  verticalAlign: 'middle',
  textAlign: 'center',
  pageBreakInside: 'avoid' as const,
};

const dataCellLeft: React.CSSProperties = {
  ...dataCell,
  textAlign: 'left',
};

const symbolCell: React.CSSProperties = {
  ...dataCell,
  width: '28px',
  minWidth: '28px',
  maxWidth: '28px',
  padding: '1px',
};

// ─── Symbol Renderer Helper ─────────────────────────────────

const RenderSymbol: React.FC<{ type: SymbolType | null }> = ({ type }) => {
  if (!type) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ProcessSymbol symbolType={type} size={16} />
    </div>
  );
};

// ─── Summary Symbol Icon (for the summary table) ────────────

const SummarySymbolIcon: React.FC<{ type: SymbolType; label: string }> = ({ type, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    <ProcessSymbol symbolType={type} size={14} />
    <span style={{ fontSize: '7px' }}>{label}</span>
  </div>
);

// ─── Main Template Component ─────────────────────────────────

interface ProcessFlowchartTemplateProps {
  data: FlowchartPdfData;
}

export const ProcessFlowchartTemplate: React.FC<ProcessFlowchartTemplateProps> = ({ data }) => {
  const { header, rows, summary, signatures, footerRevision, printDate, revisionDate } = data;

  return (
    <div id="flowchart-pdf-container" style={pageStyle}>
      <div style={outerBorder}>
        {/* ═══════════════════════════════════════════════════
            HEADER — Corporate Banner
            ═══════════════════════════════════════════════════ */}
        <div style={headerRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              Adler Pelzer Group
            </span>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}>
              DIAGRAMA DE PROCESO DE FLUJO
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Audi rings placeholder — 4 interlocking circles */}
            <svg width="40" height="16" viewBox="0 0 80 30" fill="none" style={{ opacity: 0.9 }}>
              <circle cx="14" cy="15" r="10" stroke="#fff" strokeWidth="2" fill="none" />
              <circle cx="30" cy="15" r="10" stroke="#fff" strokeWidth="2" fill="none" />
              <circle cx="46" cy="15" r="10" stroke="#fff" strokeWidth="2" fill="none" />
              <circle cx="62" cy="15" r="10" stroke="#fff" strokeWidth="2" fill="none" />
            </svg>
            <span style={{ fontSize: '8px', color: HEADER_TEXT }}>Audi</span>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: HEADER_TEXT,
                marginLeft: '6px',
                lineHeight: 1,
              }}
            >
              D
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            METADATA ROWS
            ═══════════════════════════════════════════════════ */}
        <table
          style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}
          cellPadding={0}
          cellSpacing={0}
        >
          <tbody>
            {/* Row 1: Número de parte | Cliente */}
            <tr>
              <td style={{ ...metaCell, width: '14%' }}>
                <span style={metaLabel}>Número de parte:</span>
              </td>
              <td style={{ ...metaCell, width: '36%' }}>{header.partNumber}</td>
              <td style={{ ...metaCell, width: '10%' }}>
                <span style={metaLabel}>Cliente:</span>
              </td>
              <td style={{ ...metaCell, width: '20%' }}>{header.customer}</td>
              <td
                style={{
                  ...metaCell,
                  width: '20%',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '9px',
                  rowSpan: 3,
                }}
                rowSpan={3}
              >
                {header.documentNumber}
              </td>
            </tr>
            {/* Row 2: Descripción | Fecha */}
            <tr>
              <td style={metaCell}>
                <span style={metaLabel}>Descripción:</span>
              </td>
              <td style={metaCell}>{header.description}</td>
              <td style={metaCell}>
                <span style={metaLabel}>Fecha:</span>
              </td>
              <td style={metaCell}>{header.date}</td>
            </tr>
            {/* Row 3: Nivel de Ingeniería | Revisión */}
            <tr>
              <td style={metaCell}>
                <span style={metaLabel}>Nivel de Ingeniería:</span>
              </td>
              <td style={metaCell}>{header.engineeringLevel}</td>
              <td style={metaCell}>
                <span style={metaLabel}>Revisión:</span>
              </td>
              <td style={metaCell}>{header.revision}</td>
            </tr>
          </tbody>
        </table>

        {/* ═══════════════════════════════════════════════════
            PROCESS TABLE
            ═══════════════════════════════════════════════════ */}
        <table
          style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}
          cellPadding={0}
          cellSpacing={0}
        >
          <thead>
            <tr>
              <th style={{ ...colHeaderCell, width: '30px' }}>No.</th>
              <th style={{ ...colHeaderCell, width: '100px' }}>Descripción</th>
              <th style={{ ...colHeaderCell, width: '85px' }}>Ubicaciones</th>
              <th style={{ ...colHeaderCell, width: '26px' }}>HIC</th>
              <th style={{ ...colHeaderCell, width: '28px' }}>Calidad</th>
              <th style={{ ...colHeaderCell, width: '28px' }}>Producción</th>
              <th style={{ ...colHeaderCell, width: '28px' }}>Logística</th>
              <th style={{ ...colHeaderCell, width: '28px' }}>Materiales</th>
              <th style={{ ...colHeaderCell, width: '28px' }}>Otros</th>
              <th style={{ ...colHeaderCell, width: '36px' }}>Norma</th>
              <th style={{ ...colHeaderCell, minWidth: '100px' }}>Maquinaria</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: FlowchartPdfRow, idx: number) => (
              <tr
                key={idx}
                style={{
                  pageBreakInside: 'avoid' as const,
                  backgroundColor: idx % 2 === 0 ? '#fff' : LIGHT_BG,
                }}
              >
                <td style={{ ...dataCell, fontWeight: 'bold', fontSize: '8px' }}>{row.stepNumber}</td>
                <td style={{ ...dataCellLeft, fontSize: '8px' }}>{row.description}</td>
                <td style={{ ...dataCellLeft, fontSize: '8px' }}>{row.location}</td>
                <td style={dataCell}>
                  {row.hic && (
                    <span
                      style={{
                        color: '#c00',
                        fontWeight: 'bold',
                        fontSize: '10px',
                        fontStyle: 'italic',
                      }}
                    >
                      @
                    </span>
                  )}
                </td>
                <td style={symbolCell}>
                  <RenderSymbol type={row.symbols.calidad} />
                </td>
                <td style={symbolCell}>
                  <RenderSymbol type={row.symbols.produccion} />
                </td>
                <td style={symbolCell}>
                  <RenderSymbol type={row.symbols.logistica} />
                </td>
                <td style={symbolCell}>
                  <RenderSymbol type={row.symbols.materiales} />
                </td>
                <td style={symbolCell}>
                  <RenderSymbol type={row.symbols.otros} />
                </td>
                <td style={{ ...dataCell, fontSize: '7px' }}>{row.norma}</td>
                <td style={{ ...dataCellLeft, fontSize: '7px' }}>{row.maquinaria}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ═══════════════════════════════════════════════════
            BOTTOM SECTION — Summary + Notes + Signatures
            ═══════════════════════════════════════════════════ */}
        <div
          style={{
            display: 'flex',
            borderTop: BORDER,
            pageBreakInside: 'avoid' as const,
          }}
        >
          {/* ─── Summary Table (Left) ────────────────────── */}
          <div style={{ width: '30%', borderRight: BORDER }}>
            <table
              style={{ width: '100%', borderCollapse: 'collapse' }}
              cellPadding={0}
              cellSpacing={0}
            >
              <thead>
                <tr>
                  <th
                    colSpan={3}
                    style={{
                      ...metaCell,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '7px',
                      backgroundColor: LIGHT_BG,
                    }}
                  >
                    Resumen de Flujo de Proceso
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...metaCell, width: '20px' }}>
                    <ProcessSymbol symbolType="storage" size={12} />
                  </td>
                  <td style={{ ...metaCell, fontSize: '6.5px' }}>Almacenamiento</td>
                  <td style={{ ...metaCell, textAlign: 'center', fontWeight: 'bold' }}>
                    {summary.almacenamiento}
                  </td>
                </tr>
                <tr>
                  <td style={metaCell}>
                    <ProcessSymbol symbolType="auto_control" size={12} />
                  </td>
                  <td style={{ ...metaCell, fontSize: '6.5px' }}>Auto Control</td>
                  <td style={{ ...metaCell, textAlign: 'center', fontWeight: 'bold' }}>
                    {summary.autoControl}
                  </td>
                </tr>
                <tr>
                  <td style={metaCell}>
                    <ProcessSymbol symbolType="delay" size={12} />
                  </td>
                  <td style={{ ...metaCell, fontSize: '6.5px' }}>Demora</td>
                  <td style={{ ...metaCell, textAlign: 'center', fontWeight: 'bold' }}>
                    {summary.demora}
                  </td>
                </tr>
                <tr>
                  <td style={metaCell}>
                    <ProcessSymbol symbolType="inspection" size={12} />
                  </td>
                  <td style={{ ...metaCell, fontSize: '6.5px' }}>Inspección</td>
                  <td style={{ ...metaCell, textAlign: 'center', fontWeight: 'bold' }}>
                    {summary.inspeccion}
                  </td>
                </tr>
                <tr>
                  <td style={metaCell}>
                    <ProcessSymbol symbolType="operation" size={12} />
                  </td>
                  <td style={{ ...metaCell, fontSize: '6.5px' }}>Operación</td>
                  <td style={{ ...metaCell, textAlign: 'center', fontWeight: 'bold' }}>
                    {summary.operacion}
                  </td>
                </tr>
                <tr>
                  <td style={metaCell}>
                    <ProcessSymbol symbolType="pokayoke" size={12} />
                  </td>
                  <td style={{ ...metaCell, fontSize: '6.5px' }}>Pokayoke</td>
                  <td style={{ ...metaCell, textAlign: 'center', fontWeight: 'bold' }}>
                    {summary.pokayoke}
                  </td>
                </tr>
                <tr>
                  <td style={metaCell}>
                    <ProcessSymbol symbolType="transport" size={12} />
                  </td>
                  <td style={{ ...metaCell, fontSize: '6.5px' }}>Transporte</td>
                  <td style={{ ...metaCell, textAlign: 'center', fontWeight: 'bold' }}>
                    {summary.transporte}
                  </td>
                </tr>
                <tr style={{ backgroundColor: LIGHT_BG }}>
                  <td style={metaCell} />
                  <td
                    style={{
                      ...metaCell,
                      fontWeight: 'bold',
                      fontSize: '7px',
                      textAlign: 'right',
                    }}
                  >
                    TOTAL
                  </td>
                  <td
                    style={{
                      ...metaCell,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '8px',
                    }}
                  >
                    {summary.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ─── Notes + Signatures (Right) ──────────────── */}
          <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
            {/* Deviation Note */}
            <div
              style={{
                padding: '6px 10px',
                borderBottom: BORDER,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minHeight: '40px',
              }}
            >
              {/* Quality seal SVG */}
              <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#2c5f8a" strokeWidth="2" fill="#e8f0fe" />
                <path
                  d="M12 21l5 5 11-11"
                  stroke="#2c5f8a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div style={{ fontSize: '6.5px', lineHeight: 1.4 }}>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#c00' }}>Nota:</strong>{' '}
                  <em>
                    Si existe una desviación al flujo de proceso deberá solicitar desviación al
                    departamento de ingeniería, para su aprobación y/o evaluación.
                  </em>
                </p>
                <p style={{ margin: '3px 0 0 0' }}>
                  <strong>Nota:</strong>{' '}
                  <em>Para utilizar simbología especial, ver procedimiento PAC-06</em>
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div
              style={{
                display: 'flex',
                borderTop: 'none',
                pageBreakInside: 'avoid' as const,
              }}
            >
              {signatures.map((sig, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    borderRight: idx < signatures.length - 1 ? BORDER : 'none',
                    padding: '6px 8px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '7px',
                      marginBottom: '14px',
                      borderBottom: '1px solid #999',
                      paddingBottom: '2px',
                    }}
                  >
                    {sig.role}
                  </div>
                  <div style={{ fontSize: '7px', fontWeight: 'bold' }}>{sig.name}</div>
                  <div style={{ fontSize: '6px', color: '#555', marginTop: '1px' }}>
                    {sig.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            FOOTER
            ═══════════════════════════════════════════════════ */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 10px',
            borderTop: BORDER,
            fontSize: '6.5px',
            color: '#555',
          }}
        >
          <span>{footerRevision}</span>
          <span>
            Fecha de impresión: {printDate}
            {'    '}
            Fecha de Rev.: {revisionDate}
          </span>
          <span style={{ fontWeight: 'bold' }}>FIN - 05</span>
        </div>
      </div>
    </div>
  );
};
