import { BroadcastProviderRegistry } from './provider';
import { YouTubeProvider } from './providers/youtube';
import { FacebookProvider } from './providers/facebook';
import { TwitchProvider } from './providers/twitch';
import { RTMPProvider } from './providers/rtmp';

/**
 * Initialize and register all broadcast providers
 * Call this once at application startup
 */
export function initializeBroadcastProviders(): void {
  if (BroadcastProviderRegistry.has('YOUTUBE')) {
    return; // Already initialized
  }

  BroadcastProviderRegistry.register(new YouTubeProvider());
  BroadcastProviderRegistry.register(new FacebookProvider());
  BroadcastProviderRegistry.register(new TwitchProvider());
  BroadcastProviderRegistry.register(new RTMPProvider());
}

/**
 * Get all registered providers
 */
export function getRegisteredProviders() {
  initializeBroadcastProviders();
  return BroadcastProviderRegistry.getAll();
}

/**
 * Get a specific provider by platform
 */
export function getProvider(platform: string) {
  initializeBroadcastProviders();
  return BroadcastProviderRegistry.get(platform);
}
