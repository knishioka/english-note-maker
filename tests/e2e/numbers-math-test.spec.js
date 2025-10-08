const { test, expect } = require('@playwright/test');

test.describe('数と算数カテゴリーテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'phrase');
    await page.selectOption('#phraseCategory', 'numbers_math');
    await page.waitForTimeout(500);
  });

  test('数と算数カテゴリーが選択できる', async ({ page }) => {
    const categoryValue = await page.locator('#phraseCategory').inputValue();
    expect(categoryValue).toBe('numbers_math');
  });

  test('4-6歳グループで基本的な足し算フレーズが表示される', async ({ page }) => {
    await page.selectOption('#ageGroup', '4-6');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();

    // タイトル確認
    expect(previewContent).toContain('Phrase Practice - 数と算数');

    // 基本的な数のフレーズを確認
    const hasBasicMath =
      previewContent.includes('plus') ||
      previewContent.includes('minus') ||
      previewContent.includes('equals') ||
      previewContent.includes('bigger') ||
      previewContent.includes('smaller');

    expect(hasBasicMath).toBeTruthy();
  });

  test('7-9歳グループで位の概念フレーズが表示される', async ({ page }) => {
    await page.selectOption('#ageGroup', '7-9');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();

    // 位の概念を確認
    const hasTensOnes =
      previewContent.includes('ten') ||
      previewContent.includes('ones') ||
      previewContent.includes('fifteen');

    expect(hasTensOnes).toBeTruthy();
  });

  test('10-12歳グループで四則演算フレーズが表示される', async ({ page }) => {
    await page.selectOption('#ageGroup', '10-12');
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();

    // 四則演算を確認
    const hasAdvancedMath =
      previewContent.includes('times') ||
      previewContent.includes('divided') ||
      previewContent.includes('sum') ||
      previewContent.includes('hundred');

    expect(hasAdvancedMath).toBeTruthy();
  });

  test('年齢グループを変更してもカテゴリーが維持される', async ({ page }) => {
    // 4-6歳を選択
    await page.selectOption('#ageGroup', '4-6');
    await page.waitForTimeout(500);
    let categoryValue = await page.locator('#phraseCategory').inputValue();
    expect(categoryValue).toBe('numbers_math');

    // 7-9歳に変更
    await page.selectOption('#ageGroup', '7-9');
    await page.waitForTimeout(500);
    categoryValue = await page.locator('#phraseCategory').inputValue();
    expect(categoryValue).toBe('numbers_math');

    // 10-12歳に変更
    await page.selectOption('#ageGroup', '10-12');
    await page.waitForTimeout(500);
    categoryValue = await page.locator('#phraseCategory').inputValue();
    expect(categoryValue).toBe('numbers_math');
  });
});
