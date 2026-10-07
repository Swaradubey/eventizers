/**
 * Centralized Fabric.js background image setter and canvas layer utilities.
 * Bypasses Fabric CORS / caching bugs by pre-loading the image via a native
 * HTMLImageElement with CORS fallback, then handing the loaded element to Fabric
 * so there is zero race between canvas render and network fetch.
 */

declare const fabric: any;

/**
 * Normalizes template background image URLs:
 * - Detects frontend static asset paths (/assets/, /templates/) and strips foreign backend/localhost hosts
 * - Upgrades insecure http:// URLs to https:// on HTTPS pages (preventing Mixed Content blocking)
 * - Safely handles relative paths, data URLs, and uploads
 */
export const normalizeTemplateImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;

  const backendBase =
    (typeof process !== "undefined" && (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_PUBLIC_URL ||
      process.env.BACKEND_URL
    )?.replace(/\/api\/?$/, "")) ||
    "";

  // Handle local relative uploads (e.g., "/uploads/template_artwork_...png")
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    const cleanUploadPath = trimmed.replace(/^\/?uploads\//, "/uploads/");
    if (backendBase && !backendBase.includes("localhost")) {
      return `${backendBase.replace(/\/+$/, "")}${cleanUploadPath}`;
    }
    return cleanUploadPath;
  }

  // Handle raw uploaded filename without path (e.g., "template_artwork_179...png")
  if (/^(template_|upload_|event_cover_|invitation_|snapshot_).*\.(png|jpe?g|webp|gif|svg|avif)$/i.test(trimmed)) {
    console.warn("[canvasBackgroundUtils] Detected raw uploaded filename:", trimmed);
    if (backendBase && !backendBase.includes("localhost")) {
      return `${backendBase.replace(/\/+$/, "")}/uploads/${trimmed}`;
    }
    return `/uploads/${trimmed}`;
  }

  // 1. Direct external image links (Cloudinary, S3, Supabase, Unsplash, Imgur, etc.)
  const isDirectExternal = /^https?:\/\/(?!localhost|127\.0\.0\.1)/i.test(trimmed);
  if (isDirectExternal) {
    if (typeof window !== "undefined" && window.location.protocol === "https:" && trimmed.startsWith("http://")) {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
    return trimmed;
  }

  // 2. If URL contains /assets/ or /templates/ on localhost, strip foreign host prefix
  const foreignAssetMatch = trimmed.match(/^(?:https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?)\/((?:assets|templates)\/.*)$/i);
  if (foreignAssetMatch) {
    return `/${foreignAssetMatch[1]}`;
  }

  // Relative frontend static assets
  if (trimmed.startsWith("/assets/") || trimmed.startsWith("/templates/")) {
    return trimmed;
  }

  // 3. If running in production and URL points to localhost /uploads/
  if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    (trimmed.includes("localhost") || trimmed.includes("127.0.0.1"))
  ) {
    const uploadMatch = trimmed.match(/^(?:https?:\/\/[^/]+)?(\/uploads\/.*)$/i);
    if (uploadMatch) {
      if (backendBase && !backendBase.includes("localhost")) {
        return `${backendBase.replace(/\/+$/, "")}${uploadMatch[1]}`;
      }
      return uploadMatch[1];
    }
  }

  return trimmed;
};

/**
 * Returns a proxy URL for external image links to bypass CORS and Mixed-Content restrictions
 * when loaded onto an HTML5 or Fabric canvas.
 */
export const getProxyImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string") return "";
  const normalized = normalizeTemplateImageUrl(url);
  if (!normalized) return "";
  if (
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:") ||
    normalized.startsWith("/api/proxy-image")
  ) {
    return normalized;
  }
  // Frontend static assets never need proxying
  if (normalized.startsWith("/assets/") || normalized.startsWith("/templates/")) {
    return normalized;
  }
  if (
    typeof window !== "undefined" &&
    normalized.startsWith(window.location.origin) &&
    !normalized.includes("/uploads/")
  ) {
    return normalized;
  }
  return `/api/proxy-image?url=${encodeURIComponent(normalized)}`;
};

export interface LoadedImageInfo {
  src: string;
  width: number;
  height: number;
  element: HTMLImageElement;
}

