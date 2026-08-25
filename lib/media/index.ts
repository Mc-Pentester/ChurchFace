/**
 * Media Module for ChurchFace
 * Centralized media handling with optimization and storage abstraction
 */

// Types
export type {
  MediaKind,
  MediaVariant,
  ImageFormat,
  VideoFormat,
  MediaDimensions,
  MediaMetadata,
  OptimizedMedia,
  MediaUploadResult,
  MediaValidationConfig,
  ImageValidationConfig,
  VideoValidationConfig,
} from "./MediaTypes";

export {
  DEFAULT_IMAGE_CONFIG,
  DEFAULT_VIDEO_CONFIG,
  IMAGE_VARIANTS,
} from "./MediaTypes";

// Validation
export { MediaValidator, MediaValidationError } from "./MediaValidation";

// Optimization
export { ImageOptimizer } from "./ImageOptimizer";
export { VideoOptimizer } from "./VideoOptimizer";

// Storage
export { MediaStorage, type StorageBackend } from "./MediaStorage";

// Service
export { MediaService, uploadImage, uploadVideo, uploadMedia } from "./MediaService";
