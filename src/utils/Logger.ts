/**
 * Production-grade Logging System
 * Structured logging with levels, context, and performance tracking
 */

import type { LogLevel, LogEntry } from '../types/index.js';

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  enablePerformanceLogging: boolean;
  enableStackTrace: boolean;
  enableTimestamps: boolean;
  environment: 'development' | 'production' | 'test';
}

export class Logger {
  private readonly config: LoggerConfig;
  private readonly storage: LogEntry[] = [];
  private readonly contextStack: string[] = [];
  private readonly performanceMarks = new Map<string, number>();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableStorage: true,
      maxStorageEntries: 1000,
      enableRemoteLogging: false,
      enablePerformanceLogging: true,
      enableStackTrace: false,
      enableTimestamps: true,
      environment: 'development',
      ...config,
    };
  }

  /**
   * Log debug message
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  public error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Create a child logger with additional context
   */
  public child(contextName: string): Logger {
    const childLogger = new Logger(this.config);
    childLogger.contextStack.push(...this.contextStack, contextName);
    return childLogger;
  }

  /**
   * Start performance timing
   */
  public startTimer(name: string): void {
    if (this.config.enablePerformanceLogging) {
      this.performanceMarks.set(name, performance.now());
      this.debug(`Timer started: ${name}`);
    }
  }

  /**
   * End performance timing and log duration
   */
  public endTimer(name: string): number {
    if (!this.config.enablePerformanceLogging) {
      return 0;
    }

    const startTime = this.performanceMarks.get(name);
    if (!startTime) {
      this.warn(`Timer not found: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.performanceMarks.delete(name);

    this.info(`Timer completed: ${name}`, { duration: `${duration.toFixed(2)}ms` });
    return duration;
  }

  /**
   * Log with execution time measurement
   */
  public timed<T>(name: string, fn: () => T): T;
  public timed<T>(name: string, fn: () => Promise<T>): Promise<T>;
  public timed<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.startTimer(name);

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result
          .then((value) => {
            this.endTimer(name);
            return value;
          })
          .catch((error) => {
            this.endTimer(name);
            this.error(`Timed operation failed: ${name}`, { error: error.message });
            throw error;
          });
      } else {
        this.endTimer(name);
        return result;
      }
    } catch (error) {
      this.endTimer(name);
      this.error(`Timed operation failed: ${name}`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Group related log entries
   */
  public group(name: string, fn: () => void): void;
  public group(name: string, fn: () => Promise<void>): Promise<void>;
  public group(name: string, fn: () => void | Promise<void>): void | Promise<void> {
    this.info(`Starting: ${name}`);
    this.contextStack.push(name);

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result
          .then(() => {
            this.contextStack.pop();
            this.info(`Completed: ${name}`);
          })
          .catch((error) => {
            this.contextStack.pop();
            this.error(`Failed: ${name}`, { error: error.message });
            throw error;
          });
      } else {
        this.contextStack.pop();
        this.info(`Completed: ${name}`);
      }
    } catch (error) {
      this.contextStack.pop();
      this.error(`Failed: ${name}`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Log structured event
   */
  public event(eventName: string, data: Record<string, unknown>): void {
    this.info(`Event: ${eventName}`, data);
  }

  /**
   * Log API call
   */
  public apiCall(method: string, url: string, status?: number, duration?: number): void {
    const context: Record<string, unknown> = { method, url };
    if (status !== undefined) context.status = status;
    if (duration !== undefined) context.duration = `${duration.toFixed(2)}ms`;

    if (status && status >= 400) {
      this.error(`API Error: ${method} ${url}`, context);
    } else {
      this.info(`API Call: ${method} ${url}`, context);
    }
  }

  /**
   * Log user interaction
   */
  public userInteraction(action: string, element?: string, data?: Record<string, unknown>): void {
    const context: Record<string, unknown> = { action };
    if (element) context.element = element;
    if (data) context.data = data;

    this.info(`User: ${action}`, context);
  }

  /**
   * Get stored log entries
   */
  public getStoredLogs(): LogEntry[] {
    return [...this.storage];
  }

  /**
   * Clear stored log entries
   */
  public clearLogs(): void {
    this.storage.length = 0;
    this.info('Log storage cleared');
  }

  /**
   * Export logs for debugging
   */
  public exportLogs(): string {
    const logs = this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Set log level dynamically
   */
  public setLevel(level: LogLevel): void {
    const oldLevel = this.config.level;
    (this.config as any).level = level;
    this.info(`Log level changed: ${oldLevel} → ${level}`);
  }

  /**
   * Enable/disable console logging
   */
  public setConsoleLogging(enabled: boolean): void {
    (this.config as any).enableConsole = enabled;
    this.info(`Console logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Flush logs to remote endpoint
   */
  public async flush(): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) {
      return;
    }

    const logs = this.getStoredLogs();
    if (logs.length === 0) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs,
          meta: {
            environment: this.config.environment,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        }),
      });

      this.clearLogs();
      this.debug('Logs flushed to remote endpoint');
    } catch (error) {
      this.error('Failed to flush logs to remote endpoint', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    // Check if level meets threshold
    if (!this.shouldLog(level)) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      level,
      message,
      timestamp: this.config.enableTimestamps ? new Date().toISOString() : '',
      context: this.buildContext(context),
      stack: this.config.enableStackTrace ? this.getStackTrace() : undefined,
    };

    // Store in memory
    if (this.config.enableStorage) {
      this.storeLogEntry(entry);
    }

    // Output to console
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Send to remote logging (if configured)
    if (this.config.enableRemoteLogging && this.shouldFlushLevel(level)) {
      this.queueForRemoteLogging(entry);
    }
  }

  /**
   * Check if level meets logging threshold
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.config.level];
  }

  /**
   * Build context object with logger context
   */
  private buildContext(userContext?: Record<string, unknown>): Record<string, unknown> {
    const context: Record<string, unknown> = {};

    // Add context stack
    if (this.contextStack.length > 0) {
      context._context = this.contextStack.join(' → ');
    }

    // Add environment info
    if (this.config.environment !== 'production') {
      context._env = this.config.environment;
    }

    // Add performance info
    if (this.config.enablePerformanceLogging && typeof performance !== 'undefined') {
      context._perf = {
        now: Math.round(performance.now()),
        memory: this.getMemoryInfo(),
      };
    }

    // Add user context
    if (userContext) {
      Object.assign(context, userContext);
    }

    return context;
  }

  /**
   * Get memory information (if available)
   */
  private getMemoryInfo(): Record<string, number> | undefined {
    if (typeof (performance as any).memory === 'undefined') {
      return undefined;
    }

    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
    };
  }

  /**
   * Get stack trace
   */
  private getStackTrace(): string | undefined {
    try {
      throw new Error();
    } catch (error) {
      const stack = (error as Error).stack;
      if (!stack) return undefined;

      // Remove this function and log() from stack
      const lines = stack.split('\n');
      return lines.slice(3).join('\n');
    }
  }

  /**
   * Store log entry in memory
   */
  private storeLogEntry(entry: LogEntry): void {
    this.storage.push(entry);

    // Prevent memory leaks
    if (this.storage.length > this.config.maxStorageEntries) {
      this.storage.shift();
    }
  }

  /**
   * Output to console with appropriate styling
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp ? `[${entry.timestamp}] ` : '';
    const context = this.contextStack.length > 0 ? `[${this.contextStack.join(' → ')}] ` : '';
    const message = `${timestamp}${context}${entry.message}`;

    const consoleMethod = this.getConsoleMethod(entry.level);

    if (entry.context && Object.keys(entry.context).length > 0) {
      consoleMethod(message, entry.context);
    } else {
      consoleMethod(message);
    }

    // Log stack trace if available
    if (entry.stack && entry.level === 'error') {
      console.trace(entry.stack);
    }
  }

  /**
   * Get appropriate console method for level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case 'debug':
        return console.debug || console.log;
      case 'info':
        return console.info || console.log;
      case 'warn':
        return console.warn || console.log;
      case 'error':
        return console.error || console.log;
      default:
        return console.log;
    }
  }

  /**
   * Check if level should trigger immediate remote flush
   */
  private shouldFlushLevel(level: LogLevel): boolean {
    return level === 'error';
  }

  /**
   * Queue entry for remote logging
   */
  private queueForRemoteLogging(entry: LogEntry): void {
    // In a real implementation, this would queue entries for batching
    // For now, we'll just trigger an immediate flush for errors
    if (entry.level === 'error') {
      setTimeout(() => this.flush(), 0);
    }
  }
}

// Create global logger instance
export const logger = new Logger({
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  environment: (process.env['NODE_ENV'] as any) || 'development',
  enableRemoteLogging: process.env['NODE_ENV'] === 'production',
  remoteEndpoint: process.env['VITE_LOGGING_ENDPOINT'],
});

// Export logger creation function for custom loggers
export function createLogger(name: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger(config).child(name);
}
