import crypto from 'crypto';

/**
 * Generate a unique stream ID
 */
export function generateStreamId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate a secure stream key using crypto.randomBytes
 */
export function generateStreamKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate RTMP URL for ChurchFace
 */
export function generateRtmpUrl(serverUrl: string, streamKey: string): string {
  return `rtmp://${serverUrl}/live/${streamKey}`;
}

/**
 * Generate RTMPS URL for ChurchFace
 */
export function generateRtmpsUrl(serverUrl: string, streamKey: string): string {
  return `rtmps://${serverUrl}/live/${streamKey}`;
}

/**
 * Generate playback URL for ChurchFace
 */
export function generatePlaybackUrl(serverUrl: string, streamId: string): string {
  return `https://${serverUrl}/play/${streamId}`;
}

/**
 * Generate LiveKit room name
 */
export function generateLiveKitRoom(broadcastId: string): string {
  return `broadcast_${broadcastId}`;
}

/**
 * Generate ingest URL
 */
export function generateIngestUrl(serverUrl: string, streamId: string): string {
  return `rtmp://${serverUrl}/ingest/${streamId}`;
}

/**
 * Generate all stream identifiers for a broadcast
 */
export function generateStreamIdentifiers(serverUrl: string, broadcastId: string) {
  const streamId = generateStreamId();
  const streamKey = generateStreamKey();
  const liveKitRoom = generateLiveKitRoom(broadcastId);

  return {
    streamId,
    streamKey,
    ingestUrl: generateIngestUrl(serverUrl, streamId),
    playbackUrl: generatePlaybackUrl(serverUrl, streamId),
    rtmpUrl: generateRtmpUrl(serverUrl, streamKey),
    rtmpsUrl: generateRtmpsUrl(serverUrl, streamKey),
    liveKitRoom,
  };
}

/**
 * Regenerate stream key (invalidates old key)
 */
export function regenerateStreamKey(): string {
  return generateStreamKey();
}
