/**
 * Security Logger - Centralized logging for security events
 */

export type SecurityEventType = 
  | 'AUTH_FAILURE'
  | 'AUTH_SUCCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_INPUT'
  | 'XSS_ATTEMPT'
  | 'CSRF_ATTEMPT'
  | 'UNAUTHORIZED_ACCESS'
  | 'PERMISSION_DENIED'
  | 'SUSPICIOUS_ACTIVITY';

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

/**
 * Log a security event
 */
export function logSecurityEvent(event: SecurityEvent) {
  const logEntry = {
    ...event,
    timestamp: event.timestamp || new Date(),
    severity: getSeverity(event.type),
  };

  // Log to console with appropriate level
  switch (logEntry.severity) {
    case 'critical':
      console.error('[SECURITY CRITICAL]', JSON.stringify(logEntry));
      break;
    case 'high':
      console.warn('[SECURITY HIGH]', JSON.stringify(logEntry));
      break;
    case 'medium':
      console.warn('[SECURITY MEDIUM]', JSON.stringify(logEntry));
      break;
    case 'low':
      console.log('[SECURITY LOW]', JSON.stringify(logEntry));
      break;
  }

  // In production, you would also send this to a logging service
  // like Sentry, Datadog, or a custom security monitoring system
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to external monitoring service
    // Example: sendToMonitoringService(logEntry);
  }
}

/**
 * Get severity level for event type
 */
function getSeverity(type: SecurityEventType): 'critical' | 'high' | 'medium' | 'low' {
  const severityMap: Record<SecurityEventType, 'critical' | 'high' | 'medium' | 'low'> = {
    'AUTH_FAILURE': 'medium',
    'AUTH_SUCCESS': 'low',
    'RATE_LIMIT_EXCEEDED': 'high',
    'INVALID_INPUT': 'low',
    'XSS_ATTEMPT': 'critical',
    'CSRF_ATTEMPT': 'critical',
    'UNAUTHORIZED_ACCESS': 'high',
    'PERMISSION_DENIED': 'medium',
    'SUSPICIOUS_ACTIVITY': 'high',
  };
  return severityMap[type] || 'low';
}

/**
 * Helper function to log authentication failures
 */
export function logAuthFailure(userId: string | undefined, ip: string, details?: Record<string, any>) {
  logSecurityEvent({
    type: 'AUTH_FAILURE',
    userId,
    ip,
    details,
    timestamp: new Date(),
  });
}

/**
 * Helper function to log rate limit exceeded
 */
export function logRateLimitExceeded(userId: string | undefined, ip: string, path: string, method: string) {
  logSecurityEvent({
    type: 'RATE_LIMIT_EXCEEDED',
    userId,
    ip,
    path,
    method,
    timestamp: new Date(),
  });
}

/**
 * Helper function to log unauthorized access attempts
 */
export function logUnauthorizedAccess(userId: string | undefined, ip: string, path: string, method: string) {
  logSecurityEvent({
    type: 'UNAUTHORIZED_ACCESS',
    userId,
    ip,
    path,
    method,
    timestamp: new Date(),
  });
}

/**
 * Helper function to log XSS attempts
 */
export function logXSSAttempt(userId: string | undefined, ip: string, path: string, details: Record<string, any>) {
  logSecurityEvent({
    type: 'XSS_ATTEMPT',
    userId,
    ip,
    path,
    details,
    timestamp: new Date(),
  });
}
