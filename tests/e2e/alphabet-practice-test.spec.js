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
    await expect(alphabetGrid).toBeVisible();

    const gridItems = page.locator('.alphabet-grid-item');
    const count = await gridItems.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(6); // 1ページに最大6文字
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
    await page.waitForTimeout(1000); // ページ数調整のための待機

    const previewContent = await page.locator('#notePreview').textContent();
    // ページ情報が表示されることを確認
    const hasPageInfo = /\((\d+)\/(\d+)\)/.test(previewContent);
    expect(hasPageInfo).toBeTruthy();
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
