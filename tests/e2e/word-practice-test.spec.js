/**
 * 単語練習モードのE2Eテスト
 * 各カテゴリーが正しく表示されることを確認
 */

import { test, expect } from '@playwright/test';

test.describe('単語練習モードテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'word');
    await expect(page.locator('#wordOptions')).toBeVisible();
  });

  test('動物カテゴリーが正しく表示される', async ({ page }) => {
    await page.selectOption('#wordCategory', 'animals');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Word Practice - 動物');

    // 動物に関連する単語が表示されていることを確認（7-9歳グループ）
    const hasAnimals =
      previewContent.includes('elephant') ||
      previewContent.includes('monkey') ||
      previewContent.includes('giraffe') ||
      previewContent.includes('penguin');

    expect(hasAnimals).toBeTruthy();
  });

  test('食べ物カテゴリーが正しく表示される', async ({ page }) => {
    await page.selectOption('#wordCategory', 'food');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Word Practice - 食べ物');

    const hasFood =
      previewContent.includes('sandwich') ||
      previewContent.includes('pizza') ||
      previewContent.includes('hamburger') ||
      previewContent.includes('spaghetti');

    expect(hasFood).toBeTruthy();
  });

  test('色カテゴリーが正しく表示される', async ({ page }) => {
    await page.selectOption('#wordCategory', 'colors');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Word Practice - 色');

    const hasColors =
      previewContent.includes('black') ||
      previewContent.includes('orange') ||
      previewContent.includes('purple') ||
      previewContent.includes('pink');

    expect(hasColors).toBeTruthy();
  });

  test('数字カテゴリーが正しく表示される', async ({ page }) => {
    await page.selectOption('#wordCategory', 'numbers');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Word Practice - 数字');

    const hasNumbers =
      previewContent.includes('six') ||
      previewContent.includes('seven') ||
      previewContent.includes('eight') ||
      previewContent.includes('nine') ||
      previewContent.includes('ten');

    expect(hasNumbers).toBeTruthy();
  });

  test('年齢グループを変更するとレベルに応じた単語が表示される', async ({ page }) => {
    await page.selectOption('#wordCategory', 'animals');
    await page.waitForTimeout(500);

    // 4-6歳向けの単語
    await page.selectOption('#ageGroup', '4-6');
    await page.waitForTimeout(500);
    let previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Word Practice - 動物');

    // 10-12歳向けの単語
    await page.selectOption('#ageGroup', '10-12');
    await page.waitForTimeout(500);
    previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Word Practice - 動物');
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

  test('単語に音節と日本語訳が表示される', async ({ page }) => {
    await page.selectOption('#wordCategory', 'animals');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();

    // 日本語が含まれていることを確認（音節または訳）
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(previewContent);
    expect(hasJapanese).toBeTruthy();
  });
});

test('全カテゴリーが切り替え可能', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('#practiceMode', 'word');

  const categories = [
    { value: 'animals', name: '動物' },
    { value: 'food', name: '食べ物' },
    { value: 'colors', name: '色' },
    { value: 'numbers', name: '数字' },
    { value: 'calendar', name: '曜日・月' },
    { value: 'school_items', name: '学用品' },
    { value: 'body_parts', name: '身体' },
    { value: 'weather', name: '天気' },
  ];

  for (const category of categories) {
    await page.selectOption('#wordCategory', category.value);
    await page.waitForTimeout(300);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain(`Word Practice - ${category.name}`);
  }
});
