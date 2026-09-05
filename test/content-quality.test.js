import { describe, expect, it } from 'vitest';
import { PHRASE_DATA } from '../src/data/phrase-data.js';
import { mergePhraseCollections } from '../src/data/phrase-collections.js';
import {
  createLessonItem,
  fillAnswers,
  gradeAnswers,
  restoreItem,
  snapshotItem,
} from '../src/learning/exercises.js';
import { PHONICS_DATA } from '../src/data/phonics-data.js';
import { SIGHT_WORDS } from '../src/data/sight-words.js';
import { findTooHardKanji } from '../src/data/kanji-grade-levels.js';

const modules = import.meta.glob('../src/data/collections/phrases/*.json', { eager: true });
const source = Object.values(modules).flatMap((mod) => (mod.default || mod).items || []);
const catalog = mergePhraseCollections(PHRASE_DATA, modules);
const phrases = Object.values(catalog).flatMap((ages) => Object.values(ages).flat());

describe('reviewed content catalog', () => {
  it('gives every authored phrase a unique stable ID and a complete bilingual prompt', () => {
    expect(source.length).toBeGreaterThan(1500);
    expect(new Set(source.map((p) => p.id)).size).toBe(source.length);
    expect(
      new Set(source.map((p) => [p.category, p.ageGroup, p.english.toLowerCase().trim()].join('|')))
        .size
    ).toBe(source.length);
    for (const p of source) {
      expect(p.english, p.id).not.toMatch(/\.\.\.|…/);
      expect(p.japanese, p.id).toBeTruthy();
      expect(p.situation, p.id).toBeTruthy();
      for (const focus of p.focusWords)
        expect(p.english.toLowerCase(), p.id).toContain(focus.toLowerCase());
    }
  });
  it('keeps manifest counts synchronized and spelling hints readable by the youngest learners', () => {
    const manifest = Object.values(modules)
      .map((mod) => mod.default || mod)
      .find((value) => value.files);
    expect(manifest.totalItems).toBe(source.length);
    for (const file of manifest.files) {
      const collection = Object.values(modules)
        .map((mod) => mod.default || mod)
        .find((value) => value.metadata?.category === file.name);
      expect(file.itemCount, file.name).toBe(collection.items.length);
      expect(collection.metadata.totalCount, file.name).toBe(collection.items.length);
    }
    for (const pattern of Object.values(PHONICS_DATA)) {
      expect(findTooHardKanji(pattern.hint, '4-6')).toEqual([]);
      for (const word of pattern.words) expect(findTooHardKanji(word.japanese, '4-6')).toEqual([]);
    }
    for (const word of SIGHT_WORDS) expect(findTooHardKanji(word.japanese, '4-6')).toEqual([]);
  });
  it('covers every legacy phrase with a canonical entry or an explicit old-English alias', () => {
    for (const [category, ages] of Object.entries(PHRASE_DATA)) {
      for (const [age, items] of Object.entries(ages)) {
        for (const old of items) {
          expect(
            catalog[category][age].some(
              (p) => p.english === old.english || p.legacyEnglish?.includes(old.english)
            ),
            category + '/' + old.english
          ).toBe(true);
        }
      }
    }
    expect(phrases.every((p) => p.id && p.ageGroup && p.revision)).toBe(true);
  });
  it('prefers JSON translations and permits new content through the existing category', () => {
    const base = { greetings: { '7-9': [{ english: 'Old.', japanese: '旧訳' }] } };
    const added = {
      id: 'new-id',
      english: 'New.',
      japanese: '新しい文',
      category: 'greetings',
      ageGroup: '7-9',
    };
    const merged = mergePhraseCollections(base, { 'a.json': { items: [added] } });
    expect(merged.greetings['7-9']).toEqual([{ ...added, revision: 1 }]);
    expect(base.greetings['7-9'][0].english).toBe('Old.');
  });
  it('keeps corrections for requests, siblings, complete opinions and arithmetic', () => {
    const find = (english) => source.find((p) => p.english === english);
    expect(find('Please!').japanese).toBe('おねがい！');
    expect(find('Excuse me!').situation).toBe('ひとに よびかける とき');
    expect(find('I have an older sister.').japanese).toContain('おねえちゃん');
    expect(
      find('To find the average of three numbers, add them and divide by three.')
    ).toBeTruthy();
    expect(find("I usually go to bed at nine o'clock.")).toBeTruthy();
    expect(find('Call 911!')).toBeUndefined();
    expect(find('I strongly believe that...')).toBeUndefined();
    expect(PHONICS_DATA.ap.words.find((p) => p.english === 'tap').japanese).toBe('かるくたたく');
    expect(PHONICS_DATA.ug.words.find((p) => p.english === 'jug').japanese).toBe('みずさし');
  });
  for (const blankType of ['word', 'char']) {
    for (const difficulty of ['easy', 'normal', 'hard']) {
      it(
        'all phrases generate restorable, correctly graded problems: ' +
          blankType +
          '/' +
          difficulty,
        () => {
          for (const phrase of phrases) {
            const item = createLessonItem(phrase, {
              age: phrase.ageGroup,
              category: phrase.category,
              blankType,
              difficulty,
            });
            expect(item.exercise.answers.length, phrase.id).toBeGreaterThan(0);
            expect(fillAnswers(item, item.exercise.answers), phrase.id).toBe(phrase.english);
            expect(gradeAnswers(item, item.exercise.answers), phrase.id).toBe(true);
            expect(restoreItem(snapshotItem(item))?.exercise, phrase.id).toEqual(item.exercise);
          }
        }
      );
    }
  }
});
