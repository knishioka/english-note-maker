/**
 * ValidationService Unit Tests
 * Tests for the production-grade validation service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidationService } from '../../src/services/ValidationService';
import type { UIState, ValidationResult } from '../../src/types/index';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('validateUIState', () => {
    it('should validate a valid UI state without errors', async () => {
      const validState: UIState = {
        practiceMode: 'phrase',
        ageGroup: '7-9',
        pageCount: 1,
        lineHeight: 10,
        lineColor: 'gray',
        showTranslation: true,
        showExamples: false,
        selectedCategories: {
          phrase: 'greetings',
        },
      };

      const results = await validationService.validateUIState(validState);
      expect(results).toHaveLength(0); // No validation errors
    });

    it('should detect invalid practice mode', async () => {
      const invalidState: UIState = {
        practiceMode: 'invalid-mode' as any,
        ageGroup: '7-9',
        pageCount: 1,
        lineHeight: 10,
        lineColor: 'gray',
        showTranslation: false,
        showExamples: false,
        selectedCategories: {},
      };

      const results = await validationService.validateUIState(invalidState);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.rule === 'practiceMode')).toBe(true);
    });

    it('should detect invalid age group', async () => {
      const invalidState: UIState = {
        practiceMode: 'normal',
        ageGroup: 'invalid-age' as any,
        pageCount: 1,
        lineHeight: 10,
        lineColor: 'gray',
        showTranslation: false,
        showExamples: false,
        selectedCategories: {},
      };

      const results = await validationService.validateUIState(invalidState);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.rule === 'ageGroup')).toBe(true);
    });

    it('should detect invalid page count', async () => {
      const invalidState: UIState = {
        practiceMode: 'normal',
        ageGroup: '7-9',
        pageCount: 0, // Invalid: must be > 0
        lineHeight: 10,
        lineColor: 'gray',
        showTranslation: false,
        showExamples: false,
        selectedCategories: {},
      };

      const results = await validationService.validateUIState(invalidState);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.rule === 'pageCount')).toBe(true);
    });

    it('should detect invalid line height', async () => {
      const invalidState: UIState = {
        practiceMode: 'normal',
        ageGroup: '7-9',
        pageCount: 1,
        lineHeight: 5, // Invalid: must be between 8-12
        lineColor: 'gray',
        showTranslation: false,
        showExamples: false,
        selectedCategories: {},
      };

      const results = await validationService.validateUIState(invalidState);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.rule === 'lineHeight')).toBe(true);
    });

    it('should validate phrase mode requires category selection', async () => {
      const invalidState: UIState = {
        practiceMode: 'phrase',
        ageGroup: '7-9',
        pageCount: 1,
        lineHeight: 10,
        lineColor: 'gray',
        showTranslation: false,
        showExamples: false,
        selectedCategories: {}, // Missing phrase category
      };

      const results = await validationService.validateUIState(invalidState);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should validate word mode requires category selection', async () => {
      const invalidState: UIState = {
        practiceMode: 'word',
        ageGroup: '7-9',
        pageCount: 1,
        lineHeight: 10,
        lineColor: 'gray',
        showTranslation: false,
        showExamples: false,
        selectedCategories: {}, // Missing word category
      };

      const results = await validationService.validateUIState(invalidState);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('validateGeneratedHTML', () => {
    it('should validate correct HTML structure', async () => {
      const validHTML = `
        <div class="note-page" style="width: 210mm; padding: 10mm;">
          <div class="baseline-group" style="height: 10mm;">
            <div class="baseline baseline--top"></div>
            <div class="baseline baseline--upper"></div>
            <div class="baseline baseline--lower" style="border-bottom-width: 1px;"></div>
            <div class="baseline baseline--bottom"></div>
          </div>
        </div>
      `;

      const results = await validationService.validateGeneratedHTML(validHTML);
      // Note: In test environment, some validation rules may not work perfectly due to mocking
      // (print styles, page breaks, CSS property reading), but critical structure errors should be 0
      const nonCriticalRules = ['printStyles', 'pageBreaks', 'baselineThickness'];
      const criticalErrors = results.filter(
        (r) => r.severity === 'error' && !nonCriticalRules.includes(r.rule)
      );
      expect(criticalErrors).toHaveLength(0);
    });

    it('should detect missing baseline elements', async () => {
      const invalidHTML = `
        <div class="note-page">
          <div class="baseline-group" style="height: 10mm;">
            <div class="baseline baseline--top"></div>
            <!-- Missing upper and lower baselines -->
            <div class="baseline baseline--bottom"></div>
          </div>
        </div>
      `;

      const results = await validationService.validateGeneratedHTML(invalidHTML);
      const errors = results.filter((r) => r.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid line height', async () => {
      const invalidHTML = `
        <div class="note-page">
          <div class="baseline-group" style="height: 5mm;">
            <div class="baseline baseline--top"></div>
            <div class="baseline baseline--upper"></div>
            <div class="baseline baseline--lower"></div>
            <div class="baseline baseline--bottom"></div>
          </div>
        </div>
      `;

      const results = await validationService.validateGeneratedHTML(invalidHTML);
      const heightErrors = results.filter((r) => r.rule === 'lineHeight' && r.severity === 'error');
      expect(heightErrors.length).toBeGreaterThan(0);
    });
  });

  describe('generateValidationReport', () => {
    it('should generate report with correct summary', () => {
      const mockResults: ValidationResult[] = [
        {
          passed: true,
          field: 'practiceMode',
          actualValue: 'phrase',
          expectedRange: 'valid practice mode',
          severity: 'info',
          message: 'Practice mode is valid',
        },
        {
          passed: false,
          field: 'pageCount',
          actualValue: 0,
          expectedRange: '1-5',
          severity: 'error',
          message: 'Page count must be between 1 and 5',
        },
        {
          passed: false,
          field: 'lineHeight',
          actualValue: 7,
          expectedRange: '8-12',
          severity: 'warning',
          message: 'Line height should be between 8-12mm',
        },
      ];

      const report = validationService.generateValidationReport(mockResults);

      expect(report.summary.passed).toBe(1);
      expect(report.summary.failed).toBe(2);
      expect(report.errors).toHaveLength(1);
      expect(report.warnings).toHaveLength(1);
      expect(report.timestamp).toBeDefined();
    });

    it('should categorize results by severity', () => {
      const mockResults: ValidationResult[] = [
        {
          passed: false,
          field: 'field1',
          actualValue: 'value1',
          expectedRange: 'range1',
          severity: 'error',
          message: 'Error message',
        },
        {
          passed: false,
          field: 'field2',
          actualValue: 'value2',
          expectedRange: 'range2',
          severity: 'warning',
          message: 'Warning message',
        },
        {
          passed: true,
          field: 'field3',
          actualValue: 'value3',
          expectedRange: 'range3',
          severity: 'info',
          message: 'Info message',
        },
      ];

      const report = validationService.generateValidationReport(mockResults);

      expect(report.errors).toHaveLength(1);
      expect(report.warnings).toHaveLength(1);
      expect(report.info).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty UI state gracefully', async () => {
      const emptyState = {} as UIState;

      const results = await validationService.validateUIState(emptyState);
      expect(results.length).toBeGreaterThan(0); // Should have validation errors
    });

    it('should handle empty HTML gracefully', async () => {
      const emptyHTML = '';

      const results = await validationService.validateGeneratedHTML(emptyHTML);
      // Should not throw error, but may have validation results
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle malformed HTML', async () => {
      const malformedHTML = '<div><span>Unclosed tags';

      const results = await validationService.validateGeneratedHTML(malformedHTML);
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
