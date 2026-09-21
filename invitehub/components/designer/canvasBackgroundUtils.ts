/**
 * Centralized Fabric.js background image setter.
 * Bypasses Fabric CORS / caching bugs by pre-loading the image via a native
 * HTMLImageElement, then handing the loaded element to Fabric so there is
 * zero race between canvas render and network fetch.
 */

declare const fabric: any;

/** Get the live Fabric canvas instance from the global window references. */
export const getFabricCanvas = (): any => {
  if (typeof window === "undefined") return null;
  return (
    (window as any)?.__fabricCanvas ||
    (window as any)?.__canvasInstance ||
    (window as any)?.__fabricCanvasRef?.current ||
    null
  );
};

/**
 * Apply a background image to a Fabric canvas with guaranteed CORS handling,
 * proper scaling, and error recovery.
 *
 * @param canvas     - Fabric.Canvas instance (or null — function is a no-op)
 * @param imageUrl   - Absolute or relative URL of the background image
 * @param callback   - Called after the background has been painted (or on error)
 * @returns          - void
 */
export const applyCanvasBackground = (
  canvas: any,
  imageUrl: string | null | undefined,
  callback?: () => void
): void => {
  if (!canvas || !imageUrl) {
    if (callback) callback();
    return;
  }

  // Guard: make sure fabric is available globally
  if (typeof fabric === "undefined" || typeof fabric.Image === "undefined") {
    if (callback) callback();
    return;
  }

  const imgElement = new Image();
  imgElement.crossOrigin = "anonymous";
  imgElement.src = imageUrl;

  imgElement.onload = () => {
    try {
      const fabricImg = new fabric.Image(imgElement, {
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        excludeFromExport: true,
      });

      // Scale to fill canvas dimensions perfectly
      const cw = typeof canvas.getWidth === "function" ? canvas.getWidth() : canvas.width || 600;
      const ch = typeof canvas.getHeight === "function" ? canvas.getHeight() : canvas.height || 840;
      fabricImg.scaleToWidth(cw);
      fabricImg.scaleToHeight(ch);

      canvas.setBackgroundImage(fabricImg, () => {
        if (typeof canvas.requestRenderAll === "function") {
          canvas.requestRenderAll();
        } else if (typeof canvas.renderAll === "function") {
          canvas.renderAll();
        }
        if (callback) callback();
      });
    } catch (err) {
      console.warn("[applyCanvasBackground] Fabric render error:", err);
      if (callback) callback();
    }
  };

  imgElement.onerror = (err) => {
    console.warn("[applyCanvasBackground] Failed to load:", imageUrl, err);
    if (callback) callback();
  };
};

/**
 * Retrieve the current background image URL from a Fabric canvas instance.
 * Returns the src of the background image element, or null.
 */
export const getCanvasBackgroundUrl = (canvas: any): string | null => {
  if (!canvas) return null;
  try {
    const bg = canvas.backgroundImage;
    if (!bg) return null;
    // Fabric.Image wraps the native element at _element
    return bg._element?.src || bg.src || null;
  } catch {
    return null;
  }
};

/**
 * Tear down canvas text layers while preserving and re-applying the background.
 * This replaces the inline teardown logic with a version that guarantees the
 * background survives the clearContext / object-removal cycle.
 */
