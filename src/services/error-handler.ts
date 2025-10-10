/**
 * Production-grade Error Handler Service
 * エラーハンドリングとロギングシステム
 */

import { ErrorType, ErrorSeverity, AppError, Result } from '@/types';

/**
 * Error messages in Japanese for user-friendly experience
 */
const USER_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.VALIDATION]: 'データの検証エラーが発生しました。入力内容をご確認ください。',
  [ErrorType.GENERATION]: 'ノートの生成中にエラーが発生しました。もう一度お試しください。',
  [ErrorType.RENDERING]: '表示エラーが発生しました。ページを再読み込みしてください。',
  [ErrorType.DATA_LOADING]: 'データの読み込みに失敗しました。接続をご確認ください。',
  [ErrorType.PRINT]: '印刷の準備中にエラーが発生しました。設定をご確認ください。',
  [ErrorType.UNKNOWN]: '予期しないエラーが発生しました。管理者にお問い合わせください。',
};

/**
 * Global error handler service
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: AppError[] = [];
  private listeners: Array<(error: AppError) => void> = [];
  private maxErrors = 100;
  private errorFrequency: Map<string, number> = new Map();

  private constructor() {
    this.setupGlobalHandlers();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Window error handler
    window.addEventListener('error', (event) => {
      this.handleError(ErrorType.UNKNOWN, ErrorSeverity.HIGH, event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(ErrorType.UNKNOWN, ErrorSeverity.HIGH, 'Unhandled Promise Rejection', {
        reason: event.reason,
      });
      event.preventDefault();
    });
  }

  /**
   * Handle error with context
   */
  public handleError(
    type: ErrorType,
    severity: ErrorSeverity,
    message: string,
    context?: Record<string, unknown>
  ): AppError {
    const error: AppError = {
      name: `${type}Error`,
      type,
      severity,
      message,
      userMessage: this.getUserMessage(type, severity),
      stack: new Error().stack,
      context,
      timestamp: new Date().toISOString(),
    };

    // Track error frequency
    this.trackErrorFrequency(error);

    // Store error
    this.storeError(error);

    // Notify listeners
    this.notifyListeners(error);

    // Log based on severity
    this.logError(error);

    // Critical errors need immediate attention
    if (severity === ErrorSeverity.CRITICAL) {
      this.handleCriticalError(error);
    }

    return error;
  }

  /**
   * Track error frequency for patterns
   */
  private trackErrorFrequency(error: AppError): void {
    const key = `${error.type}-${error.message}`;
    const count = this.errorFrequency.get(key) || 0;
    this.errorFrequency.set(key, count + 1);

    // Alert on repeated errors
    if (count > 5) {
      console.warn(`エラーが繰り返し発生しています: ${key} (${count}回)`);
    }
  }

  /**
   * Get user-friendly message
   */
  private getUserMessage(type: ErrorType, severity: ErrorSeverity): string {
    const baseMessage = USER_MESSAGES[type];

    if (severity === ErrorSeverity.CRITICAL) {
      return `【重要】${baseMessage} アプリケーションを再起動してください。`;
    }

    return baseMessage;
  }

  /**
   * Store error with size limit
   */
  private storeError(error: AppError): void {
    this.errors.push(error);

    // Maintain size limit
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  /**
   * Notify error listeners
   */
  private notifyListeners(error: AppError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Log error based on severity
   */
  private logError(error: AppError): void {
    const formattedError = this.formatError(error);

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(formattedError);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(formattedError);
        break;
      case ErrorSeverity.LOW:
        console.info(formattedError);
        break;
    }
  }

  /**
   * Format error for logging
   */
  private formatError(error: AppError): string {
    const lines = [
      `[${error.severity.toUpperCase()}] ${error.type}`,
      `Message: ${error.message}`,
      `User Message: ${error.userMessage}`,
      `Time: ${error.timestamp}`,
    ];

    if (error.context) {
      lines.push(`Context: ${JSON.stringify(error.context, null, 2)}`);
    }

    if (error.stack && process.env['NODE_ENV'] !== 'production') {
      lines.push(`Stack: ${this.sanitizeStack(error.stack)}`);
    }

    return lines.join('\n');
  }

  /**
   * Sanitize stack trace for privacy
   */
  private sanitizeStack(stack: string): string {
    // Remove file paths and sensitive information
    return stack
      .replace(/file:\/\/.*?\/([^\/\s]+)$/gm, '$1')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, 'xxx.xxx.xxx.xxx')
      .replace(/:[0-9]+:[0-9]+/g, ':xx:xx');
  }

  /**
   * Handle critical errors
   */
  private handleCriticalError(error: AppError): void {
    // Show user notification
    this.showErrorNotification(error);

    // Send to monitoring service (if configured)
    this.sendToMonitoring(error);

    // Attempt recovery
    this.attemptRecovery(error);
  }

  /**
   * Show error notification to user
   */
  private showErrorNotification(error: AppError): void {
    // Check if notification element exists
    let notification = document.getElementById('error-notification');

    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'error-notification';
      notification.className = 'error-notification';
      document.body.appendChild(notification);
    }

    notification.innerHTML = `
      <div class="error-notification__content">
        <strong>エラーが発生しました</strong>
        <p>${error.userMessage}</p>
        <button onclick="this.parentElement.parentElement.remove()">閉じる</button>
      </div>
    `;

    // Auto-remove after 10 seconds
    setTimeout(() => {
      notification?.remove();
    }, 10000);
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoring(error: AppError): void {
    // In production, this would send to a real monitoring service
    if (process.env['NODE_ENV'] === 'production') {
      // Example: Sentry, LogRocket, etc.
      console.log('Sending error to monitoring:', error);
    }
  }

  /**
   * Attempt automatic recovery
   */
  private attemptRecovery(error: AppError): void {
    switch (error.type) {
      case ErrorType.RENDERING:
        // Try to re-render
        window.location.reload();
        break;
      case ErrorType.DATA_LOADING:
        // Retry data loading
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        break;
      default:
        // No automatic recovery
        break;
    }
  }

  /**
   * Subscribe to error events
   */
  public subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get error history
   */
  public getErrors(filter?: {
    type?: ErrorType;
    severity?: ErrorSeverity;
    since?: Date;
  }): AppError[] {
    let filtered = [...this.errors];

    if (filter?.type) {
      filtered = filtered.filter((e) => e.type === filter.type);
    }

    if (filter?.severity) {
      filtered = filtered.filter((e) => e.severity === filter.severity);
    }

    if (filter?.since) {
      const sinceTime = filter.since.getTime();
      filtered = filtered.filter((e) => new Date(e.timestamp).getTime() >= sinceTime);
    }

    return filtered;
  }

  /**
   * Clear error history
   */
  public clearErrors(): void {
    this.errors = [];
    this.errorFrequency.clear();
  }

  /**
   * Get error statistics
   */
  public getStatistics(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    frequentErrors: Array<{ key: string; count: number }>;
  } {
    const stats = {
      total: this.errors.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      frequentErrors: [] as Array<{ key: string; count: number }>,
    };

    // Count by type and severity
    this.errors.forEach((error) => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    // Get frequent errors
    stats.frequentErrors = Array.from(this.errorFrequency.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }

  /**
   * Wrap function with error handling
   */
  public wrapAsync<T>(
    fn: (...args: any[]) => Promise<T>,
    errorType: ErrorType = ErrorType.UNKNOWN
  ): (...args: any[]) => Promise<Result<T>> {
    return async (...args: any[]): Promise<Result<T>> => {
      try {
        const data = await fn(...args);
        return { success: true, data };
      } catch (error) {
        const appError = this.handleError(
          errorType,
          ErrorSeverity.MEDIUM,
          error instanceof Error ? error.message : 'Unknown error',
          { args, originalError: error }
        );
        return { success: false, error: appError };
      }
    };
  }

  /**
   * Wrap synchronous function with error handling
   */
  public wrap<T>(
    fn: (...args: any[]) => T,
    errorType: ErrorType = ErrorType.UNKNOWN
  ): (...args: any[]) => Result<T> {
    return (...args: any[]): Result<T> => {
      try {
        const data = fn(...args);
        return { success: true, data };
      } catch (error) {
        const appError = this.handleError(
          errorType,
          ErrorSeverity.MEDIUM,
          error instanceof Error ? error.message : 'Unknown error',
          { args, originalError: error }
        );
        return { success: false, error: appError };
      }
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
