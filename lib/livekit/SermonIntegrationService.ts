import { liveKitEgressService } from "./LiveKitEgressService";

export interface SermonMetadata {
  title: string;
  description?: string;
  speaker?: string;
  seriesId?: string;
  seriesName?: string;
  tags?: string[];
  thumbnailUrl?: string;
  publishDate?: Date;
  isPublic?: boolean;
}

export interface SermonUploadConfig {
  egressId: string;
  metadata: SermonMetadata;
  autoPublish?: boolean;
  addToPlaylist?: boolean;
  playlistId?: string;
}

export interface SermonProcessingStatus {
  egressId: string;
  status: "processing" | "uploading" | "completed" | "failed";
  progress: number;
  sermonId?: string;
  error?: string;
}

class SermonIntegrationService {
  private static instance: SermonIntegrationService;
  private processingQueue: Map<string, SermonProcessingStatus> = new Map();
  private statusCallbacks: Map<string, (status: SermonProcessingStatus) => void> = new Map();

  private constructor() {
    console.log("Sermon Integration Service initialized");
  }

  static getInstance(): SermonIntegrationService {
    if (!SermonIntegrationService.instance) {
      SermonIntegrationService.instance = new SermonIntegrationService();
    }
    return SermonIntegrationService.instance;
  }

  async processRecordingAsSermon(config: SermonUploadConfig): Promise<string> {
    console.log(`Sermon Integration: Processing recording ${config.egressId} as sermon`);

    try {
      // Update status to processing
      const status: SermonProcessingStatus = {
        egressId: config.egressId,
        status: "processing",
        progress: 0,
      };
      this.processingQueue.set(config.egressId, status);
      this.notifyStatusChange(config.egressId, status);

      // Get egress info to find the recording file
      const egressStatus = await liveKitEgressService.getEgressStatus(config.egressId);
      
      if (!egressStatus.outputPath) {
        throw new Error("Recording output path not found");
      }

      // Simulate processing steps
      await this.simulateProcessing(config.egressId);

      // Upload to sermon system
      const sermonId = await this.uploadToSermonSystem(
        egressStatus.outputPath,
        config.metadata
      );

      // Update status to completed
      const completedStatus: SermonProcessingStatus = {
        egressId: config.egressId,
        status: "completed",
        progress: 100,
        sermonId,
      };
      this.processingQueue.set(config.egressId, completedStatus);
      this.notifyStatusChange(config.egressId, completedStatus);

      // Auto-publish if requested
      if (config.autoPublish) {
        await this.publishSermon(sermonId);
      }

      // Add to playlist if requested
      if (config.addToPlaylist && config.playlistId) {
        await this.addToPlaylist(sermonId, config.playlistId);
      }

      console.log(`Sermon Integration: Successfully processed sermon ${sermonId}`);
      return sermonId;
    } catch (error) {
      console.error("Sermon Integration: Failed to process recording as sermon:", error);
      
      const errorStatus: SermonProcessingStatus = {
        egressId: config.egressId,
        status: "failed",
        progress: 0,
        error: (error as Error).message,
      };
      this.processingQueue.set(config.egressId, errorStatus);
      this.notifyStatusChange(config.egressId, errorStatus);
      
      throw error;
    }
  }

  private async simulateProcessing(egressId: string): Promise<void> {
    const steps = [
      { progress: 20, message: "Validating recording" },
      { progress: 40, message: "Extracting metadata" },
      { progress: 60, message: "Generating thumbnail" },
      { progress: 80, message: "Preparing upload" },
      { progress: 90, message: "Finalizing" },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const status = this.processingQueue.get(egressId);
      if (status) {
        status.progress = step.progress;
        this.notifyStatusChange(egressId, status);
      }
    }
  }

  private async uploadToSermonSystem(
    filePath: string,
    metadata: SermonMetadata
  ): Promise<string> {
    // In production, this would upload the file to your sermon system
    // via API or direct file upload
    
    console.log(`Sermon Integration: Uploading ${filePath} to sermon system`);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a sermon ID (in production, this would come from the API response)
    const sermonId = `sermon-${Date.now()}`;
    
    console.log(`Sermon Integration: Uploaded as sermon ${sermonId}`);
    return sermonId;
  }

  async publishSermon(sermonId: string): Promise<void> {
    console.log(`Sermon Integration: Publishing sermon ${sermonId}`);
    
    // In production, this would call the sermon API to publish
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Sermon Integration: Sermon ${sermonId} published`);
  }

  async addToPlaylist(sermonId: string, playlistId: string): Promise<void> {
    console.log(`Sermon Integration: Adding sermon ${sermonId} to playlist ${playlistId}`);
    
    // In production, this would call the sermon API to add to playlist
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Sermon Integration: Sermon ${sermonId} added to playlist ${playlistId}`);
  }

  async associateWithSeries(sermonId: string, seriesId: string): Promise<void> {
    console.log(`Sermon Integration: Associating sermon ${sermonId} with series ${seriesId}`);
    
    // In production, this would call the sermon API to associate with series
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Sermon Integration: Sermon ${sermonId} associated with series ${seriesId}`);
  }

  getProcessingStatus(egressId: string): SermonProcessingStatus | undefined {
    return this.processingQueue.get(egressId);
  }

  getAllProcessingStatuses(): SermonProcessingStatus[] {
    return Array.from(this.processingQueue.values());
  }

  onStatusChange(
    egressId: string,
    callback: (status: SermonProcessingStatus) => void
  ): void {
    this.statusCallbacks.set(egressId, callback);
  }

  removeStatusChangeCallback(egressId: string): void {
    this.statusCallbacks.delete(egressId);
  }

  private notifyStatusChange(
    egressId: string,
    status: SermonProcessingStatus
  ): void {
    const callback = this.statusCallbacks.get(egressId);
    if (callback) {
      callback(status);
    }
  }

  async cancelProcessing(egressId: string): Promise<void> {
    const status = this.processingQueue.get(egressId);
    if (status && status.status === "processing") {
      console.log(`Sermon Integration: Canceling processing for ${egressId}`);
      
      const canceledStatus: SermonProcessingStatus = {
        egressId,
        status: "failed",
        progress: status.progress,
        error: "Processing canceled by user",
      };
      
      this.processingQueue.set(egressId, canceledStatus);
      this.notifyStatusChange(egressId, canceledStatus);
    }
  }

  cleanup(): void {
    this.processingQueue.clear();
    this.statusCallbacks.clear();
    console.log("Sermon Integration Service cleaned up");
  }
}

export const sermonIntegrationService = SermonIntegrationService.getInstance();
