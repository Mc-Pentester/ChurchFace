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

export class ImageOptimizer {
  /**
   * Optimizes an image and generates variants
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
      variants[variant] = await this.generateVariant(
        buffer,
        variant,
        dimensions.width,
        dimensions.height,
        originalUrl,
        metadata
      );
    }

    return variants;
  }

  /**
   * Generates a single image variant
   */
  private static async generateVariant(
    buffer: Buffer,
    variant: MediaVariant,
    targetWidth: number,
    targetHeight: number,
    originalUrl: string,
    metadata: MediaMetadata
  ): Promise<OptimizedMedia> {
    let sharpInstance = sharp(buffer);

    // Resize maintaining aspect ratio
    sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });

    // Convert to WebP for better compression
    sharpInstance = sharpInstance.webp({
      quality: this.getQualityForVariant(variant),
      effort: 4, // Balance between speed and compression
    });

    const optimizedBuffer = await sharpInstance.toBuffer();

    return {
      url: this.buildVariantUrl(originalUrl, variant),
      kind: "IMAGE",
      variant,
      dimensions: {
        width: targetWidth,
        height: targetHeight,
      },
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
   * Builds a variant URL from the original URL
   * This is a placeholder - actual implementation depends on storage backend
   */
  private static buildVariantUrl(originalUrl: string, variant: MediaVariant): string {
    // For now, append variant to URL as query parameter
    // In production, this would use a CDN or storage service that supports variants
    const url = new URL(originalUrl);
    url.searchParams.set("variant", variant);
    return url.toString();
  }

  /**
   * Generates a thumbnail from an image
   */
  static async generateThumbnail(
    buffer: Buffer,
    originalUrl: string
  ): Promise<OptimizedMedia> {
    const { width, height } = IMAGE_VARIANTS.thumbnail;
    let sharpInstance = sharp(buffer);

    sharpInstance = sharpInstance
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 70, effort: 4 });

    const optimizedBuffer = await sharpInstance.toBuffer();

    return {
      url: this.buildVariantUrl(originalUrl, "thumbnail"),
      kind: "IMAGE",
      variant: "thumbnail",
      dimensions: { width, height },
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
