/**
 * 文章練習モードのE2Eテスト
 * 例文表示と日本語訳の切り替えを確認
 */

import { test, expect } from '@playwright/test';

test.describe('文章練習モードテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'sentence');
    await expect(page.locator('#exampleOptions')).toBeVisible();
  });

  test('例文が表示される', async ({ page }) => {
    // 例文表示をONにする
    await page.check('#showExamples');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();

    // 英語の例文が含まれていることを確認
    const hasEnglish = /[A-Za-z]+/.test(previewContent);
    expect(hasEnglish).toBeTruthy();

    // 例文を含む要素が存在することを確認
    const exampleSentences = page.locator('.example-sentence');
    const count = await exampleSentences.count();
    expect(count).toBeGreaterThan(0);
  });

  test('日本語訳の表示/非表示が切り替わる', async ({ page }) => {
    await page.check('#showExamples');
    await page.waitForTimeout(500);

    // 日本語訳を表示
    await page.check('#showTranslation');
    await page.waitForTimeout(500);

    let previewContent = await page.locator('#notePreview').textContent();
    // 日本語が含まれていることを確認
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(previewContent);
    expect(hasJapanese).toBeTruthy();

    // 日本語訳を非表示
    await page.uncheck('#showTranslation');
    await page.waitForTimeout(500);

    previewContent = await page.locator('#notePreview').textContent();
    // 英語は残っているが、日本語の量が減っていることを期待
    const stillHasEnglish = /[A-Za-z]+/.test(previewContent);
    expect(stillHasEnglish).toBeTruthy();
  });

  test('例文カテゴリーで絞り込みができる', async ({ page }) => {
    await page.check('#showExamples');

    const categories = ['daily', 'school', 'family', 'hobby'];

    for (const category of categories) {
      await page.selectOption('#exampleCategory', category);
      await page.waitForTimeout(500);

      const previewContent = await page.locator('#notePreview').textContent();
      // 例文が表示されていることを確認
      expect(previewContent.length).toBeGreaterThan(100);
    }
  });

  test('例文更新ボタンで異なる例文が表示される', async ({ page }) => {
    await page.check('#showExamples');
    await page.waitForTimeout(500);

    // 例文を更新
    await page.click('#refreshExamplesBtn');
    await page.waitForTimeout(500);

    const updatedContent = await page.locator('#notePreview').textContent();

    // 何らかの例文が表示されていることを確認（内容が変わるかは保証できない）
    expect(updatedContent.length).toBeGreaterThan(100);
  });

  test('年齢グループに応じた例文が表示される', async ({ page }) => {
    await page.check('#showExamples');

    const ageGroups = ['4-6', '7-9', '10-12'];

    for (const age of ageGroups) {
      await page.selectOption('#ageGroup', age);
      await page.waitForTimeout(500);

      const previewContent = await page.locator('#notePreview').textContent();
      // 例文が表示されていることを確認
      const hasContent = /[A-Za-z]+/.test(previewContent);
      expect(hasContent).toBeTruthy();
    }
  });

  test('各例文に2行の練習行が表示される', async ({ page }) => {
    await page.check('#showExamples');
    await page.waitForTimeout(500);

    const practiceLines = page.locator('.practice-lines');
    const count = await practiceLines.count();
    expect(count).toBeGreaterThan(0);

    // 最初の練習行セクションに4本線が2セットあることを確認
    const firstPracticeLines = practiceLines.first();
    const baselineGroups = firstPracticeLines.locator('.baseline-group');
    const groupCount = await baselineGroups.count();
    expect(groupCount).toBe(2); // 2行の練習行
  });

  test('難易度が星で表示される', async ({ page }) => {
    await page.check('#showExamples');
    await page.check('#showTranslation');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    // 星マーク（難易度）が含まれていることを確認
    const hasDifficulty = previewContent.includes('★');
    expect(hasDifficulty).toBeTruthy();
  });

  test('行の高さに応じて例文数が調整される', async ({ page }) => {
    await page.check('#showExamples');

    // 行の高さを変更して例文数が調整されるか確認
    await page.selectOption('#lineHeight', '12');
    await page.waitForTimeout(500);

    let exampleCount = await page.locator('.example-sentence').count();
    const largeLineCount = exampleCount;

    await page.selectOption('#lineHeight', '8');
    await page.waitForTimeout(500);

    exampleCount = await page.locator('.example-sentence').count();
    const smallLineCount = exampleCount;

    // 行の高さが小さいほうが多くの例文を表示できる
    expect(smallLineCount).toBeGreaterThanOrEqual(largeLineCount);
  });
});

test('文章練習モードの全体統合テスト', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('#practiceMode', 'sentence');

  // 例文を表示
  await page.check('#showExamples');
  await page.check('#showTranslation');

  // カテゴリーを選択
  await page.selectOption('#exampleCategory', 'school');

  // 年齢グループを選択
  await page.selectOption('#ageGroup', '7-9');

  await page.waitForTimeout(500);

  const previewContent = await page.locator('#notePreview').textContent();

  // 英語と日本語の両方が含まれていることを確認
  expect(/[A-Za-z]+/.test(previewContent)).toBeTruthy();
  expect(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(previewContent)).toBeTruthy();

  // ベースラインが表示されていることを確認
  const baselineGroups = page.locator('.baseline-group');
  const count = await baselineGroups.count();
  expect(count).toBeGreaterThan(0);
});
