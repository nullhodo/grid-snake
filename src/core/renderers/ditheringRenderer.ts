import type p5 from "p5";

// Standard 8x8 Bayer Dithering Matrix (normalized to 0..1)
const BAYER_MATRIX_8X8: number[][] = [
  [0 / 64, 32 / 64, 8 / 64, 40 / 64, 2 / 64, 34 / 64, 10 / 64, 42 / 64],
  [48 / 64, 16 / 64, 56 / 64, 24 / 64, 50 / 64, 18 / 64, 58 / 64, 26 / 64],
  [12 / 64, 44 / 64, 4 / 64, 36 / 64, 14 / 64, 46 / 64, 6 / 64, 38 / 64],
  [60 / 64, 28 / 64, 52 / 64, 20 / 64, 62 / 64, 30 / 64, 54 / 64, 22 / 64],
  [3 / 64, 35 / 64, 11 / 64, 43 / 64, 1 / 64, 33 / 64, 9 / 64, 41 / 64],
  [51 / 64, 19 / 64, 59 / 64, 27 / 64, 49 / 64, 17 / 64, 57 / 64, 25 / 64],
  [15 / 64, 47 / 64, 7 / 64, 39 / 64, 13 / 64, 45 / 64, 5 / 64, 37 / 64],
  [63 / 64, 31 / 64, 55 / 64, 23 / 64, 61 / 64, 29 / 64, 53 / 64, 21 / 64],
];

/**
 * Applies an 8x8 Bayer Matrix Dithering effect.
 */
export function renderDitheringOverlay(
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  levels: number,
): void {
  const pixelScale = Math.max(1, Math.floor(scale));
  const steps = Math.max(2, Math.floor(levels));

  targetBuffer.push();

  const p = targetBuffer as unknown as p5;
  const tempGraphic = p.createGraphics(
    Math.ceil(canvasWidth / pixelScale),
    Math.ceil(canvasHeight / pixelScale),
  );

  tempGraphic.image(
    targetBuffer,
    0,
    0,
    tempGraphic.width,
    tempGraphic.height,
  );
  tempGraphic.loadPixels();

  const pixels = tempGraphic.pixels;
  if (!pixels || pixels.length === 0) {
    targetBuffer.pop();
    return;
  }

  const w = tempGraphic.width;
  const h = tempGraphic.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const bayerVal = BAYER_MATRIX_8X8[y % 8][x % 8] - 0.5;

      const ditheredLum = Math.max(
        0,
        Math.min(1, Math.floor((lum + bayerVal / steps) * steps) / (steps - 1)),
      );

      const val = Math.round(ditheredLum * 255);
      pixels[idx] = val;
      pixels[idx + 1] = val;
      pixels[idx + 2] = val;
    }
  }

  tempGraphic.updatePixels();

  targetBuffer.image(tempGraphic, 0, 0, canvasWidth, canvasHeight);
  targetBuffer.pop();
}
