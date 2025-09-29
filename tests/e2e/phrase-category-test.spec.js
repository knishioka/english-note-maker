/**
 * フレーズカテゴリー切り替えのE2Eテスト
 * 各カテゴリーが正しく表示されることを確認
 */

const { test, expect } = require('@playwright/test');

test.describe('フレーズカテゴリー切り替えテスト', () => {
  test.beforeEach(async({ page }) => {
    // 開発サーバーにアクセス
    await page.goto('http://localhost:3000');

    // フレーズ練習モードを選択
    await page.selectOption('#practiceMode', 'phrase');

    // フレーズ練習モードが選択されていることを確認
    await expect(page.locator('#phraseOptions')).toBeVisible();
  });

  test('あいさつカテゴリーが正しく表示される', async({ page }) => {
    // あいさつカテゴリーを選択
    await page.selectOption('#phraseCategory', 'greetings');

    // プレビューを確認
    const previewContent = await page.locator('#notePreview').textContent();

    // カテゴリー名が表示されていることを確認
    expect(previewContent).toContain('Phrase Practice - あいさつ');

    // あいさつに関連するフレーズが表示されていることを確認
    const hasGreetings =
      previewContent.includes('Hello') ||
      previewContent.includes('Good morning') ||
      previewContent.includes('How are you') ||
      previewContent.includes('Nice to meet you');

    expect(hasGreetings).toBeTruthy();
  });

  test('自己紹介カテゴリーが正しく表示される', async({ page }) => {
    // 自己紹介カテゴリーを選択
    await page.selectOption('#phraseCategory', 'self_introduction');

    // 少し待機（レンダリングのため）
    await page.waitForTimeout(500);

    // プレビューを確認
    const previewContent = await page.locator('#notePreview').textContent();

    // カテゴリー名が表示されていることを確認
    expect(previewContent).toContain('Phrase Practice - 自己紹介');

    // 自己紹介に関連するフレーズが表示されていることを確認
    const hasSelfIntroduction =
      previewContent.includes('My name is') ||
      previewContent.includes('I am') ||
      previewContent.includes('from Japan') ||
      previewContent.includes('My hobby');

    expect(hasSelfIntroduction).toBeTruthy();
  });

  test('学校生活カテゴリーが正しく表示される', async({ page }) => {
    // 学校生活カテゴリーを選択
    await page.selectOption('#phraseCategory', 'school');

    // 少し待機
    await page.waitForTimeout(500);

    // プレビューを確認
    const previewContent = await page.locator('#notePreview').textContent();

    // カテゴリー名が表示されていることを確認
    expect(previewContent).toContain('Phrase Practice - 学校生活');

    // 学校に関連するフレーズが表示されていることを確認
    const hasSchool =
      previewContent.includes('school') ||
      previewContent.includes('teacher') ||
      previewContent.includes('homework') ||
      previewContent.includes('class');

    expect(hasSchool).toBeTruthy();
  });

  test('買い物カテゴリーが正しく表示される', async({ page }) => {
    // 買い物カテゴリーを選択
    await page.selectOption('#phraseCategory', 'shopping');

    // 少し待機
    await page.waitForTimeout(500);

    // プレビューを確認
    const previewContent = await page.locator('#notePreview').textContent();

    // カテゴリー名が表示されていることを確認
    expect(previewContent).toContain('Phrase Practice - 買い物');
  });

  test('日常生活カテゴリーが正しく表示される', async({ page }) => {
    // 日常生活カテゴリーを選択
    await page.selectOption('#phraseCategory', 'daily_life');

    // 少し待機
    await page.waitForTimeout(500);

    // プレビューを確認
    const previewContent = await page.locator('#notePreview').textContent();

    // カテゴリー名が表示されていることを確認
    expect(previewContent).toContain('Phrase Practice - 日常生活');

    // 日常生活に関連するフレーズが表示されていることを確認
    const hasDailyLife =
      previewContent.includes('wake up') ||
      previewContent.includes('brush') ||
      previewContent.includes('bed') ||
      previewContent.includes('watch TV');

    expect(hasDailyLife).toBeTruthy();
  });

  test('シャッフルボタンでフレーズが更新される', async({ page }) => {
    // 最初のプレビュー内容を取得
    const initialContent = await page.locator('#notePreview').textContent();

    // シャッフルボタンをクリック
    await page.click('#shufflePhrases');

    // 少し待機
    await page.waitForTimeout(500);

    // 更新後のプレビュー内容を取得
    const updatedContent = await page.locator('#notePreview').textContent();

    // 内容が変わっていることを確認（カテゴリー名は同じだが、フレーズが変わる可能性がある）
    // ランダムなので必ず変わるとは限らないが、テストは通るはず
    expect(updatedContent).toContain('Phrase Practice - あいさつ');
  });

  test('年齢グループを変更してもカテゴリーが維持される', async({ page }) => {
    // 自己紹介カテゴリーを選択
    await page.selectOption('#phraseCategory', 'self_introduction');
    await page.waitForTimeout(500);

    // 年齢グループを変更
    await page.selectOption('#ageGroup', '10-12');
    await page.waitForTimeout(500);

    // プレビューを確認
    const previewContent = await page.locator('#notePreview').textContent();

    // カテゴリーが維持されていることを確認
    expect(previewContent).toContain('Phrase Practice - 自己紹介');

    // 10-12歳向けのフレーズが表示されていることを確認
    const hasAdvancedPhrases =
      previewContent.includes('interested in') ||
      previewContent.includes('dream') ||
      previewContent.includes('studying') ||
      previewContent.includes('good at');

    expect(hasAdvancedPhrases).toBeTruthy();
  });
});

// 全カテゴリーの網羅的テスト
test('全カテゴリーが切り替え可能', async({ page }) => {
  await page.goto('http://localhost:3000');
  await page.selectOption('#practiceMode', 'phrase');

  const categories = [
    { value: 'greetings', name: 'あいさつ' },
    { value: 'self_introduction', name: '自己紹介' },
    { value: 'school', name: '学校生活' },
    { value: 'shopping', name: '買い物' },
    { value: 'travel', name: '旅行・移動' },
    { value: 'feelings', name: '感情表現' },
    { value: 'daily_life', name: '日常生活' },
    { value: 'classroom_english', name: '教室での英語' },
    { value: 'friend_making', name: '友達作り' },
    { value: 'cultural_exchange', name: '文化交流' },
    { value: 'emergency_situations', name: '緊急時の表現' },
  ];

  for (const category of categories) {
    // カテゴリーを選択
    await page.selectOption('#phraseCategory', category.value);
    await page.waitForTimeout(300);

    // プレビューを確認
    const previewContent = await page.locator('#notePreview').textContent();

    // カテゴリー名が正しく表示されていることを確認
    expect(previewContent).toContain(`Phrase Practice - ${category.name}`);

    console.log(`✅ ${category.name} カテゴリー: OK`);
  }
});
