import { describe, expect, it } from 'vitest';
import {
  createLessonItem,
  fillAnswers,
  gradeAnswers,
  learningFocus,
  refreshItem,
  restoreItem,
  snapshotItem,
} from '../src/learning/exercises.js';
import { renderClozeText, validBlanks } from '../src/learning/cloze.js';
import {
  createSet,
  exportSet,
  importSet,
  LIBRARY_KEY,
  readLibrary,
  saveLibrary,
} from '../src/learning/lesson-library.js';
import {
  exerciseId,
  migrateRecords,
  readProgress,
  recordAttempt,
  saveProgress,
} from '../src/learning/progress.js';

const phrase = {
  id: 'greeting-day',
  revision: 1,
  english: 'Have a good day!',
  japanese: 'よい一日を！',
  category: 'greetings',
  focusWords: ['good'],
  acceptedEnglish: ['Have a nice day!'],
};
const settings = { category: 'greetings', age: '7-9', blankType: 'word', difficulty: 'easy' };
const makeItem = () => createLessonItem(phrase, settings);
const pool = () => [phrase];

describe('reusable exercise definitions', () => {
  it('prioritizes the authored learning focus and reconstructs the original sentence', () => {
    const item = makeItem();
    expect(item.exercise.answers).toEqual(['good']);
    expect(fillAnswers(item, item.exercise.answers)).toBe(phrase.english);
    expect(learningFocus(item)).toContain('good');
    expect(learningFocus({ ...item, focusWords: [] })).toContain('場面');
    expect(learningFocus({ ...item, focusWords: [], blankType: 'char' })).toContain('つづり');
  });
  it('accepts reviewed alternatives, but not unreviewed combinations or changed visible text', () => {
    const item = makeItem();
    expect(gradeAnswers(item, [' ＮＩＣＥ '])).toBe(true);
    expect(gradeAnswers(item, ['bad'])).toBe(false);
    expect(gradeAnswers(item, [])).toBe(false);
    const twoBlanks = {
      ...item,
      acceptedEnglish: ['Have the good day!', 'Have a nice day!'],
      exercise: renderClozeText(phrase.english, [
        { start: 5, end: 6 },
        { start: 7, end: 11 },
      ]),
    };
    expect(gradeAnswers(twoBlanks, ['the', 'nice'])).toBe(false);
    const fixedGood = {
      ...item,
      exercise: renderClozeText(phrase.english, [{ start: 12, end: 15 }]),
    };
    expect(gradeAnswers(fixedGood, ['day'])).toBe(true);
  });
  it('round-trips only structured data, preserving exact blanks and punctuation', () => {
    const item = makeItem();
    const snapshot = snapshotItem(item);
    expect(snapshot).not.toHaveProperty('display');
    expect(restoreItem(JSON.parse(JSON.stringify(snapshot))).exercise).toEqual(item.exercise);
    expect(
      restoreItem({ ...snapshot, display: '<img src=x onerror=alert(1)>' }).exercise.display
    ).not.toContain('<img');
  });
  it('rejects malformed ranges, overlapping blanks and unsupported metadata', () => {
    const snapshot = snapshotItem(makeItem());
    for (const blanks of [
      [],
      [{ start: -1, end: 2 }],
      [{ start: 0, end: 999 }],
      [{ start: 1.5, end: 3 }],
      [{ start: 0, end: 7 }],
      [
        { start: 0, end: 2 },
        { start: 1, end: 4 },
      ],
    ]) {
      expect(validBlanks(phrase.english, blanks)).toBe(false);
      expect(restoreItem({ ...snapshot, blanks })).toBeNull();
    }
    for (const change of [
      { age: 'adult' },
      { blankType: 'unknown' },
      { difficulty: 3 },
      { revision: 0 },
      { focusWords: [null] },
      { acceptedEnglish: 'oops' },
      { phraseId: '' },
    ]) {
      expect(restoreItem({ ...snapshot, ...change })).toBeNull();
    }
    expect(restoreItem(null)).toBeNull();
    expect(renderClozeText('<img>', []).display).toBe('&lt;img&gt;');
  });
  it('keeps the same exercise across a Japanese-only update and reconnects an English edit by ID', () => {
    const item = makeItem();
    const translated = refreshItem(item, () => [
      { ...phrase, japanese: 'よい一日をすごしてね！', revision: 2 },
    ]);
    expect(translated.exercise).toEqual(item.exercise);
    expect(translated.japanese).not.toBe(item.japanese);
    expect(translated.revised).toBe(true);
    const edited = refreshItem(item, () => [
      { ...phrase, english: 'Have a lovely day!', revision: 2, focusWords: ['lovely'] },
    ]);
    expect(edited.exercise.answers).toEqual(['lovely']);
    expect(exerciseId(edited)).toBe(exerciseId(item));
    expect(refreshItem(item, () => [])).toBeNull();
    expect(refreshItem(item, () => [{ ...phrase, id: 'unrelated' }])).toBeNull();
  });
});

