const puppeteer = require('puppeteer');

async function checkPrintLayout() {
  console.log('印刷レイアウトをチェックしています...');

  const browser = await puppeteer.launch({ headless: false }); // 表示させて確認
  const page = await browser.newPage();

  // 印刷用にページを設定
  await page.emulateMediaType('print');

  try {
    // ローカルサーバーにアクセス
    console.log('ページを読み込んでいます...');
    await page.goto('http://localhost:3004?t=' + Date.now(), {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // フレーズ練習モードを選択
    console.log('フレーズ練習モードを選択しています...');
    await page.select('#practiceMode', 'phrase');

    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 日本語訳と使用場面を表示
    const translationCheckbox = await page.$('#showTranslation');
    if (translationCheckbox) {
      const isChecked = await page.evaluate(el => el.checked, translationCheckbox);
      if (!isChecked) {
        await translationCheckbox.click();
      }
    }

    const situationCheckbox = await page.$('#showSituation');
    if (situationCheckbox) {
      const isChecked = await page.evaluate(el => el.checked, situationCheckbox);
      if (!isChecked) {
        await situationCheckbox.click();
      }
    }

    // プレビューが更新されるまで待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 印刷メディアでの実際の測定
    const printMeasurements = await page.evaluate(() => {
      // 印刷時のA4サイズ（mm）
      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;

      // 現在のページサイズ（px）
      const pageWidth = window.innerWidth;
      const pageHeight = window.innerHeight;

      // px to mm 変換係数
      const pxToMm = 25.4 / 96; // 96 DPI assumed

      // note-page要素の測定
      const notePage = document.querySelector('.note-page');
      const notePreview = document.getElementById('notePreview');

      if (!notePage || !notePreview) {
        return { error: 'Required elements not found' };
      }

      const notePageRect = notePage.getBoundingClientRect();
      const notePreviewRect = notePreview.getBoundingClientRect();

      // 詳細な要素測定
      const title = document.querySelector('.phrase-practice h3');
      const phraseItems = document.querySelectorAll('.phrase-item');

      const measurements = {
        pageSize: {
          widthPx: pageWidth,
          heightPx: pageHeight,
          widthMm: pageWidth * pxToMm,
          heightMm: pageHeight * pxToMm
        },
        notePage: {
          widthPx: notePageRect.width,
          heightPx: notePageRect.height,
          widthMm: notePageRect.width * pxToMm,
          heightMm: notePageRect.height * pxToMm,
          topPx: notePageRect.top,
          topMm: notePageRect.top * pxToMm
        },
        content: {
          totalHeightPx: notePreviewRect.height,
          totalHeightMm: notePreviewRect.height * pxToMm,
          scrollHeightPx: notePreview.scrollHeight,
          scrollHeightMm: notePreview.scrollHeight * pxToMm
        },
        elements: []
      };

      // タイトル測定
      if (title) {
        const titleRect = title.getBoundingClientRect();
        measurements.elements.push({
          type: 'title',
          heightPx: titleRect.height,
          heightMm: titleRect.height * pxToMm,
          topPx: titleRect.top,
          topMm: titleRect.top * pxToMm
        });
      }

      // フレーズ測定
      phraseItems.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const header = item.querySelector('.phrase-header');
        const lines = item.querySelector('.phrase-lines');

        measurements.elements.push({
          type: 'phrase',
          index: index + 1,
          totalHeightPx: itemRect.height,
          totalHeightMm: itemRect.height * pxToMm,
          headerHeightPx: header ? header.getBoundingClientRect().height : 0,
          headerHeightMm: header ? header.getBoundingClientRect().height * pxToMm : 0,
          linesHeightPx: lines ? lines.getBoundingClientRect().height : 0,
          linesHeightMm: lines ? lines.getBoundingClientRect().height * pxToMm : 0,
          topPx: itemRect.top,
          topMm: itemRect.top * pxToMm
        });
      });

      // 余白計算
      const contentEndPx = Math.max(...measurements.elements.map(e => e.topPx + e.totalHeightPx));
      const pageBottomPx = notePageRect.bottom;
      const remainingSpacePx = pageBottomPx - contentEndPx;

      measurements.spacing = {
        contentEndPx: contentEndPx,
        contentEndMm: contentEndPx * pxToMm,
        pageBottomPx: pageBottomPx,
        pageBottomMm: pageBottomPx * pxToMm,
        remainingSpacePx: remainingSpacePx,
        remainingSpaceMm: remainingSpacePx * pxToMm,
        remainingPercentage: (remainingSpacePx / notePageRect.height) * 100
      };

      return measurements;
    });

    if (printMeasurements.error) {
      console.error('測定エラー:', printMeasurements.error);
      return;
    }

    console.log('\n📏 印刷レイアウト測定結果:');
    console.log(`ページサイズ: ${printMeasurements.pageSize.widthMm.toFixed(1)}mm × ${printMeasurements.pageSize.heightMm.toFixed(1)}mm`);
    console.log(`ノートページ: ${printMeasurements.notePage.widthMm.toFixed(1)}mm × ${printMeasurements.notePage.heightMm.toFixed(1)}mm`);

    console.log('\n📝 要素詳細:');
    printMeasurements.elements.forEach(element => {
      if (element.type === 'title') {
        console.log(`タイトル: ${element.heightMm.toFixed(1)}mm (位置: ${element.topMm.toFixed(1)}mm)`);
      } else if (element.type === 'phrase') {
        console.log(`フレーズ${element.index}: ${element.totalHeightMm.toFixed(1)}mm (位置: ${element.topMm.toFixed(1)}mm)`);
        console.log(`  - ヘッダー: ${element.headerHeightMm.toFixed(1)}mm`);
        console.log(`  - 罫線: ${element.linesHeightMm.toFixed(1)}mm`);
      }
    });

    console.log('\n📊 余白分析:');
    console.log(`コンテンツ終了位置: ${printMeasurements.spacing.contentEndMm.toFixed(1)}mm`);
    console.log(`ページ底: ${printMeasurements.spacing.pageBottomMm.toFixed(1)}mm`);
    console.log(`残り余白: ${printMeasurements.spacing.remainingSpaceMm.toFixed(1)}mm`);
    console.log(`余白率: ${printMeasurements.spacing.remainingPercentage.toFixed(1)}%`);

    // A4チェック
    const A4_HEIGHT_MM = 297;
    const isOverflowing = printMeasurements.content.totalHeightMm > A4_HEIGHT_MM;
    console.log('\n🚨 A4収まりチェック:');
    console.log(`A4高さ: ${A4_HEIGHT_MM}mm`);
    console.log(`コンテンツ高さ: ${printMeasurements.content.totalHeightMm.toFixed(1)}mm`);
    console.log(`結果: ${isOverflowing ? '❌ オーバーフロー' : '✅ 収まっている'}`);

    if (isOverflowing) {
      const overflow = printMeasurements.content.totalHeightMm - A4_HEIGHT_MM;
      console.log(`オーバーフロー: ${overflow.toFixed(1)}mm`);
    }

    console.log('\n⏸️  ブラウザを手動で確認してください。Enterを押すと終了します...');

    // ユーザーの確認を待つ（headless: falseの場合）
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await browser.close();
  }
}

checkPrintLayout().catch(console.error);
