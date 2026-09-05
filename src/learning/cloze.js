import {
  SIGHT_WORD_SET as SIGHT_WORD_SET_DATA,
  SIGHT_WORD_MAP as SIGHT_WORD_MAP_DATA,
} from '../data/sight-words.js';

function escapeHtml(text) {
  const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(text ?? '').replace(/[&<>"']/g, (char) => replacements[char]);
}

function shuffleArray(array) {
  const clone = Array.isArray(array) ? [...array] : [];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function extractPunctuation(token, cleanWord) {
  const lowerToken = token.toLowerCase();
  const lowerClean = cleanWord.toLowerCase();
  const wordIndex = lowerToken.indexOf(lowerClean);
  if (wordIndex < 0) {
    return { leading: '', trailing: token.substring(cleanWord.length) };
  }
  return {
    leading: token.substring(0, wordIndex),
    trailing: token.substring(wordIndex + cleanWord.length),
  };
}

// Difficulty presets controlling blank ratio and which kinds of words are
// preferred as blanks. Higher score = more likely to be picked.
const CLOZE_DIFFICULTY_PRESETS = {
  easy: { ratio: 0.2, sightScore: 10, contentScore: 0, otherScore: 0 },
  normal: { ratio: 0.3, sightScore: 6, contentScore: 3, otherScore: 1 },
  hard: { ratio: 0.5, sightScore: 3, contentScore: 8, otherScore: 1 },
};

function getClozeDifficultyPreset(difficulty) {
  return CLOZE_DIFFICULTY_PRESETS[difficulty] || CLOZE_DIFFICULTY_PRESETS.normal;
}

// Blanks are printed, photographed, and then read back by OCR / an LLM for
// grading. A run of underscores does not survive that trip: at print + camera
// resolution `___` and `_____` collapse into the same solid line, so the answer
// length — the main hint the exercise gives — is lost.
//
// The length is therefore encoded twice, because the two encodings fail in
// different ways and neither is free:
//   - one discrete box per missing letter, separated by a visible gap
//   - a printed digit next to the boxes
//
// Measured at ~130dpi with JPEG compression: boxes read 10/10 (word level),
// and an 11pt digit also read 10/10. An 8pt digit read 0/13 — at that size the
// parentheses merge into the digit and 6/8/0/9 become one blob, so the digit
// must stay near body size. Boxes can be miscounted by ±1 on long runs at
// full-page scale; the digit disambiguates those. The digit alone gives the
// reader nothing to check against, which the boxes provide.
//
// マスは枠だけで中身を持たないため、そのままでは支援技術に何も伝わらない。
// 従来のアンダースコアは「空所があること」と「その文字数」をテキストとして
// 持っていたので、その情報を視覚的に隠したテキストで補い、枠と数字は
// aria-hidden で読み上げ対象から外す（読み上げが二重になるのを防ぐ）。
function buildBlankBoxes(count) {
  const boxCount = Math.max(1, count);
  const boxes = Array.from(
    { length: boxCount },
    () => '<span class="cloze-box" aria-hidden="true"></span>'
  ).join('');
  const letterCount = `<span class="cloze-letter-count" aria-hidden="true">(${boxCount})</span>`;
  return `<span class="visually-hidden">［${boxCount}文字の空所］</span>${boxes}${letterCount}`;
}

function buildWordBlankSpan(cleanWord) {
  return `<span class="cloze-blank cloze-blank--word">${buildBlankBoxes(cleanWord.length)}</span>`;
}

function buildCharBlankSpan(count) {
  return `<span class="cloze-blank cloze-blank--char">${buildBlankBoxes(count)}</span>`;
}

export function generateClozeText(text, blankType, difficulty = 'normal') {
  const words = text.split(/(\s+)/);
  const answers = [];
  const preset = getClozeDifficultyPreset(difficulty);

  if (blankType === 'char') {
    // Char-level: collect candidate words first, then keep only a difficulty-
    // dependent fraction. Selection within candidates is randomized so the same
    // sentence can produce different blanks across regenerations.
    const candidateIndexes = [];
    words.forEach((token, i) => {
      if (/^\s+$/.test(token)) return;
      const cleanWord = token.replace(/^[.,!?;:'"()]+|[.,!?;:'"()]+$/g, '');
      if (cleanWord.length < 3) return;
      candidateIndexes.push(i);
    });

    const charBlankRatio = { easy: 0.4, normal: 0.65, hard: 1.0 }[difficulty] ?? 0.65;
    const targetCount = Math.max(1, Math.round(candidateIndexes.length * charBlankRatio));
    const chosenIndexes = new Set(
      shuffleArray([...candidateIndexes]).slice(0, Math.min(targetCount, candidateIndexes.length))
    );

    const processed = words.map((token, i) => {
      if (/^\s+$/.test(token)) return escapeHtml(token);
      const cleanWord = token.replace(/^[.,!?;:'"()]+|[.,!?;:'"()]+$/g, '');
      if (cleanWord.length < 3 || !chosenIndexes.has(i)) return escapeHtml(token);

      const { leading, trailing } = extractPunctuation(token, cleanWord);
      const sightWord = SIGHT_WORD_MAP_DATA.get(cleanWord.toLowerCase());
      if (sightWord && (sightWord.blankType === 'char' || sightWord.blankType === 'both')) {
        const pattern = sightWord.phonicsPattern;
        const patternIndex = cleanWord.toLowerCase().indexOf(pattern.toLowerCase());
        if (patternIndex >= 0) {
          const prefix = cleanWord.substring(0, patternIndex);
          const blanked = buildCharBlankSpan(pattern.length);
          const suffix = cleanWord.substring(patternIndex + pattern.length);
          answers.push(pattern);
          return `${escapeHtml(leading)}<span class="cloze-blank-char">${escapeHtml(prefix)}${blanked}${escapeHtml(suffix)}</span>${escapeHtml(trailing)}`;
        }
      }

      if (cleanWord.length >= 3) {
        const midStart = Math.floor(cleanWord.length * 0.3);
        const midEnd = Math.ceil(cleanWord.length * 0.7);
        const blankedPart = cleanWord.substring(midStart, midEnd);
        const prefix = cleanWord.substring(0, midStart);
        const blanked = buildCharBlankSpan(midEnd - midStart);
        const suffix = cleanWord.substring(midEnd);
        answers.push(blankedPart);
        return `${escapeHtml(leading)}<span class="cloze-blank-char">${escapeHtml(prefix)}${blanked}${escapeHtml(suffix)}</span>${escapeHtml(trailing)}`;
      }

      return escapeHtml(token);
    });

    if (!answers.length) return generateClozeText(text, 'word', difficulty);
    return { display: processed.join(''), answers };
  }

  // word-level blanks: score every candidate word by difficulty, randomize
  // within score tier, then take the top-N positions.
  const wordEntries = [];
  words.forEach((token, i) => {
    if (/^\s+$/.test(token)) return;
    const cleanWord = token.replace(/^[.,!?;:'"()]+|[.,!?;:'"()]+$/g, '');
    if (cleanWord.length < 2) return;
    const lower = cleanWord.toLowerCase();
    const isSight = SIGHT_WORD_SET_DATA.has(lower);
    // "Content word" ≈ non-sight word with substance: nouns/verbs/adjectives
    // typically ≥3 chars. Cheap heuristic; good enough for early-learner text.
    const isContent = !isSight && cleanWord.length >= 3;
    let baseScore;
    if (isSight) baseScore = preset.sightScore;
    else if (isContent) baseScore = preset.contentScore;
    else baseScore = preset.otherScore;
    wordEntries.push({
      token,
      index: i,
      cleanWord,
      score: baseScore + Math.random(),
    });
  });

  const totalWordCount = wordEntries.length;
  const maxBlanks = Math.max(1, Math.round(totalWordCount * preset.ratio));

  // Highest-score-first; ties broken by the random component already baked in.
  const ranked = [...wordEntries].sort((a, b) => b.score - a.score);
  // Filter out zero-score entries (e.g. easy mode has no sight words in the
  // sentence — the fallback below will still ensure at least one blank).
  const chosen = ranked.filter((e) => e.score >= 1).slice(0, maxBlanks);
  const chosenByIndex = new Map(chosen.map((e) => [e.index, e]));

  const processed = words.map((token, i) => {
    if (/^\s+$/.test(token)) return token;
    const entry = chosenByIndex.get(i);
    if (!entry) return escapeHtml(token);
    const { leading, trailing } = extractPunctuation(token, entry.cleanWord);
    answers.push(entry.cleanWord);
    return `${escapeHtml(leading)}${buildWordBlankSpan(entry.cleanWord)}${escapeHtml(trailing)}`;
  });

  // Fallback: if no candidate qualified (e.g. easy mode + sentence has zero
  // sight words), blank the middle content word so the exercise is non-empty.
  if (answers.length === 0 && wordEntries.length > 0) {
    const target = wordEntries[Math.floor(wordEntries.length / 2)];
    const { leading, trailing } = extractPunctuation(target.token, target.cleanWord);
    answers.push(target.cleanWord);
    processed[target.index] =
      `${escapeHtml(leading)}${buildWordBlankSpan(target.cleanWord)}${escapeHtml(trailing)}`;
  }

  return { display: processed.join(''), answers };
}
