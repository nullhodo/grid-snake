import type p5 from "p5";

/**
 * Applies an Ink Bleed effect simulating organic ink edge diffusion into paper fibers.
 */
export function renderInkBleedOverlay(
  p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  bleedAmount: number,
  roughness: number,
): void {
  if (bleedAmount <= 0) return;

  targetBuffer.push();

  const tempGraphic = p5Instance.createGraphics(canvasWidth, canvasHeight);
  tempGraphic.image(targetBuffer, 0, 0);

  // Apply subtle blurred displacement pass for organic ink absorption using Native Canvas
  const ctx =
    (targetBuffer as unknown as { drawingContext?: CanvasRenderingContext2D }).drawingContext ||
    ((targetBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas?.getContext("2d") ?? null);

  const tempCanvas =
    (tempGraphic as unknown as { canvas?: HTMLCanvasElement }).canvas ||
    (tempGraphic as unknown as { elt?: HTMLCanvasElement }).elt;

  const radius = Math.max(1, bleedAmount);
  const steps = 4;

  if (ctx && tempCanvas) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = Math.min(0.85, (180 * roughness + 60) / 255);
    for (let i = 0; i < steps; i++) {
      const angle = (i * Math.PI * 2) / steps + roughness;
      const dx = Math.cos(angle) * radius * 0.6;
      const dy = Math.sin(angle) * radius * 0.6;
      ctx.drawImage(tempCanvas, dx, dy);
    }
    ctx.restore();
  } else {
    for (let i = 0; i < steps; i++) {
      const angle = (i * Math.PI * 2) / steps + roughness;
      const dx = Math.cos(angle) * radius * 0.6;
      const dy = Math.sin(angle) * radius * 0.6;
      targetBuffer.image(tempGraphic, dx, dy);
    }
  }

  tempGraphic.remove();
  targetBuffer.pop();
}
