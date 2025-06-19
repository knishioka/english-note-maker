const puppeteer = require('puppeteer');

async function testPrintPreview() {
    console.log('印刷プレビュー機能をテストしています...\n');
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:3004', {
            waitUntil: 'networkidle0'
        });
        
        // フレーズ練習モードを選択
        await page.select('#practiceMode', 'phrase');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ フレーズ練習モードを選択');
        
        // プレビューボタンをクリック
        const previewBtn = await page.$('#previewBtn');
        if (!previewBtn) {
            console.error('❌ プレビューボタンが見つかりません');
            return;
        }
        
        console.log('🔍 プレビューボタンをクリック...');
        await previewBtn.click();
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // プレビューモーダルが表示されているかチェック
        const modal = await page.$('#printPreviewModal');
        const modalVisible = await page.evaluate(el => {
            return el && window.getComputedStyle(el).display !== 'none';
        }, modal);
        
        if (modalVisible) {
            console.log('✅ プレビューモーダルが表示されました');
            
            // A4プレビューページの内容をチェック
            const previewContent = await page.evaluate(() => {
                const preview = document.getElementById('a4Preview');
                return {
                    hasContent: preview && preview.innerHTML.length > 0,
                    hasPhrases: preview && preview.querySelectorAll('.phrase-item').length > 0,
                    hasBaselines: preview && preview.querySelectorAll('.baseline-group').length > 0
                };
            });
            
            console.log('📄 プレビュー内容:');
            console.log(`  - コンテンツ有無: ${previewContent.hasContent ? '✅' : '❌'}`);
            console.log(`  - フレーズ有無: ${previewContent.hasPhrases ? '✅' : '❌'}`);
            console.log(`  - 罫線有無: ${previewContent.hasBaselines ? '✅' : '❌'}`);
            
            // ズーム機能をテスト
            console.log('\n🔍 ズーム機能をテスト...');
            const zoomInBtn = await page.$('#zoomInBtn');
            if (zoomInBtn) {
                await zoomInBtn.click();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const zoomLevel = await page.$eval('#zoomLevel', el => el.textContent);
                console.log(`✅ ズームイン成功: ${zoomLevel}`);
            }
            
            // 印刷ボタンの存在確認
            const printFromPreviewBtn = await page.$('#printFromPreviewBtn');
            console.log(`🖨️ 印刷ボタン: ${printFromPreviewBtn ? '✅' : '❌'}`);
            
            // 閉じるボタンをテスト
            console.log('\n❌ 閉じるボタンをテスト...');
            const closeBtn = await page.$('#closePreviewBtn');
            if (closeBtn) {
                await closeBtn.click();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const modalVisibleAfterClose = await page.evaluate(el => {
                    return el && window.getComputedStyle(el).display !== 'none';
                }, modal);
                
                console.log(`✅ モーダル閉じる: ${!modalVisibleAfterClose ? '成功' : '失敗'}`);
            }
            
        } else {
            console.error('❌ プレビューモーダルが表示されていません');
        }
        
        console.log('\n⏸️  ブラウザで確認してください。Enterを押すと終了します...');
        await new Promise(resolve => process.stdin.once('data', resolve));
        
    } catch (error) {
        console.error('エラー:', error);
    } finally {
        await browser.close();
    }
}

testPrintPreview().catch(console.error);