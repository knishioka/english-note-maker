# 印刷品質保証ガイド

## 🎯 印刷品質の重要指標

### 1. レイアウト基準値

#### 罫線仕様
| 項目 | 最小値 | 推奨値 | 最大値 | 単位 | 理由 |
|------|--------|--------|--------|------|------|
| 罫線高さ | 8 | 10 | 12 | mm | 子どもの手の大きさに対応 |
| 罫線間隔 | 1 | 2-4 | 5 | mm | 視覚的な区切りと書きやすさ |
| 罫線太さ | 0.5 | 0.8-1.0 | 1.5 | px | 印刷時の視認性 |
| ベースライン太さ | 1.0 | 1.5-2.0 | 2.5 | px | 基準線の強調 |

#### ページレイアウト
| 項目 | 最小値 | 推奨値 | 最大値 | 単位 | 理由 |
|------|--------|--------|--------|------|------|
| 上下余白 | 10 | 10-15 | 20 | mm | 綴じ代と持ちやすさ |
| 左右余白 | 10 | 10-15 | 20 | mm | 書き始めの余裕 |
| 1ページ行数 | 10 | 15-20 | 25 | 行 | A4収まりと練習量 |

#### フォントサイズ
| 要素 | 最小値 | 推奨値 | 最大値 | 単位 | 理由 |
|------|--------|--------|--------|------|------|
| 英語例文 | 12 | 14-16 | 18 | pt | 読みやすさと参考性 |
| 日本語訳 | 10 | 11-13 | 14 | pt | 補助的情報 |
| ガイド文字 | 14 | 16-18 | 20 | pt | なぞり書き用 |

### 2. 印刷適性チェック項目

#### 必須要件
- [ ] A4用紙1枚に収まる
- [ ] 300DPI相当の品質
- [ ] モノクロ印刷対応
- [ ] 裏写りしない濃度

#### 推奨要件
- [ ] カラー印刷での視認性
- [ ] 両面印刷対応
- [ ] インクジェット/レーザー両対応

## 🔍 品質検証の実装

### 1. 自動レイアウト検証システム

```javascript
// layout-validator-advanced.js

class LayoutValidator {
    constructor() {
        this.rules = {
            lineHeight: {
                selector: '.baseline-group',
                property: 'height',
                min: 8,
                max: 12,
                unit: 'mm',
                severity: 'error'
            },
            lineSpacing: {
                selector: '.line-separator-small',
                property: 'height',
                min: 1,
                max: 5,
                unit: 'mm',
                severity: 'warning'
            },
            baselineThickness: {
                selector: '.baseline--lower',
                property: 'borderBottomWidth',
                min: 1,
                max: 2.5,
                unit: 'px',
                severity: 'error'
            },
            pageMargin: {
                selector: '.note-page',
                property: 'padding',
                min: 10,
                max: 20,
                unit: 'mm',
                severity: 'error'
            },
            fontSize: {
                selector: '.example-english',
                property: 'fontSize',
                min: 12,
                max: 18,
                unit: 'pt',
                severity: 'warning'
            }
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
                message: `要素が見つかりません: ${rule.selector}`
            };
        }
        
        const values = [];
        elements.forEach(element => {
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
                : `❌ ${ruleName}: ${avgValue.toFixed(2)}${rule.unit} (期待値: ${rule.min}-${rule.max}${rule.unit})`
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
    
    // レポート生成
    generateReport() {
        const results = this.validate();
        const errors = results.filter(r => r.status === 'fail' && r.severity === 'error');
        const warnings = results.filter(r => r.status === 'fail' && r.severity === 'warning');
        
        console.group('📋 レイアウト検証レポート');
        console.log(`検証日時: ${new Date().toLocaleString()}`);
        console.log(`総チェック数: ${results.length}`);
        console.log(`エラー: ${errors.length}`);
        console.log(`警告: ${warnings.length}`);
        
        if (errors.length > 0) {
            console.group('❌ エラー');
            errors.forEach(e => console.error(e.message));
            console.groupEnd();
        }
        
        if (warnings.length > 0) {
            console.group('⚠️ 警告');
            warnings.forEach(w => console.warn(w.message));
            console.groupEnd();
        }
        
        console.table(results);
        console.groupEnd();
        
        return {
            timestamp: new Date().toISOString(),
            summary: {
                total: results.length,
                passed: results.filter(r => r.status === 'pass').length,
                failed: results.filter(r => r.status === 'fail').length,
                skipped: results.filter(r => r.status === 'skip').length
            },
            errors,
            warnings,
            details: results
        };
    }
}

// 使用例
const validator = new LayoutValidator();
validator.generateReport();
```

### 2. 印刷シミュレーター

