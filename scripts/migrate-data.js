/**
 * データ移行スクリプト
 * 既存のJSデータファイルを新しいJSON形式に変換
 */

import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src', 'data');
const collectionsDir = path.join(srcDir, 'collections');

/**
 * IDを生成
 */
function generateId(type, category, english, ageGroup) {
  const normalizedEnglish = english
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);

  return `${type}-${category}-${normalizedEnglish}-${ageGroup}`;
}

/**
 * 難易度を年齢グループから推論
 */
function inferDifficulty(ageGroup) {
  switch (ageGroup) {
    case '4-6':
      return 1;
    case '7-9':
      return 2;
    case '10-12':
      return 3;
    default:
      return 1;
  }
}

/**
 * 単語データを変換
 */
async function migrateWords() {
  console.log('Migrating words...');

  const { WORD_LISTS } = await import('../src/data/word-lists.js');
  const outputDir = path.join(collectionsDir, 'words');

  const manifest = {
    type: 'word',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    files: [],
    totalItems: 0,
    loadStrategy: 'lazy',
  };

  for (const [category, ageData] of Object.entries(WORD_LISTS)) {
    const items = [];

    for (const [ageGroup, words] of Object.entries(ageData)) {
      for (const word of words) {
        items.push({
          id: generateId('word', category, word.english, ageGroup),
          type: 'word',
          english: word.english,
          japanese: word.japanese,
          syllables: word.syllables,
          category: category,
          ageGroup: ageGroup,
          difficulty: inferDifficulty(ageGroup),
        });
      }
    }

    const collection = {
      metadata: {
        type: 'word',
        category: category,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalCount: items.length,
        schemaVersion: '1.0.0',
      },
      items: items,
    };

    const filePath = path.join(outputDir, `${category}.json`);
    fs.writeFileSync(filePath, JSON.stringify(collection, null, 2), 'utf-8');
    console.log(`  Created: ${category}.json (${items.length} items)`);

    manifest.files.push({
      name: category,
      path: `./${category}.json`,
      itemCount: items.length,
      ageGroups: ['4-6', '7-9', '10-12'],
    });
    manifest.totalItems += items.length;
  }

  fs.writeFileSync(
    path.join(outputDir, '_manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log(`  Created: _manifest.json (total: ${manifest.totalItems} items)`);
}

/**
 * フレーズデータを変換
 */
async function migratePhrases() {
  console.log('Migrating phrases...');

  const phraseModule = await import('../src/data/phrase-data.js');
  const PHRASE_DATA = phraseModule.PHRASE_DATA;
  const outputDir = path.join(collectionsDir, 'phrases');

  const manifest = {
    type: 'phrase',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    files: [],
    totalItems: 0,
    loadStrategy: 'lazy',
  };

  for (const [category, ageData] of Object.entries(PHRASE_DATA)) {
    const items = [];

    for (const [ageGroup, phrases] of Object.entries(ageData)) {
      for (const phrase of phrases) {
        items.push({
          id: generateId('phrase', category, phrase.english, ageGroup),
          type: 'phrase',
          english: phrase.english,
          japanese: phrase.japanese,
          situation: phrase.situation || '',
          category: category,
          ageGroup: ageGroup,
          difficulty: inferDifficulty(ageGroup),
          pattern: phrase.pattern || undefined,
          usageFrequency: phrase.usageFrequency || undefined,
          focusWords: phrase.focusWords || undefined,
          tags: phrase.tags || undefined,
        });
      }
    }

    // 空のオブジェクトフィールドを削除
    items.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (item[key] === undefined) {
          delete item[key];
        }
      });
    });

    const collection = {
      metadata: {
        type: 'phrase',
        category: category,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalCount: items.length,
        schemaVersion: '1.0.0',
      },
      items: items,
    };

    const filePath = path.join(outputDir, `${category}.json`);
    fs.writeFileSync(filePath, JSON.stringify(collection, null, 2), 'utf-8');
    console.log(`  Created: ${category}.json (${items.length} items)`);

    manifest.files.push({
      name: category,
      path: `./${category}.json`,
      itemCount: items.length,
      ageGroups: ['4-6', '7-9', '10-12'],
    });
    manifest.totalItems += items.length;
  }

  fs.writeFileSync(
    path.join(outputDir, '_manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log(`  Created: _manifest.json (total: ${manifest.totalItems} items)`);
}

/**
 * 例文データを変換
 */
async function migrateSentences() {
  console.log('Migrating sentences...');

  const { EXAMPLE_SENTENCES_BY_AGE } = await import('../src/data/example-sentences.js');
  const outputDir = path.join(collectionsDir, 'sentences');

  const manifest = {
    type: 'sentence',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    files: [],
    totalItems: 0,
    loadStrategy: 'eager',
  };

  for (const [ageGroup, sentences] of Object.entries(EXAMPLE_SENTENCES_BY_AGE)) {
    const items = sentences.map((sentence) => ({
      id: generateId('sentence', sentence.category || 'general', sentence.english, ageGroup),
      type: 'sentence',
      english: sentence.english,
      japanese: sentence.japanese,
      category: sentence.category || 'general',
      ageGroup: ageGroup,
      difficulty: sentence.difficulty || inferDifficulty(ageGroup),
      custom: sentence.custom || false,
    }));

    const collection = {
      metadata: {
        type: 'sentence',
        category: `age-${ageGroup}`,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalCount: items.length,
        schemaVersion: '1.0.0',
      },
      items: items,
    };

    const fileName = `age-${ageGroup}.json`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(collection, null, 2), 'utf-8');
    console.log(`  Created: ${fileName} (${items.length} items)`);

    manifest.files.push({
      name: `age-${ageGroup}`,
      path: `./${fileName}`,
      itemCount: items.length,
      ageGroups: [ageGroup],
    });
    manifest.totalItems += items.length;
  }

  fs.writeFileSync(
    path.join(outputDir, '_manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log(`  Created: _manifest.json (total: ${manifest.totalItems} items)`);
}

/**
 * アルファベットデータを変換
 */
async function migrateAlphabet() {
  console.log('Migrating alphabet...');

  const { ALPHABET_DATA } = await import('../src/data/alphabet-data.js');
  const outputDir = path.join(collectionsDir, 'alphabet');

  const manifest = {
    type: 'alphabet',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    files: [],
    totalItems: 0,
    loadStrategy: 'eager',
  };

  for (const [letterCase, letters] of Object.entries(ALPHABET_DATA)) {
    const items = letters.map((letter) => ({
      id: generateId('alphabet', letterCase, letter.letter, '4-6'),
      type: 'alphabet',
      english: letter.letter,
      japanese: letter.japanese,
      letter: letter.letter,
      example: letter.example,
      letterCase: letterCase,
      category: letterCase,
      ageGroup: '4-6',
      difficulty: 1,
    }));

    const collection = {
      metadata: {
        type: 'alphabet',
        category: letterCase,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalCount: items.length,
        schemaVersion: '1.0.0',
      },
      items: items,
    };

    const filePath = path.join(outputDir, `${letterCase}.json`);
    fs.writeFileSync(filePath, JSON.stringify(collection, null, 2), 'utf-8');
    console.log(`  Created: ${letterCase}.json (${items.length} items)`);

    manifest.files.push({
      name: letterCase,
      path: `./${letterCase}.json`,
      itemCount: items.length,
      ageGroups: ['4-6'],
    });
    manifest.totalItems += items.length;
  }

  fs.writeFileSync(
    path.join(outputDir, '_manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log(`  Created: _manifest.json (total: ${manifest.totalItems} items)`);
}

/**
 * メイン実行
 */
async function main() {
  console.log('=== Data Migration Script ===\n');

  // ディレクトリ作成
  const dirs = ['words', 'phrases', 'sentences', 'alphabet'];
  for (const dir of dirs) {
    const dirPath = path.join(collectionsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  try {
    await migrateWords();
    console.log('');
    await migratePhrases();
    console.log('');
    await migrateSentences();
    console.log('');
    await migrateAlphabet();
    console.log('');
    console.log('=== Migration Complete ===');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
