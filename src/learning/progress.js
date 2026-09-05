import { normalizeAnswer, refreshItem, restoreItem, snapshotItem } from './exercises.js';
export { normalizeAnswer } from './exercises.js';

export const PROGRESS_KEY = 'english-note-maker.learning.v1';
const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [1, 3, 7, 14];

export function exerciseId(item) {
  return JSON.stringify([
    item.phraseId || normalizeAnswer(item.english),
    item.age,
    item.blankType,
    item.difficulty,
  ]);
}

export function readProgress(storage) {
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (!raw) return { records: [], available: true };
    const data = JSON.parse(raw);
    if (![1, 2].includes(data.version) || !Array.isArray(data.records))
      throw new Error('Invalid progress');
    const records = data.records.filter(
      (item) =>
        item &&
        typeof item.english === 'string' &&
        item.english.length <= 500 &&
        typeof item.category === 'string' &&
        ['4-6', '7-9', '10-12'].includes(item.age) &&
        ['word', 'char'].includes(item.blankType) &&
        ['easy', 'normal', 'hard'].includes(item.difficulty) &&
        Number.isInteger(item.streak) &&
        item.streak >= 0 &&
        Number.isInteger(item.attempts) &&
        item.attempts > 0 &&
        Number.isFinite(item.dueAt) &&
        Number.isFinite(item.updatedAt) &&
        (item.phraseId === undefined || typeof item.phraseId === 'string') &&
        (item.snapshot === undefined || Boolean(restoreItem(item.snapshot)))
    );
    return { records, available: records.length === data.records.length };
  } catch {
    return { records: [], available: false };
  }
}

export function saveProgress(storage, records) {
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify({ version: 2, records }));
    return true;
  } catch {
    return false;
  }
}

export function recordAttempt(records, item, correct, now = Date.now()) {
  const id = exerciseId(item);
  const previous = records.find((record) => exerciseId(record) === id);
  const streak = correct ? Math.min((previous?.streak || 0) + 1, INTERVALS.length) : 0;
  const record = {
    english: item.english,
    category: item.category,
    age: item.age,
    blankType: item.blankType,
    difficulty: item.difficulty,
    attempts: (previous?.attempts || 0) + 1,
    streak,
    updatedAt: now,
    dueAt: correct ? now + INTERVALS[streak - 1] * DAY : now,
    ...(item.phraseId ? { phraseId: item.phraseId } : {}),
    ...(item.exercise ? { snapshot: snapshotItem(item) } : {}),
  };
  return [...records.filter((entry) => exerciseId(entry) !== id), record];
}

export function migrateRecords(records, getPhrasePool) {
  return records.map((record) => {
    const previous = record.snapshot ? restoreItem(record.snapshot) : record;
    const current = refreshItem(previous, getPhrasePool);
    if (!current) return record;
    return {
      ...record,
      english: current.english,
      category: current.category,
      phraseId: current.phraseId,
      revised: Boolean(record.revised || current.revised),
      snapshot: snapshotItem(current),
    };
  });
}

export function dueRecords(records, now = Date.now()) {
  return records.filter((item) => item.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
}
