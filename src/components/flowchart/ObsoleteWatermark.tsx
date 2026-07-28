// ─────────────────────────────────────────────────────────────
//  ObsoleteWatermark — SVG diagonal "OBSOLETO" / "OBSOLETE"
//  overlay for archived documents. Renders on the viewer AND
//  can be called programmatically for PDF export injection.
//  Low opacity so diagram content remains readable.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useTranslation } from 'react-i18next';

interface ObsoleteWatermarkProps {
  /** 0–1 opacity value. Default: 0.10 for on-screen, 0.07 for PDF */
  opacity?: number;
  /** Override text (e.g. for language-specific PDF export) */
  text?: string;
  /** Whether to fill the entire parent element (position: absolute) */
  fill?: boolean;
}

/**
 * SVG watermark that tiles the word "OBSOLETO" diagonally.
 * Uses a <defs><pattern> approach for infinite coverage.
 *
 * For PDF integration, call `renderWatermarkToCanvas(canvas, lang)` instead.
 */
export const ObsoleteWatermark: React.FC<ObsoleteWatermarkProps> = ({
  opacity = 0.10,
  text,
  fill = true,
}) => {
  const { t } = useTranslation();
  const label = text ?? t('archive.watermark.text', 'OBSOLETO');

  return (
    <div
      className={`${fill ? 'absolute inset-0' : 'w-full h-full'} pointer-events-none select-none overflow-hidden z-20`}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ opacity }}
      >
        <defs>
          <pattern
            id="watermark-pattern"
            x="0"
            y="0"
            width="260"
            height="120"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-40)"
          >
            <text
              x="10"
              y="70"
              fontFamily="'Inter', 'Arial', sans-serif"
              fontSize="38"
              fontWeight="900"
              letterSpacing="6"
              fill="#f59e0b"
              textAnchor="start"
            >
              {label}
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#watermark-pattern)" />
      </svg>
    </div>
  );
};

/**
 * Utility for PDF export: draws the watermark on a canvas 2D context.
 * Call this AFTER rendering the diagram to the canvas with jsPDF.
 *
 * @example
 *   const canvas = document.createElement('canvas');
 *   // ... render diagram ...
 *   renderWatermarkToCanvas(canvas, 'es');
 *   const pdf = new jsPDF(); pdf.addImage(canvas.toDataURL(), ...);
 */
export function renderWatermarkToCanvas(
  canvas: HTMLCanvasElement,
  lang: string = 'es',
  opacity: number = 0.07
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const label = lang === 'es' ? 'OBSOLETO' : 'OBSOLETE';
  const { width, height } = canvas;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#f59e0b';
  ctx.font = `900 48px 'Arial', sans-serif`;
  ctx.letterSpacing = '4px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Tile diagonally
  const tileW = 280;
  const tileH = 140;
  for (let y = -tileH; y < height + tileH; y += tileH) {
    for (let x = -tileW; x < width + tileW; x += tileW) {
      ctx.save();
      ctx.translate(x + tileW / 2, y + tileH / 2);
      ctx.rotate(-40 * (Math.PI / 180));
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
  }

  ctx.restore();
}
