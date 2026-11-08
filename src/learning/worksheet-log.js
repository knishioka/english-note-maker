import { restoreItem, snapshotItem } from './exercises.js';

// Every printed fill-in-the-blank worksheet is logged with its exact questions
// so the paper result can be recorded later. Only questions are stored: no
// answers written by the learner and no learner records.
export const WORKSHEET_LOG_KEY = 'english-note-maker.worksheets.v1';
export const MAX_WORKSHEETS = 40;
export const MAX_WORKSHEET_ITEMS = 200;
const RESULTS = ['correct', 'wrong'];

export function createWorksheet(items, number, title = '', now = Date.now()) {
  return {
    id: globalThis.crypto.randomUUID(),
    number,
    title,
    printedAt: now,
    items: items.map(snapshotItem),
    results: [],
  };
}

export function validWorksheet(value) {
  return Boolean(
    value &&
      typeof value.id === 'string' &&
      value.id.length > 0 &&
      value.id.length <= 100 &&
      Number.isInteger(value.number) &&
      value.number > 0 &&
      typeof value.title === 'string' &&
      value.title.length <= 100 &&
      Number.isFinite(value.printedAt) &&
      Array.isArray(value.items) &&
      value.items.length > 0 &&
      value.items.length <= MAX_WORKSHEET_ITEMS &&
      value.items.every(restoreItem) &&
      Array.isArray(value.results) &&
      (value.results.length === 0 ||
        (value.results.length === value.items.length &&
          value.results.every((result) => RESULTS.includes(result)))) &&
      (value.gradedAt === undefined || Number.isFinite(value.gradedAt))
  );
}

export function isGraded(sheet) {
  return sheet.results.length === sheet.items.length;
}

export function gradeWorksheet(sheet, wrongIndexes, now = Date.now()) {
  const wrong = new Set(wrongIndexes);
  return {
    ...sheet,
    results: sheet.items.map((_, index) => (wrong.has(index) ? 'wrong' : 'correct')),
    gradedAt: now,
  };
}

export function summarizeWorksheet(sheet) {
  const correct = sheet.results.filter((result) => result === 'correct').length;
  return {
    total: sheet.items.length,
    graded: isGraded(sheet),
    correct,
    wrong: sheet.results.length - correct,
  };
}

// Oldest graded sheets go first: their outcomes already live in the learning
// records. Ungraded sheets are only dropped when nothing else is left.
export function appendWorksheet(sheets, sheet) {
  const next = [...sheets, sheet];
  while (next.length > MAX_WORKSHEETS) {
    const graded = next.findIndex(isGraded);
    next.splice(graded >= 0 ? graded : 0, 1);
  }
  return next;
}

export function readWorksheetLog(storage) {
  try {
    const raw = storage.getItem(WORKSHEET_LOG_KEY);
    if (!raw) return { sheets: [], nextNumber: 1, available: true };
    const value = JSON.parse(raw);
    if (
      value.version !== 1 ||
      !Array.isArray(value.sheets) ||
      value.sheets.length > MAX_WORKSHEETS ||
      !value.sheets.every(validWorksheet) ||
      !Number.isInteger(value.nextNumber) ||
      value.nextNumber < 1
    )
      throw new Error('Invalid worksheet log');
    return { sheets: value.sheets, nextNumber: value.nextNumber, available: true };
  } catch {
    return { sheets: [], nextNumber: 1, available: false };
  }
}

export function saveWorksheetLog(storage, sheets, nextNumber) {
  if (sheets.length > MAX_WORKSHEETS || !sheets.every(validWorksheet)) return false;
  try {
    storage.setItem(WORKSHEET_LOG_KEY, JSON.stringify({ version: 1, sheets, nextNumber }));
    return true;
  } catch {
    return false;
  }
}
