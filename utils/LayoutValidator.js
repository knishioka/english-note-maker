/**
 * LayoutValidator - 印刷品質を自動検証するクラス
 *
 * A4サイズ、余白、罫線、フォントサイズなどの品質基準を検証し、
 * 印刷前に問題を検出します。
 */

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

  // 全ルールの検証実行
  validate() {
    this.results = [];

    Object.entries(this.rules).forEach(([name, rule]) => {
      const result = this.validateRule(name, rule);
      this.results.push(result);
    });

    return this.results;
  }

  // A4サイズ超過チェック
  checkPageOverflow() {
    const notePages = document.querySelectorAll('.note-page');
    const overflows = [];

    notePages.forEach((notePage, index) => {
      const rect = notePage.getBoundingClientRect();
      const heightInMm = this.pxToMm(rect.height);

      if (heightInMm > 297) {
        overflows.push({
          pageIndex: index + 1,
          height: heightInMm.toFixed(1),
          overflow: (heightInMm - 297).toFixed(1),
        });
      }
    });

    if (overflows.length > 0) {
      return {
        status: 'fail',
        severity: 'error',
        message: `${overflows.length}ページがA4サイズを超えています`,
        details: overflows,
      };
    }

    return {
      status: 'pass',
      message: `全${notePages.length}ページがA4サイズ内に収まっています`,
    };
  }

  // レポート生成
  generateReport() {
    const results = this.validate();
    const overflowCheck = this.checkPageOverflow();

    const allResults = [...results, overflowCheck];
    const errors = allResults.filter((r) => r.status === 'fail' && r.severity === 'error');
    const warnings = allResults.filter((r) => r.status === 'fail' && r.severity === 'warning');

    /* eslint-disable no-console */
    console.group('📋 レイアウト検証レポート');
    console.log(`検証日時: ${new Date().toLocaleString()}`);
    console.log(`総チェック数: ${allResults.length}`);
    console.log(`エラー: ${errors.length}`);
    console.log(`警告: ${warnings.length}`);

    if (errors.length > 0) {
      console.group('❌ エラー');
      errors.forEach((e) => {
        console.error(e.message);
        if (e.details) {
          console.table(e.details);
        }
      });
      console.groupEnd();
    }

    if (warnings.length > 0) {
      console.group('⚠️ 警告');
      warnings.forEach((w) => console.warn(w.message));
      console.groupEnd();
    }

    console.table(results);
    console.groupEnd();
    /* eslint-enable no-console */

    return {
      timestamp: new Date().toISOString(),
      summary: {
        total: allResults.length,
        passed: allResults.filter((r) => r.status === 'pass').length,
        failed: allResults.filter((r) => r.status === 'fail').length,
        skipped: allResults.filter((r) => r.status === 'skip').length,
      },
      errors,
      warnings,
      details: allResults,
    };
  }

  // 印刷品質スコア計算
  calculateQualityScore() {
    const report = this.generateReport();
    const { total, passed } = report.summary;

    // エラーは-20点、警告は-10点
    const errorPenalty = report.errors.length * 20;
    const warningPenalty = report.warnings.length * 10;

    const baseScore = total > 0 ? (passed / total) * 100 : 0;
    const finalScore = Math.max(0, baseScore - errorPenalty - warningPenalty);

    let grade;
    if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 70) grade = 'B';
    else if (finalScore >= 50) grade = 'C';
    else grade = 'D';

    return {
      score: Math.round(finalScore),
      grade,
      errors: report.errors.length,
      warnings: report.warnings.length,
      details: report.details,
    };
  }
}

// グローバルスコープで利用可能に（ブラウザ専用）
if (typeof window !== 'undefined') {
  window.LayoutValidator = LayoutValidator;
}
