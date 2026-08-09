/**
 * PrintSimulator - 印刷シミュレーションと品質チェック
 *
 * 実際の印刷前に品質問題を検出し、ユーザーに警告します。
 */

class PrintSimulator {
  constructor() {
    this.A4 = {
      width: 210, // mm
      height: 297, // mm
      dpi: 300,
    };
  }

  // ピクセルをミリメートルに変換
  pxToMm(px) {
    return px / 3.7795275591;
  }

  // A4サイズ超過チェック
  checkPageOverflow() {
    const notePages = document.querySelectorAll('.note-page');
    if (notePages.length === 0) {
      return { status: 'error', message: 'ページ要素が見つかりません' };
    }

    const overflows = [];
    notePages.forEach((notePage, index) => {
      // 表示は transform で縮小されるので、印刷される実寸（offsetHeight）で測る
      const heightInMm = this.pxToMm(notePage.offsetHeight);

      // offsetHeight の丸めで、ちょうど A4 でも 0.1mm ほど超えるため許容差を持たせる
      if (heightInMm > this.A4.height + 0.5) {
        overflows.push({
          page: index + 1,
          height: heightInMm.toFixed(1),
          overflow: (heightInMm - this.A4.height).toFixed(1),
        });
      }
    });

    if (overflows.length > 0) {
      return {
        status: 'fail',
        message: `${overflows.length}ページがA4を超えています`,
        overflows,
      };
    }

    return {
      status: 'pass',
      message: `全${notePages.length}ページがA4内に収まっています`,
    };
  }

  // 印刷マージンチェック
  checkPrintMargins() {
    const notePages = document.querySelectorAll('.note-page');
    if (notePages.length === 0) {
      return { status: 'error', message: 'ページ要素が見つかりません' };
    }

    const issues = [];
    notePages.forEach((notePage, index) => {
      const style = window.getComputedStyle(notePage);
      const padding = {
        top: this.pxToMm(parseFloat(style.paddingTop)),
        right: this.pxToMm(parseFloat(style.paddingRight)),
        bottom: this.pxToMm(parseFloat(style.paddingBottom)),
        left: this.pxToMm(parseFloat(style.paddingLeft)),
      };

      // 最小マージンチェック (10mm)
      Object.entries(padding).forEach(([side, value]) => {
        if (value < 10) {
          issues.push({
            page: index + 1,
            side,
            value: value.toFixed(1),
            minimum: 10,
          });
        }
      });
    });

    if (issues.length > 0) {
      return {
        status: 'fail',
        message: `${issues.length}箇所でマージンが不足しています`,
        issues,
      };
    }

    return {
      status: 'pass',
      message: '全ページのマージンが適切です',
    };
  }

  // 線の視認性チェック
  checkLineVisibility() {
    const lines = document.querySelectorAll('.baseline');
    if (lines.length === 0) {
      return { status: 'skip', message: '罫線が見つかりません（練習モードによる）' };
    }

    const thinLines = [];
    lines.forEach((line, index) => {
      const style = window.getComputedStyle(line);
      const width = parseFloat(style.borderBottomWidth);

      if (width < 0.5) {
        thinLines.push({ index, width: width.toFixed(2) });
      }
    });

    if (thinLines.length > 0) {
      return {
        status: 'warning',
        message: `${thinLines.length}本の罫線が細すぎます`,
        details: thinLines,
      };
    }

    return {
      status: 'pass',
      message: '罫線の太さは適切です',
    };
  }

  // フォント可読性チェック
  checkFontReadability() {
    const texts = document.querySelectorAll('.example-english, .example-japanese, .phrase-english');
    if (texts.length === 0) {
      return { status: 'skip', message: 'テキスト要素が見つかりません' };
    }

    const smallTexts = [];
    texts.forEach((text, index) => {
      const style = window.getComputedStyle(text);
      const sizeInPt = parseFloat(style.fontSize) / 1.333333;

      if (sizeInPt < 10) {
        smallTexts.push({
          index,
          size: sizeInPt.toFixed(1),
          text: text.textContent.substring(0, 30) + '...',
        });
      }
    });

    if (smallTexts.length > 0) {
      return {
        status: 'fail',
        message: `${smallTexts.length}箇所で文字が小さすぎます`,
        details: smallTexts,
      };
    }

    return {
      status: 'pass',
      message: 'フォントサイズは適切です',
    };
  }

  // コンテンツ密度チェック
  checkContentDensity() {
    const notePages = document.querySelectorAll('.note-page');
    if (notePages.length === 0) {
      return { status: 'error', message: 'ページ要素が見つかりません' };
    }

    const densityIssues = [];
    notePages.forEach((page, index) => {
      // 同上。縮小表示の影響を受けない実寸で測る
      const pageHeightMm = this.pxToMm(page.offsetHeight);
      const usageRatio = pageHeightMm / this.A4.height;

      // 95%以上使用していたら警告
      if (usageRatio > 0.95) {
        densityIssues.push({
          page: index + 1,
          usage: (usageRatio * 100).toFixed(1) + '%',
          height: pageHeightMm.toFixed(1) + 'mm',
        });
      }
    });

    if (densityIssues.length > 0) {
      return {
        status: 'warning',
        message: `${densityIssues.length}ページでコンテンツが密集しています`,
        details: densityIssues,
      };
    }

    return {
      status: 'pass',
      message: 'コンテンツ密度は適切です',
    };
  }

  // 印刷品質スコア計算
  calculatePrintQualityScore() {
    const checks = [
      this.checkPageOverflow(),
      this.checkPrintMargins(),
      this.checkLineVisibility(),
      this.checkFontReadability(),
      this.checkContentDensity(),
    ];

    const scores = {
      pass: 100,
      warning: 70,
      fail: 0,
      error: 0,
      skip: 100, // スキップは問題ないとみなす
    };

    const totalScore =
      checks.reduce((sum, check) => {
        return sum + (scores[check.status] || 0);
      }, 0) / checks.length;

    return {
      score: Math.round(totalScore),
      grade: totalScore >= 90 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 50 ? 'C' : 'D',
      details: checks,
    };
  }

  // 印刷前の総合診断
  diagnose() {
    const quality = this.calculatePrintQualityScore();

    /* eslint-disable no-console */
    console.group('🖨️ 印刷品質診断');
    console.log(`品質スコア: ${quality.score}/100 (${quality.grade})`);

    quality.details.forEach((detail) => {
      const icon = detail.status === 'pass' ? '✅' : detail.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${detail.message}`);
      if (detail.details || detail.overflows || detail.issues) {
        console.table(detail.details || detail.overflows || detail.issues);
      }
    });

    console.groupEnd();
    /* eslint-enable no-console */

    return quality;
  }
}

// グローバルスコープで利用可能に（ブラウザ専用）
if (typeof window !== 'undefined') {
  window.PrintSimulator = PrintSimulator;
}
