/**
 * Image Optimizer for ChurchFace
 * Optimizes images using sharp for better performance
 */

import sharp from "sharp";
import type {
  MediaVariant,
  OptimizedMedia,
  MediaMetadata,
  ImageFormat,
} from "./MediaTypes";
import { IMAGE_VARIANTS } from "./MediaTypes";

export interface OptimizedVariant {
  variant: MediaVariant;
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

export class ImageOptimizer {
  /**
   * Optimizes an image and generates variants
   * Returns buffers for each variant to be uploaded separately
   */
  static async optimizeImage(
    buffer: Buffer,
    originalUrl: string,
    metadata: MediaMetadata
  ): Promise<Record<MediaVariant, OptimizedMedia>> {
    const variants: Record<MediaVariant, OptimizedMedia> = {} as any;

    // Generate each variant
    for (const [variantName, dimensions] of Object.entries(IMAGE_VARIANTS)) {
      const variant = variantName as MediaVariant;

      // Skip original - it's already uploaded
      if (variant === "original") {
        variants[variant] = {
          url: originalUrl,
          kind: "IMAGE",
          variant,
          dimensions: {
            width: metadata.width || 0,
            height: metadata.height || 0,
          },
          size: buffer.length,
          mimeType: metadata.mimeType || "image/jpeg",
        };
        continue;
      }

      const optimized = await this.generateVariant(
        buffer,
        variant,
        dimensions.width,
        dimensions.height,
        metadata
      );

      variants[variant] = {
        url: "", // Will be filled by MediaService after upload
        kind: "IMAGE",
        variant,
        dimensions: {
          width: optimized.width,
          height: optimized.height,
        },
        size: optimized.size,
        mimeType: optimized.mimeType,
        buffer: optimized.buffer, // Include buffer for upload
      };
    }

    return variants;
  }

  /**
   * Generates a single image variant with actual dimensions
   */
  private static async generateVariant(
    buffer: Buffer,
    variant: MediaVariant,
    targetWidth: number,
    targetHeight: number,
    metadata: MediaMetadata
  ): Promise<OptimizedVariant> {
    let sharpInstance = sharp(buffer);

    // Get original metadata for aspect ratio
    const originalMetadata = await sharp(buffer).metadata();
    const originalWidth = originalMetadata.width || targetWidth;
    const originalHeight = originalMetadata.height || targetHeight;

    // Calculate actual dimensions maintaining aspect ratio
    let actualWidth = targetWidth;
    let actualHeight = targetHeight;

    if (variant === "thumbnail") {
      // Thumbnail uses cover fit (square)
      sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
        fit: "cover",
        position: "center",
      });
    } else {
      // Other variants use inside fit (maintain aspect ratio)
      sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });

      // Get actual dimensions after resize
      const resizedMetadata = await sharpInstance.metadata();
      actualWidth = resizedMetadata.width || targetWidth;
      actualHeight = resizedMetadata.height || targetHeight;
    }

    // Convert to WebP for better compression
    sharpInstance = sharpInstance.webp({
      quality: this.getQualityForVariant(variant),
      effort: 4,
    });

    const optimizedBuffer = await sharpInstance.toBuffer();

    return {
      variant,
      buffer: optimizedBuffer,
      width: actualWidth,
      height: actualHeight,
      size: optimizedBuffer.length,
      mimeType: "image/webp",
    };
  }

  /**
   * Gets quality setting for a variant
   */
  private static getQualityForVariant(variant: MediaVariant): number {
    const qualityMap: Record<MediaVariant, number> = {
      thumbnail: 70,
      small: 75,
      medium: 80,
      large: 85,
      original: 90,
    };

    return qualityMap[variant];
  }

  /**
   * Generates a thumbnail from an image
   */
  static async generateThumbnail(
    buffer: Buffer
  ): Promise<OptimizedVariant> {
    const { width, height } = IMAGE_VARIANTS.thumbnail;
    let sharpInstance = sharp(buffer);

    sharpInstance = sharpInstance
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 70, effort: 4 });

    const optimizedBuffer = await sharpInstance.toBuffer();
    const metadata = await sharp(optimizedBuffer).metadata();

    return {
      variant: "thumbnail",
      buffer: optimizedBuffer,
      width: metadata.width || width,
      height: metadata.height || height,
      size: optimizedBuffer.length,
      mimeType: "image/webp",
    };
  }

  /**
   * Converts image to a specific format
   */
  static async convertFormat(
    buffer: Buffer,
    format: ImageFormat,
    quality: number = 80
  ): Promise<Buffer> {
    let sharpInstance = sharp(buffer);

    switch (format) {
      case "WebP":
        sharpInstance = sharpInstance.webp({ quality, effort: 4 });
        break;
      case "JPEG":
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case "PNG":
        sharpInstance = sharpInstance.png({ compressionLevel: 9 });
        break;
      case "AVIF":
        sharpInstance = sharpInstance.avif({ quality, effort: 4 });
        break;
    }

    return sharpInstance.toBuffer();
  }

  /**
   * Removes metadata from image (EXIF, etc.)
   */
  static async stripMetadata(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).toBuffer();
  }

  /**
   * Gets image metadata
   */
  static async getMetadata(buffer: Buffer): Promise<MediaMetadata> {
    const metadata = await sharp(buffer).metadata();

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format as ImageFormat,
      mimeType: `image/${metadata.format}`,
      size: buffer.length,
    };
  }
}
