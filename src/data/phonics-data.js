/**
 * フォニックス / word-family 練習データ
 * 低年齢でも扱いやすい短い単語を優先し、1ページで1パターンを反復する前提で管理する。
 */

export const PHONICS_DATA = {
  at: {
    id: 'at',
    displayPattern: '-at',
    label: '-at ファミリー',
    focus: 'at',
    hint: 'a と t の音をつなげて読もう',
    words: [
      { english: 'cat', japanese: 'ねこ' },
      { english: 'bat', japanese: 'こうもり' },
      { english: 'hat', japanese: 'ぼうし' },
      { english: 'mat', japanese: 'マット' },
      { english: 'rat', japanese: 'ねずみ' },
      { english: 'sat', japanese: 'すわった' },
      { english: 'pat', japanese: 'ぽんとたたく' },
    ],
  },
  an: {
    id: 'an',
    displayPattern: '-an',
    label: '-an ファミリー',
    focus: 'an',
    hint: 'a と n の音のまとまりを見つけよう',
    words: [
      { english: 'can', japanese: 'できる / かん' },
      { english: 'fan', japanese: 'せんぷうき' },
      { english: 'man', japanese: 'おとこのひと' },
      { english: 'pan', japanese: 'フライパン' },
      { english: 'van', japanese: 'バン' },
      { english: 'ran', japanese: 'はしった' },
      { english: 'tan', japanese: 'うすちゃいろ' },
    ],
  },
  ap: {
    id: 'ap',
    displayPattern: '-ap',
    label: '-ap ファミリー',
    focus: 'ap',
    hint: 'a と p の音をそろえて書こう',
    words: [
      { english: 'cap', japanese: 'ぼうし' },
      { english: 'map', japanese: 'ちず' },
      { english: 'nap', japanese: 'ひるね' },
      { english: 'tap', japanese: 'たたく / ひねる' },
      { english: 'gap', japanese: 'すきま' },
      { english: 'lap', japanese: 'ひざ' },
      { english: 'sap', japanese: 'しる' },
    ],
  },
  it: {
    id: 'it',
    displayPattern: '-it',
    label: '-it ファミリー',
    focus: 'it',
    hint: 'i の短い音に注目しよう',
    words: [
      { english: 'sit', japanese: 'すわる' },
      { english: 'hit', japanese: 'たたく' },
      { english: 'bit', japanese: 'かんだ' },
      { english: 'kit', japanese: 'どうぐセット' },
      { english: 'pit', japanese: 'あな' },
      { english: 'fit', japanese: 'ぴったり合う' },
    ],
  },
  ig: {
    id: 'ig',
    displayPattern: '-ig',
    label: '-ig ファミリー',
    focus: 'ig',
    hint: 'i と g の音をくり返そう',
    words: [
      { english: 'pig', japanese: 'ぶた' },
      { english: 'dig', japanese: 'ほる' },
      { english: 'big', japanese: 'おおきい' },
      { english: 'wig', japanese: 'かつら' },
      { english: 'fig', japanese: 'いちじく' },
      { english: 'jig', japanese: 'はずむおどり' },
    ],
  },
  op: {
    id: 'op',
    displayPattern: '-op',
    label: '-op ファミリー',
    focus: 'op',
    hint: 'o と p の音のまとまりを意識しよう',
    words: [
      { english: 'hop', japanese: 'ぴょんととぶ' },
      { english: 'mop', japanese: 'モップ' },
      { english: 'top', japanese: 'いちばん上' },
      { english: 'pop', japanese: 'ぽんとはじける' },
      { english: 'cop', japanese: 'けいさつかん' },
      { english: 'shop', japanese: 'みせ' },
    ],
  },
  ug: {
    id: 'ug',
    displayPattern: '-ug',
    label: '-ug ファミリー',
    focus: 'ug',
    hint: 'u の短い音で word family をそろえよう',
    words: [
      { english: 'bug', japanese: 'むし' },
      { english: 'hug', japanese: 'だきしめる' },
      { english: 'mug', japanese: 'マグカップ' },
      { english: 'rug', japanese: 'ラグ' },
      { english: 'jug', japanese: 'つぼ' },
      { english: 'plug', japanese: 'プラグ' },
    ],
  },
  sh: {
    id: 'sh',
    displayPattern: 'sh',
    label: 'sh の音',
    focus: 'sh',
    hint: 'sh の音を見つけて、はじめの音をそろえよう',
    words: [
      { english: 'ship', japanese: 'ふね' },
      { english: 'shop', japanese: 'みせ' },
      { english: 'fish', japanese: 'さかな' },
      { english: 'dish', japanese: 'おさら' },
      { english: 'shell', japanese: 'かいがら' },
      { english: 'shark', japanese: 'さめ' },
    ],
  },
  ch: {
    id: 'ch',
    displayPattern: 'ch',
    label: 'ch の音',
    focus: 'ch',
    hint: 'ch の音を声に出しながら書こう',
    words: [
      { english: 'chip', japanese: 'チップ' },
      { english: 'chat', japanese: 'おしゃべり' },
      { english: 'chin', japanese: 'あご' },
      { english: 'chop', japanese: 'きざむ' },
      { english: 'much', japanese: 'たくさんの' },
      { english: 'lunch', japanese: 'ひるごはん' },
    ],
  },
  th: {
    id: 'th',
    displayPattern: 'th',
    label: 'th の音',
    focus: 'th',
    hint: 'th の音がある場所を見つけよう',
    words: [
      { english: 'that', japanese: 'あれ' },
      { english: 'this', japanese: 'これ' },
      { english: 'thin', japanese: 'うすい' },
      { english: 'three', japanese: '3' },
      { english: 'bath', japanese: 'おふろ' },
      { english: 'math', japanese: 'さんすう' },
    ],
  },
};

