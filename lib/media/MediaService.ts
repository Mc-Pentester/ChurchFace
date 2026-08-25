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
    console.log("[MediaService] Uploading image:", file.name);

    // Validate image
    const metadata = await MediaValidator.validateImage(file, config);
    console.log("[MediaService] Image validated:", metadata);

    // Upload to storage
    const originalUrl = await MediaStorage.upload(file);
    console.log("[MediaService] Image uploaded:", originalUrl);

    // Convert file to buffer for optimization
    const buffer = await file.arrayBuffer();

    // Generate optimized variants
    const variants = await ImageOptimizer.optimizeImage(
      Buffer.from(buffer),
      originalUrl,
      metadata
    );
    console.log("[MediaService] Variants generated:", Object.keys(variants));

    return {
      originalUrl,
      variants,
      metadata,
    };
  }

  /**
   * Uploads and optimizes a video
   */
  static async uploadVideo(
    file: File,
    config?: VideoValidationConfig
  ): Promise<MediaUploadResult> {
    console.log("[MediaService] Uploading video:", file.name);

    // Validate video
    const metadata = await MediaValidator.validateVideo(file, config);
    console.log("[MediaService] Video validated:", metadata);

    // Upload to storage
    const originalUrl = await MediaStorage.upload(file);
    console.log("[MediaService] Video uploaded:", originalUrl);

    // Convert file to buffer for optimization
    const buffer = await file.arrayBuffer();

    // Generate optimized variants (placeholder for now)
    const variants = await VideoOptimizer.optimizeVideo(
      Buffer.from(buffer),
      originalUrl,
      metadata
    );
    console.log("[MediaService] Variants generated:", Object.keys(variants));

    return {
      originalUrl,
      variants,
      metadata,
    };
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
