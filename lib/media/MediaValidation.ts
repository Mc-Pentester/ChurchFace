/**
 * Media Validation for ChurchFace
 * Validates uploaded files for security and constraints
 *
 * Server-side validation using Sharp for images
 * Client-side validation is kept for UI feedback only
 */

import type {
  ImageValidationConfig,
  VideoValidationConfig,
  MediaMetadata,
  ImageFormat,
} from "./MediaTypes";
import {
  DEFAULT_IMAGE_CONFIG,
  DEFAULT_VIDEO_CONFIG,
} from "./MediaTypes";
import sharp from "sharp";

export class MediaValidationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export class MediaValidator {
  /**
   * Validates an image file (server-side)
   */
  static async validateImage(
    file: File | Buffer,
    config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG
  ): Promise<MediaMetadata> {
    // Convert File to Buffer if needed
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

    // Check file size
    if (buffer.length > config.maxFileSize) {
      throw new MediaValidationError(
        `File size exceeds maximum of ${config.maxFileSize / 1024 / 1024}MB`,
        "FILE_TOO_LARGE"
      );
    }

    // Validate with Sharp to get real metadata
    let metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (error) {
      throw new MediaValidationError(
        "Invalid or corrupted image file",
        "IMAGE_INVALID"
      );
    }

    // Validate MIME type from Sharp metadata
    const format = metadata.format?.toLowerCase();
    const mimeType = `image/${format}`;

    if (!config.allowedMimeTypes.includes(mimeType) && !config.allowedMimeTypes.includes(`image/${format === 'jpeg' ? 'jpg' : format}`)) {
      throw new MediaValidationError(
        `Invalid image format: ${format}. Allowed: ${config.allowedMimeTypes.join(", ")}`,
        "INVALID_MIME_TYPE"
      );
    }

    // Validate file extension if File object provided
    if (file instanceof File) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension) {
        throw new MediaValidationError("File has no extension", "NO_EXTENSION");
      }

      const expectedExtensions: Record<string, string[]> = {
        "image/jpeg": ["jpg", "jpeg"],
        "image/jpg": ["jpg", "jpeg"],
        "image/png": ["png"],
        "image/webp": ["webp"],
      };