export interface LoadImageOptions {
  crossOrigin?: string;
  timeoutMs?: number;
  /** Skip candidates up to (and including) this src — used when advancing a failed chain. */
  startAfterSrc?: string | null;
}

/**
 * Builds the ordered candidate list for loading a template image:
 *   1. The normalized direct URL (tried with crossOrigin="anonymous")
 *   2. The relative /assets|/templates variant (absolute foreign-host assets only)
 *   3. The CORS reverse proxy: /api/proxy-image?url=<encoded>
 *
 * Duplicates and data:/blob: URLs are collapsed so the chain always terminates.
 */
export const buildImageFallbackChain = (url?: string | null, startAfterSrc?: string | null): string[] => {
  const normalized = normalizeTemplateImageUrl(url);
  if (!normalized) return [];

  const chain: string[] = [];
  const push = (candidate?: string | null) => {
    if (candidate && candidate.trim() && !chain.includes(candidate.trim())) {
      chain.push(candidate.trim());
    }
  };

  // 1. Direct candidate
  push(normalized);

  // 2. Relative frontend asset fallback (if was full URL to /assets/ or /templates/)
  const assetMatch = normalized.match(/^(?:https?:\/\/[^/]+)?(\/(?:assets|templates)\/.*)$/i);
  if (assetMatch && assetMatch[1] !== normalized) push(assetMatch[1]);

  // 3. Server-side CORS proxy failover: /api/proxy-image?url=<encoded>
  if (!normalized.startsWith("data:") && !normalized.startsWith("blob:") && !normalized.startsWith("/assets/") && !normalized.startsWith("/templates/")) {
    push(getProxyImageUrl(normalized));

    // 4. Insecure HTTP upstream: also attempt HTTPS proxied candidate
    if (normalized.startsWith("http://")) {
      push(getProxyImageUrl(normalized.replace(/^http:\/\//i, "https://")));
    }
  }

  if (!startAfterSrc) return chain;
  const idx = chain.findIndex((candidate) => candidate === startAfterSrc);
  return idx >= 0 ? chain.slice(idx + 1) : chain;
};

/**
 * Loads an image with crossOrigin="anonymous" and walks the fallback chain
 * (direct → relative asset → /api/proxy-image) automatically on failure.
 * Rejects only after every candidate has been exhausted.
 */
export const loadImageWithFallback = (
  url?: string | null,
  options?: LoadImageOptions
): Promise<LoadedImageInfo> => {
  const chain = buildImageFallbackChain(url, options?.startAfterSrc);
  const crossOrigin = options?.crossOrigin ?? "anonymous";
  const timeoutMs = options?.timeoutMs ?? 12_000;

  return new Promise<LoadedImageInfo>((resolve, reject) => {
    if (chain.length === 0) {
      reject(new Error("No image source available"));
      return;
    }

    let attempt = 0;

    const tryNext = () => {
      if (attempt >= chain.length) {
        reject(new Error("All image load attempts failed"));
        return;
      }

      const src = chain[attempt];
      attempt += 1;

      const img = new Image();
      let settled = false;

      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        img.src = "";
        tryNext();
      }, timeoutMs);

      img.crossOrigin = crossOrigin;

      img.onload = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve({
          src,
          width: img.naturalWidth || img.width || 600,
          height: img.naturalHeight || img.height || 840,
          element: img,
        });
      };

      img.onerror = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        tryNext();
      };

      img.src = src;
    };

    tryNext();
  });
};

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

export interface ApplyCanvasBackgroundOptions {
  width?: number;
  height?: number;
  aspectRatio?: string | number;
  scaleMode?: "cover" | "contain";
  crossOrigin?: string;
  useProxy?: boolean;
}

/**
 * Apply a background image to a Fabric canvas with guaranteed CORS handling,
 * proper scaling across aspect ratios (5x7, 5x5, 9:16, 4x3), and error recovery.
 *
 * @param canvas     - Fabric.Canvas instance (or null — function is a no-op)
 * @param imageUrl   - Absolute or relative URL of the background image
 * @param callback   - Called after the background has been painted (or on error)
 * @param options    - Scaling, aspect ratio, and proxy options
 */
