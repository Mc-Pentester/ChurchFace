export type ErrorSeverity = "info" | "warning" | "error" | "critical";
export type ErrorCategory = "connection" | "device" | "media" | "network" | "permission" | "unknown";

export interface StudioError {
  id: string;
  timestamp: Date;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  details?: string;
  recoverable: boolean;
  action?: string;
  resolved: boolean;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: StudioError[] = [];
  private maxErrors = 100;
  private listeners: ((error: StudioError) => void)[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addError(
    severity: ErrorSeverity,
    category: ErrorCategory,
    message: string,
    details?: string,
    recoverable: boolean = true,
    action?: string
  ): StudioError {
    const error: StudioError = {
      id: this.generateId(),
      timestamp: new Date(),
      severity,
      category,
      message,
      details,
      recoverable,
      action,
      resolved: false,
    };

    // Add to errors list
    this.errors.push(error);

    // Keep only maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(error));

    // Log to console
    this.logError(error);

    return error;
  }

  private logError(error: StudioError): void {
    const prefix = `[${error.severity.toUpperCase()}] [${error.category.toUpperCase()}]`;
    
    switch (error.severity) {
      case "critical":
      case "error":
        console.error(prefix, error.message, error.details);
        break;
      case "warning":
        console.warn(prefix, error.message, error.details);
        break;
      case "info":
        console.info(prefix, error.message, error.details);
        break;
    }
  }

  resolveError(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrors(): StudioError[] {
    return [...this.errors];
  }

  getUnresolvedErrors(): StudioError[] {
    return this.errors.filter(e => !e.resolved);
  }

  getErrorsBySeverity(severity: ErrorSeverity): StudioError[] {
    return this.errors.filter(e => e.severity === severity);
  }

  getErrorsByCategory(category: ErrorCategory): StudioError[] {
    return this.errors.filter(e => e.category === category);
  }

  subscribe(listener: (error: StudioError) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Convenience methods for common errors
  connectionError(message: string, details?: string, recoverable: boolean = true): StudioError {
    return this.addError(
      "error",
      "connection",
      message,
      details,
      recoverable,
      recoverable ? "Vérifiez votre connexion internet" : "Rechargez la page"
    );
  }

  deviceError(message: string, details?: string, recoverable: boolean = true): StudioError {
    return this.addError(
      "warning",
      "device",
      message,
      details,
      recoverable,
      "Reconnectez le périphérique ou sélectionnez-en un autre"
    );
  }

  mediaError(message: string, details?: string, recoverable: boolean = true): StudioError {
    return this.addError(
      "error",
      "media",
      message,
      details,
      recoverable,
      "Vérifiez vos paramètres média"
    );
  }

  networkError(message: string, details?: string, recoverable: boolean = true): StudioError {
    return this.addError(
      "warning",
      "network",
      message,
      details,
      recoverable,
      "Vérifiez votre connexion réseau"
    );
  }

  permissionError(message: string, details?: string): StudioError {
    return this.addError(
      "error",
      "permission",
      message,
      details,
      false,
      "Accordez les permissions dans votre navigateur"
    );
  }
}

export const errorHandler = ErrorHandler.getInstance();
