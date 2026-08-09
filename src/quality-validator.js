// レイアウト品質検証システム

class LayoutValidator {
  constructor() {
    this.rules = {
      lineHeight: {
        selector: '.baseline-group',
        property: 'height',
        min: 8,
        max: 12,
        unit: 'mm',
        severity: 'error',
      },
      lineSpacing: {
        selector: '.line-separator-small',
        property: 'height',
        min: 1,
        max: 5,
        unit: 'mm',
        severity: 'warning',
      },
      baselineThickness: {
        selector: '.baseline--lower',
        property: 'borderBottomWidth',
        min: 1,
        max: 2.5,
        unit: 'px',
        severity: 'error',
      },
      pageMargin: {
        selector: '.note-page',
        property: 'padding',
        min: 10,
        max: 20,
        unit: 'mm',
        severity: 'error',
      },
      fontSize: {
        selector: '.example-english',
        property: 'fontSize',
        min: 12,
        max: 18,
        unit: 'pt',
        severity: 'warning',
      },
    };

    this.results = [];
    this.A4_HEIGHT_MM = 297; // A4の高さ
    // offsetHeight は px 単位に丸められるため、ちょうど A4 でも 0.1mm ほど超える。
    // script.js の detectOverflow と同じ許容差を使う。
    this.A4_TOLERANCE_MM = 0.5;
    this.A4_WIDTH_MM = 210; // A4の幅
  }

  // ピクセルをミリメートルに変換
  pxToMm(px) {
    return px / 3.7795275591;
  }

  // ポイントをピクセルに変換
  ptToPx(pt) {
    return pt * 1.333333;
  }

  // 単一ルールの検証
  validateRule(ruleName, rule) {
    const elements = document.querySelectorAll(rule.selector);

    if (elements.length === 0) {
      return {
        rule: ruleName,
        status: 'skip',
        message: `要素が見つかりません: ${rule.selector}`,
      };
    }

    const values = [];
    elements.forEach((element) => {
      const computed = window.getComputedStyle(element);
      let value = parseFloat(computed[rule.property]);

      // 単位変換
      if (rule.unit === 'mm' && computed[rule.property].includes('px')) {
        value = this.pxToMm(value);
      } else if (rule.unit === 'pt' && computed[rule.property].includes('px')) {
        value = value / 1.333333;
      }

      values.push(value);
    });

    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const isValid = avgValue >= rule.min && avgValue <= rule.max;

    return {
      rule: ruleName,
      status: isValid ? 'pass' : 'fail',
      severity: rule.severity,
      actualValue: avgValue.toFixed(2),
      expectedRange: `${rule.min}-${rule.max}${rule.unit}`,
      message: isValid
        ? `✅ ${ruleName}: ${avgValue.toFixed(2)}${rule.unit}`
        : `❌ ${ruleName}: ${avgValue.toFixed(2)}${rule.unit} (期待値: ${rule.min}-${rule.max}${rule.unit})`,
    };
  }

  // ページ高さチェック
  checkPageHeight() {
    const pages = document.querySelectorAll('.note-page');
    const results = [];

    pages.forEach((page, index) => {
      // プレビューは transform で縮小表示しているため getBoundingClientRect では
      // 見た目の高さになる。印刷されるのは実寸なので offsetHeight で測る。
      const heightInMm = this.pxToMm(page.offsetHeight);
      const isValid = heightInMm <= this.A4_HEIGHT_MM + this.A4_TOLERANCE_MM;

      results.push({
        rule: `pageHeight_${index + 1}`,
        status: isValid ? 'pass' : 'fail',
        severity: 'error',
        actualValue: heightInMm.toFixed(2),
        expectedRange: `0-${this.A4_HEIGHT_MM}mm`,
        message: isValid
          ? `✅ ページ${index + 1}高さ: ${heightInMm.toFixed(2)}mm (A4内)`
          : `❌ ページ${index + 1}高さ: ${heightInMm.toFixed(2)}mm (A4超過: +${(heightInMm - this.A4_HEIGHT_MM).toFixed(2)}mm)`,
      });
    });

    return results;
  }

  // 全ルールの検証実行
  validate() {
    this.results = [];

    Object.entries(this.rules).forEach(([name, rule]) => {
      const result = this.validateRule(name, rule);
      this.results.push(result);
    });

    // ページ高さチェックを追加
    const pageHeightResults = this.checkPageHeight();
    this.results.push(...pageHeightResults);

    return this.results;
  }

  // レポート生成
  generateReport() {
    const results = this.validate();
    const errors = results.filter((r) => r.status === 'fail' && r.severity === 'error');
    const warnings = results.filter((r) => r.status === 'fail' && r.severity === 'warning');

    if (window.Debug) {
      const logger = window.Debug;

      logger.log('LAYOUT_VALIDATION', '📋 レイアウト検証レポート', {
        timestamp: new Date().toLocaleString(),
        totalChecks: results.length,
        errorCount: errors.length,
        warningCount: warnings.length,
      });

      if (errors.length > 0) {
        errors.forEach((error) => {
          logger.error('LAYOUT_VALIDATION', error.message, {
            rule: error.rule,
            expected: error.expectedRange,
            actual: error.actualValue,
          });
        });
      }

      if (warnings.length > 0) {
        warnings.forEach((warning) => {
          logger.warn('LAYOUT_VALIDATION', warning.message, {
            rule: warning.rule,
            expected: warning.expectedRange,
            actual: warning.actualValue,
          });
        });
      }

      logger.log('LAYOUT_VALIDATION_DETAILS', '検証結果一覧', {
        results,
      });
    }

    return {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        passed: results.filter((r) => r.status === 'pass').length,
        failed: results.filter((r) => r.status === 'fail').length,
        skipped: results.filter((r) => r.status === 'skip').length,
      },
      errors,
      warnings,
      details: results,
    };
  }
}

// グローバルに公開
window.LayoutValidator = LayoutValidator;
