/**
 * Media Types for ChurchFace
 * Centralized type definitions for media handling
 */

export type MediaKind = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT";

export type MediaVariant = "thumbnail" | "small" | "medium" | "large" | "original";

export type ImageFormat = "JPEG" | "PNG" | "WebP" | "AVIF";

export type VideoFormat = "MP4" | "WebM";

export interface MediaDimensions {
  width: number;
  height: number;
}

export interface MediaMetadata {
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  mimeType?: string;
  format?: ImageFormat | VideoFormat;
}

export interface OptimizedMedia {
  url: string;
  kind: MediaKind;
  variant: MediaVariant;
  dimensions?: MediaDimensions;
  size?: number;
  mimeType?: string;
  buffer?: Buffer; // For variant uploads
}

export interface MediaUploadResult {
  originalUrl: string;
  variants: Partial<Record<MediaVariant, OptimizedMedia>>;
  metadata: MediaMetadata;
}

export interface MediaValidationConfig {
  maxFileSize: number;
  maxWidth?: number;
  maxHeight?: number;
  allowedFormats: ImageFormat[];
  allowedMimeTypes: string[];
}

export interface ImageValidationConfig extends MediaValidationConfig {
  maxFileSize: number;
  maxWidth: number;
  maxHeight: number;
  allowedFormats: ImageFormat[];
  allowedMimeTypes: string[];
}

export interface VideoValidationConfig {
  maxFileSize: number;
  maxDuration?: number;
  allowedFormats: VideoFormat[];
  allowedMimeTypes: string[];
}

export const DEFAULT_IMAGE_CONFIG: ImageValidationConfig = {
  maxFileSize: 8 * 1024 * 1024, // 8MB
  maxWidth: 4096,
  maxHeight: 4096,
  allowedFormats: ["JPEG", "PNG", "WebP"],
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
};

export const DEFAULT_VIDEO_CONFIG: VideoValidationConfig = {
  maxFileSize: 64 * 1024 * 1024, // 64MB
  maxDuration: 3600, // 1 hour
  allowedFormats: ["MP4", "WebM"],
  allowedMimeTypes: [
    "video/mp4",
    "video/webm",
  ],
};

export const IMAGE_VARIANTS = {
  thumbnail: { width: 200, height: 200 },
  small: { width: 400, height: 400 },
  medium: { width: 800, height: 800 },
  large: { width: 1200, height: 1200 },
  original: { width: 4096, height: 4096 },
} as const satisfies Record<MediaVariant, { width: number; height: number }>;
