import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { AGE_KANJI_LIMIT, findTooHardKanji } from '../src/data/kanji-grade-levels.js';
import { EXAMPLE_SENTENCES_BY_AGE } from '../src/data/example-sentences.js';
import { PHRASE_DATA } from '../src/data/phrase-data.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COLLECTIONS_DIR = join(ROOT, 'src/data/collections');

/** 学習者に見える日本語のフィールド。 */
const JAPANESE_FIELDS = ['japanese', 'situation'];

function collectionFiles(dir = COLLECTIONS_DIR) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return collectionFiles(path);
    return name.endsWith('.json') && !name.startsWith('_') ? [path] : [];
  });
}

/** 全データを { source, ageGroup, category, english, japanese, situation } に正規化する。 */
function loadAllItems() {
  const items = [];

  for (const file of collectionFiles()) {
    const { items: fileItems = [] } = JSON.parse(readFileSync(file, 'utf8'));
    for (const item of fileItems) {
      items.push({ ...item, source: file.replace(`${ROOT}/`, '') });
    }
  }

  for (const [category, ageMap] of Object.entries(PHRASE_DATA)) {
    for (const [ageGroup, phrases] of Object.entries(ageMap)) {
      for (const phrase of phrases) {
        items.push({ ...phrase, category, ageGroup, source: 'src/data/phrase-data.js' });
      }
    }
  }

  for (const [ageGroup, sentences] of Object.entries(EXAMPLE_SENTENCES_BY_AGE)) {
    for (const sentence of sentences) {
      items.push({ ...sentence, ageGroup, source: 'src/data/example-sentences.js' });
    }
  }

  return items;
}

const ALL_ITEMS = loadAllItems();

describe('年齢別の日本語表記', () => {
  it('データが読み込めている', () => {
    expect(ALL_ITEMS.length).toBeGreaterThan(1000);
  });

  it.each(Object.keys(AGE_KANJI_LIMIT))('%s歳向けの日本語は習っていない漢字を含まない', (age) => {
    const violations = [];

    for (const item of ALL_ITEMS) {
      if (item.ageGroup !== age) continue;
      for (const field of JAPANESE_FIELDS) {
        const tooHard = findTooHardKanji(item[field], age);
        if (!tooHard.length) continue;
        violations.push(
          `${item.source} [${item.id || item.english}] ${field}="${item[field]}" → ` +
            tooHard.map(({ char, grade }) => `${char}(小${grade})`).join('、')
        );
      }
    }

    expect(violations, `\n${violations.slice(0, 20).join('\n')}`).toEqual([]);
  });

  // 分かち書きは4-6歳だけ。7-9歳以上は教科書と同じく詰めて書く。
  it.each(['7-9', '10-12'])('%s歳向けの日本語は分かち書きしない', (age) => {
    const violations = ALL_ITEMS.filter(
      (item) =>
        item.ageGroup === age && JAPANESE_FIELDS.some((field) => /\S\s+\S/.test(item[field]))
    ).map((item) => `${item.source} [${item.id || item.english}] "${item.japanese}"`);

    expect(violations, `\n${violations.slice(0, 20).join('\n')}`).toEqual([]);
  });

  // ひらがなだけの文は切れ目が見えないので、読点かスペースで文節を区切る。
  it('4-6歳の日本語文はひとかたまりが長くなりすぎない', () => {
    const MAX_CHUNK_LENGTH = 10;
    const violations = [];

    for (const item of ALL_ITEMS) {
      if (item.ageGroup !== '4-6' || !item.japanese) continue;
      const longChunk = item.japanese
        .split(/[\s、]+/)
        .map((chunk) => chunk.replace(/[。！？「」（）・/]/g, ''))
        .find((chunk) => chunk.length > MAX_CHUNK_LENGTH);
      if (!longChunk) continue;
      violations.push(`${item.source} [${item.id || item.english}] "${item.japanese}"`);
    }

    expect(violations, `\n${violations.slice(0, 20).join('\n')}`).toEqual([]);
  });
});

describe('穴埋め練習の答えが一意に決まること', () => {
  // 1枚の用紙は「同じ年齢・同じカテゴリー」から出題される。そこに同じ日本語が
  // 2問並ぶと、場面説明が違っても学習者はどちらの英文を書くか決められない。
  it('同じ年齢・カテゴリーで同じ日本語に複数の英文が割り当てられていない', () => {
    const byPrompt = new Map();

    for (const item of ALL_ITEMS) {
      if (item.type === 'word' || item.type === 'alphabet') continue;
      if (!item.english || !item.japanese) continue;
      const key = [item.ageGroup, item.category, item.japanese].join(' | ');
      if (!byPrompt.has(key)) byPrompt.set(key, new Set());
      byPrompt.get(key).add(item.english);
    }

    const ambiguous = [...byPrompt]
      .filter(([, englishSet]) => englishSet.size > 1)
      .map(([key, englishSet]) => `${key} → ${[...englishSet].join(' / ')}`);

    expect(ambiguous, `\n${ambiguous.join('\n')}`).toEqual([]);
  });
});
