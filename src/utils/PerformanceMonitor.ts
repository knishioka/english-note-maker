/**
 * Performance Monitoring Utility
 * Production-grade performance tracking and optimization
 */

import type { PerformanceMetric, PerformanceReport } from '../types/index.js';

export class PerformanceMonitor {
  private readonly metrics = new Map<string, PerformanceMetric>();
  private readonly timings = new Map<string, number>();
  private readonly observers = new Set<PerformanceObserver>();
  private readonly maxMetrics = 1000;

  constructor() {
    this.initializeObservers();
  }

  /**
   * Start timing an operation
   */
  public startTiming(name: string): string {
    const startTime = performance.now();
    const timingId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.timings.set(timingId, startTime);

    // Also create a performance mark
    if (typeof performance.mark === 'function') {
      performance.mark(`${name}-start`);
    }

    return timingId;
  }

  /**
   * End timing and record metric
   */
  public endTiming(timingId: string): number {
    const endTime = performance.now();
    const startTime = this.timings.get(timingId);

    if (!startTime) {
      console.warn(`Performance timing not found: ${timingId}`);
      return 0;
    }

    const duration = endTime - startTime;
    this.timings.delete(timingId);

    // Extract operation name from timing ID
    const operationName = timingId.split('_')[0];

    // Create performance measure
    if (typeof performance.measure === 'function') {
      try {
        performance.measure(operationName, `${operationName}-start`);
      } catch (error) {
        // Ignore if mark doesn't exist
      }
    }

    // Record the metric
    this.recordMetric({
      name: operationName,
      value: duration,
      unit: 'ms',
      threshold: this.getThreshold(operationName),
      status: this.getPerformanceStatus(operationName, duration),
    });

    return duration;
  }

  /**
   * Record a custom performance metric
   */
  public recordMetric(metric: PerformanceMetric): void {
    // Prevent memory leaks by limiting metrics
    if (this.metrics.size >= this.maxMetrics) {
      const oldestKey = this.metrics.keys().next().value;
      this.metrics.delete(oldestKey);
    }

    this.metrics.set(`${metric.name}_${Date.now()}`, metric);

    // Log performance issues
    if (metric.status === 'critical') {
      console.error(`Performance Critical: ${metric.name} = ${metric.value}${metric.unit}`);
    } else if (metric.status === 'warning') {
      console.warn(`Performance Warning: ${metric.name} = ${metric.value}${metric.unit}`);
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};

    // Basic metrics
    result.renderTime = this.getAverageMetric('generateNote');
    result.validationTime = this.getAverageMetric('validation');
    result.printTime = this.getAverageMetric('print');

    // Memory metrics
    if (typeof performance.memory !== 'undefined') {
      result.memoryUsed = performance.memory.usedJSHeapSize;
      result.memoryTotal = performance.memory.totalJSHeapSize;
      result.memoryLimit = performance.memory.jsHeapSizeLimit;
    }

    // Navigation timing
    if (typeof performance.timing !== 'undefined') {
      const timing = performance.timing;
      result.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      result.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      result.firstPaint = this.getFirstPaintTime();
    }

    // Resource timing
    result.resourceCount = performance.getEntriesByType('resource').length;

    return result;
  }

  /**
   * Generate comprehensive performance report
   */
  public generateReport(): PerformanceReport {
    const metrics = Array.from(this.metrics.values());

    return {
      timestamp: new Date().toISOString(),
      metrics,
      renderTime: this.getAverageMetric('generateNote'),
      memoryUsage: this.getCurrentMemoryUsage(),
      bundleSize: this.estimateBundleSize(),
    };
  }

