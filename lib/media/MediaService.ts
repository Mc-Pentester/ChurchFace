/**
 * Media Service for ChurchFace
 * Centralized service for media upload, optimization, and management
 * 
 * This is the main entry point for media operations.
 * Business logic modules should use this service instead of
 * directly calling UploadThing or other storage backends.
 */

import type {
  MediaKind,
  MediaVariant,
  MediaUploadResult,
  MediaMetadata,
  ImageValidationConfig,
  VideoValidationConfig,
  OptimizedMedia,
} from "./MediaTypes";
import { MediaValidator } from "./MediaValidation";
import { ImageOptimizer } from "./ImageOptimizer";
import { VideoOptimizer } from "./VideoOptimizer";
import { MediaStorage } from "./MediaStorage";
import {
  DEFAULT_IMAGE_CONFIG,
  DEFAULT_VIDEO_CONFIG,
} from "./MediaTypes";

export class MediaService {
  /**
   * Uploads and optimizes an image
   */
  static async uploadImage(
    file: File,
    config?: ImageValidationConfig
  ): Promise<MediaUploadResult> {
    const sanitizedName = MediaValidator.sanitizeFilename(file.name);
    console.log("[MediaService] Uploading image:", sanitizedName);

    let originalUrl: string | null = null;
    const uploadedUrls: string[] = [];

    try {
      // Validate image
      const metadata = await MediaValidator.validateImage(file, config);
      console.log("[MediaService] Image validated:", { width: metadata.width, height: metadata.height, size: metadata.size });

      // Upload original to storage
      originalUrl = await MediaStorage.upload(file);
      uploadedUrls.push(originalUrl);
      console.log("[MediaService] Original uploaded");

      // Convert file to buffer for optimization
      const buffer = await file.arrayBuffer();

      // Generate optimized variants
      const variants = await ImageOptimizer.optimizeImage(
        Buffer.from(buffer),
        originalUrl,
        metadata
      );
      console.log("[MediaService] Variants generated:", Object.keys(variants));

      // Upload each variant buffer
      const uploadedVariants: Partial<Record<MediaVariant, OptimizedMedia>> = {};

      for (const [variantName, variantData] of Object.entries(variants)) {
        const variant = variantName as MediaVariant;

        // Skip original - already uploaded
        if (variant === "original") {
          uploadedVariants[variant] = variantData;
          continue;
        }

        // Upload variant buffer if available
        if (variantData.buffer) {
          try {
            const variantUrl = await MediaStorage.uploadBuffer(
              variantData.buffer,
              this.generateVariantPath(originalUrl, variant),
              { contentType: variantData.mimeType }
            );
            uploadedUrls.push(variantUrl);
            uploadedVariants[variant] = {
              ...variantData,
              url: variantUrl,
            };
            console.log("[MediaService] Variant uploaded:", variant);
          } catch (error) {
            console.error("[MediaService] Failed to upload variant:", variant, error);
            // Continue with other variants even if one fails
          }
        }
      }

      return {
        originalUrl,
        variants: uploadedVariants,
        metadata,
      };
    } catch (error) {
      // Cleanup on error
      console.error("[MediaService] Upload failed, cleaning up");
      if (uploadedUrls.length > 0) {
        await this.cleanupUploadedFiles(uploadedUrls);
      }
      throw error;
    }
  }

  /**
   * Uploads and optimizes a video
   */
  static async uploadVideo(
    file: File,
    config?: VideoValidationConfig
  ): Promise<MediaUploadResult> {
    const sanitizedName = MediaValidator.sanitizeFilename(file.name);
    console.log("[MediaService] Uploading video:", sanitizedName);

    let originalUrl: string | null = null;
    const uploadedUrls: string[] = [];

    try {
      // Validate video
      const metadata = await MediaValidator.validateVideo(file, config);
      console.log("[MediaService] Video validated:", { size: metadata.size, duration: metadata.duration });

      // Upload original to storage
      originalUrl = await MediaStorage.upload(file);
      uploadedUrls.push(originalUrl);
      console.log("[MediaService] Video uploaded");

      // Generate optimized variants (placeholder for now)
      const variants = await VideoOptimizer.optimizeVideo(
        Buffer.from(await file.arrayBuffer()),
        originalUrl,
        metadata
      );
      console.log("[MediaService] Variants generated:", Object.keys(variants));

      return {
        originalUrl,
        variants,
        metadata,
      };
    } catch (error) {
      // Cleanup on error
      console.error("[MediaService] Upload failed, cleaning up");
      if (uploadedUrls.length > 0) {
        await this.cleanupUploadedFiles(uploadedUrls);
      }
      throw error;
    }
  }

