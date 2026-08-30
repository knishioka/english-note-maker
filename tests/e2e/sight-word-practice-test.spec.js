import { expect, test } from '@playwright/test';

test.describe('サイトワード練習', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#practiceMode', 'sightWords');
  });

  test('読む・なぞる・写す・思い出すの順で6語を表示する', async ({ page }) => {
    await expect(page.locator('#sightWordOptions')).toBeVisible();
    await expect(page.locator('.sight-word-item')).toHaveCount(6);
    await expect(
      page.locator('.sight-word-item').first().locator('.sight-word-step__label')
    ).toHaveText(['1 Read / Trace', '2 Copy', '3 Recall']);
    await expect(
      page.locator('.sight-word-item').first().locator('.sight-word-step--recall .sight-word-model')
    ).toHaveCount(0);
  });

  test('複数ページではプール枯渇まで重複しない', async ({ page }) => {
    await page.selectOption('#sightWordCount', '8');
    await page.fill('#pageCount', '2');
    await page.locator('#pageCount').dispatchEvent('change');
    await expect(page.locator('.sight-word-item')).toHaveCount(16);
    const words = await page
      .locator('.sight-word-item')
      .evaluateAll((items) => items.map((item) => item.getAttribute('data-sight-word')));
    expect(new Set(words).size).toBe(words.length);
  });

  test('URLプリセットで語数を復元し、不正値は既定の6語へ戻す', async ({ page }) => {
    await page.goto('/?practiceMode=sightWords&sightWordCount=4');
    await expect(page.locator('#sightWordCount')).toHaveValue('4');
    await expect(page.locator('.sight-word-item')).toHaveCount(4);

    await page.goto('/?practiceMode=sightWords&sightWordCount=5');
    await expect(page.locator('#sightWordCount')).toHaveValue('6');
    await expect(page.locator('.sight-word-item')).toHaveCount(6);
  });

  for (const count of [4, 6, 8]) {
    for (const lineHeight of [8, 10, 12]) {
      test(`${count}語 / ${lineHeight}mm がA4に収まる`, async ({ page }) => {
        await page.selectOption('#sightWordCount', String(count));
        await page.selectOption('#lineHeight', String(lineHeight));
        await page.waitForTimeout(1200);
        const height = await page
          .locator('.note-page')
          .first()
          .evaluate((element) => element.offsetHeight);
        expect(height * 0.2645833333).toBeLessThanOrEqual(298);
        await expect(page.locator('.sight-word-item')).toHaveCount(count);
      });
    }
  }
});
