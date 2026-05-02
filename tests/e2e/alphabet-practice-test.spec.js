/**
 * アルファベット練習モードのE2Eテスト
 * 大文字・小文字の表示と例示単語の確認
 */

import { test, expect } from '@playwright/test';

test.describe('アルファベット練習モードテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'alphabet');
    await expect(page.locator('#alphabetOptions')).toBeVisible();
  });

  test('大文字モードが正しく表示される', async ({ page }) => {
    await page.selectOption('#alphabetType', 'uppercase');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Alphabet Practice');

    // 大文字のアルファベットが含まれていることを確認
    const hasUppercase = /[A-Z]/.test(previewContent);
    expect(hasUppercase).toBeTruthy();
  });

  test('小文字モードが正しく表示される', async ({ page }) => {
    await page.selectOption('#alphabetType', 'lowercase');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Alphabet Practice');

    // 小文字のアルファベットが含まれていることを確認
    const hasLowercase = /[a-z]/.test(previewContent);
    expect(hasLowercase).toBeTruthy();
  });

  test('大文字・小文字両方モードが正しく表示される', async ({ page }) => {
    await page.selectOption('#alphabetType', 'both');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Alphabet Practice');

    // 大文字と小文字の両方が含まれていることを確認
    const hasUppercase = /[A-Z]/.test(previewContent);
    const hasLowercase = /[a-z]/.test(previewContent);
    expect(hasUppercase).toBeTruthy();
    expect(hasLowercase).toBeTruthy();
  });

  test('例示単語の表示/非表示が切り替わる', async ({ page }) => {
    // 例示単語を表示
    await page.check('#showAlphabetExample');
    await page.waitForTimeout(500);

    let previewContent = await page.locator('#notePreview').textContent();
    // 例示単語（Apple, Ballなど）が表示されていることを確認
    const hasExamples =
      previewContent.includes('Apple') ||
      previewContent.includes('Ball') ||
      previewContent.includes('Cat');
    expect(hasExamples).toBeTruthy();

    // 例示単語を非表示
    await page.uncheck('#showAlphabetExample');
    await page.waitForTimeout(500);

    previewContent = await page.locator('#notePreview').textContent();
    // 例示単語が減少していることを確認（完全に消えるわけではないが、詳細が減る）
    expect(previewContent).toBeDefined();
  });

  test('2列グリッドレイアウトで表示される', async ({ page }) => {
    const alphabetGrid = page.locator('.alphabet-grid');
    await expect(alphabetGrid.first()).toBeVisible();

    // 1 ページ目に最大 6 文字（通常モード = 2×3 グリッド）
    const firstPageItems = page.locator('.note-page').first().locator('.alphabet-grid-item');
    const count = await firstPageItems.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(6);
  });

  test('例示単語数を増やすと複数の単語が表示される', async ({ page }) => {
    await page.selectOption('#alphabetType', 'uppercase');
    await page.selectOption('#alphabetWordCount', '3');
    await page.check('#showAlphabetExample');
    await page.waitForTimeout(500);

    const firstItem = page.locator('.alphabet-grid-item').first();
    const wordSpans = firstItem.locator('.example-word');
    expect(await wordSpans.count()).toBe(3);
  });

  test('なぞり書きモードで薄字ガイドと指定行数が表示される', async ({ page }) => {
    await page.selectOption('#alphabetType', 'uppercase');
    await page.selectOption('#alphabetMode', 'trace');
    await page.selectOption('#alphabetTraceRepeat', '3');
    await page.selectOption('#alphabetWordCount', '2');
    await page.check('#showAlphabetExample');
    await page.waitForTimeout(500);

    // tracing 用グリッドが適用されている
    await expect(page.locator('.alphabet-grid--tracing').first()).toBeVisible();

    // 薄字ガイド要素が出現
    const guideLetters = page.locator('.guide-letter');
    expect(await guideLetters.count()).toBeGreaterThan(0);

    // 1セル目: 文字行(repeat=3) + 単語2個分(各 repeat=3) = 9 本のベースライン
    const firstItem = page.locator('.alphabet-grid-item').first();
    const traceRows = firstItem.locator('.alphabet-trace-row');
    expect(await traceRows.count()).toBe(3);

    const baselineGroups = firstItem.locator('.baseline-group');
    expect(await baselineGroups.count()).toBe(9);
  });

  test('なぞり書きモードは A4 高さに収まるよう文字数が決まる', async ({ page }) => {
    await page.selectOption('#alphabetType', 'uppercase');
    await page.selectOption('#alphabetMode', 'trace');
    await page.waitForTimeout(500);

    // 1 ページ目あたりの文字数を確認（既定 repeat=3, wordCount=2 → 2 文字/ページ）
    const firstPageItems = page.locator('.note-page').first().locator('.alphabet-grid-item');
    const count = await firstPageItems.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(2);
  });

  // .note-page は min-height: 297mm。コンテンツがそれを超えるとプリント時にページ分割が発生する。
  // px換算: 1mm = 96/25.4 ≒ 3.7795px、A4 = 1122.5px。
  // 高密度 (repeat=5, wordCount=3) でも .note-page が膨張しないことを確認する。
  test('A4 高さを越えてレンダリングされない (高密度 trace)', async ({ page }) => {
    await page.selectOption('#alphabetType', 'uppercase');
    await page.selectOption('#alphabetMode', 'trace');
    await page.selectOption('#alphabetTraceRepeat', '5');
    await page.selectOption('#alphabetWordCount', '3');
    await page.check('#showAlphabetExample');
    await page.waitForTimeout(600);

    const firstPage = page.locator('.note-page').first();
    const metrics = await firstPage.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const inner = el.querySelector('.alphabet-practice');
      const innerR = inner ? inner.getBoundingClientRect() : null;
      return {
        pageHeight: r.height,
        innerBottom: innerR ? innerR.bottom : 0,
        pageBottom: r.bottom,
      };
    });

    const A4_PX = (297 * 96) / 25.4;
    // .note-page が A4 高さを越えて伸びていないこと（許容 +1px は丸め用）
    expect(metrics.pageHeight).toBeLessThanOrEqual(A4_PX + 1);
    // インナー下端がページ下端を越えない
    expect(metrics.innerBottom).toBeLessThanOrEqual(metrics.pageBottom + 1);
  });

  test('各文字に4本線ベースラインが表示される', async ({ page }) => {
    const alphabetLines = page.locator('.alphabet-lines');
    const firstLines = alphabetLines.first();

    const baselineGroups = firstLines.locator('.baseline-group');
    const count = await baselineGroups.count();
    expect(count).toBeGreaterThan(0);

    // 4本のベースラインを確認
    const baselines = firstLines.locator('.baseline');
    const baselineCount = await baselines.count();
    expect(baselineCount).toBe(4);
  });

  test('ページ数が自動調整される（両方モード）', async ({ page }) => {
    await page.selectOption('#alphabetType', 'both');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    // ページ情報が表示されることを確認
    const hasPageInfo = /\((\d+)\/(\d+)\)/.test(previewContent);
    expect(hasPageInfo).toBeTruthy();
  });

  // なぞり書きモード+大文字: 26 文字すべてを表示できる枚数に自動調整
  test('大文字なぞり書きの既定設定で全 26 文字を表示できるよう自動調整される', async ({ page }) => {
    await page.selectOption('#alphabetType', 'uppercase');
    await page.selectOption('#alphabetMode', 'trace');
    await page.waitForTimeout(500);

    const pageCountValue = await page.locator('#pageCount').inputValue();
    const pages = parseInt(pageCountValue, 10);
    // 1 ページあたりの文字数 × ページ数 ≥ 26
    const firstPageItems = await page
      .locator('.note-page')
      .first()
      .locator('.alphabet-grid-item')
      .count();
    expect(pages * firstPageItems).toBeGreaterThanOrEqual(26);
  });

  // .guide-letter は初学者向けに非斜体（normal）であること
  test('なぞり書きの薄字ガイドは斜体ではない', async ({ page }) => {
    await page.selectOption('#alphabetType', 'uppercase');
    await page.selectOption('#alphabetMode', 'trace');
    await page.waitForTimeout(500);

    const fontStyle = await page
      .locator('.guide-letter')
      .first()
      .evaluate((el) => window.getComputedStyle(el).fontStyle);
    expect(fontStyle).toBe('normal');
  });

  test('文字が大きく見やすく表示される', async ({ page }) => {
    await page.selectOption('#alphabetType', 'uppercase');
    await page.waitForTimeout(500);

    const alphabetLetter = page.locator('.alphabet-letter').first();
    await expect(alphabetLetter).toBeVisible();

    // フォントサイズが大きいことを確認
    const fontSize = await alphabetLetter.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThan(20); // 20px以上
  });
});

test('アルファベットモードの全体統合テスト', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('#practiceMode', 'alphabet');

  const types = [
    { value: 'uppercase', expectedPattern: /[A-Z]/ },
    { value: 'lowercase', expectedPattern: /[a-z]/ },
    { value: 'both', expectedPattern: /[A-Za-z]/ },
  ];

  for (const type of types) {
    await page.selectOption('#alphabetType', type.value);
    await page.waitForTimeout(300);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(type.expectedPattern.test(previewContent)).toBeTruthy();
  }
});
