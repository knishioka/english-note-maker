const puppeteer = require('puppeteer');

async function testShuffle() {
  console.log('シャッフル機能をテストしています...\n');

  const browser = await puppeteer.launch({ headless: false }); // 表示して確認
  const page = await browser.newPage();

  try {
    // ページを開く
    await page.goto('http://localhost:3004', {
      waitUntil: 'networkidle0',
    });

    // フレーズ練習モードを選択
    await page.select('#practiceMode', 'phrase');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 最初のフレーズを記録
    const firstPhrases = await page.evaluate(() => {
      const items = document.querySelectorAll('.phrase-english');
      return Array.from(items).map((item) => item.textContent.trim());
    });

    console.log('初回のフレーズ:');
    firstPhrases.forEach((phrase, i) => console.log(`  ${i + 1}. ${phrase}`));

    // シャッフルボタンをクリック
    console.log('\nシャッフルボタンをクリック...');
    const shuffleBtn = await page.$('#shufflePhrases');

    if (!shuffleBtn) {
      console.error('❌ シャッフルボタンが見つかりません');
      return;
    }

    await shuffleBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // シャッフル後のフレーズを記録
    const secondPhrases = await page.evaluate(() => {
      const items = document.querySelectorAll('.phrase-english');
      return Array.from(items).map((item) => item.textContent.trim());
    });

    console.log('\nシャッフル後のフレーズ:');
    secondPhrases.forEach((phrase, i) => console.log(`  ${i + 1}. ${phrase}`));

    // 比較
    const isDifferent = firstPhrases.some((phrase, i) => phrase !== secondPhrases[i]);

    console.log('\n結果:');
    if (isDifferent) {
      console.log('✅ フレーズが変更されました！');
    } else {
      console.log('❌ フレーズが変更されていません');

      // デバッグ情報
      console.log('\nデバッグ情報:');
      const debugInfo = await page.evaluate(() => {
        const btn = document.getElementById('shufflePhrases');
        return {
          buttonExists: !!btn,
          buttonDisabled: btn ? btn.disabled : null,
          buttonVisible: btn ? window.getComputedStyle(btn).display !== 'none' : null,
          eventListeners: btn ? btn.onclick || 'addEventListener使用' : null,
        };
      });
      console.log(debugInfo);
    }

    console.log('\n⏸️  ブラウザで確認してください。Enterを押すと終了します...');
    await new Promise((resolve) => process.stdin.once('data', resolve));
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await browser.close();
  }
}

testShuffle().catch(console.error);
