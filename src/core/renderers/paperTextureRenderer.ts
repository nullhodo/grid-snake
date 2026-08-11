import type p5 from "p5";

/**
 * Applies a Procedural Paper Texture Bump & Fiber effect.
 * Generates organic paper fiber noise and subtle directional bump shading.
 */
export function renderPaperTextureOverlay(
  p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  roughness: number,
  density: number,
): void {
  if (roughness <= 0 && density <= 0) return;

  targetBuffer.push();

  const textureGraphic = p5Instance.createGraphics(canvasWidth, canvasHeight);

  textureGraphic.background(245, 242, 235); // Warm organic paper base
  textureGraphic.loadPixels();

  const pixels = textureGraphic.pixels;
  if (!pixels || pixels.length === 0) {
    targetBuffer.pop();
    return;
  }

  const numPixels = canvasWidth * canvasHeight;
  const fiberAlpha = Math.floor(Math.min(180, 255 * roughness * 0.4));
  const bumpAlpha = Math.floor(Math.min(140, 255 * density * 0.5));

  for (let i = 0; i < numPixels; i++) {
    const idx = i * 4;
    const x = i % canvasWidth;
    const y = Math.floor(i / canvasWidth);

    // Directional paper bump gradient
    const n = Math.sin(x * 0.05 + y * 0.02) * Math.cos(x * 0.02 - y * 0.05);
    const noiseVal = Math.random() * fiberAlpha + n * bumpAlpha;

    const currentR = pixels[idx];
    const currentG = pixels[idx + 1];
    const currentB = pixels[idx + 2];

    pixels[idx] = Math.max(0, currentR - noiseVal * 0.7);
    pixels[idx + 1] = Math.max(0, currentG - noiseVal * 0.7);
    pixels[idx + 2] = Math.max(0, currentB - noiseVal * 0.6);
  }

  textureGraphic.updatePixels();

  // Blend warm paper fibers using MULTIPLY / OVERLAY
  targetBuffer.blendMode(targetBuffer.MULTIPLY);
  targetBuffer.tint(255, Math.min(240, 180 + Math.floor(density * 75)));
  targetBuffer.image(textureGraphic, 0, 0);

  targetBuffer.pop();
}