  /**
   * Cleanup uploaded files on error
   */
  private static async cleanupUploadedFiles(urls: string[]): Promise<void> {
    if (urls.length === 0) return;

    console.log("[MediaService] Cleaning up uploaded files:", urls.length);
    const cleanupPromises = urls.map(url =>
      MediaStorage.delete(url).catch(err =>
        console.error("[MediaService] Failed to cleanup file:", err)
      )
    );

    await Promise.allSettled(cleanupPromises);
  }

  /**
   * Generates a variant path from original URL
   */
  private static generateVariantPath(originalUrl: string, variant: MediaVariant): string {
    // Extract filename from URL and append variant suffix
    const url = new URL(originalUrl);
    const pathname = url.pathname;
    const lastDot = pathname.lastIndexOf('.');

    if (lastDot === -1) {
      return `${pathname}-${variant}.webp`;
    }

    const base = pathname.substring(0, lastDot);
    return `${base}-${variant}.webp`;
  }

  /**
   * Uploads multiple files (images or videos)
   */
  static async uploadMultiple(
    files: File[],
    config?: {
      image?: ImageValidationConfig;
      video?: VideoValidationConfig;
    }
  ): Promise<MediaUploadResult[]> {
    console.log("[MediaService] Uploading multiple files:", files.length);

    const uploadPromises = files.map(async (file) => {
      if (file.type.startsWith("image/")) {
        return this.uploadImage(file, config?.image);
      } else if (file.type.startsWith("video/")) {
        return this.uploadVideo(file, config?.video);
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Gets the appropriate variant URL for a context
   */
  static getVariantUrl(
    variants: Record<MediaVariant, any>,
    preferredVariant: MediaVariant = "medium",
    fallbackVariant: MediaVariant = "original"
  ): string {
    // Try preferred variant first
    if (variants[preferredVariant]) {
      return variants[preferredVariant].url;
    }

    // Fallback to original
    if (variants[fallbackVariant]) {
      return variants[fallbackVariant].url;
    }

    // Return first available variant
    const firstVariant = Object.values(variants)[0];
    if (firstVariant) {
      return firstVariant.url;
    }

    throw new Error("No variants available");
  }

  /**
   * Gets the best variant for a viewport width
   */
  static getVariantForViewport(
    variants: Record<MediaVariant, any>,
    viewportWidth: number
  ): string {
    if (viewportWidth < 400) {
      return this.getVariantUrl(variants, "small");
    } else if (viewportWidth < 800) {
      return this.getVariantUrl(variants, "medium");
    } else if (viewportWidth < 1200) {
      return this.getVariantUrl(variants, "large");
    } else {
      return this.getVariantUrl(variants, "original");
    }
  }

  /**
   * Gets a thumbnail URL
   */
  static getThumbnailUrl(variants: Record<MediaVariant, any>): string {
    return this.getVariantUrl(variants, "thumbnail", "small");
  }

  /**
   * Deletes media from storage
   */
  static async delete(url: string): Promise<void> {
    console.log("[MediaService] Deleting media:", url);
    await MediaStorage.delete(url);
  }

  /**
   * Deletes multiple media items from storage
   */
  static async deleteMultiple(urls: string[]): Promise<void> {
    console.log("[MediaService] Deleting multiple media:", urls.length);
    await MediaStorage.deleteMultiple(urls);
  }

  /**
   * Validates a file without uploading
   */
  static async validateFile(
    file: File,
    config?: {
      image?: ImageValidationConfig;
      video?: VideoValidationConfig;
    }
  ): Promise<MediaMetadata> {
    if (file.type.startsWith("image/")) {
      return MediaValidator.validateImage(file, config?.image);
    } else if (file.type.startsWith("video/")) {
      return MediaValidator.validateVideo(file, config?.video);
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  /**
   * Gets media kind from MIME type
   */
  static getMediaKind(mimeType: string): MediaKind {
    if (mimeType.startsWith("image/")) {
      return "IMAGE";
    } else if (mimeType.startsWith("video/")) {
      return "VIDEO";
    } else if (mimeType.startsWith("audio/")) {
      return "AUDIO";
    } else {
      return "DOCUMENT";
    }
  }

  /**
   * Checks if a URL is a media URL
   */
  static isMediaUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      return (
        pathname.match(/\.(jpg|jpeg|png|webp|gif|mp4|webm|avif)$/i) !== null
      );
    } catch {
      return false;
    }
  }

  /**
   * Sanitizes a filename
   */
  static sanitizeFilename(filename: string): string {
    return MediaValidator.sanitizeFilename(filename);
  }
}

/**
 * Convenience function for single image upload
 */
export async function uploadImage(file: File, config?: ImageValidationConfig) {
  return MediaService.uploadImage(file, config);
}

/**
 * Convenience function for single video upload
 */
export async function uploadVideo(file: File, config?: VideoValidationConfig) {
  return MediaService.uploadVideo(file, config);
}

/**
 * Convenience function for multiple file upload
 */
export async function uploadMedia(files: File[]) {
  return MediaService.uploadMultiple(files);
}