      const allowedExtensions = expectedExtensions[mimeType] || [];
      if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
        throw new MediaValidationError(
          `Extension ${extension} does not match MIME type ${mimeType}`,
          "EXTENSION_MISMATCH"
        );
      }
    }

    // Validate dimensions from Sharp metadata
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (config.maxWidth && width > config.maxWidth) {
      throw new MediaValidationError(
        `Image width ${width}px exceeds maximum ${config.maxWidth}px`,
        "IMAGE_TOO_WIDE"
      );
    }

    if (config.maxHeight && height > config.maxHeight) {
      throw new MediaValidationError(
        `Image height ${height}px exceeds maximum ${config.maxHeight}px`,
        "IMAGE_TOO_TALL"
      );
    }

    return {
      size: buffer.length,
      width,
      height,
      mimeType,
      format: this.getMimeTypeFormat(mimeType) as ImageFormat,
    };
  }

  /**
   * Validates a video file (placeholder for server-side validation)
   * Currently uses client-side validation as fallback
   * Future: Implement ffprobe integration
   */
  static async validateVideo(
    file: File | Buffer,
    config: VideoValidationConfig = DEFAULT_VIDEO_CONFIG
  ): Promise<MediaMetadata> {
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

    // Check file size
    if (buffer.length > config.maxFileSize) {
      throw new MediaValidationError(
        `File size exceeds maximum of ${config.maxFileSize / 1024 / 1024}MB`,
        "FILE_TOO_LARGE"
      );
    }

    // Validate MIME type if File object provided
    let mimeType = "video/mp4";
    if (file instanceof File) {
      mimeType = file.type.toLowerCase();

      if (!config.allowedMimeTypes.includes(mimeType)) {
        throw new MediaValidationError(
          `Invalid MIME type: ${mimeType}. Allowed: ${config.allowedMimeTypes.join(", ")}`,
          "INVALID_MIME_TYPE"
        );
      }
    }

    // Placeholder for video duration validation
    // Future: Use ffprobe to get actual duration
    const duration = 0;

    if (config.maxDuration && duration > config.maxDuration) {
      throw new MediaValidationError(
        `Video duration ${duration}s exceeds maximum ${config.maxDuration}s`,
        "VIDEO_TOO_LONG"
      );
    }

    return {
      size: buffer.length,
      duration,
      mimeType,
    };
  }

  /**
   * Client-side validation for UI feedback only
   * Uses browser APIs for immediate feedback before upload
   */
  static async validateImageClient(
    file: File,
    config: ImageValidationConfig = DEFAULT_IMAGE_CONFIG
  ): Promise<MediaMetadata> {
    // Check file size
    if (file.size > config.maxFileSize) {
      throw new MediaValidationError(
        `File size exceeds maximum of ${config.maxFileSize / 1024 / 1024}MB`,
        "FILE_TOO_LARGE"
      );
    }

    // Validate MIME type
    const mimeType = file.type.toLowerCase();
    if (!config.allowedMimeTypes.includes(mimeType)) {
      throw new MediaValidationError(
        `Invalid MIME type: ${mimeType}. Allowed: ${config.allowedMimeTypes.join(", ")}`,
        "INVALID_MIME_TYPE"
      );
    }

    // Validate file extension matches MIME type
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension) {
      throw new MediaValidationError("File has no extension", "NO_EXTENSION");
    }

    const expectedExtensions: Record<string, string[]> = {
      "image/jpeg": ["jpg", "jpeg"],
      "image/jpg": ["jpg", "jpeg"],
      "image/png": ["png"],
      "image/webp": ["webp"],
    };

    const allowedExtensions = expectedExtensions[mimeType] || [];
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
      throw new MediaValidationError(
        `Extension ${extension} does not match MIME type ${mimeType}`,
        "EXTENSION_MISMATCH"
      );
    }

    // Get image dimensions using browser API
    const dimensions = await this.getImageDimensionsClient(file);

    // Validate dimensions
    if (config.maxWidth && dimensions.width > config.maxWidth) {
      throw new MediaValidationError(
        `Image width ${dimensions.width}px exceeds maximum ${config.maxWidth}px`,
        "IMAGE_TOO_WIDE"
      );
    }

    if (config.maxHeight && dimensions.height > config.maxHeight) {
      throw new MediaValidationError(
        `Image height ${dimensions.height}px exceeds maximum ${config.maxHeight}px`,
        "IMAGE_TOO_TALL"
      );
    }

    return {
      size: file.size,
      width: dimensions.width,
      height: dimensions.height,
      mimeType,
      format: this.getMimeTypeFormat(mimeType) as ImageFormat,
    };
  }

  /**
   * Client-side video validation for UI feedback only
   */
  static async validateVideoClient(
    file: File,
    config: VideoValidationConfig = DEFAULT_VIDEO_CONFIG
  ): Promise<MediaMetadata> {
    // Check file size
    if (file.size > config.maxFileSize) {
      throw new MediaValidationError(
        `File size exceeds maximum of ${config.maxFileSize / 1024 / 1024}MB`,
        "FILE_TOO_LARGE"
      );
    }

    // Validate MIME type
    const mimeType = file.type.toLowerCase();
    if (!config.allowedMimeTypes.includes(mimeType)) {
      throw new MediaValidationError(
        `Invalid MIME type: ${mimeType}. Allowed: ${config.allowedMimeTypes.join(", ")}`,
        "INVALID_MIME_TYPE"
      );
    }

    // Get video duration using browser API
    const duration = await this.getVideoDurationClient(file);

    // Validate duration
    if (config.maxDuration && duration > config.maxDuration) {
      throw new MediaValidationError(
        `Video duration ${duration}s exceeds maximum ${config.maxDuration}s`,
        "VIDEO_TOO_LONG"
      );
    }

    return {
      size: file.size,
      duration,
      mimeType,
    };
  }

  /**
   * Client-side: Gets image dimensions (browser API only)
   */
  private static async getImageDimensionsClient(file: File): Promise<{
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new MediaValidationError("Failed to load image", "IMAGE_LOAD_ERROR"));
      };

      img.src = url;
    });
  }

  /**
   * Client-side: Gets video duration (browser API only)
   */
  private static async getVideoDurationClient(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new MediaValidationError("Failed to load video", "VIDEO_LOAD_ERROR"));
      };

      video.src = url;
    });
  }

  /**
   * Maps MIME type to format
   */
  private static getMimeTypeFormat(mimeType: string): string {
    const formatMap: Record<string, string> = {
      "image/jpeg": "JPEG",
      "image/jpg": "JPEG",
      "image/png": "PNG",
      "image/webp": "WebP",
      "image/avif": "AVIF",
      "video/mp4": "MP4",
      "video/webm": "WebM",
    };

    return formatMap[mimeType] || mimeType.split("/")[1].toUpperCase();
  }

  /**
   * Sanitizes filename to prevent path traversal
   */
  static sanitizeFilename(filename: string): string {
    // Remove directory traversal attempts
    let sanitized = filename.replace(/\.\./g, "");
    sanitized = sanitized.replace(/[\/\\]/g, "_");

    // Remove null bytes and other control characters
    sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, "");

    // Replace non-alphanumeric characters (except allowed ones)
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Remove consecutive dots
    sanitized = sanitized.replace(/\.{2,}/g, ".");

    // Remove leading dots
    sanitized = sanitized.replace(/^\.+/, "");

    // Limit length
    const maxLength = 255;
    if (sanitized.length > maxLength) {
      const ext = sanitized.split(".").pop();
      const base = sanitized.substring(0, sanitized.lastIndexOf("."));
      sanitized = base.substring(0, maxLength - (ext?.length || 0) - 1) + "." + (ext || "txt");
    }

    return sanitized || "file";
  }
}