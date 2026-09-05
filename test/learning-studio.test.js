import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initLearningStudio } from '../src/learning/studio.js';
import { LIBRARY_KEY } from '../src/learning/lesson-library.js';

const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../index.html'), 'utf8');
const $ = (id) => document.getElementById(id);
const pool = Array.from({ length: 5 }, (_, i) => ({
  id: 'phrase-' + i,
  revision: 1,
  english: 'Have a good day!',
  japanese: 'よい一日を！',
  category: 'greetings',
  focusWords: ['good'],
  acceptedEnglish: ['Have a nice day!'],
}));
const submit = (id) =>
  $(id).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
const answer = (value) => {
  for (const input of $('questionEnglish').querySelectorAll('input')) input.value = value;
  submit('answerForm');
};

beforeEach(() => {
  document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

describe('learning studio interactions', () => {
  it('runs practice, hints, exact retries, saving, printing, library reuse and deletion', () => {
    const print = vi.fn();
    initLearningStudio({
      getPhrasePool: () => pool,
      categoryNames: { greetings: 'あいさつ' },
      onWorksheetOpen: vi.fn(),
      onPrintLesson: print,
    });
    submit('lessonSetup');
    submit('answerForm');
    expect($('answerFeedback').textContent).toContain('入力して');
    for (let i = 0; i < 5; i++) {
      if (i === 0) $('hintButton').click();
      answer('wrong');
      submit('answerForm');
      expect($('answerFeedback').textContent).toContain('別の言い方');
      $('nextQuestion').click();
    }
    expect($('resultScore').textContent).toBe('0 / 5');
    $('saveLesson').click();
    expect($('savedLessonSelect').options.length).toBe(1);
    $('retryMistakes').click();
    for (let i = 0; i < 5; i++) {
      answer('nice');
      expect($('answerFeedback').textContent).toContain('あなたの答えも正しい');
      $('nextQuestion').click();
    }
    expect($('resultScore').textContent).toBe('5 / 5');
    $('printLesson').click();
    expect(print).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ english: 'Have a good day!' })])
    );
    document.querySelector('[data-view-link="learn"]').click();
    $('printSavedLesson').click();
    expect(print).toHaveBeenCalledTimes(2);
    document.querySelector('[data-view-link="learn"]').click();
    $('practiceSavedLesson').click();
    expect($('questionEnglish').querySelectorAll('input').length).toBe(1);
    $('endLesson').click();
    document.querySelector('[data-view-link="review"]').click();
    expect($('reviewList').children.length).toBe(5);
    expect($('startReview').disabled).toBe(true);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    $('removeLesson').click();
    expect($('savedLessonSelect').options.length).toBe(1);
    vi.mocked(window.confirm).mockReturnValue(true);
    $('removeLesson').click();
    expect(JSON.parse(window.localStorage.getItem(LIBRARY_KEY)).sets).toEqual([]);
  });

  it('keeps old English history, excludes missing content and shows revision notices', () => {
    const record = {
      english: 'Earlier sentence.',
      category: 'greetings',
      age: '7-9',
      difficulty: 'easy',
      blankType: 'char',
      attempts: 3,
      streak: 0,
      updatedAt: 1,
      dueAt: 1,
    };
    window.localStorage.setItem(
      'english-note-maker.learning.v1',
      JSON.stringify({ version: 1, records: [record, { ...record, english: 'Unavailable.' }] })
    );
    initLearningStudio({
      getPhrasePool: () => [{ ...pool[0], revision: 2, legacyEnglish: [record.english] }],
      categoryNames: { greetings: 'あいさつ' },
      onWorksheetOpen: vi.fn(),
      onPrintLesson: vi.fn(),
    });
    document.querySelector('[data-view-link="review"]').click();
    expect($('reviewSummary').textContent).toContain('1問');
    expect($('reviewUnavailable').textContent).toContain('1件');
    $('startReview').click();
    expect($('questionRevision').textContent).toContain('最新版');
    expect($('questionInstruction').textContent).toContain('文字だけ');
    $('hintButton').click();
    expect($('hintText').textContent).toContain('から始まる');
    answer('wrong');
    $('nextQuestion').click();
    $('newLesson').click();
    expect($('lessonSetup').hidden).toBe(false);
  });

  it('handles empty pools and preserves unreadable storage rather than overwriting it', () => {
    window.localStorage.setItem(LIBRARY_KEY, '{"version":99}');
    window.localStorage.setItem('english-note-maker.learning.v1', '{"version":99}');
    let current = [];
    initLearningStudio({
      getPhrasePool: () => current,
      categoryNames: { greetings: 'あいさつ' },
      onWorksheetOpen: vi.fn(),
      onPrintLesson: vi.fn(),
    });
    submit('lessonSetup');
    expect($('learnMessage').textContent).toContain('問題がありません');
    current = pool;
    submit('lessonSetup');
    for (let i = 0; i < 5; i++) {
      answer('good');
      $('nextQuestion').click();
    }
    $('saveLesson').click();
    expect($('saveLessonNotice').textContent).toContain('上書きせず');
    expect(window.localStorage.getItem(LIBRARY_KEY)).toBe('{"version":99}');
    expect(window.localStorage.getItem('english-note-maker.learning.v1')).toBe('{"version":99}');
  });
});
