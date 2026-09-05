import { describe, expect, it } from 'vitest';
import { generateClozeText } from '../src/learning/cloze.js';
import { createLessonItem } from '../src/learning/studio.js';
import {
  dueRecords,
  exerciseId,
  normalizeAnswer,
  PROGRESS_KEY,
  readProgress,
  recordAttempt,
  saveProgress,
} from '../src/learning/progress.js';

const item = {
  english: 'How are you?',
  category: 'greetings',
  age: '7-9',
  blankType: 'word',
  difficulty: 'easy',
};
const DAY = 86400000;

describe('learning progress', () => {
  it('preserves chosen difficulty when collection metadata has a numeric difficulty', () => {
    const exercise = createLessonItem(
      { english: 'Hello there!', japanese: 'こんにちは！', difficulty: 2 },
      item
    );
    expect(exercise.difficulty).toBe('easy');
    const records = recordAttempt([], exercise, true, 1000);
    expect(
      readProgress({ getItem: () => JSON.stringify({ version: 1, records }) }).records
    ).toHaveLength(1);
  });
  it('accepts case, whitespace, full-width letters and curly apostrophes', () => {
    expect(normalizeAnswer('  ＨＥＬＬＯ  ')).toBe('hello');
    expect(normalizeAnswer('DON’T')).toBe("don't");
    expect(normalizeAnswer('their')).not.toBe(normalizeAnswer('there'));
  });
  it('schedules consecutive correct answers after 1, 3, 7, then 14 days', () => {
    let records = [];
    for (const days of [1, 3, 7, 14, 14]) {
      records = recordAttempt(records, item, true, 1000);
      expect(records).toHaveLength(1);
      expect(records[0].dueAt).toBe(1000 + days * DAY);
      expect(dueRecords(records, 1000 + days * DAY - 1)).toHaveLength(0);
      expect(dueRecords(records, 1000 + days * DAY)).toHaveLength(1);
    }
    expect(records[0].attempts).toBe(5);
  });
  it('makes an incorrect or assisted attempt due immediately and resets the interval', () => {
    let records = recordAttempt([], item, true, 1000);
    records = recordAttempt(records, item, false, 2000);
    expect(records[0]).toMatchObject({ streak: 0, attempts: 2, dueAt: 2000 });
    expect(dueRecords(records, 2000)).toHaveLength(1);
    records = recordAttempt(records, item, true, 3000);
    expect(records[0].dueAt).toBe(3000 + DAY);
  });
  it('keeps age, blank type and difficulty independent but deduplicates shared categories', () => {
    expect(exerciseId(item)).toBe(exerciseId({ ...item, category: 'all' }));
    for (const change of [{ age: '4-6' }, { blankType: 'char' }, { difficulty: 'hard' }]) {
      expect(exerciseId(item)).not.toBe(exerciseId({ ...item, ...change }));
    }
  });
  it('round-trips records without storing learner input', () => {
    const storage = window.localStorage;
    storage.clear();
    expect(readProgress(storage)).toEqual({ records: [], available: true });
    const records = recordAttempt([], item, false, 1000);
    expect(saveProgress(storage, records)).toBe(true);
    expect(readProgress(storage)).toEqual({ records, available: true });
  });
  it('recovers from broken or unavailable storage', () => {
    for (const raw of [
      '{',
      'null',
      '{"version":2,"records":[]}',
      '{"version":1,"records":[null,{}]}',
    ]) {
      const storage = { getItem: () => raw };
      expect(readProgress(storage)).toEqual({ records: [], available: false });
    }
    expect(readProgress(undefined)).toEqual({ records: [], available: false });
    expect(
      saveProgress(
        {
          setItem: () => {
            throw new Error('quota');
          },
        },
        []
      )
    ).toBe(false);
    expect(PROGRESS_KEY).toContain('.v1');
  });
  it('orders overdue questions before newly missed ones', () => {
    const records = [
      ...recordAttempt([], item, false, 2000),
      ...recordAttempt([], { ...item, english: 'Good morning.' }, false, 1000),
    ];
    expect(dueRecords(records, 2000).map((record) => record.dueAt)).toEqual([1000, 2000]);
  });
});

describe('shared cloze generator', () => {
  for (const blankType of ['word', 'char']) {
    for (const difficulty of ['easy', 'normal', 'hard']) {
      it(blankType + ' / ' + difficulty + ' preserves punctuation and answer order', () => {
        const text = 'Hello, can you help me with my homework?';
        const exercise = generateClozeText(text, blankType, difficulty);
        const container = document.createElement('div');
        container.innerHTML = exercise.display;
        const blanks = [...container.querySelectorAll('.cloze-blank')];
        expect(blanks.length).toBeGreaterThan(0);
        expect(blanks.length).toBe(exercise.answers.length);
        blanks.forEach((blank, i) => {
          expect(blank.querySelectorAll('.cloze-box').length).toBe(exercise.answers[i].length);
          blank.replaceWith(document.createTextNode(exercise.answers[i]));
        });
        expect(container.textContent.toLowerCase()).toBe(text.toLowerCase());
      });
    }
  }
  it('creates a character blank even for short three-letter words', () => {
    expect(generateClozeText('Cat dog.', 'char').answers.length).toBeGreaterThan(0);
    expect(generateClozeText('Hi!', 'char').answers).toEqual(['Hi']);
  });
  it('escapes untrusted text instead of emitting executable markup', () => {
    const { display } = generateClozeText('<img src=x onerror=alert(1)> Hello!', 'word');
    const container = document.createElement('div');
    container.innerHTML = display;
    expect(container.querySelector('img')).toBeNull();
  });
  it('uses the normal preset for unknown difficulty and handles empty text', () => {
    expect(generateClozeText('Please help me.', 'word', 'unknown').answers.length).toBeGreaterThan(
      0
    );
    expect(generateClozeText('', 'char').answers).toEqual([]);
  });
});
