import { beforeEach, describe, expect, it } from 'vitest';
import { createLessonItem } from '../src/learning/exercises.js';
import {
  appendWorksheet,
  createWorksheet,
  gradeWorksheet,
  isGraded,
  MAX_WORKSHEETS,
  readWorksheetLog,
  saveWorksheetLog,
  summarizeWorksheet,
  validWorksheet,
  WORKSHEET_LOG_KEY,
} from '../src/learning/worksheet-log.js';

const settings = { category: 'greetings', age: '7-9', blankType: 'word', difficulty: 'easy' };
const items = Array.from({ length: 3 }, (_, i) =>
  createLessonItem(
    { id: 'phrase-' + i, english: 'Have a good day ' + i + '.', japanese: 'よい一日を' },
    settings
  )
);

beforeEach(() => window.localStorage.clear());

describe('worksheet log', () => {
  it('creates, grades and summarizes a printed worksheet', () => {
    const sheet = createWorksheet(items, 4, '', 1000);
    expect(validWorksheet(sheet)).toBe(true);
    expect(isGraded(sheet)).toBe(false);
    expect(summarizeWorksheet(sheet)).toEqual({ total: 3, graded: false, correct: 0, wrong: 0 });
    const graded = gradeWorksheet(sheet, [1], 2000);
    expect(graded.results).toEqual(['correct', 'wrong', 'correct']);
    expect(graded.gradedAt).toBe(2000);
    expect(summarizeWorksheet(graded)).toEqual({ total: 3, graded: true, correct: 2, wrong: 1 });
    expect(sheet.results).toEqual([]);
  });

  it('round-trips through storage and refuses invalid data without overwriting it', () => {
    const sheet = createWorksheet(items, 1);
    expect(saveWorksheetLog(window.localStorage, [sheet], 2)).toBe(true);
    expect(readWorksheetLog(window.localStorage)).toEqual({
      sheets: [sheet],
      nextNumber: 2,
      available: true,
    });
    expect(readWorksheetLog({ getItem: () => null })).toEqual({
      sheets: [],
      nextNumber: 1,
      available: true,
    });
    for (const broken of [
      '{"version":2,"sheets":[],"nextNumber":1}',
      '{"version":1,"sheets":[{}],"nextNumber":1}',
      '{"version":1,"sheets":[],"nextNumber":0}',
      JSON.stringify({ version: 1, nextNumber: 1, sheets: [{ ...sheet, results: ['maybe'] }] }),
      JSON.stringify({
        version: 1,
        nextNumber: 1,
        sheets: [{ ...sheet, items: [{ ...sheet.items[0], english: '<b>x</b>' }] }],
      }),
    ]) {
      window.localStorage.setItem(WORKSHEET_LOG_KEY, broken);
      expect(readWorksheetLog(window.localStorage).available).toBe(false);
    }
    expect(saveWorksheetLog(window.localStorage, [{ ...sheet, number: 0 }], 2)).toBe(false);
    expect(
      saveWorksheetLog(
        {
          setItem() {
            throw new Error('quota');
          },
        },
        [sheet],
        2
      )
    ).toBe(false);
  });

  it('drops the oldest graded sheets first when the log is full', () => {
    let sheets = [];
    for (let i = 1; i <= MAX_WORKSHEETS; i++) {
      const sheet = createWorksheet(items, i, '', i);
      sheets = appendWorksheet(sheets, i === 2 ? gradeWorksheet(sheet, [], i) : sheet);
    }
    expect(sheets).toHaveLength(MAX_WORKSHEETS);
    sheets = appendWorksheet(sheets, createWorksheet(items, MAX_WORKSHEETS + 1));
    expect(sheets).toHaveLength(MAX_WORKSHEETS);
    expect(sheets.map((sheet) => sheet.number)).not.toContain(2);
    expect(sheets[0].number).toBe(1);
    sheets = appendWorksheet(sheets, createWorksheet(items, MAX_WORKSHEETS + 2));
    expect(sheets[0].number).toBe(3);
  });
});
