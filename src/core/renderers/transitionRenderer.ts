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

    case "cubeHorizontal": {
      // 5. 3D Cube Horizontal Rotate Transition
      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      if (ctx) {
        ctx.save();

        const prevCanvas = (
          prevBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;
        const currCanvas = (
          currentBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;

        // Dark 3D space background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        // Old face (rotates from 0 to 90 degrees away to the left)
        const thetaOld = eased * (Math.PI / 2);
        const cosOld = Math.cos(thetaOld);
        const sinOld = Math.sin(thetaOld);

        const oldW = width * cosOld;
        const oldH = height * (1 - sinOld * 0.28);
        const oldX = width / 2 - oldW / 2 - (width / 2) * sinOld * 0.45;
        const oldY = (height - oldH) / 2;

        ctx.globalAlpha = Math.max(0, 1 - eased * 0.6);
        ctx.drawImage(prevCanvas, oldX, oldY, oldW, oldH);

        // New face (rotates in from 90 to 0 degrees from the right)
        const thetaNew = (1 - eased) * (Math.PI / 2);
        const cosNew = Math.cos(thetaNew);
        const sinNew = Math.sin(thetaNew);

        const newW = width * cosNew;
        const newH = height * (1 - sinNew * 0.28);
        const newX = width / 2 - newW / 2 + (width / 2) * sinNew * 0.45;
        const newY = (height - newH) / 2;

        ctx.globalAlpha = Math.min(1, eased * 1.5);
        ctx.drawImage(currCanvas, newX, newY, newW, newH);

        ctx.restore();
      } else {
        const offsetX = width * eased;
        targetGraphics.image(prevBuffer, -offsetX, 0);
        targetGraphics.image(currentBuffer, width - offsetX, 0);
      }
      break;
    }

    case "cubeVertical": {
      // 6. 3D Cube Vertical Rotate Transition
      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      if (ctx) {
        ctx.save();

        const prevCanvas = (
          prevBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;
        const currCanvas = (
          currentBuffer as unknown as { canvas: HTMLCanvasElement }
        ).canvas;

        // Dark 3D space background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        // Old face (rotates upward from 0 to 90 degrees)
        const thetaOld = eased * (Math.PI / 2);
        const cosOld = Math.cos(thetaOld);
        const sinOld = Math.sin(thetaOld);

        const oldH = height * cosOld;
        const oldW = width * (1 - sinOld * 0.28);
        const oldY = height / 2 - oldH / 2 - (height / 2) * sinOld * 0.45;
        const oldX = (width - oldW) / 2;

        ctx.globalAlpha = Math.max(0, 1 - eased * 0.6);
        ctx.drawImage(prevCanvas, oldX, oldY, oldW, oldH);

        // New face (rotates in from bottom, 90 to 0 degrees)
        const thetaNew = (1 - eased) * (Math.PI / 2);
        const cosNew = Math.cos(thetaNew);
        const sinNew = Math.sin(thetaNew);

        const newH = height * cosNew;
        const newW = width * (1 - sinNew * 0.28);
        const newY = height / 2 - newH / 2 + (height / 2) * sinNew * 0.45;
        const newX = (width - newW) / 2;

        ctx.globalAlpha = Math.min(1, eased * 1.5);
        ctx.drawImage(currCanvas, newX, newY, newW, newH);

        ctx.restore();
      } else {
        const offsetY = height * eased;
        targetGraphics.image(prevBuffer, 0, -offsetY);
        targetGraphics.image(currentBuffer, 0, height - offsetY);
      }
      break;
    }

    default:
      targetGraphics.image(currentBuffer, 0, 0);
      break;
  }

  targetGraphics.pop();
}
