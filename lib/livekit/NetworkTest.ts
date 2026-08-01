export interface NetworkTestResult {
  testId: string;
  timestamp: Date;
  testName: string;
  passed: boolean;
  duration: number;
  details?: string;
}

export interface NetworkConditions {
  offline: boolean;
  latency: number;
  packetLoss: number;
  bandwidth: number;
}

class NetworkTest {
  private static instance: NetworkTest;
  private results: NetworkTestResult[] = [];
  private originalFetch: typeof fetch;
  private originalWebSocket: typeof WebSocket;

  private constructor() {
    this.originalFetch = window.fetch;
    this.originalWebSocket = window.WebSocket;
  }

  static getInstance(): NetworkTest {
    if (!NetworkTest.instance) {
      NetworkTest.instance = new NetworkTest();
    }
    return NetworkTest.instance;
  }

  private generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async testConnectionToServer(url: string): Promise<NetworkTestResult> {
    const testId = this.generateId();
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
      });

      const duration = Date.now() - startTime;
      const passed = response.ok;

      const result: NetworkTestResult = {
        testId,
        timestamp: new Date(),
        testName: 'Connection to Server',
        passed,
        duration,
        details: passed ? `Connected in ${duration}ms` : `Failed with status ${response.status}`,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: NetworkTestResult = {
        testId,
        timestamp: new Date(),
        testName: 'Connection to Server',
        passed: false,
        duration,
        details: (error as Error).message,
      };
      this.results.push(result);
      return result;
    }
  }

  async testLiveKitConnection(serverUrl: string): Promise<NetworkTestResult> {
    const testId = this.generateId();
    const startTime = Date.now();

    try {
      // Test WebSocket connection to LiveKit server
      const wsUrl = serverUrl.replace('https://', 'wss://').replace('http://', 'ws://');
      const ws = new WebSocket(`${wsUrl}/rtc`);
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          ws.close();
          resolve();
        };
        ws.onerror = (error) => reject(error);
        ws.onclose = () => resolve();
        
        // Timeout after 5 seconds
        setTimeout(() => {
          ws.close();
          reject(new Error('Connection timeout'));
        }, 5000);
      });

      const duration = Date.now() - startTime;
      const result: NetworkTestResult = {
        testId,
        timestamp: new Date(),
        testName: 'LiveKit WebSocket Connection',
        passed: true,
        duration,
        details: `WebSocket connected in ${duration}ms`,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: NetworkTestResult = {
        testId,
        timestamp: new Date(),
        testName: 'LiveKit WebSocket Connection',
        passed: false,
        duration,
        details: (error as Error).message,
      };
      this.results.push(result);
      return result;
    }
  }

  async testMediaDevices(): Promise<NetworkTestResult> {
    const testId = this.generateId();
    const startTime = Date.now();

    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Check tracks
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      const duration = Date.now() - startTime;
      const passed = videoTracks.length > 0 && audioTracks.length > 0;

      const result: NetworkTestResult = {
        testId,
        timestamp: new Date(),
        testName: 'Media Devices Access',
        passed,
        duration,
        details: passed 
          ? `Found ${videoTracks.length} video tracks, ${audioTracks.length} audio tracks`
          : 'Missing video or audio tracks',
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: NetworkTestResult = {
        testId,
        timestamp: new Date(),
        testName: 'Media Devices Access',
        passed: false,
        duration,
        details: (error as Error).message,
      };
      this.results.push(result);
      return result;
    }
  }

  async testBandwidth(): Promise<NetworkTestResult> {
    const testId = this.generateId();
    const startTime = Date.now();

    try {
      // Download a small file to test bandwidth
      const response = await fetch('https://www.google.com/favicon.ico', {
        cache: 'no-cache',
      });
      const blob = await response.blob();
      const size = blob.size;
      const duration = Date.now() - startTime;

      // Calculate bandwidth in Mbps
      const bandwidthMbps = (size * 8) / (duration / 1000) / 1000000;

      const result: NetworkTestResult = {
        testId,
        timestamp: new Date(),
        testName: 'Bandwidth Test',
        passed: bandwidthMbps > 0.5, // At least 0.5 Mbps
        duration,
        details: `Bandwidth: ${bandwidthMbps.toFixed(2)} Mbps`,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: NetworkTestResult = {
        testId,
        timestamp: new Date(),
        testName: 'Bandwidth Test',
        passed: false,
        duration,
        details: (error as Error).message,
      };
      this.results.push(result);
      return result;
    }
  }

  async runAllTests(serverUrl: string): Promise<NetworkTestResult[]> {
    const results: NetworkTestResult[] = [];

    // Test 1: Server connection
    results.push(await this.testConnectionToServer(window.location.origin));

    // Test 2: LiveKit connection
    if (serverUrl) {
      results.push(await this.testLiveKitConnection(serverUrl));
    }

    // Test 3: Media devices
    results.push(await this.testMediaDevices());

    // Test 4: Bandwidth
    results.push(await this.testBandwidth());

    return results;
  }

  getResults(): NetworkTestResult[] {
    return [...this.results];
  }

  clearResults(): void {
    this.results = [];
  }

  // Network simulation for testing (Chrome DevTools Network Throttling is recommended)
  simulateNetworkConditions(conditions: Partial<NetworkConditions>): void {
    console.warn('Network simulation is best done via Chrome DevTools Network Throttling');
    console.log('Recommended conditions:', conditions);
  }
}

export const networkTest = NetworkTest.getInstance();
