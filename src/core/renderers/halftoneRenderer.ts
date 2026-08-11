import type p5 from "p5";

/**
 * Applies a Halftone Dot Screen effect.
 * Samples source image luminance and converts color intensities into rotated dot screen patterns.
 */
export function renderHalftoneScreenOverlay(
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  dotSize: number,
  angleDeg: number,
): void {
  if (dotSize <= 1) return;

  targetBuffer.push();

  const p = targetBuffer as unknown as p5;
  const tempGraphic = p.createGraphics(canvasWidth, canvasHeight);
  tempGraphic.image(targetBuffer, 0, 0);
  tempGraphic.loadPixels();

  targetBuffer.background(255);
  targetBuffer.noStroke();
  targetBuffer.fill(20);

  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const step = Math.max(3, dotSize);
  const maxR = step * 0.75;

  const pixels = tempGraphic.pixels;
  if (!pixels || pixels.length === 0) {
    targetBuffer.pop();
    return;
  }

  const cols = Math.ceil(canvasWidth / step) + 2;
  const rows = Math.ceil(canvasHeight / step) + 2;

  for (let r = -1; r < rows; r++) {
    for (let c = -1; c < cols; c++) {
      const gx = c * step;
      const gy = r * step;

      // Rotate grid coordinate
      const cx = gx * cosA - gy * sinA + canvasWidth / 2;
      const cy = gx * sinA + gy * cosA + canvasHeight / 2;

      const px = Math.floor(Math.max(0, Math.min(canvasWidth - 1, cx)));
      const py = Math.floor(Math.max(0, Math.min(canvasHeight - 1, cy)));
      const idx = (py * canvasWidth + px) * 4;

      const red = pixels[idx] || 0;
      const green = pixels[idx + 1] || 0;
      const blue = pixels[idx + 2] || 0;

      // Calculate relative darkness (0 = white, 1 = dark)
      const brightnessNorm = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
      const darknessNorm = 1.0 - brightnessNorm;

      if (darknessNorm > 0.05) {
        const radius = maxR * Math.sqrt(darknessNorm);
        targetBuffer.circle(cx, cy, radius * 2);
      }
    }
  }

  targetBuffer.pop();
}
