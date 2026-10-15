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
