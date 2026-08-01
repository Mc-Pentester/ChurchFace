export interface ResilienceConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface HealthCheckResult {
  healthy: boolean;
  checks: Map<string, boolean>;
  timestamp: number;
}

class ResilienceService {
  private static instance: ResilienceService;
  private config: ResilienceConfig = {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  };
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private healthCheckCallbacks: Map<string, (result: HealthCheckResult) => void> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  private constructor() {
    console.log("Resilience Service initialized");
  }

  static getInstance(): ResilienceService {
    if (!ResilienceService.instance) {
      ResilienceService.instance = new ResilienceService();
    }
    return ResilienceService.instance;
  }

  setConfig(config: Partial<ResilienceConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("Resilience Service: Config updated", this.config);
  }

  getConfig(): ResilienceConfig {
    return this.config;
  }

  async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = this.config.maxRetries,
      delay = this.config.initialDelay,
      backoff = true,
      onRetry,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`Resilience Service: Attempt ${attempt}/${maxAttempts} failed:`, error);

        if (attempt < maxAttempts) {
          const waitTime = backoff 
            ? this.calculateBackoff(attempt, delay)
            : delay;

          console.log(`Resilience Service: Retrying in ${waitTime}ms...`);
          
          if (onRetry) {
            onRetry(attempt, lastError);
          }

          await this.sleep(waitTime);
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  private calculateBackoff(attempt: number, baseDelay: number): number {
    let delay = baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, this.config.maxDelay);

    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  registerHealthCheck(name: string, check: () => Promise<boolean>): void {
    this.healthChecks.set(name, check);
    console.log(`Resilience Service: Registered health check "${name}"`);
  }

  unregisterHealthCheck(name: string): void {
    this.healthChecks.delete(name);
    console.log(`Resilience Service: Unregistered health check "${name}"`);
  }

  async performHealthChecks(): Promise<HealthCheckResult> {
    const checks = new Map<string, boolean>();

    for (const [name, check] of this.healthChecks) {
      try {
        const result = await check();
        checks.set(name, result);
      } catch (error) {
        console.error(`Resilience Service: Health check "${name}" failed:`, error);
        checks.set(name, false);
      }
    }

    const allHealthy = Array.from(checks.values()).every(v => v);
    const result: HealthCheckResult = {
      healthy: allHealthy,
      checks,
      timestamp: Date.now(),
    };

    this.notifyHealthCheckCallbacks(result);
    return result;
  }

  startHealthMonitoring(interval: number = 5000): void {
    if (this.healthCheckInterval) {
      console.warn("Resilience Service: Health monitoring already running");
      return;
    }

    console.log(`Resilience Service: Starting health monitoring (interval: ${interval}ms)`);
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, interval);
  }

  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log("Resilience Service: Stopped health monitoring");
    }
  }

  onHealthCheckChange(callback: (result: HealthCheckResult) => void): string {
    const callbackId = `callback-${Date.now()}`;
    this.healthCheckCallbacks.set(callbackId, callback);
    return callbackId;
  }

  removeHealthCheckCallback(callbackId: string): void {
    this.healthCheckCallbacks.delete(callbackId);
  }

  private notifyHealthCheckCallbacks(result: HealthCheckResult): void {
    for (const callback of this.healthCheckCallbacks.values()) {
      callback(result);
    }
  }

  registerCircuitBreaker(
    name: string,
    threshold: number = 5,
    timeout: number = 60000
  ): CircuitBreaker {
    const breaker = new CircuitBreaker(name, threshold, timeout);
    this.circuitBreakers.set(name, breaker);
    console.log(`Resilience Service: Registered circuit breaker "${name}"`);
    return breaker;
  }

  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }

  async executeWithCircuitBreaker<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const breaker = this.circuitBreakers.get(name);
    
    if (!breaker) {
      return fn();
    }

    if (breaker.isOpen()) {
      throw new Error(`Circuit breaker "${name}" is open`);
    }

    try {
      const result = await fn();
      breaker.recordSuccess();
      return result;
    } catch (error) {
      breaker.recordFailure();
      throw error;
    }
  }

  cleanup(): void {
    this.stopHealthMonitoring();
    this.healthChecks.clear();
    this.healthCheckCallbacks.clear();
    this.circuitBreakers.clear();
    console.log("Resilience Service cleaned up");
  }
}

class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    public name: string,
    private threshold: number,
    private timeout: number
  ) {}

  recordSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = "open";
      console.warn(`Circuit breaker "${this.name}" opened after ${this.failures} failures`);
    }
  }

  isOpen(): boolean {
    if (this.state === "closed") {
      return false;
    }

    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "half-open";
        console.log(`Circuit breaker "${this.name}" moved to half-open`);
        return false;
      }
      return true;
    }

    return false;
  }

  getState(): "closed" | "open" | "half-open" {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }
}

export const resilienceService = ResilienceService.getInstance();
