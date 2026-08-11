import type p5 from "p5";

/**
 * Applies a multi-layer Risograph print effect including:
 * 1. Misregistration Offset (版ズレ) between color channels / layers.
 * 2. Multiply / Darken blending simulating translucent spot inks.
 * 3. Micro stipple ink density grain (インクかすれノイズ).
 */
export function renderRisoPrintOverlay(
  _p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  offsetPx: number,
  intensity: number,
): void {
  if (offsetPx <= 0 && intensity <= 0) return;

  console.log(
    `[RisoPrintOverlay] Rendering offsetPx=${offsetPx}, intensity=${intensity}, canvasSize=${canvasWidth}x${canvasHeight}`,
  );

  targetBuffer.push();

  const srcCanvas =
    (targetBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas ||
    (targetBuffer as unknown as { elt?: HTMLCanvasElement }).elt;

  const ctx =
    (targetBuffer as unknown as { drawingContext?: CanvasRenderingContext2D }).drawingContext ||
    (srcCanvas?.getContext("2d") ?? null);

  if (ctx && srcCanvas) {
    // Native Offscreen Canvas copy for zero p5-svg DOM/Element.remove() exception risks
    const offCanvas = document.createElement("canvas");
    offCanvas.width = canvasWidth;
    offCanvas.height = canvasHeight;
    const offCtx = offCanvas.getContext("2d");
    if (offCtx) {
      offCtx.drawImage(srcCanvas, 0, 0);

      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.88;
      ctx.drawImage(offCanvas, offsetPx, -offsetPx * 0.7);
      ctx.restore();
    }
  }

  // Micro stipple ink density noise
  if (intensity > 0) {
    const numDots = Math.floor(canvasWidth * canvasHeight * 0.02 * intensity);
    targetBuffer.noStroke();
    targetBuffer.fill(20, 20, 20, Math.min(180, 255 * intensity * 0.5));

    for (let i = 0; i < numDots; i++) {
      const rx = Math.random() * canvasWidth;
      const ry = Math.random() * canvasHeight;
      const dotRadius = 0.5 + Math.random() * 1.5;
      targetBuffer.circle(rx, ry, dotRadius);
    }
  }

  targetBuffer.pop();
}
