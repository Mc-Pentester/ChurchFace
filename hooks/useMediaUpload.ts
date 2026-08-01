"use client";

import { useState, useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  url?: string;
}

export function useMediaUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("mediaUploader", {
    onClientUploadComplete: (res: any[]) => {
      res.forEach((file: any) => {
        setUploads((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(file.name);
          if (existing) {
            newMap.set(file.name, {
              ...existing,
              status: "completed" as const,
              progress: 100,
              url: file.url,
            });
          }
          return newMap;
        });
      });
      setIsUploading(false);
    },
    onUploadProgress: (progress: any) => {
      console.log("Upload progress received:", progress);
      
      if (!progress) return;
      
      // Handle different progress formats
      let progressArray;
      if (Array.isArray(progress)) {
        progressArray = progress;
      } else if (typeof progress === 'object' && progress.file) {
        progressArray = [progress];
      } else if (typeof progress === 'number') {
        // If progress is just a number, we can't determine which file it's for
        console.log("Progress is a number, skipping:", progress);
        return;
      } else {
        console.log("Unexpected progress format:", progress);
        return;
      }
      
      progressArray.forEach((fileProgress: any) => {
        if (!fileProgress || !fileProgress.file) {
          console.log("Invalid fileProgress:", fileProgress);
          return;
        }
        
        setUploads((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(fileProgress.file.name);
          if (existing) {
            newMap.set(fileProgress.file.name, {
              ...existing,
              progress: fileProgress.progress,
            });
          }
          return newMap;
        });
      });
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      setIsUploading(false);
    },
  });

  const uploadFiles = useCallback(async (files: File[]) => {
    console.log("Starting upload for files:", files.map(f => f.name));
    setIsUploading(true);
    
    const newUploads = new Map<string, UploadProgress>();
    files.forEach((file) => {
      newUploads.set(file.name, {
        fileName: file.name,
        progress: 0,
        status: "uploading" as const,
      });
    });
    
    console.log("Setting initial uploads:", Array.from(newUploads.values()));
    setUploads((prev) => {
      const combined = new Map(prev);
      newUploads.forEach((value, key) => combined.set(key, value));
      return combined;
    });

    try {
      console.log("Calling startUpload...");
      await startUpload(files);
      console.log("startUpload completed");
    } catch (error) {
      console.error("Upload failed:", error);
      files.forEach((file) => {
        setUploads((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(file.name);
          if (existing) {
            newMap.set(file.name, {
              ...existing,
              status: "error" as const,
              error: error instanceof Error ? error.message : "Upload failed",
            });
          }
          return newMap;
        });
      });
      setIsUploading(false);
    }
  }, [startUpload]);

  const cancelUpload = useCallback((fileName: string) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileName);
      return newMap;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads((prev) => {
      const newMap = new Map();
      prev.forEach((value, key) => {
        if (value.status !== "completed") {
          newMap.set(key, value);
        }
      });
      return newMap;
    });
  }, []);

  const clearAll = useCallback(() => {
    setUploads(new Map());
  }, []);

  return {
    uploads: Array.from(uploads.values()),
    isUploading,
    uploadFiles,
    cancelUpload,
    clearCompleted,
    clearAll,
  };
}
