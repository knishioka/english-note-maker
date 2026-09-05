import { restoreItem, snapshotItem } from './exercises.js';

export const LIBRARY_KEY = 'english-note-maker.lessons.v1';
export const MAX_SETS = 20;
export const MAX_IMPORT_BYTES = 250000;

export function createSet(items, title, now = Date.now()) {
  return {
    id: globalThis.crypto.randomUUID(),
    title,
    createdAt: now,
    items: items.map(snapshotItem),
  };
}

function validSet(value) {
  return (
    value &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    value.id.length <= 100 &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    value.title.length <= 100 &&
    Number.isFinite(value.createdAt) &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.length <= 5 &&
    value.items.every(restoreItem)
  );
}

export function exportSet(set) {
  if (!validSet(set)) throw new Error('問題セットの形式が正しくありません。');
  return JSON.stringify(
    {
      format: 'english-note-maker.lesson',
      version: 1,
      lesson: {
        id: set.id,
        title: set.title,
        createdAt: set.createdAt,
        items: set.items.map((item) => snapshotItem(restoreItem(item))),
      },
    },
    null,
    2
  );
}

export function importSet(text) {
  if (
    typeof text !== 'string' ||
    new globalThis.TextEncoder().encode(text).length > MAX_IMPORT_BYTES
  ) {
    throw new Error('ファイルは250KB以下にしてください。');
  }
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('JSONファイルを読み取れませんでした。');
  }
  if (
    value?.format !== 'english-note-maker.lesson' ||
    value.version !== 1 ||
    !validSet(value.lesson)
  ) {
    throw new Error('この問題セットには対応していません。');
  }
  // Construct a clean object; imported HTML, learner records and unknown fields are discarded.
  return createSet(value.lesson.items.map(restoreItem), value.lesson.title, value.lesson.createdAt);
}

export function readLibrary(storage) {
  try {
    const raw = storage.getItem(LIBRARY_KEY);
    if (!raw) return { sets: [], available: true };
    const value = JSON.parse(raw);
    if (
      value.version !== 1 ||
      !Array.isArray(value.sets) ||
      value.sets.length > MAX_SETS ||
      !value.sets.every(validSet)
    )
      throw new Error('Invalid library');
    return { sets: value.sets, available: true };
  } catch {
    return { sets: [], available: false };
  }
}

export function saveLibrary(storage, sets) {
  if (sets.length > MAX_SETS || !sets.every(validSet)) return false;
  try {
    storage.setItem(LIBRARY_KEY, JSON.stringify({ version: 1, sets }));
    return true;
  } catch {
    return false;
  }
}
