/**
 * フレーズデータ拡充スクリプト
 * 実用的な日常表現を大幅に追加
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

// 難易度マップ
const difficultyMap = { '4-6': 1, '7-9': 2, '10-12': 3 };

// フレーズアイテム生成
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

// ===== 新カテゴリ: family =====
const familyPhrases = [
  // 4-6歳
  { e: 'This is my mom.', j: 'これは私のお母さんです。', s: '家族を紹介するとき', age: '4-6' },
  { e: 'This is my dad.', j: 'これは私のお父さんです。', s: '家族を紹介するとき', age: '4-6' },
  {
    e: 'I have a sister.',
    j: '私には姉/妹がいます。',
    s: 'きょうだいについて話すとき',
    age: '4-6',
  },
  {
    e: 'I have a brother.',
    j: '私には兄/弟がいます。',
    s: 'きょうだいについて話すとき',
    age: '4-6',
  },
  {
    e: 'I love my family.',
    j: '私は家族が大好きです。',
    s: '家族への愛情を伝えるとき',
    age: '4-6',
  },
  {
    e: 'My grandma is kind.',
    j: '私のおばあちゃんは優しいです。',
    s: '祖母について話すとき',
    age: '4-6',
  },
  {
    e: 'My grandpa is funny.',
    j: '私のおじいちゃんは面白いです。',
    s: '祖父について話すとき',
    age: '4-6',
  },
  {
    e: 'We live together.',
    j: '私たちは一緒に住んでいます。',
    s: '家族構成について話すとき',
    age: '4-6',
  },
  {
    e: 'I play with my sister.',
    j: '私は姉/妹と遊びます。',
    s: 'きょうだいとの活動を話すとき',
    age: '4-6',
  },
  {
    e: 'My baby brother is cute.',
    j: '私の弟はかわいいです。',
    s: '弟について話すとき',
    age: '4-6',
  },
  {
    e: 'My mom cooks well.',
    j: '私のお母さんは料理が上手です。',
    s: 'お母さんを褒めるとき',
    age: '4-6',
  },
  {
    e: 'My dad works hard.',
    j: '私のお父さんはよく働きます。',
    s: 'お父さんについて話すとき',
    age: '4-6',
  },
  // 7-9歳
  {
    e: 'How many people are in your family?',
    j: '家族は何人ですか？',
    s: '家族構成を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'There are five people in my family.',
    j: '私の家族は5人です。',
    s: '家族の人数を答えるとき',
    age: '7-9',
  },
  {
    e: 'My older sister is in high school.',
    j: '私の姉は高校生です。',
    s: '姉について話すとき',
    age: '7-9',
  },
  {
    e: 'My younger brother likes soccer.',
    j: '私の弟はサッカーが好きです。',
    s: '弟の趣味を話すとき',
    age: '7-9',
  },
  {
    e: 'We visit my grandparents on weekends.',
    j: '私たちは週末に祖父母を訪ねます。',
    s: '週末の過ごし方を話すとき',
    age: '7-9',
  },
  {
    e: 'My uncle lives in Tokyo.',
    j: '私のおじは東京に住んでいます。',
    s: '親戚について話すとき',
    age: '7-9',
  },
  {
    e: 'My aunt gave me a present.',
    j: 'おばさんがプレゼントをくれました。',
    s: 'おばさんについて話すとき',
    age: '7-9',
  },
  { e: 'I look like my mother.', j: '私は母に似ています。', s: '容姿について話すとき', age: '7-9' },
  {
    e: 'My cousin is the same age as me.',
    j: '私のいとこは私と同い年です。',
    s: 'いとこについて話すとき',
    age: '7-9',
  },
  {
    e: 'We have a family pet.',
    j: '私たちは家族でペットを飼っています。',
    s: 'ペットについて話すとき',
    age: '7-9',
  },
  {
    e: 'My parents work every day.',
    j: '私の両親は毎日働いています。',
    s: '両親の仕事について話すとき',
    age: '7-9',
  },
  {
    e: 'I help my parents at home.',
    j: '私は家で両親を手伝います。',
    s: '家事手伝いについて話すとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: 'Could you tell me about your family?',
    j: 'あなたの家族について教えてもらえますか？',
    s: '丁寧に家族について聞くとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: "I'm the youngest in my family.",
    j: '私は家族の中で一番年下です。',
    s: '自分の立場を説明するとき',
    age: '10-12',
  },
  {
    e: 'My family has three generations living together.',
    j: '私の家族は三世代が一緒に暮らしています。',
    s: '家族構成を説明するとき',
    age: '10-12',
  },
  {
    e: 'We have a family reunion every year.',
    j: '私たちは毎年家族で集まります。',
    s: '家族行事について話すとき',
    age: '10-12',
  },
  {
    e: 'My grandfather tells great stories.',
    j: '祖父は素晴らしい話をしてくれます。',
    s: '祖父について話すとき',
    age: '10-12',
  },
  {
    e: 'I respect my parents very much.',
    j: '私は両親をとても尊敬しています。',
    s: '両親への敬意を表すとき',
    age: '10-12',
  },
  {
    e: 'My siblings and I get along well.',
    j: 'きょうだいと私は仲が良いです。',
    s: 'きょうだい関係について話すとき',
    age: '10-12',
  },
  {
    e: 'We celebrate birthdays together as a family.',
    j: '家族で一緒に誕生日を祝います。',
    s: '家族行事について話すとき',
    age: '10-12',
  },
  {
    e: 'My grandmother taught me how to cook.',
    j: '祖母が料理を教えてくれました。',
    s: '祖母から学んだことを話すとき',
    age: '10-12',
  },
  {
    e: 'Family is the most important thing to me.',
    j: '家族は私にとって一番大切なものです。',
    s: '家族の大切さを伝えるとき',
    age: '10-12',
  },
  {
    e: 'I share a room with my brother.',
    j: '私は弟と部屋を共有しています。',
    s: '住環境について話すとき',
    age: '10-12',
  },
  {
    e: 'We support each other in difficult times.',
    j: '困難な時は互いに支え合います。',
    s: '家族の絆について話すとき',
    age: '10-12',
  },
];

// ===== 新カテゴリ: hobbies =====
const hobbiesPhrases = [
  // 4-6歳
  { e: 'I like drawing.', j: '私は絵を描くのが好きです。', s: '趣味を言うとき', age: '4-6' },
  { e: 'I like singing.', j: '私は歌うことが好きです。', s: '趣味を言うとき', age: '4-6' },
  { e: 'I like dancing.', j: '私は踊ることが好きです。', s: '趣味を言うとき', age: '4-6' },
  {
    e: 'I play with blocks.',
    j: '私はブロックで遊びます。',
    s: '遊びについて話すとき',
    age: '4-6',
  },
  { e: 'I read picture books.', j: '私は絵本を読みます。', s: '読書について話すとき', age: '4-6' },
  {
    e: 'I like playing games.',
    j: '私はゲームをするのが好きです。',
    s: '趣味を言うとき',
    age: '4-6',
  },
  {
    e: 'I collect stickers.',
    j: '私はシールを集めています。',
    s: 'コレクションについて話すとき',
    age: '4-6',
  },
  { e: 'I like coloring.', j: '私は塗り絵が好きです。', s: '趣味を言うとき', age: '4-6' },
  { e: 'I play with dolls.', j: '私は人形で遊びます。', s: '遊びについて話すとき', age: '4-6' },
  { e: 'I like puzzles.', j: '私はパズルが好きです。', s: '趣味を言うとき', age: '4-6' },
  {
    e: 'I make things with paper.',
    j: '私は紙で物を作ります。',
    s: '工作について話すとき',
    age: '4-6',
  },
  {
    e: 'I like riding my bicycle.',
    j: '私は自転車に乗るのが好きです。',
    s: '趣味を言うとき',
    age: '4-6',
  },
  // 7-9歳
  {
    e: 'What are your hobbies?',
    j: 'あなたの趣味は何ですか？',
    s: '趣味を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'My hobby is playing soccer.',
    j: '私の趣味はサッカーをすることです。',
    s: '趣味を答えるとき',
    age: '7-9',
  },
  {
    e: 'I enjoy reading comic books.',
    j: '私は漫画を読むことを楽しんでいます。',
    s: '趣味を言うとき',
    age: '7-9',
  },
  {
    e: 'I like watching anime.',
    j: '私はアニメを見るのが好きです。',
    s: '趣味を言うとき',
    age: '7-9',
  },
  {
    e: 'I play video games on weekends.',
    j: '私は週末にゲームをします。',
    s: '週末の過ごし方を話すとき',
    age: '7-9',
  },
  {
    e: 'I take swimming lessons.',
    j: '私は水泳のレッスンを受けています。',
    s: '習い事について話すとき',
    age: '7-9',
  },
  {
    e: "I'm learning to play the guitar.",
    j: '私はギターを習っています。',
    s: '習い事について話すとき',
    age: '7-9',
  },
  {
    e: 'I like building model kits.',
    j: '私はプラモデルを作るのが好きです。',
    s: '趣味を言うとき',
    age: '7-9',
  },
  {
    e: "I'm interested in photography.",
    j: '私は写真に興味があります。',
    s: '興味について話すとき',
    age: '7-9',
  },
  {
    e: 'I enjoy camping with my family.',
    j: '私は家族とキャンプを楽しみます。',
    s: 'アウトドア活動について話すとき',
    age: '7-9',
  },
  { e: 'I like making crafts.', j: '私は工作が好きです。', s: '趣味を言うとき', age: '7-9' },
  {
    e: 'I collect trading cards.',
    j: '私はトレーディングカードを集めています。',
    s: 'コレクションについて話すとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: 'What do you do in your free time?',
    j: '暇な時は何をしていますか？',
    s: '趣味を聞くとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: "I'm passionate about music.",
    j: '私は音楽に情熱を持っています。',
    s: '熱中していることを話すとき',
    age: '10-12',
  },
  {
    e: "I've been playing basketball for three years.",
    j: '私は3年間バスケットボールをしています。',
    s: '経験を話すとき',
    age: '10-12',
  },
  {
    e: "I'm interested in programming.",
    j: '私はプログラミングに興味があります。',
    s: '興味について話すとき',
    age: '10-12',
  },
  {
    e: 'I like creating videos for social media.',
    j: '私はSNS用の動画を作るのが好きです。',
    s: '趣味を言うとき',
    age: '10-12',
  },
  {
    e: 'Reading novels helps me relax.',
    j: '小説を読むことはリラックスになります。',
    s: '趣味の効果を話すとき',
    age: '10-12',
  },
  {
    e: "I'm a member of the art club.",
    j: '私は美術部のメンバーです。',
    s: 'クラブ活動について話すとき',
    age: '10-12',
  },
  {
    e: 'I enjoy learning new languages.',
    j: '私は新しい言語を学ぶことを楽しんでいます。',
    s: '趣味を言うとき',
    age: '10-12',
  },
  {
    e: 'I like hiking in the mountains.',
    j: '私は山でハイキングをするのが好きです。',
    s: 'アウトドア活動について話すとき',
    age: '10-12',
  },
  {
    e: 'I spend my free time playing chess.',
    j: '私は暇な時間をチェスに費やしています。',
    s: '趣味を言うとき',
    age: '10-12',
  },
  {
    e: "I've recently started learning calligraphy.",
    j: '最近書道を習い始めました。',
    s: '新しい趣味について話すとき',
    age: '10-12',
  },
  {
    e: 'My hobby helps me reduce stress.',
    j: '趣味はストレス解消に役立っています。',
    s: '趣味の効果を話すとき',
    age: '10-12',
  },
];

// ===== 新カテゴリ: food_eating =====
const foodEatingPhrases = [
  // 4-6歳
  { e: "I'm hungry.", j: 'お腹が空きました。', s: '空腹を伝えるとき', age: '4-6' },
  { e: "I'm thirsty.", j: '喉が渇きました。', s: '喉の渇きを伝えるとき', age: '4-6' },
  { e: 'This is yummy!', j: 'これはおいしい！', s: 'おいしさを伝えるとき', age: '4-6' },
  { e: 'I like pizza.', j: '私はピザが好きです。', s: '好きな食べ物を言うとき', age: '4-6' },
  {
    e: "I don't like vegetables.",
    j: '私は野菜が好きではありません。',
    s: '嫌いな食べ物を言うとき',
    age: '4-6',
  },
  {
    e: 'Can I have more?',
    j: 'もっともらえますか？',
    s: 'おかわりを頼むとき',
    age: '4-6',
    pattern: 'request',
  },
  { e: "I'm full.", j: 'お腹がいっぱいです。', s: '満腹を伝えるとき', age: '4-6' },
  { e: "Let's eat!", j: '食べましょう！', s: '食事を始めるとき', age: '4-6' },
  {
    e: 'I want juice, please.',
    j: 'ジュースをください。',
    s: '飲み物を頼むとき',
    age: '4-6',
    pattern: 'request',
  },
  { e: 'This is sweet.', j: 'これは甘いです。', s: '味を表現するとき', age: '4-6' },
  {
    e: 'I like ice cream.',
    j: '私はアイスクリームが好きです。',
    s: '好きな食べ物を言うとき',
    age: '4-6',
  },
  {
    e: 'Can I have a snack?',
    j: 'おやつを食べてもいい？',
    s: 'おやつを頼むとき',
    age: '4-6',
    pattern: 'request',
  },
  // 7-9歳
  {
    e: "What's your favorite food?",
    j: 'あなたの好きな食べ物は何ですか？',
    s: '好きな食べ物を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'My favorite food is sushi.',
    j: '私の好きな食べ物は寿司です。',
    s: '好きな食べ物を答えるとき',
    age: '7-9',
  },
  {
    e: 'I usually have rice for breakfast.',
    j: '私は普段朝食にご飯を食べます。',
    s: '朝食について話すとき',
    age: '7-9',
  },
  {
    e: 'This tastes really good.',
    j: 'これは本当においしいです。',
    s: 'おいしさを伝えるとき',
    age: '7-9',
  },
  {
    e: 'Would you like some more?',
    j: 'もう少しいかがですか？',
    s: 'おかわりを勧めるとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: "I'm allergic to eggs.",
    j: '私は卵アレルギーです。',
    s: 'アレルギーを伝えるとき',
    age: '7-9',
  },
  {
    e: 'Can I try a bite?',
    j: '一口食べてもいい？',
    s: '味見を頼むとき',
    age: '7-9',
    pattern: 'request',
  },
  {
    e: 'This is too spicy for me.',
    j: 'これは私には辛すぎます。',
    s: '味の感想を言うとき',
    age: '7-9',
  },
  {
    e: "Let's have lunch together.",
    j: '一緒にお昼を食べましょう。',
    s: '食事に誘うとき',
    age: '7-9',
  },
  {
    e: 'I like Japanese food.',
    j: '私は日本料理が好きです。',
    s: '好きな料理を言うとき',
    age: '7-9',
  },
  {
    e: 'Do you want to share?',
    j: '分け合いませんか？',
    s: '食べ物をシェアするとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'I brought my lunch today.',
    j: '今日はお弁当を持ってきました。',
    s: 'お弁当について話すとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: 'What kind of cuisine do you prefer?',
    j: 'どんな料理が好みですか？',
    s: '食の好みを聞くとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: "I'm trying to eat healthier.",
    j: '私はより健康的な食事を心がけています。',
    s: '食生活について話すとき',
    age: '10-12',
  },
  {
    e: 'Could you pass the salt, please?',
    j: '塩を取っていただけますか？',
    s: '調味料を頼むとき',
    age: '10-12',
    pattern: 'request',
  },
  { e: "I'm a vegetarian.", j: '私はベジタリアンです。', s: '食事制限を伝えるとき', age: '10-12' },
  {
    e: 'This dish is well-seasoned.',
    j: 'この料理は味付けがいいですね。',
    s: '料理を褒めるとき',
    age: '10-12',
  },
  {
    e: "I'd like to try local food.",
    j: '地元の食べ物を試してみたいです。',
    s: '食べ物への興味を伝えるとき',
    age: '10-12',
  },
  {
    e: 'I cook dinner sometimes.',
    j: '私は時々夕食を作ります。',
    s: '料理について話すとき',
    age: '10-12',
  },
  {
    e: 'Do you have any food allergies?',
    j: '食物アレルギーはありますか？',
    s: 'アレルギーを確認するとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: 'I appreciate home-cooked meals.',
    j: '私は手料理に感謝しています。',
    s: '感謝を伝えるとき',
    age: '10-12',
  },
  {
    e: 'The presentation of this dish is beautiful.',
    j: 'この料理の盛り付けは美しいです。',
    s: '料理を褒めるとき',
    age: '10-12',
  },
  {
    e: "I'm watching my calorie intake.",
    j: '私はカロリー摂取に気をつけています。',
    s: '食事管理について話すとき',
    age: '10-12',
  },
  {
    e: 'Let me treat you to lunch.',
    j: 'お昼をごちそうさせてください。',
    s: '食事をおごるとき',
    age: '10-12',
  },
];

// ===== 新カテゴリ: weather =====
const weatherPhrases = [
  // 4-6歳
  { e: "It's sunny today.", j: '今日は晴れです。', s: '天気を言うとき', age: '4-6' },
  { e: "It's rainy today.", j: '今日は雨です。', s: '天気を言うとき', age: '4-6' },
  { e: "It's cloudy.", j: '曇りです。', s: '天気を言うとき', age: '4-6' },
  { e: "It's hot today.", j: '今日は暑いです。', s: '気温を言うとき', age: '4-6' },
  { e: "It's cold today.", j: '今日は寒いです。', s: '気温を言うとき', age: '4-6' },
  { e: 'I like sunny days.', j: '私は晴れの日が好きです。', s: '好きな天気を言うとき', age: '4-6' },
  { e: 'I need an umbrella.', j: '傘が必要です。', s: '雨の日に言うとき', age: '4-6' },
  { e: "It's snowing!", j: '雪が降っている！', s: '雪を見て言うとき', age: '4-6' },
  { e: 'Look at the rainbow!', j: '虹を見て！', s: '虹を見つけたとき', age: '4-6' },
  { e: 'The wind is strong.', j: '風が強いです。', s: '風について言うとき', age: '4-6' },
  { e: "Let's play in the snow.", j: '雪で遊ぼう。', s: '雪遊びに誘うとき', age: '4-6' },
  { e: 'I like spring.', j: '私は春が好きです。', s: '好きな季節を言うとき', age: '4-6' },
  // 7-9歳
  {
    e: "How's the weather today?",
    j: '今日の天気はどうですか？',
    s: '天気を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'The weather forecast says it will rain.',
    j: '天気予報では雨になるそうです。',
    s: '天気予報について話すとき',
    age: '7-9',
  },
  {
    e: 'It might rain this afternoon.',
    j: '午後は雨が降るかもしれません。',
    s: '天気の予想を言うとき',
    age: '7-9',
  },
  {
    e: 'We should bring jackets.',
    j: 'ジャケットを持っていくべきです。',
    s: '服装について提案するとき',
    age: '7-9',
  },
  { e: 'The temperature is 25 degrees.', j: '気温は25度です。', s: '気温を言うとき', age: '7-9' },
  {
    e: "It's getting warmer.",
    j: 'だんだん暖かくなってきています。',
    s: '気候の変化を言うとき',
    age: '7-9',
  },
  {
    e: 'Summer is my favorite season.',
    j: '夏は私の一番好きな季節です。',
    s: '好きな季節を言うとき',
    age: '7-9',
  },
  {
    e: "It's too humid today.",
    j: '今日は蒸し暑すぎます。',
    s: '湿度について言うとき',
    age: '7-9',
  },
  {
    e: 'There was a thunderstorm last night.',
    j: '昨夜は雷雨でした。',
    s: '過去の天気を言うとき',
    age: '7-9',
  },
  {
    e: 'The cherry blossoms are blooming.',
    j: '桜が咲いています。',
    s: '季節の話題を言うとき',
    age: '7-9',
  },
  {
    e: 'I hope it clears up soon.',
    j: '早く晴れるといいな。',
    s: '天気への希望を言うとき',
    age: '7-9',
  },
  {
    e: 'Autumn leaves are beautiful.',
    j: '紅葉が美しいです。',
    s: '秋の景色について言うとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: "What's the weather going to be like this weekend?",
    j: '今週末の天気はどうなりそうですか？',
    s: '週末の天気を聞くとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: 'The climate here is quite mild.',
    j: 'ここの気候はかなり穏やかです。',
    s: '気候について説明するとき',
    age: '10-12',
  },
  {
    e: "We're expecting a typhoon next week.",
    j: '来週は台風が予想されています。',
    s: '天気予報について話すとき',
    age: '10-12',
  },
  {
    e: 'The rainy season has started.',
    j: '梅雨が始まりました。',
    s: '季節について話すとき',
    age: '10-12',
  },
  {
    e: 'Global warming is affecting weather patterns.',
    j: '地球温暖化が気象パターンに影響しています。',
    s: '環境問題について話すとき',
    age: '10-12',
  },
  {
    e: 'The visibility is poor due to fog.',
    j: '霧のため視界が悪いです。',
    s: '霧について説明するとき',
    age: '10-12',
  },
  {
    e: 'I prefer cool weather to hot weather.',
    j: '私は暑い天気より涼しい天気が好きです。',
    s: '好みを比較するとき',
    age: '10-12',
  },
  {
    e: 'The UV index is high today.',
    j: '今日は紫外線が強いです。',
    s: '紫外線について話すとき',
    age: '10-12',
  },
  {
    e: 'We had record-breaking heat this summer.',
    j: '今年の夏は記録的な暑さでした。',
    s: '異常気象について話すとき',
    age: '10-12',
  },
  {
    e: 'The weather can change quickly in the mountains.',
    j: '山では天気が急変することがあります。',
    s: '山の天気について話すとき',
    age: '10-12',
  },
  {
    e: 'I check the weather app every morning.',
    j: '私は毎朝天気アプリを確認します。',
    s: '習慣について話すとき',
    age: '10-12',
  },
  {
    e: 'Spring is coming soon.',
    j: 'もうすぐ春が来ます。',
    s: '季節の変わり目を話すとき',
    age: '10-12',
  },
];

// ===== 新カテゴリ: asking_for_help =====
const askingForHelpPhrases = [
  // 4-6歳
  {
    e: 'Help me, please.',
    j: '手伝ってください。',
    s: '助けを求めるとき',
    age: '4-6',
    pattern: 'request',
  },
  { e: "I don't understand.", j: 'わかりません。', s: '理解できないとき', age: '4-6' },
  {
    e: 'Can you help me?',
    j: '手伝ってもらえますか？',
    s: '助けを求めるとき',
    age: '4-6',
    pattern: 'request',
  },
  { e: "I can't do it.", j: 'できません。', s: 'できないことを伝えるとき', age: '4-6' },
  {
    e: 'Please say it again.',
    j: 'もう一度言ってください。',
    s: '繰り返しを頼むとき',
    age: '4-6',
    pattern: 'request',
  },
  { e: "I'm lost.", j: '迷子になりました。', s: '迷子のとき', age: '4-6' },
  { e: 'I need help.', j: '助けが必要です。', s: '助けを求めるとき', age: '4-6' },
  {
    e: 'Please wait.',
    j: '待ってください。',
    s: '待ってもらうとき',
    age: '4-6',
    pattern: 'request',
  },
  {
    e: 'What does this mean?',
    j: 'これはどういう意味ですか？',
    s: '意味を聞くとき',
    age: '4-6',
    pattern: 'question',
  },
  {
    e: 'Show me, please.',
    j: '見せてください。',
    s: '見せてもらうとき',
    age: '4-6',
    pattern: 'request',
  },
  { e: "I'm scared.", j: '怖いです。', s: '恐怖を伝えるとき', age: '4-6' },
  {
    e: 'Can you open this?',
    j: 'これを開けてもらえますか？',
    s: '助けを求めるとき',
    age: '4-6',
    pattern: 'request',
  },
  // 7-9歳
  {
    e: 'Could you explain that again?',
    j: 'もう一度説明してもらえますか？',
    s: '説明を求めるとき',
    age: '7-9',
    pattern: 'request',
  },
  {
    e: "I'm having trouble with this.",
    j: 'これに困っています。',
    s: '困っていることを伝えるとき',
    age: '7-9',
  },
  {
    e: 'Can you show me how to do this?',
    j: 'やり方を見せてもらえますか？',
    s: 'やり方を教えてもらうとき',
    age: '7-9',
    pattern: 'request',
  },
  {
    e: "I don't know the answer.",
    j: '答えがわかりません。',
    s: 'わからないことを伝えるとき',
    age: '7-9',
  },
  {
    e: 'Could you speak more slowly?',
    j: 'もっとゆっくり話してもらえますか？',
    s: 'ゆっくり話すよう頼むとき',
    age: '7-9',
    pattern: 'request',
  },
  {
    e: 'Where can I find help?',
    j: 'どこで助けを見つけられますか？',
    s: '助けを探すとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: "I'm confused about this part.",
    j: 'この部分がよくわかりません。',
    s: '混乱していることを伝えるとき',
    age: '7-9',
  },
  {
    e: 'Could you give me a hint?',
    j: 'ヒントをもらえますか？',
    s: 'ヒントを求めるとき',
    age: '7-9',
    pattern: 'request',
  },
  {
    e: 'What should I do next?',
    j: '次は何をすればいいですか？',
    s: '次のステップを聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'I need some more time.',
    j: 'もう少し時間が必要です。',
    s: '時間が必要なことを伝えるとき',
    age: '7-9',
  },
  {
    e: 'Can you check this for me?',
    j: 'これを確認してもらえますか？',
    s: '確認を頼むとき',
    age: '7-9',
    pattern: 'request',
  },
  {
    e: 'Is this correct?',
    j: 'これは正しいですか？',
    s: '正誤を確認するとき',
    age: '7-9',
    pattern: 'question',
  },
  // 10-12歳
  {
    e: 'I would appreciate your assistance.',
    j: 'お力添えいただければ幸いです。',
    s: '丁寧に助けを求めるとき',
    age: '10-12',
    pattern: 'request',
  },
  {
    e: 'Could you clarify what you mean?',
    j: 'どういう意味か明確にしていただけますか？',
    s: '明確化を求めるとき',
    age: '10-12',
    pattern: 'request',
  },
  {
    e: "I'm struggling to understand this concept.",
    j: 'この概念を理解するのに苦労しています。',
    s: '理解の困難を伝えるとき',
    age: '10-12',
  },
  {
    e: 'Would you mind repeating that?',
    j: 'もう一度おっしゃっていただけますか？',
    s: '繰り返しを丁寧に頼むとき',
    age: '10-12',
    pattern: 'request',
  },
  {
    e: 'Could you point me in the right direction?',
    j: '正しい方向を教えていただけますか？',
    s: 'ガイダンスを求めるとき',
    age: '10-12',
    pattern: 'request',
  },
  {
    e: 'I need guidance on this matter.',
    j: 'この件についてアドバイスが必要です。',
    s: 'アドバイスを求めるとき',
    age: '10-12',
  },
  {
    e: 'Could you walk me through the process?',
    j: '手順を一緒に確認していただけますか？',
    s: 'プロセスの説明を求めるとき',
    age: '10-12',
    pattern: 'request',
  },
  {
    e: "I'm not sure how to proceed.",
    j: 'どう進めたらいいかわかりません。',
    s: '不確かさを伝えるとき',
    age: '10-12',
  },
  {
    e: 'Is there anyone who can help me with this?',
    j: 'これを手伝ってくれる人はいますか？',
    s: '助けを探すとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: "I'd like to ask for your advice.",
    j: 'アドバイスをお願いしたいのですが。',
    s: 'アドバイスを求めるとき',
    age: '10-12',
  },
  {
    e: 'Could you give me some feedback?',
    j: 'フィードバックをいただけますか？',
    s: 'フィードバックを求めるとき',
    age: '10-12',
    pattern: 'request',
  },
  {
    e: "I don't want to bother you, but could you help?",
    j: 'お手数をおかけしますが、助けていただけますか？',
    s: '遠慮しながら助けを求めるとき',
    age: '10-12',
    pattern: 'request',
  },
];

// ===== 新カテゴリ: opinions_preferences =====
const opinionsPreferencesPhrases = [
  // 4-6歳
  { e: 'I like this.', j: '私はこれが好きです。', s: '好みを言うとき', age: '4-6' },
  { e: "I don't like this.", j: '私はこれが好きではありません。', s: '嫌いを言うとき', age: '4-6' },
  {
    e: 'This is my favorite.',
    j: 'これが私のお気に入りです。',
    s: '一番好きなものを言うとき',
    age: '4-6',
  },
  { e: 'I want this one.', j: '私はこれが欲しいです。', s: '欲しいものを言うとき', age: '4-6' },
  { e: 'This is fun!', j: 'これは楽しい！', s: '楽しさを伝えるとき', age: '4-6' },
  { e: 'This is boring.', j: 'これはつまらない。', s: 'つまらなさを伝えるとき', age: '4-6' },
  { e: 'I think so.', j: 'そう思います。', s: '同意するとき', age: '4-6' },
  { e: 'I like the blue one.', j: '青いのが好きです。', s: '好みを選ぶとき', age: '4-6' },
  { e: "I'm good at this.", j: '私はこれが得意です。', s: '得意なことを言うとき', age: '4-6' },
  { e: 'This is cool!', j: 'これはかっこいい！', s: 'かっこよさを伝えるとき', age: '4-6' },
  { e: 'I like both.', j: '両方とも好きです。', s: '両方好きなとき', age: '4-6' },
  { e: 'This is pretty.', j: 'これはきれいです。', s: '美しさを伝えるとき', age: '4-6' },
  // 7-9歳
  {
    e: 'What do you think?',
    j: 'どう思いますか？',
    s: '意見を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'I prefer cats to dogs.',
    j: '私は犬より猫の方が好きです。',
    s: '比較して好みを言うとき',
    age: '7-9',
  },
  {
    e: 'In my opinion, this is better.',
    j: '私の意見では、こちらの方がいいです。',
    s: '意見を言うとき',
    age: '7-9',
  },
  { e: 'I agree with you.', j: 'あなたに同意します。', s: '同意するとき', age: '7-9' },
  { e: 'I disagree.', j: '私は反対です。', s: '反対意見を言うとき', age: '7-9' },
  {
    e: 'I think this movie is interesting.',
    j: 'この映画は面白いと思います。',
    s: '感想を言うとき',
    age: '7-9',
  },
  {
    e: 'Which do you like better?',
    j: 'どちらの方が好きですか？',
    s: '好みを聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: "I don't really like sports.",
    j: '私はスポーツがあまり好きではありません。',
    s: '好みでないことを言うとき',
    age: '7-9',
  },
  {
    e: 'That sounds like a good idea.',
    j: 'それはいいアイデアですね。',
    s: 'アイデアに賛成するとき',
    age: '7-9',
  },
  {
    e: "I'm interested in science.",
    j: '私は科学に興味があります。',
    s: '興味を言うとき',
    age: '7-9',
  },
  {
    e: 'I find this very exciting.',
    j: 'これはとてもワクワクします。',
    s: '興奮を伝えるとき',
    age: '7-9',
  },
  { e: "I'd rather stay home.", j: '私は家にいる方がいいです。', s: '好みを言うとき', age: '7-9' },
  // 10-12歳
  {
    e: "What's your opinion on this?",
    j: 'これについてどうお考えですか？',
    s: '意見を求めるとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: 'I strongly believe that...',
    j: '私は〜と強く信じています。',
    s: '強い意見を言うとき',
    age: '10-12',
  },
  { e: 'From my perspective...', j: '私の視点から言うと...', s: '視点を述べるとき', age: '10-12' },
  {
    e: 'I see your point, but...',
    j: 'おっしゃることはわかりますが...',
    s: '反論するとき',
    age: '10-12',
  },
  {
    e: "I'm in favor of this plan.",
    j: '私はこの計画に賛成です。',
    s: '賛成意見を言うとき',
    age: '10-12',
  },
  {
    e: 'I have mixed feelings about this.',
    j: 'これについては複雑な気持ちです。',
    s: '複雑な感情を伝えるとき',
    age: '10-12',
  },
  {
    e: "That's an interesting point of view.",
    j: 'それは興味深い見方ですね。',
    s: '相手の意見を認めるとき',
    age: '10-12',
  },
  {
    e: 'I would choose quality over quantity.',
    j: '私は量より質を選びます。',
    s: '選択の理由を言うとき',
    age: '10-12',
  },
  {
    e: 'I personally think this is important.',
    j: '私個人としては、これは重要だと思います。',
    s: '個人的意見を言うとき',
    age: '10-12',
  },
  {
    e: 'I appreciate different opinions.',
    j: '私はさまざまな意見を尊重します。',
    s: '寛容さを示すとき',
    age: '10-12',
  },
  {
    e: 'Could you share your thoughts?',
    j: 'あなたの考えを聞かせてもらえますか？',
    s: '意見を求めるとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: 'Let me think about it.',
    j: '考えさせてください。',
    s: '考える時間を求めるとき',
    age: '10-12',
  },
];

// ===== 新カテゴリ: making_plans =====
const makingPlansPhrases = [
  // 4-6歳
  { e: "Let's play together.", j: '一緒に遊ぼう。', s: '遊びに誘うとき', age: '4-6' },
  { e: "Let's go to the park.", j: '公園に行こう。', s: '公園に誘うとき', age: '4-6' },
  { e: 'Do you want to come?', j: '来たい？', s: '誘うとき', age: '4-6', pattern: 'question' },
  {
    e: 'What do you want to do?',
    j: '何がしたい？',
    s: 'やりたいことを聞くとき',
    age: '4-6',
    pattern: 'question',
  },
  { e: 'I want to go swimming.', j: '私は泳ぎに行きたい。', s: '希望を言うとき', age: '4-6' },
  { e: "Let's go!", j: '行こう！', s: '出発するとき', age: '4-6' },
  {
    e: 'Are you ready?',
    j: '準備はいい？',
    s: '準備を確認するとき',
    age: '4-6',
    pattern: 'question',
  },
  { e: "I'll wait for you.", j: '待ってるね。', s: '待つことを伝えるとき', age: '4-6' },
  { e: 'See you tomorrow.', j: 'また明日ね。', s: '別れ際に言うとき', age: '4-6' },
  { e: "Let's meet at school.", j: '学校で会おう。', s: '待ち合わせを決めるとき', age: '4-6' },
  {
    e: 'Can I come too?',
    j: '私も行っていい？',
    s: '参加を頼むとき',
    age: '4-6',
    pattern: 'request',
  },
  { e: "Let's do it again.", j: 'また一緒にやろう。', s: '次の約束をするとき', age: '4-6' },
  // 7-9歳
  {
    e: 'Are you free this weekend?',
    j: '今週末は空いていますか？',
    s: '予定を確認するとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: "Let's make plans for Saturday.",
    j: '土曜日の計画を立てよう。',
    s: '計画を提案するとき',
    age: '7-9',
  },
  {
    e: 'What time should we meet?',
    j: '何時に会いましょうか？',
    s: '時間を決めるとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'Where should we go?',
    j: 'どこに行きましょうか？',
    s: '場所を決めるとき',
    age: '7-9',
    pattern: 'question',
  },
  {
    e: 'I have a great idea.',
    j: 'いいアイデアがあります。',
    s: 'アイデアを提案するとき',
    age: '7-9',
  },
  {
    e: 'How about going to the movies?',
    j: '映画に行くのはどう？',
    s: '映画に誘うとき',
    age: '7-9',
    pattern: 'question',
  },
  { e: 'That sounds fun!', j: 'それは楽しそう！', s: '提案に賛成するとき', age: '7-9' },
  { e: "Sorry, I can't make it.", j: 'ごめん、行けないんだ。', s: '断るとき', age: '7-9' },
  {
    e: 'Can we change the day?',
    j: '日にちを変えてもいい？',
    s: '日程変更を頼むとき',
    age: '7-9',
    pattern: 'request',
  },
  {
    e: "I'll check my schedule.",
    j: '予定を確認するね。',
    s: '予定を確認することを伝えるとき',
    age: '7-9',
  },
  {
    e: "Let's invite more friends.",
    j: 'もっと友達を誘おう。',
    s: '他の人を誘うことを提案するとき',
    age: '7-9',
  },
  {
    e: "I'm looking forward to it.",
    j: '楽しみにしています。',
    s: '楽しみを伝えるとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: 'When would be convenient for you?',
    j: 'いつがご都合よろしいですか？',
    s: '都合を聞くとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: "Let's schedule a meeting.",
    j: 'ミーティングの予定を立てましょう。',
    s: '会議を設定するとき',
    age: '10-12',
  },
  {
    e: "I'd like to propose a plan.",
    j: '計画を提案したいのですが。',
    s: '計画を提案するとき',
    age: '10-12',
  },
  {
    e: 'We should decide on a date.',
    j: '日付を決めるべきですね。',
    s: '日程決定を促すとき',
    age: '10-12',
  },
  {
    e: 'Let me check my calendar.',
    j: 'カレンダーを確認させてください。',
    s: '予定を確認するとき',
    age: '10-12',
  },
  {
    e: 'How does next Tuesday work for you?',
    j: '来週の火曜日はいかがですか？',
    s: '日程を提案するとき',
    age: '10-12',
    pattern: 'question',
  },
  {
    e: "I'll have to reschedule.",
    j: '予定を変更しなければなりません。',
    s: '予定変更を伝えるとき',
    age: '10-12',
  },
  {
    e: 'Could we meet earlier?',
    j: 'もっと早く会えますか？',
    s: '時間変更を頼むとき',
    age: '10-12',
    pattern: 'request',
  },
  {
    e: "I'll confirm the details later.",
    j: '詳細は後で確認します。',
    s: '詳細確認を伝えるとき',
    age: '10-12',
  },
  { e: "Let's make it official.", j: '正式に決めましょう。', s: '決定を促すとき', age: '10-12' },
  {
    e: 'I need to coordinate with others.',
    j: '他の人と調整する必要があります。',
    s: '調整が必要なことを伝えるとき',
    age: '10-12',
  },
  {
    e: 'The plan has been finalized.',
    j: '計画が確定しました。',
    s: '決定を伝えるとき',
    age: '10-12',
  },
];

// ===== 新カテゴリ: apologizing_thanking =====
const apologizingThankingPhrases = [
  // 4-6歳
  { e: 'Thank you.', j: 'ありがとう。', s: '感謝するとき', age: '4-6' },
  { e: 'Thank you very much.', j: 'どうもありがとう。', s: 'より感謝するとき', age: '4-6' },
  { e: "I'm sorry.", j: 'ごめんなさい。', s: '謝るとき', age: '4-6' },
  { e: 'Sorry!', j: 'ごめん！', s: '軽く謝るとき', age: '4-6' },
  { e: "That's okay.", j: '大丈夫だよ。', s: '許すとき', age: '4-6' },
  { e: "You're welcome.", j: 'どういたしまして。', s: '感謝に応えるとき', age: '4-6' },
  {
    e: 'Thanks for helping me.',
    j: '手伝ってくれてありがとう。',
    s: '手伝いに感謝するとき',
    age: '4-6',
  },
  {
    e: "I didn't mean to.",
    j: 'わざとじゃないの。',
    s: '意図せずしたことを説明するとき',
    age: '4-6',
  },
  { e: 'It was my fault.', j: '私が悪かったの。', s: '自分の過ちを認めるとき', age: '4-6' },
  { e: 'No problem!', j: '問題ないよ！', s: '気にしないことを伝えるとき', age: '4-6' },
  {
    e: 'Thanks for the gift.',
    j: 'プレゼントありがとう。',
    s: 'プレゼントに感謝するとき',
    age: '4-6',
  },
  { e: 'I forgive you.', j: '許すよ。', s: '許すとき', age: '4-6' },
  // 7-9歳
  { e: 'I really appreciate it.', j: '本当に感謝しています。', s: '深く感謝するとき', age: '7-9' },
  { e: 'I apologize for being late.', j: '遅れてすみません。', s: '遅刻を謝るとき', age: '7-9' },
  {
    e: 'Thanks for your help.',
    j: '助けてくれてありがとう。',
    s: '手助けに感謝するとき',
    age: '7-9',
  },
  {
    e: "I'm sorry for the trouble.",
    j: 'ご迷惑をおかけしてすみません。',
    s: '迷惑を謝るとき',
    age: '7-9',
  },
  { e: 'That was very kind of you.', j: 'とても親切ですね。', s: '親切に感謝するとき', age: '7-9' },
  { e: "I won't do it again.", j: 'もうしません。', s: '反省を伝えるとき', age: '7-9' },
  {
    e: 'Please forgive me.',
    j: '許してください。',
    s: '許しを求めるとき',
    age: '7-9',
    pattern: 'request',
  },
  { e: "Don't worry about it.", j: '気にしないで。', s: '気にしないよう伝えるとき', age: '7-9' },
  { e: "It's not a big deal.", j: '大したことないよ。', s: '問題ないことを伝えるとき', age: '7-9' },
  {
    e: 'Thank you for understanding.',
    j: '理解してくれてありがとう。',
    s: '理解に感謝するとき',
    age: '7-9',
  },
  { e: 'I owe you one.', j: '借りができたね。', s: '恩義を伝えるとき', age: '7-9' },
  {
    e: 'I should have been more careful.',
    j: 'もっと気をつけるべきでした。',
    s: '反省を述べるとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: 'I sincerely apologize.',
    j: '心よりお詫び申し上げます。',
    s: '真剣に謝るとき',
    age: '10-12',
  },
  {
    e: "I can't thank you enough.",
    j: '感謝してもしきれません。',
    s: '深い感謝を伝えるとき',
    age: '10-12',
  },
  {
    e: 'Please accept my apology.',
    j: 'お詫びを受け入れてください。',
    s: '謝罪を受け入れてもらうとき',
    age: '10-12',
    pattern: 'request',
  },
  {
    e: "I'm grateful for your support.",
    j: 'ご支援に感謝しています。',
    s: '支援に感謝するとき',
    age: '10-12',
  },
  {
    e: 'I take full responsibility.',
    j: '全責任を負います。',
    s: '責任を認めるとき',
    age: '10-12',
  },
  {
    e: 'Your kindness means a lot to me.',
    j: 'あなたの親切は私にとって大切です。',
    s: '親切に深く感謝するとき',
    age: '10-12',
  },
  {
    e: 'I apologize for any inconvenience.',
    j: 'ご不便をおかけして申し訳ありません。',
    s: '不便を謝るとき',
    age: '10-12',
  },
  {
    e: "I'm deeply sorry for my mistake.",
    j: '自分の間違いを深くお詫びします。',
    s: '間違いを謝るとき',
    age: '10-12',
  },
  {
    e: 'Thank you for your patience.',
    j: 'ご辛抱いただきありがとうございます。',
    s: '忍耐に感謝するとき',
    age: '10-12',
  },
  {
    e: 'I hope you can forgive me.',
    j: '許していただけると幸いです。',
    s: '許しを願うとき',
    age: '10-12',
  },
  {
    e: "I'm indebted to you.",
    j: 'あなたには恩義があります。',
    s: '恩義を伝えるとき',
    age: '10-12',
  },
  {
    e: 'Words cannot express my gratitude.',
    j: '言葉では感謝を表せません。',
    s: '深い感謝を伝えるとき',
    age: '10-12',
  },
];

// ===== 新カテゴリ: health_body =====
const healthBodyPhrases = [
  // 4-6歳
  { e: 'I feel sick.', j: '気分が悪いです。', s: '具合が悪いとき', age: '4-6' },
  { e: 'My tummy hurts.', j: 'お腹が痛いです。', s: 'お腹が痛いとき', age: '4-6' },
  { e: 'I have a headache.', j: '頭が痛いです。', s: '頭が痛いとき', age: '4-6' },
  { e: 'I feel better now.', j: 'もう良くなりました。', s: '回復を伝えるとき', age: '4-6' },
  { e: "I'm tired.", j: '疲れました。', s: '疲れを伝えるとき', age: '4-6' },
  { e: 'I want to rest.', j: '休みたいです。', s: '休息を求めるとき', age: '4-6' },
  { e: 'I need to sleep.', j: '寝なきゃ。', s: '睡眠が必要なとき', age: '4-6' },
  { e: 'I feel fine.', j: '元気です。', s: '元気を伝えるとき', age: '4-6' },
  { e: 'My leg hurts.', j: '足が痛いです。', s: '足が痛いとき', age: '4-6' },
  { e: 'I have a cold.', j: '風邪をひいています。', s: '風邪のとき', age: '4-6' },
  { e: "I'm sleepy.", j: '眠いです。', s: '眠いとき', age: '4-6' },
  {
    e: 'I need to go to the bathroom.',
    j: 'トイレに行きたいです。',
    s: 'トイレに行きたいとき',
    age: '4-6',
  },
  // 7-9歳
  {
    e: 'How are you feeling?',
    j: '体調はどうですか？',
    s: '体調を聞くとき',
    age: '7-9',
    pattern: 'question',
  },
  { e: 'I caught a cold.', j: '風邪をひきました。', s: '風邪を伝えるとき', age: '7-9' },
  {
    e: 'I need to see a doctor.',
    j: '医者に診てもらう必要があります。',
    s: '病院に行く必要があるとき',
    age: '7-9',
  },
  { e: 'I have a fever.', j: '熱があります。', s: '発熱を伝えるとき', age: '7-9' },
  { e: 'My throat is sore.', j: '喉が痛いです。', s: '喉の痛みを伝えるとき', age: '7-9' },
  { e: 'I should rest more.', j: 'もっと休むべきです。', s: '休息の必要を言うとき', age: '7-9' },
  { e: "I'm getting better.", j: '良くなってきています。', s: '回復を伝えるとき', age: '7-9' },
  { e: "I don't have any energy.", j: '元気がありません。', s: '疲労を伝えるとき', age: '7-9' },
  {
    e: 'I need to take medicine.',
    j: '薬を飲む必要があります。',
    s: '服薬について言うとき',
    age: '7-9',
  },
  { e: "I'm allergic to pollen.", j: '私は花粉症です。', s: 'アレルギーを伝えるとき', age: '7-9' },
  {
    e: 'I hurt my arm playing sports.',
    j: 'スポーツで腕を怪我しました。',
    s: '怪我を説明するとき',
    age: '7-9',
  },
  {
    e: 'I need to drink more water.',
    j: 'もっと水を飲む必要があります。',
    s: '水分補給について言うとき',
    age: '7-9',
  },
  // 10-12歳
  {
    e: "I've been feeling under the weather.",
    j: 'ここのところ体調が優れません。',
    s: '体調不良を伝えるとき',
    age: '10-12',
  },
  {
    e: "I think I'm coming down with something.",
    j: '何かにかかりそうな気がします。',
    s: '病気の兆候を伝えるとき',
    age: '10-12',
  },
  {
    e: 'I should take better care of my health.',
    j: 'もっと健康に気をつけるべきです。',
    s: '健康意識について話すとき',
    age: '10-12',
  },
  {
    e: 'I try to exercise regularly.',
    j: '定期的に運動するようにしています。',
    s: '運動習慣について話すとき',
    age: '10-12',
  },
  {
    e: 'Getting enough sleep is important.',
    j: '十分な睡眠を取ることは大切です。',
    s: '睡眠の重要性について話すとき',
    age: '10-12',
  },
  {
    e: "I've been stressed lately.",
    j: '最近ストレスを感じています。',
    s: 'ストレスについて話すとき',
    age: '10-12',
  },
  {
    e: 'I need to go for a checkup.',
    j: '健康診断に行く必要があります。',
    s: '健康診断について話すとき',
    age: '10-12',
  },
  {
    e: "I'm recovering from the flu.",
    j: 'インフルエンザから回復中です。',
    s: '回復中であることを伝えるとき',
    age: '10-12',
  },
  {
    e: "It's important to stay hydrated.",
    j: '水分補給を続けることが大切です。',
    s: '健康アドバイスを言うとき',
    age: '10-12',
  },
  {
    e: "I've been working out to stay fit.",
    j: '健康を維持するためにトレーニングしています。',
    s: '運動習慣について話すとき',
    age: '10-12',
  },
  {
    e: 'Mental health is just as important as physical health.',
    j: '心の健康は体の健康と同じくらい大切です。',
    s: '健康観について話すとき',
    age: '10-12',
  },
  {
    e: "I'm on a balanced diet.",
    j: '私はバランスの取れた食事をしています。',
    s: '食生活について話すとき',
    age: '10-12',
  },
];

// カテゴリ定義
const newCategories = [
  { name: 'family', phrases: familyPhrases },
  { name: 'hobbies', phrases: hobbiesPhrases },
  { name: 'food_eating', phrases: foodEatingPhrases },
  { name: 'weather', phrases: weatherPhrases },
  { name: 'asking_for_help', phrases: askingForHelpPhrases },
  { name: 'opinions_preferences', phrases: opinionsPreferencesPhrases },
  { name: 'making_plans', phrases: makingPlansPhrases },
  { name: 'apologizing_thanking', phrases: apologizingThankingPhrases },
  { name: 'health_body', phrases: healthBodyPhrases },
];

// JSONファイル生成
function generateCategoryFile(category, phraseData) {
  const items = phraseData.map((p) =>
    createPhrase(category, p.e, p.j, p.s, p.age, { pattern: p.pattern })
  );

  const collection = {
    metadata: {
      type: 'phrase',
      category,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalCount: items.length,
      schemaVersion: '1.0.0',
    },
    items,
  };

  const filePath = path.join(PHRASES_DIR, `${category}.json`);
  fs.writeFileSync(filePath, JSON.stringify(collection, null, 2));
  console.log(`✅ Generated ${category}.json (${items.length} phrases)`);

  return { name: category, count: items.length };
}

// マニフェスト更新
function updateManifest(newCategoryStats) {
  const manifestPath = path.join(PHRASES_DIR, '_manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // 新カテゴリを追加
  for (const stat of newCategoryStats) {
    const exists = manifest.files.find((f) => f.name === stat.name);
    if (!exists) {
      manifest.files.push({
        name: stat.name,
        path: `./${stat.name}.json`,
        itemCount: stat.count,
        ageGroups: ['4-6', '7-9', '10-12'],
      });
    } else {
      exists.itemCount = stat.count;
    }
  }

  // 合計更新
  manifest.totalItems = manifest.files.reduce((sum, f) => sum + f.itemCount, 0);
  manifest.lastUpdated = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Updated manifest: ${manifest.totalItems} total phrases`);
}

// メイン処理
function main() {
  console.log('🚀 Expanding phrase data...\n');

  const stats = [];

  for (const cat of newCategories) {
    const stat = generateCategoryFile(cat.name, cat.phrases);
    stats.push(stat);
  }

  updateManifest(stats);

  const newTotal = stats.reduce((sum, s) => sum + s.count, 0);
  console.log(`\n✨ Added ${newTotal} new phrases in ${stats.length} categories`);
}

main();