export const applyCanvasBackground = (
  canvas: any,
  imageUrl: string | null | undefined,
  callback?: (info?: { width: number; height: number; aspectRatio: number; error?: boolean }) => void,
  options?: ApplyCanvasBackgroundOptions
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

  const initialUrl = normalizeTemplateImageUrl(imageUrl);

  // Automatic failover: direct URL (crossOrigin="anonymous") → relative asset path → /api/proxy-image
  loadImageWithFallback(initialUrl, { crossOrigin: options?.crossOrigin || "anonymous" }).then(
    ({ element: imgElement }) => {
      try {
        const imgW = imgElement.naturalWidth || imgElement.width || 600;
        const imgH = imgElement.naturalHeight || imgElement.height || 840;
        const imgAspectRatio = imgW / imgH;

        // Parse desired aspect ratio if specified
        let targetRatio = imgAspectRatio;
        if (options?.aspectRatio) {
          if (typeof options.aspectRatio === "number" && options.aspectRatio > 0) {
            targetRatio = options.aspectRatio;
          } else if (typeof options.aspectRatio === "string") {
            const raw = options.aspectRatio.trim().toLowerCase();
            if (raw === "square" || raw === "1/1" || raw === "1:1" || raw === "square-5x5") {
              targetRatio = 1.0;
            } else if (raw === "story-9x16" || raw === "9/16" || raw === "9:16") {
              targetRatio = 9 / 16;
            } else if (raw === "portrait-5x7" || raw === "5/7" || raw === "5x7" || raw === "3/4.2") {
              targetRatio = 3 / 4.2;
            } else if (raw === "landscape-4x3" || raw === "4/3" || raw === "4:3") {
              targetRatio = 4 / 3;
            }
          }
        }

        const currentW = options?.width || (typeof canvas.getWidth === "function" ? canvas.getWidth() : (canvas.width || 600));
        const proportionalH = options?.height || Math.round(currentW / targetRatio);

        if (typeof canvas.setDimensions === "function") {
          canvas.setDimensions({ width: currentW, height: proportionalH });
        } else if (typeof canvas.setHeight === "function") {
          canvas.setHeight(proportionalH);
        }

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

        const cw = typeof canvas.getWidth === "function" ? canvas.getWidth() : (canvas.width || currentW);
        const ch = typeof canvas.getHeight === "function" ? canvas.getHeight() : (canvas.height || proportionalH);
        fabricImg.scaleToWidth(cw);
        fabricImg.scaleToHeight(ch);

        canvas.setBackgroundImage(fabricImg, () => {
          // Bring typography/canvas objects to front so they render ON TOP of the background
          if (typeof canvas.getObjects === "function") {
            const objects = canvas.getObjects();
            objects.forEach((obj: any) => {
              if (typeof canvas.bringToFront === "function") {
                canvas.bringToFront(obj);
              }
            });
          }

          if (typeof canvas.renderAll === "function") {
            canvas.renderAll();
          } else if (typeof canvas.requestRenderAll === "function") {
            canvas.requestRenderAll();
          }
          if (callback) callback({ width: imgW, height: imgH, aspectRatio: imgAspectRatio });
        });
      } catch (err) {
        console.warn("[applyCanvasBackground] Fabric render error:", err);
        if (callback) callback({ width: 0, height: 0, aspectRatio: 1, error: true });
      }
    },
    (err) => {
      console.warn("[applyCanvasBackground] Failed to load background image:", initialUrl, err);
      if (callback) callback({ width: 0, height: 0, aspectRatio: 1, error: true });
    }
  );
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
    return bg._element?.src || bg.src || null;
  } catch {
    return null;
  }
};

/**
 * Hydrate layers (both text layers and image layers) onto the Fabric canvas.
 * Correctly scales image layers with CORS handling and renders live textboxes.
 */
