/**
 * Media Validation for ChurchFace
 * Validates uploaded files for security and constraints
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
   * Validates an image file
   */
  static async validateImage(
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

    // Get image dimensions
    const dimensions = await this.getImageDimensions(file);

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
   * Validates a video file
   */
  static async validateVideo(
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

    // Get video duration
    const duration = await this.getVideoDuration(file);

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
   * Gets image dimensions without loading the entire file
   */
  private static async getImageDimensions(file: File): Promise<{
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
   * Gets video duration
   */
  private static async getVideoDuration(file: File): Promise<number> {
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
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".")
      .replace(/^\.+/, "");
  }
}
