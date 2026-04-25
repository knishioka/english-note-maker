/**
 * 穴埋めフレーズ練習モードのE2Eテスト
 * cloze モードの各機能が正しく動作することを確認
 */

import { test, expect } from '@playwright/test';

test.describe('穴埋めフレーズ練習テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.selectOption('#practiceMode', 'cloze');
    await page.waitForTimeout(500);
  });

  test('穴埋めフレーズ練習オプションがプルダウンに存在する', async ({ page }) => {
    const option = page.locator('#practiceMode option[value="cloze"]');
    await expect(option).toHaveCount(1);

    const text = await option.textContent();
    expect(text).toContain('穴埋めフレーズ練習');
  });

  test('clozeモード選択時にclozeOptionsパネルが表示される', async ({ page }) => {
    await expect(page.locator('#clozeOptions')).toBeVisible();

    // cloze固有のコントロールが表示されていることを確認
    await expect(page.locator('#clozeCategory')).toBeVisible();
    await expect(page.locator('#clozeBlankType')).toBeVisible();
    await expect(page.locator('#showClozeAnswers')).toBeVisible();
  });

  test('プレビューに空欄（cloze-blank要素）が生成される', async ({ page }) => {
    // プレビューが生成されるのを待つ
    await page.waitForTimeout(500);

    const blanks = page.locator('#notePreview .cloze-blank');
    const count = await blanks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('単語レベルの穴埋めが正しく動作する', async ({ page }) => {
    await page.selectOption('#clozeBlankType', 'word');
    await page.waitForTimeout(500);

    const previewHtml = await page.locator('#notePreview').innerHTML();

    // 単語レベルではアンダースコアを含むcloze-blank要素が存在する
    expect(previewHtml).toContain('cloze-blank');
    const blanks = page.locator('#notePreview .cloze-blank');
    const count = await blanks.count();
    expect(count).toBeGreaterThan(0);

    // 少なくとも1つの空欄にアンダースコアが含まれている
    const firstBlank = await blanks.first().textContent();
    expect(firstBlank).toMatch(/_+/);
  });

  test('文字レベルの穴埋めが正しく動作する', async ({ page }) => {
    await page.selectOption('#clozeBlankType', 'char');
    await page.waitForTimeout(500);

    const previewHtml = await page.locator('#notePreview').innerHTML();

    // 文字レベルでもcloze-blank要素が存在する
    expect(previewHtml).toContain('cloze-blank');
    const blanks = page.locator('#notePreview .cloze-blank');
    const count = await blanks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('単語レベルと文字レベルで異なる出力が生成される', async ({ page }) => {
    // 単語レベル
    await page.selectOption('#clozeBlankType', 'word');
    await page.waitForTimeout(500);
    const wordHtml = await page.locator('#notePreview').innerHTML();

    // 文字レベルに切り替え
    await page.selectOption('#clozeBlankType', 'char');
    await page.waitForTimeout(500);
    const charHtml = await page.locator('#notePreview').innerHTML();

    // 両方ともcloze-blankを含むが、出力内容が異なる
    expect(wordHtml).toContain('cloze-blank');
    expect(charHtml).toContain('cloze-blank');

    // 文字レベルではcloze-blank-char要素が含まれる
    expect(charHtml).toContain('cloze-blank-char');
  });

  test('解答表示チェックボックスで解答セクションが表示・非表示になる', async ({ page }) => {
    // デフォルトでは解答が非表示
    const answersCheckbox = page.locator('#showClozeAnswers');
    const isChecked = await answersCheckbox.isChecked();

    if (!isChecked) {
      // 解答セクションが非表示であることを確認
      const answers = page.locator('#notePreview .cloze-answers');
      const answersCount = await answers.count();
      expect(answersCount).toBe(0);

      // チェックボックスをオンにする
      await answersCheckbox.check();
      await page.waitForTimeout(500);

      // 解答セクションが表示されることを確認
      const answersAfter = page.locator('#notePreview .cloze-answers');
      const answersCountAfter = await answersAfter.count();
      expect(answersCountAfter).toBeGreaterThan(0);
    } else {
      // 既にチェック済みの場合、解答が表示されていることを確認
      const answers = page.locator('#notePreview .cloze-answers');
      await expect(answers.first()).toBeVisible();

      // チェックを外す
      await answersCheckbox.uncheck();
      await page.waitForTimeout(500);

      // 解答セクションが非表示になることを確認
      const answersAfter = page.locator('#notePreview .cloze-answers');
      const answersCountAfter = await answersAfter.count();
      expect(answersCountAfter).toBe(0);
    }
  });

  test('解答表示をオンにすると Answer Key が表示される', async ({ page }) => {
    await page.locator('#showClozeAnswers').check();
    await page.waitForTimeout(500);

    const previewContent = await page.locator('#notePreview').textContent();
    expect(previewContent).toContain('Answer Key');
  });

  test('カテゴリー選択でコンテンツが変わる', async ({ page }) => {
    // あいさつカテゴリーを選択
    await page.selectOption('#clozeCategory', 'greetings');
    await page.waitForTimeout(500);
    const greetingsContent = await page.locator('#notePreview').textContent();

    // 買い物カテゴリーに切り替え
    await page.selectOption('#clozeCategory', 'shopping');
    await page.waitForTimeout(500);
    const shoppingContent = await page.locator('#notePreview').textContent();

    // 異なるカテゴリーで異なるコンテンツが表示される
    expect(greetingsContent).not.toEqual(shoppingContent);
  });

  test('複数カテゴリーが切り替え可能', async ({ page }) => {
    const categories = [
      'greetings',
      'self_introduction',
      'school',
      'shopping',
      'travel',
      'feelings',
      'daily_life',
    ];

    for (const category of categories) {
      await page.selectOption('#clozeCategory', category);
      await page.waitForTimeout(300);

      // 各カテゴリーでcloze-blank要素が生成されることを確認
      const blanks = page.locator('#notePreview .cloze-blank');
      const count = await blanks.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('教室の英語を複数ページ生成しても同一ページ内にフレーズの重複が出ない', async ({ page }) => {
    await page.selectOption('#clozeCategory', 'classroom_english');
    await page.fill('#pageCount', '3');
    await page.waitForTimeout(800);

    const englishTexts = await page.locator('#notePreview .cloze-english').allTextContents();
    expect(englishTexts.length).toBeGreaterThan(0);

    // 各ページの cloze-practice ブロックごとにフレーズが一意であること
    const pages = await page.locator('#notePreview .cloze-practice').all();
    expect(pages.length).toBeGreaterThanOrEqual(2);
    for (const pageBlock of pages) {
      const items = await pageBlock.locator('.cloze-english').allTextContents();
      const unique = new Set(items.map((s) => s.trim()));
      expect(unique.size).toBe(items.length);
    }
  });

  test('難易度セレクタが存在し、難易度ごとに穴の数が変わる', async ({ page }) => {
    await expect(page.locator('#clozeDifficulty')).toBeVisible();
    await page.selectOption('#clozeCategory', 'classroom_english');
    await page.selectOption('#clozeBlankType', 'word');

    await page.selectOption('#clozeDifficulty', 'easy');
    await page.waitForTimeout(500);
    const easyBlanks = await page.locator('#notePreview .cloze-blank').count();

    await page.selectOption('#clozeDifficulty', 'hard');
    await page.waitForTimeout(500);
    const hardBlanks = await page.locator('#notePreview .cloze-blank').count();

    // hard は easy より多くの穴を生成するはず
    expect(hardBlanks).toBeGreaterThan(easyBlanks);
  });
});
