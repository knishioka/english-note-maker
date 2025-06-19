const puppeteer = require('puppeteer');

async function checkLayoutHeight() {
    console.log('レイアウト高さをチェックしています...');
    
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // ページサイズをA4に設定し、キャッシュを無効化
    await page.setViewport({ width: 794, height: 1123 }); // A4サイズ（96dpi）
    await page.setCacheEnabled(false);
    
    try {
        // ローカルサーバーにアクセス
        console.log('ページを読み込んでいます...');
        await page.goto('http://localhost:3003?t=' + Date.now(), {
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // ページを強制リロード
        await page.reload({ waitUntil: 'networkidle0' });
        await page.select('#practiceMode', 'phrase');
        
        const translationCheckbox2 = await page.$('#showTranslation');
        if (translationCheckbox2) {
            const isChecked = await page.evaluate(el => el.checked, translationCheckbox2);
            if (!isChecked) {
                await translationCheckbox2.click();
            }
        }
        
        const situationCheckbox2 = await page.$('#showSituation');
        if (situationCheckbox2) {
            const isChecked = await page.evaluate(el => el.checked, situationCheckbox2);
            if (!isChecked) {
                await situationCheckbox2.click();
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // プレビューエリアの高さを測定
        const previewHeight = await page.evaluate(() => {
            const preview = document.getElementById('notePreview');
            if (!preview) return null;
            
            const rect = preview.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(preview);
            
            return {
                boundingHeight: rect.height,
                scrollHeight: preview.scrollHeight,
                offsetHeight: preview.offsetHeight,
                paddingTop: parseFloat(computedStyle.paddingTop),
                paddingBottom: parseFloat(computedStyle.paddingBottom),
                marginTop: parseFloat(computedStyle.marginTop),
                marginBottom: parseFloat(computedStyle.marginBottom)
            };
        });
        
        // 詳細な要素分析
        const layoutDetails = await page.evaluate(() => {
            const preview = document.getElementById('notePreview');
            const phraseItems = document.querySelectorAll('.phrase-item');
            const title = document.querySelector('.phrase-practice h3');
            
            const details = {
                title: null,
                phrases: [],
                containerPadding: null
            };
            
            // タイトル情報
            if (title) {
                const titleRect = title.getBoundingClientRect();
                const titleStyle = getComputedStyle(title);
                details.title = {
                    height: titleRect.height,
                    marginTop: parseFloat(titleStyle.marginTop),
                    marginBottom: parseFloat(titleStyle.marginBottom),
                    paddingTop: parseFloat(titleStyle.paddingTop),
                    paddingBottom: parseFloat(titleStyle.paddingBottom)
                };
            }
            
            // コンテナのパディング
            const container = document.querySelector('.phrase-practice');
            if (container) {
                const containerStyle = getComputedStyle(container);
                details.containerPadding = {
                    paddingTop: parseFloat(containerStyle.paddingTop),
                    paddingBottom: parseFloat(containerStyle.paddingBottom)
                };
            }
            
            // フレーズ詳細
            phraseItems.forEach((item, index) => {
                const rect = item.getBoundingClientRect();
                const header = item.querySelector('.phrase-header');
                const lines = item.querySelector('.phrase-lines');
                const itemStyle = getComputedStyle(item);
                
                details.phrases.push({
                    index: index,
                    totalHeight: rect.height,
                    headerHeight: header ? header.getBoundingClientRect().height : 0,
                    linesHeight: lines ? lines.getBoundingClientRect().height : 0,
                    marginTop: parseFloat(itemStyle.marginTop),
                    marginBottom: parseFloat(itemStyle.marginBottom),
                    paddingTop: parseFloat(itemStyle.paddingTop),
                    paddingBottom: parseFloat(itemStyle.paddingBottom)
                });
            });
            
            return details;
        });
        
        // CSS変数の値を取得
        const cssVariables = await page.evaluate(() => {
            const style = getComputedStyle(document.documentElement);
            return {
                lineHeight: style.getPropertyValue('--line-height-mm'),
                lineSpacing: style.getPropertyValue('--line-spacing-mm'),
                lineSeparator: style.getPropertyValue('--line-separator-height-mm')
            };
        });
        
        console.log('\n📏 レイアウト測定結果:');
        console.log(`プレビュー高さ: ${previewHeight.boundingHeight}px (${(previewHeight.boundingHeight * 0.264583).toFixed(1)}mm)`);
        console.log(`スクロール高さ: ${previewHeight.scrollHeight}px (${(previewHeight.scrollHeight * 0.264583).toFixed(1)}mm)`);
        
        console.log('\n🎯 CSS変数:');
        console.log(`罫線高さ: ${cssVariables.lineHeight}`);
        console.log(`行間: ${cssVariables.lineSpacing}`);
        console.log(`区切り高さ: ${cssVariables.lineSeparator}`);
        
        console.log('\n📏 レイアウト詳細分析:');
        if (layoutDetails.title) {
            const t = layoutDetails.title;
            console.log(`タイトル: ${t.height.toFixed(1)}px (${(t.height * 0.264583).toFixed(1)}mm)`);
            console.log(`  - margin: ${(t.marginTop * 0.264583).toFixed(1)}mm top, ${(t.marginBottom * 0.264583).toFixed(1)}mm bottom`);
            console.log(`  - padding: ${(t.paddingTop * 0.264583).toFixed(1)}mm top, ${(t.paddingBottom * 0.264583).toFixed(1)}mm bottom`);
        }
        
        if (layoutDetails.containerPadding) {
            const c = layoutDetails.containerPadding;
            console.log(`コンテナpadding: ${(c.paddingTop * 0.264583).toFixed(1)}mm top, ${(c.paddingBottom * 0.264583).toFixed(1)}mm bottom`);
        }
        
        console.log('\n📝 フレーズ詳細:');
        layoutDetails.phrases.forEach(detail => {
            console.log(`フレーズ ${detail.index + 1}: 合計${detail.totalHeight.toFixed(1)}px (${(detail.totalHeight * 0.264583).toFixed(1)}mm)`);
            console.log(`  - ヘッダー: ${detail.headerHeight.toFixed(1)}px (${(detail.headerHeight * 0.264583).toFixed(1)}mm)`);
            console.log(`  - 罫線: ${detail.linesHeight.toFixed(1)}px (${(detail.linesHeight * 0.264583).toFixed(1)}mm)`);
            console.log(`  - margin: ${(detail.marginTop * 0.264583).toFixed(1)}mm top, ${(detail.marginBottom * 0.264583).toFixed(1)}mm bottom`);
            console.log(`  - padding: ${(detail.paddingTop * 0.264583).toFixed(1)}mm top, ${(detail.paddingBottom * 0.264583).toFixed(1)}mm bottom`);
        });
        
        // A4高さチェック（297mm = 1123px at 96dpi）
        const a4HeightPx = 1123;
        const contentHeightPx = previewHeight.scrollHeight;
        const isOverflowing = contentHeightPx > a4HeightPx;
        
        console.log('\n🚨 A4収まりチェック:');
        console.log(`A4高さ: ${a4HeightPx}px (297mm)`);
        console.log(`コンテンツ高さ: ${contentHeightPx}px (${(contentHeightPx * 0.264583).toFixed(1)}mm)`);
        console.log(`結果: ${isOverflowing ? '❌ オーバーフロー' : '✅ 収まっている'}`);
        
        if (isOverflowing) {
            const overflowPx = contentHeightPx - a4HeightPx;
            console.log(`オーバーフロー: ${overflowPx}px (${(overflowPx * 0.264583).toFixed(1)}mm)`);
        }
        
    } catch (error) {
        console.error('エラーが発生しました:', error);
    } finally {
        await browser.close();
    }
}

checkLayoutHeight().catch(console.error);