export const syncCanvasLayers = (
  canvas: any,
  layers: any[],
  dimensions?: { width?: number; height?: number }
): void => {
  if (!canvas || !Array.isArray(layers)) return;

  try {
    const cw = dimensions?.width || (typeof canvas.getWidth === "function" ? canvas.getWidth() : (canvas.width || 600));
    const ch = dimensions?.height || (typeof canvas.getHeight === "function" ? canvas.getHeight() : (canvas.height || 840));

    // Remove existing text and dynamic overlay objects before hydrating
    if (typeof canvas.getObjects === "function") {
      const existing = canvas.getObjects().filter((obj: any) =>
        obj.type === "textbox" ||
        obj.type === "i-text" ||
        obj.type === "text" ||
        obj.data?.isTextBlock === true ||
        obj.data?.isImageLayer === true
      );
      existing.forEach((obj: any) => {
        try { canvas.remove(obj); } catch (_) {}
      });
    }

    layers.forEach((layer: any, idx: number) => {
      if (!layer) return;

      // Handle Image Layers (type: 'image')
      if (layer.type === "image" || (!layer.text && (layer.imageUrl || layer.src || layer.url))) {
        const imgSrc = layer.imageUrl || layer.src || layer.url;
        if (!imgSrc) return;

        const imgX = (layer.x ?? layer.left ?? 50) * (cw / 100);
        const imgY = (layer.y ?? layer.top ?? 50) * (ch / 100);

        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";
        imgEl.src = imgSrc;
        imgEl.onload = () => {
          try {
            if (typeof fabric === "undefined" || !fabric.Image) return;
            const fImg = new fabric.Image(imgEl, {
              left: imgX,
              top: imgY,
              originX: "center",
              originY: "center",
              opacity: layer.opacity ?? 1,
              data: { isImageLayer: true, id: layer.id || `img-layer-${idx}` },
            });
            if (layer.width) {
              const targetW = typeof layer.width === "number" ? layer.width : parseFloat(layer.width);
              if (!isNaN(targetW) && targetW > 0) fImg.scaleToWidth(targetW);
            }
            canvas.add(fImg);
            if (typeof canvas.bringToFront === "function") canvas.bringToFront(fImg);
            canvas.requestRenderAll?.();
          } catch (e) {
            console.warn("[syncCanvasLayers] Could not mount fabric image layer:", e);
          }
        };
        imgEl.onerror = () => {
          // Automatic proxy failover for external image layers (one shot, never loops)
          const proxied = getProxyImageUrl(imgSrc);
          if (proxied && proxied !== imgEl.src && !imgEl.src.includes("/api/proxy-image")) {
            imgEl.src = proxied;
          }
        };
        return;
      }

      // Handle Text Layers
      if (typeof fabric !== "undefined" && typeof fabric.Textbox === "function") {
        const posX = (layer.computedLeft ?? layer.left ?? layer.x ?? 50) * (cw / 100);
        const posY = (layer.computedTop ?? layer.top ?? layer.y ?? 50) * (ch / 100);
        const fontSize = Math.max(10, Math.round((layer.fontSize || 16) * (cw / 500)));

        const tb = new fabric.Textbox(layer.text || "", {
          left: posX,
          top: posY,
          originX: "center",
          originY: "center",
          fontSize,
          fontFamily: layer.fontFamily ? layer.fontFamily.replace(/['"]/g, "") : "sans-serif",
          fontWeight: String(layer.fontWeight || "400"),
          fill: layer.color || "#1A1A1A",
          textAlign: layer.textAlign || layer.align || "center",
          data: { isTextBlock: true, id: layer.id || `text-layer-${idx}` },
        });

        canvas.add(tb);
        if (typeof canvas.bringToFront === "function") canvas.bringToFront(tb);
      }
    });

    if (typeof canvas.requestRenderAll === "function") {
      canvas.requestRenderAll();
    } else if (typeof canvas.renderAll === "function") {
      canvas.renderAll();
    }
  } catch (err) {
    console.warn("[syncCanvasLayers] Warning:", err);
  }
};

export const syncCanvasTextLayers = syncCanvasLayers;

/**
 * Tear down canvas text layers while preserving and re-applying the background.
 * Guarantees the background survives the clearContext / object-removal cycle.
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

    // 3. Remove text objects and dynamic overlay layers
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

    // 5. Re-apply background image
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
  aspectRatio?: string | number;
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

    // 5. Reset or overwrite background image cleanly
    if (options?.preserveBackground && options?.backgroundUrl) {
      applyCanvasBackground(canvas, options.backgroundUrl, undefined, {
        aspectRatio: options?.aspectRatio,
      });
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
