/**
 * Media Storage Abstraction for ChurchFace
 * Provides a unified interface for storage operations
 * 
 * This abstraction allows switching between storage backends
 * without modifying business logic code.
 * 
 * Supported backends (future):
 * - UploadThing (current)
 * - AWS S3
 * - Cloudflare R2
 * - Supabase Storage
 * - Local filesystem
 */

import { uploadFiles } from "@/lib/uploadthing";

export interface StorageBackend {
  upload(file: File | Buffer, path: string, options?: StorageUploadOptions): Promise<string>;
  delete(url: string): Promise<void>;
  getUrl(path: string): string;
}

export interface StorageUploadOptions {
  contentType?: string;
  cacheControl?: string;
}

/**
 * UploadThing Storage Backend
 * Current implementation using UploadThing
 */
class UploadThingStorage implements StorageBackend {
  async upload(file: File | Buffer, path: string, options?: StorageUploadOptions): Promise<string> {
    if (!(file instanceof File)) {
      throw new Error("Buffer upload not supported by UploadThing backend");
    }

    const result = await uploadFiles("mediaUploader", {
      files: [file],
    });

    if (!result || result.length === 0) {
      throw new Error("Upload failed");
    }

    return result[0].ufsUrl || result[0].url;
  }

  async delete(url: string): Promise<void> {
    // UploadThing doesn't provide a simple delete API
    // This would require implementing their file management API
    console.warn("Delete not implemented for UploadThing backend:", url);
  }

  getUrl(path: string): string {
    return path;
  }
}

/**
 * Media Storage Manager
 * Handles storage operations with backend abstraction
 */
export class MediaStorage {
  private static backend: StorageBackend = new UploadThingStorage();

  /**
   * Sets the storage backend
   */
  static setBackend(backend: StorageBackend): void {
    this.backend = backend;
  }

  /**
   * Gets the current storage backend
   */
  static getBackend(): StorageBackend {
    return this.backend;
  }

  /**
   * Uploads a file to storage
   */
  static async upload(file: File | Buffer, path?: string, options?: StorageUploadOptions): Promise<string> {
    const uploadPath = path || this.generatePath(file);
    return this.backend.upload(file, uploadPath, options);
  }

  /**
   * Uploads a buffer to storage (for variant uploads)
   */
  static async uploadBuffer(
    buffer: Buffer,
    path: string,
    options?: StorageUploadOptions
  ): Promise<string> {
    return this.backend.upload(buffer, path, options);
  }

  /**
   * Uploads multiple files to storage
   */
  static async uploadMultiple(
    files: (File | Buffer)[],
    basePath?: string,
    options?: StorageUploadOptions
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const path = basePath
        ? `${basePath}/${index}`
        : this.generatePath(file);
      return this.backend.upload(file, path, options);
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Deletes a file from storage
   */
  static async delete(url: string): Promise<void> {
    return this.backend.delete(url);
  }

  /**
   * Deletes multiple files from storage
   */
  static async deleteMultiple(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.backend.delete(url)));
  }

  /**
   * Gets a public URL for a file
   */
  static getUrl(path: string): string {
    return this.backend.getUrl(path);
  }

  /**
   * Generates a unique path for a file
   */
  private static generatePath(file: File | Buffer): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);

    if (file instanceof File) {
      const extension = file.name.split(".").pop();
      return `media/${timestamp}-${random}.${extension}`;
    }

    return `media/${timestamp}-${random}`;
  }

  /**
   * Checks if a URL is from the current storage backend
   */
  static isOwnUrl(url: string): boolean {
    // Check if URL is from UploadThing
    return url.includes("uploadthing.com") || url.includes("ufs");
  }

  /**
   * Extracts the file key from a URL
   */
  static extractKey(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }
}

/**
 * Future: S3 Storage Backend
 * Uncomment when implementing S3 support
 */
/*
class S3Storage implements StorageBackend {
  private s3Client: any;

  constructor(config: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  }) {
    // Initialize S3 client
  }

  async upload(file: File | Buffer, path: string): Promise<string> {
    // Implement S3 upload
    return "";
  }

  async delete(url: string): Promise<void> {
    // Implement S3 delete
  }

  getUrl(path: string): string {
    // Return S3 URL
    return "";
  }
}
*/

/**
 * Future: Cloudflare R2 Storage Backend
 * Uncomment when implementing R2 support
 */
/*
class R2Storage implements StorageBackend {
  async upload(file: File | Buffer, path: string): Promise<string> {
    // Implement R2 upload
    return "";
  }

  async delete(url: string): Promise<void> {
    // Implement R2 delete
  }

  getUrl(path: string): string {
    // Return R2 URL
    return "";
  }
}
*/
