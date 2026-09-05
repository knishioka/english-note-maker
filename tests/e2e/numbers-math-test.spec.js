import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { PHRASE_DATA } from '../../src/data/phrase-data.js';

const collection = JSON.parse(
  readFileSync('src/data/collections/phrases/numbers_math.json', 'utf8')
);

test.describe('数と算数カテゴリーテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/?view=worksheet');
    await page.selectOption('#practiceMode', 'phrase');
    await page.selectOption('#phraseCategory', 'numbers_math');
    await page.waitForTimeout(500);
  });

  test('数と算数カテゴリーが選択できる', async ({ page }) => {
    const categoryValue = await page.locator('#phraseCategory').inputValue();
    expect(categoryValue).toBe('numbers_math');
  });

  for (const ageGroup of ['4-6', '7-9', '10-12']) {
    test(ageGroup + '歳向けの数と算数フレーズが表示される', async ({ page }) => {
      await page.selectOption('#ageGroup', ageGroup);
      await expect(page.locator('#notePreview .practice-title')).toContainText('数と算数');
      const valid = new Set(
        [
          ...PHRASE_DATA.numbers_math[ageGroup],
          ...collection.items.filter((item) => item.ageGroup === ageGroup),
        ].map((item) => item.english)
      );
      const phrases = await page.locator('#notePreview .phrase-english').allTextContents();
      expect(phrases.length).toBeGreaterThan(0);
      for (const phrase of phrases) expect(valid.has(phrase.trim())).toBe(true);
    });
  }

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
