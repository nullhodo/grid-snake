import type p5 from "p5";
import type { TransitionType } from "../../types/sketch";

/**
 * Smooth cubic easing function (easeInOutCubic) for seamless transitions.
 */
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Blends previous frame buffer and current frame buffer using the selected transition animation pattern.
 * @param targetGraphics - Main p5 instance or output graphics buffer.
 * @param prevBuffer - Captured image buffer of the previous state.
 * @param currentBuffer - Image buffer of the newly updated state.
 * @param progress - Normalized transition progress in range [0.0, 1.0].
 * @param type - Active transition pattern mode.
 */
export function renderTransition(
  targetGraphics: p5 | p5.Graphics,
  prevBuffer: p5.Graphics,
  currentBuffer: p5.Graphics,
  progress: number,
  type: TransitionType,
): void {
  const width = targetGraphics.width;
  const height = targetGraphics.height;
  const p = Math.max(0, Math.min(1, progress));

  if (type === "none" || p >= 1.0) {
    targetGraphics.image(currentBuffer, 0, 0);
    return;
  }

  const eased = easeInOutCubic(p);

  targetGraphics.push();

  switch (type) {
    case "fade": {
      // 1. Crossfade / Dissolve
      targetGraphics.image(currentBuffer, 0, 0);
      targetGraphics.tint(255, 255 * (1 - eased));
      targetGraphics.image(prevBuffer, 0, 0);
      targetGraphics.noTint();
      break;
    }

    case "slide": {
      // 2. Horizontal Slide Transition (Old slides left, new enters from right)
      const offsetX = width * eased;
      targetGraphics.image(prevBuffer, -offsetX, 0);
      targetGraphics.image(currentBuffer, width - offsetX, 0);
      break;
    }

    case "zoom": {
      // 3. Scale Zoom Transition (Old scales up & fades out over new)
      targetGraphics.image(currentBuffer, 0, 0);

      targetGraphics.push();
      const centerAlign = ("CENTER" in targetGraphics
        ? targetGraphics.CENTER
        : "center") as p5.IMAGE_MODE;
      targetGraphics.imageMode(centerAlign);
      targetGraphics.translate(width / 2, height / 2);
      const scaleFactor = 1 + eased * 0.35; // 1.0 -> 1.35
      targetGraphics.scale(scaleFactor);
      targetGraphics.tint(255, 255 * (1 - eased));
      targetGraphics.image(prevBuffer, 0, 0);
      targetGraphics.pop();
      break;
    }

    case "wipe": {
      // 4. Circular Center Wipe Transition
      targetGraphics.image(prevBuffer, 0, 0);

      const maxRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
      const currentRadius = maxRadius * eased;

      // Use HTML5 2D Canvas clipping for smooth circular wipe
      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      if (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, currentRadius, 0, Math.PI * 2);
        ctx.clip();
        targetGraphics.image(currentBuffer, 0, 0);
        ctx.restore();
      } else {
        // Fallback tint blend
        targetGraphics.tint(255, 255 * eased);
        targetGraphics.image(currentBuffer, 0, 0);
        targetGraphics.noTint();
      }
      break;
    }

    case "swipeHorizontal": {
      // 5. Swipe Horizontal Transition (Card-style perspective slide out)
      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      targetGraphics.image(currentBuffer, 0, 0);

      if (ctx) {
        ctx.save();
        const prevCanvas = (
          prevBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;

        const thetaOld = eased * (Math.PI / 2);
        const cosOld = Math.cos(thetaOld);
        const sinOld = Math.sin(thetaOld);

        const oldW = width * cosOld;
        const oldH = height * (1 - sinOld * 0.25);
        const oldX = width / 2 - oldW / 2 - (width / 2) * sinOld * 0.45;
        const oldY = (height - oldH) / 2;

        ctx.globalAlpha = Math.max(0, 1 - eased * 0.7);
        ctx.drawImage(prevCanvas, oldX, oldY, oldW, oldH);
        ctx.restore();
      }
      break;
    }

    case "swipeVertical": {
      // 6. Swipe Vertical Transition (Card-style vertical perspective slide out)
      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      targetGraphics.image(currentBuffer, 0, 0);

      if (ctx) {
        ctx.save();
        const prevCanvas = (
          prevBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;

        const thetaOld = eased * (Math.PI / 2);
        const cosOld = Math.cos(thetaOld);
        const sinOld = Math.sin(thetaOld);

        const oldH = height * cosOld;
        const oldW = width * (1 - sinOld * 0.25);
        const oldY = height / 2 - oldH / 2 - (height / 2) * sinOld * 0.45;
        const oldX = (width - oldW) / 2;

        ctx.globalAlpha = Math.max(0, 1 - eased * 0.7);
        ctx.drawImage(prevCanvas, oldX, oldY, oldW, oldH);
        ctx.restore();
      }
      break;
    }

    case "cubeHorizontal": {
      // 7. True 3D Y-Axis Center Cube Rotation (Slice perspective projection)
      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      // Base layer to prevent black background bleed
      targetGraphics.image(currentBuffer, 0, 0);

      if (ctx) {
        ctx.save();

        const prevCanvas = (
          prevBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;
        const currCanvas = (
          currentBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;

        const theta = eased * (Math.PI / 2);
        const slices = 32;
        const sliceW = width / slices;
        const distance = width * 1.5;

        // Face A (Prev Face) - Rotates 0 to 90 degrees around Y axis
        if (theta < Math.PI / 2 - 0.001) {
          ctx.globalAlpha = Math.max(0, Math.cos(theta));
          for (let i = 0; i < slices; i++) {
            const srcX = i * sliceW;
            const u = srcX + sliceW / 2 - width / 2;

            const x3d = u * Math.cos(theta);
            const z3d = u * Math.sin(theta);

            const scale = distance / (distance + z3d);
            const destX = width / 2 + x3d * scale - (sliceW * scale) / 2;
            const destY = (height * (1 - scale)) / 2;
            const destW = sliceW * scale + 0.6; // Slight overlap to prevent seams
            const destH = height * scale;

            ctx.drawImage(
              prevCanvas,
              srcX,
              0,
              sliceW,
              height,
              destX,
              destY,
              destW,
              destH,
            );
          }
        }

        // Face B (Current Face) - Rotates -90 to 0 degrees around Y axis
        if (theta > 0.001) {
          const phi = theta - Math.PI / 2;
          ctx.globalAlpha = Math.min(1, Math.sin(theta));
          for (let i = 0; i < slices; i++) {
            const srcX = i * sliceW;
            const u = srcX + sliceW / 2 - width / 2;

            const x3d = u * Math.cos(phi);
            const z3d = -u * Math.sin(phi);

            const scale = distance / (distance + z3d);
            const destX = width / 2 + x3d * scale - (sliceW * scale) / 2;
            const destY = (height * (1 - scale)) / 2;
            const destW = sliceW * scale + 0.6;
            const destH = height * scale;

            ctx.drawImage(
              currCanvas,
              srcX,
              0,
              sliceW,
              height,
              destX,
              destY,
              destW,
              destH,
            );
          }
        }

        ctx.restore();
      }
      break;
    }

    case "cubeVertical": {
      // 8. True 3D X-Axis Center Cube Rotation (Slice perspective projection)
      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      // Base layer to prevent black background bleed
      targetGraphics.image(currentBuffer, 0, 0);

      if (ctx) {
        ctx.save();

        const prevCanvas = (
          prevBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;
        const currCanvas = (
          currentBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;

        const theta = eased * (Math.PI / 2);
        const slices = 32;
        const sliceH = height / slices;
        const distance = height * 1.5;

        // Face A (Prev Face) - Rotates 0 to 90 degrees around X axis
        if (theta < Math.PI / 2 - 0.001) {
          ctx.globalAlpha = Math.max(0, Math.cos(theta));
          for (let i = 0; i < slices; i++) {
            const srcY = i * sliceH;
            const v = srcY + sliceH / 2 - height / 2;

            const y3d = v * Math.cos(theta);
            const z3d = v * Math.sin(theta);

            const scale = distance / (distance + z3d);
            const destY = height / 2 + y3d * scale - (sliceH * scale) / 2;
            const destX = (width * (1 - scale)) / 2;
            const destH = sliceH * scale + 0.6;
            const destW = width * scale;

            ctx.drawImage(
              prevCanvas,
              0,
              srcY,
              width,
              sliceH,
              destX,
              destY,
              destW,
              destH,
            );
          }
        }

        // Face B (Current Face) - Rotates -90 to 0 degrees around X axis
        if (theta > 0.001) {
          const phi = theta - Math.PI / 2;
          ctx.globalAlpha = Math.min(1, Math.sin(theta));
          for (let i = 0; i < slices; i++) {
            const srcY = i * sliceH;
            const v = srcY + sliceH / 2 - height / 2;

            const y3d = v * Math.cos(phi);
            const z3d = -v * Math.sin(phi);

            const scale = distance / (distance + z3d);
            const destY = height / 2 + y3d * scale - (sliceH * scale) / 2;
            const destX = (width * (1 - scale)) / 2;
            const destH = sliceH * scale + 0.6;
            const destW = width * scale;

            ctx.drawImage(
              currCanvas,
              0,
              srcY,
              width,
              sliceH,
              destX,
              destY,
              destW,
              destH,
            );
          }
        }

        ctx.restore();
      }
      break;
    }

    default:
      targetGraphics.image(currentBuffer, 0, 0);
      break;
  }

  targetGraphics.pop();
}
