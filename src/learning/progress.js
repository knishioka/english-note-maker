export const PROGRESS_KEY = 'english-note-maker.learning.v1';
const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [1, 3, 7, 14];

export function normalizeAnswer(value) {
  return String(value).normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g, "'");
}

export function exerciseId(item) {
  return JSON.stringify([item.english, item.age, item.blankType, item.difficulty]);
}

export function readProgress(storage) {
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (!raw) return { records: [], available: true };
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.records)) throw new Error('Invalid progress');
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
        Number.isFinite(item.updatedAt)
    );
    return { records, available: records.length === data.records.length };
  } catch {
    return { records: [], available: false };
  }
}

export function saveProgress(storage, records) {
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, records }));
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
  };
  return [...records.filter((entry) => exerciseId(entry) !== id), record];
}

export function dueRecords(records, now = Date.now()) {
  return records.filter((item) => item.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
}
