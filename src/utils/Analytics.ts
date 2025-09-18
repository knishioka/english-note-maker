/**
 * Analytics and User Behavior Tracking
 * Privacy-focused analytics for production monitoring
 */

import type { UserInteraction, PerformanceMetric } from '../types/index.js';

export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize: number;
  flushInterval: number;
  anonymizeData: boolean;
  collectPerformance: boolean;
  collectErrors: boolean;
  collectUserInteractions: boolean;
}

export class Analytics {
  private readonly config: AnalyticsConfig;
  private readonly eventQueue: any[] = [];
  private readonly sessionId: string;
  private readonly userId: string;
  private flushTimer?: number;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      anonymizeData: true,
      collectPerformance: true,
      collectErrors: true,
      collectUserInteractions: true,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();

    if (this.config.enabled) {
      this.initializeTracking();
    }
  }

  /**
   * Track user interaction events
   */
  public trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number,
    customData?: Record<string, any>
  ): void {
    if (!this.config.enabled || !this.config.collectUserInteractions) {
      return;
    }

    const event = {
      type: 'event',
      category,
      action,
      label,
      value,
      customData: this.config.anonymizeData ? this.anonymizeData(customData) : customData,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.config.anonymizeData ? this.hashUserId(this.userId) : this.userId,
      url: this.config.anonymizeData
        ? this.anonymizeUrl(window.location.href)
        : window.location.href,
      userAgent: this.config.anonymizeData
        ? this.anonymizeUserAgent(navigator.userAgent)
        : navigator.userAgent,
    };

    this.queueEvent(event);
  }

  /**
   * Track page views
   */
  public trackPageView(path?: string, title?: string): void {
    if (!this.config.enabled) {
      return;
    }

    const event = {
      type: 'pageview',
      path: path || window.location.pathname,
      title: title || document.title,
      referrer: this.config.anonymizeData
        ? this.anonymizeUrl(document.referrer)
        : document.referrer,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.config.anonymizeData ? this.hashUserId(this.userId) : this.userId,
    };

    this.queueEvent(event);
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(metric: PerformanceMetric): void {
    if (!this.config.enabled || !this.config.collectPerformance) {
      return;
    }

    const event = {
      type: 'performance',
      metric: {
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        status: metric.status,
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    this.queueEvent(event);
  }

  /**
   * Track errors
   */
  public trackError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enabled || !this.config.collectErrors) {
      return;
    }

    const event = {
      type: 'error',
      error: {
        name: error.name,
        message: error.message,
        stack: this.config.anonymizeData ? this.anonymizeStackTrace(error.stack) : error.stack,
      },
      context: this.config.anonymizeData ? this.anonymizeData(context) : context,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: this.config.anonymizeData
        ? this.anonymizeUrl(window.location.href)
        : window.location.href,
    };

    this.queueEvent(event);
  }

  /**
   * Track feature usage
   */
  public trackFeatureUsage(
    feature: string,
    action: 'start' | 'complete' | 'abandon',
    metadata?: Record<string, any>
  ): void {
    this.trackEvent('feature', `${feature}_${action}`, feature, undefined, metadata);
  }

  /**
   * Track conversion events
   */
  public trackConversion(goal: string, value?: number, metadata?: Record<string, any>): void {
    this.trackEvent('conversion', goal, undefined, value, metadata);
  }

  /**
   * Track user engagement
   */
  public trackEngagement(): void {
    const engagement = this.calculateEngagementMetrics();
    this.trackEvent('engagement', 'session_summary', undefined, undefined, engagement);
  }

  /**
   * Set user properties
   */
  public setUserProperty(key: string, value: string | number | boolean): void {
    if (!this.config.enabled) {
      return;
    }

    const event = {
      type: 'user_property',
      property: {
        key,
        value: this.config.anonymizeData ? this.anonymizeValue(value) : value,
      },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.config.anonymizeData ? this.hashUserId(this.userId) : this.userId,
    };

    this.queueEvent(event);
  }

  /**
   * Flush events immediately
   */
  public flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return Promise.resolve();
    }

    const events = [...this.eventQueue];
    this.eventQueue.length = 0;

    return this.sendEvents(events);
  }

  /**
   * Initialize tracking
   */
  private initializeTracking(): void {
    // Track initial page view
    this.trackPageView();

    // Set up automatic event flushing
    this.flushTimer = window.setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);

    // Track engagement on page unload
    window.addEventListener('beforeunload', () => {
      this.trackEngagement();
      this.flush();
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackEngagement();
        this.flush();
      }
    });

    // Set up error tracking
    if (this.config.collectErrors) {
      this.setupErrorTracking();
    }

    // Set up user interaction tracking
    if (this.config.collectUserInteractions) {
      this.setupInteractionTracking();
    }
  }

  /**
   * Set up automatic error tracking
   */
  private setupErrorTracking(): void {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.trackError(error, { type: 'unhandled_rejection' });
    });
  }

  /**
   * Set up automatic interaction tracking
   */
  private setupInteractionTracking(): void {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.matches('button, [role="button"], a, input[type="submit"]')) {
        const label = target.textContent?.trim() || target.getAttribute('aria-label') || target.id;
        this.trackEvent('interaction', 'click', label);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'anonymous';
      this.trackEvent('interaction', 'form_submit', formId);
    });

    // Track input focus (for engagement measurement)
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target.matches('input, select, textarea')) {
        this.trackEvent('interaction', 'input_focus', target.id || target.name);
      }
    });
  }

  /**
   * Queue event for batching
   */
  private queueEvent(event: any): void {
    this.eventQueue.push(event);

    // Flush if batch size is reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Send events to analytics endpoint
   */
  private async sendEvents(events: any[]): Promise<void> {
    if (!this.config.endpoint) {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Events:', events);
      }
      return;
    }

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          meta: {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            version: process.env.npm_package_version || '1.0.0',
          },
        }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry (with limit to prevent infinite growth)
      if (this.eventQueue.length < 100) {
        this.eventQueue.unshift(...events);
      }
    }
  }

  /**
   * Calculate engagement metrics
   */
  private calculateEngagementMetrics(): Record<string, any> {
    const now = Date.now();
    const sessionStart = parseInt(this.sessionId.split('_')[1]) || now;
    const sessionDuration = now - sessionStart;

    return {
      sessionDuration,
      pageViews: this.eventQueue.filter((e) => e.type === 'pageview').length,
      interactions: this.eventQueue.filter(
        (e) => e.type === 'event' && e.category === 'interaction'
      ).length,
      errors: this.eventQueue.filter((e) => e.type === 'error').length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Privacy and anonymization methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    // Try to get existing user ID from localStorage
    const stored = localStorage.getItem('analytics_user_id');
    if (stored) {
      return stored;
    }

    // Generate new user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_user_id', userId);
    return userId;
  }

  private hashUserId(userId: string): string {
    // Simple hash function for anonymization
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `user_${Math.abs(hash).toString(16)}`;
  }

  private anonymizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch {
      return '[invalid_url]';
    }
  }

  private anonymizeUserAgent(userAgent: string): string {
    // Keep only browser and version info, remove detailed system info
    const simplified = userAgent
      .replace(/\([^)]*\)/g, '') // Remove parenthetical info
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return simplified.slice(0, 100); // Limit length
  }

  private anonymizeStackTrace(stack?: string): string | undefined {
    if (!stack) return undefined;

    return stack
      .replace(/file:\/\/\/.*?\/([^\/]+\.js)/g, '$1') // Remove file paths
      .replace(/http:\/\/.*?\/([^\/]+\.js)/g, '$1') // Remove HTTP paths
      .replace(/https:\/\/.*?\/([^\/]+\.js)/g, '$1') // Remove HTTPS paths
      .slice(0, 500); // Limit length
  }

  private anonymizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return this.anonymizeValue(data);
    }

    const anonymized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive keys
      if (this.isSensitiveKey(key)) {
        continue;
      }

      anonymized[key] = this.anonymizeValue(value);
    }

    return anonymized;
  }

  private anonymizeValue(value: any): any {
    if (typeof value === 'string') {
      // Hash sensitive-looking strings
      if (this.isSensitiveValue(value)) {
        return this.hashString(value);
      }
      return value;
    }

    if (typeof value === 'object' && value !== null) {
      return this.anonymizeData(value);
    }

    return value;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'email',
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'ssn',
      'social',
      'credit',
      'card',
      'account',
      'personal',
    ];

    return sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive));
  }

  private isSensitiveValue(value: string): boolean {
    // Check for patterns that look like sensitive data
    const patterns = [
      /\b[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/i, // Email
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
      /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN
      /^[a-zA-Z0-9]{32,}$/, // Long random strings (tokens)
    ];

    return patterns.some((pattern) => pattern.test(value));
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `hashed_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Flush remaining events
    this.flush();
  }
}

// Global analytics instance
export const analytics = new Analytics({
  enabled: process.env.NODE_ENV === 'production',
  endpoint: process.env.VITE_ANALYTICS_ENDPOINT,
  anonymizeData: true,
});