```javascript
// print-simulator.js

class PrintSimulator {
    constructor() {
        this.A4 = {
            width: 210,  // mm
            height: 297, // mm
            dpi: 300
        };
    }
    
    // A4サイズ超過チェック
    checkPageOverflow() {
        const notePage = document.querySelector('.note-page');
        if (!notePage) return { status: 'error', message: 'ページ要素が見つかりません' };
        
        const rect = notePage.getBoundingClientRect();
        const heightInMm = rect.height / 3.7795275591;
        
        if (heightInMm > this.A4.height) {
            return {
                status: 'fail',
                message: `ページ高さが A4 を超えています: ${heightInMm.toFixed(1)}mm (最大: ${this.A4.height}mm)`,
                overflow: heightInMm - this.A4.height
            };
        }
        
        return {
            status: 'pass',
            message: `ページ高さ: ${heightInMm.toFixed(1)}mm (A4内に収まっています)`
        };
    }
    
    // 印刷マージンチェック
    checkPrintMargins() {
        const notePage = document.querySelector('.note-page');
        if (!notePage) return { status: 'error', message: 'ページ要素が見つかりません' };
        
        const style = window.getComputedStyle(notePage);
        const padding = {
            top: parseFloat(style.paddingTop) / 3.7795275591,
            right: parseFloat(style.paddingRight) / 3.7795275591,
            bottom: parseFloat(style.paddingBottom) / 3.7795275591,
            left: parseFloat(style.paddingLeft) / 3.7795275591
        };
        
        const issues = [];
        
        // 最小マージンチェック (5mm)
        Object.entries(padding).forEach(([side, value]) => {
            if (value < 5) {
                issues.push(`${side}: ${value.toFixed(1)}mm (最小: 5mm)`);
            }
        });
        
        if (issues.length > 0) {
            return {
                status: 'warning',
                message: `マージンが小さすぎます: ${issues.join(', ')}`,
                margins: padding
            };
        }
        
        return {
            status: 'pass',
            message: 'マージンは適切です',
            margins: padding
        };
    }
    
    // 印刷品質スコア計算
    calculatePrintQualityScore() {
        const checks = [
            this.checkPageOverflow(),
            this.checkPrintMargins(),
            this.checkLineVisibility(),
            this.checkFontReadability()
        ];
        
        const scores = {
            pass: 100,
            warning: 70,
            fail: 0,
            error: 0
        };
        
        const totalScore = checks.reduce((sum, check) => {
            return sum + (scores[check.status] || 0);
        }, 0) / checks.length;
        
        return {
            score: Math.round(totalScore),
            grade: totalScore >= 90 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 50 ? 'C' : 'D',
            details: checks
        };
    }
    
    // 線の視認性チェック
    checkLineVisibility() {
        const lines = document.querySelectorAll('.baseline');
        if (lines.length === 0) return { status: 'error', message: '罫線が見つかりません' };
        
        const thinLines = [];
        lines.forEach((line, index) => {
            const style = window.getComputedStyle(line);
            const width = parseFloat(style.borderBottomWidth);
            
            if (width < 0.5) {
                thinLines.push(index);
            }
        });
        
        if (thinLines.length > 0) {
            return {
                status: 'warning',
                message: `細すぎる罫線があります: ${thinLines.length}本`,
                affectedLines: thinLines
            };
        }
        
        return {
            status: 'pass',
            message: '罫線の太さは適切です'
        };
    }
    
    // フォント可読性チェック
    checkFontReadability() {
        const texts = document.querySelectorAll('.example-english, .example-japanese');
        if (texts.length === 0) return { status: 'pass', message: '例文なし' };
        
        const smallTexts = [];
        texts.forEach((text, index) => {
            const style = window.getComputedStyle(text);
            const size = parseFloat(style.fontSize);
            
            if (size < 10) {
                smallTexts.push({
                    index,
                    size: size.toFixed(1),
                    text: text.textContent.substring(0, 20) + '...'
                });
            }
        });
        
        if (smallTexts.length > 0) {
            return {
                status: 'fail',
                message: `読みにくいフォントサイズ: ${smallTexts.length}箇所`,
                details: smallTexts
            };
        }
        
        return {
            status: 'pass',
            message: 'フォントサイズは適切です'
        };
    }
}

// 印刷前の品質チェック
window.addEventListener('beforeprint', () => {
    const simulator = new PrintSimulator();
    const qualityScore = simulator.calculatePrintQualityScore();
    
    console.group('🖨️ 印刷品質診断');
    console.log(`品質スコア: ${qualityScore.score}/100 (${qualityScore.grade})`);
    qualityScore.details.forEach(detail => {
        const icon = detail.status === 'pass' ? '✅' : 
                    detail.status === 'warning' ? '⚠️' : '❌';
        console.log(`${icon} ${detail.message}`);
    });
    console.groupEnd();
    
    // Dグレードの場合は警告
    if (qualityScore.grade === 'D') {
        alert('印刷品質に重大な問題があります。設定を確認してください。');
    }
});
```

