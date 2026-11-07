import { phraseIdOf } from './exercises.js';

// Print worksheets are chosen by learning history, not by chance alone:
//   due   : a recorded attempt says the phrase should be reviewed now
//   fresh : never answered on screen and never printed
//   seen  : printed (graded or not) or answered, but not due yet
// 'smart' orders due → fresh → seen; 'random' keeps the historical shuffle.
export const SELECTION_MODES = ['smart', 'random'];

export function historyKey(phraseId, blankType) {
  return phraseId + '|' + blankType;
}

function shuffle(array, random) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Records come from on-screen practice and graded worksheets; sheets include
// prints that were never graded, which still count as "seen".
export function buildHistory(records = [], sheets = []) {
  const history = new Map();
  const entry = (phraseId, blankType) => {
    const key = historyKey(phraseId, blankType);
    if (!history.has(key)) {
      history.set(key, { dueAt: null, lastSeenAt: 0, attempts: 0, streak: 0, printed: 0 });
    }
    return history.get(key);
  };
  for (const record of records) {
    if (!record?.phraseId) continue;
    const item = entry(record.phraseId, record.blankType);
    item.dueAt = item.dueAt === null ? record.dueAt : Math.min(item.dueAt, record.dueAt);
    item.lastSeenAt = Math.max(item.lastSeenAt, record.updatedAt);
    item.attempts += record.attempts;
    item.streak = Math.max(item.streak, record.streak);
  }
  for (const sheet of sheets) {
    for (const snapshot of sheet?.items || []) {
      const item = entry(snapshot.phraseId, snapshot.blankType);
      item.lastSeenAt = Math.max(item.lastSeenAt, sheet.printedAt);
      item.printed += 1;
    }
  }
  return history;
}

export function classifyPhrase(phrase, blankType, history, now = Date.now()) {
  const item = history.get(historyKey(phraseIdOf(phrase), blankType));
  if (!item) return 'fresh';
  if (item.dueAt !== null && item.dueAt <= now) return 'due';
  return 'seen';
}

export function countPhrases(pool, blankType, history, now = Date.now()) {
  const counts = { due: 0, fresh: 0, seen: 0 };
  for (const phrase of pool) counts[classifyPhrase(phrase, blankType, history, now)] += 1;
  return counts;
}

export function orderPhrases(pool, settings = {}, history = new Map(), now = Date.now(), random) {
  const mode = SELECTION_MODES.includes(settings.mode) ? settings.mode : 'smart';
  const blankType = settings.blankType === 'char' ? 'char' : 'word';
  const shuffled = shuffle(pool, random || Math.random);
  if (mode === 'random') return shuffled;
  const tiers = { due: [], fresh: [], seen: [] };
  for (const phrase of shuffled) {
    tiers[classifyPhrase(phrase, blankType, history, now)].push(phrase);
  }
  // Earliest due first; ungraded prints fall back to when they were printed so the
  // oldest unknown outcome returns before phrases that were answered correctly.
  const sortKey = (phrase) => {
    const item = history.get(historyKey(phraseIdOf(phrase), blankType));
    return item.dueAt ?? item.lastSeenAt;
  };
  const byKey = (a, b) => sortKey(a) - sortKey(b);
  tiers.due.sort(byKey);
  tiers.seen.sort(byKey);
  return [...tiers.due, ...tiers.fresh, ...tiers.seen];
}
