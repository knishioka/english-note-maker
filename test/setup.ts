/**
 * Test Setup Configuration
 * Global test utilities and mocks for consistent testing environment
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// === Global Test Setup ===

beforeAll(() => {
  // Set up JSDOM environment
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable'
  });

  // Set global DOM
  global.window = dom.window as any;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLInputElement = dom.window.HTMLInputElement;
  global.HTMLSelectElement = dom.window.HTMLSelectElement;
  global.Event = dom.window.Event;
  global.CustomEvent = dom.window.CustomEvent;

  // Mock CSS computation
  global.getComputedStyle = vi.fn((element: Element) => {
    return {
      getPropertyValue: vi.fn((property: string) => {
        // Mock common CSS property values for testing
        const mockValues: Record<string, string> = {
          'height': '10mm',
          'width': '210mm',
          'padding': '10mm',
          'margin': '5mm',
          'font-size': '14pt',
          'border-bottom-width': '1px'
        };
        return mockValues[property] || '';
      }),
      height: '10mm',
      width: '210mm',
      padding: '10mm'
    } as any;
  });

  // Mock performance API
  global.performance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn()
  } as any;

  // Mock console methods with spies
  global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  };

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
  };
  global.localStorage = localStorageMock;

  // Mock sessionStorage
  global.sessionStorage = localStorageMock;

  // Mock URL API
  global.URL = dom.window.URL;
  global.URLSearchParams = dom.window.URLSearchParams;
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Reset DOM to clean state
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Reset localStorage
  localStorage.clear();
  sessionStorage.clear();

  // Add basic CSS variables for testing
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --margin-standard: 5mm 10mm;
      --margin-debug: 10mm 15mm;
      --margin-minimum: 3mm 8mm;
      --line-height-standard: 10mm;
      --line-height-small: 8mm;
      --line-height-large: 12mm;
      --baseline-color-screen: #d0d0d0;
      --baseline-color-print: #c0c0c0;
    }
  `;
  document.head.appendChild(style);
});

afterEach(() => {
  // Clean up any timers
  vi.clearAllTimers();

  // Clean up any pending promises
  return new Promise(resolve => setImmediate(resolve));
});

afterAll(() => {
  // Final cleanup
  vi.restoreAllMocks();
});

// === Test Utilities ===

/**
 * Create a mock HTML element with specified properties
 */
export function createMockElement(
  tagName: string = 'div',
  attributes: Record<string, string> = {},
  innerHTML: string = ''
): HTMLElement {
  const element = document.createElement(tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  element.innerHTML = innerHTML;
  return element;
}

/**
 * Create a mock UI state for testing
 */
export function createMockUIState(overrides: Partial<any> = {}): any {
  return {
    practiceMode: 'normal',
    ageGroup: '7-9',
    showExamples: false,
    showTranslation: false,
    showSituation: false,
    showAlphabetExample: true,
    showHeader: false,
    pageCount: 1,
    lineHeight: 10,
    lineColor: 'gray',
    selectedCategories: {
      sentence: 'daily',
      word: 'animals',
      phrase: 'greetings'
    },
    ...overrides
  };
}

/**
 * Create mock example sentence data
 */
export function createMockExampleSentence(overrides: Partial<any> = {}): any {
  return {
    english: 'This is a test sentence.',
    japanese: 'これはテスト文です。',
    category: 'daily',
    difficulty: 2,
    custom: false,
    ...overrides
  };
}

/**
 * Create mock word data
 */
export function createMockWordData(overrides: Partial<any> = {}): any {
  return {
    english: 'cat',
    japanese: 'ねこ',
    syllables: 'cat',
    difficulty: 1,
    ...overrides
  };
}

/**
 * Create mock validation result
 */
export function createMockValidationResult(overrides: Partial<any> = {}): any {
  return {
    rule: 'testRule',
    passed: true,
    actualValue: 10,
    expectedRange: '8-12',
    severity: 'info',
    message: 'Test validation passed',
    ...overrides
  };
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync(): Promise<void> {
  return new Promise(resolve => {
    setImmediate(() => {
      process.nextTick(resolve);
    });
  });
}

/**
 * Simulate DOM event
 */
export function simulateEvent(
  element: HTMLElement,
  eventType: string,
  eventInit: EventInit = {}
): void {
  const event = new Event(eventType, { bubbles: true, cancelable: true, ...eventInit });
  element.dispatchEvent(event);
}

/**
 * Simulate user input
 */
export function simulateInput(
  element: HTMLInputElement | HTMLSelectElement,
  value: string
): void {
  element.value = value;
  simulateEvent(element, 'input');
  simulateEvent(element, 'change');
}

/**
 * Mock print functionality
 */
export function mockPrint(): void {
  global.print = vi.fn();
}

/**
 * Mock fetch API
 */
export function mockFetch(mockResponse: any = {}): void {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
      status: 200,
      statusText: 'OK'
    } as Response)
  );
}

/**
 * Create a test container in the DOM
 */
export function createTestContainer(id: string = 'test-container'): HTMLElement {
  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);
  return container;
}

/**
 * Clean up test container
 */
export function cleanupTestContainer(id: string = 'test-container'): void {
  const container = document.getElementById(id);
  if (container) {
    container.remove();
  }
}

/**
 * Mock CSS media query
 */
export function mockMediaQuery(query: string, matches: boolean = true): void {
  const mediaQuery = {
    matches,
    media: query,
    onchange: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  };

  global.matchMedia = vi.fn(() => mediaQuery);
}

/**
 * Mock IntersectionObserver
 */
export function mockIntersectionObserver(): void {
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
  }));
}

/**
 * Mock ResizeObserver
 */
export function mockResizeObserver(): void {
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
  }));
}

/**
 * Create error with stack trace for testing
 */
export function createTestError(
  message: string = 'Test error',
  name: string = 'TestError'
): Error {
  const error = new Error(message);
  error.name = name;
  error.stack = `${name}: ${message}\n    at test (test.js:1:1)`;
  return error;
}

/**
 * Measure test performance
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();

  const executeAndMeasure = (result: T) => {
    const end = performance.now();
    const duration = end - start;
    console.log(`${name} took ${duration.toFixed(2)}ms`);
    return { result, duration };
  };

  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(executeAndMeasure);
    }
    return Promise.resolve(executeAndMeasure(result));
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    console.log(`${name} failed after ${duration.toFixed(2)}ms`);
    throw error;
  }
}