/**
 * Production-grade Error Handler
 * Centralized error handling with proper logging and user-friendly messages
 */

import type { ApplicationError, LogLevel } from '../types/index.js';

export class ErrorHandler {
  private readonly context: string;
  private readonly maxStackTraceLength = 1000;
  private readonly errorCounts = new Map<string, number>();

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Handle and transform errors with proper context
   */
  public handleError(error: unknown, context?: Record<string, unknown>): ApplicationError {
    const appError = this.createApplicationError(error, context);

    // Log the error
    this.logError(appError);

    // Track error frequency
    this.trackErrorFrequency(appError.code);

    // Report to monitoring service in production
    if (this.isProduction()) {
      this.reportToMonitoring(appError);
    }

    return appError;
  }

  /**
   * Create standardized application error
   */
  private createApplicationError(
    error: unknown,
    context?: Record<string, unknown>
  ): ApplicationError {
    const timestamp = new Date().toISOString();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

    if (error instanceof Error) {
      return {
        name: error.name,
        message: this.getUserFriendlyMessage(error),
        code: this.generateErrorCode(error),
        severity: this.determineSeverity(error),
        context: {
          ...context,
          originalMessage: error.message,
          handlerContext: this.context,
        },
        userAgent,
        timestamp,
        stack: this.sanitizeStackTrace(error.stack),
      };
    }

    // Handle non-Error objects
    return {
      name: 'UnknownError',
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      severity: 'medium',
      context: {
        ...context,
        originalError: String(error),
        handlerContext: this.context,
      },
      userAgent,
      timestamp,
      stack: new Error().stack?.slice(0, this.maxStackTraceLength),
    };
  }

  /**
   * Generate user-friendly error messages
   */
  private getUserFriendlyMessage(error: Error): string {
    const messageMap: Record<string, string> = {
      // Network errors
      NetworkError: 'インターネット接続を確認してください',
      TypeError: '入力データに問題があります',

      // Validation errors
      ValidationError: '入力内容を確認してください',
      RangeError: '設定値が適切な範囲にありません',

      // Print errors
      PrintError: '印刷中にエラーが発生しました',
      LayoutError: 'レイアウトの生成に失敗しました',

      // Permission errors
      SecurityError: 'アクセス権限がありません',
      NotAllowedError: 'この操作は許可されていません',

      // Resource errors
      QuotaExceededError: 'ストレージ容量が不足しています',
      MemoryError: 'メモリ不足です。ページを再読み込みしてください',
    };

    // Check for specific error patterns
    if (error.message.includes('fetch')) {
      return 'サーバーとの通信に失敗しました';
    }

    if (error.message.includes('localStorage')) {
      return 'ブラウザのストレージにアクセスできません';
    }

    if (error.message.includes('print')) {
      return '印刷機能が利用できません';
    }

    return messageMap[error.name] || error.message || '予期しないエラーが発生しました';
  }

  /**
   * Generate structured error code
   */
  private generateErrorCode(error: Error): string {
    const prefix = this.context.toUpperCase();
    const errorType = error.name.toUpperCase();
    const hash = this.hashString(error.message).toString(16).slice(0, 4);

    return `${prefix}_${errorType}_${hash}`;
  }

  /**
   * Determine error severity based on error type and context
   */
  private determineSeverity(error: Error): ApplicationError['severity'] {
    // Critical errors that break core functionality
    const criticalErrors = ['ReferenceError', 'SyntaxError', 'SecurityError'];

    // High severity errors that impact user experience
    const highSeverityErrors = ['TypeError', 'RangeError', 'NetworkError', 'PrintError'];

    // Medium severity errors that are recoverable
    const mediumSeverityErrors = ['ValidationError', 'LayoutError'];

    if (criticalErrors.includes(error.name)) {
      return 'critical';
    }

    if (highSeverityErrors.includes(error.name)) {
      return 'high';
    }

    if (mediumSeverityErrors.includes(error.name)) {
      return 'medium';
    }

    // Check message content for severity clues
    if (error.message.includes('failed') || error.message.includes('cannot')) {
      return 'high';
    }

    return 'low';
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: ApplicationError): void {
    const logLevel: LogLevel = this.severityToLogLevel(error.severity);

    if (typeof console !== 'undefined') {
      const logMethod = console[logLevel] || console.error;

      logMethod.call(console, `[${error.code}] ${error.message}`, {
        context: error.context,
        timestamp: error.timestamp,
        severity: error.severity,
        stack: error.stack,
      });
    }
  }

  /**
   * Track error frequency for monitoring
   */
  private trackErrorFrequency(errorCode: string): void {
    const count = this.errorCounts.get(errorCode) || 0;
    this.errorCounts.set(errorCode, count + 1);

    // Alert if error frequency is high
    if (count > 5) {
      console.warn(`High frequency error detected: ${errorCode} (${count} occurrences)`);
    }
  }

  /**
   * Report to external monitoring service
   */
  private reportToMonitoring(error: ApplicationError): void {
    // In a real production environment, this would send to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom monitoring endpoints

    if (this.shouldReportError(error)) {
      // Example: Send to monitoring API
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.serializeError(error))
      // }).catch(() => {}); // Silently fail to avoid recursive errors
    }
  }

  /**
   * Determine if error should be reported to external services
   */
  private shouldReportError(error: ApplicationError): boolean {
    // Don't report low severity errors in production
    if (error.severity === 'low') {
      return false;
    }

    // Don't report if we've seen this error too many times recently
    const count = this.errorCounts.get(error.code) || 0;
    if (count > 10) {
      return false;
    }

    return true;
  }

  /**
   * Serialize error for transmission
   */
  private serializeError(error: ApplicationError): Record<string, unknown> {
    return {
      code: error.code,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp,
      userAgent: error.userAgent,
      context: error.context,
      // Don't include full stack trace in production logs
      stackHash: this.hashString(error.stack || ''),
    };
  }

  /**
   * Utility methods
   */
  private severityToLogLevel(severity: ApplicationError['severity']): LogLevel {
    const map: Record<ApplicationError['severity'], LogLevel> = {
      low: 'info',
      medium: 'warn',
      high: 'error',
      critical: 'error',
    };
    return map[severity];
  }

  private isProduction(): boolean {
    return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
  }

  private sanitizeStackTrace(stack?: string): string | undefined {
    if (!stack) return undefined;

    // Remove sensitive information and limit length
    return stack
      .replace(/file:\/\/\/.*?\/([^\/]+\.js)/g, '$1') // Remove file paths
      .slice(0, this.maxStackTraceLength);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Create error boundary for components
   */
  public static createErrorBoundary(
    component: () => void,
    fallback: (error: ApplicationError) => void,
    context?: string
  ): () => void {
    const handler = new ErrorHandler(context || 'ErrorBoundary');

    return () => {
      try {
        component();
      } catch (error) {
        const appError = handler.handleError(error);
        fallback(appError);
      }
    };
  }

  /**
   * Async error boundary wrapper
   */
  public static async safeAsync<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<{ success: true; data: T } | { success: false; error: ApplicationError }> {
    const handler = new ErrorHandler(context || 'AsyncOperation');

    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const appError = handler.handleError(error);
      return { success: false, error: appError };
    }
  }
}
