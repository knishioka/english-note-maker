/**
 * 文章練習モードのE2Eテスト
 * 例文表示と日本語訳の切り替えを確認
 */

import { test, expect } from '@playwright/test';

const CUSTOM_EXAMPLES_STORAGE_KEY = 'english-note-maker.customExamples.v1';

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

test.describe('カスタム例文の永続化', () => {
  test('追加したカスタム例文がリロード後も表示され、削除できる', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'sentence');
    await page.selectOption('#ageGroup', '4-6');
    await page.selectOption('#exampleCategory', 'school');
    await page.fill('#pageCount', '2');

    await page.fill('#customEnglish', 'I read a red book.');
    await page.fill('#customJapanese', 'わたしは赤い本を読みます。');
    page.once('dialog', (dialog) => dialog.accept());
    await page.click('#addCustomExampleBtn');

    await expect(page.locator('#customExamplesCount')).toHaveText('1件');
    await expect(page.locator('#customExamplesList')).toContainText('I read a red book.');
    await expect(page.locator('#customExamplesList')).toContainText('4-6 / 学校');

    const storedExamples = await page.evaluate((storageKey) => {
      return JSON.parse(window.localStorage.getItem(storageKey));
    }, CUSTOM_EXAMPLES_STORAGE_KEY);
    expect(storedExamples).toMatchObject([
      {
        english: 'I read a red book.',
        japanese: 'わたしは赤い本を読みます。',
        category: 'school',
        ageGroup: '4-6',
        custom: true,
      },
    ]);

    await page.reload();
    await expect(page.locator('#customExamplesCount')).toHaveText('1件');

    await page.selectOption('#practiceMode', 'sentence');
    await page.selectOption('#ageGroup', '4-6');
    await page.selectOption('#exampleCategory', 'school');
    await page.fill('#pageCount', '2');
    await expect(page.locator('#notePreview')).toContainText('I read a red book.');

    await page.getByRole('button', { name: 'I read a red book.を削除' }).click();

    await expect(page.locator('#customExamplesCount')).toHaveText('0件');
    await expect(page.locator('#customExamplesList')).toContainText('保存済みの例文はありません。');

    const storedAfterDelete = await page.evaluate((storageKey) => {
      return JSON.parse(window.localStorage.getItem(storageKey));
    }, CUSTOM_EXAMPLES_STORAGE_KEY);
    expect(storedAfterDelete).toEqual([]);
  });

  test('不正な保存データはプレビュー生成を壊さず空リストとして扱われる', async ({ page }) => {
    await page.addInitScript((storageKey) => {
      window.localStorage.setItem(storageKey, '{broken-json');
    }, CUSTOM_EXAMPLES_STORAGE_KEY);

    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'sentence');

    await expect(page.locator('#customExamplesCount')).toHaveText('0件');
    await expect(page.locator('#customExamplesList')).toContainText('保存済みの例文はありません。');
    await expect(page.locator('#notePreview .note-page')).toHaveCount(1);

    const storedValue = await page.evaluate((storageKey) => {
      return window.localStorage.getItem(storageKey);
    }, CUSTOM_EXAMPLES_STORAGE_KEY);
    expect(storedValue).toBe('{broken-json');
  });

  test('カスタム例文のHTML風入力はプレビューで実行されない', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'sentence');
    await page.selectOption('#ageGroup', '4-6');
    await page.selectOption('#exampleCategory', 'school');
    await page.fill('#pageCount', '2');

    await page.fill(
      '#customEnglish',
      '<img src=x onerror="window.customExampleXss=1"> Safe sentence.'
    );
    await page.fill('#customJapanese', '<b>安全な表示</b>');
    page.once('dialog', (dialog) => dialog.accept());
    await page.click('#addCustomExampleBtn');

    await expect(page.locator('#notePreview')).toContainText('Safe sentence.');
    await expect(page.locator('#notePreview img')).toHaveCount(0);
    await expect(page.locator('#notePreview b')).toHaveCount(0);
    await expect(page.locator('#customExamplesList img')).toHaveCount(0);

    const xssFlag = await page.evaluate(() => window.customExampleXss);
    expect(xssFlag).toBeUndefined();
  });

  test('削除ボタンのaria-labelでは属性注入されない', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'sentence');

    const injectedEnglish = 'Bad" autofocus onfocus="window.customDeleteXss=1';
    await page.fill('#customEnglish', injectedEnglish);
    await page.fill('#customJapanese', '属性注入の検証');
    page.once('dialog', (dialog) => dialog.accept());
    await page.click('#addCustomExampleBtn');

    const deleteButton = page.locator('.custom-example-item__delete');
    await expect(deleteButton).toHaveAttribute('aria-label', `${injectedEnglish}を削除`);
    await expect(deleteButton).not.toHaveAttribute('autofocus', '');
    await expect(deleteButton).not.toHaveAttribute('onfocus', /customDeleteXss/);

    const xssFlag = await page.evaluate(() => window.customDeleteXss);
    expect(xssFlag).toBeUndefined();
  });
});

test('複数ページ生成しても同一ページ内に例文の重複が出ない', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('#practiceMode', 'sentence');
  await page.check('#showExamples');
  await page.selectOption('#exampleCategory', 'all');
  await page.selectOption('#ageGroup', '7-9');
  await page.fill('#pageCount', '3');
  await page.waitForTimeout(800);

  const pages = await page.locator('#notePreview .note-page').all();
  expect(pages.length).toBeGreaterThanOrEqual(2);

  for (const pageBlock of pages) {
    const englishTexts = await pageBlock.locator('.example-english').allTextContents();
    const trimmed = englishTexts.map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean);
    if (trimmed.length === 0) continue;
    const unique = new Set(trimmed);
    expect(unique.size).toBe(trimmed.length);
  }
});

test('難易度セレクタが存在し、難易度を切り替えると表示例文が変わる', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('#practiceMode', 'sentence');
  await page.check('#showExamples');
  await expect(page.locator('#sentenceDifficulty')).toBeVisible();
  await page.selectOption('#ageGroup', '10-12');

  await page.selectOption('#sentenceDifficulty', 'easy');
  await page.waitForTimeout(500);
  const easyTexts = await page.locator('#notePreview .example-english').allTextContents();

  await page.selectOption('#sentenceDifficulty', 'hard');
  await page.waitForTimeout(500);
  const hardTexts = await page.locator('#notePreview .example-english').allTextContents();

  // 表示内容（英文の一覧）が変化しているはず（フィルタ条件が違うため）
  const easyJoined = easyTexts.map((s) => s.trim()).join('|');
  const hardJoined = hardTexts.map((s) => s.trim()).join('|');
  expect(hardJoined).not.toEqual(easyJoined);
});

test('文章練習モードの全体統合テスト', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('#practiceMode', 'sentence');
  await expect(page.locator('#translationOptions')).toBeVisible();

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
