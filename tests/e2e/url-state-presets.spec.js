import { expect, test } from '@playwright/test';

test.describe('URL preset sharing', () => {
  test('hydrates worksheet settings from supported query parameters', async ({ page }) => {
    await page.goto(
      '/?practiceMode=word&ageGroup=10-12&pageCount=2&lineHeight=12&lineColor=blue&showHeader=true&wordCategory=food&wordDifficulty=hard'
    );

    await expect(page.locator('#practiceMode')).toHaveValue('word');
    await expect(page.locator('#ageGroup')).toHaveValue('10-12');
    await expect(page.locator('#pageCount')).toHaveValue('2');
    await expect(page.locator('#lineHeight')).toHaveValue('12');
    await expect(page.locator('#lineColor')).toHaveValue('blue');
    await expect(page.locator('#showHeader')).toBeChecked();
    await expect(page.locator('#wordCategory')).toHaveValue('food');
    await expect(page.locator('#wordDifficulty')).toHaveValue('hard');
    await expect(page.locator('.note-page')).toHaveCount(2);
    await expect(page.locator('.note-page').first()).toHaveClass(/line-color-blue/);
  });

  test('ignores invalid query values and keeps safe defaults', async ({ page }) => {
    await page.goto(
      '/?practiceMode=essay&pageCount=999&lineHeight=11&lineColor=purple&showHeader=maybe&wordCategory=missing'
    );

    await expect(page.locator('#practiceMode')).toHaveValue('phrase');
    await expect(page.locator('#pageCount')).toHaveValue('1');
    await expect(page.locator('#lineHeight')).toHaveValue('10');
    await expect(page.locator('#lineColor')).toHaveValue('gray');
    await expect(page.locator('#showHeader')).not.toBeChecked();
    await expect(page.locator('.note-page')).toHaveCount(1);
  });

  test('updates the URL with replaceState when supported settings change', async ({ page }) => {
    await page.goto('/');
    const initialHistoryLength = await page.evaluate(() => window.history.length);

    await page.locator('#practiceMode').selectOption('cloze');
    await page.locator('#clozeBlankType').selectOption('char');
    await page.locator('#showClozeAnswers').check();

    await expect(page).toHaveURL(/practiceMode=cloze/);
    await expect(page).toHaveURL(/clozeBlankType=char/);
    await expect(page).toHaveURL(/showClozeAnswers=true/);
    await expect.poll(() => page.evaluate(() => window.history.length)).toBe(initialHistoryLength);
  });
});
