import type p5 from "p5";

/**
 * Applies a multi-layer Risograph print effect including:
 * 1. Misregistration Offset (版ズレ) between color channels / layers.
 * 2. Multiply / Darken blending simulating translucent spot inks.
 * 3. Micro stipple ink density grain (インクかすれノイズ).
 */
export function renderRisoPrintOverlay(
  p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  offsetPx: number,
  intensity: number,
): void {
  if (offsetPx <= 0 && intensity <= 0) return;

  targetBuffer.push();

  // Create temporary graphics layer using main p5 instance
  const tempGraphic = p5Instance.createGraphics(canvasWidth, canvasHeight);
  tempGraphic.image(targetBuffer, 0, 0);

  // Apply horizontal and vertical channel offset (版ズレ) using Native Canvas Multiply blending
  const ctx =
    (targetBuffer as unknown as { drawingContext?: CanvasRenderingContext2D }).drawingContext ||
    ((targetBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas?.getContext("2d") ?? null);

  const tempCanvas =
    (tempGraphic as unknown as { canvas?: HTMLCanvasElement }).canvas ||
    (tempGraphic as unknown as { elt?: HTMLCanvasElement }).elt;

  if (ctx && tempCanvas) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.9;
    ctx.drawImage(tempCanvas, offsetPx, -offsetPx * 0.7);
    ctx.restore();
  } else {
    targetBuffer.image(tempGraphic, offsetPx, -offsetPx * 0.7);
  }

  tempGraphic.remove();

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
