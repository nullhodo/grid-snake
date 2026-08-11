import type p5 from "p5";

/**
 * Applies an Ink Bleed effect simulating organic ink edge diffusion into paper fibers.
 */
export function renderInkBleedOverlay(
  _p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  bleedAmount: number,
  roughness: number,
): void {
  if (bleedAmount <= 0) return;

  console.log(
    `[InkBleedOverlay] Rendering bleedAmount=${bleedAmount}, roughness=${roughness}, canvasSize=${canvasWidth}x${canvasHeight}`,
  );

  targetBuffer.push();

  const srcCanvas =
    (targetBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas ||
    (targetBuffer as unknown as { elt?: HTMLCanvasElement }).elt;

  const ctx =
    (targetBuffer as unknown as { drawingContext?: CanvasRenderingContext2D }).drawingContext ||
    (srcCanvas?.getContext("2d") ?? null);

  if (ctx && srcCanvas) {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = canvasWidth;
    offCanvas.height = canvasHeight;
    const offCtx = offCanvas.getContext("2d");

    if (offCtx) {
      offCtx.drawImage(srcCanvas, 0, 0);

      const radius = Math.max(1, bleedAmount);
      const steps = 4;

      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = Math.min(0.85, (180 * roughness + 60) / 255);
      for (let i = 0; i < steps; i++) {
        const angle = (i * Math.PI * 2) / steps + roughness;
        const dx = Math.cos(angle) * radius * 0.6;
        const dy = Math.sin(angle) * radius * 0.6;
        ctx.drawImage(offCanvas, dx, dy);
      }
      ctx.restore();
    }
  }

  targetBuffer.pop();
}
