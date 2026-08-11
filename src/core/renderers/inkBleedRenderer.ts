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

  // Apply subtle blurred displacement pass for organic ink absorption
  targetBuffer.blendMode(targetBuffer.MULTIPLY);
  targetBuffer.tint(255, Math.min(220, Math.floor(180 * roughness + 60)));

  const radius = Math.max(1, bleedAmount);
  const steps = 4;
  for (let i = 0; i < steps; i++) {
    const angle = (i * Math.PI * 2) / steps + roughness;
    const dx = Math.cos(angle) * radius * 0.6;
    const dy = Math.sin(angle) * radius * 0.6;
    targetBuffer.image(tempGraphic, dx, dy);
  }

  targetBuffer.pop();
}
