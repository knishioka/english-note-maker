import { SIGHT_WORD_SET, SIGHT_WORD_MAP } from '../data/sight-words.js';

const PRESETS = {
  easy: { ratio: 0.2, sight: 10, content: 0 },
  normal: { ratio: 0.3, sight: 6, content: 3 },
  hard: { ratio: 0.5, sight: 3, content: 8 },
};

function escapeHtml(text) {
  const replacements = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, (char) => replacements[char]);
}

function boxes(count) {
  return (
    '<span class="visually-hidden">［' +
    count +
    '文字の空所］</span>' +
    Array.from({ length: count }, () => '<span class="cloze-box" aria-hidden="true"></span>').join(
      ''
    ) +
    '<span class="cloze-letter-count" aria-hidden="true">(' +
    count +
    ')</span>'
  );
}

// Persist offsets, never HTML. Saved and imported exercises pass this validator
// before being rendered, so markup cannot be supplied through localStorage.
export function validBlanks(text, blanks) {
  if (
    typeof text !== 'string' ||
    text.length > 500 ||
    !Array.isArray(blanks) ||
    !blanks.length ||
    blanks.length > 40
  )
    return false;
  let end = 0;
  return blanks.every((blank) => {
    const valid =
      blank &&
      Number.isInteger(blank.start) &&
      Number.isInteger(blank.end) &&
      blank.start >= end &&
      blank.end > blank.start &&
      blank.end <= text.length &&
      /[a-z]/i.test(text.slice(blank.start, blank.end)) &&
      !/\s/.test(text.slice(blank.start, blank.end));
    if (valid) end = blank.end;
    return valid;
  });
}

export function renderClozeText(text, blanks, blankType = 'word') {
  if (!validBlanks(text, blanks)) return { display: escapeHtml(text), answers: [], blanks: [] };
  let cursor = 0;
  let display = '';
  const answers = [];
  for (const { start, end } of blanks) {
    const answer = text.slice(start, end);
    display +=
      escapeHtml(text.slice(cursor, start)) +
      '<span class="cloze-blank cloze-blank--' +
      (blankType === 'char' ? 'char' : 'word') +
      '">' +
      boxes(answer.length) +
      '</span>';
    answers.push(answer);
    cursor = end;
  }
  return {
    display: display + escapeHtml(text.slice(cursor)),
    answers,
    blanks: blanks.map(({ start, end }) => ({ start, end })),
  };
}

export function generateClozeText(text, blankType, difficulty = 'normal', options = {}) {
  const preset = PRESETS[difficulty] || PRESETS.normal;
  const focus = new Set(
    (options.focusWords || []).flatMap(
      (word) => word.toLowerCase().match(/[a-z]+(?:['’][a-z]+)*/g) || []
    )
  );
  const words = [...text.matchAll(/[a-z]+(?:['’][a-z]+)*/gi)]
    .map((match) => ({ word: match[0], start: match.index }))
    .filter(({ word }) => word.length >= 2);
  const ranked = words
    .map((entry) => ({
      ...entry,
      score:
        (focus.has(entry.word.toLowerCase())
          ? 20
          : SIGHT_WORD_SET.has(entry.word.toLowerCase())
            ? preset.sight
            : preset.content) + Math.random(),
    }))
    .sort((a, b) => b.score - a.score);
  const ratio =
    blankType === 'char'
      ? ({ easy: 0.4, normal: 0.65, hard: 1 }[difficulty] ?? 0.65)
      : preset.ratio;
  const chosen = ranked.slice(0, Math.max(1, Math.round(words.length * ratio)));
  if (!chosen.length && blankType === 'char')
    return generateClozeText(text, 'word', difficulty, options);
  const blanks = chosen
    .map(({ word, start }) => {
      if (blankType !== 'char') return { start, end: start + word.length };
      const sight = SIGHT_WORD_MAP.get(word.toLowerCase());
      const pattern =
        sight && ['char', 'both'].includes(sight.blankType) ? sight.phonicsPattern : '';
      const at = pattern ? word.toLowerCase().indexOf(pattern.toLowerCase()) : -1;
      if (at >= 0 && pattern.length < word.length)
        return { start: start + at, end: start + at + pattern.length };
      // Keep the initial and final letter visible, including in three-letter words.
      // Apostrophes remain visible: character exercises practice letters only.
      const letters = [...word.matchAll(/[a-z]+/gi)].sort((a, b) => b[0].length - a[0].length)[0];
      const offset = letters.index;
      const length = letters[0].length;
      const from = length > 2 ? Math.max(1, Math.floor(length * 0.3)) : 0;
      const to = length > 2 ? Math.min(length - 1, Math.ceil(length * 0.7)) : 1;
      return { start: start + offset + from, end: start + offset + to };
    })
    .sort((a, b) => a.start - b.start);
  return renderClozeText(text, blanks, blankType);
}
