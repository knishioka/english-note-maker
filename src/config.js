/**
 * 英語ノートメーカー 統一設定ファイル
 *
 * 全ての寸法、色、フォント設定を一元管理
 * 印刷品質保証のための中央集権的設定システム
 */

// === 印刷レイアウト設定 ===
export const PRINT_LAYOUT = {
    // A4ページ設定
    pageSize: {
        width: '210mm',
        height: '297mm'
    },

    // 余白設定（印刷品質の要）
    margins: {
        // 基本余白
        standard: '5mm 10mm',
        // デバッグ/テスト用
        debug: '10mm 15mm',
        // 最小推奨余白
        minimum: '3mm 8mm'
    },

    // ベースライン設定
    baseline: {
        // 行高（英語練習標準）
        lineHeight: {
            small: '8mm',
            standard: '10mm',
            large: '12mm'
        },
        // 行間隔
        spacing: '2mm',
        // グループ間隔
        groupMargin: '10mm'
    }
};

// === 色設定 ===
export const COLORS = {
    baseline: {
        // 画面表示用
        screen: '#d0d0d0',
        // 印刷用（少し濃い）
        print: '#c0c0c0',
        // カラーオプション
        blue: '#b3d9ff',
        green: '#b3e5cc'
    },
    text: {
        primary: '#333',
        secondary: '#666',
        accent: '#2563eb'
    },
    background: {
        page: '#f5f5f5',
        content: '#ffffff'
    }
};

// === フォント設定 ===
export const FONTS = {
    sizes: {
        // 基本フォントサイズ
        body: '14px',
        title: '24px',
        subtitle: '18px',
        small: '12px',
        tiny: '10px'
    },
    families: {
        // 英語練習用フォント
        practice: '"Times New Roman", serif',
        // UI用フォント
        ui: '"Segoe UI", "Roboto", sans-serif',
        // 日本語用フォント
        japanese: '"Hiragino Sans", "Yu Gothic", sans-serif'
    }
};

// === CSS変数生成関数 ===
export function generateCSSVariables() {
    return `
        /* === 印刷レイアウト変数 === */
        --page-width: ${PRINT_LAYOUT.pageSize.width};
        --page-height: ${PRINT_LAYOUT.pageSize.height};
        --margin-standard: ${PRINT_LAYOUT.margins.standard};
        --margin-debug: ${PRINT_LAYOUT.margins.debug};
        --margin-minimum: ${PRINT_LAYOUT.margins.minimum};

        /* === ベースライン変数 === */
        --line-height-small: ${PRINT_LAYOUT.baseline.lineHeight.small};
        --line-height-standard: ${PRINT_LAYOUT.baseline.lineHeight.standard};
        --line-height-large: ${PRINT_LAYOUT.baseline.lineHeight.large};
        --line-spacing: ${PRINT_LAYOUT.baseline.spacing};
        --group-margin: ${PRINT_LAYOUT.baseline.groupMargin};

        /* === 色変数 === */
        --baseline-color-screen: ${COLORS.baseline.screen};
        --baseline-color-print: ${COLORS.baseline.print};
        --baseline-color-blue: ${COLORS.baseline.blue};
        --baseline-color-green: ${COLORS.baseline.green};
        --text-primary: ${COLORS.text.primary};
        --text-secondary: ${COLORS.text.secondary};
        --text-accent: ${COLORS.text.accent};

        /* === フォント変数 === */
        --font-size-body: ${FONTS.sizes.body};
        --font-size-title: ${FONTS.sizes.title};
        --font-size-subtitle: ${FONTS.sizes.subtitle};
        --font-size-small: ${FONTS.sizes.small};
        --font-size-tiny: ${FONTS.sizes.tiny};
        --font-practice: ${FONTS.families.practice};
        --font-ui: ${FONTS.families.ui};
        --font-japanese: ${FONTS.families.japanese};
    `.trim();
}

// === 設定取得ヘルパー関数 ===
export class ConfigManager {
    static getMargin(type = 'standard') {
        return PRINT_LAYOUT.margins[type] || PRINT_LAYOUT.margins.standard;
    }

    static getLineHeight(size = 'standard') {
        return PRINT_LAYOUT.baseline.lineHeight[size] || PRINT_LAYOUT.baseline.lineHeight.standard;
    }

    static getBaselineColor(context = 'screen') {
        return COLORS.baseline[context] || COLORS.baseline.screen;
    }

    static getFontSize(type = 'body') {
        return FONTS.sizes[type] || FONTS.sizes.body;
    }

    // 設定検証機能
    static validateConfig() {
        const issues = [];

        // 余白の妥当性チェック
        Object.entries(PRINT_LAYOUT.margins).forEach(([key, value]) => {
            const match = value.match(/(\d+)mm\s+(\d+)mm/);
            if (match) {
                const [, vertical, horizontal] = match;
                if (parseInt(vertical) < 3) issues.push(`${key} 余白の縦方向が小さすぎます: ${vertical}mm`);
                if (parseInt(horizontal) < 8) issues.push(`${key} 余白の横方向が小さすぎます: ${horizontal}mm`);
            }
        });

        return {
            valid: issues.length === 0,
            issues
        };
    }

    // デバッグ情報出力
    static debugInfo() {
        return {
            PRINT_LAYOUT,
            COLORS,
            FONTS,
            validation: this.validateConfig()
        };
    }
}