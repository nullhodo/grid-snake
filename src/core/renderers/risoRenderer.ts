import type p5 from "p5";

/**
 * Applies a multi-layer Risograph print effect including:
 * 1. Misregistration Offset (版ズレ) between color channels / layers.
 * 2. Multiply / Darken blending simulating translucent spot inks.
 * 3. Micro stipple ink density grain (インクかすれノイズ).
 */
export function renderRisoPrintOverlay(
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  offsetPx: number,
  intensity: number,
): void {
  if (offsetPx <= 0 && intensity <= 0) return;

  targetBuffer.push();

  // Create temporary graphics layer for offset overlay
  const p = targetBuffer as unknown as p5;
  const tempGraphic = p.createGraphics(canvasWidth, canvasHeight);
  tempGraphic.image(targetBuffer, 0, 0);

  // Apply horizontal and vertical channel offset (版ズレ) using Multiply blending
  targetBuffer.blendMode(targetBuffer.MULTIPLY);
  targetBuffer.tint(255, 230); // Slightly translucent spot ink
  targetBuffer.image(tempGraphic, offsetPx, -offsetPx * 0.7);

  // Micro stipple ink density noise
  if (intensity > 0) {
    const numDots = Math.floor(canvasWidth * canvasHeight * 0.03 * intensity);
    targetBuffer.noStroke();
    targetBuffer.fill(20, 20, 20, Math.min(180, 255 * intensity * 0.6));

    for (let i = 0; i < numDots; i++) {
      const rx = Math.random() * canvasWidth;
      const ry = Math.random() * canvasHeight;
      const dotRadius = 0.5 + Math.random() * 1.5;
      targetBuffer.circle(rx, ry, dotRadius);
    }
  }

  targetBuffer.pop();
}