### 3. ビジュアル品質インジケーター

```javascript
// quality-indicator.js

class QualityIndicator {
    constructor() {
        this.createIndicator();
    }
    
    createIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'quality-indicator';
        indicator.innerHTML = `
            <div class="quality-badge">
                <span class="quality-score">-</span>
                <span class="quality-grade">-</span>
            </div>
            <div class="quality-details" style="display: none;">
                <h4>印刷品質診断</h4>
                <ul id="quality-issues"></ul>
                <button id="recheck-quality">再チェック</button>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #quality-indicator {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border: 2px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            
            .quality-badge {
                padding: 10px 15px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .quality-score {
                font-size: 24px;
                font-weight: bold;
            }
            
            .quality-grade {
                font-size: 18px;
                padding: 2px 8px;
                border-radius: 4px;
                color: white;
            }
            
            .quality-grade.A { background: #059669; }
            .quality-grade.B { background: #3b82f6; }
            .quality-grade.C { background: #f59e0b; }
            .quality-grade.D { background: #ef4444; }
            
            .quality-details {
                padding: 15px;
                border-top: 1px solid #ddd;
                max-width: 300px;
            }
            
            .quality-details h4 {
                margin: 0 0 10px 0;
            }
            
            .quality-details ul {
                list-style: none;
                padding: 0;
                margin: 0 0 10px 0;
                font-size: 14px;
            }
            
            .quality-details li {
                padding: 5px 0;
            }
            
            @media print {
                #quality-indicator {
                    display: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(indicator);
        
        // イベントハンドラ
        indicator.querySelector('.quality-badge').addEventListener('click', () => {
            const details = indicator.querySelector('.quality-details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
        
        document.getElementById('recheck-quality').addEventListener('click', () => {
            this.updateQuality();
        });
    }
    
    updateQuality() {
        const validator = new LayoutValidator();
        const simulator = new PrintSimulator();
        const report = validator.generateReport();
        const quality = simulator.calculatePrintQualityScore();
        
        // スコア更新
        const scoreEl = document.querySelector('.quality-score');
        const gradeEl = document.querySelector('.quality-grade');
        
        scoreEl.textContent = quality.score;
        gradeEl.textContent = quality.grade;
        gradeEl.className = `quality-grade ${quality.grade}`;
        
        // 問題リスト更新
        const issuesList = document.getElementById('quality-issues');
        issuesList.innerHTML = '';
        
        [...report.errors, ...report.warnings].forEach(issue => {
            const li = document.createElement('li');
            li.textContent = `${issue.severity === 'error' ? '❌' : '⚠️'} ${issue.message}`;
            issuesList.appendChild(li);
        });
        
        if (issuesList.children.length === 0) {
            const li = document.createElement('li');
            li.textContent = '✅ 問題は見つかりませんでした';
            issuesList.appendChild(li);
        }
    }
}

// ページ読み込み時に品質インジケーター表示
document.addEventListener('DOMContentLoaded', () => {
    const indicator = new QualityIndicator();
    
    // 初期チェック
    setTimeout(() => indicator.updateQuality(), 1000);
    
    // 変更監視
    const observer = new MutationObserver(() => {
        indicator.updateQuality();
    });
    
    observer.observe(document.querySelector('.note-preview'), {
        childList: true,
        subtree: true
    });
});
```

## 📊 品質メトリクス

### 測定可能な品質指標

1. **レイアウト適合率**
   - 全チェック項目のうち合格した割合
   - 目標: 95%以上

2. **印刷成功率**
   - ユーザーが印刷を完了した割合
   - 目標: 90%以上

3. **可読性スコア**
   - フォントサイズと線の太さの総合評価
   - 目標: 80点以上

4. **A4適合率**
   - 1ページに収まった印刷の割合
   - 目標: 100%

## 🛠️ トラブルシューティング

### よくある印刷問題と対処法

| 問題 | 症状 | 原因 | 対処法 |
|------|------|------|--------|
| 線が薄い | 印刷時に罫線が見えにくい | 線の太さ不足 | borderWidth を 1px 以上に |
| ページ分割 | 2ページ目に溢れる | コンテンツ過多 | 行数を減らす |
| 余白なし | 端が切れる | マージン不足 | padding を 10mm 以上に |
| 文字つぶれ | 日本語が読めない | フォント小さい | font-size を 10pt 以上に |

### デバッグコマンド

```javascript
// コンソールでの品質チェック
const checkPrintQuality = () => {
    const validator = new LayoutValidator();
    const simulator = new PrintSimulator();
    
    console.group('🔍 印刷品質診断');
    validator.generateReport();
    console.log('---');
    console.log('品質スコア:', simulator.calculatePrintQualityScore());
    console.groupEnd();
};

// 実行
checkPrintQuality();
```