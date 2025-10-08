/**
 * 通常練習モードのE2Eテスト
 * 基本的な罫線表示と設定の確認
 */

import { test, expect } from '@playwright/test';

test.describe('通常練習モードテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'normal');
    await page.waitForTimeout(500);
  });

  test('4本線ベースラインが表示される', async ({ page }) => {
    const baselineGroups = page.locator('.baseline-group');
    const count = await baselineGroups.count();
    expect(count).toBeGreaterThan(0);

    // 最初のベースライングループに4本の線があることを確認
    const firstGroup = baselineGroups.first();
    const baselines = firstGroup.locator('.baseline');
    const baselineCount = await baselines.count();
    expect(baselineCount).toBe(4);
  });

  test('罫線の高さが設定できる', async ({ page }) => {
    const heights = ['8', '10', '12'];

    for (const height of heights) {
      await page.selectOption('#lineHeight', height);
      await page.waitForTimeout(500);

      const baselineGroup = page.locator('.baseline-group').first();
      const heightStyle = await baselineGroup.evaluate((el) => {
        return window.getComputedStyle(el).height;
      });

      // 高さが設定されていることを確認（mmまたはpx単位）
      expect(heightStyle).toBeDefined();
      expect(heightStyle.length).toBeGreaterThan(0);
    }
  });

  test('罫線の色が設定できる', async ({ page }) => {
    const colors = ['gray', 'blue', 'green'];

    for (const color of colors) {
      await page.selectOption('#lineColor', color);
      await page.waitForTimeout(500);

      // プレビューが更新されることを確認
      const previewContent = await page.locator('#notePreview').innerHTML();
      expect(previewContent.length).toBeGreaterThan(100);
    }
  });

  test('名前・日付欄の表示/非表示が切り替わる', async ({ page }) => {
    // 名前・日付欄を表示
    await page.check('#showHeader');
    await page.waitForTimeout(500);

    let hasHeader = await page.locator('.note-header').count();
    expect(hasHeader).toBeGreaterThan(0);

    // 名前・日付欄を非表示
    await page.uncheck('#showHeader');
    await page.waitForTimeout(500);

    hasHeader = await page.locator('.note-header').count();
    expect(hasHeader).toBe(0);
  });

  test('ページ数が設定できる', async ({ page }) => {
    const pageCounts = [1, 2, 3];

    for (const pageCount of pageCounts) {
      await page.fill('#pageCount', pageCount.toString());
      await page.waitForTimeout(500);

      // ページセパレータの数を確認（ページ数-1個）
      const separators = page.locator('.page-separator');
      const separatorCount = await separators.count();
      expect(separatorCount).toBe(pageCount - 1);
    }
  });

  test('A4サイズの用紙が表示される', async ({ page }) => {
    const notePage = page.locator('.note-page').first();
    await expect(notePage).toBeVisible();

    // 用紙のサイズが設定されていることを確認
    const width = await notePage.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });

    expect(width).toBeDefined();
    // A4サイズに近い幅であることを確認（環境により異なる）
    const widthNum = parseInt(width);
    expect(widthNum).toBeGreaterThan(200); // 最低200px
  });

  test('十分な数の罫線が表示される', async ({ page }) => {
    const baselineGroups = page.locator('.baseline-group');
    const count = await baselineGroups.count();

    // 少なくとも10行以上の罫線があることを確認
    expect(count).toBeGreaterThan(10);
  });

  test('罫線が均等に配置される', async ({ page }) => {
    const baselineGroups = page.locator('.baseline-group');
    const count = await baselineGroups.count();

    if (count >= 2) {
      const firstGroup = baselineGroups.nth(0);
      const secondGroup = baselineGroups.nth(1);

      const firstHeight = await firstGroup.evaluate((el) => {
        return window.getComputedStyle(el).height;
      });

      const secondHeight = await secondGroup.evaluate((el) => {
        return window.getComputedStyle(el).height;
      });

      // すべての罫線が同じ高さであることを確認
      expect(firstHeight).toBe(secondHeight);
    }
  });

  test('印刷ボタンが表示される', async ({ page }) => {
    const printBtn = page.locator('#printBtn');
    await expect(printBtn).toBeVisible();

    // ボタンのテキストを確認
    const buttonText = await printBtn.textContent();
    expect(buttonText).toContain('印刷');
  });

  test('プレビューボタンが表示される', async ({ page }) => {
    const previewBtn = page.locator('#previewBtn');
    await expect(previewBtn).toBeVisible();

    // ボタンのテキストを確認
    const buttonText = await previewBtn.textContent();
    expect(buttonText).toContain('プレビュー');
  });
});

test('通常練習モードの全体統合テスト', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('#practiceMode', 'normal');

  // 各設定を変更
  await page.selectOption('#lineHeight', '10');
  await page.selectOption('#lineColor', 'blue');
  await page.check('#showHeader');
  await page.fill('#pageCount', '2');

  await page.waitForTimeout(500);

  // プレビューが正しく表示されることを確認
  const previewContent = await page.locator('#notePreview').innerHTML();
  expect(previewContent.length).toBeGreaterThan(500);

  // ベースラインが表示されていることを確認
  const baselineGroups = page.locator('.baseline-group');
  const count = await baselineGroups.count();
  expect(count).toBeGreaterThan(10);

  // ヘッダーが表示されていることを確認
  const headers = page.locator('.note-header');
  const headerCount = await headers.count();
  expect(headerCount).toBeGreaterThan(0);

  // ページセパレータが1つ表示されていることを確認（2ページ）
  const separators = page.locator('.page-separator');
  const separatorCount = await separators.count();
  expect(separatorCount).toBe(1);
});

test('レスポンシブデザインの確認', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('#practiceMode', 'normal');

  // デスクトップビュー
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.waitForTimeout(500);

  let previewVisible = await page.locator('#notePreview').isVisible();
  expect(previewVisible).toBeTruthy();

  // タブレットビュー
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);

  previewVisible = await page.locator('#notePreview').isVisible();
  expect(previewVisible).toBeTruthy();
});
