/**
 * Production-grade Validation Service
 * Comprehensive input validation and layout verification
 */

import type {
  ValidationRule,
  ValidationResult,
  ValidationReport,
  UIState,
} from '../types/index.js';

export class ValidationService {
  private readonly rules: Map<string, ValidationRule>;
  private readonly A4_HEIGHT_MM = 297;
  private readonly A4_WIDTH_MM = 210;

  constructor() {
    this.rules = new Map();
    this.initializeValidationRules();
  }

  /**
   * Validate UI state before processing
   */
  public async validateUIState(state: UIState): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Validate practice mode
    results.push(this.validatePracticeMode(state.practiceMode));

    // Validate age group
    results.push(this.validateAgeGroup(state.ageGroup));

    // Validate page count
    results.push(this.validatePageCount(state.pageCount));

    // Validate line height
    results.push(this.validateLineHeight(state.lineHeight));

    // Validate line color
    results.push(this.validateLineColor(state.lineColor));

    // Validate category selections
    results.push(...this.validateCategorySelections(state));

    return results.filter((result) => !result.passed);
  }

  /**
   * Validate generated HTML layout
   */
  public async validateGeneratedHTML(html: string): Promise<ValidationResult[]> {
    // Create temporary DOM for validation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);

    try {
      const results: ValidationResult[] = [];

      // Validate each rule
      for (const [_ruleName, rule] of this.rules) {
        const result = await this.validateRule(rule, tempDiv);
        if (result) {
          results.push(result);
        }
      }

      // Additional layout-specific validations
      results.push(...(await this.validatePageDimensions(tempDiv)));
      results.push(...(await this.validateBaselineConsistency(tempDiv)));
      results.push(...(await this.validatePrintOptimization(tempDiv)));

      return results;
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * Generate comprehensive validation report
   */
  public generateValidationReport(results: ValidationResult[]): ValidationReport {
    const errors = results.filter((r) => r.severity === 'error');
    const warnings = results.filter((r) => r.severity === 'warning');
    const info = results.filter((r) => r.severity === 'info');

    return {
      timestamp: new Date().toISOString(),
      summary: {
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
        skipped: 0,
      },
      errors,
      warnings,
      info,
    };
  }

  /**
   * Initialize validation rules
   */
  private initializeValidationRules(): void {
    const rules: ValidationRule[] = [
      {
        name: 'lineHeight',
        selector: '.baseline-group',
        property: 'height',
        min: 8,
        max: 12,
        unit: 'mm',
        severity: 'error',
      },
      {
        name: 'lineSpacing',
        selector: '.line-separator-small',
        property: 'height',
        min: 1,
        max: 5,
        unit: 'mm',
        severity: 'warning',
      },
      {
        name: 'baselineThickness',
        selector: '.baseline--lower',
        property: 'borderBottomWidth',
        min: 1,
        max: 2.5,
        unit: 'px',
        severity: 'error',
      },
      {
        name: 'pageMargin',
        selector: '.note-page',
        property: 'padding',
        min: 3,
        max: 20,
        unit: 'mm',
        severity: 'error',
      },
      {
        name: 'fontSize',
        selector: '.example-english',
        property: 'fontSize',
        min: 12,
        max: 18,
        unit: 'pt',
        severity: 'warning',
      },
      {
        name: 'pageWidth',
        selector: '.note-page',
        property: 'width',
        min: 190,
        max: 220,
        unit: 'mm',
        severity: 'error',
      },
    ];

    rules.forEach((rule) => this.rules.set(rule.name, rule));
  }

  /**
   * Validate individual rule against DOM element
   */
  private async validateRule(
    rule: ValidationRule,
    container: Element
  ): Promise<ValidationResult | null> {
    if (
      !rule.selector ||
      !rule.property ||
      rule.min === undefined ||
      rule.max === undefined ||
      !rule.unit
    ) {
      return null; // Skip validation if rule is incomplete
    }

    const elements = container.querySelectorAll(rule.selector);

    if (elements.length === 0) {
      return null; // Skip if no elements found
    }

    for (const element of elements) {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      const value = this.extractNumericValue(
        computedStyle.getPropertyValue(rule.property),
        rule.unit
      );

      if (value < rule.min || value > rule.max) {
        return {
          valid: false,
          passed: false,
          rule: rule.name,
          actualValue: value,
          expectedRange: `${rule.min}-${rule.max}${rule.unit}`,
          severity: rule.severity,
          message: `${rule.name} value ${value}${rule.unit} is outside expected range`,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString(),
        };
      }
    }

    return null; // All validations passed
  }

  /**
   * Validate page dimensions
   */
  private async validatePageDimensions(container: Element): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const pages = container.querySelectorAll('.note-page');

    for (const page of pages) {
      const htmlPage = page as HTMLElement;
      const rect = htmlPage.getBoundingClientRect();
      const heightInMm = rect.height / 3.7795275591; // px to mm conversion

      // Check if page height exceeds A4
      if (heightInMm > this.A4_HEIGHT_MM * 1.05) {
        // 5% tolerance
        results.push({
          valid: false,
          passed: false,
          rule: 'pageHeight',
          actualValue: Math.round(heightInMm),
          expectedRange: `<${this.A4_HEIGHT_MM}mm`,
          severity: 'error',
          message: `Page height ${Math.round(heightInMm)}mm exceeds A4 size`,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString(),
        });
      }

      // Check if page width is reasonable
      const widthInMm = rect.width / 3.7795275591;
      if (widthInMm > this.A4_WIDTH_MM * 1.1) {
        // 10% tolerance for margins
        results.push({
          valid: false,
          passed: false,
          rule: 'pageWidth',
          actualValue: Math.round(widthInMm),
          expectedRange: `<${this.A4_WIDTH_MM * 1.1}mm`,
          severity: 'warning',
          message: `Page width ${Math.round(widthInMm)}mm may cause printing issues`,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  /**
   * Validate baseline consistency
   */
  private async validateBaselineConsistency(container: Element): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const baselineGroups = container.querySelectorAll('.baseline-group');

    if (baselineGroups.length === 0) {
      return results;
    }

    // Check if all baseline groups have the same height
    const heights = new Set<number>();
    for (const group of baselineGroups) {
      const htmlGroup = group as HTMLElement;
      const height = htmlGroup.getBoundingClientRect().height;
      heights.add(Math.round(height));
    }

    if (heights.size > 1) {
      results.push({
        valid: false,
        passed: false,
        rule: 'baselineConsistency',
        actualValue: Array.from(heights).join(', '),
        expectedRange: 'Consistent heights',
        severity: 'warning',
        message: `Inconsistent baseline heights detected: ${Array.from(heights).join('px, ')}px`,
        errors: [],
        warnings: [],
        timestamp: new Date().toISOString(),
      });
    }

    // Validate 4-line structure
    for (const group of baselineGroups) {
      const baselines = group.querySelectorAll('.baseline');
      if (baselines.length !== 4) {
        results.push({
          valid: false,
          passed: false,
          rule: 'baselineStructure',
          actualValue: baselines.length,
          expectedRange: '4 baselines',
          severity: 'error',
          message: `Baseline group should contain exactly 4 lines, found ${baselines.length}`,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  /**
   * Validate print optimization
   */
  private async validatePrintOptimization(container: Element): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check for print-specific CSS
    const styleSheets = Array.from(document.styleSheets);
    let hasPrintStyles = false;

    for (const sheet of styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        hasPrintStyles = rules.some(
          (rule) => rule instanceof CSSMediaRule && rule.media.mediaText.includes('print')
        );
        if (hasPrintStyles) break;
      } catch (e) {
        // Cross-origin stylesheets may throw errors
        continue;
      }
    }

    if (!hasPrintStyles) {
      results.push({
        valid: false,
        passed: false,
        rule: 'printStyles',
        actualValue: 'Missing',
        expectedRange: 'Present',
        severity: 'warning',
        message: 'Print-specific CSS styles not detected',
        errors: [],
        warnings: [],
        timestamp: new Date().toISOString(),
      });
    }

    // Check for page-break elements
    const pageBreaks = container.querySelectorAll('[style*="page-break"]');
    const pages = container.querySelectorAll('.note-page');

    if (pages.length > 1 && pageBreaks.length === 0) {
      results.push({
        valid: false,
        passed: false,
        rule: 'pageBreaks',
        actualValue: pageBreaks.length,
        expectedRange: `>0 for ${pages.length} pages`,
        severity: 'warning',
        message: 'Multi-page document missing page break directives',
        errors: [],
        warnings: [],
        timestamp: new Date().toISOString(),
      });
    }

    return results;
  }

  /**
   * Individual validation methods
   */
  private validatePracticeMode(mode: string): ValidationResult {
    const validModes = ['normal', 'sentence', 'word', 'alphabet', 'phrase'];
    const isValid = validModes.includes(mode);

    return {
      valid: isValid,
      passed: isValid,
      rule: 'practiceMode',
      actualValue: mode,
      expectedRange: validModes.join(' | '),
      severity: 'error',
      message: isValid ? 'Valid practice mode' : `Invalid practice mode: ${mode}`,
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
    };
  }

  private validateAgeGroup(ageGroup: string): ValidationResult {
    const validGroups = ['4-6', '7-9', '10-12'];
    const isValid = validGroups.includes(ageGroup);

    return {
      valid: isValid,
      passed: isValid,
      rule: 'ageGroup',
      actualValue: ageGroup,
      expectedRange: validGroups.join(' | '),
      severity: 'error',
      message: isValid ? 'Valid age group' : `Invalid age group: ${ageGroup}`,
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
    };
  }

  private validatePageCount(count: number): ValidationResult {
    const isValid = Number.isInteger(count) && count >= 1 && count <= 10;

    return {
      valid: isValid,
      passed: isValid,
      rule: 'pageCount',
      actualValue: count,
      expectedRange: '1-10',
      severity: 'error',
      message: isValid ? 'Valid page count' : `Invalid page count: ${count}`,
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
    };
  }

  private validateLineHeight(height: number): ValidationResult {
    const validHeights = [8, 10, 12];
    const isValid = validHeights.includes(height);

    return {
      valid: isValid,
      passed: isValid,
      rule: 'lineHeight',
      actualValue: height,
      expectedRange: validHeights.join(' | '),
      severity: 'error',
      message: isValid ? 'Valid line height' : `Invalid line height: ${height}`,
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
    };
  }

  private validateLineColor(color: string): ValidationResult {
    const validColors = ['gray', 'blue', 'green'];
    const isValid = validColors.includes(color);

    return {
      valid: isValid,
      passed: isValid,
      rule: 'lineColor',
      actualValue: color,
      expectedRange: validColors.join(' | '),
      severity: 'warning',
      message: isValid ? 'Valid line color' : `Invalid line color: ${color}`,
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
    };
  }

  private validateCategorySelections(state: UIState): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Validate based on practice mode
    switch (state.practiceMode) {
      case 'sentence':
        if (!state.selectedCategories?.sentence) {
          results.push({
            valid: false,
            passed: false,
            rule: 'sentenceCategory',
            actualValue: 'undefined',
            expectedRange: 'Required for sentence mode',
            severity: 'error',
            message: 'Sentence category is required for sentence practice mode',
            errors: [],
            warnings: [],
            timestamp: new Date().toISOString(),
          });
        }
        break;

      case 'word':
        if (!state.selectedCategories?.word) {
          results.push({
            valid: false,
            passed: false,
            rule: 'wordCategory',
            actualValue: 'undefined',
            expectedRange: 'Required for word mode',
            severity: 'error',
            message: 'Word category is required for word practice mode',
            errors: [],
            warnings: [],
            timestamp: new Date().toISOString(),
          });
        }
        break;

      case 'phrase':
        if (!state.selectedCategories?.phrase) {
          results.push({
            valid: false,
            passed: false,
            rule: 'phraseCategory',
            actualValue: 'undefined',
            expectedRange: 'Required for phrase mode',
            severity: 'error',
            message: 'Phrase category is required for phrase practice mode',
            errors: [],
            warnings: [],
            timestamp: new Date().toISOString(),
          });
        }
        break;
    }

    return results;
  }

  /**
   * Extract numeric value from CSS property
   */
  private extractNumericValue(value: string, unit: string): number {
    const regex = new RegExp(`([\\d.]+)${unit}`);
    const match = value.match(regex);

    if (match) {
      return parseFloat(match[1]);
    }

    // Handle unitless values (assume pixels for certain properties)
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      // Convert pixels to mm if needed
      if (unit === 'mm' && value.includes('px')) {
        return numericValue / 3.7795275591;
      }
      return numericValue;
    }

    return 0;
  }

  /**
   * Sanitize validation results for safe display
   */
  public sanitizeValidationResults(results: ValidationResult[]): ValidationResult[] {
    return results.map((result) => ({
      ...result,
      actualValue: this.sanitizeValue(result.actualValue),
      message: this.sanitizeMessage(result.message),
    }));
  }

  private sanitizeValue(value: unknown): string | number {
    if (typeof value === 'string') {
      return value.replace(/<[^>]*>/g, ''); // Remove HTML tags
    }
    if (typeof value === 'number') {
      return Math.round(value * 100) / 100; // Round to 2 decimal places
    }
    return String(value);
  }

  private sanitizeMessage(message: string): string {
    return message
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .slice(0, 200); // Limit length
  }
}
