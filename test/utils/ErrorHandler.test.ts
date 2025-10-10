/**
 * Test Suite for ErrorHandler
 * Comprehensive testing of error handling functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler } from '../../src/utils/ErrorHandler.js';
import { ErrorSeverity } from '../../src/types/index.js';
import { createTestError } from '../setup.js';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    errorHandler = new ErrorHandler('TestContext');
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('handleError', () => {
    it('should handle Error objects correctly', () => {
      const originalError = new Error('Test error message');
      originalError.name = 'TypeError';

      const result = errorHandler.handleError(originalError);

      expect(result.name).toBe('TypeError');
      expect(result.message).toBe('入力データに問題があります');
      expect(result.code).toContain('TESTCONTEXT_TYPEERROR_');
      expect(result.severity).toBe(ErrorSeverity.HIGH);
      expect(result.context?.originalMessage).toBe('Test error message');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle non-Error objects', () => {
      const result = errorHandler.handleError('String error');

      expect(result.name).toBe('UnknownError');
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      expect(result.context?.originalError).toBe('String error');
    });

    it('should include additional context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'print' };

      const result = errorHandler.handleError(error, context);

      expect(result.context?.userId).toBe('123');
      expect(result.context?.action).toBe('print');
      expect(result.context?.handlerContext).toBe('TestContext');
    });

    it('should log errors to console', () => {
      const error = new TypeError('Test error');

      errorHandler.handleError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('severity determination', () => {
    it('should classify critical errors correctly', () => {
      const errors = [
        new ReferenceError('Reference error'),
        new SyntaxError('Syntax error'),
        { name: 'SecurityError', message: 'Security error' },
      ];

      errors.forEach((error) => {
        const result = errorHandler.handleError(error);
        expect(result.severity).toBe(ErrorSeverity.CRITICAL);
      });
    });

    it('should classify high severity errors correctly', () => {
      const errors = [
        new TypeError('Type error'),
        new RangeError('Range error'),
        { name: 'NetworkError', message: 'Network error' },
        { name: 'PrintError', message: 'Print error' },
      ];

      errors.forEach((error) => {
        const result = errorHandler.handleError(error);
        expect(result.severity).toBe(ErrorSeverity.HIGH);
      });
    });

    it('should classify medium severity errors correctly', () => {
      const errors = [
        { name: 'ValidationError', message: 'Validation error' },
        { name: 'LayoutError', message: 'Layout error' },
      ];

      errors.forEach((error) => {
        const result = errorHandler.handleError(error);
        expect(result.severity).toBe(ErrorSeverity.MEDIUM);
      });
    });

    it('should default to low severity for unknown errors', () => {
      const error = { name: 'UnknownError', message: 'Unknown error' };

      const result = errorHandler.handleError(error);

      expect(result.severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('user-friendly messages', () => {
    it('should provide Japanese error messages', () => {
      const testCases = [
        { name: 'NetworkError', expected: 'インターネット接続を確認してください' },
        { name: 'TypeError', expected: '入力データに問題があります' },
        { name: 'ValidationError', expected: '入力内容を確認してください' },
        { name: 'SecurityError', expected: 'アクセス権限がありません' },
      ];

      testCases.forEach(({ name, expected }) => {
        const error = { name, message: 'Original message' };
        const result = errorHandler.handleError(error);
        expect(result.message).toBe(expected);
      });
    });

    it('should detect error patterns in messages', () => {
      const testCases = [
        { message: 'fetch failed', expected: 'サーバーとの通信に失敗しました' },
        {
          message: 'localStorage access denied',
          expected: 'ブラウザのストレージにアクセスできません',
        },
        { message: 'print operation failed', expected: '印刷機能が利用できません' },
      ];

      testCases.forEach(({ message, expected }) => {
        const error = new Error(message);
        const result = errorHandler.handleError(error);
        expect(result.message).toBe(expected);
      });
    });
  });

  describe('error code generation', () => {
    it('should generate consistent error codes', () => {
      const error = new Error('Same error message');
      error.name = 'TypeError';

      const result1 = errorHandler.handleError(error);
      const result2 = errorHandler.handleError(error);

      expect(result1.code).toBe(result2.code);
      expect(result1.code).toMatch(/TESTCONTEXT_TYPEERROR_[a-f0-9]{4}/);
    });

    it('should generate different codes for different errors', () => {
      const error1 = new Error('Error message 1');
      const error2 = new Error('Error message 2');

      const result1 = errorHandler.handleError(error1);
      const result2 = errorHandler.handleError(error2);

      expect(result1.code).not.toBe(result2.code);
    });
  });

  describe('stack trace handling', () => {
    it('should sanitize stack traces', () => {
      const error = createTestError('Test error', 'TestError');

      const result = errorHandler.handleError(error);

      expect(result.stack).toBeDefined();
      expect(result.stack).not.toContain('file:///');
      expect(result.stack?.length).toBeLessThanOrEqual(1000);
    });

    it('should handle missing stack traces', () => {
      const error = new Error('No stack');
      delete error.stack;

      const result = errorHandler.handleError(error);

      expect(result.stack).toBeUndefined();
    });
  });

  describe('error frequency tracking', () => {
    it('should track error frequency', () => {
      const error = new Error('Repeated error');

      // Generate multiple instances of the same error
      for (let i = 0; i < 7; i++) {
        errorHandler.handleError(error);
      }

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('High frequency error detected')
      );
    });

    it('should not warn for low frequency errors', () => {
      const error = new Error('Infrequent error');

      errorHandler.handleError(error);
      errorHandler.handleError(error);

      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('High frequency error detected')
      );
    });
  });

  describe('static utility methods', () => {
    describe('createErrorBoundary', () => {
      it('should create error boundary that catches errors', () => {
        const throwingComponent = () => {
          throw new Error('Component error');
        };

        const fallbackSpy = vi.fn();
        const boundComponent = ErrorHandler.createErrorBoundary(
          throwingComponent,
          fallbackSpy,
          'TestBoundary'
        );

        boundComponent();

        expect(fallbackSpy).toHaveBeenCalled();
        expect(fallbackSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Error',
            message: expect.any(String),
            severity: expect.any(String),
          })
        );
      });

      it('should allow successful components to execute normally', () => {
        const successfulComponent = vi.fn();
        const fallbackSpy = vi.fn();

        const boundComponent = ErrorHandler.createErrorBoundary(successfulComponent, fallbackSpy);

        boundComponent();

        expect(successfulComponent).toHaveBeenCalled();
        expect(fallbackSpy).not.toHaveBeenCalled();
      });
    });

    describe('safeAsync', () => {
      it('should handle successful async operations', async () => {
        const successfulOperation = async () => 'success';

        const result = await ErrorHandler.safeAsync(successfulOperation);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('success');
        }
      });

      it('should handle failing async operations', async () => {
        const failingOperation = async () => {
          throw new Error('Async error');
        };

        const result = await ErrorHandler.safeAsync(failingOperation);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error.message).toBeDefined();
        }
      });

      it('should provide context for async operations', async () => {
        const failingOperation = async () => {
          throw new Error('Async error');
        };

        const result = await ErrorHandler.safeAsync(failingOperation, 'AsyncTest');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.context?.handlerContext).toBe('AsyncTest');
        }
      });
    });
  });

  describe('production considerations', () => {
    it('should serialize errors for monitoring', () => {
      const error = new Error('Test error');
      const result = errorHandler.handleError(error);

      // Test the serialization logic (accessing private method via any)
      const serialized = (errorHandler as any).serializeErrorForTransmission(result);

      expect(serialized).toEqual({
        code: result.code,
        message: result.message,
        severity: result.severity,
        timestamp: result.timestamp,
        userAgent: result.userAgent,
        context: result.context,
        stackHash: expect.any(Number),
      });
    });

    it('should determine reporting eligibility correctly', () => {
      // Test low severity (should not report)
      const lowSeverityError = { name: 'Info', message: 'Info message' };
      const lowResult = errorHandler.handleError(lowSeverityError);
      const shouldReportLow = (errorHandler as any).shouldReportError(lowResult);
      expect(shouldReportLow).toBe(false);

      // Test high severity (should report)
      const highSeverityError = new TypeError('Type error');
      const highResult = errorHandler.handleError(highSeverityError);
      const shouldReportHigh = (errorHandler as any).shouldReportError(highResult);
      expect(shouldReportHigh).toBe(true);
    });
  });

  describe('context preservation', () => {
    it('should preserve user agent information', () => {
      const error = new Error('Test error');

      const result = errorHandler.handleError(error);

      expect(result.userAgent).toBeDefined();
      expect(typeof result.userAgent).toBe('string');
    });

    it('should include timestamp in ISO format', () => {
      const error = new Error('Test error');

      const result = errorHandler.handleError(error);

      expect(result.timestamp).toBeDefined();
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

    it('should preserve original error context', () => {
      const originalError = new Error('Original message');
      const additionalContext = { requestId: 'req-123', path: '/api/test' };

      const result = errorHandler.handleError(originalError, additionalContext);

      expect(result.context?.originalMessage).toBe('Original message');
      expect(result.context?.requestId).toBe('req-123');
      expect(result.context?.path).toBe('/api/test');
      expect(result.context?.handlerContext).toBe('TestContext');
    });
  });
});
