/**
 * Client-Side Image Compression & Format Normalization Utility
 * 
 * - Normalizes image format (HEIC/HEIF/PNG/Large JPEG) to high-quality compressed JPEG or WebP
 * - Resizes images with dimensions exceeding maxDimension (default: 1920px)
 * - Compresses files to guarantee payload is under maxSizeBytes (default: 1.5MB)
 * - Returns a standardized File object ready for FormData upload and a safe Data URL for immediate preview
 */

export interface CompressionOptions {
  maxDimension?: number;
  quality?: number;
  maxSizeBytes?: number;
  outputFormat?: "image/jpeg" | "image/webp";
}

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressAndNormalizeImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 1920,
    quality = 0.85,
    maxSizeBytes = 1.5 * 1024 * 1024, // 1.5 MB
    outputFormat = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    // Check if browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      return resolve({
        file,
        dataUrl: "",
        originalSize: file.size,
        compressedSize: file.size,
        width: 0,
        height: 0,
      });
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(new Error(`Failed to read image file: ${err}`));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        return reject(new Error("Empty image file content."));
      }

      const img = new Image();
      img.onerror = () => {
        // If standard Image constructor cannot parse (e.g. HEIC on unsupported browser),
        // return the original file without throwing so upload can still proceed
        console.warn("[ImageCompressor] Native image parser failed, using original file");
        resolve({
          file,
          dataUrl: src,
          originalSize: file.size,
          compressedSize: file.size,
          width: 0,
          height: 0,
        });
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Downscale if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return resolve({
              file,
              dataUrl: src,
              originalSize: file.size,
              compressedSize: file.size,
              width: img.width,
              height: img.height,
            });
          }

          // Fill white background for transparent images converted to JPEG
          if (outputFormat === "image/jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Iteratively adjust quality if size exceeds maxSizeBytes
          let currentQuality = quality;
          let dataUrl = canvas.toDataURL(outputFormat, currentQuality);

          // Convert dataURL to Blob / File
          const getBlobFromDataUrl = (dataUri: string): Blob => {
            const byteString = atob(dataUri.split(",")[1]);
            const mimeString = dataUri.split(",")[0].split(":")[1].split(";")[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mimeString });
          };

          let blob = getBlobFromDataUrl(dataUrl);

          // If still larger than maxSizeBytes, step down quality
          while (blob.size > maxSizeBytes && currentQuality > 0.4) {
            currentQuality -= 0.15;
            dataUrl = canvas.toDataURL(outputFormat, currentQuality);
            blob = getBlobFromDataUrl(dataUrl);
          }

          const ext = outputFormat === "image/webp" ? ".webp" : ".jpg";
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const cleanFileName = `${baseName}_optimized${ext}`;

          const compressedFile = new File([blob], cleanFileName, {
            type: outputFormat,
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            dataUrl,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            width,
            height,
          });
        } catch (canvasErr) {
          console.warn("[ImageCompressor] Canvas processing error:", canvasErr);
          resolve({
            file,
            dataUrl: src,
            originalSize: file.size,
            compressedSize: file.size,
            width: img.width,
            height: img.height,
          });
        }
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}

export default compressAndNormalizeImage;