describe('progress migration', () => {
  it('migrates v1 via legacyEnglish without changing attempts, streaks or dates', () => {
    const record = {
      english: 'Old sentence.',
      ...settings,
      attempts: 3,
      streak: 2,
      dueAt: 1234,
      updatedAt: 1000,
    };
    const migrated = migrateRecords([record], () => [
      { ...phrase, legacyEnglish: ['Old sentence.'] },
    ]);
    expect(migrated[0]).toMatchObject({
      phraseId: phrase.id,
      english: phrase.english,
      attempts: 3,
      streak: 2,
      dueAt: 1234,
      updatedAt: 1000,
    });
    expect(restoreItem(migrated[0].snapshot)).not.toBeNull();
    expect(migrateRecords(migrated, pool)).toEqual(migrated);
    const updated = recordAttempt(migrated, makeItem(), true, 2000);
    expect(updated).toHaveLength(1);
    expect(updated[0].attempts).toBe(4);
  });
  it('persists v2 blanks and preserves unresolved records for recovery', () => {
    const storage = window.localStorage;
    storage.clear();
    const records = recordAttempt([], makeItem(), false, 2000);
    expect(saveProgress(storage, records)).toBe(true);
    expect(readProgress(storage).records).toEqual(records);
    expect(migrateRecords(records, () => [])).toEqual(records);
    expect(migrateRecords(records, pool)[0].snapshot.blanks).toEqual(records[0].snapshot.blanks);
  });
});

describe('lesson library and file reuse', () => {
  it('exports and imports the same ordered problems without learner records or HTML', () => {
    const item = makeItem();
    const set = createSet(
      [item, createLessonItem({ ...phrase, id: 'second', english: 'Hello!' }, settings)],
      'あいさつ',
      1234
    );
    const text = exportSet({ ...set, records: [{ secret: 'learner input' }] });
    const imported = importSet(text);
    expect(imported.id).not.toBe(set.id);
    expect(imported.items).toEqual(set.items);
    expect(imported.title).toBe(set.title);
    expect(text).not.toContain('learner input');
    expect(text).not.toContain('display');
  });
  it('validates import schema, versions, file size and problem count', () => {
    const set = createSet([makeItem()], 'テスト');
    expect(() => exportSet({})).toThrow();
    for (const value of [
      '{',
      'null',
      '{}',
      'a'.repeat(250001),
      JSON.stringify({ format: 'english-note-maker.lesson', version: 2, lesson: set }),
      exportSet(set).replace('"word"', '"bad"'),
    ]) {
      expect(() => importSet(value)).toThrow();
    }
    expect(() => exportSet({ ...set, items: Array(6).fill(set.items[0]) })).toThrow();
  });
  it('round-trips the library and rejects broken data or writes without overwriting', () => {
    const storage = window.localStorage;
    storage.clear();
    const set = createSet([makeItem()], 'テスト');
    expect(readLibrary(storage)).toEqual({ sets: [], available: true });
    expect(saveLibrary(storage, [set])).toBe(true);
    expect(readLibrary(storage)).toEqual({ sets: [set], available: true });
    expect(saveLibrary(storage, Array(21).fill(set))).toBe(false);
    expect(readLibrary(storage).sets).toEqual([set]);
    expect(saveLibrary(undefined, [set])).toBe(false);
    expect(saveLibrary(storage, [{}])).toBe(false);
    for (const raw of ['{', 'null', '{"version":2,"sets":[]}', '{"version":1,"sets":[{}]}']) {
      storage.setItem(LIBRARY_KEY, raw);
      expect(readLibrary(storage).available).toBe(false);
    }
    expect(readLibrary(undefined).available).toBe(false);
  });
});