export const teardownTextLayersPreservingBackground = (
  canvas: any,
  backgroundUrl?: string | null
): void => {
  if (!canvas || typeof canvas.getObjects !== "function") return;

  try {
    // 1. Clear 2D context buffers (ghost draw frames)
    if (typeof canvas.clearContext === "function") {
      if (canvas.contextContainer) canvas.clearContext(canvas.contextContainer);
      if (canvas.contextTop) canvas.clearContext(canvas.contextTop);
    } else if (canvas.lowerCanvasEl && typeof canvas.lowerCanvasEl.getContext === "function") {
      const rawCtx = canvas.lowerCanvasEl.getContext("2d");
      if (rawCtx) {
        rawCtx.clearRect(0, 0, canvas.getWidth?.() || 600, canvas.getHeight?.() || 840);
      }
    }

    // 2. Determine the background URL to preserve
    const preservedBgUrl =
      backgroundUrl ||
      (() => {
        try {
          const bg = canvas.backgroundImage;
          return bg?._element?.src || bg?.src || null;
        } catch {
          return null;
        }
      })();

    // 3. Remove ONLY text objects — keep images, rects, paths (decorative frames)
    const textObjects = canvas.getObjects().filter((obj: any) => {
      if (obj.type === "textbox" || obj.type === "i-text" || obj.type === "text") return true;
      if (obj.data?.isTextBlock) return true;
      if (obj.type === "image" || obj.type === "rect" || obj.type === "circle" || obj.type === "path") return false;
      if (obj.customId && obj.customId !== "background-frame" && obj.type === "i-text") return true;
      return false;
    });
    textObjects.forEach((obj: any) => canvas.remove(obj));

    // 4. Deselect active object
    if (typeof canvas.discardActiveObject === "function") {
      canvas.discardActiveObject();
    }

    // 5. Re-apply background image via the bulletproof setter
    if (preservedBgUrl) {
      applyCanvasBackground(canvas, preservedBgUrl, () => {
        if (typeof canvas.requestRenderAll === "function") {
          canvas.requestRenderAll();
        }
      });
    } else if (typeof canvas.requestRenderAll === "function") {
      canvas.requestRenderAll();
    }
  } catch (err) {
    console.warn("[teardownTextLayersPreservingBackground] Error:", err);
  }
};

export interface CleanCanvasOptions {
  preserveBackground?: boolean;
  backgroundUrl?: string | null;
}

/**
 * Strictly clears all existing canvas objects, active selection, and event listeners
 * before loading any new or saved template, preventing duplicate text / ghost layers.
 * Also removes or overwrites existing background images instead of stacking multiple layers.
 */
export const cleanFabricCanvas = (
  canvas: any,
  options?: CleanCanvasOptions
): void => {
  if (!canvas) return;

  try {
    // 1. Detach all registered event listeners to prevent duplicate handlers
    if (typeof canvas.off === "function") {
      canvas.off("selection:created");
      canvas.off("selection:updated");
      canvas.off("selection:cleared");
      canvas.off("object:moving");
      canvas.off("object:scaling");
      canvas.off("object:rotating");
      canvas.off("mouse:down");
      canvas.off("mouse:up");
    }

    // 2. Discard active object selection
    if (typeof canvas.discardActiveObject === "function") {
      canvas.discardActiveObject();
    }

    // 3. Remove all objects or perform full clear
    if (options?.preserveBackground) {
      if (typeof canvas.getObjects === "function") {
        const objects = [...canvas.getObjects()];
        objects.forEach((obj: any) => {
          try {
            canvas.remove(obj);
          } catch (_) {}
        });
      }
    } else {
      if (typeof canvas.clear === "function") {
        canvas.clear();
      } else if (typeof canvas.getObjects === "function") {
        const objects = [...canvas.getObjects()];
        objects.forEach((obj: any) => {
          try {
            canvas.remove(obj);
          } catch (_) {}
        });
      }
    }

    // 4. Clear 2D context buffers (prevents ghost draw artifacts)
    if (typeof canvas.clearContext === "function") {
      if (canvas.contextContainer) canvas.clearContext(canvas.contextContainer);
      if (canvas.contextTop) canvas.clearContext(canvas.contextTop);
    } else if (canvas.lowerCanvasEl && typeof canvas.lowerCanvasEl.getContext === "function") {
      const rawCtx = canvas.lowerCanvasEl.getContext("2d");
      if (rawCtx) {
        rawCtx.clearRect(0, 0, canvas.getWidth?.() || 600, canvas.getHeight?.() || 840);
      }
    }

    // 5. Reset or overwrite background image cleanly (never stack layers)
    if (options?.preserveBackground && options?.backgroundUrl) {
      applyCanvasBackground(canvas, options.backgroundUrl);
    } else if (!options?.preserveBackground) {
      if (typeof canvas.setBackgroundImage === "function") {
        canvas.setBackgroundImage(null, () => {
          if (typeof canvas.requestRenderAll === "function") {
            canvas.requestRenderAll();
          } else if (typeof canvas.renderAll === "function") {
            canvas.renderAll();
          }
        });
      }
    } else {
      if (typeof canvas.requestRenderAll === "function") {
        canvas.requestRenderAll();
      } else if (typeof canvas.renderAll === "function") {
        canvas.renderAll();
      }
    }
  } catch (err) {
    console.warn("[cleanFabricCanvas] Error:", err);
  }
};
