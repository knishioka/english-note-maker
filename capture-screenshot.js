const puppeteer = require('puppeteer');

(async () => {
    console.log('Puppeteerでスクリーンショットを撮影します...');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // ビューポートサイズを設定
    await page.setViewport({
        width: 1280,
        height: 900,
        deviceScaleFactor: 2 // Retina対応で高解像度
    });
    
    // GitHub Pagesにアクセス
    console.log('ページを読み込んでいます...');
    await page.goto('https://knishioka.github.io/english-note-maker/', {
        waitUntil: 'networkidle0',
        timeout: 30000
    });
    
    // ページが完全に読み込まれるまで待機
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // フレーズ練習モードを選択
    console.log('フレーズ練習モードを選択しています...');
    await page.select('#practiceMode', 'phrase');
    
    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 日本語訳を表示をチェック
    const translationCheckbox = await page.$('#showTranslation');
    if (translationCheckbox) {
        const isChecked = await page.evaluate(el => el.checked, translationCheckbox);
        if (!isChecked) {
            await translationCheckbox.click();
        }
    }
    
    // 使用場面を表示をチェック
    const situationCheckbox = await page.$('#showSituation');
    if (situationCheckbox) {
        const isChecked = await page.evaluate(el => el.checked, situationCheckbox);
        if (!isChecked) {
            await situationCheckbox.click();
        }
    }
    
    // プレビューが更新されるまで待機
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // スクリーンショットを撮影（フルページ）
    console.log('スクリーンショットを撮影しています...');
    await page.screenshot({
        path: 'screenshot-phrase-practice-full.png',
        fullPage: true
    });
    
    // ヘッダーを含む上部のみのスクリーンショットも撮影
    await page.screenshot({
        path: 'screenshot-phrase-practice.png',
        clip: {
            x: 0,
            y: 0,
            width: 1280,
            height: 820
        }
    });
    
    console.log('スクリーンショットを保存しました:');
    console.log('- screenshot-phrase-practice.png (上部のみ)');
    console.log('- screenshot-phrase-practice-full.png (フルページ)');
    
    await browser.close();
    
    // ファイルサイズを確認
    const fs = require('fs');
    const stats = fs.statSync('screenshot-phrase-practice.png');
    const fileSizeInKB = Math.round(stats.size / 1024);
    console.log(`\nファイルサイズ: ${fileSizeInKB}KB`);
    
    if (fileSizeInKB > 200) {
        console.log('ファイルサイズが大きいため、最適化を推奨します。');
    }
})();