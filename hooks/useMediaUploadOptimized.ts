/**
 * Client-side hook for optimized media upload using MediaService
 */

import { useState } from "react";
import type { MediaUploadResult } from "@/lib/media";

interface UploadProgress {
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  result?: MediaUploadResult;
  error?: string;
}

export function useMediaUploadOptimized() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<MediaUploadResult | null> => {
    const fileId = `${file.name}-${Date.now()}`;
    
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.set(fileId, {
        file,
        status: "uploading",
        progress: 0,
      });
      return newMap;
    });

    setIsUploading(true);

    try {
      // Convert file to base64 for API
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;

      // Upload to MediaService API
      const response = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: {
            base64,
            name: file.name,
            type: file.type,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();

      setUploads((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(fileId);
        if (existing) {
          newMap.set(fileId, {
            ...existing,
            status: "completed" as const,
            progress: 100,
            result,
          });
        }
        return newMap;
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      
      setUploads((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(fileId);
        if (existing) {
          newMap.set(fileId, {
            ...existing,
            status: "error" as const,
            error: errorMessage,
          });
        }
        return newMap;
      });

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<(MediaUploadResult | null)[]> => {
    const uploadPromises = files.map((file) => uploadFile(file));
    return Promise.all(uploadPromises);
  };

  const clearUploads = () => {
    setUploads(new Map());
    setIsUploading(false);
  };

  const removeUpload = (fileId: string) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  return {
    uploads,
    isUploading,
    uploadFile,
    uploadMultiple,
    clearUploads,
    removeUpload,
  };
}
