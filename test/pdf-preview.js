const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// テスト設定
const TEST_CONFIGS = [
  {
    name: 'normal-practice-default',
    settings: {
      practiceMode: 'normal',
      showExamples: false,
      lineHeight: '10',
      lineColor: 'gray',
      showHeader: false,
      pageCount: 1,
    },
  },
  {
    name: 'normal-practice-with-examples',
    settings: {
      practiceMode: 'normal',
      showExamples: true,
      ageGroup: '7-9',
      lineHeight: '10',
      lineColor: 'gray',
      showHeader: true,
      pageCount: 1,
    },
  },
  {
    name: 'sentence-practice-no-translation',
    settings: {
      practiceMode: 'sentence',
      showExamples: true,
      showTranslation: false,
      ageGroup: '7-9',
      lineHeight: '10',
      lineColor: 'blue',
      showHeader: true,
      pageCount: 1,
    },
  },
  {
    name: 'sentence-practice-with-translation',
    settings: {
      practiceMode: 'sentence',
      showExamples: true,
      showTranslation: true,
      ageGroup: '10-12',
      lineHeight: '12',
      lineColor: 'green',
      showHeader: true,
      pageCount: 1,
    },
  },
  {
    name: 'word-practice',
    settings: {
      practiceMode: 'word',
      ageGroup: '7-9',
      lineHeight: '10',
      lineColor: 'gray',
      showHeader: true,
      pageCount: 1,
    },
  },
  {
    name: 'multi-page-test',
    settings: {
      practiceMode: 'normal',
      showExamples: false,
      lineHeight: '10',
      lineColor: 'gray',
      showHeader: true,
      pageCount: 3,
    },
  },
  {
    name: 'small-line-height',
    settings: {
      practiceMode: 'normal',
      showExamples: false,
      lineHeight: '8',
      lineColor: 'gray',
      showHeader: false,
      pageCount: 1,
    },
  },
  {
    name: 'large-line-height',
    settings: {
      practiceMode: 'normal',
      showExamples: true,
      ageGroup: '4-6',
      lineHeight: '12',
      lineColor: 'blue',
      showHeader: true,
      pageCount: 1,
    },
  },
];

async function generatePDFPreview() {
  console.log('🚀 PDF Preview Test System Starting...\n');

  // 出力ディレクトリを作成
  const outputDir = path.join(__dirname, 'pdf-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // ブラウザを起動
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log('📋 Starting PDF generation tests...\n');

  for (const config of TEST_CONFIGS) {
    try {
      console.log(`📄 Generating: ${config.name}`);

      const page = await browser.newPage();

      // ローカルサーバーにアクセス
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      // 設定を適用
      for (const [key, value] of Object.entries(config.settings)) {
        const selector = `#${key}`;
        const element = await page.$(selector);

        if (element) {
          const tagName = await element.evaluate((el) => el.tagName.toLowerCase());

          if (tagName === 'select') {
            await page.select(selector, value);
          } else if (tagName === 'input') {
            const type = await element.evaluate((el) => el.type);
            if (type === 'checkbox') {
              const isChecked = await element.evaluate((el) => el.checked);
              if ((value === true && !isChecked) || (value === false && isChecked)) {
                await element.click();
              }
            } else {
              await page.evaluate(
                (sel, val) => {
                  document.querySelector(sel).value = val;
                },
                selector,
                value
              );
            }
          }
        }
      }

      // プレビューが更新されるまで待機
      await page.waitForTimeout(1000);

      // 品質検証を実行
      const validationResult = await page.evaluate(() => {
        if (window.LayoutValidator) {
          const validator = new window.LayoutValidator();
          return validator.generateReport();
        }
        return null;
      });

      // PDFを生成
      const pdfPath = path.join(outputDir, `${config.name}.pdf`);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      // スクリーンショットも保存
      const screenshotPath = path.join(outputDir, `${config.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(`   ✅ PDF saved: ${pdfPath}`);
      console.log(`   ✅ Screenshot saved: ${screenshotPath}`);

      // 検証結果を表示
      if (validationResult) {
        const errors = validationResult.errors.length;
        const warnings = validationResult.warnings.length;

        if (errors > 0 || warnings > 0) {
          console.log(`   ⚠️  Validation: ${errors} errors, ${warnings} warnings`);
          if (errors > 0) {
            validationResult.errors.forEach((err) => {
              console.log(`      ❌ ${err.message}`);
            });
          }
        } else {
          console.log('   ✅ Validation: All checks passed');
        }
      }

      console.log('');
      await page.close();
    } catch (error) {
      console.error(`   ❌ Error generating ${config.name}: ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('📊 Test Summary:');
  console.log(`   Total tests: ${TEST_CONFIGS.length}`);
  console.log(`   Output directory: ${outputDir}`);
  console.log('\n✨ PDF Preview Test Complete!');
  console.log('\n💡 Tip: Check the pdf-output directory for generated PDFs and screenshots.');
}

// サーバーが起動しているか確認
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

// メイン実行
async function main() {
  console.log('🔍 Checking if server is running on port 3000...');

  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.error('❌ Server is not running on http://localhost:3000');
    console.log('\n📌 Please start the server first:');
    console.log('   cd test && npm run serve');
    console.log('\n   Then run this test in another terminal:');
    console.log('   cd test && npm test');
    process.exit(1);
  }

  console.log('✅ Server is running!\n');

  // PDF生成テストを実行
  await generatePDFPreview();
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// 実行
main().catch(console.error);
