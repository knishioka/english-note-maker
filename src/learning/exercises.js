import { generateClozeText, renderClozeText, validBlanks } from './cloze.js';

export const AGES = ['4-6', '7-9', '10-12'];
export const DIFFICULTIES = ['easy', 'normal', 'hard'];
export const BLANK_TYPES = ['word', 'char'];

export function normalizeAnswer(value) {
  return String(value)
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ');
}

export function createLessonItem(phrase, settings) {
  return {
    phraseId: phrase.id || phrase.phraseId || 'legacy:' + phrase.english,
    revision: phrase.revision || 1,
    english: phrase.english,
    japanese: phrase.japanese || '',
    situation: phrase.situation || '',
    category: phrase.category || settings.category,
    age: settings.age,
    blankType: settings.blankType,
    difficulty: settings.difficulty,
    focusWords: phrase.focusWords || [],
    acceptedEnglish: phrase.acceptedEnglish || [],
    exercise: generateClozeText(phrase.english, settings.blankType, settings.difficulty, phrase),
  };
}

const shortText = (value, max = 500) => typeof value === 'string' && value.length <= max;
const textList = (value) =>
  Array.isArray(value) && value.length <= 40 && value.every((v) => shortText(v));

export function snapshotItem(item) {
  return {
    phraseId: item.phraseId,
    revision: item.revision,
    english: item.english,
    japanese: item.japanese,
    situation: item.situation,
    category: item.category,
    age: item.age,
    blankType: item.blankType,
    difficulty: item.difficulty,
    focusWords: [...item.focusWords],
    acceptedEnglish: [...item.acceptedEnglish],
    blanks: item.exercise.blanks.map(({ start, end }) => ({ start, end })),
  };
}

export function restoreItem(value) {
  if (
    !value ||
    !shortText(value.phraseId) ||
    !value.phraseId ||
    !Number.isInteger(value.revision) ||
    value.revision < 1 ||
    !shortText(value.english) ||
    !shortText(value.japanese) ||
    !shortText(value.situation) ||
    !shortText(value.category, 80) ||
    !AGES.includes(value.age) ||
    !BLANK_TYPES.includes(value.blankType) ||
    !DIFFICULTIES.includes(value.difficulty) ||
    !textList(value.focusWords) ||
    !textList(value.acceptedEnglish) ||
    !validBlanks(value.english, value.blanks)
  )
    return null;
  const exercise = renderClozeText(value.english, value.blanks, value.blankType);
  return { ...snapshotItem({ ...value, exercise }), exercise };
}

export function findCurrentPhrase(item, getPhrasePool) {
  const pool = getPhrasePool(item.category, item.age);
  const byId = pool.find((p) => p.id === item.phraseId);
  if (byId) return byId;
  // Only v1 records lack a fixed ID. Never reconnect an unknown v2 ID by text.
  if (item.phraseId && !item.phraseId.startsWith('legacy:')) return null;
  return pool.find(
    (p) =>
      normalizeAnswer(p.english) === normalizeAnswer(item.english) ||
      p.legacyEnglish?.some((english) => normalizeAnswer(english) === normalizeAnswer(item.english))
  );
}

export function refreshItem(item, getPhrasePool) {
  const phrase = findCurrentPhrase(item, getPhrasePool);
  if (!phrase) return null;
  const current = createLessonItem(phrase, item);
  if (item.exercise && item.english === phrase.english) {
    current.exercise = renderClozeText(phrase.english, item.exercise.blanks, item.blankType);
  }
  current.revised = Boolean(item.english !== phrase.english || item.revision !== current.revision);
  return current;
}

export function fillAnswers(item, answers) {
  let cursor = 0;
  let text = '';
  item.exercise.blanks.forEach(({ start, end }, index) => {
    text += item.english.slice(cursor, start) + answers[index];
    cursor = end;
  });
  return text + item.english.slice(cursor);
}

// Alternatives are whole, reviewed sentences: independent substitutions must
// not accidentally accept a combination that was never reviewed.
export function gradeAnswers(item, answers) {
  if (answers.length !== item.exercise.answers.length) return false;
  const completed = normalizeAnswer(fillAnswers(item, answers));
  return [item.english, ...item.acceptedEnglish].some(
    (sentence) => normalizeAnswer(sentence) === completed
  );
}

export function learningFocus(item) {
  return item.focusWords.length
    ? '練習する表現：' + item.focusWords.join(' / ')
    : item.blankType === 'char'
      ? '練習のねらい：ことばのつづり'
      : '練習のねらい：場面に合う英語の表現';
}
