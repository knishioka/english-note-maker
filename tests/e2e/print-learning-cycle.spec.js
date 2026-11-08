import { test, expect } from '@playwright/test';

// 紙で解く学習サイクル：印刷 → 記録 → 答え合わせ → 復習が次のプリントに先に出る
const LOG_KEY = 'english-note-maker.worksheets.v1';
const PROGRESS_KEY = 'english-note-maker.learning.v1';

async function printedPhraseIds(page) {
  return page.evaluate((key) => {
    const log = JSON.parse(window.localStorage.getItem(key));
    const sheet = log.sheets[log.sheets.length - 1];
    return sheet.items.map((item) => item.phraseId);
  }, LOG_KEY);
}

test('printing logs the worksheet and paper results drive the next worksheet', async ({ page }) => {
  await page.addInitScript(() => {
    window.__prints = 0;
    window.print = () => {
      window.__prints += 1;
    };
  });
  await page.goto('/?view=worksheet&practiceMode=cloze&clozeCategory=weather&ageGroup=7-9');
  await expect(page.locator('#clozeSelection')).toHaveValue('smart');
  await expect(page.locator('#notePreview [data-testid="cloze-sheet-number"]').first()).toHaveText(
    'プリント No.1'
  );
  await expect(page.locator('#clozeHistoryNotice')).toContainText('復習 0');
  const questions = await page.locator('#notePreview .cloze-japanese').allTextContents();
  expect(questions.length).toBeGreaterThan(2);

  await page.locator('#printBtn').click();
  expect(await page.evaluate(() => window.__prints)).toBe(1);
  await expect(page.locator('#notePreview [data-testid="cloze-sheet-number"]').first()).toHaveText(
    'プリント No.2'
  );
  // 印刷しただけでは出題内容は変わらない
  expect(await page.locator('#notePreview .cloze-japanese').allTextContents()).toEqual(questions);
  const printedIds = await printedPhraseIds(page);
  expect(printedIds.length).toBe(questions.length);
  await expect(page.locator('#clozeHistoryNotice')).toContainText('出題済み ' + questions.length);

  // 紙で答え合わせ：Q2 と Q3 を「もう一度」
  await page.getByRole('button', { name: '復習', exact: true }).click();
  await expect(page.locator('#worksheetList .sheet-row')).toHaveCount(1);
  await expect(page.locator('#worksheetList')).toContainText('No.1 · 天気 · 単語の穴埋め');
  await page.locator('#worksheetList [data-action="grade"]').click();
  const form = page.locator('#worksheetList form');
  await expect(form.locator('.sheet-question')).toHaveCount(questions.length);
  await expect(form.locator('.sheet-question').nth(1).locator('.muted')).toHaveText(questions[1]);
  await form.locator('input[value="1"]').check();
  await form.locator('input[value="2"]').check();
  await form.getByRole('button', { name: '結果を記録する' }).click();
  await expect(page.locator('#worksheetNotice')).toContainText('No.1 の結果を記録しました');
  await expect(page.locator('#worksheetList')).toContainText(
    'できた ' + (questions.length - 2) + ' / ' + questions.length
  );
  await expect(page.locator('#reviewCount')).toHaveText('2');
  await expect(page.locator('#attemptCount')).toHaveText(String(questions.length));
  const records = await page.evaluate(
    (key) => JSON.parse(window.localStorage.getItem(key)).records,
    PROGRESS_KEY
  );
  expect(records.filter((record) => record.streak === 0).map((record) => record.phraseId)).toEqual(
    expect.arrayContaining([printedIds[1], printedIds[2]])
  );

  // 次のプリントは、まちがえた2問が先頭に来る
  await page.getByRole('button', { name: 'プリント作成', exact: true }).click();
  await expect(page.locator('#clozeHistoryNotice')).toContainText('復習 2');
  const nextQuestions = await page.locator('#notePreview .cloze-japanese').allTextContents();
  expect(nextQuestions.slice(0, 2).sort()).toEqual([questions[1], questions[2]].sort());
  // 残りは未出題の問題が優先される
  for (const text of nextQuestions.slice(2)) expect(questions).not.toContain(text);

  // ランダムに切り替えると履歴に関係なく並ぶ設定が URL に残る
  await page.locator('#clozeSelection').selectOption('random');
  await expect(page).toHaveURL(/clozeSelection=random/);
  await page.locator('#clozeSelection').selectOption('smart');

  // 復習プリントは、復習対象だけを固定セットとして印刷する
  await page.getByRole('button', { name: '復習', exact: true }).click();
  await page.locator('#printReview').click();
  await expect(page.locator('#fixedWorksheetNotice')).toBeVisible();
  await expect(page.locator('#notePreview .practice-title--cloze')).toContainText('復習プリント');
  expect((await page.locator('#notePreview .cloze-japanese').allTextContents()).sort()).toEqual(
    [questions[1], questions[2]].sort()
  );
  await page.locator('#printBtn').click();
  expect(await page.evaluate(() => window.__prints)).toBe(2);
  expect(await printedPhraseIds(page)).toEqual(
    expect.arrayContaining([printedIds[1], printedIds[2]])
  );
  await page.getByRole('button', { name: '復習', exact: true }).click();
  await expect(page.locator('#worksheetList .sheet-row')).toHaveCount(2);
  await expect(page.locator('#worksheetList .sheet-row').first()).toContainText(
    'No.2 · 復習プリント'
  );

  // 記録は再読み込み後も残り、もう一度印刷できる
  await page.reload();
  await page.getByRole('button', { name: '復習', exact: true }).click();
  await expect(page.locator('#worksheetList .sheet-row')).toHaveCount(2);
  await page.locator('#worksheetList .sheet-row').last().locator('[data-action="reprint"]').click();
  await expect(page.locator('#notePreview .practice-title--cloze')).toContainText(
    'No.1 をもう一度'
  );
  expect(await page.locator('#notePreview .cloze-japanese').allTextContents()).toEqual(questions);
});