export const PHONICS_PATTERN_ORDER = Object.freeze([
  'at',
  'an',
  'ap',
  'it',
  'ig',
  'op',
  'ug',
  'sh',
  'ch',
  'th',
]);

export const PHONICS_PATTERN_OPTIONS = PHONICS_PATTERN_ORDER.map((patternKey) => ({
  value: patternKey,
  label: PHONICS_DATA[patternKey].label,
}));

function shuffleEntries(entries) {
  const clone = Array.isArray(entries) ? [...entries] : [];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

export function getPhonicsPatternConfig(patternKey) {
  const fallbackKey = PHONICS_PATTERN_ORDER[0];
  const resolvedKey = PHONICS_DATA[patternKey] ? patternKey : fallbackKey;
  return PHONICS_DATA[resolvedKey] || null;
}

export function getPhonicsWords(patternKey) {
  const config = getPhonicsPatternConfig(patternKey);
  return Array.isArray(config?.words) ? [...config.words] : [];
}

export function buildPhonicsWordSequence(patternKey, perPage, pageCount, data = PHONICS_DATA) {
  const totalNeeded = Math.max(0, (perPage || 0) * (pageCount || 0));
  if (!totalNeeded) {
    return [];
  }

  const fallbackKey = PHONICS_PATTERN_ORDER[0];
  const config = data[patternKey] || data[fallbackKey];
  const words = Array.isArray(config?.words) ? config.words.filter(Boolean) : [];

  if (!words.length) {
    return [];
  }

  if (words.length >= totalNeeded) {
    return shuffleEntries(words).slice(0, totalNeeded);
  }

  const result = [];
  let workingSet = shuffleEntries(words);
  let index = 0;

  while (result.length < totalNeeded) {
    if (index >= workingSet.length) {
      workingSet = shuffleEntries(words);
      index = 0;
    }
    result.push(workingSet[index]);
    index += 1;
  }

  return result;
}