  /**
   * Monitor Core Web Vitals
   */
  public measureCoreWebVitals(): Promise<Record<string, number>> {
    return new Promise((resolve) => {
      const vitals: Record<string, number> = {};

      // Largest Contentful Paint (LCP)
      this.observePerformance('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
      });

      // First Input Delay (FID)
      this.observePerformance('first-input', (entries) => {
        const firstEntry = entries[0];
        vitals.fid = firstEntry.processingStart - firstEntry.startTime;
      });

      // Cumulative Layout Shift (CLS)
      this.observePerformance('layout-shift', (entries) => {
        const clsValue = entries.reduce((sum, entry) => {
          if (!entry.hadRecentInput) {
            return sum + entry.value;
          }
          return sum;
        }, 0);
        vitals.cls = clsValue;
      });

      // Resolve after a reasonable timeout
      setTimeout(() => resolve(vitals), 5000);
    });
  }

  /**
   * Track resource loading performance
   */
  public trackResourcePerformance(): Record<string, number> {
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const metrics: Record<string, number> = {};

    // Categorize resources
    const categories = {
      scripts: resourceEntries.filter((entry) => entry.name.includes('.js')),
      styles: resourceEntries.filter((entry) => entry.name.includes('.css')),
      images: resourceEntries.filter((entry) => /\.(png|jpg|jpeg|gif|svg|webp)/.test(entry.name)),
      fonts: resourceEntries.filter((entry) => /\.(woff|woff2|ttf|otf)/.test(entry.name)),
    };

    // Calculate metrics for each category
    Object.entries(categories).forEach(([category, entries]) => {
      if (entries.length > 0) {
        const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
        const totalSize = entries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);

        metrics[`${category}LoadTime`] = totalDuration / entries.length;
        metrics[`${category}TotalSize`] = totalSize;
        metrics[`${category}Count`] = entries.length;
      }
    });

    return metrics;
  }

  /**
   * Monitor memory usage patterns
   */
  public monitorMemoryUsage(): void {
    if (typeof performance.memory === 'undefined') {
      console.warn('Memory API not available');
      return;
    }

    const checkMemory = () => {
      const memory = performance.memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      this.recordMetric({
        name: 'memoryUsage',
        value: usagePercent,
        unit: '%',
        threshold: 80,
        status: usagePercent > 90 ? 'critical' : usagePercent > 80 ? 'warning' : 'good',
      });

      // Schedule garbage collection if usage is high
      if (usagePercent > 85 && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
    };

    // Check memory usage periodically
    setInterval(checkMemory, 30000); // Every 30 seconds
  }

  /**
   * Optimize performance based on metrics
   */
  public optimizePerformance(): void {
    const report = this.generateReport();

    // Optimize based on render time
    if (report.renderTime > 1000) {
      console.warn('Slow render time detected. Consider optimizing note generation.');
      // Could trigger lazy loading, caching, etc.
    }

    // Optimize based on memory usage
    if (report.memoryUsage > 50 * 1024 * 1024) {
      // 50MB
      console.warn('High memory usage detected. Clearing caches.');
      this.clearCaches();
    }

    // Optimize based on bundle size
    if (report.bundleSize > 2 * 1024 * 1024) {
      // 2MB
      console.warn('Large bundle size detected. Consider code splitting.');
    }
  }

  /**
   * Private helper methods
   */
  private initializeObservers(): void {
    // Start memory monitoring
    this.monitorMemoryUsage();

    // Observe performance entries
    if (typeof PerformanceObserver !== 'undefined') {
      this.observePerformance('measure', (entries) => {
        entries.forEach((entry) => {
          this.recordMetric({
            name: entry.name,
            value: entry.duration,
            unit: 'ms',
            threshold: this.getThreshold(entry.name),
            status: this.getPerformanceStatus(entry.name, entry.duration),
          });
        });
      });
    }
  }

  private observePerformance(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observer.observe({ entryTypes: [type] });
      this.observers.add(observer);
    } catch (error) {
      console.warn(`Performance observer not supported for type: ${type}`);
    }
  }

  private getThreshold(operationName: string): number {
    const thresholds: Record<string, number> = {
      generateNote: 500, // 500ms for note generation
      validation: 100, // 100ms for validation
      print: 1000, // 1s for print operations
      render: 16, // 16ms for smooth 60fps
      interaction: 100, // 100ms for user interactions
      default: 200,
    };

    return thresholds[operationName] || thresholds.default;
  }

  private getPerformanceStatus(
    operationName: string,
    duration: number
  ): PerformanceMetric['status'] {
    const threshold = this.getThreshold(operationName);

    if (duration > threshold * 2) {
      return 'critical';
    } else if (duration > threshold) {
      return 'warning';
    } else {
      return 'good';
    }
  }

  private getAverageMetric(metricName: string): number {
    const relevantMetrics = Array.from(this.metrics.values()).filter(
      (metric) => metric.name === metricName
    );

    if (relevantMetrics.length === 0) {
      return 0;
    }

    const sum = relevantMetrics.reduce((total, metric) => total + metric.value, 0);
    return sum / relevantMetrics.length;
  }

  private getCurrentMemoryUsage(): number {
    if (typeof performance.memory !== 'undefined') {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  private estimateBundleSize(): number {
    // Estimate based on resource entries
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resourceEntries.reduce((total, entry) => total + (entry.transferSize || 0), 0);
  }

  private getFirstPaintTime(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find((entry) => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private clearCaches(): void {
    // Clear performance metrics cache
    const oldSize = this.metrics.size;
    this.metrics.clear();
    console.log(`Cleared ${oldSize} performance metrics from cache`);

    // Clear browser caches if available
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    // Disconnect all observers
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();

    // Clear all data
    this.metrics.clear();
    this.timings.clear();
  }
}
