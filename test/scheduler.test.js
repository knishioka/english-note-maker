import { describe, expect, it } from 'vitest';
import {
  buildHistory,
  classifyPhrase,
  countPhrases,
  orderPhrases,
} from '../src/learning/scheduler.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 100 * DAY;
const phrase = (n, category = 'greetings') => ({
  id: 'phrase-' + n,
  english: 'Sentence ' + n + '.',
  japanese: '文' + n,
  category,
});
const pool = Array.from({ length: 8 }, (_, i) => phrase(i));
const record = (id, overrides = {}) => ({
  phraseId: id,
  english: '',
  category: 'greetings',
  age: '7-9',
  blankType: 'word',
  difficulty: 'easy',
  attempts: 1,
  streak: 0,
  updatedAt: NOW - DAY,
  dueAt: NOW - DAY,
  ...overrides,
});
const sheet = (ids, printedAt, blankType = 'word') => ({
  printedAt,
  items: ids.map((id) => ({ phraseId: id, blankType })),
});
// Fisher-Yates picks j = floor(random * (i + 1)); a value just below 1 keeps the order.
const keepOrder = () => 0.9999999;

describe('scheduler', () => {
  it('classifies phrases as due, fresh or seen per blank type', () => {
    const history = buildHistory(
      [record('phrase-0'), record('phrase-1', { dueAt: NOW + 3 * DAY })],
      [sheet(['phrase-2'], NOW - 2 * DAY), sheet(['phrase-3'], NOW - DAY, 'char')]
    );
    expect(classifyPhrase(pool[0], 'word', history, NOW)).toBe('due');
    expect(classifyPhrase(pool[1], 'word', history, NOW)).toBe('seen');
    expect(classifyPhrase(pool[2], 'word', history, NOW)).toBe('seen');
    expect(classifyPhrase(pool[3], 'word', history, NOW)).toBe('fresh');
    expect(classifyPhrase(pool[3], 'char', history, NOW)).toBe('seen');
    expect(countPhrases(pool, 'word', history, NOW)).toEqual({ due: 1, fresh: 5, seen: 2 });
  });

  it('orders due first by due date, then unseen, then seen by due date or print time', () => {
    const history = buildHistory(
      [
        record('phrase-0', { dueAt: NOW - DAY }),
        record('phrase-1', { dueAt: NOW - 3 * DAY }),
        record('phrase-2', { dueAt: NOW + 7 * DAY, streak: 3 }),
        record('phrase-3', { dueAt: NOW + DAY, streak: 1 }),
      ],
      [sheet(['phrase-4'], NOW - 5 * DAY), sheet(['phrase-5'], NOW - 2 * DAY)]
    );
    const ordered = orderPhrases(
      pool,
      { mode: 'smart', blankType: 'word' },
      history,
      NOW,
      keepOrder
    );
    expect(ordered.map((p) => p.id)).toEqual([
      'phrase-1',
      'phrase-0',
      'phrase-6',
      'phrase-7',
      'phrase-4',
      'phrase-5',
      'phrase-3',
      'phrase-2',
    ]);
  });

  it('keeps a plain shuffle for random mode and treats unknown modes as smart', () => {
    const history = buildHistory([record('phrase-7')], []);
    const random = orderPhrases(
      pool,
      { mode: 'random', blankType: 'word' },
      history,
      NOW,
      keepOrder
    );
    expect(random.map((p) => p.id)).toEqual(pool.map((p) => p.id));
    const fallback = orderPhrases(pool, { mode: 'nope' }, history, NOW, keepOrder);
    expect(fallback[0].id).toBe('phrase-7');
    expect(orderPhrases(pool, {}, new Map(), NOW, keepOrder)).toHaveLength(pool.length);
  });

  it('ignores unmigrated records without an id and uses legacy ids for pool entries', () => {
    const history = buildHistory([{ ...record('x'), phraseId: undefined }], []);
    expect(history.size).toBe(0);
    const legacy = { english: 'Hello!', japanese: 'やあ' };
    const seen = buildHistory([record('legacy:Hello!')], []);
    expect(classifyPhrase(legacy, 'word', seen, NOW)).toBe('due');
  });
});
