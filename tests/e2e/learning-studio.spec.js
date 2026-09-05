import { test, expect } from '@playwright/test';

test('five-question practice, retry, persistence and worksheet handoff', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#learnPanel')).toBeVisible();
  await page.getByRole('button', { name: '練習をはじめる', exact: true }).click();
  const answers = [];
  for (let i = 0; i < 5; i++) {
    await expect(page.locator('#questionProgress')).toHaveText('QUESTION ' + (i + 1) + ' / 5');
    for (const input of await page.locator('#questionEnglish input').all())
      await input.fill('wrong');
    await page.getByRole('button', { name: '答え合わせ', exact: true }).click();
    await expect(page.locator('#answerFeedback')).toContainText('お手本を見て');
    answers.push(
      (await page.locator('.answer-key').textContent()).replace('答え：', '').split(' / ')
    );
    await page.locator('#nextQuestion').click();
  }
  await expect(page.locator('#resultScore')).toHaveText('0 / 5');
  await expect(page.locator('#reviewCount')).toHaveText('5');
  await page.locator('#retryMistakes').click();
  for (let i = 0; i < 5; i++) {
    const inputs = await page.locator('#questionEnglish input').all();
    for (let j = 0; j < inputs.length; j++)
      await inputs[j].fill(' ' + answers[i][j].toUpperCase() + ' ');
    await page.locator('#checkAnswer').click();
    await expect(page.locator('#answerFeedback')).toContainText('正解');
    await page.locator('#nextQuestion').click();
  }
  await expect(page.locator('#resultScore')).toHaveText('5 / 5');
  await expect(page.locator('#reviewCount')).toHaveText('0');
  await expect(page.locator('#attemptCount')).toHaveText('10');
  await expect(page.locator('#retryMistakes')).toBeHidden();
  await page.locator('#printLesson').click();
  await expect(page.locator('#worksheetPanel')).toBeVisible();
  await expect(page.locator('#practiceMode')).toHaveValue('cloze');
  await expect(page.locator('#clozeCategory')).toHaveValue('greetings');
  await expect(page.locator('#notePreview .cloze-blank').first()).toBeVisible();
  await page.getByRole('button', { name: '今日の練習', exact: true }).click();
  await page.reload();
  await expect(page.locator('#learnedCount')).toHaveText('5');
  await expect(page.locator('#attemptCount')).toHaveText('10');
  await page.getByRole('button', { name: '復習', exact: true }).click();
  await expect(page.locator('#startReview')).toBeDisabled();
  await expect(page.locator('.review-row')).toHaveCount(5);
});

test('missed questions survive reload and can be reviewed', async ({ page }) => {
  await page.goto('/');
  await page.locator('#startLesson').click();
  await page.locator('#hintButton').click();
  await expect(page.locator('#hintText')).toContainText('から始まる');
  for (const input of await page.locator('#questionEnglish input').all()) await input.fill('wrong');
  await page.locator('#checkAnswer').click();
  await page.reload();
  await page.getByRole('button', { name: '復習', exact: true }).click();
  await expect(page.locator('#startReview')).toBeEnabled();
  await expect(page.locator('#reviewSummary')).toContainText('1問');
  await page.locator('#startReview').click();
  await expect(page.locator('#questionProgress')).toHaveText('QUESTION 1 / 1');
});

test('switching navigation preserves an in-progress answer', async ({ page }) => {
  await page.goto('/');
  await page.locator('#learnBlankType').selectOption('char');
  await page.locator('#startLesson').click();
  await page.locator('#questionEnglish input').first().fill('abc');
  await page.getByRole('button', { name: 'プリント作成', exact: true }).click();
  await page.getByRole('button', { name: '今日の練習', exact: true }).click();
  await expect(page.locator('#questionEnglish input').first()).toHaveValue('abc');
  await expect(page.locator('#questionInstruction')).toContainText('文字だけ');
});

test('storage failure does not prevent practice and is explained', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage disabled');
      },
    });
  });
  await page.goto('/');
  await expect(page.locator('#storageNotice')).toContainText('保存・読み込みできません');
  await page.locator('#startLesson').click();
  for (const input of await page.locator('#questionEnglish input').all()) await input.fill('wrong');
  await page.locator('#checkAnswer').click();
  await expect(page.locator('#nextQuestion')).toBeVisible();
  await expect(page.locator('#reviewCount')).toHaveText('1');
});

test('a failed content load provides a visible recovery message', async ({ page }) => {
  await page.route('**/src/data/word-lists.js*', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('#learnMessage')).toContainText('教材を読み込めませんでした');
  await expect(page.locator('#startLesson')).toBeDisabled();
});

test('mobile navigation and exercise inputs fit without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('#startLesson')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.locator('#learnDifficulty').selectOption('hard');
  await page.locator('#startLesson').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.getByRole('button', { name: 'プリント作成', exact: true }).click();
  await expect(page.locator('#notePreview')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('answer key and print preview retain the generated blanks', async ({ page }) => {
  await page.goto('/?practiceMode=cloze&clozeCategory=greetings');
  const firstQuestion = page.locator('#notePreview .cloze-english').first();
  const before = await firstQuestion.innerHTML();
  await page.locator('#showClozeAnswers').check();
  await expect(firstQuestion).toHaveJSProperty('innerHTML', before);
  await page.locator('#previewBtn').click();
  await expect(page.locator('#printPreviewModal')).toBeVisible();
  await expect(page.locator('#a4Preview .cloze-english').first()).toHaveJSProperty(
    'innerHTML',
    before
  );
});
