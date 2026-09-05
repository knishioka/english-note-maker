import { test, expect } from '@playwright/test';

async function finishLesson(page) {
  for (let i = 0; i < 5; i++) {
    for (const input of await page.locator('#questionEnglish input').all())
      await input.fill('wrong');
    await page.locator('#checkAnswer').click();
    await page.locator('#nextQuestion').click();
  }
}

async function printedQuestions(page) {
  return page.locator('#notePreview .cloze-english').evaluateAll((elements) =>
    elements.map((element) => {
      const copy = element.cloneNode(true);
      for (const blank of copy.querySelectorAll('.cloze-blank'))
        blank.replaceWith('[' + blank.querySelectorAll('.cloze-box').length + ']');
      return copy.textContent;
    })
  );
}

test('a saved set survives reload, repeats exact blanks, exports/imports and prints all questions', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#learnBlankType').selectOption('char');
  await page.locator('#startLesson').click();
  await finishLesson(page);
  await page.locator('#saveLesson').click();
  await expect(page.locator('#saveLessonNotice')).toContainText('保存しました');
  const saved = await page.evaluate(
    () => JSON.parse(window.localStorage.getItem('english-note-maker.lessons.v1')).sets[0]
  );
  const masked = saved.items.map((item) => {
    let cursor = 0;
    let text = '';
    for (const blank of item.blanks) {
      text += item.english.slice(cursor, blank.start) + '[' + (blank.end - blank.start) + ']';
      cursor = blank.end;
    }
    return text + item.english.slice(cursor);
  });
  await page.reload();
  await expect(page.locator('#savedLessonSelect option')).toHaveCount(1);
  await page.locator('#practiceSavedLesson').click();
  for (let i = 0; i < 5; i++) {
    const item = saved.items[i];
    await expect(page.locator('#questionJapanese')).toHaveText(item.japanese);
    const inputs = await page.locator('#questionEnglish input').all();
    expect(inputs.length).toBe(item.blanks.length);
    for (let j = 0; j < inputs.length; j++)
      await inputs[j].fill(item.english.slice(item.blanks[j].start, item.blanks[j].end));
    await page.locator('#checkAnswer').click();
    await expect(page.locator('#answerFeedback')).toContainText('正解');
    await page.locator('#nextQuestion').click();
  }
  await page.locator('#printLesson').click();
  await expect(page.locator('#fixedWorksheetNotice')).toBeVisible();
  expect(await printedQuestions(page)).toEqual(masked);
  await page.locator('#lineHeight').selectOption('12');
  await page.locator('#showClozeAnswers').check();
  expect(await printedQuestions(page)).toEqual(masked);
  await expect(page.locator('#notePreview [data-testid="cloze-number"]')).toHaveText([
    'Q1',
    'Q2',
    'Q3',
    'Q4',
    'Q5',
  ]);
  await expect(page.locator('#notePreview [data-testid="cloze-answer-number"]')).toHaveText([
    'Q1',
    'Q2',
    'Q3',
    'Q4',
    'Q5',
  ]);
  await page.emulateMedia({ media: 'print' });
  expect(await printedQuestions(page)).toEqual(masked);
  const sizes = await page
    .locator('#notePreview .note-page')
    .evaluateAll((pages) => pages.map((p) => ({ width: p.offsetWidth, height: p.offsetHeight })));
  for (const size of sizes) {
    expect(size.width).toBeLessThanOrEqual(795);
    expect(size.height).toBeLessThanOrEqual(1125);
  }
  await page.emulateMedia({ media: 'screen' });
  await page.locator('#releaseWorksheet').click();
  await expect(page.locator('#practiceMode')).toBeEnabled();
  await page.getByRole('button', { name: '今日の練習', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportLesson').click();
  const download = await downloadPromise;
  const exported = await download.createReadStream();
  const chunks = [];
  for await (const chunk of exported) chunks.push(chunk);
  const content = Buffer.concat(chunks);
  expect(JSON.parse(content.toString()).lesson.items).toEqual(saved.items);
  await page
    .locator('#importLesson')
    .setInputFiles({ name: 'lesson.json', mimeType: 'application/json', buffer: content });
  await expect(page.locator('#savedLessonSelect option')).toHaveCount(2);
  await page.locator('#printSavedLesson').click();
  expect(await printedQuestions(page)).toEqual(masked);
});

test('legacy English corrections retain history and missing content does not inflate the review count', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'english-note-maker.learning.v1',
      JSON.stringify({
        version: 1,
        records: [
          {
            english: 'Please!',
            category: 'greetings',
            age: '4-6',
            blankType: 'word',
            difficulty: 'easy',
            attempts: 4,
            streak: 0,
            updatedAt: 1000,
            dueAt: 1000,
          },
          {
            english: 'Removed example.',
            category: 'greetings',
            age: '4-6',
            blankType: 'word',
            difficulty: 'easy',
            attempts: 2,
            streak: 0,
            updatedAt: 1000,
            dueAt: 1000,
          },
          {
            english: 'I have a sister.',
            category: 'self_introduction',
            age: '4-6',
            blankType: 'word',
            difficulty: 'easy',
            attempts: 3,
            streak: 0,
            updatedAt: 2000,
            dueAt: 2000,
          },
        ],
      })
    );
  });
  await page.goto('/');
  await expect(page.locator('#reviewCount')).toHaveText('2');
  await expect(page.locator('#attemptCount')).toHaveText('9');
  await page.getByRole('button', { name: '復習', exact: true }).click();
  await expect(page.locator('#reviewUnavailable')).toContainText('1件');
  await page.locator('#startReview').click();
  await expect(page.locator('#questionJapanese')).toHaveText('おねがい！');
  await page.locator('#questionEnglish input').fill('Please');
  await page.locator('#checkAnswer').click();
  await page.locator('#nextQuestion').click();
  await expect(page.locator('#questionRevision')).toContainText('最新版');
  const records = await page.evaluate(
    () => JSON.parse(window.localStorage.getItem('english-note-maker.learning.v1')).records
  );
  expect(records.find((record) => record.category === 'self_introduction')).toMatchObject({
    english: 'I have an older sister.',
    attempts: 3,
  });
});

test('invalid files do not replace saved sets and the library fits on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('#importLesson')).toBeEnabled();
  await page.locator('#importLesson').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.locator('#libraryNotice')).toContainText('対応していません');
  await expect(page.locator('#savedLessonSelect option')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
