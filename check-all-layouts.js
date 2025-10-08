const puppeteer = require('puppeteer');

async function checkAllLayouts() {
  console.log('全練習モードのレイアウトをチェックしています...\n');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // ページサイズをA4に設定
  await page.setViewport({ width: 794, height: 1123 }); // A4サイズ（96dpi）
  await page.setCacheEnabled(false);

  try {
    // ローカルサーバーにアクセス
    await page.goto('http://localhost:3004?t=' + Date.now(), {
      waitUntil: 'networkidle0',
      timeout: 10000,
    });

    // 各練習モードをチェック
    const modes = [
      { value: 'normal', name: '通常練習' },
      { value: 'sentence', name: '文章練習' },
      { value: 'word', name: '単語練習' },
      { value: 'alphabet', name: 'アルファベット練習' },
      { value: 'phrase', name: 'フレーズ練習' },
    ];

    for (const mode of modes) {
      console.log(`\n======== ${mode.name} ========`);

      // モードを選択
      await page.select('#practiceMode', mode.value);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 各モードの特別な設定
      if (mode.value === 'sentence' || mode.value === 'phrase') {
        const showTranslation = await page.$('#showTranslation');
        if (showTranslation) {
          const isChecked = await page.evaluate((el) => el.checked, showTranslation);
          if (!isChecked) await showTranslation.click();
        }
      }

      if (mode.value === 'phrase') {
        const showSituation = await page.$('#showSituation');
        if (showSituation) {
          const isChecked = await page.evaluate((el) => el.checked, showSituation);
          if (!isChecked) await showSituation.click();
        }
      }

      if (mode.value === 'word') {
        await page.select('#wordCategory', 'animals');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // レイアウト測定
      const measurements = await page.evaluate(() => {
        const preview = document.getElementById('notePreview');
        if (!preview) return null;

        const rect = preview.getBoundingClientRect();
        const pxToMm = 0.264583;

        // 練習モード別の要素取得
        const getModeSpecificInfo = () => {
          const practiceMode = document.getElementById('practiceMode').value;
          const info = { mode: practiceMode, items: [] };

          switch (practiceMode) {
            case 'normal':
              const normalGroups = document.querySelectorAll('.baseline-group');
              info.itemCount = normalGroups.length;
              info.itemType = '罫線';
              break;

            case 'sentence':
              const sentences = document.querySelectorAll('.example-sentence');
              info.itemCount = sentences.length;
              info.itemType = '例文';
              sentences.forEach((s, i) => {
                const lines = s.nextElementSibling?.querySelectorAll('.baseline-group').length || 0;
                info.items.push({ index: i + 1, lines });
              });
              break;

            case 'word':
              const words = document.querySelectorAll('.word-practice-item');
              info.itemCount = words.length;
              info.itemType = '単語';
              break;

            case 'alphabet':
              const letters = document.querySelectorAll('.alphabet-grid-item');
              info.itemCount = letters.length;
              info.itemType = '文字';
              break;

            case 'phrase':
              const phrases = document.querySelectorAll('.phrase-item');
              info.itemCount = phrases.length;
              info.itemType = 'フレーズ';
              phrases.forEach((p, i) => {
                const lines = p.querySelectorAll('.baseline-group').length;
                info.items.push({ index: i + 1, lines });
              });
              break;
          }

          return info;
        };

        const modeInfo = getModeSpecificInfo();

        // タイトル要素を探す
        const title = preview.querySelector('h3, .practice-title');
        const titleHeight = title ? title.getBoundingClientRect().height : 0;

        return {
          scrollHeight: preview.scrollHeight,
          scrollHeightMm: preview.scrollHeight * pxToMm,
          clientHeight: rect.height,
          clientHeightMm: rect.height * pxToMm,
          titleHeightMm: titleHeight * pxToMm,
          ...modeInfo,
        };
      });

      if (!measurements) {
        console.log('測定失敗');
        continue;
      }

      // 結果表示
      console.log(`📏 レイアウト:
- コンテンツ高さ: ${measurements.scrollHeightMm.toFixed(1)}mm
- ${measurements.itemType}数: ${measurements.itemCount}
- タイトル高さ: ${measurements.titleHeightMm.toFixed(1)}mm`);

      // 詳細情報
      if (measurements.items && measurements.items.length > 0) {
        console.log('📝 詳細:');
        measurements.items.forEach((item) => {
          console.log(`  - ${measurements.itemType}${item.index}: ${item.lines}行`);
        });
      }

      // A4チェック
      const A4_HEIGHT_MM = 297;
      const isOverflowing = measurements.scrollHeightMm > A4_HEIGHT_MM;
      console.log(
        `\n🚨 A4収まり: ${isOverflowing ? '❌ オーバーフロー' : '✅ OK'} (${(measurements.scrollHeightMm - A4_HEIGHT_MM).toFixed(1)}mm)`
      );

      // 余白率計算
      const usageRate = ((measurements.scrollHeightMm / A4_HEIGHT_MM) * 100).toFixed(1);
      console.log(`📊 使用率: ${usageRate}%`);
    }

    console.log('\n\n========== サマリー ==========');
    console.log('A4高さ基準: 297mm');
    console.log('測定方法: scrollHeight × 0.264583 (96dpi基準)');
    console.log('\n⚠️  注意: 実際の印刷時は印刷プレビューで確認してください');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await browser.close();
  }
}

checkAllLayouts().catch(console.error);
