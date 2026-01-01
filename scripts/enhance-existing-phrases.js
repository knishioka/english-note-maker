/**
 * 既存フレーズカテゴリ拡充スクリプト
 * 各カテゴリにさらに実用的なフレーズを追加
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHRASES_DIR = path.join(__dirname, '../src/data/collections/phrases');

// ID生成
function generateId(type, category, english, ageGroup) {
  const slug = english
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 30);
  return `${type}-${category}-${slug}-${ageGroup}`;
}

const difficultyMap = { '4-6': 1, '7-9': 2, '10-12': 3 };

function createPhrase(category, english, japanese, situation, ageGroup, options = {}) {
  return {
    id: generateId('phrase', category, english, ageGroup),
    type: 'phrase',
    english,
    japanese,
    situation,
    category,
    ageGroup,
    difficulty: difficultyMap[ageGroup],
    pattern: options.pattern || 'statement',
    usageFrequency: options.usageFrequency || 'core',
    focusWords: options.focusWords || [],
    tags: [category, options.pattern || 'statement', ...(options.tags || [])],
  };
}

// ===== greetings 拡充 =====
const additionalGreetings = [
  // 4-6歳
  { e: 'Nice to meet you!', j: 'はじめまして！', s: '初対面のとき', age: '4-6' },
  {
    e: 'How are you today?',
    j: '今日の調子はどう？',
    s: '挨拶するとき',
    age: '4-6',
    pattern: 'question',
  },
  { e: "I'm great!", j: 'とても元気！', s: '元気なとき', age: '4-6' },
  { e: 'See you later!', j: 'またあとでね！', s: '一時的に別れるとき', age: '4-6' },
  { e: 'Good luck!', j: '頑張ってね！', s: '応援するとき', age: '4-6' },
  { e: 'Have a nice weekend!', j: '良い週末を！', s: '週末の別れ際に', age: '4-6' },
  // 7-9歳
  { e: 'Long time no see!', j: '久しぶり！', s: '久しぶりに会ったとき', age: '7-9' },
  {
    e: 'What have you been up to?',
    j: '最近どうしてた？',
    s: '近況を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  { e: "It's good to see you again.", j: 'また会えて嬉しい。', s: '再会したとき', age: '7-9' },
  {
    e: 'Take care of yourself.',
    j: 'お体に気をつけて。',
    s: '気遣いを込めて別れるとき',
    age: '7-9',
  },
  { e: 'Have a great day!', j: '素敵な一日を！', s: '別れ際に言うとき', age: '7-9' },
  {
    e: 'I hope you feel better soon.',
    j: '早く良くなるといいね。',
    s: '体調を気遣うとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: "It's a pleasure to meet you.",
    j: 'お会いできて光栄です。',
    s: 'フォーマルな初対面で',
    age: '10-12',
  },
  {
    e: "I've heard a lot about you.",
    j: 'お噂はかねがね。',
    s: '紹介されて会うとき',
    age: '10-12',
  },
  {
    e: 'Please give my regards to your family.',
    j: 'ご家族によろしくお伝えください。',
    s: '丁寧に別れるとき',
    age: '10-12',
  },
  {
    e: 'It was lovely talking to you.',
    j: 'お話できて楽しかったです。',
    s: '会話の終わりに',
    age: '10-12',
  },
  {
    e: 'I look forward to seeing you again.',
    j: 'またお会いできることを楽しみにしています。',
    s: '次回の再会を期待して',
    age: '10-12',
  },
  {
    e: 'Best wishes for your future endeavors.',
    j: '今後のご活躍をお祈りしています。',
    s: 'フォーマルな別れに',
    age: '10-12',
  },
];

// ===== school 拡充 =====
const additionalSchool = [
  // 4-6歳
  { e: 'I like my teacher.', j: '先生が好きです。', s: '先生について話すとき', age: '4-6' },
  {
    e: 'I made a friend today.',
    j: '今日友達ができました。',
    s: '友達について話すとき',
    age: '4-6',
  },
  {
    e: 'We had music class.',
    j: '音楽の授業がありました。',
    s: '授業について話すとき',
    age: '4-6',
  },
  { e: 'I colored a picture.', j: '絵を塗りました。', s: '活動について話すとき', age: '4-6' },
  {
    e: 'We played in the schoolyard.',
    j: '校庭で遊びました。',
    s: '休み時間について話すとき',
    age: '4-6',
  },
  { e: 'I packed my bag.', j: 'かばんを準備しました。', s: '準備について話すとき', age: '4-6' },
  // 7-9歳
  {
    e: "What's your favorite subject?",
    j: '好きな教科は何？',
    s: '教科について聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'I have a test tomorrow.',
    j: '明日テストがあります。',
    s: 'テストについて話すとき',
    age: '7-9',
  },
  {
    e: 'Our class went on a field trip.',
    j: 'クラスで遠足に行きました。',
    s: '遠足について話すとき',
    age: '7-9',
  },
  {
    e: 'I joined the soccer club.',
    j: 'サッカー部に入りました。',
    s: '部活について話すとき',
    age: '7-9',
  },
  {
    e: "We're learning about history.",
    j: '歴史について学んでいます。',
    s: '学習内容について話すとき',
    age: '7-9',
  },
  {
    e: 'I need to finish my project.',
    j: 'プロジェクトを終わらせなきゃ。',
    s: '課題について話すとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: "I'm preparing for the entrance exam.",
    j: '入試の準備をしています。',
    s: '受験について話すとき',
    age: '10-12',
  },
  {
    e: 'Our school festival is coming up.',
    j: '文化祭が近づいています。',
    s: '学校行事について話すとき',
    age: '10-12',
  },
  {
    e: "I'm the class representative.",
    j: '私はクラス代表です。',
    s: '役職について話すとき',
    age: '10-12',
  },
  {
    e: 'We have a presentation next week.',
    j: '来週プレゼンがあります。',
    s: '発表について話すとき',
    age: '10-12',
  },
  {
    e: "I'm thinking about which high school to attend.",
    j: 'どの高校に行くか考えています。',
    s: '進路について話すとき',
    age: '10-12',
  },
  {
    e: 'Our teacher gave us a challenging assignment.',
    j: '先生が難しい課題を出しました。',
    s: '課題について話すとき',
    age: '10-12',
  },
];

// ===== shopping 拡充 =====
const additionalShopping = [
  // 4-6歳
  {
    e: 'I want this one, please.',
    j: 'これをください。',
    s: '欲しいものを言うとき',
    age: '4-6',
    pattern: 'request',
  },
  { e: "It's too big.", j: '大きすぎます。', s: 'サイズについて言うとき', age: '4-6' },
  { e: "It's too small.", j: '小さすぎます。', s: 'サイズについて言うとき', age: '4-6' },
  { e: 'I like this color.', j: 'この色が好きです。', s: '色について言うとき', age: '4-6' },
  {
    e: 'Where are the toys?',
    j: 'おもちゃはどこですか？',
    s: '場所を聞くとき',
    age: '4-6',
    pattern: 'question',
  },
  {
    e: 'Can we buy it?',
    j: '買ってもいい？',
    s: '許可を求めるとき',
    age: '4-6',
    pattern: 'request',
  },
  // 7-9歳
  {
    e: 'Do you have this in a different size?',
    j: '違うサイズはありますか？',
    s: 'サイズを聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'Can I try this on?',
    j: '試着してもいいですか？',
    s: '試着を頼むとき',
    age: '7-9',
    pattern: 'request',
  },
  {
    e: "I'm looking for a gift.",
    j: 'プレゼントを探しています。',
    s: '目的を伝えるとき',
    age: '7-9',
  },
  {
    e: 'Do you accept credit cards?',
    j: 'クレジットカードは使えますか？',
    s: '支払い方法を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  { e: "I'll take this one.", j: 'これにします。', s: '購入を決めるとき', age: '7-9' },
  {
    e: 'Is there a discount?',
    j: '割引はありますか？',
    s: '割引を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  // 10-12歳
  {
    e: "I'm just browsing, thank you.",
    j: '見ているだけです、ありがとうございます。',
    s: '店員に断るとき',
    age: '10-12',
  },
  {
    e: 'Could you recommend something?',
    j: '何かおすすめはありますか？',
    s: 'おすすめを聞くとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: "I'd like to return this item.",
    j: 'この商品を返品したいのですが。',
    s: '返品するとき',
    age: '10-12',
  },
  {
    e: 'Is this the final price?',
    j: 'これが最終価格ですか？',
    s: '値段を確認するとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: 'Could you wrap this as a gift?',
    j: 'ギフト用に包んでいただけますか？',
    s: 'ラッピングを頼むとき',
    age: '10-12',
    pattern: 'request',
  },
  {
    e: "I'm comparing prices at different stores.",
    j: 'いくつかのお店で価格を比較しています。',
    s: '買い物の仕方を説明するとき',
    age: '10-12',
  },
];

// ===== friend_making 拡充 =====
const additionalFriendMaking = [
  // 4-6歳
  {
    e: 'Do you want to be friends?',
    j: '友達になろう？',
    s: '友達になりたいとき',
    age: '4-6',
    pattern: 'question',
  },
  { e: "Let's play tag.", j: '鬼ごっこしよう。', s: '遊びに誘うとき', age: '4-6' },
  { e: 'You can play with us.', j: '一緒に遊ぼう。', s: '仲間に入れるとき', age: '4-6' },
  { e: "That's my friend.", j: 'あれは私の友達です。', s: '友達を紹介するとき', age: '4-6' },
  {
    e: 'We like the same things.',
    j: '私たちは同じものが好きです。',
    s: '共通点を見つけたとき',
    age: '4-6',
  },
  { e: "Let's share.", j: '分けっこしよう。', s: '分け合うことを提案するとき', age: '4-6' },
  // 7-9歳
  {
    e: 'Do you live near here?',
    j: 'この近くに住んでいるの？',
    s: '住んでいる場所を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  { e: 'We should hang out sometime.', j: '今度一緒に遊ぼう。', s: '遊びに誘うとき', age: '7-9' },
  {
    e: 'What kind of music do you like?',
    j: 'どんな音楽が好き？',
    s: '趣味を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'We have a lot in common.',
    j: '共通点がたくさんあるね。',
    s: '共通点を見つけたとき',
    age: '7-9',
  },
  {
    e: 'Can I add you on social media?',
    j: 'SNSでつながってもいい？',
    s: '連絡先を交換するとき',
    age: '7-9',
    pattern: 'request',
  },
  {
    e: "You're really fun to be with.",
    j: '一緒にいて楽しいね。',
    s: '友情を表現するとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: "I'd like to get to know you better.",
    j: 'もっとあなたのことを知りたいです。',
    s: '友達になりたいとき',
    age: '10-12',
  },
  {
    e: 'We seem to have similar interests.',
    j: '似たような興味があるみたいですね。',
    s: '共通点を見つけたとき',
    age: '10-12',
  },
  {
    e: 'I really enjoy our conversations.',
    j: 'あなたとの会話は本当に楽しいです。',
    s: '友情を表現するとき',
    age: '10-12',
  },
  {
    e: "You're a great friend.",
    j: 'あなたは素晴らしい友達です。',
    s: '友情を表現するとき',
    age: '10-12',
  },
  {
    e: 'I appreciate our friendship.',
    j: '私たちの友情に感謝しています。',
    s: '友情を大切にするとき',
    age: '10-12',
  },
  {
    e: 'True friends are hard to find.',
    j: '本当の友達を見つけるのは難しいです。',
    s: '友情について話すとき',
    age: '10-12',
  },
];

// ===== feelings 拡充 =====
const additionalFeelings = [
  // 4-6歳
  { e: "I'm excited!", j: 'ワクワクする！', s: '興奮しているとき', age: '4-6' },
  { e: "I'm nervous.", j: '緊張しています。', s: '緊張しているとき', age: '4-6' },
  { e: "I'm bored.", j: '退屈です。', s: '退屈なとき', age: '4-6' },
  { e: "I'm surprised!", j: 'びっくりした！', s: '驚いたとき', age: '4-6' },
  { e: "I'm proud of you.", j: 'あなたを誇りに思います。', s: '褒めるとき', age: '4-6' },
  { e: 'I miss you.', j: '会いたいな。', s: '寂しいとき', age: '4-6' },
  // 7-9歳
  {
    e: "I'm feeling anxious about the test.",
    j: 'テストが心配です。',
    s: '不安を伝えるとき',
    age: '7-9',
  },
  {
    e: "I'm relieved that it's over.",
    j: '終わってホッとしました。',
    s: '安堵を伝えるとき',
    age: '7-9',
  },
  {
    e: "I'm disappointed with the result.",
    j: '結果にがっかりしました。',
    s: '失望を伝えるとき',
    age: '7-9',
  },
  {
    e: "I'm confused about what to do.",
    j: 'どうすればいいか混乱しています。',
    s: '困惑を伝えるとき',
    age: '7-9',
  },
  {
    e: "I'm grateful for your help.",
    j: '助けてくれて感謝しています。',
    s: '感謝を伝えるとき',
    age: '7-9',
  },
  {
    e: "I'm annoyed by the noise.",
    j: '騒音にイライラしています。',
    s: '苛立ちを伝えるとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: "I'm overwhelmed with all the work.",
    j: '仕事の量に圧倒されています。',
    s: 'プレッシャーを伝えるとき',
    age: '10-12',
  },
  {
    e: "I'm feeling motivated today.",
    j: '今日はやる気があります。',
    s: 'モチベーションを伝えるとき',
    age: '10-12',
  },
  {
    e: "I'm nostalgic about my childhood.",
    j: '子供時代を懐かしく思います。',
    s: '郷愁を伝えるとき',
    age: '10-12',
  },
  {
    e: "I'm uncertain about my future.",
    j: '将来について不安です。',
    s: '将来への不安を伝えるとき',
    age: '10-12',
  },
  { e: 'I feel accomplished.', j: '達成感を感じています。', s: '達成感を伝えるとき', age: '10-12' },
  {
    e: "I'm torn between two options.",
    j: '二つの選択肢の間で迷っています。',
    s: '迷いを伝えるとき',
    age: '10-12',
  },
];

// カテゴリと追加フレーズのマッピング
const enhanceCategories = [
  { name: 'greetings', phrases: additionalGreetings },
  { name: 'school', phrases: additionalSchool },
  { name: 'shopping', phrases: additionalShopping },
  { name: 'friend_making', phrases: additionalFriendMaking },
  { name: 'feelings', phrases: additionalFeelings },
];

// 既存ファイルにフレーズを追加
function enhanceCategory(category, newPhraseData) {
  const filePath = path.join(PHRASES_DIR, `${category}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${category}.json`);
    return null;
  }

  const collection = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const existingIds = new Set(collection.items.map((item) => item.id));

  let addedCount = 0;
  for (const p of newPhraseData) {
    const newPhrase = createPhrase(category, p.e, p.j, p.s, p.age, { pattern: p.pattern });

    // 重複チェック
    if (!existingIds.has(newPhrase.id)) {
      collection.items.push(newPhrase);
      existingIds.add(newPhrase.id);
      addedCount++;
    }
  }

  // メタデータ更新
  collection.metadata.totalCount = collection.items.length;
  collection.metadata.lastUpdated = new Date().toISOString();

  fs.writeFileSync(filePath, JSON.stringify(collection, null, 2));
  console.log(
    `✅ Enhanced ${category}.json: +${addedCount} phrases (total: ${collection.items.length})`
  );

  return { name: category, count: collection.items.length };
}

// マニフェスト更新
function updateManifest() {
  const manifestPath = path.join(PHRASES_DIR, '_manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  let totalItems = 0;

  for (const file of manifest.files) {
    const filePath = path.join(PHRASES_DIR, `${file.name}.json`);
    if (fs.existsSync(filePath)) {
      const collection = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      file.itemCount = collection.items.length;
      totalItems += collection.items.length;
    }
  }

  manifest.totalItems = totalItems;
  manifest.lastUpdated = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Updated manifest: ${totalItems} total phrases`);
}

// メイン処理
function main() {
  console.log('🚀 Enhancing existing phrase categories...\n');

  for (const cat of enhanceCategories) {
    enhanceCategory(cat.name, cat.phrases);
  }

  updateManifest();
  console.log('\n✨ Enhancement complete!');
}

main();
